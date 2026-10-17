/**
 * @dsh-external/naruto-workbench — HOST 半身
 *
 * 三件事：
 *  1) 注册 3 个 agent 工具（工作台面板通过它们把「你的真实面板」交给 agent）：
 *       naruto_save_panel   保存/读取用户面板（面板表单写入，agent 读取）
 *       naruto_analyze      用本地确定性引擎算战力构成 / 短板 / 虚战 / 目标倒推
 *       naruto_reference    把内置数据表（成长曲线、战力标准、性价比排序）给 agent 当依据
 *  2) 面板数据持久化：写到 $DSH_HOME/naruto-workbench/panel.json（跨会话、跨重启）
 *  3) 让 agent 有据可依：naruto_reference 直接返回内置数值表，避免 agent 凭空编数字
 *
 * 设计原则：
 *  - **不重复实现战力计算**：直接把独立版 naruto-planner 的 CJS 引擎（power-engine.js）
 *    通过 require 桥接进来复用；找不到就退回内置精简实现（见 computeFallback）。
 *  - 纯 ESM、无构建步骤（与本地 dsh-theme-endfield 等插件一致）。
 *  - 任何外部依赖缺失都降级，不让插件加载失败。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'

import POWER from './power-data.js'

const name = '@dsh-external/naruto-workbench'
const inject = ['tools']

// ───────────────────────────────────────────── 数据落盘

const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const STORE_DIR = join(DSH_HOME, 'naruto-workbench')
const PANEL_FILE = join(STORE_DIR, 'panel.json')

function ensureDir() {
  try { mkdirSync(STORE_DIR, { recursive: true }) } catch { /* ignore */ }
}

/** @returns {{panel:object|null, updatedAt:string|null}} */
function readPanel() {
  try {
    if (!existsSync(PANEL_FILE)) return { panel: null, updatedAt: null }
    const raw = JSON.parse(readFileSync(PANEL_FILE, 'utf8'))
    return { panel: raw.panel ?? null, updatedAt: raw.updatedAt ?? null }
  } catch {
    return { panel: null, updatedAt: null }
  }
}

function writePanel(panel) {
  ensureDir()
  const payload = { panel, updatedAt: new Date().toISOString() }
  writeFileSync(PANEL_FILE, JSON.stringify(payload, null, 2), 'utf8')
  return payload
}

// ───────────────────────────────────────────── 复用独立版引擎

/**
 * 外部引擎桥接已移除：改成总是使用内置精简实现。
 *
 * 原因（实测）：naruto-planner 的 power-engine.js 会往 `globalThis.NR` 写数据并在
 * 加载期改动全局状态，与 DSH 宿主运行时的全局命名空间存在冲突；
 * 在宿主里表现为 fiber 加载后立刻 failed（apply 本身执行成功）。
 * 本插件不需要完整引擎 —— 内置实现已覆盖工作台所需的计算（构成/占比/短板/虚战/目标倒推）。
 */
function loadEngine() {
  return { engine: null, dir: null, tried: ['disabled: using built-in compute'] }
}
// ───────────────────────── 内置精简引擎（引擎缺失时的降级路径）

/** 单板块战力 = Σ(属性 × 系数 × 收集加成) */
function boardPower(attrs, bonus) {
  const w = POWER.attrWeights
  let p = 0
  for (const k of ['hp', 'atk', 'def', 'crit', 'critResist', 'elemAtk', 'elemDef']) {
    const v = Number(attrs?.[k])
    if (!Number.isFinite(v) || v <= 0) continue
    const cb = bonus && POWER.collectionBonus.appliesTo.includes(k) ? 1 + (Number(bonus[k]) || 0) : 1
    p += v * (w[k] || 0) * cb
  }
  return p
}

/**
 * 内置版 compute：与 power-engine 的 compute 输出形状保持兼容的最小子集。
 * 缺数据不编造：未填板块 filled:false、share:null。
 */
function computeFallback(input) {
  const bonus = input?.collectionBonus || {}
  const given = input?.boards || {}
  const rows = []
  let total = 0
  for (const b of POWER.boards) {
    const attrs = given[b.id]
    const filled = !!attrs && Object.keys(attrs).length > 0
    const power = filled ? boardPower(attrs, bonus) : 0
    total += power
    rows.push({ boardId: b.id, boardName: b.name, attrs: attrs || {}, filled, power })
  }
  for (const r of rows) r.share = total > 0 && r.filled ? r.power / total : null
  const filledRows = rows.filter((r) => r.filled).sort((a, b) => b.power - a.power)
  return {
    boards: rows,
    totalPower: Math.round(total),
    filledCount: filledRows.length,
    totalBoards: POWER.boards.length,
    topBoards: filledRows.slice(0, 3),
    weakBoards: filledRows.slice(-3).reverse(),
    notes: ['内置精简引擎（未找到 naruto-planner 的 power-engine.js）'],
    _fallback: true,
  }
}

/** 内置版虚战诊断：只按"失衡/集中"判据，绝不按属性种类 */
function inflationFallback(comp) {
  const t = POWER.inflation.thresholds
  const shares = comp.boards.filter((b) => b.filled && b.share != null).map((b) => b.share)
  if (shares.length < 2) {
    return {
      inflationScore: null,
      level: '数据不足',
      reasons: ['已填写板块少于 2 个，无法判断分布是否失衡（不做猜测）。'],
      suggestions: ['至少填 3~4 个板块后再看虚战诊断。'],
      confidence: 'unverified',
    }
  }
  const n = shares.length
  const avg = 1 / n
  let dev = 0
  for (const s of shares) dev += Math.abs(s - avg)
  const imbalance = dev / (2 * (1 - avg)) // 0=完全均分, 1=全压一块
  const maxShare = Math.max(...shares)
  const over = Math.max(0, (maxShare - t.overConcentratedShare) / (1 - t.overConcentratedShare))
  const score = Math.round(Math.min(100, 100 * (0.7 * imbalance + 0.3 * over)))
  const level = score >= 60 ? '虚战仔' : score >= 35 ? '偏虚' : score >= 15 ? '均衡' : '实战型'
  const reasons = [
    `失衡度 ${Math.round(imbalance * 100)}/100：${n} 个已填板块平均占比 ${(avg * 100).toFixed(1)}%，最高 ${(maxShare * 100).toFixed(1)}%。`,
  ]
  if (maxShare > t.overConcentratedShare) reasons.push(`单个板块占比 ${(maxShare * 100).toFixed(1)}% 超过集中阈值 ${(t.overConcentratedShare * 100).toFixed(0)}%。`)
  return {
    inflationScore: score,
    level,
    reasons,
    suggestions: [
      '这是"资源过于集中"的提示，不是"属性种类错了"——虚战按作者定义指透支潜力，与堆暴击/堆生命无关。',
      score >= 35 ? '建议把一部分资源转投占比最低的几个板块，先把基础铺开。' : '结构较均衡，重点转向单位资源战力更高的投入。',
    ],
    confidence: 'medium',
  }
}

/** 统一入口：优先真引擎，失败退回内置 */
function computePower(input) {
  const { engine, dir } = loadEngine()
  if (engine) {
    try {
      const r = engine.plan(input)
      let infl = r.inflation
      if (!infl || infl.inflationScore === undefined) infl = inflationFallback(r.compute)
      return { via: 'naruto-planner/' + dir, plan: r, compute: r.compute, inflation: infl }
    } catch (e) {
      // 引擎存在但抛错 → 退回内置，并把原因带出去
      const c = computeFallback(input)
      return { via: 'fallback(engine error)', plan: null, compute: c, inflation: inflationFallback(c), engineError: String(e.message).slice(0, 200) }
    }
  }
  const c = computeFallback(input)
  return { via: 'fallback(no engine)', plan: null, compute: c, inflation: inflationFallback(c) }
}

// ───────────────────────────────────────── 目标倒推（工作台核心）

/**
 * 根据当前战力与目标，倒推需要多少战力增量、按性价比排序给出投入方向、
 * 并按资源日收益估算"多少天"。
 */
function planTarget({ currentPower, targetPower, level, income }) {
  const gap = Math.max(0, (targetPower || 0) - (currentPower || 0))
  const std = POWER.powerStandards
  // 找最接近当前等级的基准
  let bench = null
  if (Number.isFinite(level)) {
    for (const row of std.table) if (level >= row.level) bench = row
    if (bench && level > std.table[std.table.length - 1].level) bench = std.table[std.table.length - 1]
  }
  const verdict = bench && Number.isFinite(currentPower)
    ? currentPower >= bench.power - std.tolerance ? '达标'
      : currentPower >= bench.power * 0.8 ? '偏低'
        : '明显偏低'
    : null

  // 投入方向：按社区性价比排序 + 已知最优节点。
  // ★ 注意：这些节点的战力量级加起来往往远小于 gap —— 那本身就是一条重要结论
  //   （说明大头在装备/饰品强化或等级/忍者收集，不是靠这些"小节点"能补上的）。
  // ★ 2026-10-18 复核后：通灵+4 与勾玉全铺的**具体战力数字**已被判定不可信
  //   （前者唯一来源是 AI 农场且文内自相矛盾；后者是 2016 年 54 孔样本、基数已失效）。
  //   所以把 power 设为 null —— 只给策略，不给假数字。
  const options = [
    {
      order: 1,
      what: '通灵进阶：先把普通通灵均升到 +4',
      why: '「均升优于单只冲高」这个策略有 2 个来源支持；但具体战力增量未验证',
      power: null,
      cost: '消耗量未确证（流传的"60万声望+1125万铜币"已判定为农场污染）',
      source: 'zhufu_strategy',
      confidence: 'low',
    },
    {
      order: 2,
      what: '勾玉：先把所有孔铺到 4 级，再往上堆',
      why: '凹曲线是结构性规律（4→6 级资源 ×9、战力 ×2），策略成立；具体数字来自 2016 年样本，已过时',
      power: null,
      cost: '按当前孔位数与等级计算',
      source: 'diyiyou_jade',
      confidence: 'low',
    },
    {
      order: 3,
      what: '神器：≤70 级档全部清空，再推 ≤140 级档',
      why: '白牙后单位轮回石收益腰斩（30→60/次，2 源独立印证），先把高效档做完',
      power: null,
      cost: '按档位递增',
      source: 'xiaomi_artifact_2021',
      confidence: 'medium',
    },
    {
      order: 4,
      what: '忍具：有究忍具推到 +15（无究最多 +8）',
      why: '多来源一致；一星究 +15 继承二星只掉 2 级最省',
      power: null,
      cost: '按强化等级',
      source: 'zol_museum',
      confidence: 'high',
    },
    {
      order: 5,
      what: '饰品：主力件强到当前阶段上限',
      why: '单件爆发最高（云迹腰带 0→+30 ≈ +73 万战力，单一实测），但耗绿水/保护符巨大',
      power: 730000,
      cost: '115 万绿水 + 1608 保护符 + 1.8 万紫星',
      source: 'csdn',
      confidence: 'low',
    },
  ]

  // 已知节点的战力合计 —— 用它说明"够不够填满 gap"。
  // 只统计有可信数字的节点（现在是饰品这一项），其余标 null 的不参与。
  const knownGain = options.reduce((a, o) => a + (o.power || 0), 0)
  const coverage = gap > 0 && knownGain > 0 ? knownGain / gap : null
  const unquantified = options.filter((o) => o.power == null && o.order !== 5).length

  // ★ 不估算"多少天"：金币不能直接换算战力（玩家战力增长主要来自铜币/体力/通灵/神器等免费资源），
  //   用金币汇率算出来的天数会荒谬地长（实测 4~10 年），是误导。
  //   改为给"资源量级"：把已知节点的成本列出来，让人自己看缺多少。
  const inc = POWER.resourceIncome
  const resourceHints = [
    {
      resource: '金币',
      note: `零氪约 ${inc.gold.freeToPlayRange[0]}~${inc.gold.freeToPlayRange[1]}/天（取 ${inc.gold.freeToPlay}），月卡约 ${inc.gold.monthlyCardRange[0]}~${inc.gold.monthlyCardRange[1]}/天；但金币主要买礼包/体力，不直接兑换战力`,
      confidence: inc.gold.confidence,
    },
    {
      resource: '体力',
      note: `约 ${inc.stamina.withRamen}/天（自然恢复 ${inc.stamina.natural} + 一乐拉面约 150）。⚠ 旧版写 1200/天是数量级错误`,
      confidence: inc.stamina.confidence,
    },
    {
      resource: '铜币',
      note: `⚠ 未找到一手计算帖；流传值 ${Math.round(inc.copper.min / 10000)}~${Math.round(inc.copper.max / 10000)} 万/天，但有明细帖称单项即 46 万/天，差一个数量级。请以实测为准`,
      confidence: inc.copper.confidence,
    },
    {
      resource: '声望',
      note: '小队突袭付费 3 次 ≈ 1260/次，免费仅 210/次（约 3 倍差）',
      confidence: 'medium',
    },
  ]

  return {
    gap: Math.round(gap),
    currentPower: currentPower ?? null,
    targetPower: targetPower ?? null,
    benchmark: bench ? {
      level: bench.level,
      power: bench.power,
      tolerance: std.tolerance,
      verdictForCurrent: verdict,
      confidence: bench.confidence || 'low',
      basis: bench.basis || null,
    } : null,
    options,
    knownNodeGain: knownGain,
    knownNodeCoverage: coverage,
    unquantifiedOptions: unquantified,
    resourceHints,
    notes: [
      '⚠ 战力标准表只能当量级参考：高段已过时（游戏已开 160 级，160 级团本实测下限就 3000 万），' +
        '低段（70~110）几乎无独立佐证，且 120/130/140 三段的佐证实际只有 1 个独立来源（同一答主同一张网图）。',
      gap > 0 ? `还差 ${Math.round(gap).toLocaleString('zh-CN')} 战力。` : '已达到或超过目标。',
      unquantified > 0
        ? `上面 ${options.length} 条优先项里有 ${unquantified} 条**无法给出可信的战力数字**（只有策略结论）—— 与其编一个数字，不如说清楚它没被验证过。`
        : null,
      coverage !== null
        ? (coverage < 0.2
          ? `⚠ 有可信数字的节点合计约 ${Math.round(knownGain).toLocaleString('zh-CN')} 战力，只占你所缺 ${Math.round(gap).toLocaleString('zh-CN')} 的 ${(coverage * 100).toFixed(0)}% —— 说明大头不在这些"小节点"上，而在装备/饰品强化、等级提升或忍者收集。别把精力全花在优化小节点上。`
          : `有可信数字的节点合计约 ${Math.round(knownGain).toLocaleString('zh-CN')} 战力，占你所缺的 ${(coverage * 100).toFixed(0)}%，值得优先做完。`)
        : '给了目标战力、且有可信数字的节点才能算覆盖率。',
      '不做"多少天能达成"的估算：金币不能直接换算战力（战力增长主要来自铜币/体力/通灵/神器等免费资源），按金币汇率算出的天数会严重失真。',
    ].filter(Boolean),
  }
}

// ───────────────────────────────────────────── 工具 schema 辅助

function jsonOutput(schema) {
  /* ★ `render` 是**必填**的：dsh-tools 的 register 会校验
   *   `typeof output.render !== 'function'` 并直接抛 TypeError。
   *   少了它整块 host 会 failed（这个坑排查了很久）。
   *   这里给通用 JSON 渲染：把结果格式化成可读文本给 UI。 */
  return {
    schema: { type: 'object', additionalProperties: true, ...schema },
    render(_args, value) {
      try {
        return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
      } catch {
        return [{ type: 'text', text: String(value) }]
      }
    },
  }
}

/* ───────────────────────────────────────────── 参数 schema 铸造
 *
 * ★ 关键：`ctx.tools.register()` 与 `defineTool()` **不是**同一个入口。
 *   defineTool 会用 parameterSchemaSpecToJsonSchema() 把「属性表」编译成
 *   { type:'object', properties, required }；而 register 只校验 output.schema，
 *   对 parameters **原样放行**（见 dsh-tools/lib/index.js register() 实现）。
 *
 *   所以直接 register({ parameters: { a:{...}, b:{...} } }) 时，模型侧收到的
 *   根节点没有 type → 序列化成 "type": null → 上游 400：
 *     Invalid schema for function 'x': schema must be a JSON Schema of
 *     'type: "object"', got 'type: null'.
 *     （另一条表现：workbuddy upstream client (http 400): 工具定义不合规）
 *
 *   这里就地复刻官方编译规则：属性表 → 对象根 schema；属性级 `required: true`
 *   提升为根 required 数组；author-only 的 `type:'json'` 退化为纯注解。
 */
function compilePropertyMap(props) {
  const properties = {}
  const required = []
  for (const [key, spec] of Object.entries(props || {})) {
    const { required: isRequired, ...node } = spec || {}
    properties[key] = compileValueNode(node)
    if (isRequired === true) required.push(key)
  }
  const out = { type: 'object', properties }
  if (required.length > 0) out.required = required
  return out
}

function compileValueNode(spec) {
  if (spec == null || typeof spec !== 'object') return {}
  const node = {}
  for (const [key, value] of Object.entries(spec)) {
    if (key === 'required') continue
    if (key === 'type' && value === 'json') continue // author-only，不落到协议上
    if (key === 'properties' && value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = compilePropertyMap(value)
      node.properties = nested.properties
      if (nested.required) node.required = nested.required
      continue
    }
    if (key === 'items' && value && typeof value === 'object') {
      node.items = compileValueNode(value)
      continue
    }
    if (key === 'oneOf' && Array.isArray(value)) {
      node.oneOf = value.map(compileValueNode)
      continue
    }
    node[key] = value
  }
  return node
}

/** 已经合规的对象根 schema 直接放行，避免重复编译把 type 吃掉。 */
function toParameters(spec) {
  if (spec && typeof spec === 'object' && spec.type === 'object' && spec.properties) return spec
  return compilePropertyMap(spec)
}

function briefSources(ids) {
  return (ids || []).map((id) => {
    const s = POWER.sources[id]
    return s ? (s.url ? `${s.title} <${s.url}>` : s.title) : id
  })
}

// ───────────────────────────────────────────── 插件

function apply(ctx) {
  /* 统一出入口：所有工具都必须经这里，保证 parameters 是合规的对象根 schema。
   * 绕过这条包装直接 ctx.tools.register(...) 会让上游 400（见上方注释）。 */
  const register = (def) =>
    ctx.tools.register({ ...def, parameters: toParameters(def.parameters) })

  // ── 工具 1：保存 / 读取面板 ──
  register({
    name: 'naruto_save_panel',
    description:
      '保存或读取用户在「火影忍者手游战力工作台」面板里填写的战力数据（16 板块 × 7 属性、等级、收集加成、目标战力）。' +
      '传入 panel 则保存，不传则读取已保存的面板。用户在面板里点「交给 agent 分析」时会自动带上这些数据，你通常无需主动调用它，' +
      '但当你需要确认「用户当前填了什么」时可以调用来读取。',
    parameters: {
      panel: {
        type: 'object',
        description: '要保存的面板对象；省略表示只读取。结构：{level, targetPower, collectionBonus:{hp,atk,def}, boards:{板块id:{hp,atk,def,crit,critResist,elemAtk,elemDef}}}',
        additionalProperties: true,
      },
    },
    output: jsonOutput({
      properties: {
        ok: { type: 'boolean' },
        updatedAt: { type: 'string' },
        panel: { type: 'object', additionalProperties: true },
        panelFile: { type: 'string' },
      },
    }),
    async execute(args) {
      if (args && args.panel && typeof args.panel === 'object') {
        const saved = writePanel(args.panel)
        return { ok: true, updatedAt: saved.updatedAt, panel: saved.panel, panelFile: PANEL_FILE }
      }
      const cur = readPanel()
      return { ok: true, updatedAt: cur.updatedAt, panel: cur.panel, panelFile: PANEL_FILE }
    },
  })

  // ── 工具 2：分析面板 ──
  register({
    name: 'naruto_analyze',
    description:
      '用本地确定性引擎分析火影忍者手游战力面板：算总战力与各板块占比、找短板板块、做「虚战/资源透支」诊断、' +
      '以及按目标战力倒推投入方向与所需天数。**涉及数字计算时优先用这个工具**，不要自己心算或凭空估计。' +
      '不传 panel 时自动读取用户上次在面板里保存的数据。',
    parameters: {
      panel: {
        type: 'object',
        description: '要分析的面板；省略则读用户已保存的面板。结构同 naruto_save_panel。',
        additionalProperties: true,
      },
      targetPower: {
        type: 'number',
        description: '目标战力（可选）。给了就会做目标倒推。',
      },
      goldPerDay: {
        type: 'number',
        description: '每日金币收益（可选）。零氪约 400（区间 330~500），月卡约 550。',
      },
      copperPerDay: {
        type: 'number',
        description: '每日铜币收益（可选）。⚠ 该数据未确证，仅作量级参考。',
      },
    },
    output: jsonOutput({
      properties: {
        ok: { type: 'boolean' },
        engine: { type: 'string' },
        totalPower: { type: 'number' },
        filledCount: { type: 'number' },
        boards: { type: 'array', items: { type: 'object', additionalProperties: true } },
        inflation: { type: 'object', additionalProperties: true },
        weaknesses: { type: 'array', items: { type: 'object', additionalProperties: true } },
        target: { type: 'object', additionalProperties: true },
        cautions: { type: 'array', items: { type: 'string' } },
      },
    }),
    async execute(args) {
      const stored = readPanel()
      const panel = (args && args.panel && typeof args.panel === 'object') ? args.panel : stored.panel
      if (!panel) {
        return {
          ok: false,
          engine: 'none',
          totalPower: 0,
          filledCount: 0,
          boards: [],
          inflation: { inflationScore: null, level: '数据不足', reasons: ['用户还没有填写战力面板。'], suggestions: [], confidence: 'unverified' },
          weaknesses: [],
          target: {},
          cautions: POWER.cautions,
          error: '没有面板数据：请让用户在「战力工作台」面板里填写，或你在对话里问清楚各板块数值后用 panel 参数传入。',
        }
      }
      const input = {
        boards: panel.boards || {},
        collectionBonus: panel.collectionBonus || {},
      }
      const res = computePower(input)
      const comp = res.compute
      const infl = res.inflation

      // 短板：只做用户自己面板内部比较，引用不到外部基准
      const filled = (comp.boards || []).filter((b) => b.filled && b.share != null)
      const weaknesses = []
      if (filled.length >= 2) {
        const sorted = [...filled].sort((a, b) => a.share - b.share)
        const weakest = sorted[0]
        const strongest = sorted[sorted.length - 1]
        if (strongest.share > 0 && weakest.share < strongest.share * 0.5) {
          weaknesses.push({
            boardId: weakest.boardId,
            boardName: weakest.boardName,
            share: weakest.share,
            reason: `占比 ${(weakest.share * 100).toFixed(1)}%，不足你自己最强板块「${strongest.boardName}」(${(strongest.share * 100).toFixed(1)}%) 的 50% —— 这只是你自己面板内部的相对落差，不是「低于同类玩家」。`,
            basis: 'user-relative',
          })
        }
      }

      const targetPower = Number.isFinite(args?.targetPower) ? args.targetPower : panel.targetPower
      const target = planTarget({
        currentPower: comp.totalPower,
        targetPower,
        level: panel.level,
        income: {
          goldPerDay: args?.goldPerDay ?? POWER.resourceIncome.gold.freeToPlay,
          copperPerDay: args?.copperPerDay ?? 330000,
        },
      })

      // 未填板块提示：占比是在"已填部分"上算的，没填的板块会让结构失真 —— 必须说清楚
      const unfilled = (comp.boards || []).filter((b) => !b.filled).map((b) => b.boardName)
      const notes = []
      if (unfilled.length) {
        notes.push(
          `有 ${unfilled.length} 个板块未填写（${unfilled.slice(0, 8).join('、')}${unfilled.length > 8 ? ' 等' : ''}）：` +
          '总战力与占比只覆盖已填部分，所以现在的占比是"局部占比"，不是完整结构。想看准结构请把 16 个板块填齐。',
        )
      }
      if ((panel.collectionBonus?.hp || 0) + (panel.collectionBonus?.atk || 0) + (panel.collectionBonus?.def || 0) === 0) {
        notes.push(
          '未填忍者收集加成（按 0% 计算）—— 这会让生命/攻击/防御的战力被低估。' +
          '可在游戏内忍者→收集加成处查看，典型值约 生命 20~170% / 攻击 20~340% / 防御 20~200%（随账号进度）。',
        )
      }

      return {
        ok: true,
        engine: res.via,
        totalPower: comp.totalPower,
        filledCount: comp.filledCount,
        totalBoards: comp.totalBoards,
        boards: (comp.boards || []).map((b) => ({
          boardId: b.boardId, boardName: b.boardName, power: b.power,
          share: b.share, filled: b.filled,
        })),
        inflation: {
          inflationScore: infl.inflationScore,
          level: infl.level,
          reasons: infl.reasons || [],
          suggestions: infl.suggestions || [],
          confidence: infl.confidence,
        },
        weaknesses,
        target,
        notes,
        cautions: POWER.cautions,
        dataNote: '数值来自内置 power-data.js（社区实测整理，非官方）。防御系数 11.6；抗魔值不计入战力；生命/攻击/防御需乘收集加成。',
      }
    },
  })

  // ── 工具 3：内置数据参考 ──
  register({
    name: 'naruto_reference',
    description:
      '查询火影忍者手游战力的内置数值表：成长曲线（神器三段/通灵进阶最优节点/勾玉凹曲线/忍具限制）、' +
      '分阶段战力标准表、资源日收益、性价比排序、虚战判据、属性攻防真实机制、跨游戏污染名单。' +
      '**回答涉及具体数值、收益对比、"该先升什么"之前，先调用它**，避免编造数字。' +
      '若用户给的资料来自 huoyin.qq.com 或提到「出手位/先攻/忍术/抗性/五行查克拉」，' +
      '先查 crossgame 段确认是否是《火影忍者OL》端游资料（不能用在本作手游上）。',
    parameters: {
      section: {
        type: 'string',
        enum: [
          'all',
          'growth',
          'standards',
          'income',
          'priority',
          'inflation',
          'weights',
          'elem',
          'crossgame',
          'conflicts',
          'sources',
        ],
        description: '要查的区块；默认 all。elem = 属性攻防机制与算式归属；crossgame = 跨游戏污染名单；conflicts = 社区互相矛盾的口径（如虚战两种定义）。',
      },
    },
    output: jsonOutput({
      properties: {
        section: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
        cautions: { type: 'array', items: { type: 'string' } },
      },
    }),
    async execute(args) {
      const s = (args && args.section) || 'all'
      const pick = (k, v) => (s === 'all' || s === k ? { [k]: v } : {})
      const data = Object.assign(
        {},
        pick('growth', POWER.growth),
        pick('standards', POWER.powerStandards),
        pick('income', POWER.resourceIncome),
        pick('priority', POWER.priorityOrder),
        pick('inflation', POWER.inflation),
        pick('weights', { attrWeights: POWER.attrWeights, collectionBonus: POWER.collectionBonus, boards: POWER.boards, boardAttrs: POWER.boardAttrs }),
        pick('elem', { elemMechanics: POWER.elemMechanics, elemCrossCheck: POWER.elemCrossCheck }),
        pick('crossgame', { crossGameTraps: POWER.crossGameTraps }),
        pick('conflicts', { communityConflicts: POWER.communityConflicts, collectionMilestones: POWER.collectionMilestones }),
        pick('sources', POWER.sources),
      )
      return { section: s, data, cautions: POWER.cautions }
    },
  })

  ctx.logger?.info?.('[naruto-workbench] 已注册 3 个工具；面板存储：' + PANEL_FILE)
  const eng = loadEngine()
  ctx.logger?.info?.(
    '[naruto-workbench] 战力引擎：' + (eng.engine ? '复用 naruto-planner (' + eng.dir + ')' : '内置精简版'),
  )
}


export { apply, inject, name }









