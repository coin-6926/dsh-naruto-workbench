/**
 * @dsh-external/naruto-workbench — CLIENT 半身（工作台面板）
 *
 * 挂载点：conversation.input.dock（输入框上方的一整条 dock）。
 * 为什么选这个位置：工作台要「和 agent 对话」，而 agent 的对话入口就是输入框；
 * 面板里算完 → 一键把结构化结论写进输入框 → 用户点发送，agent 用真实数据回答，形成闭环。
 *
 * 格式：`window.__ModuleLoader__.load({ id, factory })` —— dsh-client-modules 的 bundle 契约。
 * 手写而非 tsdown 产物（本机无 DSH checkout/tsc）；结构与 scaffold 生成的产物一致：
 * factory 内建 module/exports 对象，末尾 return module.exports。
 */
window.__ModuleLoader__.load({
  id: '@dsh-external/naruto-workbench',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports

const PANEL_ID = '@dsh-external/naruto-workbench/panel'
const LS_PANEL = 'naruto-workbench:panel:v1'
const LS_OPEN = 'naruto-workbench:open:v1'

/* ─────────────────── 与 host 同源的最小数据（渲染 + 本地换算） ── */

const ATTRS = [
  { id: 'hp', name: '生命', w: 1 },
  { id: 'atk', name: '攻击', w: 3.5 },
  { id: 'def', name: '防御', w: 11.6 },
  { id: 'crit', name: '暴击', w: 6 },
  { id: 'critResist', name: '抗暴', w: 10 },
  { id: 'elemAtk', name: '属攻', w: 6 },
  { id: 'elemDef', name: '属防', w: 10 },
]

const BOARDS = [
  ['equipment', '装备'], ['jade', '勾玉'], ['accessory', '饰品'], ['artifact', '神器'],
  ['tool_body', '忍具(身)'], ['spirit', '通灵'], ['tool_museum', '忍具藏馆'],
  ['ninja_insight', '忍传感悟'], ['bond_card', '羁绊名片'], ['title', '称号'],
  ['scroll', '密卷'], ['avatar_frame', '头像框'], ['talent', '天赋'],
  ['talent_shura', '修罗天赋'], ['rune', '符文镶嵌'], ['costume', '装扮'],
]

/** 分阶段战力基准（社区标准表，容差 ±50 万） */
const STANDARDS = [
  [60, 600000], [70, 750000], [80, 1000000], [90, 1500000], [100, 2500000],
  [110, 3000000], [120, 4000000], [125, 4800000], [130, 5600000],
  [140, 8000000], [145, 11000000], [150, 15000000],
]

const STD_TOLERANCE = 500000

/* ───────────────────────────────────────────── 小工具 ── */

function fmt(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return Math.round(n).toLocaleString('zh-CN')
}
function fmtWan(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1) + ' 万'
  return String(Math.round(n))
}
function el(tag, css, text) {
  const e = document.createElement(tag)
  if (css) e.className = css
  if (text !== undefined) e.textContent = text
  return e
}
function num(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/* ─────────────────────────────────────────── 面板状态 ── */

function emptyState() {
  return { level: null, targetPower: null, collectionBonus: { hp: 0, atk: 0, def: 0 }, boards: {} }
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_PANEL)
    if (!raw) return emptyState()
    const p = JSON.parse(raw)
    const cb = p.collectionBonus || {}
    return {
      level: num(p.level),
      targetPower: num(p.targetPower),
      collectionBonus: { hp: num(cb.hp) || 0, atk: num(cb.atk) || 0, def: num(cb.def) || 0 },
      boards: (p.boards && typeof p.boards === 'object') ? p.boards : {},
    }
  } catch { return emptyState() }
}
function saveState(s) {
  try { localStorage.setItem(LS_PANEL, JSON.stringify(s)) } catch { /* ignore */ }
}

/* ───────────────────────────── 本地计算（与 host power-engine 一致） ── */

function boardPower(attrs, bonus) {
  if (!attrs) return 0
  let p = 0
  for (const a of ATTRS) {
    const v = num(attrs[a.id])
    if (v === null || v <= 0) continue
    const applyCb = (a.id === 'hp' || a.id === 'atk' || a.id === 'def')
    const cb = applyCb ? 1 + (bonus[a.id] || 0) / 100 : 1
    p += v * a.w * cb
  }
  return p
}

function compute(s) {
  const rows = BOARDS.map(([id, name]) => {
    const attrs = s.boards[id]
    const filled = !!attrs && Object.keys(attrs).length > 0
    return { id, name, attrs: attrs || {}, filled, power: filled ? boardPower(attrs, s.collectionBonus) : 0, share: null }
  })
  let total = 0
  for (const r of rows) total += r.power
  for (const r of rows) r.share = (total > 0 && r.filled) ? r.power / total : null
  const filledRows = rows.filter((r) => r.filled).sort((a, b) => b.power - a.power)
  return { rows, total, filledRows, filledCount: filledRows.length }
}

/** 虚战：只判「资源分布是否失衡」，绝不按属性种类（作者原话已否定后者） */
function inflation(comp) {
  const shares = []
  for (const r of comp.filledRows) if (r.share != null) shares.push(r.share)
  if (shares.length < 2) {
    return { score: null, level: '数据不足', reasons: ['已填板块少于 2 个，无法判断分布是否失衡 —— 不做猜测。'] }
  }
  const n = shares.length
  const avg = 1 / n
  let dev = 0
  for (const x of shares) dev += Math.abs(x - avg)
  const imbalance = dev / (2 * (1 - avg))
  let maxShare = 0
  for (const x of shares) if (x > maxShare) maxShare = x
  const over = Math.max(0, (maxShare - 0.25) / 0.75)
  const score = Math.round(Math.min(100, 100 * (0.7 * imbalance + 0.3 * over)))
  const level = score >= 60 ? '虚战仔' : score >= 35 ? '偏虚' : score >= 15 ? '均衡' : '实战型'
  const reasons = ['失衡度 ' + Math.round(imbalance * 100) + '/100：' + n + ' 个已填板块，平均占比 '
    + (avg * 100).toFixed(1) + '%，最高 ' + (maxShare * 100).toFixed(1) + '%。']
  if (maxShare > 0.25) reasons.push('最高板块占比 ' + (maxShare * 100).toFixed(1) + '% 超过集中阈值 25%。')
  return { score, level, reasons }
}

function targetPlan(s, comp) {
  let bench = null
  if (s.level !== null) for (const row of STANDARDS) if (s.level >= row[0]) bench = row
  const verdict = (bench && comp.total > 0)
    ? (comp.total >= bench[1] - STD_TOLERANCE ? '达标' : (comp.total >= bench[1] * 0.8 ? '偏低' : '明显偏低'))
    : null
  const gap = s.targetPower !== null ? Math.max(0, s.targetPower - comp.total) : 0
  return { bench, verdict, gap }
}

/* ─────────────────────── 生成给 agent 的 prompt（核心闭环） ── */

function buildPrompt(s, comp, inf, tp) {
  const L = []
  L.push('【火影忍者手游 · 战力工作台】我填了一份战力面板，请基于下面的**真实数据**帮我分析。')
  L.push('')
  L.push('## 我的面板')
  if (s.level !== null) L.push('- 角色等级：' + s.level + ' 级')
  L.push('- 模型估算总战力：' + fmt(comp.total) + '（' + comp.filledCount + '/16 个板块已填）')
  if (s.collectionBonus.hp || s.collectionBonus.atk || s.collectionBonus.def) {
    L.push('- 忍者收集加成：生命 ' + s.collectionBonus.hp + '% / 攻击 ' + s.collectionBonus.atk + '% / 防御 ' + s.collectionBonus.def + '%')
  }
  if (s.targetPower !== null) L.push('- 我的目标战力：' + fmt(s.targetPower) + '（还差 ' + fmtWan(tp.gap) + '）')
  L.push('')
  if (comp.filledRows.length) {
    L.push('## 各板块战力与占比')
    for (const r of comp.filledRows) {
      L.push('- ' + r.name + '：' + fmt(r.power) + '（占比 ' + (r.share != null ? (r.share * 100).toFixed(1) + '%' : '—') + '）')
    }
    L.push('')
  }
  L.push('## 本地引擎的诊断')
  L.push('- 虚战分：' + (inf.score === null ? '数据不足（不猜）' : inf.score + '/100') + ' → ' + inf.level)
  for (const r of inf.reasons) L.push('  - ' + r)
  if (tp.bench) L.push('- 战力基准：' + tp.bench[0] + ' 级约 ' + fmtWan(tp.bench[1]) + '（社区标准表，容差 ±50 万），我是「' + (tp.verdict || '无法判断') + '」')
  L.push('')
  L.push('## 我想知道')
  L.push('1. 我这套面板的短板在哪、下一步该优先投什么（给出具体顺序与理由）')
  if (tp.gap > 0) L.push('2. 要补齐 ' + fmtWan(tp.gap) + ' 战力，按性价比该先做哪几件事')
  L.push('3. 我的资源分布算不算「虚战」（注意：虚战按作者定义是"透支潜力"，不是堆某种属性）')
  L.push('')
  L.push('约束：涉及具体数值与收益对比时，请先用 naruto_reference 工具查内置数据表，不要凭空编数字；不确定的明说「未确证」。')
  return L.join('\n')
}

/* ────────────────────────── 把文本写进对话输入框（带回退） ── */

function insertToComposer(text) {
  const selectors = [
    'textarea[data-testid="composer-input"]',
    '.composer textarea',
    '[class*="composer"] textarea',
    'form textarea',
    'textarea',
  ]
  let target = null
  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel)
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      if (n.offsetParent !== null && !n.disabled && !n.readOnly) { target = n; break }
    }
    if (target) break
  }
  if (target) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')
    if (setter && setter.set) setter.set.call(target, text)
    else target.value = text
    target.dispatchEvent(new Event('input', { bubbles: true }))
    target.dispatchEvent(new Event('change', { bubbles: true }))
    target.focus()
    return { ok: true, mode: 'textarea' }
  }
  // 回退：Lexical 等 contenteditable
  const ce = document.querySelector('[contenteditable="true"]')
  if (ce) {
    ce.focus()
    const ok = document.execCommand && document.execCommand('insertText', false, text)
    if (ok) return { ok: true, mode: 'contenteditable' }
  }
  return { ok: false, mode: 'none' }
}

/* ─────────────────────────────────────────── 面板渲染 ── */

function renderPanel(host) {
  let state = loadState()

  const root = el('div', 'nw-root')
  host.appendChild(root)

  /* ---- 顶部按钮条 ---- */
  const bar = el('div', 'nw-bar')
  const btnFill = el('button', 'nw-btn nw-btn-primary', '📋 填入面板')
  const btnSample = el('button', 'nw-btn', '🧪 载入示例')
  const btnClear = el('button', 'nw-btn', '🧹 清空')
  const btnAsk = el('button', 'nw-btn nw-btn-accent', '🤖 交给 agent 分析')
  bar.append(btnFill, btnSample, btnClear, btnAsk)
  root.appendChild(bar)

  /* ---- 摘要（永远可见） ---- */
  const summary = el('div', 'nw-summary')
  root.appendChild(summary)

  /* ---- 展开体 ---- */
  const body = el('div', 'nw-body')
  root.appendChild(body)

  /* 基础字段 */
  const basics = el('div', 'nw-grid2')
  const inLevel = el('input', 'nw-input')
  inLevel.type = 'number'
  inLevel.placeholder = '例如 145'
  const inTarget = el('input', 'nw-input')
  inTarget.type = 'number'
  inTarget.placeholder = '例如 11000000'
  const f1 = el('label', 'nw-field')
  f1.append(el('span', 'nw-label', '角色等级'), inLevel)
  const f2 = el('label', 'nw-field')
  f2.append(el('span', 'nw-label', '目标战力'), inTarget)
  basics.append(f1, f2)
  body.appendChild(basics)

  /* 收集加成 */
  const cbWrap = el('div', 'nw-cb')
  cbWrap.appendChild(el('div', 'nw-cb-title', '忍者收集加成（不填按 0% 算，会让战力被低估约两成）'))
  const cbGrid = el('div', 'nw-grid3')
  const cbInputs = {}
  for (const pair of [['hp', '生命 %'], ['atk', '攻击 %'], ['def', '防御 %']]) {
    const inp = el('input', 'nw-input')
    inp.type = 'number'
    inp.placeholder = '例如 28'
    cbInputs[pair[0]] = inp
    const f = el('label', 'nw-field')
    f.append(el('span', 'nw-label', pair[1]), inp)
    cbGrid.appendChild(f)
  }
  cbWrap.appendChild(cbGrid)
  body.appendChild(cbWrap)

  /* 16 板块表格 */
  const tblWrap = el('div', 'nw-tablewrap')
  const tbl = el('table', 'nw-table')
  const thead = el('thead')
  const htr = el('tr')
  htr.appendChild(el('th', null, '板块'))
  for (const a of ATTRS) htr.appendChild(el('th', null, a.name))
  htr.appendChild(el('th', null, '战力'))
  thead.appendChild(htr)
  tbl.appendChild(thead)

  const tbody = el('tbody')
  const cellInputs = {}
  const rowEls = []
  for (const pair of BOARDS) {
    const tr = el('tr')
    tr.appendChild(el('td', 'nw-td-name', pair[1]))
    cellInputs[pair[0]] = {}
    for (const a of ATTRS) {
      const td = el('td')
      const inp = el('input', 'nw-cell')
      inp.type = 'number'
      inp.inputMode = 'numeric'
      inp.placeholder = '—'
      cellInputs[pair[0]][a.id] = inp
      td.appendChild(inp)
      tr.appendChild(td)
    }
    tr.appendChild(el('td', 'nw-td-power', '—'))
    tbody.appendChild(tr)
    rowEls.push(tr)
  }
  tbl.appendChild(tbody)

  const tfoot = el('tfoot')
  const ftr = el('tr')
  ftr.appendChild(el('td', 'nw-td-name', '合计'))
  for (let i = 0; i < ATTRS.length; i++) ftr.appendChild(el('td', 'nw-td-sum', '—'))
  ftr.appendChild(el('td', 'nw-td-total', '—'))
  tfoot.appendChild(ftr)
  tbl.appendChild(tfoot)
  tblWrap.appendChild(tbl)
  body.appendChild(tblWrap)

  const results = el('div', 'nw-results')
  body.appendChild(results)

  /* ---- 状态 → 控件 ---- */
  function paint() {
    inLevel.value = state.level === null ? '' : String(state.level)
    inTarget.value = state.targetPower === null ? '' : String(state.targetPower)
    for (const k of ['hp', 'atk', 'def']) {
      const v = state.collectionBonus[k]
      cbInputs[k].value = v ? String(v) : ''
    }
    for (const pair of BOARDS) {
      const id = pair[0]
      const row = state.boards[id]
      for (const a of ATTRS) {
        const v = row ? row[a.id] : undefined
        cellInputs[id][a.id].value = (v === undefined || v === null) ? '' : String(v)
      }
    }
  }

  /* ---- 控件 → 状态（只记真的填了的键，可区分"没填"与"填 0"） ---- */
  function collect() {
    state.level = num(inLevel.value)
    state.targetPower = num(inTarget.value)
    state.collectionBonus = {
      hp: num(cbInputs.hp.value) || 0,
      atk: num(cbInputs.atk.value) || 0,
      def: num(cbInputs.def.value) || 0,
    }
    const boards = {}
    for (const pair of BOARDS) {
      const id = pair[0]
      const attrs = {}
      for (const a of ATTRS) {
        const v = num(cellInputs[id][a.id].value)
        if (v !== null) attrs[a.id] = v
      }
      if (Object.keys(attrs).length) boards[id] = attrs
    }
    state.boards = boards
  }

  /* ---- 重算 + 重绘 ---- */
  function refresh() {
    const comp = compute(state)
    const inf = inflation(comp)
    const tp = targetPlan(state, comp)

    // 表格内行战力 + 合计
    const sums = {}
    for (const a of ATTRS) sums[a.id] = 0
    for (let i = 0; i < BOARDS.length; i++) {
      const id = BOARDS[i][0]
      const attrs = state.boards[id]
      const filled = !!attrs && Object.keys(attrs).length > 0
      const p = filled ? boardPower(attrs, state.collectionBonus) : 0
      rowEls[i].lastElementChild.textContent = filled ? fmtWan(p) : '—'
      rowEls[i].classList.toggle('nw-row-filled', filled)
      for (const a of ATTRS) {
        const v = attrs ? num(attrs[a.id]) : null
        if (v !== null) sums[a.id] += v
      }
    }
    const ftrCells = ftr.querySelectorAll('td')
    for (let i = 0; i < ATTRS.length; i++) {
      ftrCells[i + 1].textContent = sums[ATTRS[i].id] > 0 ? fmt(sums[ATTRS[i].id]) : '—'
    }
    ftrCells[ATTRS.length + 1].textContent = comp.total > 0 ? fmt(comp.total) : '—'

    // 摘要
    summary.textContent = ''
    function chip(label, value, cls) {
      const c = el('span', 'nw-chip' + (cls ? ' ' + cls : ''))
      c.append(el('span', 'nw-chip-k', label), el('span', 'nw-chip-v', value))
      return c
    }
    summary.append(
      chip('总战力', comp.total > 0 ? fmtWan(comp.total) : '—', 'nw-chip-main'),
      chip('已填板块', comp.filledCount + '/16'),
      chip('虚战分', inf.score === null ? '—' : String(inf.score), (inf.score !== null && inf.score >= 35) ? 'nw-chip-warn' : '')
    )
    if (tp.bench) {
      summary.append(chip(tp.bench[0] + '级基准', fmtWan(tp.bench[1])))
      summary.append(chip('我的水平', tp.verdict || '—', tp.verdict === '达标' ? 'nw-chip-ok' : 'nw-chip-warn'))
    }
    if (tp.gap > 0) summary.append(chip('距目标', fmtWan(tp.gap), 'nw-chip-warn'))

    // 结果区
    results.textContent = ''
    if (comp.filledCount === 0) {
      const tip = el('div', 'nw-tip')
      tip.textContent = '还没有填任何板块。点「📋 填入面板」展开表格逐项填写，或点「🧪 载入示例」先看效果。'
      results.appendChild(tip)
      return
    }

    // 占比
    const secShare = el('div', 'nw-sec')
    secShare.appendChild(el('div', 'nw-sec-title', '板块占比'))
    const maxP = comp.filledRows[0] ? comp.filledRows[0].power : 1
    for (const r of comp.filledRows) {
      const line = el('div', 'nw-bar-line')
      line.appendChild(el('span', 'nw-bar-name', r.name))
      const track = el('div', 'nw-bar-track')
      const fill = el('i')
      fill.style.width = Math.max(2, (r.power / maxP) * 100) + '%'
      if (r.share != null && r.share < 0.03) fill.className = 'nw-weak'
      track.appendChild(fill)
      line.appendChild(track)
      line.appendChild(el('span', 'nw-bar-val', r.share != null ? (r.share * 100).toFixed(1) + '%' : '—'))
      secShare.appendChild(line)
    }
    results.appendChild(secShare)

    // 虚战
    const secInf = el('div', 'nw-sec')
    secInf.appendChild(el('div', 'nw-sec-title', '虚战诊断'))
    const bad = inf.score !== null && inf.score >= 35
    const infBox = el('div', 'nw-inf ' + (bad ? 'nw-inf-warn' : 'nw-inf-ok'))
    infBox.appendChild(el('div', 'nw-inf-level', inf.level + (inf.score !== null ? '（' + inf.score + '/100）' : '')))
    for (const r of inf.reasons) infBox.appendChild(el('div', 'nw-inf-r', '· ' + r))
    infBox.appendChild(el('div', 'nw-inf-note',
      '口径：虚战按视频作者定义 = 不计后果透支潜力换战力，与「堆暴击 / 堆生命」无关。'
      + '这里只判断「资源分布是否失衡」，且只跟你自己的面板比。'))
    secInf.appendChild(infBox)
    results.appendChild(secInf)

    // 目标与下一步
    if (tp.gap > 0 || tp.bench) {
      const secT = el('div', 'nw-sec')
      secT.appendChild(el('div', 'nw-sec-title', '目标与下一步'))
      if (tp.gap > 0) secT.appendChild(el('div', 'nw-line', '还差 ' + fmtWan(tp.gap) + ' 战力（目标 ' + fmt(tp.targetPower) + '）'))
      if (tp.bench) secT.appendChild(el('div', 'nw-line', tp.bench[0] + ' 级社区基准约 ' + fmtWan(tp.bench[1]) + '（容差 ±50 万），你是「' + tp.verdict + '」'))
      const ol = el('ol', 'nw-ol')
      const steps = [
        '通灵进阶全部到 +4 —— 单点性价比最高（约 +1.9 万战力）',
        '勾玉全孔铺到 4 级 —— 凹曲线，铺满低等级优于堆单孔',
        '神器：先把 ≤70 / ≤140 两档清空，白牙后单位轮回石收益腰斩',
        '忍具：有究忍具推到 +15（一星究+15 继承二星只掉 2 级）',
        '饰品：主力件强到当前阶段上限（单件爆发最高，但耗绿水/保护符大）',
      ]
      for (const s2 of steps) ol.appendChild(el('li', null, s2))
      secT.appendChild(ol)
      secT.appendChild(el('div', 'nw-inf-note', '想让 agent 按你的实际情况排序，点上方「🤖 交给 agent 分析」。'))
      results.appendChild(secT)
    }
  }

  /* ---- 事件 ---- */
  let timer
  function onEdit() {
    collect()
    saveState(state)
    if (timer) clearTimeout(timer)
    timer = setTimeout(refresh, 120)
  }
  body.addEventListener('input', onEdit)
  body.addEventListener('change', onEdit)

  btnFill.addEventListener('click', () => {
    const collapsed = body.classList.toggle('nw-collapsed')
    btnFill.textContent = collapsed ? '📋 填入面板' : '📋 收起表格'
  })

  btnSample.addEventListener('click', () => {
    state = {
      level: 145,
      targetPower: 11000000,
      collectionBonus: { hp: 28, atk: 22, def: 20 },
      boards: {
        equipment: { hp: 598717, atk: 49893, def: 23949, crit: 15966, critResist: 9979, elemAtk: 5987, elemDef: 5987 },
        accessory: { hp: 636137, atk: 53011, def: 25445, crit: 16964, critResist: 10602, elemAtk: 6361, elemDef: 6361 },
        spirit: { hp: 486457, atk: 40538, def: 19458, crit: 12972, critResist: 8108, elemAtk: 4865, elemDef: 4865 },
        jade: { hp: 374198, atk: 31183, def: 14968, crit: 9979, critResist: 6237, elemAtk: 3742, elemDef: 3742 },
        artifact: { hp: 318068, atk: 26506, def: 12723, crit: 8482, critResist: 5301, elemAtk: 3181, elemDef: 3181 },
        tool_body: { hp: 299358, atk: 24947, def: 11974, crit: 7983, critResist: 4989, elemAtk: 2994, elemDef: 2994 },
        tool_museum: { hp: 224519, atk: 18710, def: 8981, crit: 5987, critResist: 3742, elemAtk: 2245, elemDef: 2245 },
        ninja_insight: { hp: 205809, atk: 17151, def: 8232, crit: 5488, critResist: 3430, elemAtk: 2058, elemDef: 2058 },
        bond_card: { hp: 168389, atk: 14032, def: 6736, crit: 4490, critResist: 2806, elemAtk: 1684, elemDef: 1684 },
        title: { hp: 93550, atk: 7796, def: 3742, crit: 2495, critResist: 1559, elemAtk: 935, elemDef: 935 },
        scroll: { hp: 67356, atk: 5613, def: 2694, crit: 1796, critResist: 1123, elemAtk: 674, elemDef: 674 },
        avatar_frame: { hp: 52388, atk: 4366, def: 2096, crit: 1397, critResist: 873, elemAtk: 524, elemDef: 524 },
        talent: { hp: 261939, atk: 21828, def: 10478, crit: 6985, critResist: 4366, elemAtk: 2619, elemDef: 2619 },
        talent_shura: { hp: 112259, atk: 9355, def: 4490, crit: 2994, critResist: 1871, elemAtk: 1123, elemDef: 1123 },
        rune: { hp: 130969, atk: 10914, def: 5239, crit: 3493, critResist: 2183, elemAtk: 1310, elemDef: 1310 },
        costume: { hp: 74840, atk: 6237, def: 2994, crit: 1996, critResist: 1247, elemAtk: 748, elemDef: 748 },
      },
    }
    paint(); saveState(state); refresh()
    body.classList.remove('nw-collapsed')
    btnFill.textContent = '📋 收起表格'
  })

  btnClear.addEventListener('click', () => {
    state = emptyState()
    paint(); saveState(state); refresh()
  })

  btnAsk.addEventListener('click', () => {
    collect(); saveState(state)
    const comp = compute(state)
    let text
    if (comp.filledCount === 0) {
      text = '【火影忍者手游 · 战力工作台】我还没填面板数据。请先告诉我：要分析战力需要提供哪些信息'
        + '（16 板块里哪些属性最关键）、能不能从游戏里快速查到这些数值，以及在我补齐数据前，'
        + '你能先给我哪些不依赖面板的建议。'
    } else {
      text = buildPrompt(state, comp, inflation(comp), targetPlan(state, comp))
    }
    const r = insertToComposer(text)
    const note = el('div', 'nw-toast' + (r.ok ? '' : ' nw-toast-warn'),
      r.ok ? '已写入对话输入框，确认后点发送即可。' : '没找到输入框：内容已复制到剪贴板，请粘贴到对话框。')
    root.appendChild(note)
    if (!r.ok) {
      try { void navigator.clipboard.writeText(text) } catch { /* ignore */ }
    }
    setTimeout(() => note.remove(), 4000)
  })

  paint()
  refresh()
  body.classList.add('nw-collapsed')

  return () => { root.remove() }
}

/* ───────────────────────────────────────── 样式（内联，零外部依赖） ── */

const CSS = `
.nw-wrap{border-top:1px solid var(--dsh-color-border,rgba(255,255,255,.1));font-size:12.5px}
.nw-header{display:flex;align-items:center;gap:10px;padding:6px 10px}
.nw-title{font-weight:700;font-size:12.5px}
.nw-hint{color:var(--dsh-color-text-3,#8b95a7);font-size:11.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nw-open{cursor:pointer;border:1px solid rgba(240,168,50,.4);background:rgba(240,168,50,.12);color:#f0a832;border-radius:6px;padding:2px 9px;font-size:11.5px}
.nw-host{padding:0 10px 10px}
.nw-bar{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.nw-btn{cursor:pointer;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;border-radius:6px;padding:4px 10px;font-size:11.5px}
.nw-btn:hover{background:rgba(255,255,255,.1)}
.nw-btn-primary{border-color:rgba(240,168,50,.45);background:rgba(240,168,50,.15);color:#ffd479}
.nw-btn-accent{border-color:rgba(58,167,109,.5);background:rgba(58,167,109,.16);color:#6fd39a;font-weight:600}
.nw-summary{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.nw-chip{display:inline-flex;gap:5px;align-items:baseline;border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:3px 8px;background:rgba(255,255,255,.03)}
.nw-chip-k{color:var(--dsh-color-text-3,#8b95a7);font-size:11px}
.nw-chip-v{font-weight:700;font-size:12px}
.nw-chip-main .nw-chip-v{color:#ffd479}
.nw-chip-warn .nw-chip-v{color:#f5c451}
.nw-chip-ok .nw-chip-v{color:#6fd39a}
.nw-body.nw-collapsed{display:none}
.nw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.nw-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.nw-field{display:flex;flex-direction:column;gap:3px}
.nw-label{color:var(--dsh-color-text-3,#8b95a7);font-size:11px}
.nw-input,.nw-cell{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:inherit;border-radius:5px;padding:4px 6px;font-size:11.5px;font-family:inherit}
.nw-cb{border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px;margin-bottom:8px;background:rgba(255,255,255,.02)}
.nw-cb-title{color:#f5c451;font-size:11.5px;margin-bottom:6px}
.nw-tablewrap{overflow:auto;max-height:330px;border:1px solid rgba(255,255,255,.1);border-radius:8px}
.nw-table{width:100%;border-collapse:collapse;font-size:11px;min-width:660px}
.nw-table th,.nw-table td{padding:3px 4px;border-bottom:1px solid rgba(255,255,255,.06);text-align:right}
.nw-table th{position:sticky;top:0;background:rgba(20,28,48,.98);color:var(--dsh-color-text-3,#8b95a7);font-weight:600;z-index:1}
.nw-table th:first-child,.nw-td-name{text-align:left;position:sticky;left:0;background:rgba(20,28,48,.98);z-index:2}
.nw-td-name{font-weight:600;white-space:nowrap}
.nw-row-filled .nw-td-name{color:#ffd479}
.nw-table tfoot td{position:sticky;bottom:0;background:rgba(20,28,48,.98);font-weight:700;border-top:1px solid rgba(255,255,255,.14)}
.nw-td-power,.nw-td-total{color:#ffd479;font-weight:700;white-space:nowrap}
.nw-results{display:grid;gap:8px;margin-top:8px}
.nw-sec{border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:8px;background:rgba(255,255,255,.02)}
.nw-sec-title{font-weight:700;margin-bottom:6px;font-size:11.5px;color:#ffd479}
.nw-bar-line{display:grid;grid-template-columns:74px 1fr 46px;align-items:center;gap:6px;margin-bottom:3px}
.nw-bar-name{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nw-bar-track{height:7px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}
.nw-bar-track > i{display:block;height:100%;background:linear-gradient(90deg,#f0a832,#ffd479)}
.nw-bar-track > i.nw-weak{background:linear-gradient(90deg,#d9534f,#f08a87)}
.nw-bar-val{font-size:10.5px;color:var(--dsh-color-text-3,#8b95a7);text-align:right}
.nw-inf{border-radius:7px;padding:7px 8px;border:1px solid}
.nw-inf-ok{border-color:rgba(58,167,109,.4);background:rgba(58,167,109,.08)}
.nw-inf-warn{border-color:rgba(245,196,81,.45);background:rgba(245,196,81,.08)}
.nw-inf-level{font-weight:700;margin-bottom:3px}
.nw-inf-r{font-size:11px;margin-bottom:2px}
.nw-inf-note{font-size:10.5px;color:var(--dsh-color-text-3,#8b95a7);margin-top:5px;line-height:1.5}
.nw-line{font-size:11.5px;margin-bottom:3px}
.nw-ol{margin:4px 0 0;padding-left:1.3em;font-size:11.5px;line-height:1.65}
.nw-tip{font-size:11.5px;color:var(--dsh-color-text-3,#8b95a7);line-height:1.6}
.nw-toast{margin-top:6px;font-size:11px;color:#6fd39a}
.nw-toast-warn{color:#f5c451}
@media (max-width:760px){.nw-grid3{grid-template-columns:1fr}.nw-bar-line{grid-template-columns:60px 1fr 40px}}
`

function injectCss() {
  const id = 'naruto-workbench-css'
  if (document.getElementById(id)) return
  const st = document.createElement('style')
  st.id = id
  st.textContent = CSS
  document.head.appendChild(st)
}

/* ───────────────────────────────────────── 注册 ── */

/** apply 用 ctx.slots，按 cordis 服务注入契约必须声明 inject */
const inject = ['slots']

function apply(ctx) {
  injectCss()
  const effect = typeof ctx.effect === 'function' ? ctx.effect : (fn) => { fn() }

  effect(() => {
    /* ★ 真实契约：register 接受**两个参数** (options, component)，不是把 component 塞进 options。
     *   见 @deepseek-ai/dsh-client-ui-slots 的 index.d.ts：
     *     register<K>(options: BaseOptions & {...}, component: C & SlotComponent<...>): () => void
     *
     *   曾经踩过：这里写成单参数（component 放在 options 里），结果自测的 stub 只校验了 spec.name
     *   而**没有校验 component 的位置**，所以测试全绿、但真实宿主根本拿不到组件，面板不渲染。
     *   selftest 第 7 节已加上「component 必须是函数且能返回 {render}」的硬断言。
     */
    const dispose = ctx.slots.inject('conversation.input.dock', () =>
      ctx.slots.register(
        {
          name: 'conversation.input.dock',
          id: PANEL_ID,
          label: () => '战力工作台',
        },
        () => {
          let cleanup = null
          return {
            render() {
              const wrap = el('div', 'nw-wrap')
              let open = false
              try { open = localStorage.getItem(LS_OPEN) === '1' } catch { /* ignore */ }
              const header = el('div', 'nw-header')
              const title = el('span', 'nw-title', '🍥 战力工作台')
              const hint = el('span', 'nw-hint', '填面板 → 本地算 → 一键交给 agent 深入分析')
              const toggle = el('button', 'nw-open', open ? '收起' : '展开')
              header.append(title, hint, toggle)

              const bodyHost = el('div', 'nw-host')
              if (!open) bodyHost.style.display = 'none'
              wrap.append(header, bodyHost)
              cleanup = renderPanel(bodyHost)

              toggle.addEventListener('click', () => {
                const hidden = bodyHost.style.display === 'none'
                bodyHost.style.display = hidden ? '' : 'none'
                toggle.textContent = hidden ? '收起' : '展开'
                try { localStorage.setItem(LS_OPEN, hidden ? '1' : '0') } catch { /* ignore */ }
              })
              return wrap
            },
            dispose() { if (cleanup) cleanup() },
          }
        },
      ),
    )
    return () => { dispose() }
  }, '@dsh-external/naruto-workbench: workbench panel')
}

    module.exports = { apply, inject }
    return module.exports
  },
})


