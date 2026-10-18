/**
 * 极端输入压力测试（robustness.test.mjs 的加强版补充）
 * 目的：证明 fuzz 的"全绿"不是因为输入不够狠。
 */
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const CORE = require(join(resolve(__dirname, '..'), 'dist', 'naruto-power.js'))

let pass = 0
const fails = []
const ok = (n, c, e) => {
  if (c) { pass++; console.log('  ✓ ' + n) } else { fails.push(n + (e ? ' → ' + e : '')); console.log('  ✗ ' + n + (e ? ' → ' + e : '')) }
}
const section = (t) => console.log('\n── ' + t)

function bad(obj) {
  const out = []
  const seen = new Set()
  ;(function w(v, p) {
    if (v === null || v === undefined) return
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) out.push(p + '=' + v)
      else if (v < 0) out.push(p + '<0')
      return
    }
    if (typeof v !== 'object') return
    if (seen.has(v)) return
    seen.add(v)
    if (Array.isArray(v)) v.forEach((x, i) => w(x, p + '[' + i + ']'))
    else Object.keys(v).forEach((k) => w(v[k], p + '.' + k))
  })(obj, '$')
  return out
}

section('1. 数值边界')
{
  const cases = [
    ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
    ['MAX_VALUE', Number.MAX_VALUE],
    ['极小正数', Number.MIN_VALUE],
    ['-0', -0],
    ['1e308', 1e308],
    ['字符串 "1e308"', '1e308'],
    ['字符串 "0x10"', '0x10'],
    ['字符串 " 123 "', ' 123 '],
    ['字符串 "1,234,567"', '1,234,567'],
    ['字符串 "1.5.5"', '1.5.5'],
    ['字符串 "Infinity"', 'Infinity'],
    ['空字符串', ''],
    ['空格', '   '],
    ['中文数字', '一千'],
  ]
  let badCount = 0
  for (const [name, v] of cases) {
    const c = CORE.compute({ boards: { equipment: { hp: v, atk: v, def: v, crit: v, critResist: v, elemAtk: v, elemDef: v } } })
    const b = bad(c)
    if (b.length) {
      badCount++
      console.log('    ' + name + ' → ' + b.slice(0, 2).join('; '))
    }
  }
  ok('14 种极端数值均不产生坏数据', badCount === 0, badCount + ' 种有问题')
}

section('2. 结构攻击')
{
  const deep = (d) => {
    let o = { hp: 1000 }
    for (let i = 0; i < d; i++) o = { nest: o }
    return o
  }
  const cases = [
    ['100 层嵌套', { boards: { equipment: deep(100) } }],
    ['数组当属性对象', { boards: { equipment: [1, 2, 3] } }],
    ['数组当 boards', { boards: [{ hp: 1 }] }],
    ['函数当值', { boards: { equipment: { hp: () => 100 } } }],
    ['Date 当值', { boards: { equipment: { hp: new Date() } } }],
    ['Symbol 键',
      (() => {
        const o = { boards: {} }
        o.boards[Symbol('x')] = { hp: 1 }
        return o
      })()],
    ['__proto__ 污染', JSON.parse('{"boards":{"__proto__":{"hp":9999},"equipment":{"hp":1}}}')],
    ['constructor 污染', JSON.parse('{"boards":{"constructor":{"hp":9999},"equipment":{"hp":1}}}')],
    ['prototype 污染', { boards: { equipment: { hp: 1 }, prototype: { hp: 9999 } } }],
  ]
  let threw = null
  let badCount = 0
  for (const [name, input] of cases) {
    try {
      const c = CORE.compute(input)
      const b = bad(c)
      if (b.length) { badCount++; console.log('    ' + name + ' → ' + b.slice(0, 2).join('; ')) }
    } catch (e) {
      threw = name + ' → ' + e.message
      break
    }
  }
  ok('9 种结构攻击均不抛异常', threw === null, threw || '')
  ok('9 种结构攻击均不产生坏数据', badCount === 0, badCount + ' 种有问题')

  // 原型污染是否影响后续计算
  const polluted = CORE.compute({ boards: { equipment: { hp: 1 } } })
  ok('计算后 Object.prototype 未被污染', !Object.prototype.hp, String(Object.prototype.hp))
  ok('污染输入不会让后续计算异常', polluted.totalPower === 1, String(polluted.totalPower))
}

section('3. planTarget 极端参数')
{
  const cases = [
    ['目标为 0', { currentPower: 0, targetPower: 0 }],
    ['目标小于当前', { currentPower: 1e9, targetPower: 1 }],
    ['日收益 0', { currentPower: 0, targetPower: 1e6, incomePerDay: 0 }],
    ['日收益负', { currentPower: 0, targetPower: 1e6, incomePerDay: -5 }],
    ['日收益极小', { currentPower: 0, targetPower: 1e9, incomePerDay: 0.0001 }],
    ['缺口极大', { currentPower: 0, targetPower: 1e12, incomePerDay: 1 }],
    ['全部 NaN', { currentPower: NaN, targetPower: NaN, incomePerDay: NaN, level: NaN }],
    ['全部 null', { currentPower: null, targetPower: null, incomePerDay: null, level: null }],
    ['等级 999', { currentPower: 1, targetPower: 2, level: 999 }],
    ['等级 -1', { currentPower: 1, targetPower: 2, level: -1 }],
  ]
  let badCount = 0
  let threw = null
  for (const [name, args] of cases) {
    try {
      const r = CORE.planTarget(args)
      const b = bad({ r })
      if (b.length) { badCount++; console.log('    ' + name + ' → ' + b.slice(0, 2).join('; ')) }
      // 天数必须是 null 或有限正整数
      if (r.daysNeeded !== null && (!Number.isFinite(r.daysNeeded) || r.daysNeeded < 0)) {
        badCount++
        console.log('    ' + name + ' → daysNeeded=' + r.daysNeeded)
      }
    } catch (e) {
      threw = name + ' → ' + e.message
      break
    }
  }
  ok('10 种极端参数不抛异常', threw === null, threw || '')
  ok('10 种极端参数产出合法结果', badCount === 0, badCount + ' 种有问题')
}

section('4. 格式化函数边界')
{
  const cases = [0, 1, -1, 9999, 10000, 1e8, -1e8, 1e15, NaN, Infinity, null, undefined, 'abc']
  let badCount = 0
  for (const v of cases) {
    try {
      const s = CORE.fmtPower(v)
      if (typeof s !== 'string' || s.includes('NaN') || s.includes('Infinity') || s.includes('undefined')) {
        badCount++
        console.log('    fmtPower(' + v + ') → ' + s)
      }
      const pc = CORE.fmtPct(v)
      if (typeof pc !== 'string' || pc.includes('NaN') || pc.includes('Infinity')) {
        badCount++
        console.log('    fmtPct(' + v + ') → ' + pc)
      }
    } catch (e) {
      badCount++
      console.log('    ' + v + ' 抛错: ' + e.message)
    }
  }
  ok('13 种输入的 fmtPower/fmtPct 均返回干净字符串', badCount === 0, badCount + ' 个有问题')
}

console.log('\n' + '═'.repeat(58))
if (fails.length === 0) {
  console.log('极端输入测试：通过 ' + pass + ' 项，失败 0 项')
  console.log('全部通过 ✓')
} else {
  console.log('极端输入测试：通过 ' + pass + ' 项，失败 ' + fails.length + ' 项')
  for (const f of fails) console.log('  · ' + f)
  process.exitCode = 1
}
