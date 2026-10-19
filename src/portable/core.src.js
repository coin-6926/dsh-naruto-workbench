/**
 * 火影忍者手游 战力工作台 · 可移植核心（Portable Core）
 *
 * 设计目标：
 *  1. **零依赖、零网络、零 DOM** —— 纯函数，可在浏览器 / Node / 任何 JS 运行时使用
 *  2. **ES2015 语法上限** —— 不用 `?.` `??` `Object.fromEntries` `structuredClone` 等新特性，
 *     以覆盖 Chrome 51+ / Safari 10+ / Edge 15+ / iOS 10+ / 各国内套壳浏览器
 *  3. **不信任任何输入** —— 所有数值经 sanitizeNumber，所有结构经 validate 归一化
 *  4. **缺数据不编造** —— 未填 = null / filled:false，绝不填 0 冒充真实值
 *
 * 本文件由 tools/build-portable.mjs 包装成 UMD，并被 CLI / 单文件 HTML 复用。
 * 注意：本文件本身**没有** import/export —— 它是一个工厂函数源码，由打包器包裹。
 */

function createCore(DATA) {
  'use strict';

  if (!DATA || typeof DATA !== 'object') {
    throw new TypeError('createCore: 数据对象缺失');
  }

  var CORE_VERSION = '1.0.0'
  var SCHEMA_VERSION = 2

  // ───────────────────────────────── 基础工具（全部防御式）

  /** 把任意输入变成有限数字；失败返回 fallback（默认 null，绝不返回 0 冒充缺数据） */
  function sanitizeNumber(v, fallback) {
    var fb = arguments.length > 1 ? fallback : null
    if (v === null || v === undefined || v === '') return fb
    if (typeof v === 'number') {
      if (!isFinite(v)) return fb
      return v
    }
    if (typeof v === 'string') {
      // 容忍 "1,234"、" 56 "、"56万"（仅识别纯数字与千分位，不做单位换算以免误判）
      var s = v.replace(/[,\s]/g, '').replace(/[+]/g, '')
      if (s === '' || s === '-') return fb
      if (!/^-?\d*\.?\d+$/.test(s)) return fb
      var n = Number(s)
      return isFinite(n) ? n : fb
    }
    if (typeof v === 'boolean') return fb
    return fb
  }

  /** 非负数值；负数按 0 处理并计入告警 */
  function nonNegative(v, warnings, label) {
    var n = sanitizeNumber(v, null)
    if (n === null) return null
    if (n < 0) {
      if (warnings) warnings.push(label + ' 为负数（' + n + '），已按 0 处理')
      return 0
    }
    return n
  }

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
  }

  function safeKeys(o) {
    if (!isPlainObject(o)) return []
    try {
      return Object.keys(o)
    } catch (e) {
      return []
    }
  }

  /** 深拷贝（只处理 JSON 安全结构，循环引用直接切断） */
  function deepClone(v, seen) {
    var s = seen || []
    if (v === null || typeof v !== 'object') return v
    for (var i = 0; i < s.length; i++) if (s[i] === v) return null // 切断循环
    s = s.concat([v])
    if (Array.isArray(v)) {
      var arr = []
      for (var j = 0; j < v.length; j++) arr.push(deepClone(v[j], s))
      return arr
    }
    var out = {}
    var keys = safeKeys(v)
    for (var k = 0; k < keys.length; k++) out[keys[k]] = deepClone(v[keys[k]], s)
    return out
  }

  // ───────────────────────────────── 数据视图

  var BOARDS = Array.isArray(DATA.boards) ? DATA.boards.slice() : []
  /**
   * ★ 2026-10-19 板块属性约束（用户一手口径）
   * 装备/勾玉/通灵/神器/密卷/天赋/修罗天赋 **不产** 暴击/抗暴/属性攻防。
   * 违规填入的值一律**不计入战力**，并给出 warning —— 而不是悄悄算进去。
   */
  var CONSTRAINTS = DATA.boardAttrConstraints || null
  var FORBIDDEN_BY_BOARD = (function () {
    var map = {}
    if (!CONSTRAINTS || !CONSTRAINTS.hpAtkDefOnly) return map
    var c = CONSTRAINTS.hpAtkDefOnly
    for (var i = 0; i < c.boards.length; i++) map[c.boards[i]] = c.forbiddenAttrs.slice()
    return map
  })()
  /** 返回该板块被违规填写的属性列表 */
  function forbiddenIn(boardId, attrs) {
    var bad = []
    var forb = FORBIDDEN_BY_BOARD[boardId]
    if (!forb || !attrs) return bad
    for (var i = 0; i < forb.length; i++) {
      var k = forb[i]
      var val = attrs[k]
      if (val !== undefined && val !== null && val !== '' && !(typeof val === 'number' && !isFinite(val))) {
        var n = Number(val)
        if (isFinite(n) && n !== 0) bad.push(k)
      }
    }
    return bad
  }
  var ATTRS = Array.isArray(DATA.boardAttrs) ? DATA.boardAttrs.slice() : []
  var ATTR_KEYS = []
  for (var _i = 0; _i < ATTRS.length; _i++) ATTR_KEYS.push(ATTRS[_i].id)

  var WEIGHTS = DATA.attrWeights || {}
  var BONUS = DATA.collectionBonus || { appliesTo: [] }
  var APPLIES = Array.isArray(BONUS.appliesTo) ? BONUS.appliesTo : []
  var THRESH = (DATA.inflation && DATA.inflation.thresholds) || {
    overConcentratedShare: 0.25,
    underDevelopedShare: 0.03,
  }

  function boardMeta(id) {
    for (var i = 0; i < BOARDS.length; i++) if (BOARDS[i].id === id) return BOARDS[i]
    return null
  }

  // ───────────────────────────────── 面板归一化（防脏数据的第一道关）

  /**
   * 把任意输入归一化成内部标准面板。
   * 永不抛错；问题写进 warnings。
   * @returns {{panel:Object, warnings:string[], errors:string[]}}
   */
  function validate(input) {
    var warnings = []
    var errors = []
    var src = isPlainObject(input) ? input : {}
    if (!isPlainObject(input)) errors.push('输入不是对象，已按空面板处理')

    var level = sanitizeNumber(src.level, null)
    if (level !== null && (level < 1 || level > 300)) {
      warnings.push('等级 ' + level + ' 超出合理范围 1~300，已忽略')
      level = null
    }

    var targetPower = sanitizeNumber(src.targetPower, null)
    if (targetPower !== null && targetPower < 0) {
      warnings.push('目标战力为负，已忽略')
      targetPower = null
    }
    if (targetPower !== null && targetPower > 1e12) {
      warnings.push('目标战力过大（>1 万亿），可能是误填，已忽略')
      targetPower = null
    }

    var cbSrc = isPlainObject(src.collectionBonus) ? src.collectionBonus : {}
    var collectionBonus = {}
    for (var a = 0; a < ATTR_KEYS.length; a++) {
      var ak = ATTR_KEYS[a]
      if (APPLIES.indexOf(ak) < 0) continue
      var cv = nonNegative(cbSrc[ak], warnings, '收集加成 ' + ak)
      // 收集加成按「百分比」录入，内部统一存小数；>1 视为用户填了百分数
      if (cv !== null) {
        if (cv > 1 && cv <= 500) cv = cv / 100
        collectionBonus[ak] = cv
      }
    }

    var boardsSrc = isPlainObject(src.boards) ? src.boards : {}
    if (src.boards !== undefined && !isPlainObject(src.boards)) {
      errors.push('boards 不是对象，已忽略')
    }
    var boards = {}
    var unknownBoardIds = []
    var bkeys = safeKeys(boardsSrc)
    for (var bi = 0; bi < bkeys.length; bi++) {
      if (!boardMeta(bkeys[bi])) unknownBoardIds.push(bkeys[bi])
    }
    if (unknownBoardIds.length) {
      warnings.push('忽略未知板块 id：' + unknownBoardIds.join(', '))
    }

    for (var m = 0; m < BOARDS.length; m++) {
      var bid = BOARDS[m].id
      var raw = boardsSrc[bid]
      if (!isPlainObject(raw)) continue
      var clean = {}
      var any = false
      for (var n = 0; n < ATTR_KEYS.length; n++) {
        var key = ATTR_KEYS[n]
        var val = nonNegative(raw[key], warnings, BOARDS[m].name + '.' + key)
        if (val !== null) {
          clean[key] = val
          if (val > 0) any = true
        }
      }
      if (any) boards[bid] = clean
      else if (safeKeys(raw).length) {
        // 有输入但全为 0 → 视为未填，避免"填了 0"被当成"已知为零"
        warnings.push('板块「' + BOARDS[m].name + '」所有属性均为 0，视为未填')
      }
    }

    var panel = {
      schemaVersion: SCHEMA_VERSION,
      level: level,
      targetPower: targetPower,
      collectionBonus: collectionBonus,
      boards: boards,
    }
    var meta = isPlainObject(src.meta) ? src.meta : {}
    if (meta.note && typeof meta.note === 'string') panel.meta = { note: meta.note.slice(0, 500) }
    return { panel: panel, warnings: warnings, errors: errors }
  }

  // ───────────────────────────────── 战力计算

  function boardPower(attrs, bonus) {
    if (!isPlainObject(attrs)) return 0
    var total = 0
    for (var i = 0; i < ATTR_KEYS.length; i++) {
      var k = ATTR_KEYS[i]
      var v = sanitizeNumber(attrs[k], null)
      if (v === null || v <= 0) continue
      var w = sanitizeNumber(WEIGHTS[k], 0)
      if (!w) continue
      var cb = 1
      if (APPLIES.indexOf(k) >= 0) {
        var b = sanitizeNumber(isPlainObject(bonus) ? bonus[k] : null, 0)
        cb = 1 + (b || 0)
        if (!isFinite(cb) || cb < 0) cb = 1
      }
      var add = v * w * cb
      if (isFinite(add) && add > 0) total += add
    }
    return total
  }

  /**
   * 计算全板块战力构成。
   * @returns {{boards:Array, totalPower:number, filledCount:number, totalBoards:number,
   *            topBoards:Array, weakBoards:Array, unfilled:Array, notes:Array, incomplete:boolean}}
   */
  function compute(input) {
    var v = validate(input)
    var panel = v.panel
    var bonus = panel.collectionBonus
    var rows = []
    var total = 0
    var filled = 0
    var constraintWarnings = []

    for (var i = 0; i < BOARDS.length; i++) {
      var b = BOARDS[i]
      var attrs = panel.boards[b.id]
      // ★ 剔除该板块不该有的属性（不静默计入）
      var badAttrs = forbiddenIn(b.id, attrs)
      if (badAttrs.length && attrs) {
        var cleaned = {}
        for (var ck in attrs) {
          if (Object.prototype.hasOwnProperty.call(attrs, ck) && badAttrs.indexOf(ck) === -1) cleaned[ck] = attrs[ck]
        }
        attrs = cleaned
        constraintWarnings.push(
          b.name + '：已忽略 ' + badAttrs.length + ' 个该板块不产出的属性（' + badAttrs.join('/') + '）',
        )
      }
      var isFilled = !!attrs && safeKeys(attrs).length > 0
      var power = isFilled ? boardPower(attrs, bonus) : 0
      if (!isFinite(power) || power < 0) power = 0
      if (isFilled) filled++
      total += power
      rows.push({
        boardId: b.id,
        boardName: b.name,
        power: Math.round(power),
        filled: isFilled,
        share: null,
      })
    }

    if (!isFinite(total) || total < 0) total = 0
    for (var j = 0; j < rows.length; j++) {
      rows[j].share = total > 0 && rows[j].filled ? rows[j].power / total : null
    }

    var filledRows = []
    for (var f = 0; f < rows.length; f++) if (rows[f].filled) filledRows.push(rows[f])
    filledRows.sort(function (x, y) {
      return y.power - x.power
    })

    var unfilled = []
    for (var u = 0; u < rows.length; u++) if (!rows[u].filled) unfilled.push(rows[u].boardName)

    return {
      boards: rows,
      totalPower: Math.round(total),
      filledCount: filled,
      totalBoards: BOARDS.length,
      topBoards: filledRows.slice(0, 3),
      weakBoards: filledRows.slice(-3).reverse(),
      unfilled: unfilled,
      incomplete: filled < BOARDS.length,
      level: panel.level,
      targetPower: panel.targetPower,
      collectionBonus: bonus,
      warnings: (v.warnings || []).concat(constraintWarnings),
      constraintWarnings: constraintWarnings,
      errors: v.errors,
    }
  }

  // ───────────────────────────────── 虚战诊断

  function inflation(comp) {
    if (!comp || !Array.isArray(comp.boards)) {
      return { inflationScore: null, level: '数据不足', reasons: ['缺少计算结果'], suggestions: [], confidence: 'unverified' }
    }
    var shares = []
    for (var i = 0; i < comp.boards.length; i++) {
      var b = comp.boards[i]
      if (b.filled && b.share !== null && isFinite(b.share)) shares.push(b.share)
    }
    if (shares.length < 2) {
      return {
        inflationScore: null,
        level: '数据不足',
        reasons: ['已填写板块少于 2 个，无法判断分布是否失衡（不做猜测）。'],
        suggestions: ['至少填 3~4 个板块后再看虚战诊断。'],
        confidence: 'unverified',
      }
    }

    var n = shares.length
    var avg = 1 / n
    var dev = 0
    for (var d = 0; d < shares.length; d++) dev += Math.abs(shares[d] - avg)
    var denom = 2 * (1 - avg)
    var imbalance = denom > 1e-9 ? dev / denom : 0
    if (!isFinite(imbalance)) imbalance = 0
    imbalance = Math.max(0, Math.min(1, imbalance))

    var maxShare = Math.max.apply(Math, shares)
    var threshold = sanitizeNumber(THRESH.overConcentratedShare, 0.25)
    var over = threshold < 1 ? Math.max(0, (maxShare - threshold) / (1 - threshold)) : 0
    var score = Math.round(Math.min(100, 100 * (0.7 * imbalance + 0.3 * over)))
    if (!isFinite(score)) score = 0
    score = Math.max(0, Math.min(100, score))

    var level = score >= 60 ? '虚战仔' : score >= 35 ? '偏虚' : score >= 15 ? '均衡' : '实战型'
    var reasons = [
      '分布不均度 ' + Math.round(imbalance * 100) + '/100（' + n + ' 个已填板块平均占比 ' +
        (avg * 100).toFixed(1) + '%，最高 ' + (maxShare * 100).toFixed(1) + '%）。',
      '综合分 ' + score + ' = 0.7 × 不均度 + 0.3 × 集中度；集中度指最高占比超出阈值 ' +
        (threshold * 100).toFixed(0) + '% 的部分。',
    ]
    if (maxShare > threshold) {
      reasons.push('单个板块占比 ' + (maxShare * 100).toFixed(1) + '% 超过集中阈值 ' + (threshold * 100).toFixed(0) + '%。')
    }

    return {
      inflationScore: score,
      level: level,
      reasons: reasons,
      suggestions: [
        '这是「资源过于集中」的提示，不是「属性种类错了」——虚战有两种社区口径，详见数据层 communityConflicts。',
        score >= 35 ? '建议把一部分资源转投占比最低的几个板块，先把基础铺开。' : '结构较均衡，重点转向单位资源战力更高的投入。',
      ],
      confidence: 'medium',
    }
  }

  // ───────────────────────────────── 目标倒推

  function nearestStandard(level) {
    var std = (DATA.powerStandards && DATA.powerStandards.table) || []
    var lv = sanitizeNumber(level, null)
    if (lv === null || !std.length) return null
    var best = null
    var bestDiff = Infinity
    for (var i = 0; i < std.length; i++) {
      var diff = Math.abs(std[i].level - lv)
      if (diff < bestDiff) {
        bestDiff = diff
        best = std[i]
      }
    }
    return best
  }

  /**
   * 按目标战力倒推：缺口、结构建议、按日收益估算天数。
   * 明确拒绝在数据不足时给"多少天"的假精确值。
   */
  function planTarget(opts) {
    var o = isPlainObject(opts) ? opts : {}
    var currentPower = sanitizeNumber(o.currentPower, 0) || 0
    var targetPower = sanitizeNumber(o.targetPower, null)
    var level = sanitizeNumber(o.level, null)
    // ★ 与 validate() 保持同一套等级范围校验：planTarget 是直接收参的，
    //   不走 validate，所以这里必须自己挡一次，否则 level:-1 会被原样返回给 UI。
    if (level !== null && (level < 1 || level > 300)) level = null
    var perDay = sanitizeNumber(o.incomePerDay, null)
    var std = nearestStandard(level)

    var out = {
      level: level,
      currentPower: Math.round(currentPower),
      targetPower: targetPower === null ? null : Math.round(targetPower),
      gap: null,
      standard: std ? { level: std.level, power: std.power, confidence: std.confidence, basis: std.basis } : null,
      vsStandard: null,
      daysNeeded: null,
      daysNote: null,
      directions: [],
      caveats: [],
    }

    if (targetPower !== null) {
      out.gap = Math.max(0, Math.round(targetPower - currentPower))
    }

    if (std && std.power > 0) {
      var ratio = currentPower / std.power
      out.vsStandard = ratio
      out.vsStandardLabel =
        ratio >= 1 ? '达标' : ratio >= 0.8 ? '略低' : ratio >= 0.5 ? '偏低' : '明显偏低'
    }

    if (perDay !== null && perDay > 0 && out.gap !== null) {
      var days = Math.ceil(out.gap / perDay)
      if (isFinite(days) && days >= 0 && days < 100000) {
        out.daysNeeded = days
        out.daysNote =
          '按每日 +' + Math.round(perDay) + ' 战力线性外推；实际会被递减收益、活动与运气打断，**只当量级参考**。'
      } else {
        out.daysNote = '日收益异常，未估算天数。'
      }
    } else if (out.gap !== null) {
      out.daysNote = '未提供「每日战力收益」，所以**不估算天数**（拒绝编造）。'
    }

    // 方向建议：基于已填板块的占比，找占比最低的几块
    if (o.computed && Array.isArray(o.computed.boards)) {
      var filled = []
      for (var i = 0; i < o.computed.boards.length; i++) {
        var b = o.computed.boards[i]
        if (b.filled && b.share !== null) filled.push(b)
      }
      filled.sort(function (x, y) {
        return x.share - y.share
      })
      for (var k = 0; k < Math.min(3, filled.length); k++) {
        out.directions.push({
          boardId: filled[k].boardId,
          boardName: filled[k].boardName,
          share: filled[k].share,
          power: filled[k].power,
          why: '当前占比 ' + (filled[k].share * 100).toFixed(1) + '%，属于已填板块里最薄弱的一档',
        })
      }
      if (filled.length) {
        out.caveats.push('占比只在你自己的面板内部可比，不同账号之间不可直接比占比。')
      }
    }

    if (out.gap !== null && out.gap === 0) {
      out.caveats.push('当前战力已达到或超过目标，无需追赶；若要继续，请先确认目标是否该上调。')
    }
    if (std && std.confidence === 'low') {
      out.caveats.push('「' + std.level + ' 级达标 ' + fmtPower(std.power) + '」是社区口径、置信度低，不要当硬指标。')
    }
    out.caveats.push('战力达标线 ≠ 团本通关门槛：后者要高得多（如 160 级团本实测队伍 3000~4600 万）。')
    return out
  }

  // ───────────────────────────────── 格式化

  function fmtPower(n) {
    var v = sanitizeNumber(n, null)
    if (v === null) return '—'
    var abs = Math.abs(v)
    if (abs >= 1e8) return (v / 1e8).toFixed(2) + ' 亿'
    if (abs >= 1e4) return (v / 1e4).toFixed(1) + ' 万'
    return String(Math.round(v))
  }

  function fmtPct(x, digits) {
    var v = sanitizeNumber(x, null)
    if (v === null) return '—'
    return (v * 100).toFixed(digits === undefined ? 1 : digits) + '%'
  }

  // ───────────────────────────────── 导入 / 导出（带版本迁移）

  function exportPanel(input) {
    var v = validate(input)
    return {
      format: 'naruto-workbench-panel',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      dataVersion: DATA.version || null,
      coreVersion: CORE_VERSION,
      panel: v.panel,
    }
  }

  /**
   * 导入：接受 ①本工具导出的信封 ②裸面板对象 ③任何带 boards 的对象。
   * 永不抛错。
   */
  function importPanel(raw) {
    var warnings = []
    var payload = raw
    if (typeof raw === 'string') {
      try {
        payload = JSON.parse(raw)
      } catch (e) {
        return { ok: false, panel: null, warnings: ['JSON 解析失败：' + String(e.message).slice(0, 120)] }
      }
    }
    if (!isPlainObject(payload)) {
      return { ok: false, panel: null, warnings: ['导入内容不是对象'] }
    }
    if (payload.format === 'naruto-workbench-panel' && isPlainObject(payload.panel)) {
      var sv = sanitizeNumber(payload.schemaVersion, 1)
      if (sv > SCHEMA_VERSION) {
        warnings.push('文件版本 v' + sv + ' 高于本工具 v' + SCHEMA_VERSION + '，可能丢失部分字段')
      }
      if (payload.dataVersion && DATA.version && payload.dataVersion !== DATA.version) {
        warnings.push('数据版本不同（文件 ' + payload.dataVersion + ' / 当前 ' + DATA.version + '），数值口径可能已变')
      }
      payload = payload.panel
    }
    var v = validate(payload)
    return { ok: true, panel: v.panel, warnings: warnings.concat(v.warnings) }
  }

  // ───────────────────────────────── Agent 提示词（给任何 AI 用，不限 DSH）

  function buildAgentPrompt(input) {
    var comp = compute(input)
    var infl = inflation(comp)
    var plan = planTarget({
      currentPower: comp.totalPower,
      targetPower: comp.targetPower,
      level: comp.level,
      computed: comp,
    })

    var lines = []
    lines.push('你是《火影忍者》手游的战力规划助手。下面是我在战力工作台里填的真实面板，请据此分析。')
    lines.push('')
    lines.push('【硬性要求】')
    lines.push('1. 只用我给的数据和下面附带的数据表；查不到就说查不到，**不要编数字**。')
    lines.push('2. 每个数字都要标来源或置信度。')
    lines.push('3. 注意：属性伤害公式是「只取最高那一系属攻 − 对方该系属防，再 ÷20 = 属性百分比伤害」。')
    lines.push('4. 注意：网上的 huoyin.qq.com 是《火影忍者OL》端游资料，**不能用于本作手游**。')
    lines.push('')
    lines.push('【我的面板】')
    lines.push('- 等级：' + (comp.level === null ? '未填' : comp.level))
    lines.push('- 目标战力：' + (comp.targetPower === null ? '未填' : fmtPower(comp.targetPower)))
    var cb = comp.collectionBonus || {}
    var cbParts = []
    for (var i = 0; i < APPLIES.length; i++) {
      if (cb[APPLIES[i]] !== undefined) cbParts.push(APPLIES[i] + ' ' + fmtPct(cb[APPLIES[i]]))
    }
    lines.push('- 忍者收集加成：' + (cbParts.length ? cbParts.join(' / ') : '未填'))
    lines.push('')
    lines.push('| 板块 | 战力 | 占比 |')
    lines.push('|---|---|---|')
    for (var b = 0; b < comp.boards.length; b++) {
      var row = comp.boards[b]
      if (!row.filled) continue
      lines.push('| ' + row.boardName + ' | ' + fmtPower(row.power) + ' | ' + fmtPct(row.share) + ' |')
    }
    lines.push('| **合计** | **' + fmtPower(comp.totalPower) + '** | 100% |')
    if (comp.unfilled.length) {
      lines.push('')
      lines.push('未填板块（这些**不能当作 0**，只能视为未知）：' + comp.unfilled.join('、'))
    }
    lines.push('')
    lines.push('【工具算出的初步结论】')
    if (plan.standard) {
      lines.push('- ' + plan.standard.level + ' 级社区达标线：' + fmtPower(plan.standard.power) +
        '（置信度 ' + plan.standard.confidence + '）→ 我当前' + (plan.vsStandardLabel || '无法判断'))
    }
    if (plan.gap !== null) lines.push('- 距目标缺口：' + fmtPower(plan.gap))
    lines.push('- 虚战诊断：' + infl.level + (infl.inflationScore === null ? '' : '（失衡度 ' + infl.inflationScore + '/100）'))
    for (var r = 0; r < infl.reasons.length; r++) lines.push('  - ' + infl.reasons[r])
    if (plan.directions.length) {
      lines.push('- 相对最薄弱的板块：')
      for (var d = 0; d < plan.directions.length; d++) {
        lines.push('  - ' + plan.directions[d].boardName + '（占比 ' + fmtPct(plan.directions[d].share) + '）')
      }
    }
    lines.push('')
    lines.push('【请输出】')
    lines.push('1) 我的面板结构问题（结合占比与达标线）')
    lines.push('2) 按性价比排序的提升方向，并说明每条的**依据与置信度**')
    lines.push('3) 需要我补测哪些数据才能给出更准的结论')
    lines.push('4) 明确列出你**无法确定**的部分')

    return lines.join('\n')
  }

  // ───────────────────────────────── 对外 API

  return {
    CORE_VERSION: CORE_VERSION,
    SCHEMA_VERSION: SCHEMA_VERSION,
    DATA: DATA,
    BOARDS: BOARDS,
    ATTRS: ATTRS,
    ATTR_KEYS: ATTR_KEYS,
    WEIGHTS: WEIGHTS,
    sanitizeNumber: sanitizeNumber,
    isPlainObject: isPlainObject,
    deepClone: deepClone,
    validate: validate,
    boardPower: boardPower,
    compute: compute,
    inflation: inflation,
    planTarget: planTarget,
    nearestStandard: nearestStandard,
    fmtPower: fmtPower,
    fmtPct: fmtPct,
    exportPanel: exportPanel,
    importPanel: importPanel,
    buildAgentPrompt: buildAgentPrompt,
    cautions: DATA.cautions || [],
    sources: DATA.sources || {},
  }
}
