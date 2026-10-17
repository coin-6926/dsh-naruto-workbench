/**
 * @dsh-external/naruto-workbench — 数据层（随插件分发的战力数值表）
 *
 * 与独立版 naruto-planner 的 src/power-data.js 同源，但这里**只保留工作台需要的部分**，
 * 并且补上了 2026-10-17 第二轮调研新增的成长曲线 / 分阶段基准 / 资源日收益。
 *
 * ★ 每条数值带 confidence + sourceIds。改数值只改这个文件。
 * ★ 纯数据、零依赖，ESM default 导出（与 lib/index.js 的 import 对齐）。
 */

const SOURCES = {
  xlsx_base: {
    title: 'B站「无花果酱」战力性价比模板（性价比（最终版）.xlsx，用户提供）',
    url: 'https://www.bilibili.com/video/BV1s3dPBoEFL',
    kind: 'community-template',
    retrievedAt: '2026-10-16',
  },
  bili_nangong: {
    title: 'B站 BV18KNXzoE4z《什么是虚战仔？〈战力基础架构〉》UP主「南宫的嘟嘟」置顶评论（166赞）',
    url: 'https://www.bilibili.com/video/BV18KNXzoE4z',
    kind: 'video-comment',
    retrievedAt: '2026-10-16',
  },
  csdn: {
    title: 'CSDN《火影手游攻略之饰品篇》（逐级消耗/返还实测）',
    url: 'https://blog.csdn.net/Gou_Hailong/article/details/108184369',
    kind: 'guide',
    retrievedAt: '2026-10-16',
  },
  sohu_coef: {
    title: '搜狐 · 战力换算系数实测（150×11.6=1740 验算）',
    url: 'https://www.sohu.com/a/552091898_100270673',
    kind: 'guide',
    retrievedAt: '2026-10-16',
  },
  game9_coef: {
    title: '九游 · 战力计算公式（含忍者收集加成系数）',
    url: 'https://www.9game.cn/news/1613279.html',
    kind: 'guide',
    retrievedAt: '2026-10-16',
  },
  game9_spirit: {
    title: '九游 · 通灵进阶性价比实测（+4 阶段 60万声望+1125万铜币→+19008 战力）',
    url: 'https://www.9game.cn/hyrz/11559345.html',
    kind: 'guide',
    retrievedAt: '2026-10-17',
  },
  xiaomi_jade: {
    title: '小米游戏中心 · 勾玉战力实测（8→9 级单颗约 1~2 万）',
    url: 'https://game.xiaomi.com/viewpoint/1374185274_1642695053933_13',
    kind: 'forum',
    retrievedAt: '2026-10-16',
  },
  xiaomi_artifact: {
    title: '小米游戏中心 · 神器轮回石消耗实测（白牙前后收益减半）',
    url: 'http://game.xiaomi.com/viewpoint/1434414262_1680100956093_241',
    kind: 'forum',
    retrievedAt: '2026-10-17',
  },
  zol_museum: {
    title: 'ZOL · 忍具藏馆加成（全一阶 1816 点 = 90% 属性加成）',
    url: 'https://game.zol.com.cn/1182/11822509.html',
    kind: 'guide',
    retrievedAt: '2026-10-17',
  },
  qq_standard: {
    title: 'QQ 频道「战力标准表」（60~150 级分阶段战力基准，社区流传）',
    url: '',
    kind: 'community-table',
    retrievedAt: '2026-10-17',
    note: '来源为社区传播的战力标准表，无固定 URL；与多条玩家自述交叉验证（133级636万达标、142级750万偏废）。',
  },
  whalegame_2025: {
    title: '九游 2025 · 资源日常收益与性价比排序',
    url: 'https://www.9game.cn/hyrz/11790876.html',
    kind: 'guide',
    retrievedAt: '2026-10-17',
  },

  /* ── 2026-10-18 独立交叉验证新增的来源 ── */
  sohu_2022_verified: {
    title: '搜狐「App小胖子」2022-05-28 · 战力换算系数实测（含游戏内战力明细反查）',
    url: 'https://www.sohu.com/a/552091898_100270673',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note:
      '本主题**唯一**做了「算出来→回游戏面板核对→对上」闭环的来源：' +
      '500 攻击 × 3.5 = 1750（宇智波鼬时装）、150 防御 × 11.6 = 1740（迪达拉时装，' +
      '作者用游戏内战力明细反查「恰好 1740」）。含金量高于所有纯列表转载。',
  },
  official_coef_patch_2016: {
    title: '18183 转载官方公告 2016-08-30 · 战力系数调整（下调抗暴、上调暴击）',
    url: 'https://www.18183.com/hyrz/201608/685051.html',
    kind: 'official-mirror',
    retrievedAt: '2026-10-18',
    note:
      '关键证据：解释了为什么 2016-08-24 民间实测是「抗暴 17.40 / 暴击 5.25」，' +
      '而现值是「抗暴 10 / 暴击 6」—— 官方在 08-30 真的调过系数。' +
      '公告原文：「降低了抗暴属性战斗力转换系数，同时提高了暴击属性战斗力转换系数……' +
      '有饰品玩家战斗力显示会有所波动，但实际战斗效果没有任何变化」。',
  },
  hyrz_official_2016: {
    title: '腾讯官方 2016-06 · 战斗属性说明（仅 生命/攻击/防御/暴击/抗暴 五种）',
    url: 'https://hyrz.qq.com/webplat/info/news_version3/11946/23790/23792/23940/23943/m21289/201606/478470.shtml',
    kind: 'official',
    retrievedAt: '2026-10-18',
    note: '官方口径的战斗属性只有五种，属性攻防是 90 级忍具后来才引入，不在原体系内。',
  },
  hyrz_official: {
    title: '腾讯官方 · 小队突袭奖励说明',
    url: 'https://hyrz.qq.com/webplat/info/news_version3/11946/18118/18119/19273/19275/19276/m13191/201606/474569.shtml',
    kind: 'official',
    retrievedAt: '2026-10-18',
  },
  game9_income: {
    title: '九游 2025-07 · 零氪/月卡金币收益',
    url: 'https://www.9game.cn/hyrz/11790876.html',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '零氪 1 万+/月、月卡 1.5 万+/月',
  },
  zol_income: {
    title: 'ZOL 2026-02 · 金币固定收益拆解（固定 6770 + 组织 2250）',
    url: 'https://game.zol.com.cn/1182/11822509.html',
    kind: 'guide',
    retrievedAt: '2026-10-18',
  },
  xiaomi_spirit: {
    title: '小米游戏中心 2021-06-23 · 通灵篇（等级上限四档）',
    url: 'https://game.xiaomi.com/viewpoint/1374185274_1624605242594_13',
    kind: 'forum',
    retrievedAt: '2026-10-18',
  },
  zhufu_strategy: {
    title: '搜狐 2020 · 通灵「均升优于单只冲高」策略（结论来源，非数字来源）',
    url: 'https://www.sohu.com/a/377123266_100270673',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '只支持「先均升到 +4」这个策略结论；具体战力数字不采信。',
  },
  diyiyou_jade: {
    title: '第一手游网 2016-01-18 · 各级勾玉战力实测（45 级 / 54 孔样本）',
    url: 'https://www.diyiyou.com/hyrz/gl/58285.html',
    kind: 'forum',
    retrievedAt: '2026-10-18',
    note: '原文自述样本为「45 级、我爱罗、6 装备 + 4 通灵 = 54 孔」，5/6 级数值作者自称「大胆推测」。',
  },
  taptap_tool: {
    title: 'TapTap 忍具教学 ·「除最高属性外其余属性全部只加一点战力」',
    url: 'https://www.taptap.cn/moment/397365372325465916',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '与「属性攻击每点 ×6」直接矛盾，是本项目将属性攻防系数标为 unverified 的反向证据之一。',
  },
  sohu_160raid: {
    title: '搜狐「App小胖子」2026-03-23 · 160 级团本「轮墓边狱」实测战力',
    url: 'https://m.sohu.com/a/1000198848_100270673/',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '160 级团本实测队伍「保底 3000 万、最高 4600 万」—— 证明原战力标准表 150 级 1500 万已过时。',
  },
  xiaomi_artifact_2021: {
    title: '小米游戏中心 2021-06-23 · 神器白牙后轮回石 30→60/次（独立第二来源）',
    url: 'https://game.xiaomi.com/viewpoint/1434414262_1680100956093_241',
    kind: 'forum',
    retrievedAt: '2026-10-18',
    note: '与搜狐 2019-03-07 独立印证「白牙后提炼一次从 30 个变 60 个」。',
  },
  farm_blacklist_note: {
    title: '【内部备注】AI 内容农场黑名单（不采信）',
    url: '',
    kind: 'warning',
    retrievedAt: '2026-10-18',
    note:
      '以下域名经实际访问确认同一模板（相同 CMS、配图 CDN img.xvcai.com、日期穿越、跨游戏泛化文案），' +
      '其精确数字只可当候选范围，不作独立来源：' +
      'guotao606.cn / liutao454.cn / huayan226.cn / zhoujing757.cn / 921syw.com / 900xz.com / ' +
      'lwyysz.com / fengyu952.cn / sunhong273.cn / zhuayu960.cn / hetang300.cn / guoning676.cn / ' +
      '70wenxi.cn / shachu495.cn / 926g.com / zhanghao515.cn / zhangdan525.cn / yulan291.cn / ' +
      'zhenglan979.cn / qianlan898.cn / caoteng951.cn / xuwan051.cn / jianliu787.cn。' +
      '另需防：① 9game.cn 部分栏目为假系统攻略；② zol.com.cn 有机翻洗稿；③ pd.qq.com 是攻略社搬运，非官方。',
  },
}

const CONFIDENCE_LABEL = {
  high: '多来源交叉确认',
  medium: '单一可靠来源 / UP主模板',
  low: '社区流传 / 口径不一',
  calibrated: '模型拟合值（仅可用于相对比较）',
  unverified: '未确证（请以游戏内为准）',
}

// ────────────────────────────────────────────────────────── 属性 → 战力

/**
 * 属性战力系数。
 *
 * ★ 2026-10-18 独立交叉验证后的修订（详见 docs/DATA-SOURCES.md）：
 *   - 生命/攻击/暴击：多来源独立一致 → 高
 *   - 防御：取 11.6。理由：这是**唯一做过「算出来→回游戏面板核对」闭环**的值
 *     （搜狐 2022：150 防御 × 11.6 = 1740，作者用游戏内战力明细反查「恰好 1740」）。
 *     11.6 / 11.7 / 12 三者其实都指向 ≈11.66，是截断与进位差别。
 *     ⚠ 但只有 2 个独立来源支持 11.6 → 整体置信度只能算「中」。
 *   - 抗暴：有官方改动日志佐证（2016-08-30 官方下调抗暴系数、上调暴击系数），
 *     解释了早期实测 17.40 / 5.25 与现值 10 / 6 的差异 → 中高
 *   - **属性攻击 6 / 属性防御 10：零独立来源，且有三处反向证据**
 *     ① 腾讯官方 2016 公告的战斗属性只有五种（生/攻/防/暴击/抗暴）
 *     ② 有忍具教学称「除最高属性外其余属性只加 1 点战力」，与 ×6 直接矛盾
 *     ③ 8+ 组检索无任何来源
 *     这两个值仅来自用户提供的 Excel 模板，保留但**必须标 unverified**，UI 应弱化展示。
 *   - 抗魔值不计入战力：仅间接证据（官方把它定位为秘境门槛），措辞用「不在战力求和内」，
 *     不要写成「官方确认不转化」。
 */
const ATTR_WEIGHTS = {
  hp: 1,
  atk: 3.5,
  def: 11.6,
  crit: 6,
  critResist: 10,
  elemAtk: 6,
  elemDef: 10,
  confidence: 'high',
  /** 逐项置信度：UI 与报告应按这个分项披露，而不是统称「高」 */
  perAttr: {
    hp: { value: 1, confidence: 'high', sources: 5, note: '多来源独立一致' },
    atk: { value: 3.5, confidence: 'high', sources: 4, note: '有算式验算 500×3.5=1750' },
    def: {
      value: 11.6,
      confidence: 'medium',
      sources: 2,
      note: '唯一带游戏内反查闭环的系数（150×11.6=1740 反查「恰好1740」）；11.6/11.7/12 实指 ≈11.66',
    },
    crit: { value: 6, confidence: 'high', sources: 5, note: '2016-08-30 官方上调后取值；有 3600×6 / 4700×6 验算' },
    critResist: { value: 10, confidence: 'medium', sources: 3, note: '2016-08-30 官方下调后取值（此前实测 17.40）；缺直接算式' },
    elemAtk: {
      value: 6,
      confidence: 'unverified',
      sources: 0,
      note: '零独立来源，仅见于 Excel 模板；官方 2016 公告战斗属性只有五种。仅作占位',
    },
    elemDef: {
      value: 10,
      confidence: 'unverified',
      sources: 0,
      note: '零独立来源，仅见于 Excel 模板。仅作占位',
    },
  },
  sourceIds: ['xlsx_base', 'sohu_coef', 'game9_coef'],
}

/** 16 板块（Excel 基础!A2:A17 顺序） */
const BOARDS = [
  { id: 'equipment', name: '装备', order: 0, note: '最容易达到版本上限（5 品阶，橙后最高 +59）' },
  { id: 'jade', name: '勾玉', order: 1, note: '六色，上限 9 级；建议全孔同步' },
  { id: 'accessory', name: '饰品', order: 2, note: '3 词条；130 级起带符文；换装必折损' },
  { id: 'artifact', name: '神器', order: 3, note: '忍玉+轮回石；白牙后收益减半' },
  { id: 'tool_body', name: '忍具（身）', order: 4, note: '90 级开启；浮动基础' },
  { id: 'spirit', name: '通灵', order: 5, note: '未上阵也生效；社区称加战力最多' },
  { id: 'tool_museum', name: '忍具藏馆', order: 6, note: '固定基础；全一阶=90% 属性加成' },
  { id: 'ninja_insight', name: '忍传感悟', order: 7, note: '真实基础，受收集加成' },
  { id: 'bond_card', name: '羁绊名片', order: 8, note: '固定基础，不受百分比加成' },
  { id: 'title', name: '称号', order: 9, note: '真实基础' },
  { id: 'scroll', name: '密卷', order: 10, note: '上限 30 级，10 级即满核心效果' },
  { id: 'avatar_frame', name: '头像框', order: 11, note: '真实基础' },
  { id: 'talent', name: '天赋', order: 12, note: '铜币即可提升，性价比高' },
  { id: 'talent_shura', name: '修罗天赋', order: 13, note: '110 级开放' },
  { id: 'rune', name: '符文镶嵌', order: 14, note: '空气加成：固定战力但可能属性不匹配' },
  { id: 'costume', name: '装扮', order: 15, note: '固定基础' },
]

const BOARD_ATTRS = [
  { id: 'hp', name: '生命面板' },
  { id: 'atk', name: '攻击面板' },
  { id: 'def', name: '防御面板' },
  { id: 'crit', name: '暴击' },
  { id: 'critResist', name: '抗暴' },
  { id: 'elemAtk', name: '属性攻击' },
  { id: 'elemDef', name: '属性防御' },
]

/** 忍者收集加成：只作用于 hp/atk/def（九游原文） */
const COLLECTION_BONUS = {
  hp: 0,
  atk: 0,
  def: 0,
  appliesTo: ['hp', 'atk', 'def'],
  needsUserInput: true,
  confidence: 'medium',
  sourceIds: ['game9_coef'],
}

// ─────────────────────────────────────────── 成长曲线（第二轮新增，可建模）

/**
 * 神器：白牙是硬分界。等级段 70/140/280。
 * 白牙前提炼 30 轮回石/次，白牙起 60/次（单位收益腰斩）。
 */
const GROWTH_ARTIFACT = {
  tiers: [
    { name: '前期（幌金绳～牙）', maxLevel: 70, powerPerYanYu: 0.19, powerPerLunHuiShi: 1, lunHuiPerRoll: 30 },
    { name: '中期（平目鲽～双袭牙）', maxLevel: 140, powerPerYanYu: 0.155, powerPerLunHuiShi: 1, lunHuiPerRoll: 30 },
    { name: '后期（白牙～）', maxLevel: 280, powerPerYanYu: 0.11, powerPerLunHuiShi: 0.27, lunHuiPerRoll: 60 },
  ],
  /** 白牙段满级实测：56.73 万轮回石 + 239 万忍玉 ≈ +41 万战力 */
  whiteFangBenchmark: { lunHuiShi: 567300, yanYu: 2390000, power: 410000, note: '轮回石贡献约 60%、忍玉约 40%', confidence: 'low' },
  note: '忍玉每级经验递增 → 忍玉边际收益递减；同档内建议平均升，不要单件猛冲。',
  confidence: 'medium',
  sourceIds: ['xlsx_base', 'xiaomi_artifact'],
}

/**
 * 通灵进阶：存在明确最优节点。
 *
 * ★ 2026-10-18 复核降级（详见 docs/DATA-SOURCES.md）：
 *   「全通灵 +4 = 60万声望 + 1125万铜币 → +19008 战力」这组数字的**唯一来源是 AI 内容农场**
 *   （zhenglan979.cn，与 guotao606/liutao454 同模板），且**文内自相矛盾**：
 *   前文说「单只 1 阶→5 阶 +1.9 万」，后文说「全通灵 5 阶 +20 万」，
 *   却把「全通灵消耗」配给了「1.9 万战力」。
 *
 *   但「先均升到 +4」这个**策略结论**有 2 个来源（搜狐2020 + 贴吧长帖）支持 ——
 *   结论可用，**数字不可信**。所以这里把 power 从 19008 撤下，标 unverified，
 *   避免它成为整个优先级排序的算术基础。
 */
const GROWTH_SPIRIT_ADVANCE = {
  stages: [
    { name: '忍犬-蛤蟆仙人', stageRange: '0-4', copperWan: 635.8, power: 9571, reputationWan: 24.8, powerPerReputation: 0.039 },
    { name: '忍犬-蛤蟆仙人', stageRange: '5—9', copperWan: 1864.5, power: 14421, reputationWan: 76.4, powerPerReputation: 0.018 },
    { name: '鲨鱼-蜘蛛', stageRange: '0-4', copperWan: 953.6, power: 14357, reputationWan: 25.7, powerPerReputation: 0.039 },
    { name: '鲨鱼-蜘蛛', stageRange: '5—9', copperWan: 2796.8, power: 21632, reputationWan: 114.6, powerPerReputation: 0.018 },
    { name: '氪金通灵', stageRange: '0-4', copperWan: 1907.3, power: 28715, reputationWan: 25.67, powerPerReputation: 0.039 },
    { name: '氪金通灵', stageRange: '5—9', copperWan: 5593.5, power: 43263, reputationWan: 229.2, powerPerReputation: 0.018 },
  ],
  /** 最优节点：策略结论可靠，数字不可靠 */
  sweetSpots: [
    {
      desc: '全部普通通灵进阶到 +4',
      cost: '消耗量未确证（原流传值 60万声望+1125万铜币已被判定为农场污染）',
      power: null,
      verdict: '策略上优先做（2 个来源支持"先均升"），但**具体战力增量未验证**',
      confidence: 'low',
      sourceIds: ['zhufu_strategy'],
    },
    { desc: '再全部推进到 5 阶', cost: '声望约 3 倍', power: null, verdict: '次优', confidence: 'low' },
    {
      desc: '攻击型通灵（猿魔/蛤蟆吉/山椒鱼/鲨鱼）到 15 阶',
      cost: '—',
      power: null,
      verdict: '同样来自农场转载，具体数值未验证',
      confidence: 'unverified',
    },
  ],
  note:
    '4/9/14/19 阶需要通灵卷轴。大进阶声望三档：3 万 / 4.5 万 / 9 万（对应三档通灵，来源小米，中置信）。' +
    '⚠ 「均升优于单只冲高」这个**策略**有 2 源支持；但「全通灵 +4 具体涨多少战力」的流传数字来自内容农场，本项目已撤下该数字。',
  confidence: 'low',
  sourceIds: ['xiaomi_spirit', 'zhufu_strategy'],
}

/** 通灵兽等级上限（两源独立：2019、2021） */
const GROWTH_SPIRIT_LEVEL_CAP = {
  groups: [
    { range: '忍犬～蛤蟆仙人', cap: 51 },
    { range: '鲵鲨～乌鸦', cap: 151 },
    { range: '蛤蟆龙～鹰', cap: 301 },
    { range: '蜘蛛', cap: 601, note: '单次升级约 200 万铜币' },
  ],
  confidence: 'medium',
  sourceIds: ['xiaomi_spirit'],
  note: '2 个独立作者（2019、2021）一致。',
}

/**
 * 勾玉：典型凹曲线（等级越高越贵、增幅越小）。
 *
 * ★ 2026-10-18 复核降级（详见 docs/DATA-SOURCES.md）：
 *   - 数字本身真实，但来源是 **2016-01-18 第一手游网**的单篇论坛实测，
 *     原文自述样本是「45 级、我爱罗、6 装备 + 4 通灵 = 54 孔」。
 *   - **54 孔这个基数早已失效**：现在通灵已 29+ 只，孔位远超 54；
 *     战力基数也从当年的 ~12 万涨到几千万。作为 2026 现值完全不能直接用。
 *   - 5/6 级数值原文自称「大胆推测」，非实测。
 *   - 勾玉加成还随角色等级/总战力浮动，**不该写死常数**。
 *
 *   → 结论：**「先铺满低等级再堆单孔」这个策略结论仍然成立**（凹曲线是结构性规律），
 *     但具体战力数字标 unverified，仅供量级参考。
 */
const GROWTH_JADE = {
  perLevelPower: {
    2: 124,
    3: 203,
    4: 402,
    5: 600,
    6: 800,
  },
  extrapolated: ['5', '6'],
  /** 全身实测：2016 年 45 级样本的 54 孔（⚠ 该基数已过时） */
  bodyTotals: [
    { level: 4, power: 21700, gold: 14600, note: '⚠ 2016 年 54 孔/45级样本：全 4 级 ≈ +2.17 万战力 / 1.46 万金币' },
    { level: 6, power: 43200, gold: 131000, note: '⚠ 同上：全 6 级 ≈ +4.32 万 / 13.1 万金币' },
  ],
  sampleContext: '2016-01-18 实测，样本为 45 级、我爱罗、6 装备 + 4 通灵 = 54 孔',
  /** 社区口诀（策略结论可靠） */
  rules: ['3 级两颗 > 1 颗 4 级', '3 颗 5 级 > 1 颗 6 级', '先全 4 级再往上'],
  note:
    '凹曲线是**结构性规律**（4→6 级：资源 ×9、战力 ×2），所以「先铺满低等级」的策略依然成立。' +
    '⚠ 但具体战力数字来自 2016 年 45 级样本、54 孔基数，**已不能当 2026 现值**；' +
    '且勾玉加成随等级/总战力浮动，不应写死。数字仅供量级参考。',
  confidence: 'unverified',
  sourceIds: ['diyiyou_jade'],
}

/** 忍具（第二轮） */
const GROWTH_TOOL = {
  enhanceCap: { noUnique: 8, withUnique: 15, note: '无究忍具最多 +8，有究忍具建议 +15（多来源一致）' },
  inheritance: '一星究 +15 继承到二星会掉 2 级，最省',
  museum: { allFirstTier: 1816, attrBonus: 0.9, toolBodyMax: 0.27, versionCap: 1.17, note: '藏馆全一阶=1816点=90% 属性加成；忍具本体最多 27%；版本上限 117%' },
  confidence: 'medium',
  sourceIds: ['zol_museum'],
}

/** 饰品：云迹腰带 0→+30 实测（单来源） */
const GROWTH_ACCESSORY = {
  yunjiBelt30: { power: 730000, magic: 12000, dust: 1150000, talisman: 1608, star: 18000, note: '云迹腰带 0→+30 单件' },
  confidence: 'medium',
  sourceIds: ['csdn'],
}

// ────────────────────────────────────────── 战力分阶段基准（做目标倒推）

/**
 * 社区「战力标准表」。
 *
 * ★ 2026-10-18 复核后的重要修订（详见 docs/DATA-SOURCES.md）：
 *   1) **原表高段系统性偏低**。游戏等级上限已不是 150 —— 2026-03 已上线 160 级团本，
 *      实测队伍下限就是 3000 万战力。原「150 级 ≥1500 万」低了 2 倍以上。
 *   2) 130 / 140 段按玩家自述上调（3839 答主：141 级起码 950 万）。
 *   3) **新增 155 / 160 段**（估，低置信）。
 *   4) ⚠ 诚实声明：120/130/140 三段的佐证**全部来自同一个答主引用同一张网图**，
 *      实际独立来源数 = 1，不是 3。70/80/100/110/145 段**完全无独立佐证**。
 *      所以整表置信度只能是「低」，且容差 ±50 万在高段明显不成立。
 *
 * 用途：只作**量级参考**，不是硬指标。社区更认可「本服排名分位」而非绝对战力阈值。
 */
const POWER_STANDARDS = {
  table: [
    { level: 60, power: 600000, confidence: 'low', basis: '仅农场站提及' },
    { level: 70, power: 750000, range: [640000, 850000], confidence: 'unverified', basis: '零独立佐证，沿用旧值' },
    { level: 80, power: 1000000, confidence: 'unverified', basis: '零独立佐证' },
    { level: 90, power: 1500000, confidence: 'unverified', basis: '零独立佐证（仅有"90级能否300万"的讨论，反证 300 万属超纲）' },
    { level: 100, power: 2500000, confidence: 'unverified', basis: '零独立佐证' },
    { level: 110, power: 3000000, confidence: 'unverified', basis: '零独立佐证' },
    { level: 120, power: 4000000, confidence: 'low', basis: '单一答主引用网图' },
    { level: 125, power: 4800000, confidence: 'unverified', basis: '零独立佐证' },
    { level: 130, power: 6200000, confidence: 'low', basis: '133级636万被判"合格"（单一答主）' },
    { level: 140, power: 9500000, confidence: 'low', basis: '玩家自述"141级起码950万"（单一答主）' },
    { level: 145, power: 11000000, confidence: 'unverified', basis: '原始出处完全未找到，沿用旧值' },
    { level: 150, power: 30000000, confidence: 'low', basis: '160级团本实测队伍下限 3000 万（原 1500 万低 2 倍）' },
    { level: 155, power: 40000000, confidence: 'unverified', basis: '插值估算，无来源' },
    { level: 160, power: 50000000, confidence: 'unverified', basis: '160级团本"保底3000万、最高4600万"→ 取 5000 万作参考' },
  ],
  tolerance: 500000,
  toleranceNote: '±50 万容差在 140 级以上明显不成立（该段跨度已达数千万），仅适用于 120 级以下。',
  crossCheck: [
    '133 级 636 万 → 被判"合格"',
    '132 级 753 万 → 战区 81 名 / 本服第二',
    '142 级 750 万 → 明显偏废（说明 140+ 分档陡峭）',
    '141 级 600 万 → 严重不达标',
    '150 级 1000 万 → "打 150 本一直被踢"',
    '160 级团本实测队伍 → 保底 3000 万、最高 4600 万',
    '一位 2018 年月卡党 → 2026 年 3100 万',
  ],
  confidence: 'low',
  sourceIds: ['qq_standard'],
  note:
    '⚠ 本表只能当量级参考：高段多为民工估算且已过时（游戏已开 160 级），' +
    '低段（70~110）几乎无独立佐证。社区实际上更认「本服排名分位」而非绝对战力阈值。' +
    '请以游戏内实际体验为准，不要把本表当达标硬线。',
  independentSourceWarning:
    '120/130/140 三段的佐证全部来自同一个答主引用同一张网图 —— 实际独立来源数 = 1，不是 3。',
}

// ────────────────────────────────────────── 资源日收益（做"多少天"需要）

/**
 * ★ 2026-10-18 复核后的修订（详见 docs/DATA-SOURCES.md）：
 *
 * - **体力：原写 1200/天，数量级错误**。硬机制：每 5 分钟恢复 1 点、上限 200
 *   → 24h 自然恢复仅 288；加一乐拉面 3 次约 150 → 实际约 **460/天**。
 *   原值高了 2.4~2.7 倍，会严重污染「多少天能攒够」的倒推。
 * - **金币：原写 260/天偏低**。4 源互证（17173 2025-03 / 9game 2025-07 /
 *   ZOL 2026-02 / ZOL 2025-05）零氪约 330~500/天，取 **400**；
 *   月卡固定 +160/天为硬数据 → 约 **550**。
 * - **铜币：原写 30~36 万/天缺一手佐证**。有 2020 明细帖称丰饶之间单项即 46 万/天，
 *   与本值矛盾。故标 **unverified**，并给出候选范围。
 */
const RESOURCE_INCOME = {
  gold: {
    freeToPlay: 400,
    freeToPlayRange: [330, 500],
    monthlyCard: 550,
    monthlyCardRange: [500, 660],
    unit: '金币/天',
    confidence: 'medium',
    note: '零氪约 330~500/天（取 400）；月卡固定 +160/天（硬数据）→ 约 550。4 源互证。',
    sourceIds: ['game9_income', 'zol_income'],
  },
  copper: {
    min: 300000,
    max: 360000,
    unit: '铜币/天',
    confidence: 'unverified',
    note:
      '⚠ 未找到一手计算帖。有 2020 年明细帖称「丰饶之间单项即 46 万/天」（月合计约 1.36 亿），' +
      '与本值冲突一个数量级。此处保留旧值仅作量级参考，请以游戏内实测为准。',
    sourceIds: [],
  },
  stamina: {
    natural: 288,
    withRamen: 460,
    unit: '体力/天',
    confidence: 'medium',
    note: '硬机制：5 分钟恢复 1 点、上限 200 → 自然恢复 288/天；加一乐拉面 3 次（约 150）→ 约 460/天。',
  },
  reputation: {
    note: '小队突袭前 3 次（150 金）得 1260 声望 + 300 忍玉/次；免费次数仅 210 声望 + 50 忍玉 → 3 倍差',
    confidence: 'medium',
    sourceIds: ['hyrz_official'],
  },
  confidence: 'medium',
  sourceIds: ['game9_income', 'zol_income', 'hyrz_official'],
}

// ──────────────────────────────── 性价比排序 & 虚战口径（直接喂给 agent）

const PRIORITY_ORDER = {
  overall: ['装备', '饰品', '通灵', '神器（前期）'],
  notes: [
    '装备/饰品 > 通灵 > 神器（前期）—— 多来源一致',
    '神器内部三段式：70 → 140 → 280，白牙后收益腰斩',
    '通灵：先全普通通灵 +4 → 5 阶 → 攻击型 15 阶',
    '勾玉：先全 4 级（"3 级两颗 > 1 颗 4 级"）',
    '忍者收集战力 > 升星战力（官方 2016 明确"不要为升星刷碎片"）',
  ],
  confidence: 'medium',
  sourceIds: ['whalegame_2025', 'xlsx_base'],
}

/** 虚战 = 透支潜力（视频作者原话），不是属性种类 */
const INFLATION_RULES = {
  kind: '透支型（机会成本）',
  notAttributeBased: true,
  disclaimer:
    '「虚战」按视频作者定义：**不计后果透支潜力换取战力** —— 指资源投向的机会成本，' +
    '与「堆暴击 / 堆生命」无关（作者已明确否定该说法）。' +
    '社区另有「属性溢出型虚战」（暴击超实战上限）说法，是另一个概念，本工具不采用。',
  thresholds: { overConcentratedShare: 0.25, underDevelopedShare: 0.03, imbalanceRatio: 5, diminishingRatio: 0.3 },
  typicalExamples: [
    '硬拉绿瓶堆饰品等级（绿水收益递减后仍继续堆）',
    '声望礼包买到后 2 次（声望边际收益已很低）',
    '拉忍尘高强忍具（无保护符/祝福券硬强）',
    '赌运气强化饰品不用保护符，反而亏掉更多材料',
  ],
  confidence: 'medium',
  sourceIds: ['bili_nangong', 'xlsx_base'],
}

const CAUTIONS = [
  '战力换算系数（生命1/攻击3.5/防御11.6/暴击6/抗暴10）是多来源交叉验证的社区共识，但官方从未公布公式。',
  '防御系数存在 11.6 / 11.7 / 12 三个口径，本表取与 Excel 模板一致的 11.6。',
  '板块划分与成长效率来自 B站 UP 主「无花果酱」的个人实测模板，不是官方数据。',
  '「虚战」按视频作者定义 = 不计后果透支潜力换取战力，与「堆暴击/堆生命」无关。',
  '社区流传的「各系统战力占比 %」并不存在：官方从未公布，社区也无人做出全系统拆解。占比只针对你自己面板内部比较。',
  '生命/攻击/防御 的战力计算需乘「忍者收集加成系数」；暴击/抗暴不享受该加成。默认按 0 会低估战力。',
  '抗魔值不转化为战力 —— 它只是秘境掉落门槛。',
  '⚠ 网上大量「战力/资源」文章为 AI 内容农场（9game/guotao606/huayan226 等部分稿件），其精确数字只能当候选区间。',
  '战力标准表（60~150 级）为社区流传，容差约 ±50 万，仅作量级参考。',
]

const POWER_DATA = {
  version: '2026.10.17',
  sources: SOURCES,
  confidenceLabel: CONFIDENCE_LABEL,
  attrWeights: ATTR_WEIGHTS,
  boards: BOARDS,
  boardAttrs: BOARD_ATTRS,
  collectionBonus: COLLECTION_BONUS,
  growth: {
    artifact: GROWTH_ARTIFACT,
    spiritAdvance: GROWTH_SPIRIT_ADVANCE,
    spiritLevelCap: GROWTH_SPIRIT_LEVEL_CAP,
    jade: GROWTH_JADE,
    tool: GROWTH_TOOL,
    accessory: GROWTH_ACCESSORY,
  },
  powerStandards: POWER_STANDARDS,
  resourceIncome: RESOURCE_INCOME,
  priorityOrder: PRIORITY_ORDER,
  inflation: INFLATION_RULES,
  cautions: CAUTIONS,
}


export default POWER_DATA

