#!/usr/bin/env node
/**
 * 官方公告批量检索（给「找某某系统上线公告」这类任务用）
 *
 * 两个数据面：
 *   A. 新公告（约 2021 之后）：JSON 接口，正文可直接读
 *      node tools/fetch-official.mjs --aid <id>
 *   B. 老公告（2016~2021）：/webplat/ 老页面，GBK 编码，解码后同样可读
 *      https://hyrz.qq.com/webplat/info/news_version3/11946/...
 *
 * 本工具只做 A 的全量抓取 + 关键词过滤（B 的入口由 --webplat-list 给出提示）。
 *
 * 用法：
 *   node tools/search-official.mjs --tags all --kw 忍具,属性攻击,勾玉,通灵,饰品
 *   node tools/search-official.mjs --tags 18807 --kw 战力 --pages 40
 *   node tools/search-official.mjs --tags all --kw 系数 --json > out.json
 */

const TAGS = { 18807: '公告', 18812: '新闻', 18808: '攻略', 18813: '活动' }
const API = (tag, page, pageSize) =>
  `https://apps.game.qq.com/wmp/v3.1/?p0=25&p1=searchNewsKeywordsList&page=${page}&pagesize=${pageSize}` +
  `&order=sIdxTime&r0=cors&r1=NewsObj&type=iTag&id=${tag}&source=web_ingame`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function strip(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&middot;/g, '·')
    .replace(/&times;/g, '×')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function fetchJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { Referer: 'https://hyrz.qq.com/', 'User-Agent': 'Mozilla/5.0 (naruto-workbench)' },
      })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return JSON.parse(await res.text())
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(400 * (i + 1))
    }
  }
}

function parseArgs(argv) {
  const o = { pageSize: 30, kw: [], tags: ['all'], maxPages: 40 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--tags') {
      const v = argv[++i]
      o.tags = v === 'all' ? Object.keys(TAGS) : v.split(',')
    } else if (a === '--kw') o.kw = argv[++i].split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--pages') o.maxPages = Number(argv[++i])
    else if (a === '--pageSize') o.pageSize = Number(argv[++i])
    else if (a === '--json') o.json = true
    else if (a === '--help' || a === '-h') o.help = true
  }
  return o
}

async function crawlTag(tag, opts, onItem) {
  let emptyStreak = 0
  let got = 0
  for (let page = 1; page <= opts.maxPages; page++) {
    let j
    try {
      j = await fetchJson(API(tag, page, opts.pageSize))
    } catch (e) {
      if (!opts.json) console.error(`  [${TAGS[tag] || tag}] page ${page} 失败：${e.message}`)
      break
    }
    const list = (j && j.msg && (j.msg.result || j.msg.NewsObj)) || []
    if (!list.length) {
      if (++emptyStreak >= 1) break
      continue
    }
    emptyStreak = 0
    got += list.length
    for (const it of list) {
      onItem({
        tag,
        tagName: TAGS[tag] || String(tag),
        aid: String(it.iNewsId || it.id || ''),
        title: strip(it.sTitle),
        time: it.sCreated || it.sIdxTime || '',
        sub: strip(it.sDesc || ''),
      })
    }
    if (!opts.json) process.stderr.write(`\r  抓取 ${TAGS[tag] || tag} 第 ${page} 页（累计 ${got} 条）…`)
    await sleep(120)
  }
  if (!opts.json) process.stderr.write('\n')
  return got
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help) {
    console.log(`官方公告批量检索

  --tags all|18807,18808      要抓的栏目（默认 all）
  --kw  忍具,属性攻击,勾玉     标题关键词（逗号分隔；留空=不过滤）
  --pages 40                  每栏目最多翻多少页（默认 40）
  --pageSize 30               每页条数（接口上限 30）
  --json                      输出 JSON

栏目 tagId：${Object.entries(TAGS).map(([k, v]) => k + '=' + v).join('  ')}`)
    return 0
  }

  const all = []
  const counts = {}
  for (const tag of opts.tags) {
    counts[tag] = await crawlTag(tag, opts, (x) => all.push(x))
  }

  let rows = all
  if (opts.kw.length) {
    rows = all.filter((r) => opts.kw.some((k) => r.title.includes(k) || r.sub.includes(k)))
  }
  rows.sort((a, b) => String(b.time).localeCompare(String(a.time)))

  if (opts.json) {
    console.log(JSON.stringify({ counts, keywords: opts.kw, total: all.length, matched: rows.length, items: rows }, null, 2))
    return 0
  }

  console.log('抓取统计：' + Object.entries(counts).map(([t, n]) => `${TAGS[t] || t}=${n}`).join('  ') + `  合计 ${all.length} 条`)
  console.log(`关键词 [${opts.kw.join(',') || '无'}] 命中 ${rows.length} 条：\n`)
  for (const r of rows) {
    console.log(`${r.time.slice(0, 10)}  ${r.aid.padEnd(9)} [${r.tagName}] ${r.title}`)
  }
  if (!rows.length) {
    console.log('（无命中。注意：JSON 接口只回溯到约 2021 年；2016~2021 的老公告在 /webplat/ 老页面，需 GBK 解码）')
  }
  return 0
}

main().then(
  (c) => (process.exitCode = c),
  (e) => {
    console.error('失败：' + (e && e.message))
    process.exitCode = 2
  },
)
