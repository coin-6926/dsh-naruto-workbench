#!/usr/bin/env node
/*!
 * naruto-workbench CLI
 * 生成时间 2026-10-18T07:16:06.704Z
 * 本文件由 tools/build-portable.mjs 自动生成，请勿手改。
 */
/* eslint-disable */
/**
 * naruto-workbench CLI —— 在任意终端里算战力，不依赖浏览器或 DSH。
 *
 * 用法：
 *   node naruto-cli.cjs --sample
 *   node naruto-cli.cjs --panel panel.json
 *   cat panel.json | node naruto-cli.cjs
 *   node naruto-cli.cjs --panel panel.json --json
 *   node naruto-cli.cjs --panel panel.json --prompt
 *   node naruto-cli.cjs --export-sample > panel.json
 *
 * 退出码：0 成功 / 1 参数或输入错误 / 2 计算异常
 */
'use strict'

var fs = require('fs')
var path = require('path')

function loadCore() {
  // 允许同目录、或作为 npm 包被引用的两种布局
  var candidates = [
    path.join(__dirname, 'naruto-power.js'),
    path.join(__dirname, '..', 'lib', 'power-core.js'),
  ]
  for (var i = 0; i < candidates.length; i++) {
    try {
      if (fs.existsSync(candidates[i])) return require(candidates[i])
    } catch (e) {
      /* 继续试下一个 */
    }
  }
  try {
    return require('./naruto-power.js')
  } catch (e) {
    console.error('找不到核心模块 naruto-power.js。请先运行： node tools/build-portable.mjs')
    process.exit(1)
  }
}

var CORE = loadCore()

var SAMPLE = {
  level: 145,
  targetPower: 12000000,
  collectionBonus: { hp: 0.6, atk: 0.6, def: 0.6 },
  boards: {
    equipment: { hp: 420000, atk: 98000, def: 38000, crit: 32000, critResist: 26000 },
    jade: { hp: 260000, atk: 62000, def: 24000, crit: 21000, critResist: 18000 },
    accessory: { hp: 340000, atk: 82000, def: 30000, crit: 26000, critResist: 22000 },
    artifact: { hp: 180000, atk: 44000, def: 17000, crit: 14000, critResist: 12000 },
    tool_body: { hp: 300000, atk: 72000, def: 26000, crit: 22000, critResist: 19000 },
    spirit: { hp: 220000, atk: 54000, def: 20000, crit: 16000, critResist: 14000 },
    tool_museum: { hp: 150000, atk: 36000, def: 14000, crit: 11000, critResist: 9000 },
    ninja_insight: { hp: 120000, atk: 30000, def: 12000, crit: 9000, critResist: 8000 },
    bond_card: { hp: 60000, atk: 15000, def: 6000, crit: 5000, critResist: 4000 },
    title: { hp: 40000, atk: 10000, def: 4000, crit: 3000, critResist: 3000 },
    scroll: { hp: 50000, atk: 12000, def: 5000, crit: 4000, critResist: 3000 },
    avatar_frame: { hp: 30000, atk: 8000, def: 3000, crit: 2500, critResist: 2000 },
    talent: { hp: 70000, atk: 18000, def: 7000, crit: 5500, critResist: 4500 },
    talent_shura: { hp: 50000, atk: 13000, def: 5000, crit: 4000, critResist: 3500 },
    rune: { hp: 60000, atk: 15000, def: 6000, crit: 5000, critResist: 4000 },
    costume: { hp: 35000, atk: 9000, def: 3500, crit: 2800, critResist: 2200 },
  },
}

function parseArgs(argv) {
  var o = { _: [] }
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i]
    if (a === '--help' || a === '-h') o.help = true
    else if (a === '--json') o.json = true
    else if (a === '--prompt') o.prompt = true
    else if (a === '--sample') o.sample = true
    else if (a === '--export-sample') o.exportSample = true
    else if (a === '--sources') o.sources = true
    else if (a === '--panel' || a === '-p') o.panel = argv[++i]
    else if (a === '--income') o.income = argv[++i]
    else if (a.indexOf('--panel=') === 0) o.panel = a.slice(8)
    else if (a.indexOf('--income=') === 0) o.income = a.slice(9)
    else if (a.charAt(0) !== '-') o._.push(a)
    else {
      console.error('未知参数：' + a)
      o.unknown = true
    }
  }
  return o
}

var HELP = [
  '火影忍者手游 · 战力工作台 CLI',
  '',
  '用法：',
  '  node naruto-cli.cjs --sample                 用内置示例算一遍',
  '  node naruto-cli.cjs --panel panel.json       读面板文件',
  '  cat panel.json | node naruto-cli.cjs         从 stdin 读',
  '  node naruto-cli.cjs --panel p.json --json    输出机器可读 JSON',
  '  node naruto-cli.cjs --panel p.json --prompt  输出给 AI 的提示词',
  '  node naruto-cli.cjs --export-sample          把示例导出成面板 JSON',
  '  node naruto-cli.cjs --sources                列出所有数据来源',
  '',
  '选项：',
  '  -p, --panel <file>   面板 JSON 路径（支持本工具导出的信封或裸面板）',
  '      --income <n>     每日战力收益，给了才会估算"多少天"',
  '      --json           输出结构化 JSON（便于二次处理）',
  '      --prompt         输出可直接粘给任意 AI 的提示词',
  '      --sources        列出数据来源与置信度',
  '  -h, --help           显示本帮助',
  '',
  '退出码：0 成功 / 1 参数或输入错误 / 2 计算异常',
].join('\n')

function readStdinSync() {
  // 只在 stdin 不是 TTY 时读，避免交互终端挂住
  if (process.stdin.isTTY) return null
  try {
    return fs.readFileSync(0, 'utf8')
  } catch (e) {
    return null
  }
}

function main() {
  var args = parseArgs(process.argv.slice(2))

  if (args.help) {
    console.log(HELP)
    return 0
  }
  if (args.unknown) {
    console.error('\n' + HELP)
    return 1
  }
  if (args.sources) {
    var src = CORE.sources || {}
    var ids = Object.keys(src)
    console.log('共 ' + ids.length + ' 条来源：\n')
    for (var i = 0; i < ids.length; i++) {
      var s = src[ids[i]] || {}
      console.log('- ' + (s.title || ids[i]))
      if (s.url) console.log('    ' + s.url)
      var meta = []
      if (s.kind) meta.push(s.kind)
      if (s.verified === false) meta.push('内容未核对')
      else if (s.verified === 'partial') meta.push('页面不可核，内容按转写采信')
      if (meta.length) console.log('    [' + meta.join(' / ') + ']')
    }
    console.log('\n校准清单：')
    var cal = (CORE.DATA && CORE.DATA.powerStandards && CORE.DATA.powerStandards.raidRequirement) || null
    if (cal && cal.distinction) console.log('  ' + cal.distinction)
    ;(CORE.cautions || []).forEach(function (c) {
      console.log('  · ' + c)
    })
    return 0
  }
  if (args.exportSample) {
    process.stdout.write(JSON.stringify(CORE.exportPanel(SAMPLE), null, 2) + '\n')
    return 0
  }

  var raw
  if (args.sample) {
    raw = SAMPLE
  } else if (args.panel) {
    if (!fs.existsSync(args.panel)) {
      console.error('找不到文件：' + args.panel)
      return 1
    }
    raw = fs.readFileSync(args.panel, 'utf8')
  } else if (args._.length) {
    if (!fs.existsSync(args._[0])) {
      console.error('找不到文件：' + args._[0])
      return 1
    }
    raw = fs.readFileSync(args._[0], 'utf8')
  } else {
    raw = readStdinSync()
    if (!raw) {
      console.error('没有输入。用 --sample 试一下，或 --help 看用法。')
      return 1
    }
  }

  var imp = CORE.importPanel(raw)
  if (!imp.ok) {
    console.error('输入解析失败：' + (imp.warnings[0] || '未知'))
    return 1
  }
  var panel = imp.panel

  var comp = CORE.compute(panel)
  var infl = CORE.inflation(comp)
  var income = CORE.sanitizeNumber(args.income, null)
  var plan = CORE.planTarget({
    currentPower: comp.totalPower,
    targetPower: comp.targetPower,
    level: comp.level,
    incomePerDay: income,
    computed: comp,
  })

  if (args.json) {
    process.stdout.write(
      JSON.stringify(
        {
          core: CORE.CORE_VERSION,
          dataVersion: CORE.DATA && CORE.DATA.version,
          warnings: imp.warnings.concat(comp.warnings || []),
          compute: comp,
          inflation: infl,
          plan: plan,
        },
        null,
        2,
      ) + '\n',
    )
    return 0
  }

  if (args.prompt) {
    process.stdout.write(CORE.buildAgentPrompt(panel) + '\n')
    return 0
  }

  var L = []
  L.push('══════════ 火影忍者手游 · 战力工作台 ══════════')
  L.push('数据版本 ' + ((CORE.DATA && CORE.DATA.version) || '?') + '   核心 v' + CORE.CORE_VERSION)
  L.push('')
  L.push('等级：' + (comp.level === null ? '未填' : comp.level) +
    '    目标：' + (comp.targetPower === null ? '未填' : CORE.fmtPower(comp.targetPower)))
  L.push('总战力（已填部分）：' + CORE.fmtPower(comp.totalPower) +
    '    已填板块：' + comp.filledCount + '/' + comp.totalBoards)
  L.push('')
  L.push('── 板块构成 ──')
  var rows = comp.boards.filter(function (b) { return b.filled })
  rows.sort(function (a, b) { return b.power - a.power })
  for (var r = 0; r < rows.length; r++) {
    var b = rows[r]
    var name = b.boardName
    // 中文字符宽度按 2 计，做简单对齐
    var w = 0
    for (var ci = 0; ci < name.length; ci++) w += name.charCodeAt(ci) > 127 ? 2 : 1
    var pad = new Array(Math.max(1, 18 - w + 1)).join(' ')
    L.push('  ' + name + pad + CORE.fmtPower(b.power).padStart(10) + '   ' + CORE.fmtPct(b.share))
  }
  L.push('  ' + '合计'.padEnd(16) + CORE.fmtPower(comp.totalPower).padStart(11) + '   100%')
  if (comp.unfilled.length) {
    L.push('')
    L.push('未填（视为未知，不是 0）：' + comp.unfilled.join('、'))
  }
  L.push('')
  L.push('── 虚战诊断 ──')
  L.push('  结论：' + infl.level + (infl.inflationScore === null ? '' : '（失衡度 ' + infl.inflationScore + '/100）'))
  infl.reasons.forEach(function (t) { L.push('  · ' + t) })
  infl.suggestions.forEach(function (t) { L.push('  · ' + t) })
  L.push('')
  L.push('── 目标 / 达标 ──')
  if (plan.standard) {
    L.push('  ' + plan.standard.level + ' 级社区达标线：' + CORE.fmtPower(plan.standard.power) +
      '（置信度 ' + plan.standard.confidence + '）→ 当前' + (plan.vsStandardLabel || '无法判断'))
  }
  if (plan.gap !== null) L.push('  距目标缺口：' + CORE.fmtPower(plan.gap))
  if (plan.daysNeeded !== null) L.push('  按每日 ' + income + ' 战力：约 ' + plan.daysNeeded + ' 天')
  else if (plan.daysNote) L.push('  ' + plan.daysNote)
  if (plan.directions.length) {
    L.push('  相对最薄弱：')
    plan.directions.forEach(function (d) {
      L.push('    · ' + d.boardName + '（' + CORE.fmtPct(d.share) + '）')
    })
  }
  L.push('')
  L.push('── 必读注意 ──')
  plan.caveats.forEach(function (c) { L.push('  ⚠ ' + c) })
  if (imp.warnings.length || (comp.warnings && comp.warnings.length)) {
    L.push('')
    L.push('── 输入告警 ──')
    imp.warnings.concat(comp.warnings || []).forEach(function (w) { L.push('  ⚠ ' + w) })
  }
  L.push('')
  L.push('（数据均非官方口径；来源见 --sources）')
  console.log(L.join('\n'))
  return 0
}

try {
  process.exitCode = main()
} catch (e) {
  console.error('计算异常：' + (e && e.message))
  if (process.env.NW_DEBUG) console.error(e && e.stack)
  process.exitCode = 2
}
