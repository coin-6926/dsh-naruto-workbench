# AGENTS.md — 给 AI agent 的部署与使用协议

> 本文件是**机器可读的部署契约**。你（agent）被用户丢来一个 GitHub 链接、没有其它上下文时，
> 按本文执行即可。不要凭猜测行事；每一步都有**可验证的期望输出**。

仓库：`https://github.com/coin-6926/dsh-naruto-workbench`
一句话：**《火影忍者》手游战力工作台** —— 16 板块 × 7 属性面板 → 战力构成 / 短板 / 虚战诊断 / 目标倒推；
既是 DeepSeek Harness 插件，也能作为**单文件 HTML** 或 **Node CLI** 独立运行。

---

## 0. 先判断用户要哪一种（不要自作主张装插件）

| 用户说 | 走 | 需要什么 |
|---|---|---|
| 「打开就能用的工具」「不要装东西」「给个网页」 | **路径 A：单文件 HTML** | 只需浏览器 |
| 「在终端里算」「接我的脚本」 | **路径 B：CLI** | Node ≥ 10 |
| 「装成 dsh 插件」「让 agent 在对话里查数」 | **路径 C：DSH 插件** | DSH + (可选) super-injector |

**如果用户在问战力数据本身**，跳到 [§5 数据使用规则](#5-数据使用规则强制)。

---

## 1. 克隆（三条路径都要先做）

```bash
git clone https://github.com/coin-6926/dsh-naruto-workbench.git
cd dsh-naruto-workbench
```

克隆后**立刻**跑一次自检，确认仓库完整：

```bash
node tests/selftest.mjs
```

期望结尾：`工作台自测：通过 136 项，失败 0 项` / `全部通过 ✓`

- 若报 `node: command not found` → 用户没有 Node。**直接走路径 A**（不需要 Node 也能用 HTML）。
- 若项数不同但失败 0 → 可以继续，只是版本比文档新。

---

## 2. 路径 A：单文件 HTML（最省事，优先推荐给普通用户）

产物已在仓库里，**不需要构建**：

```
dist/naruto-workbench.html
```

告诉用户：**双击这个文件**（或拖进浏览器）即可。它是完全自包含的：

- 零网络请求、零外部字体、零 CDN
- 数据存在浏览器 localStorage
- 能导出/导入 JSON
- 有「复制给 AI 的分析提示词」按钮 → 可粘到任意 AI 对话继续分析

**验证它没坏**（你 agent 能做的）：

```bash
node tools/build-portable.mjs
```

期望：
```
✓ 构建完成（xx ms）
  naruto-power.js          xx.x KB
  naruto-workbench.html   xxx.x KB
  naruto-cli.cjs           xx.x KB
  naruto-power.d.ts         x.x KB
```

想真在浏览器里验证（本机有 Chrome/Edge 时）：

```bash
node tests/browser.e2e.mjs
```

期望 `浏览器 E2E：通过 11 项，失败 0 项`（并会顺手比对 Chrome 与 Edge 结果是否一致）。
没有浏览器时它会打印「跳过」——**跳过不算失败**。

---

## 3. 路径 B：CLI

```bash
node dist/naruto-cli.cjs --sample
```

期望输出含：
```
总战力（已填部分）：1378.4 万    已填板块：16/16
── 板块构成 ──
── 虚战诊断 ──
```

常用：

```bash
node dist/naruto-cli.cjs --help
node dist/naruto-cli.cjs --panel 面板.json          # 读面板
node dist/naruto-cli.cjs --panel p.json --json      # 机器可读（便于你解析）
node dist/naruto-cli.cjs --panel p.json --prompt    # 输出给 AI 的提示词
node dist/naruto-cli.cjs --panel p.json --income 100000   # 给了日收益才会估天数
node dist/naruto-cli.cjs --sources                  # 列出全部数据来源（47 条）
cat panel.json | node dist/naruto-cli.cjs           # 支持 stdin
```

退出码：`0` 成功 / `1` 参数或输入错误 / `2` 计算异常。
**`--json` 是你解析数据时的首选**，不要用正则去啃人类可读输出。

面板 JSON 格式（最小可用）：

```json
{
  "level": 145,
  "targetPower": 12000000,
  "collectionBonus": { "hp": 0.6, "atk": 0.6, "def": 0.6 },
  "boards": {
    "equipment": { "hp": 420000, "atk": 98000, "def": 38000, "crit": 32000, "critResist": 26000 },
    "jade": { "hp": 260000, "atk": 62000 }
  }
}
```

- **留空 = 未知**，不是 0。没填的板块不要当成 0 参与判断。
- `collectionBonus` 支持填 `0.6` 或 `60`（后者自动按百分比处理），只作用于 `hp/atk/def`。
- 板块 id 共 16 个：`equipment jade accessory artifact tool_body spirit tool_museum ninja_insight bond_card title scroll avatar_frame talent talent_shura rune costume`
- 属性 id 共 7 个：`hp atk def crit critResist elemAtk elemDef`

---

## 4. 路径 C：装成 DSH 插件

### 4.1 有 `dsh-super-injector`（`dev_*` 工具存在时）—— 首选，免重启

```
dev_inject_plugin  dir = <克隆下来的绝对路径>
```

然后验证：

```
dev_plugin_status
```

期望插件清单里出现：
```
- [active] naruto-workbench (@dsh-external/naruto-workbench)
```

`[active]` 才算成功；`[no-fiber]` 或 `failed` 都是失败（见 §6）。

装好后 agent 会多出 3 个工具：

| 工具 | 用途 |
|---|---|
| `naruto_reference` | 查内置数值表（`section` 可选 `growth / standards / income / weights / elem / crossgame / conflicts / status / sources / all`） |
| `naruto_analyze` | 传面板 → 算战力构成、短板、虚战、目标倒推 |
| `naruto_save_panel` | 存取用户在面板里填的数据 |

**卸载**：`dev_uninject_plugin  match = naruto-workbench`

### 4.2 没有 injector —— 手工装配（需要重启 DSH）

1. 找到目标 profile（常见 `~/.dsh/profiles/web/` 或 `~/.dsh/profiles/desktop/`）：

   ```bash
   ls ~/.dsh/profiles/
   ```

2. 在 profile 的 `package.json` 里加两处：

   ```json
   {
     "dependencies": {
       "@dsh-external/naruto-workbench": "link:<克隆下来的绝对路径>"
     },
     "bundles": ["@dsh-external/naruto-workbench"]
   }
   ```

3. 建链接（Windows 用 junction，需管理员或开发者模式）：

   ```powershell
   New-Item -ItemType Junction -Path "$HOME\.dsh\profiles\web\node_modules\@dsh-external\naruto-workbench" -Target "<绝对路径>"
   ```

   ```bash
   # Linux / macOS
   ln -s <绝对路径> ~/.dsh/profiles/web/node_modules/@dsh-external/naruto-workbench
   ```

4. **重启 DSH**，然后用 `dev_plugin_status` 或设置页插件清单确认 `[active]`。

### 4.3 只想在对话里用数据，不装插件

直接用 CLI 的 `--sources` / `--json`，或读仓库里的 `docs/DATA-SOURCES.md`（每条数值的出处与置信度）。

---

## 5. 数据使用规则（强制）

**这个项目的核心价值是「不编数字」，你也必须遵守。**

1. **回答任何具体数值前**，先读 `docs/DATA-SOURCES.md`，或用 `naruto_reference`。
   每条数值都带 `confidence`（`high/medium/low/unverified`）和 `sourceIds`。
2. **`unverified` 的量不要当结论用**，要明确告诉用户「这条没有可靠来源」。
3. **`low` 的要说「只当量级参考」**。
4. **绝不编造数字或 URL**。查不到就说查不到。
5. **三条硬陷阱**（详见 `docs/DATA-SOURCES.md` 第 20/469/521 节附近）：
   - 🚨 `huoyin.qq.com` 是**《火影忍者OL》端游**（回合制），**不是**本作手游。手游官网只有 `hyrz.qq.com`。
     看到「出手位 / 先攻 / 控制 / 忍术 / 抗性 / 五行查克拉」→ 立刻判定为 OL 资料，弃用。
   - **同一篇文章被多个站转载 ≠ 多个来源**。数字连单位写法都一字不差，基本可判同源。
   - **「等级达标线」≠「团本通关门槛」**。160 级达标 2000 万，但 160 团本实测队伍要 3000~4600 万。
6. **属性伤害公式**（已用两个真实账号的实战数据闭环验证，误差 <1.2%）：

   ```
   生效属攻 = 最高那一系的属攻（忍具该系 + 藏管该系）− 对方该系属防
   属性百分比伤害 = 生效属攻 ÷ 20
   总伤害 = 大字伤害 × (1 + 属性百分比)
   ```

   注意：本工具的**战力**计算仍按「汇总值 × 6 / × 10」近似求和，**没有**实现这套伤害模型。
   要算真实伤害，按上式手算，并告诉用户这是近似。
7. **单板块战力只有几十万量级**（如全套橙 +59 装备约 28~35 万），总战力却是千万级。
   用户某个板块填得离谱时，**先怀疑输入**，别急着解释。

---

## 6. 常见失败与修法

| 现象 | 原因 | 修法 |
|---|---|---|
| `require()` 拿到空对象 | 在 `"type":"module"` 的包里引 `dist/*.js` 被当 ESM | 用 `dist/naruto-power.cjs`，或确认 `dist/package.json` 里是 `"type":"commonjs"` |
| 插件 `[no-fiber]` / `failed` | 依赖缺失或 `register` 返回值不规范 | 本插件**零运行时依赖**，正常情况下不该失败；先看 `dev_plugin_status` 的失败审计日志 |
| `duplicate loader entry id` 启动崩溃 | 反复 inject/uninject 在 profile patch 里留下重复条目 | 用 `dev_fix_patch check=true` 先查，再 `dev_fix_patch` 修 |
| `git push` 报 443 连接失败 | 网络限制 | 用 `gh api` Git Data API 推送；内容一致性用逐字符比对确认 |
| `selftest` 项数不是 136 | 版本更新 | 只要「失败 0 项」即可，项数会随版本增加 |
| 浏览器 E2E 打印「跳过」 | 本机没装 Chrome/Edge | 不算失败；可设 `CHROME_PATH` 环境变量指定浏览器 |

---

## 7. 你要交付给用户的验证证据（别只说「装好了」）

至少给出下面三项的**实际输出**：

1. `node tests/selftest.mjs` → 失败 0 项
2. `node tools/build-portable.mjs` → 四个产物 + 体积
3. `node dist/naruto-cli.cjs --sample` → 总战力数值

装了插件再加一项：`dev_plugin_status` 里出现 `[active] naruto-workbench`。

---

## 8. 仓库结构（便于你定位文件）

```
lib/power-data.js        ★ 全部数值 + 来源 id + 置信度（唯一真相）
lib/index.js             DSH 插件 host 半身（3 个 agent 工具）
lib/client.js            DSH 插件 client 半身（对话输入区面板）
src/portable/core.src.js ★ 可移植核心（纯函数，零依赖，ES2015 上限）
src/portable/ui.src.html   单文件 HTML 模板
tools/build-portable.mjs ★ 把上面两个打包成 dist/
dist/                    ★ 构建产物（已提交，clone 即可用）
docs/DATA-SOURCES.md     ★ 数据来源与置信度审计（回答数值前必读）
tests/                   selftest(136) / portable(131) / browser.e2e(11)
```
