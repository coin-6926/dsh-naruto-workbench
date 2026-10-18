#!/usr/bin/env node
/**
 * 可移植构建：把「同一份数据 + 同一份核心」打包成多个平台目标。
 *
 * 产出（dist/）：
 *   naruto-power.js        UMD 库 —— 浏览器 <script> / CommonJS require / AMD 都能用
 *   naruto-workbench.html  单文件离线工作台（零网络、零外部资源、file:// 直接打开）
 *   naruto-cli.cjs         Node CLI（node >= 10）
 *   naruto-power.d.ts      类型声明（给 TS 用户）
 *
 * 设计要点：数据只在 lib/power-data.js 一处；core 只在 src/portable/core.src.js 一处。
 * 本脚本负责拼接，因此**不存在多份实现漂移**的问题。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, 'dist')

function read(p) {
  return readFileSync(join(ROOT, p), 'utf8')
}

function banner(comment) {
  return `/*!\n * ${comment}\n * 生成时间 ${new Date().toISOString()}\n * 本文件由 tools/build-portable.mjs 自动生成，请勿手改。\n */\n`
}

async function main() {
  const t0 = Date.now()
  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true })

  // 1) 取数据（唯一真相）
  const dataMod = await import('../lib/power-data.js')
  const DATA = dataMod.default
  if (!DATA || !Array.isArray(DATA.boards)) {
    throw new Error('lib/power-data.js 没有导出合法的 POWER_DATA')
  }

  const dataJson = JSON.stringify(DATA)
  // 防 JSON 里出现 </script> 提前闭合（只在 HTML 内联时需要，但统一处理更安全）
  const dataJsonSafe = dataJson.replace(/<\/script/gi, '<\\/script')

  const coreSrc = read('src/portable/core.src.js')
  if (!/function createCore\s*\(/.test(coreSrc)) {
    throw new Error('src/portable/core.src.js 里找不到 createCore 工厂函数')
  }

  // 2) 组装 UMD
  const umd = banner('naruto-workbench core (UMD) — 火影忍者手游战力工作台核心') +
`(function (root, factory) {
  'use strict'
  var DATA = ${dataJsonSafe}
  var api = factory(DATA)
  if (typeof module === 'object' && module.exports) { module.exports = api }
  else if (typeof define === 'function' && define.amd) { define([], function () { return api }) }
  else { root.NarutoPower = api }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (DATA) {
${coreSrc}
  return createCore(DATA)
})
`
  writeFileSync(join(DIST, 'naruto-power.js'), umd, 'utf8')
  // 同一个 UMD 再出一份 .cjs：给 ESM 工程（package.json 里 "type":"module"）显式引用，
  // 因为 .js 在那种工程里会被当成 ESM，UMD 的 module.exports 分支不会执行。
  writeFileSync(join(DIST, 'naruto-power.cjs'), umd, 'utf8')

  // dist/ 自带 package.json，锁定 .js 为 CommonJS。
  // 没有这一步，在 "type":"module" 的包里 require('./naruto-power.js') 会拿到空对象（踩过）。
  writeFileSync(
    join(DIST, 'package.json'),
    JSON.stringify(
      {
        name: 'naruto-workbench-portable',
        version: '1.0.0',
        private: true,
        type: 'commonjs',
        main: './naruto-power.js',
        description: '火影忍者手游战力工作台 —— 可移植产物（浏览器 / Node / 任意 JS 运行时）',
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  // 3) 组装单文件 HTML
  let html = read('src/portable/ui.src.html')
  const need = ['__BUNDLE__', '__CORE_VERSION__', '__DATA_VERSION__']
  for (const token of need) {
    if (!html.includes(token)) throw new Error(`ui.src.html 缺少占位符 ${token}`)
  }
  // 内联时不要再套一层 banner 注释外的内容，UMD 本身已是完整脚本
  html = html.replace('__BUNDLE__', umd)
  html = html.replace(/__CORE_VERSION__/g, readVersionCore())
  html = html.replace(/__DATA_VERSION__/g, String(DATA.version || 'unknown'))
  writeFileSync(join(DIST, 'naruto-workbench.html'), html, 'utf8')

  // 4) 组装 CLI
  //    注意：shebang 必须是文件的**第一行**，banner 只能排在它后面，否则 node 直接 SyntaxError
  const cliSrc = read('src/portable/cli.src.js').replace(/^#![^\n]*\n/, '')
  const cli = '#!/usr/bin/env node\n' +
    banner('naruto-workbench CLI') +
    cliSrc
  writeFileSync(join(DIST, 'naruto-cli.cjs'), cli, 'utf8')

  // 5) 类型声明
  const dts = buildDts()
  writeFileSync(join(DIST, 'naruto-power.d.ts'), dts, 'utf8')

  // 6) 报告
  const sizes = ['naruto-power.js', 'naruto-workbench.html', 'naruto-cli.cjs', 'naruto-power.d.ts'].map((f) => {
    const p = join(DIST, f)
    const b = readFileSync(p)
    return `  ${f.padEnd(24)} ${(b.length / 1024).toFixed(1).padStart(8)} KB`
  })
  console.log(`✓ 构建完成（${Date.now() - t0} ms）`)
  console.log(sizes.join('\n'))
}

function readVersionCore() {
  const src = read('src/portable/core.src.js')
  const m = src.match(/CORE_VERSION\s*=\s*'([^']+)'/)
  return m ? m[1] : 'unknown'
}

function buildDts() {
  return `// naruto-workbench core 类型声明（自动生成）
export type AttrId = 'hp' | 'atk' | 'def' | 'crit' | 'critResist' | 'elemAtk' | 'elemDef'

export interface BoardAttrs {
  hp?: number | string | null
  atk?: number | string | null
  def?: number | string | null
  crit?: number | string | null
  critResist?: number | string | null
  elemAtk?: number | string | null
  elemDef?: number | string | null
}

export interface CollectionBonus {
  hp?: number | string | null
  atk?: number | string | null
  def?: number | string | null
  [k: string]: number | string | null | undefined
}

export interface PanelInput {
  schemaVersion?: number
  level?: number | string | null
  targetPower?: number | string | null
  collectionBonus?: CollectionBonus
  boards?: Record<string, BoardAttrs>
  meta?: { note?: string }
}

export interface BoardRow {
  boardId: string
  boardName: string
  power: number
  filled: boolean
  share: number | null
}

export interface ComputeResult {
  boards: BoardRow[]
  totalPower: number
  filledCount: number
  totalBoards: number
  topBoards: BoardRow[]
  weakBoards: BoardRow[]
  unfilled: string[]
  incomplete: boolean
  level: number | null
  targetPower: number | null
  collectionBonus: CollectionBonus
  warnings: string[]
  errors: string[]
}

export interface InflationResult {
  inflationScore: number | null
  level: string
  reasons: string[]
  suggestions: string[]
  confidence: string
}

export interface PlanTargetResult {
  level: number | null
  currentPower: number
  targetPower: number | null
  gap: number | null
  standard: { level: number; power: number; confidence: string; basis?: string } | null
  vsStandard: number | null
  vsStandardLabel?: string
  daysNeeded: number | null
  daysNote: string | null
  directions: Array<{ boardId: string; boardName: string; share: number; power: number; why: string }>
  caveats: string[]
}

export interface ValidateResult {
  panel: PanelInput
  warnings: string[]
  errors: string[]
}

export interface ImportResult {
  ok: boolean
  panel: PanelInput | null
  warnings: string[]
}

export interface NarutoCore {
  CORE_VERSION: string
  SCHEMA_VERSION: number
  DATA: Record<string, unknown>
  BOARDS: Array<{ id: string; name: string; note?: string }>
  ATTRS: Array<{ id: AttrId; name: string }>
  ATTR_KEYS: AttrId[]
  WEIGHTS: Record<string, number>
  sanitizeNumber(v: unknown, fallback?: number | null): number | null
  isPlainObject(v: unknown): boolean
  deepClone<T>(v: T): T
  validate(input: unknown): ValidateResult
  boardPower(attrs: BoardAttrs, bonus: CollectionBonus): number
  compute(input: unknown): ComputeResult
  inflation(comp: ComputeResult): InflationResult
  planTarget(opts: {
    currentPower?: number
    targetPower?: number | null
    level?: number | null
    incomePerDay?: number | null
    computed?: ComputeResult
  }): PlanTargetResult
  nearestStandard(level: number | null): { level: number; power: number; confidence: string } | null
  fmtPower(n: number | null): string
  fmtPct(x: number | null, digits?: number): string
  exportPanel(input: unknown): Record<string, unknown>
  importPanel(raw: unknown): ImportResult
  buildAgentPrompt(input: unknown): string
  cautions: string[]
  sources: Record<string, { title?: string; url?: string; kind?: string; verified?: boolean | string }>
}

declare const core: NarutoCore
export default core
`
}

main().catch((e) => {
  console.error('构建失败：', e && e.message)
  process.exitCode = 1
})
