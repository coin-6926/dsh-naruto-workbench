#!/usr/bin/env node
/**
 * 可移植产物测试（dist/）
 *
 * 覆盖：
 *  1. 构建成功、产物齐全
 *  2. UMD 在 CommonJS 下正确导出（含 "type":"module" 工程里的 .cjs 回退）
 *  3. **三端一致性**：portable core vs client 算法 vs host tool —— 防止新加一份实现导致漂移
 *  4. 鲁棒性：畸形 / 恶意 / 边界输入一律不抛错、不产生 NaN / Infinity / 负数
 *  5. 缺数据语义：「未填」绝不等于 0
 *  6. 导入导出与版本迁移
 *  7. 单文件 HTML：零外部依赖、零网络 API
 *  8. CLI：参数、stdin、退出码
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, 'dist')
const require = createRequire(import.meta.url)

let pass = 0
const fails = []
function ok(name, cond, extra) {
  if (cond) {
    pass++
    console.log('  ✓ ' + name)
  } else {
    fails.push(name + (extra ? ' → ' + extra : ''))
    console.log('  ✗ ' + name + (extra ? ' → ' + extra : ''))
  }
}
function section(t) {
  console.log('\n── ' + t)
}

// ─────────────────────────────────────────── 1. 构建
section('1. 构建产物')
{
  const r = spawnSync(process.execPath, [join(ROOT, 'tools/build-portable.mjs')], { encoding: 'utf8' })
  ok('构建脚本退出码 0', r.status === 0, (r.stderr || '').slice(0, 300))
  for (const f of ['naruto-power.js', 'naruto-power.cjs', 'naruto-workbench.html', 'naruto-cli.cjs',
    'naruto-power.d.ts', 'package.json']) {
    ok('产物存在：' + f, existsSync(join(DIST, f)))
  }
  const pkg = JSON.parse(readFileSync(join(DIST, 'package.json'), 'utf8'))
  ok('dist/package.json 锁定 commonjs（否则 require 会拿到空对象）', pkg.type === 'commonjs', pkg.type)
}

// ─────────────────────────────────────────── 2. 加载
const CORE = require(join(DIST, 'naruto-power.js'))
section('2. UMD 加载')
{
  ok('CommonJS require 拿到对象', CORE && typeof CORE === 'object')
  ok('核心版本号可读', typeof CORE.CORE_VERSION === 'string' && CORE.CORE_VERSION.length > 0, CORE.CORE_VERSION)
  for (const fn of ['validate', 'compute', 'inflation', 'planTarget', 'boardPower', 'sanitizeNumber',
    'exportPanel', 'importPanel', 'buildAgentPrompt', 'fmtPower', 'fmtPct', 'nearestStandard', 'deepClone']) {
    ok('API 存在且是函数：' + fn, typeof CORE[fn] === 'function')
  }
  ok('16 个板块', CORE.BOARDS.length === 16, String(CORE.BOARDS.length))
  ok('7 个属性', CORE.ATTRS.length === 7, String(CORE.ATTRS.length))
  ok('核心版本与源码一致', CORE.CORE_VERSION === (readFileSync(join(ROOT, 'src/portable/core.src.js'), 'utf8')
    .match(/CORE_VERSION\s*=\s*'([^']+)'/)[1]))
  const cjs = require(join(DIST, 'naruto-power.cjs'))
  ok('naruto-power.cjs 与 .js 同源可用', cjs.CORE_VERSION === CORE.CORE_VERSION)
}

// ─────────────────────────────────────────── 工具
const SAMPLE = {
  level: 145,
  targetPower: 12000000,
  collectionBonus: { hp: 0.6, atk: 0.6, def: 0.6 },
  boards: Object.fromEntries(
    ['equipment', 'jade', 'accessory', 'artifact', 'tool_body', 'spirit', 'tool_museum', 'ninja_insight',
      'bond_card', 'title', 'scroll', 'avatar_frame', 'talent', 'talent_shura', 'rune', 'costume']
      .map((id) => [id, { hp: 100000, atk: 20000, def: 8000, crit: 6000, critResist: 5000 }]),
  ),
}

/** 深度扫描：任何 NaN / Infinity / undefined 数字都算失败 */
function scanBadNumbers(obj, path = '$') {
  const bad = []
  const seen = new Set()
  ;(function walk(v, p) {
    if (v === null) return
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) bad.push(p + ' = ' + v)
      if (v < 0) bad.push(p + ' 为负 (' + v + ')')
      return
    }
    if (typeof v !== 'object') return
    if (seen.has(v)) return
    seen.add(v)
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']'))
    else for (const k of Object.keys(v)) walk(v[k], p + '.' + k)
  })(obj, path)
  return bad
}

// ─────────────────────────────────────────── 3. 三端一致性
section('3. 三端一致性（portable core vs client vs host）')
{
  const clientSrc = readFileSync(join(ROOT, 'lib/client.js'), 'utf8')
  const mAttr = clientSrc.match(/const ATTRS = \[([\s\S]*?)\n\s*\]/)
  ok('能从 client.js 提取 ATTRS', !!mAttr)

  const weightDrift = []
  if (mAttr) {
    const clientW = Object.fromEntries([...mAttr[1].matchAll(/id:\s*'([a-zA-Z]+)'[^}]*w:\s*([\d.]+)/g)]
      .map((m) => [m[1], Number(m[2])]))
    for (const k of CORE.ATTR_KEYS) {
      if (clientW[k] !== CORE.WEIGHTS[k]) weightDrift.push(k + ': client=' + clientW[k] + ' core=' + CORE.WEIGHTS[k])
    }
  }
  ok('client 与 portable core 属性权重一致', weightDrift.length === 0, weightDrift.join(', '))

  // client 算法复刻（与 client.js 的 boardPower 同构）
  const clientBoard = (attrs, bonusPct) => {
    let p = 0
    for (const a of CORE.ATTRS) {
      const v = Number(attrs[a.id])
      if (!Number.isFinite(v) || v <= 0) continue
      const applyCb = ['hp', 'atk', 'def'].includes(a.id)
      const cb = applyCb ? 1 + (bonusPct[a.id] || 0) / 100 : 1
      p += v * CORE.WEIGHTS[a.id] * cb
    }
    return p
  }
  const cbPct = { hp: 60, atk: 60, def: 60 }
  let clientTotal = 0
  for (const b of CORE.BOARDS) clientTotal += clientBoard(SAMPLE.boards[b.id], cbPct)
  clientTotal = Math.round(clientTotal)

  const portTotal = CORE.compute(SAMPLE).totalPower
  ok('portable core 与 client 算法总战力完全相等', portTotal === clientTotal,
    'core=' + portTotal + ' client=' + clientTotal)

  // host 端（naruto_analyze）—— 用 stub ctx 直接调用插件的工具
  const hostTool = await loadHostAnalyze()
  if (hostTool) {
    const res = await hostTool.execute({ panel: { boards: SAMPLE.boards, collectionBonus: { hp: 0.6, atk: 0.6, def: 0.6 } } })
    const hostTotal = res && (typeof res.totalPower === 'number' ? res.totalPower : res.compute && res.compute.totalPower)
    ok('portable core 与 host 工具总战力完全相等', hostTotal === portTotal,
      'host=' + hostTotal + ' core=' + portTotal)
  } else {
    ok('host 工具可加载（跳过则为环境问题）', false, '无法加载 lib/index.js')
  }

  // 逐板块相等
  const portRows = CORE.compute(SAMPLE).boards
  let rowMismatch = 0
  for (const b of CORE.BOARDS) {
    const row = portRows.find((r) => r.boardId === b.id)
    const expect = Math.round(clientBoard(SAMPLE.boards[b.id], cbPct))
    if (!row || row.power !== expect) rowMismatch++
  }
  ok('16 个板块逐一相等', rowMismatch === 0, rowMismatch + ' 个不一致')
}

async function loadHostAnalyze() {
  try {
    const tools = {}
    const ctx = {
      tools: { register(d) { tools[d.name] = d; return () => {} } },
      logger: { info() {}, warn() {}, error() {} },
    }
    const mod = await import('../lib/index.js')
    const apply = mod.apply || (mod.default && mod.default.apply)
    if (typeof apply !== 'function') return null
    await apply(ctx)
    return tools.naruto_analyze || null
  } catch (e) {
    if (process.env.NW_DEBUG) console.error(e)
    return null
  }
}

// ─────────────────────────────────────────── 4. 鲁棒性
section('4. 鲁棒性（畸形 / 恶意 / 边界输入）')
{
  const nasty = [
    null, undefined, 0, 1, -1, NaN, Infinity, -Infinity, '', '   ', 'abc', '{}', '[]',
    [], {}, { boards: null }, { boards: [] }, { boards: 'x' }, { boards: { equipment: null } },
    { boards: { equipment: [] } }, { boards: { equipment: { hp: 'abc' } } },
    { boards: { equipment: { hp: NaN } } }, { boards: { equipment: { hp: Infinity } } },
    { boards: { equipment: { hp: -999 } } }, { boards: { equipment: { hp: 1e308 } } },
    { boards: { __proto__: { hp: 1 } } }, { boards: { constructor: { hp: 1 } } },
    { boards: { equipment: { hp: 1, atk: 2, def: 3, crit: 4, critResist: 5, elemAtk: 6, elemDef: 7 } } },
    { level: 'x', targetPower: {} }, { level: -5, targetPower: -1 }, { level: 1e9 },
    { collectionBonus: 'x' }, { collectionBonus: { hp: -1 } }, { collectionBonus: { hp: 1e12 } },
    { boards: { unknown_board: { hp: 1 } } },
  ]
  // 循环引用
  const cyc = { boards: {} }
  cyc.boards.equipment = { hp: 100 }
  cyc.self = cyc
  cyc.boards.self = cyc

  let threw = null
  for (const input of nasty) {
    try {
      CORE.compute(input)
    } catch (e) {
      threw = JSON.stringify(String(input)).slice(0, 40) + ' → ' + e.message
      break
    }
  }
  try {
    CORE.compute(cyc)
  } catch (e) {
    threw = '循环引用 → ' + e.message
  }
  ok('所有畸形输入都不抛异常', threw === null, threw || '')

  // 逐项扫描坏数字
  let badAll = []
  for (const input of nasty) {
    const c = CORE.compute(input)
    const infl = CORE.inflation(c)
    const plan = CORE.planTarget({ currentPower: c.totalPower, targetPower: c.targetPower, level: c.level, computed: c })
    badAll = badAll.concat(scanBadNumbers({ c, infl, plan }, 'input#' + nasty.indexOf(input)))
  }
  badAll = badAll.concat(scanBadNumbers({ cyc: CORE.compute(cyc) }, 'cyc'))
  ok('畸形输入不产生 NaN / Infinity / 负数', badAll.length === 0, badAll.slice(0, 5).join(' ; '))

  // sanitizeNumber 语义
  ok('sanitizeNumber("1,234") = 1234', CORE.sanitizeNumber('1,234') === 1234)
  ok('sanitizeNumber(" 56 ") = 56', CORE.sanitizeNumber(' 56 ') === 56)
  ok('sanitizeNumber("56万") = null（不猜单位）', CORE.sanitizeNumber('56万') === null)
  ok('sanitizeNumber(NaN) = null', CORE.sanitizeNumber(NaN) === null)
  ok('sanitizeNumber(Infinity) = null', CORE.sanitizeNumber(Infinity) === null)
  ok('sanitizeNumber(null) = null', CORE.sanitizeNumber(null) === null)
  ok('sanitizeNumber(0) = 0（0 是合法值）', CORE.sanitizeNumber(0) === 0)
  ok('sanitizeNumber(undefined, 7) = 7', CORE.sanitizeNumber(undefined, 7) === 7)
  ok('sanitizeNumber(true) = null', CORE.sanitizeNumber(true) === null)
}

// ─────────────────────────────────────────── 5. 缺数据语义
section('5. 缺数据 ≠ 0')
{
  const empty = CORE.compute({})
  ok('空面板总战力 = 0', empty.totalPower === 0)
  ok('空面板 filledCount = 0', empty.filledCount === 0)
  ok('空面板全部 share 为 null（不是 0）', empty.boards.every((b) => b.share === null))
  ok('空面板全部 filled 为 false', empty.boards.every((b) => b.filled === false))
  ok('空面板列出全部未填板块', empty.unfilled.length === 16, String(empty.unfilled.length))

  const partial = CORE.compute({ boards: { equipment: { hp: 100000 } } })
  ok('只填 1 块时 filledCount = 1', partial.filledCount === 1)
  ok('只填 1 块时该块 share = 100%', Math.abs(partial.boards.find((b) => b.boardId === 'equipment').share - 1) < 1e-12)
  ok('只填 1 块时其余 share 仍为 null', partial.boards.filter((b) => b.boardId !== 'equipment').every((b) => b.share === null))

  const zeroOnly = CORE.compute({ boards: { equipment: { hp: 0, atk: 0 } } })
  ok('只填 0 视为未填（不冒充已知为零）', zeroOnly.filledCount === 0, 'filled=' + zeroOnly.filledCount)
  ok('只填 0 会产生提示', zeroOnly.warnings.some((w) => w.includes('均为 0')), JSON.stringify(zeroOnly.warnings))
}

// ─────────────────────────────────────────── 6. 计算正确性
section('6. 计算正确性')
{
  const one = CORE.compute({ boards: { equipment: { hp: 1000 } } })
  ok('生命 1000 → 1000 战力', one.totalPower === 1000)
  const atk = CORE.compute({ boards: { equipment: { atk: 1000 } } })
  ok('攻击 1000 → 3500 战力', atk.totalPower === 3500)
  const def = CORE.compute({ boards: { equipment: { def: 100 } } })
  ok('防御 100 → 1160 战力', def.totalPower === 1160)

  const withCb = CORE.compute({ boards: { equipment: { hp: 1000 } }, collectionBonus: { hp: 0.5 } })
  ok('收集加成 hp 50% → 1500', withCb.totalPower === 1500, String(withCb.totalPower))
  const cbOnCrit = CORE.compute({ boards: { equipment: { crit: 1000 } }, collectionBonus: { crit: 0.5 } })
  ok('收集加成不作用于暴击', cbOnCrit.totalPower === 6000, String(cbOnCrit.totalPower))
  const pctInput = CORE.compute({ boards: { equipment: { hp: 1000 } }, collectionBonus: { hp: 50 } })
  ok('收集加成填 50 自动当 50% 处理', pctInput.totalPower === 1500, String(pctInput.totalPower))

  // 单调性
  const base = CORE.compute({ boards: { equipment: { atk: 1000 } } }).totalPower
  const more = CORE.compute({ boards: { equipment: { atk: 2000 } } }).totalPower
  ok('攻击翻倍战力翻倍（线性）', more === base * 2)

  // 全填满占比合计 100%
  const full = CORE.compute(SAMPLE)
  const sum = full.boards.reduce((s, b) => s + (b.share || 0), 0)
  ok('全填时占比合计 = 100%', Math.abs(sum - 1) < 1e-9, String(sum))
}

// ─────────────────────────────────────────── 7. 目标倒推
section('7. 目标倒推')
{
  const c = CORE.compute({ level: 145, boards: { equipment: { hp: 1000000 } } })
  const p1 = CORE.planTarget({ currentPower: c.totalPower, targetPower: 2000000, level: 145, computed: c })
  ok('有缺口时 gap 正确', p1.gap === 1000000, String(p1.gap))
  ok('没给日收益时 daysNeeded 必须为 null（拒绝编造）', p1.daysNeeded === null)
  ok('没给日收益时有说明文字', typeof p1.daysNote === 'string' && p1.daysNote.includes('不估算'))

  const p2 = CORE.planTarget({ currentPower: 1000000, targetPower: 2000000, level: 145, incomePerDay: 100000 })
  ok('给了日收益才估天数', p2.daysNeeded === 10, String(p2.daysNeeded))

  const p3 = CORE.planTarget({ currentPower: 0, targetPower: 0, incomePerDay: 0 })
  ok('日收益为 0 时不估天数（避免除零）', p3.daysNeeded === null)

  const p4 = CORE.planTarget({ currentPower: 2000000, targetPower: 1000000, level: 145 })
  ok('已超目标时 gap = 0 而不是负数', p4.gap === 0, String(p4.gap))

  const p5 = CORE.planTarget({ currentPower: 11000000, targetPower: null, level: 145 })
  ok('145 级能对上社区达标线', p5.standard && p5.standard.level === 145, JSON.stringify(p5.standard))
  ok('能给出达标标签', typeof p5.vsStandardLabel === 'string', p5.vsStandardLabel)

  const p6 = CORE.planTarget({ currentPower: 1, targetPower: null, level: 99999 })
  ok('离谱等级不崩', p6.standard === null || typeof p6.standard === 'object')

  ok('倒推结果必带「达标线≠团本门槛」提醒',
    p5.caveats.some((c2) => c2.includes('团本')), JSON.stringify(p5.caveats))
}

// ─────────────────────────────────────────── 8. 导入导出
section('8. 导入 / 导出 / 版本迁移')
{
  const env = CORE.exportPanel(SAMPLE)
  ok('导出带 format 标记', env.format === 'naruto-workbench-panel')
  ok('导出带 schemaVersion', env.schemaVersion === CORE.SCHEMA_VERSION)
  ok('导出带 dataVersion', env.dataVersion === CORE.DATA.version)

  const back = CORE.importPanel(JSON.stringify(env))
  ok('导出后可再导入', back.ok === true)
  ok('往返后总战力不变', CORE.compute(back.panel).totalPower === CORE.compute(SAMPLE).totalPower)

  ok('裸面板也能导入', CORE.importPanel(SAMPLE).ok === true)
  ok('坏 JSON 返回 ok:false 而非抛错', CORE.importPanel('{bad json').ok === false)
  ok('非对象返回 ok:false', CORE.importPanel(123).ok === false)
  ok('null 返回 ok:false', CORE.importPanel(null).ok === false)

  const future = CORE.importPanel(JSON.stringify({ ...env, schemaVersion: 999 }))
  ok('高版本文件仍能导入但给警告', future.ok === true && future.warnings.some((w) => w.includes('v999')))

  const oldData = CORE.importPanel(JSON.stringify({ ...env, dataVersion: '2000.01.01' }))
  ok('数据版本不同会给出提示', oldData.warnings.some((w) => w.includes('数据版本')))

  const unknown = CORE.importPanel({ boards: { not_a_board: { hp: 1 }, equipment: { hp: 100 } } })
  ok('未知板块被忽略且有提示', unknown.warnings.some((w) => w.includes('未知板块')))
}

// ─────────────────────────────────────────── 9. 提示词
section('9. Agent 提示词')
{
  const text = CORE.buildAgentPrompt(SAMPLE)
  for (const kw of ['硬性要求', '我的面板', '板块', '合计', '初步结论', '请输出', 'huoyin.qq.com']) {
    ok('提示词含「' + kw + '」', text.includes(kw))
  }
  ok('提示词包含已填板块的实际数值', text.includes('装备'))
  ok('提示词明确写出「不要编数字」', text.includes('不要编数字'))
  ok('空面板也能生成提示词', typeof CORE.buildAgentPrompt({}) === 'string')
  ok('畸形输入也能生成提示词', typeof CORE.buildAgentPrompt(null) === 'string')
}

// ─────────────────────────────────────────── 10. 单文件 HTML
section('10. 单文件 HTML')
{
  const html = readFileSync(join(DIST, 'naruto-workbench.html'), 'utf8')
  ok('是单个 HTML（无外链 script/link）', !/<script[^>]+src=/i.test(html) && !/<link[^>]+href=["']https?:/i.test(html))
  ok('没有 fetch / XMLHttpRequest 等联网 API', !/\bfetch\s*\(/.test(html) && !/XMLHttpRequest/.test(html))
  ok('没有 @import 外部 CSS', !/@import\s+url\(\s*['"]?https?:/i.test(html))
  ok('内联了核心（NarutoPower）', html.includes('root.NarutoPower'))
  ok('有 viewport meta（移动端可用）', /name=["']viewport["']/.test(html))
  ok('声明了 charset', /charset=["']?utf-8/i.test(html))
  ok('没有未替换的占位符', !/__BUNDLE__|__CORE_VERSION__|__DATA_VERSION__/.test(html))
  ok('包含深色/浅色自适应', html.includes('prefers-color-scheme'))
  ok('包含打印样式', html.includes('@media print'))
  ok('包含 localStorage 容错', html.includes('localStorage') && html.includes('catch'))
  ok('包含剪贴板降级（execCommand）', html.includes('execCommand'))
  ok('页面内所有 https 链接都在 target=_blank 且 noopener',
    [...html.matchAll(/<a[^>]+href="https?:[^"]*"[^>]*>/g)].every((m) => /noopener/.test(m[0])))
  // 体积上限：单文件不能太夸张
  ok('单文件体积 < 400 KB', Buffer.byteLength(html) < 400 * 1024, (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB')
}

// ─────────────────────────────────────────── 11. CLI
section('11. CLI')
{
  const cli = join(DIST, 'naruto-cli.cjs')
  const run = (args, input) =>
    spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', input: input, timeout: 30000 })

  const help = run(['--help'])
  ok('--help 退出码 0', help.status === 0)
  ok('--help 有用法说明', help.stdout.includes('用法'))

  const sample = run(['--sample'])
  ok('--sample 退出码 0', sample.status === 0, (sample.stderr || '').slice(0, 200))
  ok('--sample 有总战力输出', sample.stdout.includes('总战力'))
  ok('--sample 有板块构成', sample.stdout.includes('板块构成'))
  ok('--sample 有虚战诊断', sample.stdout.includes('虚战诊断'))

  const json = run(['--sample', '--json'])
  ok('--json 退出码 0', json.status === 0)
  let parsed = null
  try {
    parsed = JSON.parse(json.stdout)
  } catch (e) {
    /* noop */
  }
  ok('--json 输出可被 JSON.parse', parsed !== null)
  ok('--json 结构完整', parsed && parsed.compute && parsed.inflation && parsed.plan)
  ok('--json 里 totalPower 是数字', parsed && typeof parsed.compute.totalPower === 'number')

  const prompt = run(['--sample', '--prompt'])
  ok('--prompt 退出码 0', prompt.status === 0)
  ok('--prompt 含提示词内容', prompt.stdout.includes('硬性要求'))

  const sources = run(['--sources'])
  ok('--sources 退出码 0', sources.status === 0)
  ok('--sources 列出了来源', sources.stdout.includes('条来源'))

  const exported = run(['--export-sample'])
  ok('--export-sample 退出码 0', exported.status === 0)
  ok('--export-sample 输出可解析', (() => { try { JSON.parse(exported.stdout); return true } catch { return false } })())

  // stdin
  const viaStdin = run([], JSON.stringify(CORE.exportPanel(SAMPLE)))
  ok('从 stdin 读面板 退出码 0', viaStdin.status === 0, (viaStdin.stderr || '').slice(0, 200))
  ok('stdin 结果与 --sample 的 totalPower 一致',
    parsed && viaStdin.stdout.length > 0 && viaStdin.stdout.includes(CORE.fmtPower(CORE.compute(SAMPLE).totalPower)))

  // 错误路径
  const noInput = run([], '')
  ok('无输入时退出码 1', noInput.status === 1, String(noInput.status))

  const badFile = run(['--panel', join(tmpdir(), 'definitely-not-here-12345.json')])
  ok('文件不存在时退出码 1', badFile.status === 1, String(badFile.status))

  const badArgs = run(['--nonsense'])
  ok('未知参数时退出码 1', badArgs.status === 1, String(badArgs.status))

  // 坏 JSON 文件
  const dir = mkdtempSync(join(tmpdir(), 'nw-'))
  const badJson = join(dir, 'bad.json')
  writeFileSync(badJson, '{ not json')
  const badJsonRun = run(['--panel', badJson])
  ok('坏 JSON 时退出码 1 且不崩', badJsonRun.status === 1 && !/计算异常/.test(badJsonRun.stderr), String(badJsonRun.status))

  // 好文件
  const goodJson = join(dir, 'good.json')
  writeFileSync(goodJson, JSON.stringify(CORE.exportPanel(SAMPLE)))
  const goodRun = run(['--panel', goodJson])
  ok('正常文件退出码 0', goodRun.status === 0, (goodRun.stderr || '').slice(0, 200))

  // --income
  const withIncome = run(['--panel', goodJson, '--income', '100000'])
  ok('--income 能算出天数', withIncome.stdout.includes('天') || withIncome.stdout.includes('不估算'))
}

// ─────────────────────────────────────────── 12. 部署契约（AGENTS.md / README / keywords）
section('12. 部署契约可执行性')
{
  const agentsPath = join(ROOT, 'AGENTS.md')
  ok('AGENTS.md 存在（agent 被丢链接时靠它部署）', existsSync(agentsPath))
  const agents = existsSync(agentsPath) ? readFileSync(agentsPath, 'utf8') : ''
  for (const kw of ['git clone https://github.com/coin-6926/dsh-naruto-workbench',
    'dev_inject_plugin', 'dev_plugin_status', 'dist/naruto-workbench.html',
    'node dist/naruto-cli.cjs --sample', 'huoyin.qq.com', '留空 = 未知']) {
    ok('AGENTS.md 含关键指令「' + kw.slice(0, 34) + '」', agents.includes(kw))
  }

  // AGENTS.md 里写的数字必须与现实一致，否则会把后来的 agent 带偏
  const cliSources = spawnSync(process.execPath, [join(DIST, 'naruto-cli.cjs'), '--sources'], { encoding: 'utf8' })
  const mSrc = (cliSources.stdout || '').match(/共 (\d+) 条来源/)
  const realSources = mSrc ? Number(mSrc[1]) : null
  ok('AGENTS.md 提到的来源条数准确', realSources !== null && agents.includes(String(realSources) + ' 条'),
    'CLI --sources = ' + realSources)

  const cliSample = spawnSync(process.execPath, [join(DIST, 'naruto-cli.cjs'), '--sample'], { encoding: 'utf8' })
  const mPw = (cliSample.stdout || '').match(/总战力（已填部分）：([\d.]+\s*[万亿]?)/)
  const realPw = mPw ? mPw[1].trim() : null
  ok('AGENTS.md 里示例总战力与实际一致', !!realPw && agents.includes(realPw.replace(/\s+/g, ' ')),
    'CLI = ' + realPw)

  // README 必须有一句话部署入口
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
  ok('README 有「丢给 agent」的部署一行', /部署 https:\/\/github\.com\/coin-6926\/dsh-naruto-workbench/.test(readme))
  ok('README 链接到 AGENTS.md', readme.includes('AGENTS.md'))

  // 包元数据要能被 dsh-plugin 这类关键词检索到
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  ok('package.json keywords 含 dsh-plugin', Array.isArray(pkg.keywords) && pkg.keywords.includes('dsh-plugin'),
    (pkg.keywords || []).join(','))
  ok('package.json files 含 dist 与 src（clone 即可用）',
    Array.isArray(pkg.files) && pkg.files.includes('dist') && pkg.files.includes('src'), (pkg.files || []).join(','))
  ok('有 npm run test:all 一键跑三套测试', !!(pkg.scripts && pkg.scripts['test:all']))
}

// ─────────────────────────────────────────── 13. 搜索清单与现实一致
section('13. 搜索清单（docs/SEARCH-CHECKLIST.md）不腐化')
{
  const p = join(ROOT, 'docs/SEARCH-CHECKLIST.md')
  ok('搜索清单存在', existsSync(p))
  const md = existsSync(p) ? readFileSync(p, 'utf8') : ''
  for (const kw of ['node tools/fetch-official.mjs', 'node tools/search-official.mjs',
    'huoyin.qq.com', 'img.xvcai.com', '不要再去官方公告找']) {
    ok('清单含关键指引「' + kw.slice(0, 30) + '」', md.includes(kw))
  }
  // 计数必须与数据层一致
  const srcCount = Object.keys(CORE.sources).length
  ok('清单里写的来源条数 = 实际（' + srcCount + '）', md.includes('| 来源条目 | ' + srcCount + ' |'), 'data=' + srcCount)
  ok('清单里写的 cautions 数 = 实际（' + CORE.cautions.length + '）',
    md.includes('| cautions | ' + CORE.cautions.length + ' |'))
  const conflicts = (CORE.DATA.dataConflicts2026 || []).length
  ok('清单里写的冲突数 = 实际（' + conflicts + '）', md.includes('（dataConflicts2026）') && md.includes(String(conflicts) + '（dataConflicts2026）'))
  const farms = (CORE.sources.farm_blacklist_note.note
    .slice(CORE.sources.farm_blacklist_note.note.indexOf('不作独立来源：'))
    .split('。')[0].split('/').map((s) => s.trim()).filter(Boolean)).length
  ok('清单里写的农场域名数 = 实际（' + farms + '）', md.includes('| 农场黑名单域 | ' + farms + ' |'), 'data=' + farms)
  // 已确认负结果必须标 🚫 且写明别找
  ok('已确认负结果被标为不要重复', /🚫 已确认"搜不到"/.test(md))
}

// ─────────────────────────────────────────── 汇总
console.log('\n' + '═'.repeat(58))
if (fails.length === 0) {
  console.log('可移植产物测试：通过 ' + pass + ' 项，失败 0 项')
  console.log('全部通过 ✓')
} else {
  console.log('可移植产物测试：通过 ' + pass + ' 项，失败 ' + fails.length + ' 项')
  console.log('\n失败项：')
  for (const f of fails) console.log('  · ' + f)
  process.exitCode = 1
}
