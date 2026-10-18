/**
 * 打包产物校验（npm pack 之后跑）
 *
 * 为什么需要它：`npm publish` 只检查语法正确性，不会检查"装完能不能用"。
 * 本项目踩过两次静默丢文件的坑（gh api 手写列表漏文件、git quotepath 转义导致整份文件被过滤），
 * 所以这里对 tarball 做**内容级**校验，而不只看 npm 是否报错。
 *
 * 用法：node tools/verify-pack.mjs [tarball路径]
 *   - 不给参数时自动找最新的 .tgz
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

let pass = 0
const fails = []
const ok = (name, cond, extra) => {
  if (cond) {
    pass++
    console.log('  ✓ ' + name)
  } else {
    fails.push(name + (extra ? ' → ' + extra : ''))
    console.log('  ✗ ' + name + (extra ? ' → ' + extra : ''))
  }
}
const section = (t) => console.log('\n── ' + t)

// 找 tarball
let tgz = process.argv[2]
if (!tgz) {
  const cands = readdirSync(ROOT)
    .filter((f) => f.endsWith('.tgz'))
    .map((f) => ({ f, m: +execFileSync('node', ['-e', `console.log(require('fs').statSync(${JSON.stringify(join(ROOT, f))}).mtimeMs)`]).toString() }))
    .sort((a, b) => b.m - a.m)
  if (!cands.length) {
    console.error('找不到 .tgz，请先运行 npm pack')
    process.exit(1)
  }
  tgz = join(ROOT, cands[0].f)
}
console.log('校验 tarball:', tgz)
if (!existsSync(tgz)) {
  console.error('文件不存在:', tgz)
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

section('1. package.json 可发布性')
ok('已移除 private 标记', pkg.private !== true, String(pkg.private))
ok('包名非 scoped（npm 上可直接占用）', !pkg.name.startsWith('@'), pkg.name)
ok('有 version', /^\d+\.\d+\.\d+/.test(pkg.version), pkg.version)
ok('有 license', typeof pkg.license === 'string' && pkg.license.length > 0, pkg.license)
ok('有 repository', !!pkg.repository)
ok('有 bin 映射（支持 npx）', !!pkg.bin && Object.keys(pkg.bin).length > 0, JSON.stringify(pkg.bin))
ok('有 files 白名单', Array.isArray(pkg.files) && pkg.files.length > 0)
ok('engines.node 已声明', !!pkg.engines?.node, pkg.engines?.node)

section('2. tarball 内容（解包后逐个查）')
const tmp = mkdtempSync(join(tmpdir(), 'np-verify-'))
try {
  execFileSync('tar', ['-xzf', tgz, '-C', tmp], { stdio: 'pipe' })
  const inner = join(tmp, 'package')
  ok('解包成功', existsSync(inner))

  const must = [
    'package.json',
    'README.md',
    'LICENSE',
    'AGENTS.md',
    'dist/naruto-power.cjs',
    'dist/naruto-power.js',
    'dist/naruto-cli.cjs',
    'dist/naruto-workbench.html',
    'dist/naruto-power.d.ts',
    'dist/package.json',
    'lib/power-data.js',
    'lib/index.js',
    'lib/client.js',
    'docs/DATA-SOURCES.md',
    'docs/confidence-audit.txt',
  ]
  for (const f of must) {
    ok('含 ' + f, existsSync(join(inner, f)))
  }

  // dist/package.json 必须把 dist 标为 commonjs，否则 require 会拿到空对象
  if (existsSync(join(inner, 'dist/package.json'))) {
    const d = JSON.parse(readFileSync(join(inner, 'dist/package.json'), 'utf8'))
    ok('dist/ 标为 commonjs（否则 require 拿到空对象）', d.type === 'commonjs', d.type)
  }

  // CLI 首行必须是 shebang，否则 npx 直接执行会失败
  if (existsSync(join(inner, 'dist/naruto-cli.cjs'))) {
    const head = readFileSync(join(inner, 'dist/naruto-cli.cjs'), 'utf8').slice(0, 40)
    ok('CLI 首行是 shebang（npx 依赖它）', head.startsWith('#!/usr/bin/env node'), JSON.stringify(head.slice(0, 24)))
  }

  // 数据层必须能独立 import（不依赖仓库内其它文件）
  const dataPath = join(inner, 'lib/power-data.js')
  if (existsSync(dataPath)) {
    try {
      const out = execFileSync(
        'node',
        ['-e', `import(${JSON.stringify('file://' + dataPath.replace(/\\/g, '/'))}).then(m=>console.log(Object.keys(m.default.sources).length))`],
        { encoding: 'utf8' },
      ).trim()
      ok('lib/power-data.js 可独立 import', /^\d+$/.test(out), out)
    } catch (e) {
      ok('lib/power-data.js 可独立 import', false, String(e.message).slice(0, 80))
    }
  }

  // 核心 API 可从 tarball 内 require
  const corePath = join(inner, 'dist/naruto-power.cjs')
  if (existsSync(corePath)) {
    try {
      const out = execFileSync(
        'node',
        [
          '-e',
          `const c=require(${JSON.stringify(corePath)});` +
            `const r=c.compute({boards:{equipment:{hp:1000,atk:100,def:50}}});` +
            `console.log([typeof c.compute, r.totalPower>0, typeof c.planTarget].join(','))`,
        ],
        { encoding: 'utf8' },
      ).trim()
      ok('dist 核心 API 可用（compute 返回正战力）', out === 'function,true,function', out)
    } catch (e) {
      ok('dist 核心 API 可用', false, String(e.message).slice(0, 80))
    }
  }

  // 单文件 HTML 自包含（不得有外部 http 引用）
  const htmlPath = join(inner, 'dist/naruto-workbench.html')
  if (existsSync(htmlPath)) {
    const h = readFileSync(htmlPath, 'utf8')
    const ext = h.match(/<(script|link)[^>]+(src|href)=["']https?:/gi)
    ok('单文件 HTML 无外部 http 引用', !ext, ext ? ext.slice(0, 2).join(' ') : '')
  }

  // 体积合理性（防止误把 node_modules 打进来）
  const size = readFileSync(tgz).length
  ok('tarball 体积合理（<5MB）', size < 5 * 1024 * 1024, (size / 1024).toFixed(0) + ' KB')

  // 不得包含 node_modules / .git
  const all = []
  ;(function walk(d, rel) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name
      if (e.isDirectory()) walk(join(d, e.name), r)
      else all.push(r)
    }
  })(inner, '')
  ok('不含 node_modules', !all.some((f) => f.includes('node_modules')))
  ok('不含 .git', !all.some((f) => f.includes('.git/')))
  ok('不含测试临时文件', !all.some((f) => /tmp\d*\.(cjs|mjs)$/.test(f)))
} finally {
  try {
    rmSync(tmp, { recursive: true, force: true })
  } catch {}
}

console.log('\n' + '═'.repeat(58))
if (fails.length === 0) {
  console.log('打包校验：通过 ' + pass + ' 项，失败 0 项')
  console.log('全部通过 ✓')
} else {
  console.log('打包校验：通过 ' + pass + ' 项，失败 ' + fails.length + ' 项')
  for (const f of fails) console.log('  · ' + f)
  process.exitCode = 1
}
