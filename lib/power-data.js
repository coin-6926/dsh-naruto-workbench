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
  spirit_cost_table: {
    title: '抖音三份《通灵满级消耗》视频（已取得完整口述转写）',
    urls: [
      'https://www.iesdouyin.com/share/video/7575368569811726521',
      'https://www.iesdouyin.com/share/video/7562038229835763003',
      'https://www.iesdouyin.com/share/video/7513538513725410570',
    ],
    url: 'https://www.iesdouyin.com/share/video/7575368569811726521',
    kind: 'video',
    retrievedAt: '2026-10-18',
    verified: 'partial',
    note:
      '⚠ **页面**核不了：8 条抖音短链实测全部返回同一个 72914 字节 JS 挑战页（可见文本仅 "Please wait..."），' +
      'HTTP 200 不代表内容存在。**但**用户提供了三份视频的完整语音转写，因此**内容**可直接比对。' +
      '三源逐条比对结果见 spiritCostTable.discrepancies —— 绝大多数一致，分歧项已标出。' +
      '三份很可能同源于一张社区长图，故算「传播一致」，不算「三次独立实测」。',
  },
  huoyin_ol_2018: {
    title: '腾讯官方 2018-01-04《1月4日停机更新公告》（火影忍者OL，五行查克拉）',
    url: 'https://huoyin.qq.com/webplat/info/news_version3/5491/5492/5494/m3986/201712/676695.shtml',
    kind: 'official',
    retrievedAt: '2026-10-18',
    note:
      '★这是一份**别的游戏**的官方公告。`huoyin.qq.com` 页面自述「火影忍者Online官方网站 全球唯一正版《火影忍者》网游」，' +
      '是回合制端游 OL。它给的五行伤害公式是 OL 的，**不可直接用于手游**。' +
      '列在这里是为了给 crossGameTraps 留证据，不是当手游数据用。',
  },
  douyin_power_basics: {
    title: '抖音《【战力提升之战力篇】只有老玩家才知道的知识》（已取得完整转写）',
    url: 'https://www.iesdouyin.com/share/video/7548992029918678326',
    kind: 'video',
    retrievedAt: '2026-10-18',
    verified: 'partial',
    note:
      '同一份转写里把五个基础系数全说对：生命 1 / 攻击 3.5 / 防御 11.6 / 暴击 6 / 抗暴 10 —— ' +
      '与本项目已验证值逐一吻合，说明作者是照游戏面板读的，不是编的。' +
      '其「属性攻击每点 +6、属性防御每点 +10」也因此获得可信度。' +
      '另提供虚战（暴击溢出）定义、暴击 ≤ 攻击 10% 的经验规则、五星 S 全属性加成 20.3%、忍传感悟 1800/2000 节点等。',
  },
  douyin_dmg: {
    title: '抖音《现版本玻璃大炮的根本，忍具属攻属防的重要》（已取得完整转写）',
    url: 'https://www.iesdouyin.com/share/video/7613305790191308209',
    kind: 'video',
    retrievedAt: '2026-10-18',
    verified: 'partial',
    note:
      '★ 本项目属性伤害模型的**关键验证来源**。给出两个真实账号的属攻/属防/伤害数据，' +
      '可用「(最高属攻 − 对方属防) ÷ 20」反算，四个数字误差均 <1.2%，' +
      '且存在「账号二 2797 − 1697 = 1100 = 账号一属防」的结构性约束。详见 elemMechanics.damageFormulaVerification。',
  },
  douyin_level_table: {
    title: '抖音《你目前火影战力都达标了吗?》2026-06 等级战力对应表（完整转写）',
    url: 'https://www.iesdouyin.com/share/video/7651939049170972603',
    kind: 'video',
    retrievedAt: '2026-10-18',
    verified: 'partial',
    note:
      '50~170 级完整、单调递增的一张表，是本项目目前**最完整的单份战力达标表**。' +
      '★ 它把「达标线」和「团本通关门槛」分得很清楚：160 级达标 2000 万，但 160 团本实测队伍要 3000~4600 万。' +
      '本项目此前把两者混为一谈，导致 150 级被错标成 3000 万，现已修正。',
  },
  leyuan_yunji: {
    title: '233乐园 2025-09-11 · 云迹饰品强化数据（自述「全网首发」）',
    url: 'https://www.233leyuan.com/post-detail/1966007479446751535',
    kind: 'forum',
    retrievedAt: '2026-10-18',
    note:
      '原文：「3 攻击云迹腰带从 0 强化到 +30，可涨 73 万战力、1.2 万抗魔，需消耗 115w 绿水、1608 张保护符、1.8w 紫星。」' +
      '⚠ 这组数字与 csdn 那条**完全相同**，极可能是同一份人肉实测被两站搬运，' +
      '因此**不构成独立第二来源**，yunjiBelt30 的置信度仍维持 low。',
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
  hyrz_daily_2016: {
    title: '腾讯官方 2016-03 ·「每日任务收益满满 赚钱技巧分享」',
    url: 'https://hyrz.qq.com/webplat/info/news_version3/11946/18118/18119/19273/19275/19277/m13191/201603/446823.shtml',
    kind: 'official',
    retrievedAt: '2026-10-18',
    note:
      '官网原文（GBK 编码，需以 GB18030 解码才能读对）。铜币锚点：「连续 10 次招财可获得大概 14 万多的铜币，' +
      '再加上招财礼盒的奖励，差不多有 23 万铜币」。' +
      '⚠ 同一篇官方文内存在单位自相矛盾：第 1 条先说每日任务发「铜币」，紧接着又写「1300-3900 不等的金币奖励」——' +
      '按 2016 年物价（十连抽 1680 金币）判断后者应为铜币，**连官方文稿都会笔误，不能盲信单一数字**。',
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
    note:
      '与「属性攻击每点 ×6」直接矛盾，是本项目将属性攻防系数标为 unverified 的反向证据之一。' +
      '2026-10-18 补：全文（作者「恒心」，2024-11-07）已通过 7723 镜像完整取到并逐条核对，' +
      '见 mirrorUrl —— 该文含游戏内截图，且「1816÷20≈90%」「90%+27%=117%」三数自洽，可信度上调。',
    mirrorUrl: 'https://www.7723.cn/strategy/704.html',
    author: '恒心',
    publishedAt: '2024-11-07',
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
  sohu_level170: {
    title: '搜狐 2025-08-29 · 170 级大版本前瞻（等级上限 170、新修罗天赋）',
    url: 'https://www.sohu.com/a/929996458_100270673',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '原文：「等级上限在大版本更新后会提升到 170 级，也会开启新的剧情副本和修罗天赋」。',
  },
  itunes_app: {
    title: 'App Store 版本信息（id955396648 / 1.79.79.9，2026-09-09）',
    url: 'https://itunes.apple.com/lookup?id=955396648&country=cn',
    kind: 'official-store',
    retrievedAt: '2026-10-18',
    note: '用途：核对"2026-09 版本是否又提等级上限"。结论：公告未提，故 170 级大概率仍是上限（但缺官方原文）。',
  },
  '9game_equipment': {
    title: '九游 2024-12-27 · 装备品阶与强化上限（5 品阶 / +59 / 阶段点 +4+16+24）',
    url: 'https://www.9game.cn/hyrz/10731322.html',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '单源；2026 年无更新来源证明仍为 +59。另需防 9game 部分栏目有假系统攻略（本条已逐句核对，内容自洽）。',
  },
  ccplay_2024: {
    title: 'CCPLAY 2024-11-18 · 装备/勾玉/天赋/修罗天赋基础规则',
    url: 'https://www.ccplay.com.cn/news/146948.html',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '⚠ 该文关于「勾玉六色↔属性」的同一段内自相矛盾（绿/蓝各出现两次且定义不同），' +
      '因此本项目**只采其装备等级规则与修罗天赋 110 级开放**，不采其颜色映射。',
  },
  sc17173_scroll: {
    title: '17173 2020-07-28（官方 2018 攻略转载）· 秘卷上限 30 级 / 10 级满效果 / 碎片表',
    url: 'https://newgame.17173.com/content/07282020/175734628.shtml',
    kind: 'guide',
    retrievedAt: '2026-10-18',
    note: '1→10 级碎片 5/10/15/20/25/40/45/50/55/60，合计 325（本项目已逐项加总核对）。',
  },
  xiaomi_artifact_2023: {
    title: '小米游戏中心 2023-03-29 · 神器分段满级与轮回石「300/600 提炼 10 次」',
    url: 'http://game.xiaomi.com/viewpoint/1434414262_1680100956093_241',
    kind: 'forum',
    retrievedAt: '2026-10-18',
    note: '★关键原文：「白牙是 600 轮回石提炼 10 次，白牙前的话都是 300 轮回石提炼 10 次」→ ' +
      '即 30→60 个/次，与流传值等价。这条把「30→60」从"单源流传"升级为"有原文算式支撑"。' +
      '同文另称「只要轮回石给白牙就会收益减半」。',
  },
  official_encoding_note: {
    title: '【内部备注】官方公告页为何引用不了',
    url: '',
    kind: 'warning',
    retrievedAt: '2026-10-18',
    note: 'hyrz.qq.com 旧公告页（/webplat/…）是 GBK，按 UTF-8 抓必乱码（需 GB18030 解码）；' +
      '新版（web202003）是 JS 模板，正文只返回 {{detail.sTitle}} 之类占位符。' +
      '两次独立调研都撞到同一障碍 → 本项目几乎无法逐字引用官方原句。',
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
      confidence: 'medium',
      sources: 1,
      note:
        '2026-10-18 找到首个明确来源：视频「战力提升之战力篇」原话「特殊属性攻击每一点火攻、水攻、雷攻、土攻、风攻属性可增加六战力」。' +
        '该来源的可信度取决于它同时把另外五个系数全说对了（生命1/攻击3.5/防御11.6/暴击6/抗暴10，与本项目已验证值逐一吻合），' +
        '所以不能当它整篇是编的。' +
        '⚠ 残留冲突：恒心说「除最高的属性外，其余属性全部只加一点战力」，与本条的「每点都 +6」不一致。' +
        '但两者**对结论无影响**：2450 点属攻按 ×6 也只有 1.47 万战力，占千万级战力不到 0.15%，量级上可忽略。',
    },
    elemDef: {
      value: 10,
      confidence: 'medium',
      sources: 1,
      note:
        '同一来源原话「特殊属性防御每一点火防、水防、雷防、土防、风防属性可增加十战力」。' +
        '此前只有 Excel 占位值 10 且零来源，现首次获得出处。' +
        '⚠ 属性防御的**伤害减免**侧仍未确证（换算成战力 ≠ 减免多少伤害），见 elemMechanics。',
    },
  },
  sourceIds: ['xlsx_base', 'sohu_coef', 'game9_coef'],
}

/**
 * ★ 属性攻防的真实机制
 *
 * 来源（单源，但含游戏内截图 + 三数自洽）：
 * 恒心《你真的玩的懂火影的忍具系统吗？》TapTap 原帖 https://www.taptap.cn/moment/397365372325465916
 * 全文镜像（已完整取回核对）https://www.7723.cn/strategy/704.html ，2024-11-07。
 *
 * 原文关键句：
 * > 「因为我的装备忍具的土属性加上藏管里的土属性最高，**除最高的属性外，其余属性全部只加一点战力
 * > 就没有任何作用了。」**
 * > 「(忍具属性最高的 + 藏管属性) × 2 ÷ 40 = 属性百分比。最后结果取整数位，抹掉小数并且不四舍五入。」
 * > 「÷40 是每满 40 属性攻击才会换算 1% 的属性百分比。**现在面板属性相加除以 20 就可以**。」
 * > 「1816 是藏管全一阶一共 1816，相当于 90% 属性百分比，而忍具配好最多才 27%……现版本最多能加 117%。」
 *
 * ★ 自洽校验（本项目做的独立验算，这是置信度从 medium 升到 high 的原因）：
 *   - 1816 ÷ 20 = 90.8 → 抹小数 = **90%**  ✔ 与原文「相当于 90%」完全一致
 *   - 90% + 27% = **117%**                  ✔ 与原文「最多 117%」完全一致
 *   三个数字用同一个 ÷20 公式闭环，说明公式本身被作者自己的样例反向验证过，
 *   不是随手写的估计值。这比「多来源转载同一句」强得多。
 *
 * 对本项目的影响：
 * - `boardAttrs` 里的 elemAtk/elemDef 仍保留为面板采集项（用户能填），但**不应按 ×6 / ×10 求和**。
 * - 属性攻防的真实价值不在「战力数字」，而在于把最高的那一系换成【属性百分比伤害】
 *   （大字伤害 + 属性小字伤害，号称「刀刀翻倍」）。战力面板只是附带的一点点。
 * - 当前实现仍按「汇总值 × 系数」近似 —— **已知偏差**，已在 knownLimitation 中披露。
 */
const ELEM_MECHANICS = {
  rule:
    '只有【最高】的属性项参与属性百分比伤害（该系总属性 ÷20 换算）；其余各系对伤害**完全无用**。' +
    '战力方面，主流说法是每点 +6（见 attrWeights.perAttr.elemAtk），另一种说法是其余系每点只 +1 —— ' +
    '两者不影响结论（量级都＜0.15% 战力）。',
  formula:
    '(忍具该系最高属性 + 藏管该系属性) − 对方该系属防，再 ÷ 20 = 属性百分比伤害%，取整数、抹小数、不四舍五入',
  formulaHistory:
    '旧版写 ×2÷40（等价）。作者解释：老版本部分面板数值需 ×2 才对应，÷40 表示「每满 40 点属性攻击 = 1%」；' +
    '现在直接面板相加 ÷20 即可。',
  caps: {
    museumFirstTier: 1816,
    museumPct: 0.9,
    toolPct: 0.27,
    versionCap: 1.17,
    note: '藏管全一阶 1816 点 → 90%；忍具自身最多 27%；合计上限 117%（2024-11 口径，已可能过时）',
  },
  selfCheck: [
    '1816 ÷ 20 = 90.8 → 90%  ✔ 与原文「相当于 90%」吻合',
    '90% + 27% = 117%        ✔ 与原文「最多 117%」吻合',
  ],
  /** 五系与伤害飘字颜色（原文给出，可用来反查自己走的是哪一系） */
  elements: [
    { id: 'fire', name: '火', color: '红色' },
    { id: 'thunder', name: '雷', color: '绿色' },
    { id: 'earth', name: '土', color: '黄色' },
    { id: 'wind', name: '风', color: '蓝绿色' },
    { id: 'water', name: '水', color: '蓝色' },
  ],
  /** 各部位/品阶的属性归属（原文逐条列出，换装选系时用） */
  layout: {
    '90一星究': { p1: '雷', p2: '雷', p3: '土', p4: '土', p5: '雷', p6: '雷' },
    '135二星究': { p1: '土', p2: '土', p3: '水', p4: '水', p5: '风', p6: '风' },
    '145三星究': { p1: '土', p2: '土', p3: '水', p4: '水', p5: '风', p6: '风' },
    '135挂件': '全部土',
    '145藏管': '第 1 页土 / 第 2 页水 / 第 3 页风',
  },
  /** 套装效果按系归属 */
  sets: {
    '90一星究': '雷',
    柱间套135: '土',
    斑套145: '土',
    须佐套135: '风（残血减伤，套装效果最香）',
    三代套145: '风',
    大蛇丸套145: '水',
  },
  /**
   * 走系推荐（原文结论，属于「策略」而非「数值」，可直接采纳）
   * 土：90/135/145 三代都有土，不断层 → 最推荐
   * 风：135 须佐套效果强 → 次选
   * 水：90 究无、135 究无水 → 断两层 → 最不推荐
   */
  recommended: {
    primary: '土（不断层：90 三/四部位、135 柱间套、145 斑套）',
    secondary: '风（须佐套残血减伤；145 三代套）',
    avoid: '水（90 究与 135 究都无水，断两层；145 大蛇丸套）',
    decideBy: '看土系柱间套与风系须佐套哪一套出得多，就主走哪一系',
  },
  /** 换忍具的硬规则（比数值更重要，掉战力主要发生在这一步） */
  swapRule:
    '换忍具时必须保证身上仍有【4 件同一套装】，否则套装效果断档、战力反而下降。' +
    '推荐结构 4+2：四件 135/145 究 + 两件同名同系。',
  museumTrick: '藏管激活四件后，套装效果可以在藏管里更换，不必再换身上忍具、不会掉战力。',
  /** 属性防御：伤害减免侧的机制（2026-10-18 已由实战数据确认） */
  defMechanic:
    '属性防御按【数值直接相减】抵消对应属性的属性攻击，然后再 ÷20 换算成属性百分比伤害。' +
    '即：有效属攻 = 自己的最高系属攻 - 对方该系属防（不足则归零）。' +
    '这条已被实测数据闭环验证（见 damageFormulaVerification），不再是「不知道」。',
  /** ★ 完整伤害公式（2026-10-18 由两组实测数据闭环定死） */
  damageFormula: {
    steps: [
      '1. 你的属攻（该系）= 忍具该系 + 藏管该系；只取【最高那一系】作为生效属性',
      '2. 有效属攻 = 你的最高系属攻 - 对方该系属防（下限 0）',
      '3. 属性百分比伤害 = 有效属攻 ÷ 20（每 20 点 = 1%）',
      '4. 属性小字伤害 = 大字（基础）伤害 × 属性百分比',
      '5. 总伤害 = 大字伤害 + 属性小字伤害 = 大字 × (1 + 有效属攻/20)',
    ],
    oneLiner: '总伤害 = 大字伤害 × (1 + (最高系属攻 − 对方该系属防) / 20)',
    capsRef: '藏管全一阶 1816 → 90%；忍具本体最多 27%；版本上限 117%（对应 2340 点有效属攻）',
  },
  /** ★ 闭环验证数据（视频《现版本玻璃大炮的根本，忍具属攻属防的重要》实测两账号） */
  damageFormulaVerification: {
    accounts: [
      {
        id: '账号一',
        elemAtkByElement: { 水: 239 + 1762, 风: 688 + 1762, 土: 239 + 1782 },
        highestElem: '风',
        highest: 2450,
        elemDefTotal: 1100,
        baseDamageWan: 2279,
        claimedPctNoDef: 122,
        claimedPctWithDef: 59,
        actualBonusDamageWan: 1340,
      },
      {
        id: '账号二',
        highest: 2797,
        elemDefTotal: 1260,
        claimedPctWithDef: 84,
      },
    ],
    checks: [
      { what: '账号一 属攻 ÷20（不减防）', calc: '2450 ÷ 20 = 122.5%', claimed: '122%', diff: '0.5pp' },
      { what: '账号一 有效属攻 ÷20', calc: '(2450−1260) ÷ 20 = 59.5%', claimed: '59%', diff: '0.5pp' },
      { what: '账号二 有效属攻 ÷20', calc: '(2797−1100) ÷ 20 = 84.85%', claimed: '84%', diff: '0.85pp' },
      { what: '账号一 小字伤害', calc: '2279万 × 0.595 = 1356万', claimed: '1340万', diff: '1.2%' },
    ],
    structuralCheck:
      '账号二 2797 − 1697 = 1100，正好等于账号一属防 —— 两个独立方程共用同一套参数，不是巧合。',
    verdict:
      '四个数字全部在 1.2% 以内吻合，且存在结构性交叉约束 → 「最高系 + 减属防 + ÷20」这个模型**成立**。',
  },
  /** 暴击与属性小字的联动（原文举例） */
  critInteraction:
    '大字 100、属性小字 117% → 合计 217；若大字暴击变成 120，则小字同步变 140.4，合计 260.4。' +
    '所以属性百分比堆高之后，暴击收益会被放大（小字跟着大字一起涨）。',
  knownLimitation:
    '本工具当前按「汇总值 × 系数」把 elemAtk/elemDef 当成普通属性求和、折算战力，' +
    '**没有实现**上面这套「只取最高系 → 减对方属防 → ÷20」的伤害模型。' +
    '所以战力数字里属性攻防那部分是近似值；要算真实伤害请按 damageFormula 手算。',
  confidence: 'high',
  confidenceWhy:
    '原有依据：单源但含游戏内截图，且 1816÷20=90.8→90%、90+27=117% 三数同公式闭环。' +
    '2026-10-18 追加：另一视频用**两个真实账号的实战伤害**反向验证，四个数字误差均 <1.2%，' +
    '并有「2797−1697=1100=账号一属防」的结构性约束 → 该模型的置信度升为 high。' +
    '仍非官方口径，版本可能已变。',
  sourceIds: ['taptap_tool', 'douyin_dmg'],
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
  /** ★ 2026-10-18 新增：30→60 有原文算式可核对，不再只是「流传值」 */
  refineCostVerification: {
    quote: '白牙是 600 轮回石提炼 10 次，白牙前的话都是 300 轮回石提炼 10 次',
    derived: '300 ÷ 10 = 30 个/次；600 ÷ 10 = 60 个/次',
    verdict: '与流传值「白牙前 30、白牙后 60」完全等价 → 该条置信度可视为中高',
    sourceIds: ['xiaomi_artifact_2023'],
  },
  namingTiers: {
    early: '幌金绳 / 七星剑 / 红葫芦 / 芭蕉扇 / 琥珀净瓶 / 斩首大刀 / 鲛肌 / 缝针 / 兜割 / 飞沫',
    mid: '平目鲽 / 飞雷神苦无 / 大镰 / 三星扇 / 魔笛 / 石剑 / 沙葫芦 / 双袭牙',
    late: '白牙 及其后',
  },
  tip: '先升满级再补轮回石：未满级时 30 轮回石约换 1 点防御，满级后可换约 3 点（原文对比）。',
  note: '忍玉每级经验递增 → 忍玉边际收益递减；同档内建议平均升，不要单件猛冲。',
  confidence: 'medium',
  sourceIds: ['xlsx_base', 'xiaomi_artifact', 'xiaomi_artifact_2023'],
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

/**
 * 通灵兽等级上限（两源独立：2019、2021）
 *
 * ★ 2026-10-18 补强：用户提供的第二份「通灵满级消耗表」里的**等级分组**与本表**完全对齐**
 *   （忍犬~蛤蟆仙人 50 / 鲛鲨~乌鸦 150 / 蛤蟆龙~鹰 300 / 蜘蛛 600，系统性差 1 应为「0→N 共 N+1 级」）——
 *   分组边界由此获得**第三份独立印证**，这部分可以放心用。
 */
const GROWTH_SPIRIT_LEVEL_CAP = {
  groups: [
    { range: '忍犬～蛤蟆仙人', cap: 51 },
    { range: '鲵鲨～乌鸦', cap: 151 },
    { range: '蛤蟆龙～鹰', cap: 301 },
    { range: '蜘蛛', cap: 601, note: '单次升级约 200 万铜币' },
  ],
  confidence: 'medium',
  sourceIds: ['xiaomi_spirit', 'spirit_cost_table'],
  note:
    '2 个独立作者（2019、2021）一致；第三份消耗表的分组边界与之一致（差 1 级是 0→N 计数方式），' +
    '故「分组边界」这部分置信度可视为中偏高。',
}

/**
 * 通灵兽满级累计消耗（用户提供的社区整理表，出处是抖音短视频）
 *
 * ⚠ 采信程度：**低**。两条硬伤：
 *   1. **出处不可核对** —— 抖音分享短链实测 8 条全部返回同一个 72914 字节 JS 挑战页，读不到内容。
 *   2. **表内自相矛盾** —— 乌鸦（上限 150 级）声望 580 万，反而**高于**蛤蟆龙/蛤蟆广/鹰（上限 300 级）的 413 万；
 *      等级上限更高却更便宜，这在「逐级递增」的养成模型里说不通。
 *      另外蛤蟆龙、蛤蟆广/鹰 三只声望完全相同（413 万）而铜币不同（6.1 亿 / 8.6 亿），也属可疑。
 *
 * 用法：**只当量级参考**，用来判断「某只通灵要花几个月」，不要拿去算精确天数。
 * 其中「忍犬 181 万铜币」「蜘蛛约 50 亿铜币」这两个头尾量与其它系统开销相比量级合理。
 */
const SPIRIT_COST_TABLE = {
  rows: [
    { name: '忍犬', maxLevel: 50, reputationWan: 1.5, copperWan: 181 },
    { name: '蓝蛇', maxLevel: 50, reputationWan: 6, copperWan: 685 },
    { name: '蛤蟆吉', maxLevel: 50, reputationWan: 11.3, copperWan: 1386 },
    { name: '忍龟', maxLevel: 50, reputationWan: 25, copperWan: 2738 },
    { name: '镰鼬', maxLevel: 50, reputationWan: 30, copperWan: 3650 },
    { name: '猿魔', maxLevel: 50, reputationWan: 37, copperWan: 4500 },
    { name: '山椒鱼', maxLevel: 50, reputationWan: 40, copperWan: 4800 },
    { name: '贝壳', maxLevel: 50, reputationWan: 38, copperWan: 5000, flag: '铜币有 4500 万 / 5000 万 两种说法，取多数' },
    { name: '蛤蟆仙人', maxLevel: 50, reputationWan: 37, copperWan: 4563 },
    { name: '鲛鲨', maxLevel: 150, reputationWan: 160, copperWan: 21000 },
    { name: '蛤蟆健', maxLevel: 150, reputationWan: 162, copperWan: 22000 },
    {
      name: '乌鸦',
      maxLevel: 150,
      reputationWan: 580,
      copperWan: 46000,
      flag: '声望反常：150 级上限却比 300 级的蛤蟆龙（413 万）更贵，三份资料都这样',
    },
    { name: '蛤蟆龙', maxLevel: 300, reputationWan: 413, copperWan: 60600, flag: '另有 6.1 亿说法' },
    { name: '蛤蟆广', maxLevel: 300, reputationWan: 413, copperWan: 86000 },
    { name: '鹰', maxLevel: 300, reputationWan: 413, copperWan: 86000 },
    {
      name: '（300 级第四只，名称转录不清）',
      maxLevel: 300,
      reputationWan: 413,
      copperWan: 86000,
      flag: '语音转写为「大象/孟末」，无法确定是哪只，仅占位',
    },
    { name: '蜘蛛', maxLevel: 600, reputationWan: 1356, copperWan: 500000, flag: '约数；另有转写作 5.02 亿，疑为 50 亿听错' },
    { name: '蛤蟆吾郎', maxLevel: 600, reputationWan: 1354, copperWan: 520000, flag: '约数；另有 51 亿说法' },
  ],
  unit: { maxLevel: '级', reputationWan: '万', copperWan: '万' },
  confidence: 'medium',
  confidenceWhy:
    '已取到**三份独立视频的完整口述**（非二手摘要），逐条比对：绝大多数条目三源一致，' +
    '仅「贝壳铜币」「蛤蟆龙铜币」「蜘蛛/蛤蟆吾郎」有细微出入，均已标注。' +
    '重要发现：**乌鸦声望高于蛤蟆龙这个反常项，三份资料全部一致** → 说明它不是某一家抄错，' +
    '而是源数据本身就如此（可能原始长图如此，或游戏确实这样设计）。' +
    '⚠ 但这三份视频很可能都源自同一张社区长图，故只能算「传播一致」而非「三次独立实测」，给 medium 不给 high。',
  /** 三源比对明细（保留分歧，便于以后复核） */
  discrepancies: [
    '忍犬铜币：181 万（2 票） / 180 万（1 票）→ 取 181 万',
    '蛤蟆吉铜币：1386 万（2 票） / 1360 万（1 票）→ 取 1386 万',
    '忍龟声望：25 万 / 23 万 → 取 25 万',
    '贝壳铜币：5000 万（2 票） / 4500 万（1 票）→ 取 5000 万',
    '蛤蟆龙铜币：6.06 亿 / 6.1 亿 → 取 6.06 亿',
    '蜘蛛铜币：50 亿（2 票） / 5.02 亿（1 票，疑语音把「五十」听成「五」）→ 取 50 亿',
    '蛤蟆吾郎铜币：52 亿 / 51 亿 → 取 52 亿',
    '鲛鲨/蛤蟆健铜币：一份转写作「十二点一亿/十二点二亿」，与另两份的 2.1/2.2 亿冲突 → 判为语音错误，取 2.1/2.2 亿',
  ],
  /** 进阶材料与货币选择（第二份视频给出的策略，属可采纳的操作建议） */
  advanceTips: [
    '120 级并解锁乌鸦后开启进阶，优先给攻击型通灵（猿魔 / 蛤蟆吉 / 鲛鲨等）进阶 +5 阶。',
    '进阶顺序：全部通灵先到 5 阶 → 攻击型到 10 阶 → 全部到 10 阶 → 再往上推。',
    '进阶成功率 ≥60% 用声望，<60% 用培养石（省材料）。',
    '进阶材料（通灵卷轴）来自「追击小组织」。',
    '金币/氪金通灵都是攻击属性（普通「鲛鲨」例外是生命），所以只需优先拉到 5 阶 —— ' +
      '因为高级通灵卷轴每 10 周才能在积分赛商店凑出 1 个，周期太长。',
  ],
  sourceIds: ['spirit_cost_table'],
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

/** 饰品：云迹腰带 0→+30 实测（同一份人肉实测被两站搬运，实际独立来源=1） */
const GROWTH_ACCESSORY = {
  yunjiBelt30: {
    power: 730000,
    magic: 12000,
    dust: 1150000,
    talisman: 1608,
    star: 18000,
    note: '云迹腰带 0→+30 单件（3 攻击词条）；绿水 115 万 / 保护符 1608 / 紫星 1.8 万',
    caveat:
      'csdn 与 233乐园两条的四个数字逐字相同，疑同一份实测被搬运 → **不构成独立双源**；' +
      '也无人复现。按「低」处理，只当量级参考。',
  },
  confidence: 'low',
  sourceIds: ['csdn', 'leyuan_yunji'],
}

// ────────────────────────────────────────── 2026-10-18 第二轮调研新增（来源见 SOURCES）

/**
 * 局内版本现状。这一组不是"成长曲线"，而是"现在游戏到哪一步了"。
 * 用途：目标倒推时判断用户填的等级/战力是否还在版本范围内。
 */
const GAME_STATUS = {
  levelCap: {
    value: 170,
    since: '2025-09-04 大版本',
    confidence: 'medium',
    note:
      '本次检索**没有找到任何 175/180 级来源**；2026-09 上架的 1.79.79.9 版本公告也未提等级上限（iTunes lookup 已核）。' +
      '结论：截至 2026-10，170 级大概率仍是上限，但缺官方原文。',
    sourceIds: ['sohu_level170', 'itunes_app'],
  },
  highestRaid: {
    name: '轮墓边狱',
    level: 160,
    powerThreshold: { min: 30000000, max: 46000000 },
    confidence: 'medium',
    note: '未找到 165/170 级团本。队伍实测「保底 3000 万，最高 4600 万」。**这是通关门槛，不是等级达标线。**',
    sourceIds: ['sohu_160raid'],
  },
  /** 官方公告的可获取性问题（影响一切"官方原文"引用） */
  officialSourceCaveat:
    'hyrz.qq.com 的旧公告页（/webplat/...）为 GBK 编码，按 UTF-8 取会乱码；新版（web202003）是 JS 模板，' +
    '正文只返回占位符。**所以本项目几乎没有可逐字引用的官方原句** —— 遇到"官方说"要格外小心，' +
    '很可能引用者自己也没读到原文。（这一点由两次独立调研各自撞到后确认）',
}

/** 装备（5 品阶；橙后 +59） */
const GROWTH_EQUIPMENT = {
  tiers: ['白', '绿', '蓝', '紫', '橙'],
  maxEnhance: 59,
  stagePoints: [4, 16, 24],
  materialRhythm: '每 4 阶一套精英副本材料；进阶材料靠体力刷副本',
  levelRule: '装备等级不得高于角色等级；升级消耗「幻彩石 + 铜币」',
  confidence: 'low',
  confidenceWhy:
    '「+59」「5 品阶」「+4/+16/+24 阶段点」来自同一篇 2024-12 文章，单源且 2026 年无更新来源 → 是否已提上限未确证。' +
    '另有 App Store 描述称「装备进阶提升至 84 阶」，与 +59 可能是两个不同维度（进阶阶数 vs 强化等级），' +
    '**无来源说明，不能合并**，故单列在 dataConflicts2026。',
  sourceIds: ['9game_equipment'],
}

/** 秘卷（上限 30，10 级即满核心效果） */
const GROWTH_SCROLL = {
  maxLevel: 30,
  effectCapLevel: 10,
  /** 1→10 级所需碎片（第 n 项 = 从 n 级升到 n+1 级所需） */
  fragmentsPerLevel: [5, 10, 15, 20, 25, 40, 45, 50, 55, 60],
  fragmentsTotalTo10: 325,
  count2020: 34,
  confidence: 'medium',
  confidenceWhy:
    '「30 级上限 / 10 级满效果 / 1→10 级碎片 5…60」来自官方 2018 攻略的 2020 年转载，可读全文；' +
    '碎片逐项加总 = 325，自洽。⚠ 但「34 个秘卷」是 2020 年数量，现版本已增，未更新。',
  sourceIds: ['sc17173_scroll'],
}

/** 天赋 / 修罗天赋 */
const GROWTH_TALENT = {
  talentCost: '天赋点 + 铜币；天赋点来自剧情副本三星通关',
  shuraUnlockLevel: 110,
  shuraCost: '修罗天赋点 + 铜币',
  confidence: 'low',
  confidenceWhy:
    '110 级开放有 2 个来源，但其中一篇把天赋写成「增加影分身数量」，AI 味重，只算旁证。' +
    '另 2025-08 有「2025-09 大版本开启新的修罗天赋」的说法，与「110 级早已开放」不矛盾（应理解为新增分支），但原文措辞含糊。',
  note: '等级上限、每级消耗、战力贡献**均未找到**；官方 2016 天赋介绍页 GBK 乱码，无法引用。',
  sourceIds: ['ccplay_2024', 'sohu_level170'],
}

/**
 * 饰品阶数与抗魔区间（2026-03 完整表，本项目目前最全的一份）
 * 用途：判断用户当前饰品处在哪一档、离下一档还差多少抗魔。
 */
const ACCESSORY_TIERS = {
  rows: [
    { name: '自由', level: 60, magicMin: 2781, magicMax: 5920 },
    { name: '赤魂', level: 70, magicMin: 5921, magicMax: 8060 },
    { name: '忠诚', level: 80, magicMin: 8061, magicMax: 11530 },
    { name: '梦魇', level: 90, magicMin: 11531, magicMax: 17800 },
    { name: '落岩', level: 100, magicMin: 17801, magicMax: 22400 },
    { name: '封印', level: 110, magicMin: 22401, magicMax: 27000 },
    {
      name: '祝福',
      level: 120,
      magicMin: 28000,
      magicMax: 29160,
      flag: '与上一档之间有 999 点空隙（27001~27999），疑原表缺漏',
    },
    { name: '祈愿', level: 130, magicMin: 29161, magicMax: 32253 },
    { name: '破晓', level: 140, magicMin: 32254, magicMax: 36160 },
    { name: '晨曦', level: 145, magicMin: 36161, magicMax: 40840 },
    { name: '曙光', level: 150, magicMin: 40841, magicMax: 44920 },
    { name: '旭日', level: 155, magicMin: 44921, magicMax: 49420 },
    { name: '苍穹', level: 160, magicMin: 49421, magicMax: 54350 },
    { name: '云迹', level: 165, magicMin: 54351, magicMax: null },
  ],
  /** ★ 重要澄清：曙光(150) 是云迹(165) 之前的旧阶，不是更高阶 */
  clarification: '「曙光」是 150 级饰品，「云迹」是当前最高（165 级），**云迹之上暂无更高阶**。',
  enhanceCap: {
    below130: 30,
    from130: 35,
    note: '100~120 级饰品强化上限 +30；130 级起 +35（云迹也是 +35）',
  },
  dropThresholds: {
    cloudOrangeMagic: 54000,
    cloudBlueGuaranteeMagic: 68700,
    note: '云迹出货：抗魔 5.4 万给橙，6.87 万抗魔保底蓝（原表口径，非确证）',
  },
  confidence: 'medium',
  confidenceWhy:
    '抗魔区间 14 档完整、单调递增，来自 2026-03 一份可读全文的表，内部一致性好。' +
    '⚠「祝福」档下限 28000 与「封印」上限 27000 之间有空隙，属原表缺漏；云迹上限留空。',
  sourceIds: ['csdn'],
}

/** 2026-10-18 新增：本轮调研发现的具体冲突（第三方数据互相打脸，全部留痕） */
const DATA_CONFLICTS_2026 = [
  {
    topic: '勾玉总孔位数',
    a: '2016 年样本「6 装备 + 4 通灵 = 54 孔」',
    b: '2024 年指南「每件装备 6 个勾玉槽、每只通灵兽 5 个勾玉槽」',
    verdict: '两者不可能同时成立（槽数正好对调）。**当前总孔位数至今无可靠数字，需实测。**',
  },
  {
    topic: '勾玉六色与属性对应',
    a: '同一篇 2024 指南段首写「红:攻击 蓝:防御 绿:生命」',
    b: '紧接着同段又写「青:攻击防御 紫:防御生命 绿:攻击生命」',
    verdict: '绿/蓝各出现两次且定义不同 → **该文不能当映射表用**，本项目不采任何一版。',
  },
  {
    topic: '装备强化上限',
    a: '2024-12 文章「最高 +59」',
    b: 'App Store 描述「装备进阶提升至 84 阶」',
    verdict: '可能是不同维度（强化等级 vs 进阶阶数），**无来源说明，不合并**；+59 标低置信。',
  },
  {
    topic: '云迹保护符消耗',
    a: 'CSDN 表「20→30 级需保护符 96」',
    b: '233乐园「0→+30 共 1608 张」',
    verdict: '数量级差 16 倍。至少一条口径错（可能一为单级、一为累计）。**本项目取 1608 并标低置信。**',
  },
  {
    topic: '云迹上线时间',
    a: 'CSDN 表把云迹标为「2036 年 3 月」',
    b: '233乐园 2025-09-11 已在测云迹强化；2026-01-23 已有 165 级云迹测评',
    verdict: '「2036」明显笔误；云迹实际应早于 2026-03。**说明该表连年份都会写错，其数字需逐项复核。**',
  },
  {
    topic: '防御战力系数',
    a: 'CSDN 表 1:12',
    b: '本项目 11.6（有游戏内反查 150×11.6=1740）',
    verdict: '已有结论：取 11.6。12 会高估 3.4%。',
  },
  {
    topic: '神器轮回石单次消耗',
    a: '流传值「白牙后 30→60 个/次」',
    b: '小米 2023 原文「白牙是 600 轮回石提炼 10 次，白牙前都是 300 提炼 10 次」',
    verdict: '★ **两者等价**：300/10 = 30、600/10 = 60。这条从「单源流传」升级为「有原文算式支撑」。',
  },
]

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
    { level: 50, power: 500000, confidence: 'low', basis: '2026-06 表「不低于 50 万」' },
    { level: 60, power: 650000, confidence: 'low', basis: '2026-06 表「不低于 65 万」（旧表 56~65 万，取上限）' },
    { level: 70, power: 850000, confidence: 'low', basis: '2026-06 表「不低于 85 万」；旧表区间 65~85 万' },
    { level: 80, power: 1100000, confidence: 'low', basis: '2026-06 表「不低于 110 万」；但另一份表称 150 万 → 该段方差很大' },
    { level: 90, power: 1800000, confidence: 'low', basis: '2026-06 表「不低于 180 万」；旧表 150~200 万，居中' },
    { level: 95, power: 2100000, confidence: 'low', basis: '2026-06 表「不低于 210 万」' },
    { level: 100, power: 2500000, confidence: 'low', basis: '2026-06 表「不低于 250 万」；旧表 240~300 万，三源一致偏下' },
    { level: 105, power: 2800000, confidence: 'low', basis: '2026-06 表「不低于 280 万」' },
    { level: 110, power: 3200000, confidence: 'low', basis: '2026-06 表「不低于 320 万」' },
    { level: 115, power: 3500000, confidence: 'low', basis: '2026-06 表「不低于 350 万」' },
    { level: 120, power: 4000000, confidence: 'low', basis: '2026-06 表「不低于 400 万」；与本项目原有单一答主口径完全一致' },
    { level: 125, power: 4800000, confidence: 'low', basis: '2026-06 表「不低于 480 万」' },
    { level: 130, power: 5800000, confidence: 'low', basis: '2026-06 表「不低于 580 万」（原 620 万偏高）' },
    { level: 135, power: 7400000, confidence: 'low', basis: '2026-06 表「不低于 740 万」' },
    { level: 140, power: 9500000, confidence: 'low', basis: '2026-06 表「不低于 950 万」；与玩家自述「141 级起码 950 万」一致' },
    { level: 145, power: 11500000, confidence: 'low', basis: '2026-06 表「不低于 1150 万」' },
    { level: 150, power: 14000000, confidence: 'low', basis: '2026-06 表「不低于 1400 万」（原 3000 万是**团本通关门槛**，不是达标线）' },
    { level: 155, power: 16000000, confidence: 'low', basis: '2026-06 表「不低于 1600 万」' },
    { level: 160, power: 20000000, confidence: 'low', basis: '2026-06 表「不低于 2000 万」' },
    { level: 165, power: 25000000, confidence: 'low', basis: '2026-06 表「不低于 2500 万」' },
    { level: 170, power: 30000000, confidence: 'low', basis: '2026-06 表「不低于 3000 万」' },
  ],
  /** ★ 「达标线」与「团本通关门槛」是两回事，2026-10-18 起分开记 */
  raidRequirement: {
    160: {
      min: 30000000,
      max: 46000000,
      note: '160 级团本「轮墓边狱」实测队伍保底 3000 万、最高 4600 万',
      sourceIds: ['sohu_160raid'],
    },
    distinction:
      '「160 级达标 2000 万」≠「160 级团本能打」。前者是养成都到位的水位线，' +
      '后者是要真的通关，队伍实际门槛在 3000~4600 万。**此前本表把两者混为一谈，导致 150 级被错标为 3000 万。**',
  },
  /** 2026-06 表附带的两条口径说明（原文照录） */
  sourceCaveats: [
    '「这是正常一个月超玩家的标准，月卡玩家在原有的基础上加五万，零克加三万，不包含八十级以下。」',
    '「如果你能达到这个标准，在每天保持活跃的情况下，本服前二十五问题不大。」',
    '⚠ 上述两句为原视频自述，**未经验证**；且「月卡加五万/零氪加三万」的表述含义不明（可能是「调低」之误），仅照录备查。',
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
    '低段（50~110）现已获第二份社区表印证量级（50万@50级 … 320万@110级），但**那份表的原始视频链接无法打开**（见下），' +
    '只能算「社区口径趋于一致」，不能算严谨双源。' +
    '社区实际上更认「本服排名分位」而非绝对战力阈值。请以游戏内实际体验为准，不要把本表当达标硬线。',
  independentSourceWarning:
    '120/130/140 三段的佐证全部来自同一个答主引用同一张网图 —— 实际独立来源数 = 1，不是 3。' +
    '50~110 段新增的第二份表，其出处是抖音分享短链；实测 8 条短链全部返回**同一个 72914 字节的 JS 挑战页**，' +
    '无法读取任何内容 → **引用不可核对**，只能按「社区口径一致」降格采信。',
  zeroGachaAdjust: '零氪/月卡玩家可在此基础上下调约 5%~10%（来源自述，未验证，仅作弹性参考）。',
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
    confidence: 'low',
    note:
      '⚠ 仍无一手「逐项加总」明细贴。2026-10-18 新找到一条**官方**锚点（腾讯官网 2016-03）：' +
      '「每天可免费招财 1 次……连续 10 次招财可获得大概 14 万多的铜币，再加上招财礼盒的奖励，差不多有 23 万铜币」' +
      ' → 仅【招财】一项即 ≈23 万/天；再叠加丰饶之间赏金 3 次、积分赛每日 9 点段位发放、生存挑战 15 据点、' +
      '组织荣耀礼包等，30~36 万/天在量级上说得通，但仍非确证。' +
      '另有一条 2020 年明细帖称「丰饶之间单项即 46 万/天」，与官方口径差距过大，本项存疑。',
    anchors: [
      { item: '招财 10 次（含礼盒）', amount: 230000, at: 2016, sourceId: 'hyrz_daily_2016' },
      { item: '招财 10 次（纯招财，不含礼盒）', amount: 140000, at: 2016, sourceId: 'hyrz_daily_2016' },
      { item: '奖励中心单个任务下限', amount: 1000, unit: '铜币/任务', at: 2016, sourceId: 'hyrz_daily_2016' },
    ],
    sourceIds: ['hyrz_daily_2016'],
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

/**
 * 注意事项：给用户看的诚实清单。
 * ★ 2026-10-18 交叉验证后重写：去掉了「多来源一致」的笼统说法，
 *   改成按系数分级披露；补上了已修正/已撤下的项。
 */
/**
 * ★★ 跨游戏污染名单（2026-10-18 新增，这是最容易导致模型彻底算错的一类错误）
 *
 * 网上大量「火影忍者」数据其实来自**另外几款同名/近名游戏**，数值体系完全不同，
 * 一旦混进来，算出来的战力就是错的。已实测确认的：
 *
 * 1. **《火影忍者Online》(火影忍者OL) —— 端游/页游，回合制**
 *    - 官网域名之一 `huoyin.qq.com`（注：`hyrz.qq.com` 才是手游官网，两者都在 qq.com 下，极易混淆）
 *    - 该站页面自述「火影忍者Online官方网站 全球唯一正版《火影忍者》网游」
 *    - 它有「五行查克拉」系统（2018-01 上线，54 级开放），官方伤害公式为
 *      `[(1+风攻-风抗)*1 + (1+雷攻-雷抗)*1 + …] / 存在属性数` —— **这是 OL 的公式，不是手游的**
 *    - 判定特征：出现「出手位」「先攻」「控制」「忍术」「抗性」「查克拉传递」→ 一定是 OL
 *
 * 2. **《火影忍者：忍者新世代》(NARUTO-ナルト-OL モバイル) —— 另一款回合制手游**
 *
 * 3. 火影忍者 其他授权手游（像素火影、巅峰对决等）—— 数值体系与现代手游无关
 *
 * **本项目口径**：只有 `hyrz.qq.com` 的公告算手游官方；`huoyin.qq.com` 一律不采。
 */
const CROSS_GAME_TRAPS = [
  {
    game: '火影忍者Online（火影忍者OL，端游/页游，回合制）',
    domain: 'huoyin.qq.com',
    looksOfficial: true,
    whyWrong:
      '域名在 qq.com 下、标题也写「火影忍者官方网站-腾讯游戏」，但它自述是「火影忍者Online官方网站 全球唯一正版《火影忍者》网游」，' +
      '是回合制端游。它的「五行查克拉」官方公式包含「出手位 / 先攻 / 控制 / 忍术 / 抗性 / 查克拉传递」，' +
      '这些概念手游里**全部不存在**。',
    howToSpot: '出现「出手位」「先攻」「控制」「忍术」「抗性」「查克拉传递」「五行查克拉」→ 判定为 OL，立即弃用',
    officialUrl: 'https://huoyin.qq.com/webplat/info/news_version3/5491/5492/5494/m3986/201712/676695.shtml',
    correctDomainForMobile: 'hyrz.qq.com',
  },
  {
    game: '火影忍者：忍者新世代（OL 移动版）',
    domain: '—',
    looksOfficial: false,
    whyWrong: '是 OL 的手游版，同为回合制，与《火影忍者》动作手游数值不通。',
    howToSpot: '出现「忍者新世代」「OLモバイル」字样',
  },
]

/**
 * ★ 属性攻防：两条证据线的**真实关系**（2026-10-18）
 *
 * 线 A（手游，玩家实测，一手）：恒心原文 —— 只有最高的那一系生效，(忍具最高系+藏管)÷20 = 属性百分比伤害。
 *   自洽验算：1816÷20=90.8→90%、90+27=117% ✔（这是它可信的核心原因）
 * 线 B（OL 端游，腾讯官方 2018-01-04 公告）：`[(1+风攻-风抗)*1 + …] / 存在属性数`。
 *   注意：OL 的「属攻/属抗」本身就是**百分比数值**（靠修炼等级直接给），**没有 ÷20 这一步**。
 *
 * ★ 结论（不要拔高）：
 *   - **OL 那条并不能给「÷20」背书** —— 两者计量单位不同，不存在互相印证。
 *   - 所以「20 点属性 = 1% 伤害」目前**仍然只有恒心一个来源**。
 *   - OL 的减法框架 `(1+属攻-属防)` **不可用于手游**：手游里属性防御只被描述为
 *     「减少属性百分比伤害，具体多少不知道」，没有减法关系。
 *   - 「属性防御每点 = 10 战力」「属性攻击每点 = 6 战力」仍是**未确证**。
 */
const ELEM_CROSS_CHECK = {
  twentyPerPercent: {
    value: '每 20 点有效属性攻击 = 1% 属性百分比伤害',
    confidence: 'high',
    sourceCount: 2,
    why:
      '两个互不相关的来源都得出 ÷20：①恒心 2024-11「面板属性相加除以 20 就可以」；' +
      '②视频《现版本玻璃大炮的根本》「每二十点属性攻击加成百分之一伤害」，且该视频用两个真实账号的' +
      '伤害数字反推，四个数字误差均 <1.2%。',
    lines: [
      {
        game: '手游',
        source: '恒心《你真的玩的懂火影的忍具系统吗？》2024-11',
        quote: '÷40 是每满 40 属性攻击才会换算 1% 的属性百分比。现在面板属性相加除以 20 就可以。',
      },
      {
        game: '手游',
        source: '抖音《现版本玻璃大炮的根本，忍具属攻属防的重要》',
        quote: '每二十点属性攻击加成百分之一伤害。',
      },
    ],
    rejectedSecondSource:
      '腾讯官方 2018-01-04「五行查克拉」公告也是火影系列的官方属性伤害公式，' +
      '但那是《火影忍者OL》端游，其属攻/属抗本身即百分比数值、**没有 ÷20 换算**，' +
      '不能拿来给手游的 ÷20 背书。所以 ÷20 的第二个来源用的是上面那条实测视频，不是 OL 公告。',
  },
  subtractFramework: {
    formula: '有效属攻 = 最高系属攻 − 对方该系属防 → ÷20 得属性百分比',
    belongsTo: '《火影忍者》手游（2026-10-18 由实战数据确认）',
    usableForMobile: true,
    /**
     * ★ 重要更正：上一版曾把「减法框架」判为 OL 专属、手游不适用。
     * 收到视频全文后发现这是错的 —— 手游实测就是减法。
     */
    correction:
      '本条目曾被我误判为「OL 专属、手游不可用」。收到完整实测数据后更正：' +
      '手游同样适用「属攻减属防」的减法，只是**没有** OL 那套「出手位/查克拉传递/是否含某属性」的分支加权。' +
      'OL 的公式是 `[(1+风攻-风抗)*是否存在风属性 + …] / 存在属性数`，手游是单一最高系的线性减法 —— 两者形似而实不同。',
    actualQuote:
      '手游实测：账号一风攻 2450，账号二风防 1260，2450−1260=1190，1190÷20≈59%（视频称 59%）。',
    why: '两个账号的数据都能反算回来，且存在「2797−1697=1100=账号一属防」的交叉约束。',
  },
  elemDefPerPoint: {
    value: 10,
    unit: '战力/点',
    confidence: 'medium',
    why:
      '视频《战力提升之战力篇》原话「特殊属性防御每一点火防、水防、雷防、土防、风防属性可增加十战力」。' +
      '此前唯一依据是 Excel 占位值 10（零来源），现在首次有出处。' +
      '但该视频同篇把另外五个系数全说对了（生命1/攻击3.5/防御11.6/暴击6/抗暴10），说明作者是照游戏面板读的、不是编的。',
  },
  elemAtkPerPoint: {
    value: 6,
    unit: '战力/点',
    confidence: 'medium',
    why:
      '同一来源原话「特殊属性攻击每一点……可增加六战力」。' +
      '⚠ 与恒心「除最高属性外其余只加一点战力」仍有冲突，但影响可忽略：' +
      '2450 点属攻 ×6 = 1.47 万战力，占千万级战力不到 0.15%。',
  },
  /** 顺手确认的一件事：符文会「只加战力不加属性」，这是战力对不上的常见原因 */
  whyPowerMismatch: {
    rune:
      '符文镶嵌后提供**固定战力**，但符文带的属性收益**不计入**属性面板 —— ' +
      '所以「属性算出来的战力」会低于面板总战力，差额主要来自符文。',
    elemFlat: '属性攻防按 ×6 / ×10 折算的那点战力，也可能与面板细微不一致。',
    levelAndCollection: '人物等级本身给战力；忍者收集加成按百分比放大生命/攻击/防御。',
  },
}

/**
 * ⚔ 社区**互相矛盾**的两套口径（2026-10-18 新增）
 *
 * 本项目以前只记了其中一套，并把另一套写成「作者已否定」。收到完整视频全文后发现：
 * 两位 UP 主给出的「虚战」定义**正好相反**，且各自都有明确理由。这是真冲突，不是谁错了。
 */
const COMMUNITY_CONFLICTS = [
  {
    topic: '「虚战」的定义',
    definitionA: {
      source: 'B站 BV18KNXzoE4z《虚战仔 / 战力基础架构》',
      claim: '虚战 = 不计后果**透支潜力**换来的战力（把未来该省的资源提前烧掉），与堆哪种属性无关。',
      stance: '否认「堆暴击 = 虚战」',
    },
    definitionB: {
      source: '抖音《战力提升之战力篇》',
      claim:
        '虚战 = 暴击**溢出**后继续堆暴击。原话：「当暴击率达到百分之一百的情况下还继续提升暴击属性，' +
        '那么战力就处于一个虚战的状态」「恭喜获得虚战仔或者暴击仔」。',
      stance: '明确认定「暴击溢出 = 虚战」',
      extraRule:
        '「根据游戏自身的说法，暴击属性最好控制在**攻击属性的 10% 左右**比较合理。' +
        '假设总战力一千万、攻击一百万，那么暴击最多也就十万。」',
    },
    howToHandle:
      '两者其实不冲突在**目的**上（都指向「战力高但打不动」），差别在**判据**：' +
      'A 看资源是否透支，B 看暴击是否溢出。本项目同时保留，让 agent 按用户问的是「资源规划」还是「属性配比」来选口径。',
  },
]

/**
 * 忍者体系里的几个硬节点（2026-10-18 从视频取得，单一来源，低-中置信）
 */
const COLLECTION_MILESTONES = {
  fiveStarS: {
    fullAttrBonus: { 三星: 0.122, 四星: 0.162, 五星: 0.203 },
    unit: '全属性加成百分比',
    note:
      '「一个五星 S 忍全属性加成是 20.3%，四星 16.2%，三星 12.2%」——' +
      '第一个五星 S 会一次性拉高全属性加成上限，所以很多人第一个五星 S 一到位就涨几十万战力；' +
      '之后再升五星（或更低星级）只会增加收集加成的战力。',
    confidence: 'low',
    sourceIds: ['douyin_power_basics'],
  },
  collectionBonusRule: {
    rule:
      '全属性加成 = 取「当前拥有的忍者中属性加成百分比最高的那一位」，**不含暴击与抗暴**；' +
      '收集加成按收集的忍者分类分别叠加，同样不含暴击与抗暴。',
    note: '这是对「收集加成只作用于生命/攻击/防御」的又一次独立确认（本项目原有 4 个来源，现为 5 个）。',
    confidence: 'high',
    sourceIds: ['douyin_power_basics'],
  },
  insightNodes: {
    jeibangUnlock: '忍传感悟等级达 **1800** 后解锁羁绊升级',
    jeibangAdvice: '建议感悟到 **2000** 再做羁绊升级',
    jeibangMax: '羁绊升级到 **100** 得专属忍者名片',
    materials: '忍传感悟消耗忍玉 + 忍魂；忍玉来自每日任务与集会所，忍魂靠收集忍者碎片',
    note: '羁绊升级中途换忍者不增加消耗（材料数量不变），所以可以按喜好选高招 S。',
    confidence: 'low',
    sourceIds: ['douyin_power_basics'],
  },
  basePowerDefinition: {
    definition: '基础战力 = **不可拆卸**的战力。去掉饰品 / 忍具 / 勾玉这些可换部件后剩下的部分。',
    confidence: 'low',
    sourceIds: ['douyin_power_basics'],
  },
}

const CAUTIONS = [
  '官方从未公布战力公式。下表所有系数都是玩家反推的，不是官方数据。',
  '系数置信度分级：生命 1 / 攻击 3.5 / 暴击 6 = 高（多源独立一致，且有算式验算）；' +
    '防御 11.6 / 抗暴 10 = 中（防御有「150×11.6=1740」游戏内反查闭环；抗暴有官方改动日志）；' +
    '**属性攻击 6 / 属性防御 10 = 中（2026-10-18 首次找到明确来源，且该来源把另外五个系数全说对了）**。',
  '防御系数存在 11.6 / 11.7 / 12 三个口径。三者其实都指向 ≈11.66（截断与进位差别）。' +
    '本表取 11.6 —— 它是唯一有游戏内验证的版本。**不要用 12（会高估 3.4%）**。',
  '2016-08-30 官方调整过系数（下调抗暴、上调暴击），所以早期资料里的抗暴 17.40 / 暴击 5.25 不能说它错，那是调整前的值。',
  '板块划分与成长效率来自 B站 UP 主「无花果酱」的个人实测模板，不是官方数据。',
  '「虚战」有**两套互相矛盾的社区口径**，本项目同时保留：' +
    '①B站 BV18KNXzoE4z：虚战 = 透支潜力，与堆哪种属性无关（否认「堆暴击=虚战」）；' +
    '②抖音《战力提升之战力篇》：暴击率溢出 100% 后继续堆暴击就是虚战仔/暴击仔，' +
    '并给出经验规则「暴击控制在攻击的 10% 左右」。详见 communityConflicts。',
  '社区流传的「各系统战力占比 %」并不存在：官方从未公布，社区也无人做出全系统拆解。占比只针对你自己面板内部比较。',
  '生命/攻击/防御 的战力计算需乘「忍者收集加成系数」；暴击/抗暴不享受该加成。默认按 0 会**低估**战力。',
  '抗魔值不在战力求和内 —— 官方只把它定位为秘境掉落门槛（这条是推断，无明文断言）。',
  '⚠ AI 内容农场黑名单：guotao606 / liutao454 / huayan226 / zhoujing757 / zhenglan979 / 921syw / 900xz / lwyysz 等。' +
    '这些站点的精确数字只可当候选范围。另需防 9game 部分栏目的假系统攻略、zol 的机翻洗稿、pd.qq.com 的攻略社搬运（非官方）。',
  '⚠ 同类陷阱：2016 年有一份魔方网稿件被 8+ 个站点逐字转载（连举例数字都一样），看似多来源实为 1 个来源。',
  '战力标准表（50~170 级）已替换为 2026-06 的完整单份表（单调递增、覆盖 115/95 等原先缺失段）。' +
    '★ **「达标线」≠「团本通关门槛」**：160 级达标 2000 万，但 160 团本实测队伍要 3000~4600 万。' +
    '此前把两者混为一谈，导致 150 级被错标为 3000 万。**全表仍是社区口径，只当量级参考**。',
  '资源日收益：体力已修正为约 460/天（原写 1200 是数量级错误）；金币零氪约 400/天；**铜币日收益未确证**。',
  '以下数字已被撤下，因为它们来源不可信：「全通灵 +4 → +19008 战力」（唯一来源是 AI 农场且文内自相矛盾）、' +
    '「勾玉全套 +2.17 万战力」（2016 年 54 孔样本，基数已失效）。相关**策略结论**仍可用，但**具体数字不要当真**。',
  '⚠ 属性攻防：本工具把它当普通属性按 × 6 / × 10 折算战力，**没有实现真实伤害模型**。' +
    '真实规则是「只取最高那一系 → 减去对方该系属防 → ÷20 换属性百分比伤害」，' +
    '再用大字伤害 ×(1+百分比) 算总伤害。要算真实伤害请按 elemMechanics.damageFormula 手算。',
  '忍具换装铁律：必须保证身上仍有 **4 件同一套装**，否则套装效果断档、战力反而下降（4+2 结构）。' +
    '藏管激活四件后，套装效果可在藏管里换，不必动身上忍具、不会掉战力。',
  '🚨 **跨游戏污染警告**：`huoyin.qq.com` 也在 qq.com 下、标题也写「火影忍者官方网站-腾讯游戏」，' +
    '但它是**《火影忍者OL》端游/页游**（回合制），不是本作手游。它那套「五行查克拉」公式' +
    '（含出手位/先攻/控制/忍术/抗性/查克拉传递）**不能用在手游上**。' +
    '只有 `hyrz.qq.com` 才是手游官网。看到「出手位」「先攻」「忍术」「抗性」等词 → 立即判定为 OL 资料。',
  '属性攻防两条证据线要分清：手游是「单一最高系，线性减法后 ÷20」（已用两个真实账号的实战伤害验证）；' +
    'OL 是「(1+属攻-属防) 再按技能是否含某属性加权平均」（官方公告）。两者形似实不同，' +
    '**OL 公告不能给手游的 ÷20 背书**。详见 elemCrossCheck。',
  '版本现状（2026-10）：等级上限 **170**（2025-09-04 大版本），最高团本 160 级「轮墓边狱」。' +
    '未找到任何 175/180 级来源。若你已超过 170 级，说明本项目数据需更新。',
  '⚠ **官方原文基本引用不了**：hyrz.qq.com 旧公告页是 GBK（UTF-8 打开必乱码），新版是 JS 模板（只返回占位符）。' +
    '所以看到「官方说……」时要先怀疑 —— 引用者很可能自己也没读到原句。',
  '饰品阶数已澄清：**「曙光」是 150 级的旧阶，「云迹」才是当前最高（165 级）**，别再以为曙光在云迹之上。' +
    '强化上限：130 级起 +35（100~120 级为 +30）。',
  '秘卷：上限 30 级，但**技能效果 10 级就封顶**，升到 30 只是为了战力；1→10 级共需 325 碎片。',
  '勾玉有两处数据至今不可靠：①**总孔位数**（2016 说 54 孔、2024 说每装备 6/每通灵 5，两者互斥）；' +
    '②**六色↔属性映射**（同一篇文章内自相矛盾，绿/蓝各出现两次且定义不同）→ 本项目不采任何一版。',
  '神器轮回石「白牙前 30 / 白牙后 60 个每次」现已有原文算式支撑（300 提炼 10 次 vs 600 提炼 10 次），' +
    '不再是单纯的流传值。',
]

const POWER_DATA = {
  version: '2026.10.18',
  sources: SOURCES,
  confidenceLabel: CONFIDENCE_LABEL,
  attrWeights: ATTR_WEIGHTS,
  elemMechanics: ELEM_MECHANICS,
  elemCrossCheck: ELEM_CROSS_CHECK,
  crossGameTraps: CROSS_GAME_TRAPS,
  communityConflicts: COMMUNITY_CONFLICTS,
  collectionMilestones: COLLECTION_MILESTONES,
  gameStatus: GAME_STATUS,
  dataConflicts2026: DATA_CONFLICTS_2026,
  boards: BOARDS,
  boardAttrs: BOARD_ATTRS,
  collectionBonus: COLLECTION_BONUS,
  growth: {
    artifact: GROWTH_ARTIFACT,
    spiritAdvance: GROWTH_SPIRIT_ADVANCE,
    spiritLevelCap: GROWTH_SPIRIT_LEVEL_CAP,
    spiritCostTable: SPIRIT_COST_TABLE,
    equipment: GROWTH_EQUIPMENT,
    scroll: GROWTH_SCROLL,
    talent: GROWTH_TALENT,
    accessoryTiers: ACCESSORY_TIERS,
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



