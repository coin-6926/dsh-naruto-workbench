#!/usr/bin/env node
/**
 * 多 CLI 独立交叉验证驱动脚本。
 *
 * 原理：把同一组待验证数据，分别交给本机多个 LLM CLI（codex / claude / qwen / gemini / grok），
 * 要求每个 CLI **独立联网检索并给出结论 + 来源 + 置信度，且不得参考其它 CLI 的答案。
 * 最后汇总：哪些数据被多个独立来源支持（可升级置信度），哪些存在分歧（需降级或标注冲突）。
 *
 * 为什么这样设计：
 *   - 单个模型容易受训练数据偏见影响；多个不同厂商的 CLI 独立取证，能互相印证或暴露分歧。
 *   - 本脚本只负责调度与汇总，不替模型做判断。
 *   - 每个 CLI 的原始输出独立保存，便于人工复核。
 *
 * 用法：
 *   node tools/multi-cli-verify.mjs
 *   node tools/multi-cli-verify.mjs --only=qwen,codex
 *   node tools/multi-cli-verify.mjs --timeout=200
 *   node tools/multi-cli-verify.mjs --dry
 *   node tools/multi-cli-verify.mjs --skip=claude,grok
 *   node tools/multi-cli-verify.mjs --item=def_11_6,spirit_plus4
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'verification');

const GROK_BIN = process.env.GROK_BIN || 'C:\\Users\\coin6\\AppData\\Local\\Programs\\grok\\grok.exe';

const CLIS = [
  { name: 'codex', cmd: 'codex', args: (p) => ['exec', '--skip-git-repo-check', p] },
  { name: 'claude', cmd: 'claude', args: (p) => ['-p', p, '--dangerously-skip-permissions'] },
  { name: 'qwen', cmd: 'qwen', args: (p) => [p] },
  { name: 'gemini', cmd: 'gemini', args: (p) => ['-p', p, '--approval-mode', 'plan'] },
  { name: 'grok', cmd: GROK_BIN, args: (p) => ['-p', p, '--no-plan'] },
];

const ITEMS = [
  { id: 'def_11_6', q: '《火影忍者手游》"1点防御等于多少战力"？请给出系数、来源URL、是否有带算式的验证。特别注意 11.6 / 11.7 / 12 三个说法哪个更可信。' },

  { id: 'atk_3_5', q: '《火影忍者手游》"1点攻击等于多少战力"？给出系数与来源URL。' },
  { id: 'crit_6', q: '《火影忍者手游》"1点暴击等于多少战力"？给出系数与来源URL。' },
  { id: 'critresist_10', q: '《火影忍者手游》"1点抗暴等于多少战力"？给出系数与来源URL。' },
  { id: 'elem_atk_def', q: '《火影忍者手游》"属性攻击、属性防御分别等于多少战力"？找不到可靠来源就明确说"未找到"。' },
  { id: 'magic_no_power', q: '《火影忍者手游》的"抗魔值"是否计入战力（战斗力）？有无官方或可靠来源明确说明？' },
  { id: 'level_cap_160', q: '《火影忍者手游》当前等级上限是多少？是否已开放 160 级？若已开放，160 级团本叫什么、要求多少战力？给出来源URL与发布日期。' },
  { id: 'stamina_per_day', q: '《火影忍者手游》每天能获得多少体力？请依据游戏内机制（恢复速度、上限、一乐拉面）推算一天总量，给出来源。' },
  { id: 'gold_per_day', q: '《火影忍者手游》零氪玩家每天约获得多少金币？月卡党呢？给出来源URL。' },
  { id: 'spirit_plus4', q: '《火影忍者手游》"通灵进阶到+4"能加多少战力？消耗多少声望和铜币？给出来源URL，并说明来源是否可靠。' },
  { id: 'artifact_baiya', q: '《火影忍者手游》神器"白牙"之后提炼一次需要多少轮回石？白牙之前是多少？给出来源URL。' },
  { id: 'ninja_tool_cap', q: '《火影忍者手游》忍具强化上限：无究忍具最多+几？有究忍具建议+几？给出来源URL。' },
];

function arg(name, dflt) {
  const i = process.argv.indexOf('--' + name);
  if (i < 0) return dflt;
  const v = process.argv[i + 1];
  return (v === undefined || v.startsWith('--')) ? dflt : v;
}

const only = String(arg('only', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const skip = String(arg('skip', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const itemFilter = String(arg('item', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const timeoutSec = Number(arg('timeout', 240));

const clis = CLIS.filter((c) => (only.length ? only.includes(c.name) : !skip.includes(c.name)));
const items = itemFilter.length ? ITEMS.filter((i) => itemFilter.includes(i.id)) : ITEMS;

if (process.argv.includes('--dry')) {
  console.log('待验证项 ' + items.length + ' 条');
  items.forEach((i) => console.log('  - ' + i.id + ': ' + i.q.slice(0, 60) + '...'));
  console.log('将调用 CLI: ' + clis.map((c) => c.name).join(', '));
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

function run(cli, item) {
  return new Promise((resolve) => {
    const prompt =
      '你是游戏数据独立核验员。请联网检索回答下面的问题，输出：\n' +
      '1) 结论（数值）\n' +
      '2) 至少 2 个可点击来源URL，并说明它们是否互相独立（警惕同一篇文章被多个站点转载）\n' +
      '3) 置信度（高/中/低/未确证）\n' +
      '4) 若有冲突值，列出并说明你倾向哪个\n' +
      '5) 找不到可靠来源就明确写"未找到"，禁止编造数值或URL\n' +
      '特别注意：警惕AI批量生成的SEO内容农场（guotao606.cn、liutao454.cn、huayan226.cn、zhenglan979.cn 等），数字不可信。\n\n' +
      '问题：' + item.q;
    let out = '';
    let err = '';
    let done = false;
    const child = spawn(cli.cmd, cli.args(prompt), { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const kill = setTimeout(() => {
      if (!done) { try { child.kill('SIGKILL'); } catch { /* ignore */ } }
    }, timeoutSec * 1000);
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => { err += d.toString(); });
    const finish = (ok, extra) => {
      if (done) return;
      done = true;
      clearTimeout(kill);
      resolve({ cli: cli.name, item: item.id, ok, text: out.trim(), err: err.trim().slice(0, 300), ...extra });
    };
    child.on('error', (e) => finish(false, { spawnError: String(e.message || e).slice(0, 200) }));
    child.on('close', (code) => finish(code === 0, { exitCode: code }));
  });
}

const results = [];
for (const item of items) {
  console.log('\n=== ' + item.id + ' ===');
  const per = await Promise.all(clis.map((c) => run(c, item)));
  for (const r of per) {
    console.log('  [' + r.cli + '] ' + (r.ok ? 'OK' : 'FAIL' + (r.exitCode !== undefined ? ' code=' + r.exitCode : ''));
  }
  results.push({ item: item.id, q: item.q, responses: per });
  writeFileSync(join(OUT_DIR, item.id + '.json'), JSON.stringify({ item: item.id, q: item.q, responses: per }, null, 2));
}

writeFileSync(join(OUT_DIR, 'all-results.json'), JSON.stringify(results, null, 2));
console.log('\n完成。结果写入 ' + OUT_DIR);
