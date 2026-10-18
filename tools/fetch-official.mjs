#!/usr/bin/env node
/**
 * 读《火影忍者》手游**官方公告原文**（这是本项目最重要的数据源之一）
 *
 * 背景（踩过的坑）：
 *   `hyrz.qq.com/web202003/newsDetails.html?aid=<id>` 打开后源码里只有 `{{detail.sTitle}}` 这类
 *   占位符 —— 因为它是 Vue 模板，正文由浏览器端从另一个接口取。所以直接抓 HTML 会得到 0 条有效内容。
 *
 *   真正的中转接口是（用浏览器 DevTools 抓出来的）：
 *     详情：//apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=25&p1=1&source=web_ingame&id=<aid>
 *     列表：//apps.game.qq.com/wmp/v3.1/?p0=25&p1=searchNewsKeywordsList&page=1&pagesize=10
 *             &order=sIdxTime&r0=cors&r1=NewsObj&type=iTag&id=<tagId>&source=web_ingame
 *
 *   本工具把这件事封成两条命令，避免以后再「以为官方页面读不了」。
 *
 * 用法：
 *   node tools/fetch-official.mjs --aid 18853074
 *   node tools/fetch-official.mjs --aid 18853074 --json
 *   node tools/fetch-official.mjs --list --tag 18807 --page 1
 *   node tools/fetch-official.mjs --list --tag 18807 --page 1 --json
 *   node tools/fetch-official.mjs --search 战力 --pages 3
 *   node tools/fetch-official.mjs --tags          # 列出可用栏目 tagId
 *
 * 只读、无依赖、单文件。注意：官方是 GBK 站点，但**接口返回的是 UTF-8 JSON**，直接用即可。
 */

const API_DETAIL = (aid) =>
  `https://apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=25&p1=1&source=web_ingame&id=${encodeURIComponent(aid)}`
const API_LIST = (tagId, page, pageSize) =>
  `https://apps.game.qq.com/wmp/v3.1/?p0=25&p1=searchNewsKeywordsList&page=${page}&pagesize=${pageSize}` +
  `&order=sIdxTime&r0=cors&r1=NewsObj&type=iTag&id=${encodeURIComponent(tagId)}&source=web_ingame`

/** 栏目 tagId（从 newsList.html 的 tabList 里读出来的） */
const TAGS = {
  18807: '公告',
  18812: '新闻',
  18808: '攻略',
  18813: '活动',
  18806: '视频',
  138135: '赛事中心',
}

function stripHtml(html) {
  if (!html) return ''
  let s = String(html)
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
  s = s.replace(/<[^>]+>/g, '')
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&times;/g, '×')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
  return s
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '')
    .join('\n')
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      // 接口会看 Referer；缺了容易拿到空
      Referer: 'https://hyrz.qq.com/',
      'User-Agent': 'Mozilla/5.0 (compatible; naruto-workbench/1.0)',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('接口没有返回 JSON（可能被风控或改版）：' + text.slice(0, 160))
  }
}

function parseArgs(argv) {
  const o = { pages: 1, pageSize: 10, page: 1 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--aid') o.aid = argv[++i]
    else if (a === '--tag') o.tag = argv[++i]
    else if (a === '--page') o.page = Number(argv[++i])
    else if (a === '--pages') o.pages = Number(argv[++i])
    else if (a === '--pageSize') o.pageSize = Number(argv[++i])
    else if (a === '--search') o.search = argv[++i]
    else if (a === '--json') o.json = true
    else if (a === '--list') o.list = true
    else if (a === '--tags') o.tags = true
    else if (a === '--help' || a === '-h') o.help = true
    else if (a.startsWith('--aid=')) o.aid = a.slice(6)
    else if (a.startsWith('--tag=')) o.tag = a.slice(6)
    else if (a.startsWith('--search=')) o.search = a.slice(9)
  }
  return o
}

const HELP = `读《火影忍者》手游官方公告原文

  node tools/fetch-official.mjs --aid <公告id>
      读单篇公告（正文原样输出）。公告 id 就是网址里的 aid= 后面的数字。

  node tools/fetch-official.mjs --list --tag 18807 [--page 1] [--pageSize 10]
      列出某栏目的公告（tagId: ${Object.entries(TAGS).map(([k, v]) => k + '=' + v).join(', ')}）

  node tools/fetch-official.mjs --search <关键词> [--pages 3]
      在「公告」栏目里按关键词过滤标题（逐页拉取后在本地过滤）

  node tools/fetch-official.mjs --tags
      打印栏目 tagId 映射

  追加 --json 输出机器可读结构。

为什么要这个工具：官方详情页是 Vue 模板，直接抓 HTML 只有 {{detail.sTitle}} 占位符；
真正的正文在 apps.game.qq.com 的 searchNews.php 接口里。详见 docs/DATA-SOURCES.md。
`

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP)
    return 0
  }
  if (args.tags) {
    if (args.json) console.log(JSON.stringify(TAGS, null, 2))
    else for (const [id, name] of Object.entries(TAGS)) console.log(`${id}  ${name}`)
    return 0
  }

  if (args.aid) {
    const j = await fetchJson(API_DETAIL(args.aid))
    const m = j && j.msg
    if (!m || !m.sTitle) {
      console.error('接口没有返回 msg.sTitle，可能是 id 不存在或被风控。原始返回片段：')
      console.error(JSON.stringify(j).slice(0, 400))
      return 1
    }
    const out = {
      aid: String(args.aid),
      title: stripHtml(m.sTitle),
      author: stripHtml(m.sAuthor || ''),
      createdAt: m.sCreated || m.sIdxTime || '',
      url: `https://hyrz.qq.com/web202003/newsDetails.html?aid=${args.aid}&pageType=0`,
      text: stripHtml(m.sContent),
    }
    if (args.json) {
      console.log(JSON.stringify(out, null, 2))
    } else {
      console.log('标题: ' + out.title)
      console.log('作者: ' + out.author + '    时间: ' + out.createdAt)
      console.log('链接: ' + out.url)
      console.log('─'.repeat(60))
      console.log(out.text)
    }
    return 0
  }

  if (args.list || args.search) {
    const tag = args.tag || '18807'
    const pages = args.search ? Math.max(1, args.pages) : 1
    const collected = []
    for (let p = args.page; p < args.page + pages; p++) {
      const j = await fetchJson(API_LIST(tag, p, args.pageSize))
      const arr = (j && j.msg && (j.msg.result || j.msg.NewsObj || j.msg.list)) || (Array.isArray(j) ? j : [])
      const list = Array.isArray(arr) ? arr : []
      if (!list.length) break
      for (const it of list) {
        collected.push({
          aid: String(it.iNewsId || it.id || it.aid || ''),
          title: stripHtml(it.sTitle || it.title || ''),
          time: it.sIdxTime || it.sCreated || it.dtTime || '',
          tag: it.sTagName || '',
        })
      }
      if (list.length < args.pageSize) break
    }
    let rows = collected.filter((r) => r.title)
    if (args.search) rows = rows.filter((r) => r.title.includes(args.search))
    if (args.json) {
      console.log(JSON.stringify({ tag, count: rows.length, items: rows }, null, 2))
    } else {
      console.log(`栏目 ${tag}（${TAGS[tag] || '未知'}），共 ${rows.length} 条：`)
      for (const r of rows) {
        console.log(`  ${r.aid.padEnd(10)} ${r.time}  ${r.title}`)
      }
      if (!rows.length) console.log('  （无结果；可换 tag 或用 --pages 3 多翻几页）')
    }
    return 0
  }

  console.log(HELP)
  return 0
}

main().then(
  (code) => {
    process.exitCode = code
  },
  (e) => {
    console.error('失败：' + (e && e.message))
    process.exitCode = 2
  },
)
