#!/usr/bin/env node
/**
 * 真浏览器端到端测试（Chrome / Edge / Chromium 任一即可，找不到就跳过）
 *
 * 为什么必须在真浏览器里测：
 *  单文件 HTML 的全部价值就是「双击就能用」。jsdom 之类无法验证：
 *   file:// 下的脚本执行、localStorage 权限、`input` 事件、CSS 布局、剪贴板降级。
 *  所以这里用 headless 真浏览器跑一遍，把结果写进 DOM 再 dump 回来比对。
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const HTML = join(ROOT, 'dist/naruto-workbench.html')

let pass = 0
const fails = []
const ok = (name, cond, extra) => {
  if (cond) {
    pass++
    console.log('  ✓ ' + name)
  } else {
    fails.push(name + (extra ? ' → ' + extra : ''))
    console.log('  ✗ ' + name + (extra ? ' → ' + extra : ''))
  }
}

function findBrowser() {
  const cands = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  for (const c of cands) {
    try {
      if (existsSync(c)) return c
    } catch {
      /* noop */
    }
  }
  return null
}

const PROBE = `
<script>
window.addEventListener('load', function () {
  function done(status, detail) {
    var d = document.createElement('div')
    d.id = 'E2E_RESULT'
    d.textContent = status + '::' + detail
    document.body.appendChild(d)
  }
  try {
    if (!window.NarutoPower) return done('FAIL', 'no NarutoPower')
    if (typeof window.NarutoPower.compute !== 'function') return done('FAIL', 'core.compute missing')
    document.getElementById('btnSample').click()
    setTimeout(function () {
      try {
        var raw = document.getElementById('totalPowerCell').textContent
        var kpi = document.getElementById('kpis').textContent.replace(/\\s+/g, ' ')
        var rows = document.querySelectorAll('#grid tbody tr').length
        var inputs = document.querySelectorAll('#grid tbody input').length
        var filled = 0
        Array.prototype.forEach.call(document.querySelectorAll('#grid tbody input'), function (i) {
          if (i.value !== '') filled++
        })
        var promptLen = (document.getElementById('promptOut').textContent || '').length
        var warn = document.getElementById('warnBox').textContent
        var bodyW = document.body.scrollWidth
        var docW = document.documentElement.clientWidth
        done('OK', JSON.stringify({
          total: raw, rows: rows, inputs: inputs, filled: filled, promptLen: promptLen,
          kpi: kpi.slice(0, 200), warn: warn.slice(0, 200), overflowX: bodyW > docW + 2
        }))
      } catch (e) { done('FAIL', 'inner:' + e.message) }
    }, 300)
  } catch (e) { done('FAIL', 'outer:' + e.message) }
})
</script>
`

function runInBrowser(browser, extraArgs) {
  const src = readFileSync(HTML, 'utf8')
  const test = src.replace('</body>', PROBE + '</body>')
  const dir = mkdtempSync(join(tmpdir(), 'nw-e2e-'))
  const file = join(dir, 'page.html')
  writeFileSync(file, test, 'utf8')
  const url = 'file:///' + file.replace(/\\/g, '/')
  const r = spawnSync(
    browser,
    ['--headless=new', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=8000',
      ...(extraArgs || []), '--dump-dom', url],
    { encoding: 'utf8', timeout: 90000, maxBuffer: 32 * 1024 * 1024 },
  )
  if (r.error) return { ok: false, why: String(r.error.message) }
  const dom = r.stdout || ''
  const m = dom.match(/id="E2E_RESULT">([\s\S]*?)<\/div>/)
  if (!m) return { ok: false, why: '未找到 E2E_RESULT（页面可能没加载成功）', raw: dom.slice(0, 400) }
  const idx = m[1].indexOf('::')
  const status = m[1].slice(0, idx)
  const detail = m[1].slice(idx + 2)
  if (status !== 'OK') return { ok: false, why: detail }
  try {
    return { ok: true, data: JSON.parse(detail) }
  } catch (e) {
    return { ok: false, why: '结果不是合法 JSON：' + detail.slice(0, 200) }
  }
}

function main() {
  console.log('真浏览器端到端测试')
  if (!existsSync(HTML)) {
    ok('dist/naruto-workbench.html 存在', false, '请先 node tools/build-portable.mjs')
    return finish()
  }

  const browser = findBrowser()
  if (!browser) {
    console.log('  ⚠ 本机没找到 Chrome/Edge/Chromium → 跳过（这不算失败，但说明未验证真实浏览器）')
    console.log('\n浏览器 E2E：跳过 0 项，失败 0 项')
    return 0
  }
  console.log('  使用浏览器：' + browser + '\n')

  const r = runInBrowser(browser)
  ok('页面在 about:file 下正常启动（无脚本错误）', r.ok, r.why || '')
  if (!r.ok) return finish()

  const d = r.data
  ok('渲染出 16 行板块', d.rows === 16, String(d.rows))
  ok('渲染出 112 个输入格（16 × 7）', d.inputs === 112, String(d.inputs))
  ok('点「载入示例」后总战力有值', /万|亿/.test(d.total), d.total)
  ok('点「载入示例」后填入了数据', d.filled > 0, String(d.filled) + ' 个格有值')
  ok('KPI 区显示总战力与达标线', d.kpi.includes('总战力') && d.kpi.includes('达标线'), d.kpi.slice(0, 80))
  ok('提示词已生成', d.promptLen > 300, String(d.promptLen) + ' 字')
  ok('无告警/异常文字', !/异常/.test(d.warn), d.warn)

  // 与 CLI 交叉验证
  const cli = spawnSync(process.execPath, [join(ROOT, 'dist/naruto-cli.cjs'), '--sample'], { encoding: 'utf8' })
  // 注意 fmtPower 输出带空格（"1378.4 万"），正则要把单位一起吃掉
  const m = (cli.stdout || '').match(/总战力（已填部分）：([\d.]+\s*[万亿]?)/)
  const cliTotal = m ? m[1].trim() : null
  ok('浏览器与 CLI 的总战力一致', !!cliTotal && d.total.replace(/\s+/g, '') === cliTotal.replace(/\s+/g, ''),
    'browser=' + d.total + ' cli=' + cliTotal)

  // 第二浏览器（可选，验证跨内核兼容）
  const edge = findBrowserEdge()
  if (edge && edge !== browser) {
    const r2 = runInBrowser(edge)
    ok('Edge（第二内核）同样通过', r2.ok, r2.why || '')
    if (r2.ok) ok('Edge 计算结果与 Chrome 完全一致', r2.data.total === d.total,
      'edge=' + r2.data.total + ' chrome=' + d.total)
  } else {
    console.log('  ⚠ 未找到第二浏览器，跳过跨内核对比')
  }

  return finish()
}

function findBrowserEdge() {
  const cands = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ]
  for (const c of cands) if (existsSync(c)) return c
  return null
}

function finish() {
  console.log('\n' + '═'.repeat(58))
  if (fails.length === 0) {
    console.log('浏览器 E2E：通过 ' + pass + ' 项，失败 0 项')
    console.log('全部通过 ✓')
    return 0
  }
  console.log('浏览器 E2E：通过 ' + pass + ' 项，失败 ' + fails.length + ' 项')
  for (const f of fails) console.log('  · ' + f)
  process.exitCode = 1
  return 1
}

main()
