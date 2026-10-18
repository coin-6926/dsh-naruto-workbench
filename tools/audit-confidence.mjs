import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const D = (await import(pathToFileURL(join(ROOT, 'lib', 'power-data.js')).href)).default

const RANK = { unverified: 0, low: 1, medium: 2, high: 3 }

const out = []
const seen = new Set()
function walk(v, path, depth) {
  if (!v || typeof v !== 'object' || depth > 9) return
  if (seen.has(v)) return
  seen.add(v)
  if (Array.isArray(v)) {
    v.forEach((x, i) => walk(x, path + '[' + i + ']', depth + 1))
    return
  }
  if (typeof v.confidence === 'string') {
    out.push({
      path,
      conf: v.confidence,
      value: v.value ?? v.power ?? v.current ?? null,
      note: String(v.confidenceWhy || v.note || v.verdict || v.lesson || '').replace(/\s+/g, ' ').slice(0, 180),
      srcs: Array.isArray(v.sourceIds) ? v.sourceIds.length : 0,
      /** ★ 父级 low/medium 里藏着的高置信子项 —— 必须一起显示，否则会埋没 */
      highlights: v.innerHighlights || null,
    })
  }
  for (const k of Object.keys(v)) {
    if (k === 'sources') continue
    walk(v[k], path ? path + '.' + k : k, depth + 1)
  }
}

walk({ root: D }, '', 0)

const byConf = { high: [], medium: [], low: [], unverified: [], other: [] }
for (const r of out) (byConf[r.conf] || byConf.other).push(r)

console.log('总量:', out.length)
console.log(
  '分布:',
  JSON.stringify({
    high: byConf.high.length,
    medium: byConf.medium.length,
    low: byConf.low.length,
    unverified: byConf.unverified.length,
  }),
)

// 父子倒挂检查
const inversions = []
for (const r of out) {
  if (!r.highlights || !r.highlights.high) continue
  if (RANK[r.conf] < 3) inversions.push(r)
}
console.log()
console.log('⚠ 父级置信度低于子级高置信项的节点：' + inversions.length + ' 处')
for (const r of inversions) {
  console.log('  ' + r.path + '  (父级 ' + r.conf + ')')
  console.log('     有 high: ' + r.highlights.high.join(' / '))
  if (r.highlights.howToRead) console.log('     读法: ' + r.highlights.howToRead)
}
console.log()

function fold(rows) {
  const groups = new Map()
  for (const r of rows) {
    const key = r.path.replace(/\[\d+\]/g, '[i]')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  return [...groups.entries()].map(([k, v]) => ({ key: k, count: v.length, first: v[0] }))
}

for (const conf of ['unverified', 'low', 'medium']) {
  const list = byConf[conf]
  const folded = fold(list)
  console.log('########## ' + conf.toUpperCase() + '  共 ' + list.length + ' 条（折叠 ' + folded.length + ' 组）##########')
  for (const g of folded) {
    const suffix = g.count > 1 ? '  x' + g.count : ''
    const val = g.first.value !== null ? ' = ' + g.first.value : ''
    console.log('  [' + conf + '] ' + g.key + val + suffix + '  (srcs:' + g.first.srcs + ')')
    if (g.first.note) console.log('        ' + g.first.note)
    // ★ 关键：把父级里的高置信子项也列出来
    if (g.first.highlights && g.first.highlights.high) {
      console.log('        ★ 本块含高置信子项: ' + g.first.highlights.high.join(' / '))
    }
  }
  console.log()
}
