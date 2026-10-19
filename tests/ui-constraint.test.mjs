import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].find((p) => existsSync(p))
if (!CHROME) {
  console.log('跳过：未找到 Chrome')
  process.exit(0)
}

const htmlPath = 'dist/naruto-workbench.html'
const dir = mkdtempSync(join(tmpdir(), 'nw-forbid-'))
const outFile = join(dir, 'probe.html')

// 把原 HTML + 探针合并成临时文件
const original = readFileSync(htmlPath, 'utf8')
const probe = `
<script>
(function(){
  function report(){
    try{
      var f = document.querySelectorAll('input[data-forbidden="1"]');
      var d = document.querySelectorAll('input[disabled]');
      var rows = document.querySelectorAll('tbody tr');
      var ids = [];
      for (var i=0;i<f.length;i++) ids.push(f[i].getAttribute('data-board')+':'+f[i].getAttribute('data-attr'));
      var el = document.createElement('div');
      el.id = '__probe';
      el.textContent = JSON.stringify({forbidden:f.length, disabled:d.length, rows:rows.length, ids:ids.sort()});
      document.body.appendChild(el);
    }catch(e){ document.title='ERR:'+e.message }
  }
  if (document.readyState === 'complete') setTimeout(report, 500);
  else window.addEventListener('load', function(){ setTimeout(report, 500) });
})();
</script>
`
writeFileSync(outFile, original.replace('</body>', probe + '</body>'), 'utf8')

function runOnce(budget) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--virtual-time-budget=${budget}`,
    '--dump-dom',
    'file:///' + outFile.replace(/\\/g, '/'),
  ]
  return execFileSync(CHROME, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

let dom = ''
for (const b of [6000, 15000, 30000]) {
  dom = runOnce(b)
  if (dom.includes('id="__probe"')) break
}

const m = dom.match(/<div id="__probe">([\s\S]*?)<\/div>/)
let pass = 0
const fails = []
const ok = (n, c, e) => {
  if (c) { pass++; console.log('  ✓ ' + n) } else { fails.push(n + (e ? ' → ' + e : '')); console.log('  ✗ ' + n + (e ? ' → ' + e : '')) }
}

console.log('\n── UI 属性约束渲染实测 ──')
if (!m) {
  console.log('  ✗ 探针未返回')
  rmSync(dir, { recursive: true, force: true })
  process.exit(1)
}
const r = JSON.parse(m[1])
console.log('  实测:', JSON.stringify({ forbidden: r.forbidden, disabled: r.disabled, rows: r.rows }))

ok('禁用输入框 = 28（7 板块 × 4 属性）', r.forbidden === 28, String(r.forbidden))
ok('禁用格 = 7×4 分布正确', r.ids.length === 28 && new Set(r.ids).size === 28)

const BOARDS = ['equipment', 'jade', 'spirit', 'artifact', 'scroll', 'talent', 'talent_shura']
const ATTRS = ['crit', 'critResist', 'elemAtk', 'elemDef']
const expect = []
for (const b of BOARDS) for (const a of ATTRS) expect.push(b + ':' + a)
const missing = expect.filter((x) => !r.ids.includes(x))
ok('每个「受限板块 × 禁止属性」组合都被禁用', missing.length === 0, missing.slice(0, 4).join(','))

// 忍具的属攻**不应该**被禁用
ok('忍具的属攻/属防未被禁用',
  !r.ids.includes('tool_body:elemAtk') && !r.ids.includes('tool_body:elemDef'))
// 饰品的暴击**不应该**被禁用
ok('饰品的暴击/抗暴未被禁用',
  !r.ids.includes('accessory:crit') && !r.ids.includes('accessory:critResist'))
// 全表 16 板块 × 7 属性 = 112 个输入框
ok('全表共 112 个输入框（16×7）', r.rows === 16, 'rows=' + r.rows)

rmSync(dir, { recursive: true, force: true })

console.log('\n' + '═'.repeat(50))
if (fails.length === 0) { console.log('UI 约束实测：通过 ' + pass + ' 项，失败 0 项'); console.log('全部通过 ✓') }
else { console.log('UI 约束实测：通过 ' + pass + ' 项，失败 ' + fails.length + ' 项'); fails.forEach((f) => console.log('  · ' + f)); process.exitCode = 1 }
