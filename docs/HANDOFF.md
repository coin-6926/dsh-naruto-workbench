# 交接文档（Handoff）— 2026-10-19

> 给下一个对话用。看完这一份即可接手，不必翻聊天记录。
> 仓库：`D:\DeliveryOptimization\dsh-naruto-workbench`　远端：`github.com/coin-6926/dsh-naruto-workbench`

---

## 0. 三十秒了解这个项目

**《火影忍者》手游战力工作台**。16 板块 × 7 属性面板 → 战力构成 / 短板 / 虚战诊断 / 目标倒推。

四种运行形态（同一份数据与算法）：

| 形态 | 入口 | 命令 |
|---|---|---|
| DSH 插件 | `lib/index.js` + `lib/client.js` | 已装，`[active] naruto-power-workbench` |
| 单文件 HTML | `dist/naruto-workbench.html` | 双击即用，零依赖 |
| Node CLI | `dist/naruto-cli.cjs` | `node dist/naruto-cli.cjs --sample` |
| npm 包 | `naruto-power-workbench` | `npx naruto-power-workbench` |

**项目核心价值不是功能，是「不编数字」** —— 每条数值都带 `confidence` + `sourceIds`。

---

## 1. 当前状态（已核实，非记忆）

```
数据版本 2026.10.18   核心版本 1.0.0
来源 74 条 | cautions 37 条 | 冲突 9 条（已裁决 7）| 农场黑名单 40 域
置信度 121 个记录点：高 32 / 中 37 / 低 46 / 未证实 6
六套测试 474 项全绿
最后提交 6bef13b，远端 37 文件逐字符一致
```

### 测试构成

| 套件 | 项数 | 管什么 |
|---|---|---|
| `tests/selftest.mjs` | 250 | 数据层 + 插件三工具 + 17 个章节的业务断言 |
| `tests/portable.test.mjs` | 157 | 构建产物 + 三端一致性 + 部署契约 |
| `tests/robustness.test.mjs` | 42 | fuzz 400 组 / 不变量 / ES2015 语法下限 / 引用卫生 |
| `tests/stress.test.mjs` | 8 | 极端数值 / 结构攻击 / 原型污染 |
| `tests/ui-constraint.test.mjs` | 6 | headless Chrome 真实渲染，验 UI 禁用格 |
| `tests/browser.e2e.mjs` | 11 | Chrome + Edge 双内核 |

**跑法**：`npm run test:all`　单跑：`node tests/xxx.mjs`

---

## 2. 代码架构（改哪里）

```
lib/power-data.js     3408 行  ★ 唯一真相：所有数值 + 来源 + 置信度
lib/index.js           670 行  DSH 插件 host（3 个 agent 工具）
lib/client.js          712 行  DSH 插件 client（对话输入区面板）
src/portable/core.src.js 644 行 ★ 可移植核心（纯函数，ES2015 上限）
src/portable/ui.src.html 763 行  单文件 HTML 模板
src/portable/cli.src.js  294 行  CLI
tools/build-portable.mjs       ★ 把 core + ui + cli 打包成 dist/（6 个产物）
```

### 数据流

```
lib/power-data.js ──┬─→ lib/index.js（host 直接用 POWER_DATA）
                    ├─→ tools/build-portable.mjs → dist/naruto-power.cjs（注入 DATA）
                    └─→ src/portable/core.src.js（createCore(DATA) 工厂）
                              ↓
                        dist/{naruto-power.js, naruto-workbench.html, naruto-cli.cjs}
```

**改数据 = 只改 `lib/power-data.js`**，然后 `node tools/build-portable.mjs`。

### ⚠️ 三处容易出事的地方

1. **`boardPower` 有三份实现**（`lib/index.js`、`lib/client.js`、`src/portable/core.src.js`）。
   改算法必须**三处同步**，否则同一面板会算出两个数。`portable.test` 有断言守着。
2. **样例数据也有三份**（client / CLI / HTML）。已统一为同一份，但改动时要一起改。
3. **`collectionBonus` 有隐式转换**：core 里 **>1 视为百分数自动 /100**。
   所以写 `0.28` 会被当成 0.28%，必须写 `28`。

---

## 3. 已定案的高置信事实（可直接用）

### 七个战力系数 —— 全部 high

| 属性 | 系数 | 依据 |
|---|---|---|
| 生命 | 1 | 多源 |
| 攻击 | 3.5 | 实测 15508/4431 = 3.499887 |
| 防御 | 11.6 | 150×11.6=1740 反查 + 贴吧逐位验证 |
| 暴击 | 6 | 官方 2016-08-30 上调后 |
| 抗暴 | 10 | 官方下调后 + 逐位验证 |
| 属性攻击 | 6 | 2018 贴吧 + 2026 抖音，双独立源 |
| 属性防御 | 10 | 同上 |

⚠ 「high」= 证据组合强，**不是官方认证**。官方从未公布任何战力系数（已两次验证）。

### 属性伤害公式（有官方口径）

```
生效属攻 = 最高那一系属攻 − 对方该系属防
属性百分比 = 生效属攻 × 5%    ≡  生效属攻 ÷ 20
总伤害 = 大字伤害 × (1 + 属性百分比)
```

来源：游戏内「忍具介绍」面板截图，原文「（己方火攻减去对方火防，再乘 5%）」。
5% = 1/20，**数学恒等**。且同时复现 2018 年「200点=10%」与 2024 年「2340点=117%」两个封顶值。

### 其他已定案

| 项 | 值 | 置信 |
|---|---|---|
| 勾玉装备孔 | 总位 **36** / 默认 30（每件 6，其中1个需300精炼石） | high（用户一手） |
| 勾玉通灵孔 | 总 **9** / 默认 6；5/10/15阶各花 100/300/600 精炼石 | high（用户一手） |
| 通灵总数 | **57**（收集界面）｜可修炼 **14**｜已拥有 22 | high / medium |
| 秘卷 | 上限 **30 级**（官方 2017-03-22 原文），10 级满效果，325 碎片 | high |
| 装备进阶 | **89 阶**（官方 2026-09-10）；强化 +59 是另一维度 | high / low |
| 修罗天赋 | 新增 25~30 阶（官方） | high |
| 神器忍玉率 | 0.12（1-140级）/ 0.05（140-280级） | medium |
| 神器轮回率 | 0.438 / 个 | medium |
| 忍传感悟 1800 | 官方定案（aid 18101284） | high |

### 板块属性约束（用户一手，2026-10-19）

**装备 / 勾玉 / 通灵 / 神器 / 密卷 / 天赋 / 修罗天赋** 不产 **暴击 / 抗暴 / 属攻 / 属防**。

- 三重交叉验证过（神器成长、勾玉六色、修罗节点都只有 hp/atk/def）
- 违规输入 → 剔除 + 告警；UI 里 28 格直接 disabled
- **例外**：忍具/藏馆产属攻属防；饰品/符文产暴击抗暴

---

## 4. 未解决项（下一个对话可以做的）

### 🔴 只差游戏内看一眼（搜索无用）

| 项 | 怎么看 | 影响 |
|---|---|---|
| **勾玉 9 级基础攻击**是否 = 1140 | 点开一颗 9 级红勾玉 | 决定 8/9 级归属 |
| **属性攻防实测** | 换一件单属性不同的忍具，记战力跳变 | 把 6/10 从"双源反推"推到"直接实测" |

### 🟡 有希望搜到

| 项 | 现状 | 检索方向 |
|---|---|---|
| 铜币日收益 | low（30~36万/天） | 找"逐项加总"贴（丰饶/积分赛/生存/组织/招财分列） |
| 装备战力量级 | low（橙+59 约 28~35万） | 找带面板截图的实测。**若给 100万+ 是把忍具或收集加成算进去了** |
| 五星S 20.3% 第二源 | low（单源） | 必须避开农场域 |
| 暴击伤害倍率 | 未证实（1.5 vs 1.2） | 需带伤害截图的实测 |

### 🚫 已确认搜不到（别重复劳动）

- 官方战力系数 —— 两次全栏目扫描（2367 条）零命中
- 175 级达标线 —— 已论证这类标准值**本质上不存在**，改用分服排名分位制

### 仍开放的冲突（9 条里剩 2）

- 云迹保护符消耗（已实测定案，仅留痕）
- 云迹上线时间（社区写"2036"是笔误）

---

## 5. 踩过的坑（别重复）

### 口径陷阱（栽过 6 次，4 次同一类）

| # | 错误 | 类型 |
|---|---|---|
| 1 | 通灵开孔 2孔/5孔 | 自建规则当已知 |
| 2 | 整条删除规则 | 过度纠正 |
| 3 | 「默认6」重述成「总6」 | **擅自改写用户原话** |
| 4 | 招财 23 万当日收益 | **总数 vs 默认值** |
| 5 | 175 级插值 3500 万 | **编造数字**（已撤下） |
| 6 | 684/1140 当冲突 | **相邻档位混用** |

**通用解法**：拿到任何数字先问"它的限定词是什么" —— 等级？品质？部位？总数还是默认值？

### 来源陷阱

- **40 个农场黑名单域**（列表在 `PD.sources.farm_blacklist_note`）
- 识别特征比域名可靠：`词+3位数字+.cn`、路径 `/<4字母>zx01/`、无截图无实测
- **同源转载 ≠ 多源**：数字连单位写法一字不差 = 同一来源
- 曾遇 6 个"独立源"全是农场，且在相邻星级上互相打架（洗稿指纹）

### 跨游戏污染

`huoyin.qq.com` = **《火影忍者OL》端游**，不是本手作游。看到「出手位/先攻/忍术/抗性/五行查克拉」→ 立即弃用。手游官网只有 `hyrz.qq.com`。

### 技术坑

| 坑 | 解 |
|---|---|
| `require()` 拿到空对象 | 包是 `"type":"module"` → 用 `.cjs` 或 `dist/package.json` 标 commonjs |
| `/webplat/` 公告乱码 | **GBK 编码**，需 `TextDecoder('gbk')` |
| 注入器拒绝 `register(\n{` | 校验正则要求 `register({` **紧邻**（不能换行） |
| `gh api` 推文件漏文件 | 必须用 `git -c core.quotepath=false ls-files`（中文名会被转义成八进制） |
| 删多行 cautions 留尾巴 | 只删了前半段 → 加 B4 卫生断言 |

---

## 6. 关键工具

```bash
# 官方公告（最有用的能力）
node tools/fetch-official.mjs --aid 18853074        # 读单篇原文
node tools/search-official.mjs --tags all --kw 关键词  # 全栏目批量搜（2367 条）

# 数据审计
node tools/audit-confidence.mjs    # 列出所有 low/unverified，含"父级掩盖子级"警告

# npm 打包校验（33 项）
node tools/verify-pack.mjs

# 构建 + 全测
node tools/build-portable.mjs && npm run test:all
```

---

## 7. 常用命令

```bash
node dist/naruto-cli.cjs --sample          # 样例面板（1055.1 万）
node dist/naruto-cli.cjs --panel p.json    # 读面板
node dist/naruto-cli.cjs --json            # 机器可读
node dist/naruto-cli.cjs --sources         # 列出 74 条来源
```

DSH 插件工具：`naruto_reference` / `naruto_analyze` / `naruto_save_panel`

---

## 8. 如果要做 npm 发布

包已配置好（去 scope、去 private、有 bin、prepublishOnly 门禁），
`npm pack` → 33 项校验全过。**只差登录**：

```bash
npm login
npm publish      # 包名 naruto-power-workbench 当前未被占用
```

---

## 9. 设计原则（改代码前请读）

1. **不编数字**。查不到就写"查不到"，并说明试过什么。
2. **冲突不静默覆盖**。两条互斥数据 → 都记进 `dataConflicts2026` 并写 `status`。
3. **置信度逐条记**，不搞"整块标 high"。
4. **父级低但含 high 子项 → 必须用 `innerHighlights` 显式标出**（曾因此漏掉官方 89 阶）。
5. **可验算的必须验算**。325 碎片、585271 铜币、14944×1=14944 —— 都是现场算的。
6. **测试是防线**。474 项里很多是"现场复算"而非比字符串。

---

## 10. 文档索引

| 文件 | 内容 |
|---|---|
| `AGENTS.md` | **给 agent 的部署契约**（机器可读，含验证期望输出） |
| `docs/DATA-SOURCES.md` | 111 KB 审计流水，33 节，每轮检索的完整记录 |
| `docs/SEARCH-CHECKLIST.md` | 检索工单（20 项待办 + 已确认负结果 + 40 农场域） |
| `docs/WORKBUDDY-BRIEF.md` | 给外部检索员的完整任务书 |
| `docs/confidence-audit.txt` | 实时生成的中/低/未证实清单 |
| `docs/confidence-audit-sources.md` | 外部补源报告（已核实，部分采纳） |
| `docs/P0-三项溯源-2026-10-18.md` | 外部 P0 检索交付（已核实） |
| `docs/P1P2-检索交付-2026-10-18.md` | 外部 P1/P2 检索交付（已核实） |
