// naruto-workbench core 类型声明（自动生成）
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
