# 火影忍者手游 · 战力工作台

[![DeepSeek Harness](https://img.shields.io/badge/DSH-plugin-blue)](https://github.com/coin-6926/dsh-naruto-workbench)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![tests](https://img.shields.io/badge/tests-323%20passed-brightgreen)](tests/)
[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-ready-blueviolet)](#-把这一行丢给你的-agent)

一个挂在 **DeepSeek Harness** 里的战力工作台插件：填 16 板块战力面板 → 本地即时算 → 一键把结构化结论交给 agent 深入分析。

> 也能**脱离 DSH 独立运行**：单文件 HTML（双击即用）、Node CLI、UMD 库。

---

## 🤖 把这一行丢给你的 agent

```
部署 https://github.com/coin-6926/dsh-naruto-workbench —— 按 AGENTS.md 执行
```

`AGENTS.md` 是写给 agent 的**部署契约**：它会自己判断你要「单文件 HTML / CLI / DSH 插件」三条路径里的哪一条，
按步骤装配，并**带着可验证的输出**回报（自检项数、产物体积、CLI 实际算出的战力）。
不需要你解释任何背景。

### 三条路径各需要什么

| 你想要的 | 路径 | 需要 |
|---|---|---|
| 打开就能用、不想装东西 | **单文件 HTML**（`dist/naruto-workbench.html`，112 KB） | 只要浏览器 |
| 在终端里算 / 接脚本 | **Node CLI**（`node dist/naruto-cli.cjs`） | Node ≥ 10 |
| 让 agent 在对话里查数 | **DSH 插件**（3 个 agent 工具） | DSH（有 super-injector 则免重启） |

### 手动安装（不想让 agent 动手时）

```bash
git clone https://github.com/coin-6926/dsh-naruto-workbench.git
cd dsh-naruto-workbench
node tests/selftest.mjs        # 期望：通过 166 项，失败 0 项
```

- **只想用工具**：双击 `dist/naruto-workbench.html`（已提交，无需构建）
- **装成插件**：见 [AGENTS.md](AGENTS.md) §4，或直接 `dev_inject_plugin dir=<绝对路径>`

**核心思路**：agent 已经有联网与推理能力，缺的是**你的真实面板数据**和**可信的数值依据**。
所以插件负责"持有数据 + 确定性计算 + 提供带来源的数值表"，agent 负责"解释 + 联网查最新版本 + 个性化建议"。

---

## 它解决什么问题

| 你的处境 | 工作台怎么帮你 |
|---|---|
| 「我这战力正常吗？」 | 对照社区战力标准表（60~150 级）给出「达标 / 偏低 / 明显偏低」 |
| 「下一步该升什么？」 | 按性价比排序给 5 条优先项，并算出**这些节点能覆盖你所缺战力的百分之几** |
| 「我这算不算虚战？」 | 按视频作者定义（**透支潜力**，不是堆属性）做分布失衡诊断 |
| 「想认真聊聊怎么规划」 | 一键把面板 + 诊断写进对话输入框，agent 用工具基于**真实数据**回答 |

---

## 🌐 五种运行方式（不限 DSH）

同一份数据（`lib/power-data.js`）+ 同一份核心（`src/portable/core.src.js`），
打包成 5 个平台目标。**计算逻辑只有一处**，不存在多份实现漂移
（`tests/portable.test.mjs` 里有「portable core vs client vs host」三端逐一比对守着）。

| 方式 | 命令 / 操作 | 需要什么 | 适合谁 |
|---|---|---|---|
| **① 单文件 HTML** | 双击 `dist/naruto-workbench.html` | 任意现代浏览器，**离线** | 绝大多数人（手机/电脑/平板都行） |
| **② Node CLI** | `node dist/naruto-cli.cjs --panel 面板.json` | Node ≥ 10 | 习惯终端 / 想接脚本 |
| **③ UMD 库** | `require('./dist/naruto-power.js')` 或浏览器 `<script>` | 任意 JS 运行时 | 想自己写集成 |
| **④ DSH 插件** | 装进 DeepSeek Harness | DSH | 想在对话里直接问 agent |
| **⑤ 供 AI 的提示词** | 页面点「复制给 AI 的分析提示词」 | 任意 AI 对话 | ChatGPT / Claude / Gemini / DeepSeek / Kimi 都能用 |

### ① 单文件 HTML（推荐）

直接双击 `dist/naruto-workbench.html`，或拖进浏览器。**不联网、不上传、不需要服务器。**

- 填 16 板块 × 7 属性 → 即时出总战力、占比、短板、虚战诊断、目标倒推
- 自动存本地（localStorage），换设备用「导出 JSON」
- 「复制给 AI 的分析提示词」→ 粘到**任何** AI 对话里继续分析

重新构建：`npm run build:portable`

### ② Node CLI

```bash
node dist/naruto-cli.cjs --sample                 # 用内置示例跑一遍
node dist/naruto-cli.cjs --panel mypanel.json     # 读面板
node dist/naruto-cli.cjs --panel p.json --json    # 机器可读输出
node dist/naruto-cli.cjs --panel p.json --prompt  # 输出给 AI 的提示词
node dist/naruto-cli.cjs --sources                # 列出全部数据来源
cat p.json | node dist/naruto-cli.cjs             # 也支持 stdin
```

退出码：`0` 成功 / `1` 参数或输入错误 / `2` 计算异常。

### ③ UMD 库

```js
// CommonJS（注意：本包是 "type": "module"，所以请用 dist/ 目录下的文件，
// 或直接 require('./dist/naruto-power.cjs')）
const core = require('./dist/naruto-power.js')
const r = core.compute({ level: 145, boards: { equipment: { hp: 500000, atk: 100000 } } })
console.log(r.totalPower, core.fmtPower(r.totalPower))
```

```html
<!-- 浏览器：直接用 <script> -->
<script src="naruto-power.js"></script>
<script>
  const r = NarutoPower.compute({ boards: { equipment: { hp: 500000 } } })
  console.log(r.totalPower)
</script>
```

TypeScript 声明在 `dist/naruto-power.d.ts`。

### 兼容性说明（已实测）

| 项 | 范围 |
|---|---|
| HTML | Chrome / Edge / Firefox / Safari / 各种套壳浏览器；`file://` 直接打开可运行 |
| JS 语法 | 上限 ES2015（不用 `?.` `??` `structuredClone` 等新特性） |
| CSS | 系统字体栈（不请求任何外部字体）、`prefers-color-scheme` 自适应、打印样式 |
| CLI | Node ≥ 10；`dist/package.json` 锁定 CommonJS 避免被 ESM 误判 |
| 网络 | 全部产物**零网络请求**（有自动化断言禁止 `fetch`/`XMLHttpRequest`/外链） |
| 降级 | localStorage 被禁 → 提示改用导出；`navigator.clipboard` 不可用 → `execCommand` 兜底；无法下载 → 复制到剪贴板 |

真实浏览器端到端测试：`npm run test:browser`（Chrome + Edge 双内核比对，找不到浏览器则跳过）。

## 安装

### 方式一：DSH 插件 CLI（推荐）

```bash
dsh plugin --profile desktop add github:coin-6926/dsh-naruto-workbench
```

### 方式二：本地热装（开发用）

```bash
git clone https://github.com/coin-6926/dsh-naruto-workbench.git
cd dsh-naruto-workbench
# 然后在 DSH 里用注入器：
#   dev_install_package { "dir": "<绝对路径>", "profile": "desktop" }
```

装好后在**对话输入框上方**会出现「🍥 战力工作台」横条，点「展开」。

> ⚠️ 需要 DSH 版本支持 `conversation.input.dock` slot 与 `ctx.tools.register`。
> 本插件**零运行时依赖**（只用 Node 内置模块），因为本地插件通过 junction 挂载，裸包名 import 会解析失败。

---

## 用法

1. 点「📋 填入面板」展开 16 板块表格（或点「🧪 载入示例」先看效果）
2. 照抄游戏内「战力详情」里每个板块的 7 项属性 —— **空着就是没填，不要填 0**
3. 填「角色等级」和「目标战力」（可选）
4. 填「忍者收集加成」三项百分比 —— **不填按 0% 算，会让战力被低估约两成**
5. 看下方即时出的：总战力、板块占比、虚战诊断、目标与下一步
6. 想深入问，点「🤖 交给 agent 分析」→ 内容写进输入框，你确认后发送

---

## 三个 agent 工具

装好后 agent 在对话中可直接调用：

| 工具 | 作用 |
|---|---|
| `naruto_save_panel` | 保存/读取你在面板里填的战力数据 |
| `naruto_analyze` | 算总战力、各板块占比、短板、虚战分、目标倒推 |
| `naruto_reference` | 查内置数值表（成长曲线 / 战力标准 / 资源收益 / 性价比排序 / 虚战判据） |

`naruto_analyze` 不传 panel 时会读取你上次在面板保存的数据 —— 所以你可以先在面板填，再在对话里说「分析我的战力」。

---

## ⚠️ 数据可信度（重要）

**本工具的所有游戏数值都不是官方数据。** 官方从未公布战力计算公式。

每条数值都带 `confidence` 与 `sourceIds`，完整审计见 **[docs/DATA-SOURCES.md](docs/DATA-SOURCES.md)**。

| 置信度 | 含义 | 本项目示例 |
|---|---|---|
| 高 | ≥2 个独立来源一致，或有算式验算 | 生命 1 / 攻击 3.5 / 暴击 6；忍具 +8/+15；**属性伤害完整公式（最高系 → 减属防 → ÷20），4 个数字闭环验证** |
| 中 | 单一可靠来源或强旁证 | 防御 11.6（有游戏内反查闭环）；抗暴 10（有官方改动日志）；**属性攻击 6 / 属性防御 10；通灵满级消耗表** |
| 低 | 社区流传 / 版本可能过时 | 战力标准表；勾玉；通灵策略；**铜币日收益**（有官方 2016 锚点 ≈23 万/天，但无逐项明细） |
| 未确证 | 找不到可靠来源 | 目前仅剩「属性防御换算成多少**伤害减免**」一项 |

**★ 属性攻防是「建模错误」，不只是「未确证」**：真实机制是**只有最高的那一系生效**
（÷20 换算成属性百分比伤害，藏管全一阶 1816→90%、忍具最多 27%、版本上限 117%），
其余各系每点只加约 1 战力。本项目仍按「汇总 × 6/×10」近似求和，
**在多系都有数值的账号上会高估这部分战力** —— 已在 `elemMechanics` 与 `cautions` 里向用户披露。
完整推导（含 1816÷20=90.8→90%、90+27=117% 的自洽验算）见
[docs/DATA-SOURCES.md](docs/DATA-SOURCES.md#-2026-10-18-更新属性攻防的真实机制已查清这是本项目最重要的一次纠错)。

**跨来源是否真的独立**：本轮另实测了本机 `codex` / `claude` / `qwen` / `gemini` / `grok` 五个 CLI 想当交叉验证，
结果 3 个不可用、`claude` 给了一个与实地证据**相反**的自信答案、只有 `qwen` 诚实说「不知道」。
结论是 **LLM 记忆不能作为版本敏感游戏数值的证据**，详见 DATA-SOURCES.md 第十二节。


**已知冲突**：防御系数存在 **11.6 / 11.7 / 12** 三个口径，本项目取 11.6（有两次独立算式验证：
搜狐 150×11.6=1740、B站视频 160×11.6=1856）。

**⚠️ AI 内容农场警告**：搜索这类游戏数据时，会遇到大量批量生成的 SEO 农场站点
（`guotao606.cn` `liutao454.cn` `huayan226.cn` `zhoujing757.cn` `921syw.com` `900xz.com` `lwyysz.com` 等）。
特征是模板相同、日期穿越到未来、互相抄袭。**这些站点的精确数字本项目只当候选范围，不作独立来源。**

**社区不存在的数据**（任何声称拥有的来源都不可信）：
1. 「各系统战力占比 %」—— 官方从未公布，社区也无人做出全系统拆解
2. 「通用每单位资源换多少战力」换算表

→ 所以本工具的占比**只针对你自己面板内部比较**，不提供任何"应有占比"基准。

### 唯一权威核对途径

- 饰品数值 → 游戏内「游戏小悦 → 饰品分解」模拟器
- 战力数值 → 游戏内「战力详情」面板

---

## 「虚战」到底是什么意思

**不是「堆暴击就是虚战仔」。** 视频《什么是虚战仔？〈战力基础架构〉》作者本人置顶评论（166 赞）原文：

> 「我看很多南友发攻击暴击面板，其实视频中说的"虚战"**和攻击暴击一点关系没有**嘚。
> **虚战是指不计后果透支潜力获取的战力**，并不是单纯的攻击暴击」

高赞评论展开：
> 「虚战是**硬拉某一方面短期提战力，把对应的材料收益过早推入后期收益低的境地**（比如硬拉绿瓶堆饰品等级、声望礼包买后 2 次、拉忍尘高强忍具），不仅透支了这部分未来的潜力，而且让你**没有多余金币投入去拉其他方面的基础**。」

所以本工具：
- **绝不**把攻击/暴击（或生命/防御）标为虚战
- 判据是**资源分布失衡**（某板块占比过高、其它明显薄弱）
- 且**只跟你自己的面板比**
- 算不出时返回 `数据不足`，**不拿 0 分冒充**

---

## 面板覆盖率洞察

工具会算一件事：**"最优节点"填不满大缺口**。

示例：145 级缺 641 万战力，而 5 个已知最优节点合计只有 77 万 —— **覆盖率 12%**。
这比单纯列"该先升什么"更有用：它告诉你**大头不在这**，而在装备/饰品强化或等级上，别把精力全花在优化小节点。

---

## 开发

```bash
npm run test:all            # 三套：插件 134 + 可移植 131 + 浏览器 11 = 276 项
```

### 踩过的坑（都做成了永久测试）

**1. `output.render` 是必填的**

`dsh-tools` 的 `register()` 会校验：
```js
if (typeof output.render !== 'function') throw new TypeError(...)
```
缺它的后果：`apply()` 看起来成功执行完了（日志能看到），但宿主 fiber 会 **failed** —— 极难排查。

**2. junction 挂载下裸包名 import 会失败**

本地插件通过 junction 挂载，Node 解析真实路径，`import '@deepseek-ai/cordis'` 会失败。
所以本插件零依赖。

**3. injector 反复卸载会留下重复 `disabled: true`**

`uninject` 会往 profile patch 写 `disabled: true` 阻断自装配；反复装卸会累积重复条目，
导致之后 `inject` 一直 `host ✗`。遇到时检查 `~/.dsh/profiles/<profile>/cordis.patch.yml`。

**4. client 与 host 各实现了一遍计算，必须保持一致**

client 不能 import host，所以战力算法写了两遍。两份漂移 = 用户看到的数字和 agent 算的不一样 ——
最伤信任的 bug。selftest 第 8 节用同一份数据强制两边逐板块完全相等。

**5. 示例数据必须自洽**

示例标称「145 级」就该落在 145 级基准（1100 万）附近。曾经因为校准口径搞错，
示例只有 64 万却显示「145 级 / 明显偏低」，用户会以为工具算错了。已做成断言。

---

## 文件结构

```
lib/index.js         host 半身：3 个 agent 工具 + 面板持久化
lib/client.js        client 半身：工作台面板（纯 DOM，无 React 依赖）
src/portable/        ★ 可移植核心与 UI 模板（单一真相，供 build 打包到 dist/）
tools/build-portable.mjs  ★ 把同一份数据+核心打成 4 个平台产物
dist/                ★ 构建产物（单文件 HTML / UMD / CLI / d.ts）
lib/power-data.js    ★ 内置数值表（唯一需要改的文件）
cordis.patch.yml     bundle 装配声明
docs/DATA-SOURCES.md ★ 数据来源与置信度审计（每条数值的出处）
tests/selftest.mjs   104 项自测
```

## 版本更新后怎么改数据

改 `lib/power-data.js` 里的数值即可（它是纯数据 + ESM default 导出）。
改完跑 `node tests/selftest.mjs` 确认没破坏内部一致性。

## 数据存储

`$DSH_HOME/naruto-workbench/panel.json`（默认 `~/.dsh/naruto-workbench/panel.json`）。
面板表单另外存一份到浏览器 `localStorage`，刷新不丢。

---

## 致谢与来源

本项目的数值整理自社区攻略与玩家实测，主要来源：

- [CSDN《火影手游攻略之饰品篇》](https://blog.csdn.net/Gou_Hailong/article/details/108184369)（逐级消耗/返还实测）
- [搜狐 · 战力换算系数实测](https://www.sohu.com/a/552091898_100270673)
- [九游 · 战力计算公式](https://www.9game.cn/news/1613279.html)｜[通灵进阶性价比](https://www.9game.cn/hyrz/11559345.html)
- [小米游戏中心](https://game.xiaomi.com/viewpoint/1374185274_1627736538520_13)（多篇实测）
- [TapTap · 新神器解析](https://www.taptap.cn/moment/72081835617685391)
- [第一手游网 · 各级勾玉](https://www.diyiyou.com/hyrz/gl/58285.html)
- [应用宝 · 忍具篇](https://sj.qq.com/blog/1747998284000)｜[ZOL · 忍具搭配](https://game.zol.com.cn/1182/11822509.html)
- [腾讯官方 · 饰品与秘境说明](https://hyrz.qq.com/webplat/info/news_version3/11946/18118/18119/19273/19275/19278/m13191/201606/478470.shtml)
- B站视频：[《什么是虚战仔？〈战力基础架构〉》](https://www.bilibili.com/video/BV18KNXzoE4z)｜[《人人都可以当自己的战力导师》](https://www.bilibili.com/video/BV1s3dPBoEFL)

另：用户提供的 Excel 模板《性价比（最终版）》（B站 UP 主「无花果酱」制作）是 16 板块划分与部分成长数据的主要来源。
经核验，该表与视频 BV1s3dPBoEFL 置顶评论给出的微云链接同源（文件名与体积一致）。

**本项目不含任何游戏素材、图片、音频或官方文案的复制。**

## License

[MIT](LICENSE) —— 数值数据部分另见 [LICENSE](LICENSE) 末尾的数据免责声明。

