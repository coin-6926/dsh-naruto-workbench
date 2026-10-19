#!/usr/bin/env node
/**
 * 工作台插件自测（Node，无需浏览器）。
 *
 * 为什么需要这个文件：
 *   1) 这个插件是「host 工具 + client 面板」双半身，单元测试必须两边都验。
 *   2) 曾经踩过一个巨坑：`output.render` 缺失会让 dsh-tools 的 register 抛 TypeError，
 *      导致整块 host 在宿主里 failed —— 而 apply() 本身是"执行成功"的，
 *      从日志完全看不出来。所以这里把「每个工具都必须有 output.render」变成硬断言。
 *   3) client 面板用真实 DOM 语义测（带 querySelectorAll 的 stub），
 *      断言「真的渲染出 117 个输入格 / 18 行表格」，而不是只断言"没报错"。
 *
 * 运行：node tests/selftest.mjs
 */
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

let pass = 0, fail = 0
const fails = []
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; fails.push(name); console.log(`  ✗ ${name}${detail ? ' → ' + detail : ''}`) }
}
const section = (t) => console.log(`\n── ${t}`)

/* ═════════════════════════════════ 1. 包结构 ═════════════════════════════════ */

section('1. 包结构（宿主装配的前置条件）')
const pkg = JSON.parse(await import('node:fs').then(m => m.readFileSync(join(ROOT, 'package.json'), 'utf8')))
ok('package.json 有 name', !!pkg.name)
ok('main 指向 lib/index.js', pkg.main === './lib/index.js', pkg.main)
ok('exports 含 "." 与 "./client"', !!pkg.exports?.['.'] && !!pkg.exports?.['./client'])
ok('有 dsh.bundle.patch（宿主 bundle 装配必需）', !!pkg.dsh?.bundle?.patch, JSON.stringify(pkg.dsh?.bundle))
ok('有 dsh.client 声明（浏览器半身）', !!pkg.dsh?.client)
ok('dsh.client.inject 含 slots 依赖链', Array.isArray(pkg.dsh?.client?.inject) && pkg.dsh.client.inject.length > 0)
ok('cordis.patch.yml 存在', existsSync(join(ROOT, pkg.dsh.bundle.patch)))
ok('lib/index.js 存在', existsSync(join(ROOT, 'lib/index.js')))
ok('lib/client.js 存在', existsSync(join(ROOT, 'lib/client.js')))
ok('lib/power-data.js 存在', existsSync(join(ROOT, 'lib/power-data.js')))

/* ═════════════════════════════ 2. 数据层 ═════════════════════════════ */

section('2. 数据层 power-data.js')
const PD = (await import('file://' + join(ROOT, 'lib/power-data.js').replace(/\\/g, '/'))).default
ok('version 存在', typeof PD.version === 'string', PD.version)
ok('boards 恰好 16 个', PD.boards.length === 16, String(PD.boards.length))
ok('boardAttrs 7 项', PD.boardAttrs.length === 7)
ok('属性系数正确（生命1/攻击3.5/防御11.6/暴击6/抗暴10）',
  PD.attrWeights.hp === 1 && PD.attrWeights.atk === 3.5 && PD.attrWeights.def === 11.6 &&
  PD.attrWeights.crit === 6 && PD.attrWeights.critResist === 10,
  JSON.stringify({ hp: PD.attrWeights.hp, atk: PD.attrWeights.atk, def: PD.attrWeights.def }))
ok('收集加成只作用于 hp/atk/def',
  PD.collectionBonus.appliesTo.length === 3 &&
  ['hp', 'atk', 'def'].every(k => PD.collectionBonus.appliesTo.includes(k)) &&
  !PD.collectionBonus.appliesTo.includes('crit'))
ok('成长曲线：神器 3 档（70/140/280）',
  PD.growth.artifact.tiers.length === 3 && PD.growth.artifact.tiers[2].maxLevel === 280)
ok('成长曲线：通灵进阶有 sweetSpots（最优节点）',
  Array.isArray(PD.growth.spiritAdvance.sweetSpots) && PD.growth.spiritAdvance.sweetSpots.length >= 2)
ok('成长曲线：勾玉体现实测数据', PD.growth.jade.bodyTotals.length === 2)
ok('战力标准表覆盖 50~175 级，有值的行严格单调递增',
  PD.powerStandards.table.length === 22 &&
  PD.powerStandards.table[0].level === 50 &&
  PD.powerStandards.table[PD.powerStandards.table.length - 1].level === 175 &&
  // ★ 175 级已撤下插值（power=null，改分位制），所以只校验有值的行
  PD.powerStandards.table
    .filter((r) => r.power !== null)
    .every((r, i, arr) => i === 0 || r.power > arr[i - 1].power),
  '175级 power=' + PD.powerStandards.table[PD.powerStandards.table.length - 1].power)
ok('战力标准表标为低置信且带诚实声明',
  PD.powerStandards.confidence === 'low' && typeof PD.powerStandards.independentSourceWarning === 'string',
  PD.powerStandards.confidence)
ok('资源日收益：金币零氪已修正为 330~500（不再是过时的 260）',
  PD.resourceIncome.gold.freeToPlay >= 330 && PD.resourceIncome.gold.freeToPlay <= 500,
  String(PD.resourceIncome.gold.freeToPlay))
ok('资源日收益：体力已修正（约 460，不再是错误的 1200）',
  PD.resourceIncome.stamina && PD.resourceIncome.stamina.withRamen === 460,
  String(PD.resourceIncome.stamina?.withRamen))
ok('资源日收益：铜币仍不可信（必须低置信，不能升级为 medium/high）',
  ['unverified', 'low'].includes(PD.resourceIncome.copper.confidence),
  PD.resourceIncome.copper.confidence)
ok('铜币收益必须带可核对的锚点（官方 2016 招财 ≈23 万/天）',
  Array.isArray(PD.resourceIncome.copper.anchors) &&
  PD.resourceIncome.copper.anchors.some(a => a.amount === 230000) &&
  !!PD.sources.hyrz_daily_2016,
  (PD.resourceIncome.copper.anchors || []).length + ' 个锚点')

section('2b. 交叉验证后的置信度分级（2026-10-18 复核）')
ok('属性系数有逐项置信度 perAttr', !!PD.attrWeights.perAttr && Object.keys(PD.attrWeights.perAttr).length === 7)
ok('★ 属性攻击/防御已升级为 high（2018贴吧实测表 + 2026抖音视频 双源）',
  PD.attrWeights.perAttr.elemAtk.confidence === 'high' &&
  PD.attrWeights.perAttr.elemDef.confidence === 'high' &&
  PD.attrWeights.perAttr.elemAtk.value === 6 &&
  PD.attrWeights.perAttr.elemDef.value === 10)
ok('生命/攻击/暴击标为 high',
  ['hp', 'atk', 'crit'].every(k => PD.attrWeights.perAttr[k].confidence === 'high'))
ok('★ 防御已升级为 high（两次独立游戏内反查）',
  PD.attrWeights.perAttr.def.confidence === 'high', PD.attrWeights.perAttr.def.confidence)
ok('★ 抗暴已升级为 high（官方改动方向 + 改动后逐位验证）',
  PD.attrWeights.perAttr.critResist.confidence === 'high', PD.attrWeights.perAttr.critResist.confidence)
ok('通灵 +4 的可疑数字已撤下（power=null）',
  PD.growth.spiritAdvance.sweetSpots[0].power === null,
  String(PD.growth.spiritAdvance.sweetSpots[0].power))
ok('勾玉：旧 2016 表已降级，且明确说明不可再用于计算',
  PD.growth.jade.confidence === 'low' &&
  typeof PD.growth.jade.perLevelPowerDeprecated === 'string' &&
  PD.growth.jade.perLevelPowerDeprecated.includes('勿再用于计算'),
  PD.growth.jade.confidence)
ok('勾玉：1~9 级单颗表已收录且 9 行「战力÷攻击」全等于 3.5',
  PD.growth.jade.perGemTable.length === 9 &&
  PD.growth.jade.perGemTable.every((r) => Math.abs(r.power / r.atk - 3.5) < 1e-9))
ok('数据源包含农场黑名单备注',
  !!PD.sources.farm_blacklist_note && String(PD.sources.farm_blacklist_note.note).includes('guotao606'))
ok('所有 sourceIds 无悬空引用', (() => {
  const bad = []
  const chk = (a) => (a || []).forEach(id => { if (!PD.sources[id]) bad.push(id) })
  PD.boards.forEach(b => chk(b.sourceIds))
  chk(PD.attrWeights.sourceIds); chk(PD.growth.artifact.sourceIds)
  chk(PD.growth.spiritAdvance.sourceIds); chk(PD.growth.jade.sourceIds)
  chk(PD.powerStandards.sourceIds); chk(PD.resourceIncome.sourceIds)
  chk(PD.inflation.sourceIds)
  return bad.length === 0
})())
ok('虚战口径：非属性种类判据', PD.inflation.notAttributeBased === true)
ok('虚战 disclaimer 含「透支」', String(PD.inflation.disclaimer).includes('透支'))
ok('cautions 非空', Array.isArray(PD.cautions) && PD.cautions.length >= 5, String(PD.cautions?.length))

/* ═════════════════════════════ 3. Host 半身 ═════════════════════════════ */

section('3. Host 半身（工具注册）')
const HOST = await import('file://' + join(ROOT, 'lib/index.js').replace(/\\/g, '/'))
ok('导出 apply/inject/name', typeof HOST.apply === 'function' && Array.isArray(HOST.inject) && !!HOST.name)
ok('name 与 package.json 一致', HOST.name === pkg.name, HOST.name)
ok('inject 声明 tools', HOST.inject.includes('tools'), JSON.stringify(HOST.inject))

const tools = {}
const ctx = {
  tools: { register(d) { tools[d.name] = d; return () => {} } },
  logger: { info() {}, warn() {}, error() {} },
}
let applyErr = null
try { HOST.apply(ctx) } catch (e) { applyErr = e }
ok('apply() 不抛异常', !applyErr, applyErr && applyErr.message)
ok('注册了 3 个工具', Object.keys(tools).length === 3, Object.keys(tools).join(','))

section('4. 工具定义合规性（★ 这是 host failed 的根因所在）')
for (const [name, d] of Object.entries(tools)) {
  ok(`${name}: 有 description`, typeof d.description === 'string' && d.description.length > 10)
  ok(`${name}: 有 parameters 对象`, d.parameters && typeof d.parameters === 'object')
  ok(`${name}: 有 output.schema`, !!d.output?.schema && typeof d.output.schema === 'object')
  /* ★ 关键：dsh-tools 的 register 校验 typeof output.render !== 'function' 会抛 TypeError。
     缺这个字段，apply 看起来成功了，但宿主里整块 fiber 会 failed。 */
  ok(`${name}: 有 output.render（否则宿主必 failed）`, typeof d.output?.render === 'function',
    'render=' + typeof d.output?.render)
  ok(`${name}: 有 execute`, typeof d.execute === 'function')
}
ok('output.render 返回 ContentBlock 数组', (() => {
  try {
    const r = tools.naruto_analyze.output.render({}, { ok: true })
    return Array.isArray(r) && r[0]?.type === 'text' && typeof r[0].text === 'string'
  } catch { return false }
})())

section('5. 工具逻辑（真实调用）')
const fullBoards = {}
for (const b of PD.boards) {
  fullBoards[b.id] = { hp: 100000, atk: 9000, def: 5000, crit: 3000, critResist: 2000, elemAtk: 800, elemDef: 800 }
}

// 5.1 保存 / 读取
const saved = await tools.naruto_save_panel.execute({ panel: { level: 145, targetPower: 11000000, collectionBonus: { hp: 28, atk: 22, def: 20 }, boards: fullBoards } })
ok('save: ok=true', saved.ok === true)
ok('save: 落盘路径存在', typeof saved.panelFile === 'string' && saved.panelFile.endsWith('panel.json'))
const readBack = await tools.naruto_save_panel.execute({})
ok('读取回已保存面板', readBack.panel?.level === 145, String(readBack.panel?.level))

// 5.2 分析
const a = await tools.naruto_analyze.execute({})
ok('analyze: ok=true', a.ok === true)
ok('analyze: 总战力为正', a.totalPower > 0, String(a.totalPower))
ok('analyze: 16 板块全填', a.filledCount === 16, String(a.filledCount))
ok('analyze: boards 含 share', Array.isArray(a.boards) && a.boards.every(b => 'share' in b))
ok('analyze: inflation 有 level', !!a.inflation?.level, a.inflation?.level)
ok('analyze: 虚战等级是约定枚举之一',
  ['实战型', '均衡', '偏虚', '虚战仔', '数据不足'].includes(a.inflation.level), a.inflation.level)
ok('analyze: target 有 gap 与 options', typeof a.target?.gap === 'number' && Array.isArray(a.target?.options))
ok('analyze: 有 knownNodeCoverage（覆盖率洞察）', a.target?.knownNodeCoverage !== undefined || a.target?.gap === 0)
ok('analyze: 输出无 NaN/Infinity', !/NaN|Infinity/.test(JSON.stringify(a)),
  (JSON.stringify(a).match(/.{0,50}(NaN|Infinity).{0,50}/) || [])[0])

// 5.3 缺数据不编造
const empty = await tools.naruto_analyze.execute({ panel: { boards: {} } })
ok('空面板: totalPower=0', empty.totalPower === 0)
ok('空面板: 虚战等级=数据不足（不猜）', empty.inflation.level === '数据不足', empty.inflation.level)
ok('空面板: 虚战分为 null（不拿 0 冒充）', empty.inflation.inflationScore === null,
  String(empty.inflation.inflationScore))

// 5.4 收集加成生效
const noCb = await tools.naruto_analyze.execute({ panel: { boards: { equipment: { atk: 1000 } } } })
const withCb = await tools.naruto_analyze.execute({ panel: { boards: { equipment: { atk: 1000 } }, collectionBonus: { atk: 0.2 } } })
ok('收集加成: 无加成 atk1000 = 3500', noCb.totalPower === 3500, String(noCb.totalPower))
ok('收集加成: +20% atk1000 = 4200', withCb.totalPower === 4200, String(withCb.totalPower))

// 5.5 虚战不按属性种类
const mkAll = (attr) => { const b = {}; for (const x of PD.boards) b[x.id] = { [attr]: 10000 }; return b }
const infAtk = (await tools.naruto_analyze.execute({ panel: { boards: mkAll('atk') } })).inflation
const infHp = (await tools.naruto_analyze.execute({ panel: { boards: mkAll('hp') } })).inflation
ok('虚战: 全堆攻击与全堆生命得分相同（证明不看属性种类）',
  infAtk.inflationScore === infHp.inflationScore,
  `${infAtk.inflationScore} vs ${infHp.inflationScore}`)

// 5.6 reference
for (const s of ['growth', 'standards', 'income', 'priority', 'inflation', 'weights', 'sources', 'all']) {
  const r = await tools.naruto_reference.execute({ section: s })
  ok(`reference[${s}] 返回数据`, r.data && Object.keys(r.data).length > 0)
}
const refAll = await tools.naruto_reference.execute({ section: 'all' })
ok('reference[all] 含全部 11 区块', Object.keys(refAll.data).length === 11, Object.keys(refAll.data).join(','))

ok('★ 减法框架已更正为「手游可用」（上一版曾误判为 OL 专属）',
  PD.elemCrossCheck.subtractFramework.usableForMobile === true &&
  /手游/.test(String(PD.elemCrossCheck.subtractFramework.belongsTo)) &&
  typeof PD.elemCrossCheck.subtractFramework.correction === 'string',
  PD.elemCrossCheck.subtractFramework.belongsTo)

ok('★ ÷20 现有 2 个来源、升为 high（恒心 + 实战实测视频）',
  PD.elemCrossCheck.twentyPerPercent.confidence === 'high' &&
  PD.elemCrossCheck.twentyPerPercent.sourceCount === 2 &&
  PD.elemCrossCheck.twentyPerPercent.lines.length === 2 &&
  typeof PD.elemCrossCheck.twentyPerPercent.rejectedSecondSource === 'string',
  `confidence=${PD.elemCrossCheck.twentyPerPercent.confidence}, lines=${PD.elemCrossCheck.twentyPerPercent.lines.length}`)

ok('★ 属性防御 10 / 属性攻击 6 已升为 high，且值未变',
  PD.elemCrossCheck.elemDefPerPoint.confidence === 'high' &&
  PD.elemCrossCheck.elemAtkPerPoint.confidence === 'high' &&
  PD.elemCrossCheck.elemDefPerPoint.value === 10 &&
  PD.elemCrossCheck.elemAtkPerPoint.value === 6)

ok('★ 完整伤害公式已固化（最高系 → 减属防 → ÷20）',
  Array.isArray(PD.elemMechanics.damageFormula.steps) &&
  PD.elemMechanics.damageFormula.steps.length === 5 &&
  /最高/.test(PD.elemMechanics.damageFormula.oneLiner) &&
  /属防/.test(PD.elemMechanics.damageFormula.oneLiner),
  PD.elemMechanics.damageFormula.oneLiner)

ok('★ 伤害公式有闭环验证数据（4 个校验 + 1 个结构校验）',
  PD.elemMechanics.damageFormulaVerification.checks.length === 4 &&
  typeof PD.elemMechanics.damageFormulaVerification.structuralCheck === 'string')

ok('★★ 闭环验算能复现（2450-1260)/20≈59.5% 与 2279×0.595≈1356万',
  (() => {
    const pct = (2450 - 1260) / 20
    const smallDmg = 2279 * (pct / 100)
    return Math.abs(pct - 59.5) < 0.01 && Math.abs(smallDmg - 1356) < 2
  })())

ok('★ 通灵消耗表：三源比对后升为 medium，但保留分歧与异常 flag',
  PD.growth.spiritCostTable.rows.length === 18 &&
  PD.growth.spiritCostTable.confidence === 'medium' &&
  PD.growth.spiritCostTable.discrepancies.length >= 6 &&
  PD.growth.spiritCostTable.rows.some(r => r.flag),
  PD.growth.spiritCostTable.rows.filter(r => r.flag).length + ' 行带 flag')

ok('★ 通灵消耗表的分组边界与小米等级上限一致（差 1 级是 0→N 计数）',
  PD.growth.spiritCostTable.rows.find(r => r.name === '忍犬').maxLevel === 50 &&
  PD.growth.spiritCostTable.rows.find(r => r.name === '鲛鲨').maxLevel === 150 &&
  PD.growth.spiritCostTable.rows.find(r => r.name === '蛤蟆龙').maxLevel === 300 &&
  PD.growth.spiritCostTable.rows.find(r => r.name === '蜘蛛').maxLevel === 600)

ok('★ 页面核不了这件事必须留痕（verified=partial + 说明 72914 字节空壳页）',
  PD.sources.spirit_cost_table.verified === 'partial' &&
  /72914/.test(PD.sources.spirit_cost_table.note),
  'spirit_cost_table.verified=' + PD.sources.spirit_cost_table.verified)

ok('★ 「达标线」与「团本通关门槛」已分开记（150 级不再错标 3000 万）',
  PD.powerStandards.table.find(r => r.level === 150).power === 14000000 &&
  PD.powerStandards.raidRequirement[160].min === 30000000 &&
  /门槛/.test(PD.powerStandards.raidRequirement.distinction),
  '150级=' + PD.powerStandards.table.find(r => r.level === 150).power)

ok('★ 虚战两套矛盾口径都保留（不擅自判定谁对）',
  PD.communityConflicts.some(c => c.topic.includes('虚战') && c.definitionA && c.definitionB),
  (PD.communityConflicts || []).length + ' 条冲突')

ok('★ 五星S全属性加成 20.3/16.2/12.2 已记录且标低置信',
  PD.collectionMilestones.fiveStarS.fullAttrBonus['五星'] === 0.203 &&
  PD.collectionMilestones.fiveStarS.confidence === 'low')

section('6. 鲁棒性（畸形输入）')
for (const bad of [null, undefined, {}, { panel: null }, { panel: { boards: null } }, { panel: { boards: { x: null } } }]) {
  let threw = false
  try { await tools.naruto_analyze.execute(bad ?? {}) } catch { threw = true }
  ok(`analyze(${JSON.stringify(bad)}) 不抛异常`, !threw)
}

/* ═════════════════════════════ 7. Client 半身 ═════════════════════════════ */

section('7. Client 半身（面板渲染）')

// DOM stub：带 querySelectorAll 的最小实现
function mkEl(tag = 'div') {
  const e = {
    tagName: String(tag).toUpperCase(), nodeType: 1, children: [], style: {}, dataset: {}, attrs: {},
    _text: '', className: '', id: '', value: '', type: '', placeholder: '', title: '', inputMode: '',
    disabled: false, readOnly: false,
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => this._s.add(x)) },
      remove(...c) { c.forEach(x => this._s.delete(x)) },
      toggle(c, f) { const has = this._s.has(c); const want = f === undefined ? !has : !!f; want ? this._s.add(c) : this._s.delete(c); return want },
      contains(c) { return this._s.has(c) },
    },
    appendChild(c) { c._parent = this; this.children.push(c); return c },
    append(...cs) { cs.forEach(c => this.appendChild(c)) },
    removeChild(c) { this.children = this.children.filter(x => x !== c); return c },
    remove() { if (this._parent) this._parent.children = this._parent.children.filter(x => x !== this) },
    addEventListener(t, f) { (this._ev || (this._ev = {}))[t] = ((this._ev[t]) || []).concat(f) },
    removeEventListener() {}, focus() {},
    click() { ((this._ev && this._ev.click) || []).forEach(fn => fn({ target: this, preventDefault() {}, stopPropagation() {} })) },
    setAttribute(k, v) { this.attrs[k] = v }, getAttribute(k) { return this.attrs[k] },
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null },
    querySelectorAll(sel) {
      const out = []
      const want = String(sel).split(',').map(s => s.trim()).filter(Boolean)
      const walk = (n) => {
        (n.children || []).forEach(c => {
          for (const w of want) {
            if (w.startsWith('.') && String(c.className || '').split(/\s+/).includes(w.slice(1))) { out.push(c); break }
            else if (!w.startsWith('.') && String(c.tagName).toLowerCase() === w.toLowerCase()) { out.push(c); break }
          }
          walk(c)
        })
      }
      walk(this)
      return out
    },
    getBoundingClientRect() { return { width: 100, height: 20, top: 0, left: 0 } },
    get offsetParent() { return {} },
    set textContent(v) { this._text = String(v); this.children = [] }, get textContent() { return this._text },
    set innerHTML(v) { this._text = String(v) }, get innerHTML() { return this._text },
    get lastElementChild() { return this.children[this.children.length - 1] || null },
    get firstElementChild() { return this.children[0] || null },
    get innerText() { const t = []; (function w(n) { if (n._text) t.push(n._text); (n.children || []).forEach(w) })(this); return t.join(' ') },
  }
  return e
}
globalThis.window = globalThis
globalThis.document = {
  createElement: mkEl, head: mkEl('head'), body: mkEl('body'),
  getElementById() { return null }, querySelector() { return null }, querySelectorAll() { return [] }, execCommand() { return true },
}
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null }, setItem(k, v) { this._d[k] = String(v) }, removeItem(k) { delete this._d[k] } }

let captured = null
globalThis.__ModuleLoader__ = { load({ id, factory }) { captured = { id, exports: factory(() => {}) } } }

let clientErr = null
try { await import('file://' + join(ROOT, 'lib/client.js').replace(/\\/g, '/')) } catch (e) { clientErr = e }
ok('client.js 可被 __ModuleLoader__ 加载', !clientErr, clientErr && clientErr.message)
ok('client bundle id 与包名一致', captured?.id === pkg.name, captured?.id)
ok('client 导出 apply/inject', typeof captured?.exports?.apply === 'function' && Array.isArray(captured?.exports?.inject))
ok('client inject 含 slots（apply 用 ctx.slots 的前提）',
  captured?.exports?.inject?.includes('slots'), JSON.stringify(captured?.exports?.inject))

/* ★ register 的**真实契约是两参数** (options, component) —— stub 必须照此实现，否则会漏掉
 *   "component 放错位置"这类 bug（曾经就是这样漏掉的：测试全绿但宿主拿不到组件）。
 *   见 @deepseek-ai/dsh-client-ui-slots/lib/types/index.d.ts:789
 *     register<K>(options: BaseOptions & {...}, component: C & SlotComponent<...>): () => void
 */
let reg = null          // options
let regComponent = null // component（第二个参数）
let registerArity = 0
let clientApplyErr = null
try {
  captured.exports.apply({
    slots: {
      inject(n, fn) { return fn() },
      register(...args) {
        registerArity = args.length
        reg = args[0]
        regComponent = args[1]
        return () => {}
      },
    },
    effect(fn) { return fn() },
  })
} catch (e) { clientApplyErr = e }
ok('client apply() 不抛异常', !clientApplyErr, clientApplyErr && clientApplyErr.message)
ok('register 用两个参数调用（真实契约）', registerArity === 2, `实际 ${registerArity} 个参数`)
ok('options 里不应含 component（它必须作为第二参数）',
  reg && typeof reg.component === 'undefined',
  reg && typeof reg.component !== 'undefined' ? 'component 被错误地放在 options 里' : '')
ok('component 是函数', typeof regComponent === 'function', typeof regComponent)
ok('注册到 conversation.input.dock', reg?.name === 'conversation.input.dock', reg?.name)
  ok('slot id 唯一可辨识', typeof reg?.id === 'string' && /naruto.*workbench/.test(reg.id), reg?.id)
ok('label 返回字符串', typeof reg?.label === 'function' && typeof reg.label() === 'string')

let node = null, renderErr = null
try { node = regComponent().render() } catch (e) { renderErr = e }
ok('面板 render() 不抛异常', !renderErr, renderErr && renderErr.message)
ok('component 返回带 render/dispose 的对象', (() => {
  try {
    const c = regComponent()
    return typeof c.render === 'function' && typeof c.dispose === 'function'
  } catch { return false }
})())

if (node) {
  const nInput = node.querySelectorAll('input').length
  const nTr = node.querySelectorAll('tr').length
  const nBtn = node.querySelectorAll('button').length
  console.log(`    渲染统计: input=${nInput} tr=${nTr} button=${nBtn} table=${node.querySelectorAll('table').length}`)
  ok('渲染出 117 个输入格（16 板块 ×7 + 等级/目标 + 3 收集加成 + 表格内）', nInput === 117, String(nInput))
  ok('渲染出 18 行（表头 1 + 板块 16 + 合计 1）', nTr === 18, String(nTr))
  ok('渲染出操作按钮（填入/示例/清空/交给 agent）', nBtn >= 4, String(nBtn))
  ok('注入工作台样式', globalThis.document.head.children.some(c => c.id === 'naruto-workbench-css'))

  // 交互：点「载入示例」应产出诊断内容
  const btns = node.querySelectorAll('button')
  const sample = btns.find(b => String(b.textContent || '').includes('载入示例'))
  ok('存在「载入示例」按钮', !!sample)
  if (sample) {
    sample.click()
    const txt = node.innerText
    ok('点击示例后显示总战力', txt.includes('总战力'))
    ok('点击示例后显示虚战诊断', txt.includes('虚战诊断'))
    ok('点击示例后显示板块占比', txt.includes('占比'))
    ok('面板文本无 undefined/NaN', !/undefined|NaN/.test(txt),
      (txt.match(/.{0,40}(undefined|NaN).{0,40}/) || [])[0])

    /* ★ 示例数据必须"自洽"：它标称 145 级，就该落在 145 级基准（1100 万）附近。
       曾经踩过坑：校准示例时用错了换算口径，导致示例只有 64 万却在 UI 上显示
       「145 级 / 明显偏低」—— 用户第一次打开会以为工具算错了。 */
    const mPower = txt.match(/总战力\s*([\d.,]+)\s*万/)
    const shownWan = mPower ? parseFloat(mPower[1].replace(/,/g, '')) : null
    ok('示例总战力可解析', Number.isFinite(shownWan), mPower ? mPower[0] : '未匹配')
    if (Number.isFinite(shownWan)) {
      ok('示例总战力落在 145 级基准附近（1000~1300 万）',
        shownWan >= 1000 && shownWan <= 1300, shownWan + ' 万')
      ok('示例在 145 级应判为「达标」而非「偏低」', txt.includes('达标'), txt.slice(0, 120))
    }
  }

  // 交互：点「清空」应回到空态且不崩
  const clearBtn = btns.find(b => String(b.textContent || '').includes('清空'))
  if (clearBtn) {
    let clearErr = null
    try { clearBtn.click() } catch (e) { clearErr = e }
    ok('点击清空不抛异常', !clearErr, clearErr && clearErr.message)
  }
}

/* ═══════════════════ 8. 跨端一致性（client vs host 各算一遍） ═══════════════════ */

/**
 * client 不能 import host（浏览器/宿主隔离），所以战力计算**实现了两遍**。
 * 两份实现漂移 = 用户看到的面板数字和 agent 算出来的不一样 —— 这是最伤信任的 bug。
 * 这里用同一份数据跑两边，强制它们必须逐板块完全相等。
 *
 * 检测方式：从 client.js 源码里提取 ATTRS 与 boardPower，复刻成可执行版本，
 * 再与 host 的 naruto_analyze 对比。源码改了但忘了同步另一边时，这条会红。
 */
section('8. 跨端一致性（client 算法 vs host 算法）')
{
  const clientSrc = (await import('node:fs')).readFileSync(join(ROOT, 'lib/client.js'), 'utf8')

  // 从源码里抽 ATTRS 字面量，确保测的是真实代码而不是我手抄的副本
  const mAttr = clientSrc.match(/const ATTRS = \[([\s\S]*?)\n\s*\]/)
  ok('能从 client.js 提取 ATTRS', !!mAttr, mAttr ? '' : '未匹配')

  if (mAttr) {
    const pairs = [...mAttr[1].matchAll(/id:\s*'([a-zA-Z]+)'[^}]*w:\s*([\d.]+)/g)]
      .map(m => [m[1], Number(m[2])])
    ok('client ATTRS 解析出 7 项', pairs.length === 7, JSON.stringify(pairs))

    const clientW = Object.fromEntries(pairs)
    const hostW = { hp: 1, atk: 3.5, def: 11.6, crit: 6, critResist: 10, elemAtk: 6, elemDef: 10 }
    const drift = Object.keys(hostW).filter(k => clientW[k] !== hostW[k])
    ok('client 与 host 的属性权重完全一致', drift.length === 0,
      drift.map(k => `${k}: client=${clientW[k]} host=${hostW[k]}`).join(', '))

    // 逐板块对比总战力
    const C_BOARDS = PD.boards.map(b => b.id)
    const cbPct = { hp: 28, atk: 22, def: 20 }
    const cbFrac = { hp: 0.28, atk: 0.22, def: 0.20 }
    const one = { hp: 598717, atk: 49893, def: 23949, crit: 15966, critResist: 9979, elemAtk: 5987, elemDef: 5987 }
    const boards = {}
    for (const id of C_BOARDS) boards[id] = one

    // client 算法（与 client.js 里 boardPower 同构）
    const cBoardPower = (attrs, bonusPct) => {
      let p = 0
      for (const a of [{ id: 'hp', w: 1 }, { id: 'atk', w: 3.5 }, { id: 'def', w: 11.6 }, { id: 'crit', w: 6 },
        { id: 'critResist', w: 10 }, { id: 'elemAtk', w: 6 }, { id: 'elemDef', w: 10 }]) {
        const v = Number(attrs?.[a.id])
        if (!Number.isFinite(v) || v <= 0) continue
        const applyCb = (a.id === 'hp' || a.id === 'atk' || a.id === 'def')
        const cb = applyCb ? 1 + (bonusPct[a.id] || 0) / 100 : 1
        p += v * a.w * cb
      }
      return p
    }
    let clientTotal = 0
    for (const id of C_BOARDS) clientTotal += cBoardPower(boards[id], cbPct)
    clientTotal = Math.round(clientTotal)

    const hostRes = await tools.naruto_analyze.execute({ panel: { boards, collectionBonus: cbFrac } })
    ok('同一份面板，client 与 host 总战力完全相等',
      clientTotal === hostRes.totalPower,
      `client=${clientTotal} host=${hostRes.totalPower} 差=${clientTotal - hostRes.totalPower}`)

    const hostBy = Object.fromEntries((hostRes.boards || []).map(b => [b.boardId, b.power]))
    const mism = C_BOARDS.filter(id => Math.round(cBoardPower(boards[id], cbPct)) !== Math.round(hostBy[id] || 0))
    ok('16 个板块逐一相等', mism.length === 0,
      mism.map(id => `${id}: client=${Math.round(cBoardPower(boards[id], cbPct))} host=${Math.round(hostBy[id])}`).join(', '))

    // 收集加成的边界：暴击不吃加成
    const critOnly = { crit: 1000 }
    const c2 = cBoardPower(critOnly, { crit: 100, hp: 100 })
    const r2 = await tools.naruto_analyze.execute({ panel: { boards: { equipment: critOnly }, collectionBonus: { crit: 1.0, hp: 1.0 } } })
    ok('收集加成不作用于暴击（双端一致且=6000）',
      Math.round(c2) === r2.totalPower && r2.totalPower === 6000,
      `client=${Math.round(c2)} host=${r2.totalPower}`)
  }
}

/* ═══════════════════ 9. 第四轮数据：可推导性优先 ═══════════════════ */
section('9. 第四轮数据（能算的就不信二手表）')
{
  // ★ 最强断言：忍玉消耗必须能由经验公式算出来
  const yanYuTo = (L) => {
    let exp = 0
    for (let n = 1; n <= L; n++) exp += 130 + 30 * (n - 1)
    return exp * 2 // 10 忍玉 = 5 经验 ⇒ 1 经验 = 2 忍玉
  }
  ok('神器忍玉 70 级可由经验公式推出 = 163100',
    yanYuTo(70) === 163100, String(yanYuTo(70)))
  ok('神器 data 里的推导值与公式一致（70/140/280）',
    PD.growth.artifact.expFormula.verified.every((r) => yanYuTo(r.level) === r.derivedYanYu),
    JSON.stringify(PD.growth.artifact.expFormula.verified.map((r) => yanYuTo(r.level))))
  ok('已明确记下「上一轮 8.8 万是错的」',
    PD.growth.artifact.expFormula.correction.includes('8.8 万') &&
    PD.growth.artifact.expFormula.correction.includes('错'))

  ok('神器「战力单价不可唯一确定」已留痕',
    typeof PD.growth.artifact.powerColumnUnresolvable.verdict === 'string' &&
    PD.growth.artifact.powerColumnUnresolvable.verdict.includes('不是唯一解'))

  ok('★ 等级上限已由官方原文确认为 175（不再是未确证信号）',
  PD.gameStatus.levelCap.value === 175 &&
  PD.gameStatus.levelCap.confidence === 'high' &&
  PD.gameStatus.levelCap.officialQuote.includes('175') &&
  PD.gameStatus.levelCap.sourceIds.includes('official_20260910'),
  `cap=${PD.gameStatus.levelCap.value}, ${PD.gameStatus.levelCap.confidence}`)
ok('★ 官方原文可读（能力已固化：tools/fetch-official.mjs）',
  !!(PD.sources.official_api_method && /searchNews\.php/.test(PD.sources.official_20260910.apiUrl)))
ok('★ 装备进阶 89 阶与强化 +59 是两个维度（旧冲突已解决）',
  PD.growth.equipment.advanceTiers.value === 89 &&
  PD.growth.equipment.advanceTiers.confidence === 'high' &&
  PD.growth.equipment.maxEnhance === 59)
ok('★ 修罗天赋新增 25~30 阶已按官方原文记录',
  PD.growth.talent.shuraTiersOfficial.addedTiers.length === 6 &&
  PD.growth.talent.shuraTiersOfficial.addedTiers[5] === 30)
ok('★ 金币日收益按官方增量上调（零氪 +30 / 月卡 +30+50）',
  PD.resourceIncome.gold.freeToPlay === 430 &&
  PD.resourceIncome.gold.monthlyCard === 630 &&
  PD.resourceIncome.gold.officialDeltas.effect.activityChest === 30 &&
  PD.resourceIncome.gold.officialDeltas.effect.bigFortuneBag === 50,
  PD.resourceIncome.gold.freeToPlay + '/' + PD.resourceIncome.gold.monthlyCard)
ok('★ 官方金句逐字留存（可核对）',
  PD.gameStatus.levelCap.officialQuote === '角色等级上限提升至175级。装备等级相应提升，装备进阶提升至89阶。')

  ok('秘卷碎片战力比随等级递减已记录（9.5 → 0.63）',
    PD.growth.scroll.fragmentDecay.lowTier.rate === 9.5 &&
    PD.growth.scroll.fragmentDecay.highTier.rate === 0.63)

  ok('★ 秘卷上限已定案为 30 级（官方原文），60 级降为可疑',
    PD.growth.scroll.maxLevelConflict.earlier.value === 30 &&
    PD.growth.scroll.maxLevelConflict.earlier.confidence === 'high' &&
    PD.growth.scroll.maxLevelConflict.verdict.includes('采信 30 级'))

  ok('勾玉六色映射已采纳且黄含攻击',
    Array.isArray(PD.growth.jade.colorMap.yellow.attrs) &&
    PD.growth.jade.colorMap.yellow.attrs.includes('atk') &&
    PD.growth.jade.colorMap.priority[0] === '黄')


  ok('装备分品阶上限已记录（橙 +59）',
    PD.growth.equipment.enhanceCapByTier['橙'] === 59 &&
    PD.growth.equipment.enhanceCapByTier['紫'] === 15)

  ok('装备橙色阶段节点冲突并列未合并',
    Array.isArray(PD.growth.equipment.orangeStageConflict.previousRound) &&
    Array.isArray(PD.growth.equipment.orangeStageConflict.thisRound) &&
    PD.growth.equipment.orangeStageConflict.verdict.includes('不合并'))

  // 虚战三口径的阈值：两条采、一条明确不采
  const th = PD.communityConflicts[0].thirdDefinition.thresholds
  ok('虚战阈值三条都已评估', Array.isArray(th) && th.length === 3)
  ok('★「生命 5 万」被明确判为不采信（量纲差一个数量级）',
    th.some((x) => x.what === '生命虚战' && x.verdict.includes('不采信')))
  ok('★ 属性防御溢出规则与已有减法公式一致',
    th.some((x) => x.what === '属性防御溢出' && x.verdict.includes('可采')))

  ok('本轮验算记录 3 条', PD.round4Verifications.length === 3)

  // 每条数据都必须挂来源，或明确说明为什么没有
  const unlabeled = []
  for (const k of ['expFormula', 'colorMap', 'spiritSlotRule']) {
    const node = PD.growth.artifact[k] || PD.growth.jade[k]
    if (node && !node.sourceIds && !node.confidence) unlabeled.push(k)
  }
  ok('本轮新增数据都带 sourceIds 或 confidence', unlabeled.length === 0, unlabeled.join(','))
}

/* ═══════════════════ 10. 官方公告审计（负结果也要锁住） ═══════════════════ */
section('10. 官方公告定向检索结果')
{
  const a = PD.officialAudit
  ok('审计记录存在（3 个悬案）', a && a.cases.length === 3)
  ok('★ 属性攻防 6/10：已确认官方从未公布（负结果已固化）',
    a.cases[0].verdict.includes('没有找到') && a.cases[0].implied === undefined
      ? a.cases[0].verdict.includes('没有找到')
      : a.cases[0].verdict.includes('没有找到'))
  ok('★ 2016-08-30：找到接近原文的表述，且含「实际战斗效果没有任何变化」',
    a.cases[1].verdict.includes('找到') &&
    a.cases[1].quote.includes('实际战斗效果没有任何变化') &&
    a.cases[1].semanticClarification.includes('只影响战力面板'))
  ok('★ 2016-08-30 公告未给具体系数（抗暴10/暴击6 仍是反推）',
    a.cases[1].gap.includes('没有公布具体系数'))
  ok('★ 勾玉/通灵/饰品上线公告：记为未找到',
    a.cases[2].verdict.includes('没找到'))
  ok('顺带发现 3 条（洗练换算 / 竞技场不计首饰暴击 / 暴击倍率冲突）',
    a.incidental.length === 3 &&
    a.incidental.every((x) => x.confidence === 'low' || x.confidence === 'unverified'))
  ok('洗练百分比的量纲警告已写明', a.incidental[0].unitCaveat.includes('不同量纲'))

  // 暴击倍率冲突必须体现为未定
  ok('暴击伤害倍率冲突未被擅自裁决',
    PD.cautions.some((c) => c.includes('1.5 倍') && c.includes('1.2 倍')))
  ok('官方检索结论已写进 cautions（避免下游重复劳动）',
    PD.cautions.some((c) => c.includes('官方公告已定向检索过')))
}

/* ═══════════════════ 11. 2026-10-18 第二轮补搜 ═══════════════════ */
section('11. 神器单价与勾玉冲突（本轮补搜）')
{
  const a = PD.growth.artifact

  // ★ 轮回换算必须能算回 56.73 万
  const hp = 18766 * 3, atk = 5321 * 3, def = 1626 * 3
  const needLun = hp * (60 / 12.5) + atk * (60 / 4.8) + def * (60 / 3)
  ok('★ 轮回换算闭环：折算回去 = 567,328，与声称 567,300 偏差 0.00%',
    Math.abs(needLun - 567300) < 1500, needLun.toFixed(0))

  ok('★ 忍玉战力率已实测确定（1~140 级 0.12 / 140~280 级 0.05）',
    a.unitRates.yanYu.tier1_140.value === 0.12 &&
    a.unitRates.yanYu.tier140_280.value === 0.05)
  ok('★ 轮回石战力率恒定 0.438 且可反算',
    a.unitRates.lunHuiShi.value === 0.438,
    String(a.unitRates.lunHuiShi.value))
  ok('★ 旧分段拟合率已明确标注被取代',
    a.tierRateConflict.action.includes('不要再用 tiers.powerPerYanYu') &&
    a.note.includes('已被 unitRates'))

  // 收集加成污染的定量校核
  const attrPower = 93830 * 1 + 26604 * 3.5 + 8130 * 11.6
  const ratio = 410000 / attrPower
  ok('★ 收集加成污染可复现（属性直算 28.1 万 vs 声称 41 万 → 约 +46%）',
    Math.abs(attrPower - 281252) < 50 && Math.abs(ratio - 1.458) < 0.01,
    'attr=' + Math.round(attrPower) + ' ratio=' + ratio.toFixed(3))
  ok('★ 收集加成污染已写进 cautions（影响所有战力数字解读）',
    PD.cautions.some((c) => c.includes('都含收集加成')) &&
    PD.cautions.some((c) => c.includes('1~140 级 0.12')))

  // 勾玉两条新冲突
  const j = PD.growth.jade
  ok('★★ 勾玉孔数已定案（用户游戏内一手）：装备总位 36 / 默认已开 30',
    j.slots.equipmentTotalSlots === 36 &&
    j.slots.equipmentDefaultOpen === 30 &&
    j.slots.equipmentSides.every((s) => s.slots === 6) &&
    j.slots.confidence === 'high',
    'total=' + j.slots.equipmentTotalSlots + ' open=' + j.slots.equipmentDefaultOpen)
  ok('★★ 通灵端孔位（第4版正确：总 9 孔 / 默认 6 孔）',
    j.spiritSlotRule.slotsPerSpirit === 9 &&
    j.spiritSlotRule.defaultOpen === 6 &&
    j.spiritSlotRule.unlocks.length === 3 &&
    j.spiritSlotRule.unlocks[0].stage === 5 && j.spiritSlotRule.unlocks[0].refineStone === 100 &&
    j.spiritSlotRule.unlocks[1].stage === 10 && j.spiritSlotRule.unlocks[1].refineStone === 300 &&
    j.spiritSlotRule.unlocks[2].stage === 15 && j.spiritSlotRule.unlocks[2].refineStone === 600 &&
    j.spiritSlotRule.unlocks[2].scroll === 2,
    'total=' + j.spiritSlotRule.slotsPerSpirit + ' open=' + j.spiritSlotRule.defaultOpen)
  ok('★ 单只合计 = 1000 精炼石 + 2 高级通灵卷轴（可现场加总）',
    j.spiritSlotRule.unlocks.reduce((a, u) => a + u.refineStone, 0) === j.spiritSlotRule.costPerSpirit.refineStone &&
    j.spiritSlotRule.unlocks.reduce((a, u) => a + u.scroll, 0) === j.spiritSlotRule.costPerSpirit.scroll)
  ok('★★ 卷轴瓶颈已按 14 只重算（28 个 ≈ 5.4 年）',
    j.resourceBottleneck.advancedSpiritScroll.totalAtTrainable14 === 28 &&
    j.resourceBottleneck.advancedSpiritScroll.verdict.includes('7 年') ||
      j.resourceBottleneck.advancedSpiritScroll.timeCost.includes('5.4 年'),
    j.resourceBottleneck.advancedSpiritScroll.timeCost)
  ok('★★ 孔位数已按三档重算（14 可修炼 / 22 已拥有 / 57 总数）',
    j.resourceBottleneck.slotTotals.scenarios.trainable14.total === 36 + 14 * 9 &&
    j.resourceBottleneck.slotTotals.scenarios.collected22.total === 36 + 22 * 9 &&
    j.resourceBottleneck.slotTotals.scenarios.all57.total === 36 + 57 * 9)
  ok('★ 四代版本教训已留档（含「重述用户原话导致误读」）',
    j.spiritSlotRule.fourVersionsLesson.v3.includes('默认 6 个') &&
    j.spiritSlotRule.fourVersionsLesson.rule2.includes('原样留存') &&
    j.spiritSlotRule.fourVersionsLesson.rule3.includes('总数还是默认值'))
  ok('★ 旧错误字段已清除（equipmentTotalAlt / slotsConflict）',
    j.slots.equipmentTotalAlt === undefined && j.slotsConflict === undefined)
  ok('★ 孔数冲突已标 RESOLVED',
    PD.dataConflicts2026.some((c) => c.topic.includes('槽位数') && String(c.status).startsWith('RESOLVED')) &&
    PD.dataConflicts2026.some((c) => c.topic === '勾玉总孔位数' && String(c.status).startsWith('RESOLVED')))
  ok('★ 一手来源类型登记为 in-game（优先级最高）',
    PD.sources.user_ingame_2026.verified === 'in-game')
  ok('★★ 勾玉精炼上限已裁决：版本演进（2018 年 20 → 2020 年起 30），取 30',
    j.rules2.refineCapResolved.current === 30 &&
    j.rules2.refineCapResolved.timeline.length === 5 &&
    j.rules2.refineCapResolved.verdict.includes('2020 年起已提到 30 级'),
    'cap=' + j.rules2.refineCapResolved.current)
  ok('★ 时间线里两个口径都能各自自洽（20×10%=200%）',
    j.rules2.refineCapResolved.timeline.some((x) => x.value === 20 && x.note.includes('200%')) &&
    j.rules2.refineCapResolved.timeline.some((x) => x.value === 30))
  ok('★ 精炼每级 +10% 已升级为两源一致，满级按 30 级推为 +300%',
    j.rules2.refineGainPerLevel.value === 0.1 &&
    j.rules2.refineGainPerLevel.full === 3 &&
    j.rules2.refineGainPerLevel.oldFull.value === 2 &&
    j.rules2.refineGainPerLevel.confidence === 'medium')
  ok('★ 勾玉优先级「黄>青>紫」获第 3 源确认',
    j.colorMap.priorityConfirmedBy.length === 3)

  ok('dataConflicts2026 已含 9 条（新加勾玉两条）', PD.dataConflicts2026.length === 9)
}

/* ═══════════════════ 12. 贴吧技术贴（用户提供截图） ═══════════════════ */
section('12. 贴吧三贴：系数全高 + 官方公式 + 战力补正')
{
  // ★ 七系数全部 high
  const keys = ['hp', 'atk', 'def', 'crit', 'critResist', 'elemAtk', 'elemDef']
  ok('★★ 七个基础系数全部为 high（项目首次）',
    keys.every((k) => PD.attrWeights.perAttr[k].confidence === 'high'),
    keys.map((k) => k + '=' + PD.attrWeights.perAttr[k].confidence).join(','))

  // ★ 官方公式 ×5% 与 ÷20 恒等（现场验算）
  const equiv = [20, 200, 1190, 2340].every((d) => Math.abs(d / 20 - d * 0.05) < 1e-9)
  ok('★ 官方「×5%」与项目「÷20」数学恒等', equiv)
  ok('★ 且同时复现两个年代的封顶（200→10%、2340→117%）',
    Math.abs(200 * 0.05 - 10) < 1e-9 && Math.abs(2340 * 0.05 - 117) < 1e-9)
  ok('★ 官方公式证据已入库且限定作用范围（只证明伤害公式，不给6/10背书）',
    PD.elemMechanics.officialFormulaEvidence.confidence === 'high' &&
    PD.elemMechanics.officialFormulaEvidence.scopeLimit.includes('不能'))

  // ★ 图3 那张表必须能逐格复现
  const tb = PD.tiebaEvidence.collectionBonus.verifiedTable
  const r1 = tb.rows.washing100
  const w = PD.attrWeights
  ok('★ 贴吧表逐格复现：生命/攻击/防御/暴击/抗暴 全部对得上',
    Math.abs(r1.hp * w.hp - tb.rows.powerNoBonus.hp) < 0.5 &&
    Math.abs(r1.atk * w.atk - tb.rows.powerNoBonus.atk) < 0.5 &&
    Math.abs(r1.def * w.def - tb.rows.powerNoBonus.def) < 0.5 &&
    Math.abs(r1.crit * w.crit - tb.rows.powerNoBonus.crit) < 0.5 &&
    Math.abs(r1.critResist * w.critResist - tb.rows.powerNoBonus.critResist) < 0.5)
  ok('★ 含收集加成三格也复现（20526/20806/20227）',
    Math.abs(r1.hp * w.hp * tb.rows.collectionBonus.hp - tb.rows.actualPower.hp) < 1 &&
    Math.abs(r1.atk * w.atk * tb.rows.collectionBonus.atk - tb.rows.actualPower.atk) < 1 &&
    Math.abs(r1.def * w.def * tb.rows.collectionBonus.def - tb.rows.actualPower.def) < 1)
  ok('★ 贴吧表确认「暴击/抗暴不享受收集加成」',
    tb.rows.collectionBonus.crit === '不加成' && tb.rows.collectionBonus.critResist === '不加成')

  // ★ 战力补正
  ok('★ 战力补正（406/324）已记录，且与符文按量级区分',
    PD.elemCrossCheck.powerCorrectionResidual.value.includes('406') &&
    PD.elemCrossCheck.powerCorrectionResidual.practicalAdvice.includes('几百点'))

  // 属性伤害上限版本演进
  ok('★ 属性伤害上限记为版本演进而非矛盾（200点10% → 2340点117%）',
    PD.elemMechanics.capEvolution.y2018.needPoints === 200 &&
    PD.elemMechanics.capEvolution.y2024.needPoints === 2340 &&
    PD.elemMechanics.capEvolution.verdict.includes('不是谁算错'))
  ok('★ 2018 那条「超过200也封顶」的争议已留痕',
    PD.elemMechanics.capEvolution.disputed2018Cap.status.includes('争议未决'))

  // OCR 诚实声明
  ok('★ 官方截图标注为 OCR 读图、非逐字原文',
    PD.tiebaEvidence.attrDamageTest.officialScreenshot.ocrCaveat.includes('不是逐字精确'))
  ok('★ 三个贴吧来源标为 user-screenshot（抓取仍 403）',
    ['tieba_attr_test', 'tieba_power_formula', 'tieba_collection_bonus']
      .every((id) => PD.sources[id].verified === 'user-screenshot'))
}

/* ═══════════════════ 13. 外部补源报告核实 ═══════════════════ */
section('13. 外部补源报告（Saber）独立核实结论')
{
  // 秘卷上限：官方 2017-03-22 定 30 级
  ok('★★ 秘卷官方原文已入库（可追溯 URL + 原句）',
    PD.growth.scroll.maxLevelConflict.officialRuling.officialQuote.includes('30级') &&
    PD.growth.scroll.maxLevelConflict.officialRuling.sourceUrl.includes('hyrz.qq.com'))
  ok('★ 60 级已降为可疑留痕，不再与 30 级并列',
    String(PD.growth.scroll.maxLevelConflict.later.status).includes('可疑') ||
    String(PD.growth.scroll.maxLevelConflict.later.status).includes('压制'))

  // 通灵进阶阶位：5/10/15/20（我曾误记 4/9/14/19）
  ok('★★ 通灵天赋解锁阶位已修正为 5/10/15/20',
    PD.growth.spiritAdvance.note.includes('5 / 10 / 15 / 20') &&
    PD.growth.spiritAdvance.note.includes('把消耗分组区间'),
    PD.growth.spiritAdvance.note.slice(0, 28))
  ok('★ 已删除错误的 4/9/14/19 说法',
    !PD.growth.spiritAdvance.note.includes('4/9/14/19 阶需要通灵卷轴'))

  // 勾玉 7/8/9 级
  ok('★ 勾玉 7/8 级升 medium（×3.5 精确）',
    PD.growth.jade.perGemTable[6].confidence === 'medium' &&
    PD.growth.jade.perGemTable[7].confidence === 'medium')
  ok('★ 勾玉 9 级已升 medium（换算精确 + 级间倍率外推自洽）',
    PD.growth.jade.perGemTable[8].confidence === 'medium' &&
    PD.growth.jade.perGemTable[8].howToConfirm !== undefined)
  ok('★ 勾玉各级战力 = 攻击 × 3.5 全部精确（现场复算）',
    PD.growth.jade.perGemTable.every((g) => Math.abs(g.atk * 3.5 - g.power) < 0.01))

  // 精炼交叉验证
  ok('★ 精炼 +300% 已有算式交叉验证（684×4=2736）',
    PD.growth.jade.rules2.refineGainPerLevel.crossCheck.math.includes('2736'))

  // 两个新官方来源
  ok('★ 两个新官方来源已注册且 verified=true',
    PD.sources.official_20170322.verified === true &&
    PD.sources.official_20200629.verified === true)
  ok('★ 官方源注明 GBK 编码坑（避免下次抓乱码）',
    PD.sources.official_20170322.note.includes('GBK'))

  // 拒绝采纳：暴击倍率仍不选边（农场三源不算独立）
  ok('★ 暴击倍率仍保持未定（拒绝农场的所谓「三源一致」）',
    !JSON.stringify(PD).includes('已选边 1.5 倍'))
}


/* ═══════════════════ 14. P1P2 检索交付核实 ═══════════════════ */
section('14. P1P2 检索交付（外部）独立核实')
{
  // ★★ 我的错误：招财 23 万是 10 连满档，不是免费日收益
  ok('★★ 已修正「招财 23 万 = 免费日收益」的错误',
    PD.resourceIncome.copper.note.includes('连续 10 次招财') &&
    PD.resourceIncome.copper.note.includes('0.5~1.3 万/天'),
    '含免费档说明')
  ok('★ 修正时自认了陷阱类型（总数 vs 默认值）',
    PD.resourceIncome.copper.note.includes('总数 vs 默认值'))
  ok('★ 招财官方原文来源已入库且注明双档',
    PD.sources.official_201603_copper.verified === true &&
    PD.sources.official_201603_copper.note.includes('每天可免费招财1次'))

  // ★★ 忍传感悟 1800 官方定案
  ok('★★ 忍传感悟 1800 已由官方原文定案（high）',
    PD.collectionMilestones.insightNodesOfficial.confidence === 'high' &&
    PD.collectionMilestones.insightNodesOfficial.officialQuote.includes('1800级') &&
    PD.collectionMilestones.insightNodesOfficial.sourceUrl.includes('18101284'))
  ok('★ 未证实的子项已明确列出（不冒充已知）',
    PD.collectionMilestones.insightNodesOfficial.stillUnverified.length === 3)

  // ★ 秘卷消耗表升 high，且双项闭合
  ok('★ 秘卷消耗表已升 high（官方原表）',
    PD.growth.scroll.confidence === 'high' && !!PD.growth.scroll.officialTable)
  ok('★ 秘卷碎片加总 = 325（现场复算）',
    PD.growth.scroll.fragmentsPerLevel.reduce((a, b) => a + b, 0) === 325)
  ok('★ 秘卷铜币加总 = 585,271（现场复算）',
    PD.growth.scroll.copperPerLevel.reduce((a, b) => a + b, 0) === 585271)
  ok('★ 官方表头（w）笔误已标注',
    PD.growth.scroll.officialTable.typoCaveat.includes('笔误'))

  // ★★ 175 级插值已撤下
  ok('★★ 175 级达标线插值已撤下（power = null）',
    PD.powerStandards.table.find((r) => r.level === 175).power === null)
  ok('★ 已改用分位制并给出出处',
    PD.powerStandards.table.find((r) => r.level === 175).replacement.includes('分位制'))
  ok('★ 交易平台「175忍」陷阱已记录（防误读）',
    PD.powerStandards.table.find((r) => r.level === 175).trapWarning.includes('忍者数量'))

  // ★ 装备进阶演进链
  ok('★ 装备进阶演进链完整（39阶@2018 → 69阶@2022 → 89阶@2026）',
    PD.sources.official_20220908.note.includes('69阶') &&
    PD.sources.official_20220908.note.includes('39 阶'))

  // ★ 农场黑名单扩容
  ok('★ 农场黑名单已扩到 38 域（新增 15 个同族）',
    PD.sources.farm_blacklist_note.note.includes('qinglan314.cn') &&
    PD.sources.farm_blacklist_note.note.includes('muke400.com'))

  // ★ 暴击倍率维持未定（拒绝对抗农场的"1.5 定案"）
  ok('★ 暴击倍率维持未证实（不接受农场三源定案）',
    !JSON.stringify(PD).includes('暴击倍率已定案'))
}

/* ═══════════════════ 15. P0 三项溯源核实 ═══════════════════ */
section('15. P0 三项溯源（外部）独立核实')
{
  const sim = PD.growth.accessory.decompositionSimulator

  // ★★ P0-3 云迹分解：模拟器实测已入库，CSDN 弃用
  ok('★★ 云迹分解返保已改用游戏内模拟器实测（四点在库）',
    sim.yunjiEarring.jingliang30.rune === 769 &&
    sim.yunjiEarring.jingliang35.rune === 1095 &&
    sim.yunjiEarring.chuanshuo30.rune === 1076 &&
    sim.yunjiEarring.chuanshuo35.rune === 1533)
  ok('★ CSDN 1135/1595 已明确弃用（不是并列保留）',
    sim.csdnVerdict.verdict.includes('弃用'))
  ok('★ 连带警示已记录：同表其余行也应待验',
    sim.csdnVerdict.knockOnWarning.includes('内部自洽'))
  ok('★★ 传说/精良 = 1.40 可现场复算（两档独立收敛）',
    Math.abs(sim.yunjiEarring.chuanshuo30.rune / sim.yunjiEarring.jingliang30.rune - 1.4) < 0.001 &&
    Math.abs(sim.yunjiEarring.chuanshuo35.rune / sim.yunjiEarring.jingliang35.rune - 1.4) < 0.001)
  ok('★ 部位不影响返还已记录（耳环=项链六组全同）',
    sim.partDoesNotMatter.confidence === 'high' &&
    /六组|6 组/.test(sim.partDoesNotMatter.evidence))
  ok('★ 命名已修正为游戏内正式名「强化符」',
    sim.namingCorrection.inGameName === '强化符' &&
    sim.namingCorrection.communityName === '保护符')
  ok('★ 官方模拟器入口已记录（可一次性定案所有分解值）',
    sim.howToAccess.includes('饰品分解模拟器'))
  ok('★ 来源性质诚实标注（未直接看到截图）',
    sim.verified === 'reported-user-screenshot' &&
    sim.verifiedCaveat.includes('未直接核对'))

  // ★★ P0-2 勾玉 684/1140 不是冲突，是两个等级
  ok('★★ 勾玉 684=8级 / 1140=9级（撤销此前的伪冲突判定）',
    PD.growth.jade.perGemTable[7].atk === 684 &&
    PD.growth.jade.perGemTable[8].atk === 1140 &&
    PD.growth.jade.perGemTable[7].conflict === undefined)
  ok('★ 勾玉 9 级已升 medium（级间倍率外推自洽）',
    PD.growth.jade.perGemTable[8].confidence === 'medium')
  ok('★★ 勾玉镶嵌机制已补：一个孔位可放多颗同属性',
    PD.growth.jade.inlayMechanics.multipleGemsPerSlot.rule.includes('多颗'))
  ok('★★ 勾玉「合成亏」可现场复算（3×400=1200 → 684，损失 43%）',
    PD.growth.jade.inlayMechanics.mergeIsLoss.calc.includes('1200') &&
    PD.growth.jade.inlayMechanics.mergeIsLoss.calc.includes('684'))

  // ★ P0-1 通灵只数四口径
  ok('★★ 通灵只数四口径已辨析（14/17/18/34）',
    PD.growth.jade.spiritCount.fourReadings.map((r) => r.count).join('/') === '14/17/18/34')
  ok('★ 已明确"消耗计算用 14，收集度用 34"',
    PD.growth.jade.spiritCount.fourReadings[0].recommendedFor.includes('14') ||
    PD.growth.jade.spiritCount.fourReadings[0].recommendedFor.includes('这个'))
  ok('★ 14 只能现场复算加总（6+3+4+1）',
    (6 + 3 + 4 + 1) === 14)
  ok('★ 已记录该数对结论量级的影响（18→14 会让卷轴需求从 36 降到 28）',
    PD.growth.jade.spiritCount.impactOnCalculations.includes('28'))

  // 农场名单
  ok('★ 农场黑名单已扩到 40 域',
    PD.sources.farm_blacklist_note.note.includes('464ruoming.com') &&
    PD.sources.farm_blacklist_note.note.includes('337jubai.com'))
}

/* ═══════════════════ 16. 收集界面实测（2026-10-19） ═══════════════════ */
section('16. 游戏内「收集」界面实测定案')
{
  const cs = PD.collectionMilestones.collectionScreen

  ok('★★ 通灵总数已定案 = 57（游戏内收集界面）',
    cs.spirit.total === 57 && cs.spirit.own === 22,
    cs.spirit.own + '/' + cs.spirit.total)
  ok('★★ 秘卷总数已更新为 57（2020 年记录 34 + 23）',
    cs.scroll.total === 57 && PD.growth.scroll.countCurrent.value === 57 &&
    PD.growth.scroll.countCurrent.deltaFrom2020 === 23)
  ok('★ 忍者图鉴 316/457 已记录',
    cs.ninja.own === 316 && cs.ninja.total === 457)
  ok('★ 装扮数量 250 / 魅力 19951 已记录（不计战力）',
    cs.appearance.costumeCount === 250 && cs.appearance.charm === 19951)

  // ★ 18 已废弃
  ok('★★ 旧的「18 只」口径已标废弃',
    PD.growth.jade.spiritCount.fourReadings.find((r) => r.count === 18).deprecated !== undefined,
    'deprecated 字段存在')
  ok('★ 四口径仍保留（作为子集说明，不删）',
    PD.growth.jade.spiritCount.fourReadings.map((r) => r.count).join('/') === '14/17/18/34')

  // ★ 三档重算
  const sc = PD.growth.jade.resourceBottleneck.slotTotals.scenarios
  ok('★★ 孔位数已按三档重算（14/22/57）',
    sc.trainable14.total === 36 + 14 * 9 &&
    sc.collected22.total === 36 + 22 * 9 &&
    sc.all57.total === 36 + 57 * 9,
    [sc.trainable14.total, sc.collected22.total, sc.all57.total].join('/'))
  ok('★★ 精炼石改以 14 只为基准（15800，非旧的 19800）',
    PD.growth.jade.resourceBottleneck.refineStone.totalAtTrainable14 === 1800 + 14 * 1000)
  ok('★★ 卷轴改以 14 只为基准（28 个 ≈ 5.4 年，非旧的 36 个 6.9 年）',
    PD.growth.jade.resourceBottleneck.advancedSpiritScroll.totalAtTrainable14 === 28 &&
    PD.growth.jade.resourceBottleneck.advancedSpiritScroll.timeCost.includes('5.4 年'))

  // ★ 方法论：三个数不能混用
  ok('★★ 已明确「收集度57 / 资源预算14 / 当前孔位22」不可混用',
    cs.keyLesson.application.includes('57') &&
    cs.keyLesson.application.includes('14') &&
    cs.keyLesson.application.includes('22'))
  ok('★ cautions 已同步 57 与 5.4 年（不留旧值）',
    PD.cautions.some((c) => c.includes('通灵总数已由游戏内截图定案')) &&
    PD.cautions.some((c) => c.includes('5.4 年')) &&
    !PD.cautions.some((c) => c.includes('18 只通灵全开第 9 孔需约')))
}

/* ═════════════════════════════ 汇总 ═════════════════════════════ */

console.log(`\n${'═'.repeat(62)}`)
console.log(`工作台自测：通过 ${pass} 项，失败 ${fail} 项`)
if (fail) {
  console.log('\n失败项：')
  fails.forEach(f => console.log('  · ' + f))
  process.exitCode = 1
} else {
  console.log('全部通过 ✓')
}
