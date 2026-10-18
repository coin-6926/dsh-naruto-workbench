/**
 * 健壮性与通用性专项测试
 *
 * 与 portable.test.mjs 的区别：那个测"产物对不对"，这个测"极限情况下会不会崩"。
 * 覆盖四类：
 *   A. fuzz —— 随机生成成百上千个面板，验证永不产生 NaN/Infinity/负数、且不抛错
 *   B. 不变量 —— 单调性、幂等性、确定性、占比归一
 *   C. 语法下限 —— 构建产物不得含 ES2015 之后的语法（保证老浏览器/老 Node 可用）
 *   D. 全局污染 —— 重复加载不炸、不覆盖已存在的全局变量
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, 'dist')
const require = createRequire(import.meta.url)

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
const section = (t) => console.log('\n── ' + t)

// ── 固定种子的伪随机（保证可复现，不依赖 Math.random）
function makeRng(seed) {
  let s = seed >>> 0
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const CORE = require(join(DIST, 'naruto-power.js'))
const PD = CORE.DATA
if (!CORE || typeof CORE.compute !== 'function') {
  console.error('无法加载 dist/naruto-power.js，请先 npm run build:portable')
  process.exit(1)
}

/** 深度扫描：任何 NaN / Infinity / 负数都算坏数据 */
function scanBad(obj) {
  const bad = []
  const seen = new Set()
  ;(function walk(v, p) {
    if (v === null || v === undefined) return
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) bad.push(p + '=' + v)
      else if (v < 0) bad.push(p + '<0 (' + v + ')')
      return
    }
    if (typeof v !== 'object') return
    if (seen.has(v)) return
    seen.add(v)
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']'))
    else for (const k of Object.keys(v)) walk(v[k], p + '.' + k)
  })(obj, '$')
  return bad
}

// ════════════════════════════════════════ A. fuzz
section('A. fuzz：随机面板 400 组')
{
  const rng = makeRng(20261018)
  const ATTRS = CORE.ATTR_KEYS
  const BOARDS = CORE.BOARDS.map((b) => b.id)
  let threw = null
  let badTotal = 0
  let checked = 0

  // 值的生成要覆盖多种"坏"形态：正常、零、负数、NaN、字符串、超大、极小、null
  const pick = () => {
    const r = rng()
    if (r < 0.45) return Math.floor(rng() * 1e6) // 正常
    if (r < 0.55) return 0
    if (r < 0.63) return -Math.floor(rng() * 1000) // 负数
    if (r < 0.70) return NaN
    if (r < 0.77) return Infinity
    if (r < 0.84) return '12345' // 字符串数字
    if (r < 0.90) return 'abc' // 非数字字符串
    if (r < 0.95) return 1e15 // 极大
    if (r < 0.98) return null
    return 0.000001 // 极小
  }

  for (let n = 0; n < 400; n++) {
    const panel = { boards: {} }
    if (rng() < 0.8) panel.level = Math.floor(rng() * 400) - 50 // 含负数/超范围
    if (rng() < 0.7) panel.targetPower = Math.floor(rng() * 1e9)
    if (rng() < 0.6) {
      panel.collectionBonus = {}
      for (const k of ['hp', 'atk', 'def']) if (rng() < 0.7) panel.collectionBonus[k] = rng() * 3 - 0.5
    }
    for (const b of BOARDS) {
      if (rng() < 0.5) continue
      panel.boards[b] = {}
      for (const a of ATTRS) if (rng() < 0.7) panel.boards[b][a] = pick()
    }
    try {
      const comp = CORE.compute(panel)
      const infl = CORE.inflation(comp)
      const plan = CORE.planTarget({
        currentPower: comp.totalPower,
        targetPower: comp.targetPower,
        level: comp.level,
        incomePerDay: rng() < 0.5 ? Math.floor(rng() * 1e6) : null,
        computed: comp,
      })
      const bad = scanBad({ comp, infl, plan })
      if (bad.length) {
        badTotal++
        if (badTotal <= 3) console.log('    坏数据 #' + n + ': ' + bad.slice(0, 3).join(' ; '))
      }
      checked++
    } catch (e) {
      threw = 'case #' + n + ' → ' + e.message
      break
    }
  }
  ok('400 组随机面板全部不抛异常', threw === null, threw || '')
  ok('400 组随机面板无 NaN / Infinity / 负数', badTotal === 0, badTotal + ' 组有问题')
  ok('fuzz 实际执行了全部 400 组', checked === 400, checked + '/400')
}

// ════════════════════════════════════════ B. 不变量
section('B. 不变量：单调 / 幂等 / 确定 / 归一')
{
  // 单调性：任一属性增加，总战力不减
  const base = { boards: { equipment: { hp: 1000, atk: 100, def: 50, crit: 20, critResist: 10 } } }
  const p0 = CORE.compute(base).totalPower
  const p1 = CORE.compute({ boards: { equipment: { hp: 1001, atk: 100, def: 50, crit: 20, critResist: 10 } } }).totalPower
  ok('生命 +1 → 总战力 +1（单调）', p1 === p0 + 1, p0 + ' → ' + p1)
  for (const [attr, step] of [['atk', 1], ['def', 1], ['crit', 1], ['critResist', 1]]) {
    const a = CORE.compute(base).totalPower
    const b = CORE.compute({ boards: { equipment: { hp: 1000, atk: 100, def: 50, crit: 20, critResist: 10, [attr]: undefined } } })
    // 单独加该属性
    const c = CORE.compute({
      boards: { equipment: { hp: 1000, atk: 100, def: 50, crit: 20, critResist: 10, [attr]: (attr === 'atk' ? 100 : attr === 'def' ? 50 : attr === 'crit' ? 20 : 10) + step } },
    }).totalPower
    ok('加 ' + attr + ' 不减少总战力', c >= a, a + ' → ' + c)
  }

  // 幂等：compute 不改变输入对象
  const input = { level: 145, boards: { equipment: { hp: 5000 } } }
  const snapshot = JSON.stringify(input)
  CORE.compute(input)
  CORE.compute(input)
  ok('compute 不修改传入对象（纯函数）', JSON.stringify(input) === snapshot)

  // 确定性：同输入多次结果完全一致
  const runs = []
  for (let i = 0; i < 5; i++) runs.push(JSON.stringify(CORE.compute(input)))
  ok('同输入 5 次结果完全一致（确定性）', new Set(runs).size === 1)

  // 归一：全填时占比合计 = 1
  const full = { boards: {} }
  for (const b of CORE.BOARDS) full.boards[b.id] = { hp: 1000, atk: 100 }
  const comp = CORE.compute(full)
  const sum = comp.boards.reduce((s, r) => s + (r.share || 0), 0)
  ok('全填时 16 块占比合计 = 100%', Math.abs(sum - 1) < 1e-9, sum)

  // export → import → export 稳定（二次往返不再变化）
  const e1 = CORE.exportPanel(full)
  const i1 = CORE.importPanel(JSON.stringify(e1))
  const e2 = CORE.exportPanel(i1.panel)
  const strip = (o) => {
    const c = JSON.parse(JSON.stringify(o))
    delete c.exportedAt
    return JSON.stringify(c)
  }
  ok('export → import → export 结果稳定（幂等）', strip(e1) === strip(e2))

  // 极端值：1e15 不溢出成 Infinity
  const huge = CORE.compute({ boards: { equipment: { hp: 1e15, atk: 1e15, def: 1e15 } } })
  ok('单属性 1e15 不产生 Infinity', Number.isFinite(huge.totalPower) && huge.totalPower > 0, String(huge.totalPower))

  // ★ 回归：planTarget 是直接收参的，不走 validate，必须自己挡等级范围
  // （2026-10-18 由 stress 测试发现：level:-1 曾被原样返回）
  for (const bad of [-1, 0, -999, 301, 1e9]) {
    ok('planTarget(level=' + bad + ') 越界等级应置 null',
      CORE.planTarget({ currentPower: 1, targetPower: 2, level: bad }).level === null,
      String(CORE.planTarget({ currentPower: 1, targetPower: 2, level: bad }).level))
  }
  ok('planTarget(level=145) 合法等级应保留', CORE.planTarget({ currentPower: 1, targetPower: 2, level: 145 }).level === 145)

  // 空输入语义
  const empty = CORE.compute({})
  ok('空面板 totalPower = 0 且 filledCount = 0', empty.totalPower === 0 && empty.filledCount === 0)
  ok('空面板所有 share 为 null（不是 0）', empty.boards.every((b) => b.share === null))
}

// ════════════════════════════════════════ B2. 数据一致性
section('B2. 数据层自洽（同一结论多处记录必须一致）')
{
  // 2026-10-18 修过：升级 perAttr 时漏改 elemCrossCheck 里的副本，导致同一结论两处置信度不同
  ok('elemAtk 在 perAttr 与 elemCrossCheck 里置信度一致',
    PD.attrWeights.perAttr.elemAtk.confidence === PD.elemCrossCheck.elemAtkPerPoint.confidence,
    PD.attrWeights.perAttr.elemAtk.confidence + ' vs ' + PD.elemCrossCheck.elemAtkPerPoint.confidence)
  ok('elemDef 在 perAttr 与 elemCrossCheck 里置信度一致',
    PD.attrWeights.perAttr.elemDef.confidence === PD.elemCrossCheck.elemDefPerPoint.confidence,
    PD.attrWeights.perAttr.elemDef.confidence + ' vs ' + PD.elemCrossCheck.elemDefPerPoint.confidence)
  ok('elemAtk 数值在两处一致',
    PD.attrWeights.perAttr.elemAtk.value === PD.elemCrossCheck.elemAtkPerPoint.value)
  ok('elemDef 数值在两处一致',
    PD.attrWeights.perAttr.elemDef.value === PD.elemCrossCheck.elemDefPerPoint.value)
  const resolved = PD.dataConflicts2026.filter((c) => String(c.status).startsWith("RESOLVED"))
  ok('已裁决条目不再写「用户未确认」',
    resolved.every((c) => !JSON.stringify(c).includes('用户未确认')),
    resolved.length + ' 条已裁决')
}
// ════════════════════════════════════════ B3. 父级掩盖子级
section('B3. 父级置信度不得埋没子级高置信数据')
{
  // 2026-10-18 事故：growth.equipment 父级 low，但 advanceTiers(装备进阶 89 阶) 是官方 high，
  // 导致一份人工报告把 89 阶漏掉了。规则：父级低于子级时，必须用 innerHighlights 显式标出。
  const RANK = { unverified: 0, low: 1, medium: 2, high: 3 }
  const missing = []
  const seen2 = new Set()
  ;(function walk2(v, path, depth) {
    if (!v || typeof v !== 'object' || depth > 9) return
    if (seen2.has(v)) return
    seen2.add(v)
    if (Array.isArray(v)) {
      v.forEach((x, i) => walk2(x, path + "[" + i + "]", depth + 1))
      return
    }
    if (typeof v.confidence === 'string' && RANK[v.confidence] !== undefined) {
      const higher = Object.keys(v).filter(
        (k) => v[k] && typeof v[k] === "object" && !Array.isArray(v[k]) &&
          typeof v[k].confidence === "string" && RANK[v[k].confidence] > RANK[v.confidence],
      )
      if (higher.length && !v.innerHighlights) missing.push(path + " -> " + higher.join(","))
    }
    for (const k of Object.keys(v)) {
      if (k === "sources") continue
      walk2(v[k], path ? path + "." + k : k, depth + 1)
    }
  })({ root: PD }, "", 0)
0
  ok('growth.equipment 显式标出 89 阶为官方 high',
    !!PD.growth.equipment.innerHighlights &&
    PD.growth.equipment.innerHighlights.high.some((x) => x.includes('89')))
  ok('growth.jade 显式标出孔数为用户一手 high',
    !!PD.growth.jade.innerHighlights &&
    PD.growth.jade.innerHighlights.high.some((x) => x.includes('slots')))
  ok('innerHighlights 不得污染无关节点（如 collectionBonus）',
    !PD.collectionBonus.innerHighlights)
}
// ════════════════════════════════════════ C. 语法下限
section('C. 构建产物语法下限（ES2015）')
{
  const banned = [
    ['可选链 ?.', /\?\.[a-zA-Z_[(]/],
    ['空值合并 ??', /\?\?/],
    ['Object.fromEntries', /Object\.fromEntries/],
    ['structuredClone', /structuredClone/],
    ['String.replaceAll', /\.replaceAll\(/],
    ['Array.prototype.at', /\.at\(-?\d/],
  ]
  for (const f of ['naruto-power.js', 'naruto-cli.cjs']) {
    const raw = readFileSync(join(DIST, f), 'utf8')
    // 去掉注释与字符串里的示例，避免注释里提到这些词就误报
    const code = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const hits = banned.filter(([, re]) => re.test(code)).map(([n]) => n)
    ok(f + ' 不含 ES2015 之后的语法', hits.length === 0, hits.join(', '))
  }
  // 语法能被 node 解析（基础健全性）
  for (const f of ['naruto-power.js', 'naruto-cli.cjs']) {
    const r = spawnSync(process.execPath, ['--check', join(DIST, f)], { encoding: 'utf8' })
    ok(f + ' 语法可被 node 解析', r.status === 0, (r.stderr || '').slice(0, 120))
  }
}

// ════════════════════════════════════════ D. 全局污染 / 重复加载
section('D. 全局与重复加载')
{
  // 清掉缓存，验证可重复 require 而不炸
  delete require.cache[require.resolve(join(DIST, 'naruto-power.js'))]
  const c2 = require(join(DIST, 'naruto-power.js'))
  ok('重复 require 不再炸', c2 && typeof c2.compute === 'function')
  ok('重复加载后版本号一致', c2.CORE_VERSION === CORE.CORE_VERSION)

  // UMD 应能把 API 挂到 globalThis（浏览器等价路径），且不覆盖别的东西
  const probe = spawnSync(
    process.execPath,
    [
      '-e',
      `const before = Object.keys(globalThis).length;
       const api = require(${JSON.stringify(join(DIST, 'naruto-power.js'))});
       const after = Object.keys(globalThis).length;
       console.log(JSON.stringify({ leaked: after - before, hasCompute: typeof api.compute }));
      `,
    ],
    { encoding: 'utf8' },
  )
  let info = null
  try {
    info = JSON.parse(probe.stdout.trim())
  } catch {
    /* noop */
  }
  ok('require 时不在 globalThis 上留垃圾', info && info.leaked <= 2, info ? 'leaked=' + info.leaked : probe.stderr.slice(0, 120))
  ok('核心 API 可正常取到', info && info.hasCompute === 'function')
}

// ════════════════════════════════════════ 汇总
console.log('\n' + '═'.repeat(58))
if (fails.length === 0) {
  console.log('健壮性测试：通过 ' + pass + ' 项，失败 0 项')
  console.log('全部通过 ✓')
} else {
  console.log('健壮性测试：通过 ' + pass + ' 项，失败 ' + fails.length + ' 项')
  for (const f of fails) console.log('  · ' + f)
  process.exitCode = 1
}
