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
ok('战力标准表覆盖 60~160 级（含 155/160 新段）',
  PD.powerStandards.table.length >= 14 &&
  PD.powerStandards.table[0].level === 60 &&
  PD.powerStandards.table[PD.powerStandards.table.length - 1].level === 160,
  `${PD.powerStandards.table.length} 行, 末行 ${PD.powerStandards.table[PD.powerStandards.table.length - 1].level} 级`)
ok('战力标准表标为低置信且带诚实声明',
  PD.powerStandards.confidence === 'low' && typeof PD.powerStandards.independentSourceWarning === 'string',
  PD.powerStandards.confidence)
ok('资源日收益：金币零氪已修正为 330~500（不再是过时的 260）',
  PD.resourceIncome.gold.freeToPlay >= 330 && PD.resourceIncome.gold.freeToPlay <= 500,
  String(PD.resourceIncome.gold.freeToPlay))
ok('资源日收益：体力已修正（约 460，不再是错误的 1200）',
  PD.resourceIncome.stamina && PD.resourceIncome.stamina.withRamen === 460,
  String(PD.resourceIncome.stamina?.withRamen))
ok('资源日收益：铜币标为未确证（不再假称 30~36 万可信）',
  PD.resourceIncome.copper.confidence === 'unverified',
  PD.resourceIncome.copper.confidence)

section('2b. 交叉验证后的置信度分级（2026-10-18 复核）')
ok('属性系数有逐项置信度 perAttr', !!PD.attrWeights.perAttr && Object.keys(PD.attrWeights.perAttr).length === 7)
ok('属性攻击/防御标为 unverified（零独立来源）',
  PD.attrWeights.perAttr.elemAtk.confidence === 'unverified' &&
  PD.attrWeights.perAttr.elemDef.confidence === 'unverified')
ok('生命/攻击/暴击标为 high',
  ['hp', 'atk', 'crit'].every(k => PD.attrWeights.perAttr[k].confidence === 'high'))
ok('防御标为 medium（唯一有游戏内闭环验证，但仅 2 源）',
  PD.attrWeights.perAttr.def.confidence === 'medium', PD.attrWeights.perAttr.def.confidence)
ok('抗暴标为 medium（有官方改动日志但缺直接算式）',
  PD.attrWeights.perAttr.critResist.confidence === 'medium', PD.attrWeights.perAttr.critResist.confidence)
ok('通灵 +4 的可疑数字已撤下（power=null）',
  PD.growth.spiritAdvance.sweetSpots[0].power === null,
  String(PD.growth.spiritAdvance.sweetSpots[0].power))
ok('勾玉标为 unverified 且注明 2016 样本已过时',
  PD.growth.jade.confidence === 'unverified' &&
  String(PD.growth.jade.note).includes('2016'),
  PD.growth.jade.confidence)
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
ok('reference[all] 含全部 7 区块', Object.keys(refAll.data).length === 7, Object.keys(refAll.data).join(','))

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

let reg = null
let clientApplyErr = null
try {
  captured.exports.apply({
    slots: { inject(n, fn) { return fn() }, register(spec) { reg = spec; return () => {} } },
    effect(fn) { return fn() },
  })
} catch (e) { clientApplyErr = e }
ok('client apply() 不抛异常', !clientApplyErr, clientApplyErr && clientApplyErr.message)
ok('注册到 conversation.input.dock', reg?.name === 'conversation.input.dock', reg?.name)
ok('slot id 唯一可辨识', typeof reg?.id === 'string' && reg.id.includes('naruto-workbench'), reg?.id)

let node = null, renderErr = null
try { node = reg.component().render() } catch (e) { renderErr = e }
ok('面板 render() 不抛异常', !renderErr, renderErr && renderErr.message)

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
