/*!
 * naruto-workbench core (UMD) — 火影忍者手游战力工作台核心
 * 生成时间 2026-10-18T07:12:59.251Z
 * 本文件由 tools/build-portable.mjs 自动生成，请勿手改。
 */
(function (root, factory) {
  'use strict'
  var DATA = {"version":"2026.10.18","sources":{"xlsx_base":{"title":"B站「无花果酱」战力性价比模板（性价比（最终版）.xlsx，用户提供）","url":"https://www.bilibili.com/video/BV1s3dPBoEFL","kind":"community-template","retrievedAt":"2026-10-16"},"bili_nangong":{"title":"B站 BV18KNXzoE4z《什么是虚战仔？〈战力基础架构〉》UP主「南宫的嘟嘟」置顶评论（166赞）","url":"https://www.bilibili.com/video/BV18KNXzoE4z","kind":"video-comment","retrievedAt":"2026-10-16"},"csdn":{"title":"CSDN《火影手游攻略之饰品篇》（逐级消耗/返还实测）","url":"https://blog.csdn.net/Gou_Hailong/article/details/108184369","kind":"guide","retrievedAt":"2026-10-16"},"spirit_cost_table":{"title":"抖音三份《通灵满级消耗》视频（已取得完整口述转写）","urls":["https://www.iesdouyin.com/share/video/7575368569811726521","https://www.iesdouyin.com/share/video/7562038229835763003","https://www.iesdouyin.com/share/video/7513538513725410570"],"url":"https://www.iesdouyin.com/share/video/7575368569811726521","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"⚠ **页面**核不了：8 条抖音短链实测全部返回同一个 72914 字节 JS 挑战页（可见文本仅 \"Please wait...\"），HTTP 200 不代表内容存在。**但**用户提供了三份视频的完整语音转写，因此**内容**可直接比对。三源逐条比对结果见 spiritCostTable.discrepancies —— 绝大多数一致，分歧项已标出。三份很可能同源于一张社区长图，故算「传播一致」，不算「三次独立实测」。"},"huoyin_ol_2018":{"title":"腾讯官方 2018-01-04《1月4日停机更新公告》（火影忍者OL，五行查克拉）","url":"https://huoyin.qq.com/webplat/info/news_version3/5491/5492/5494/m3986/201712/676695.shtml","kind":"official","retrievedAt":"2026-10-18","note":"★这是一份**别的游戏**的官方公告。`huoyin.qq.com` 页面自述「火影忍者Online官方网站 全球唯一正版《火影忍者》网游」，是回合制端游 OL。它给的五行伤害公式是 OL 的，**不可直接用于手游**。列在这里是为了给 crossGameTraps 留证据，不是当手游数据用。"},"douyin_power_basics":{"title":"抖音《【战力提升之战力篇】只有老玩家才知道的知识》（已取得完整转写）","url":"https://www.iesdouyin.com/share/video/7548992029918678326","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"同一份转写里把五个基础系数全说对：生命 1 / 攻击 3.5 / 防御 11.6 / 暴击 6 / 抗暴 10 —— 与本项目已验证值逐一吻合，说明作者是照游戏面板读的，不是编的。其「属性攻击每点 +6、属性防御每点 +10」也因此获得可信度。另提供虚战（暴击溢出）定义、暴击 ≤ 攻击 10% 的经验规则、五星 S 全属性加成 20.3%、忍传感悟 1800/2000 节点等。"},"douyin_dmg":{"title":"抖音《现版本玻璃大炮的根本，忍具属攻属防的重要》（已取得完整转写）","url":"https://www.iesdouyin.com/share/video/7613305790191308209","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"★ 本项目属性伤害模型的**关键验证来源**。给出两个真实账号的属攻/属防/伤害数据，可用「(最高属攻 − 对方属防) ÷ 20」反算，四个数字误差均 <1.2%，且存在「账号二 2797 − 1697 = 1100 = 账号一属防」的结构性约束。详见 elemMechanics.damageFormulaVerification。"},"douyin_level_table":{"title":"抖音《你目前火影战力都达标了吗?》2026-06 等级战力对应表（完整转写）","url":"https://www.iesdouyin.com/share/video/7651939049170972603","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"50~170 级完整、单调递增的一张表，是本项目目前**最完整的单份战力达标表**。★ 它把「达标线」和「团本通关门槛」分得很清楚：160 级达标 2000 万，但 160 团本实测队伍要 3000~4600 万。本项目此前把两者混为一谈，导致 150 级被错标成 3000 万，现已修正。"},"leyuan_yunji":{"title":"233乐园 2025-09-11 · 云迹饰品强化数据（自述「全网首发」）","url":"https://www.233leyuan.com/post-detail/1966007479446751535","kind":"forum","retrievedAt":"2026-10-18","note":"原文：「3 攻击云迹腰带从 0 强化到 +30，可涨 73 万战力、1.2 万抗魔，需消耗 115w 绿水、1608 张保护符、1.8w 紫星。」⚠ 这组数字与 csdn 那条**完全相同**，极可能是同一份人肉实测被两站搬运，因此**不构成独立第二来源**，yunjiBelt30 的置信度仍维持 low。"},"sohu_coef":{"title":"搜狐 · 战力换算系数实测（150×11.6=1740 验算）","url":"https://www.sohu.com/a/552091898_100270673","kind":"guide","retrievedAt":"2026-10-16"},"game9_coef":{"title":"九游 · 战力计算公式（含忍者收集加成系数）","url":"https://www.9game.cn/news/1613279.html","kind":"guide","retrievedAt":"2026-10-16"},"game9_spirit":{"title":"九游 · 通灵进阶性价比实测（+4 阶段 60万声望+1125万铜币→+19008 战力）","url":"https://www.9game.cn/hyrz/11559345.html","kind":"guide","retrievedAt":"2026-10-17"},"xiaomi_jade":{"title":"小米游戏中心 · 勾玉战力实测（8→9 级单颗约 1~2 万）","url":"https://game.xiaomi.com/viewpoint/1374185274_1642695053933_13","kind":"forum","retrievedAt":"2026-10-16"},"xiaomi_artifact":{"title":"小米游戏中心 · 神器轮回石消耗实测（白牙前后收益减半）","url":"http://game.xiaomi.com/viewpoint/1434414262_1680100956093_241","kind":"forum","retrievedAt":"2026-10-17"},"zol_museum":{"title":"ZOL · 忍具藏馆加成（全一阶 1816 点 = 90% 属性加成）","url":"https://game.zol.com.cn/1182/11822509.html","kind":"guide","retrievedAt":"2026-10-17"},"qq_standard":{"title":"QQ 频道「战力标准表」（60~150 级分阶段战力基准，社区流传）","url":"","kind":"community-table","retrievedAt":"2026-10-17","note":"来源为社区传播的战力标准表，无固定 URL；与多条玩家自述交叉验证（133级636万达标、142级750万偏废）。"},"whalegame_2025":{"title":"九游 2025 · 资源日常收益与性价比排序","url":"https://www.9game.cn/hyrz/11790876.html","kind":"guide","retrievedAt":"2026-10-17"},"sohu_2022_verified":{"title":"搜狐「App小胖子」2022-05-28 · 战力换算系数实测（含游戏内战力明细反查）","url":"https://www.sohu.com/a/552091898_100270673","kind":"guide","retrievedAt":"2026-10-18","note":"本主题**唯一**做了「算出来→回游戏面板核对→对上」闭环的来源：500 攻击 × 3.5 = 1750（宇智波鼬时装）、150 防御 × 11.6 = 1740（迪达拉时装，作者用游戏内战力明细反查「恰好 1740」）。含金量高于所有纯列表转载。"},"official_coef_patch_2016":{"title":"18183 转载官方公告 2016-08-30 · 战力系数调整（下调抗暴、上调暴击）","url":"https://www.18183.com/hyrz/201608/685051.html","kind":"official-mirror","retrievedAt":"2026-10-18","note":"关键证据：解释了为什么 2016-08-24 民间实测是「抗暴 17.40 / 暴击 5.25」，而现值是「抗暴 10 / 暴击 6」—— 官方在 08-30 真的调过系数。公告原文：「降低了抗暴属性战斗力转换系数，同时提高了暴击属性战斗力转换系数……有饰品玩家战斗力显示会有所波动，但实际战斗效果没有任何变化」。"},"hyrz_official_2016":{"title":"腾讯官方 2016-06 · 战斗属性说明（仅 生命/攻击/防御/暴击/抗暴 五种）","url":"https://hyrz.qq.com/webplat/info/news_version3/11946/23790/23792/23940/23943/m21289/201606/478470.shtml","kind":"official","retrievedAt":"2026-10-18","note":"官方口径的战斗属性只有五种，属性攻防是 90 级忍具后来才引入，不在原体系内。"},"hyrz_official":{"title":"腾讯官方 · 小队突袭奖励说明","url":"https://hyrz.qq.com/webplat/info/news_version3/11946/18118/18119/19273/19275/19276/m13191/201606/474569.shtml","kind":"official","retrievedAt":"2026-10-18"},"hyrz_daily_2016":{"title":"腾讯官方 2016-03 ·「每日任务收益满满 赚钱技巧分享」","url":"https://hyrz.qq.com/webplat/info/news_version3/11946/18118/18119/19273/19275/19277/m13191/201603/446823.shtml","kind":"official","retrievedAt":"2026-10-18","note":"官网原文（GBK 编码，需以 GB18030 解码才能读对）。铜币锚点：「连续 10 次招财可获得大概 14 万多的铜币，再加上招财礼盒的奖励，差不多有 23 万铜币」。⚠ 同一篇官方文内存在单位自相矛盾：第 1 条先说每日任务发「铜币」，紧接着又写「1300-3900 不等的金币奖励」——按 2016 年物价（十连抽 1680 金币）判断后者应为铜币，**连官方文稿都会笔误，不能盲信单一数字**。"},"game9_income":{"title":"九游 2025-07 · 零氪/月卡金币收益","url":"https://www.9game.cn/hyrz/11790876.html","kind":"guide","retrievedAt":"2026-10-18","note":"零氪 1 万+/月、月卡 1.5 万+/月"},"zol_income":{"title":"ZOL 2026-02 · 金币固定收益拆解（固定 6770 + 组织 2250）","url":"https://game.zol.com.cn/1182/11822509.html","kind":"guide","retrievedAt":"2026-10-18"},"xiaomi_spirit":{"title":"小米游戏中心 2021-06-23 · 通灵篇（等级上限四档）","url":"https://game.xiaomi.com/viewpoint/1374185274_1624605242594_13","kind":"forum","retrievedAt":"2026-10-18"},"zhufu_strategy":{"title":"搜狐 2020 · 通灵「均升优于单只冲高」策略（结论来源，非数字来源）","url":"https://www.sohu.com/a/377123266_100270673","kind":"guide","retrievedAt":"2026-10-18","note":"只支持「先均升到 +4」这个策略结论；具体战力数字不采信。"},"diyiyou_jade":{"title":"第一手游网 2016-01-18 · 各级勾玉战力实测（45 级 / 54 孔样本）","url":"https://www.diyiyou.com/hyrz/gl/58285.html","kind":"forum","retrievedAt":"2026-10-18","note":"原文自述样本为「45 级、我爱罗、6 装备 + 4 通灵 = 54 孔」，5/6 级数值作者自称「大胆推测」。"},"taptap_tool":{"title":"TapTap 忍具教学 ·「除最高属性外其余属性全部只加一点战力」","url":"https://www.taptap.cn/moment/397365372325465916","kind":"guide","retrievedAt":"2026-10-18","note":"与「属性攻击每点 ×6」直接矛盾，是本项目将属性攻防系数标为 unverified 的反向证据之一。2026-10-18 补：全文（作者「恒心」，2024-11-07）已通过 7723 镜像完整取到并逐条核对，见 mirrorUrl —— 该文含游戏内截图，且「1816÷20≈90%」「90%+27%=117%」三数自洽，可信度上调。","mirrorUrl":"https://www.7723.cn/strategy/704.html","author":"恒心","publishedAt":"2024-11-07"},"sohu_160raid":{"title":"搜狐「App小胖子」2026-03-23 · 160 级团本「轮墓边狱」实测战力","url":"https://m.sohu.com/a/1000198848_100270673/","kind":"guide","retrievedAt":"2026-10-18","note":"160 级团本实测队伍「保底 3000 万、最高 4600 万」—— 证明原战力标准表 150 级 1500 万已过时。"},"xiaomi_artifact_2021":{"title":"小米游戏中心 2021-06-23 · 神器白牙后轮回石 30→60/次（独立第二来源）","url":"https://game.xiaomi.com/viewpoint/1434414262_1680100956093_241","kind":"forum","retrievedAt":"2026-10-18","note":"与搜狐 2019-03-07 独立印证「白牙后提炼一次从 30 个变 60 个」。"},"farm_blacklist_note":{"title":"【内部备注】AI 内容农场黑名单（不采信）","url":"","kind":"warning","retrievedAt":"2026-10-18","note":"以下域名经实际访问确认同一模板（相同 CMS、配图 CDN img.xvcai.com、日期穿越、跨游戏泛化文案），其精确数字只可当候选范围，不作独立来源：guotao606.cn / liutao454.cn / huayan226.cn / zhoujing757.cn / 921syw.com / 900xz.com / lwyysz.com / fengyu952.cn / sunhong273.cn / zhuayu960.cn / hetang300.cn / guoning676.cn / 70wenxi.cn / shachu495.cn / 926g.com / zhanghao515.cn / zhangdan525.cn / yulan291.cn / zhenglan979.cn / qianlan898.cn / caoteng951.cn / xuwan051.cn / jianliu787.cn。另需防：① 9game.cn 部分栏目为假系统攻略；② zol.com.cn 有机翻洗稿；③ pd.qq.com 是攻略社搬运，非官方。"},"sohu_level170":{"title":"搜狐 2025-08-29 · 170 级大版本前瞻（等级上限 170、新修罗天赋）","url":"https://www.sohu.com/a/929996458_100270673","kind":"guide","retrievedAt":"2026-10-18","note":"原文：「等级上限在大版本更新后会提升到 170 级，也会开启新的剧情副本和修罗天赋」。"},"itunes_app":{"title":"App Store 版本信息（id955396648 / 1.79.79.9，2026-09-09）","url":"https://itunes.apple.com/lookup?id=955396648&country=cn","kind":"official-store","retrievedAt":"2026-10-18","note":"用途：核对\"2026-09 版本是否又提等级上限\"。结论：公告未提，故 170 级大概率仍是上限（但缺官方原文）。"},"9game_equipment":{"title":"九游 2024-12-27 · 装备品阶与强化上限（5 品阶 / +59 / 阶段点 +4+16+24）","url":"https://www.9game.cn/hyrz/10731322.html","kind":"guide","retrievedAt":"2026-10-18","note":"单源；2026 年无更新来源证明仍为 +59。另需防 9game 部分栏目有假系统攻略（本条已逐句核对，内容自洽）。"},"ccplay_2024":{"title":"CCPLAY 2024-11-18 · 装备/勾玉/天赋/修罗天赋基础规则","url":"https://www.ccplay.com.cn/news/146948.html","kind":"guide","retrievedAt":"2026-10-18","note":"⚠ 该文关于「勾玉六色↔属性」的同一段内自相矛盾（绿/蓝各出现两次且定义不同），因此本项目**只采其装备等级规则与修罗天赋 110 级开放**，不采其颜色映射。"},"sc17173_scroll":{"title":"17173 2020-07-28（官方 2018 攻略转载）· 秘卷上限 30 级 / 10 级满效果 / 碎片表","url":"https://newgame.17173.com/content/07282020/175734628.shtml","kind":"guide","retrievedAt":"2026-10-18","note":"1→10 级碎片 5/10/15/20/25/40/45/50/55/60，合计 325（本项目已逐项加总核对）。"},"xiaomi_artifact_2023":{"title":"小米游戏中心 2023-03-29 · 神器分段满级与轮回石「300/600 提炼 10 次」","url":"http://game.xiaomi.com/viewpoint/1434414262_1680100956093_241","kind":"forum","retrievedAt":"2026-10-18","note":"★关键原文：「白牙是 600 轮回石提炼 10 次，白牙前的话都是 300 轮回石提炼 10 次」→ 即 30→60 个/次，与流传值等价。这条把「30→60」从\"单源流传\"升级为\"有原文算式支撑\"。同文另称「只要轮回石给白牙就会收益减半」。"},"official_encoding_note":{"title":"【内部备注】官方公告页为何引用不了","url":"","kind":"warning","retrievedAt":"2026-10-18","note":"hyrz.qq.com 旧公告页（/webplat/…）是 GBK，按 UTF-8 抓必乱码（需 GB18030 解码）；新版（web202003）是 JS 模板，正文只返回 {{detail.sTitle}} 之类占位符。两次独立调研都撞到同一障碍 → 本项目几乎无法逐字引用官方原句。"},"gamersky_jade":{"title":"游民星空 · 勾玉槽位与基础属性（装备端部件名与孔数）","url":"https://wap.gamersky.com/sygl/Content-704284.html","kind":"guide","retrievedAt":"2026-10-18","note":"装备 6 部位（武器/护额/锁甲/铃铛/项链/铜戒）各 5 孔 = 30，与 2016 老样本的装备端一致。"},"c17173_jade":{"title":"火影忍者专区 17173 2016-02-06 · 勾玉 1~6 级精准数据表","url":"https://hyrz.17173.com/content/02062016/181921553.shtml","kind":"guide","retrievedAt":"2026-10-18","note":"1~6 级攻击值与战力：9/31.5、15/52.5、30/105、44/154、80/280、148/518。本项目已验算：6 组「战力 ÷ 攻击」全部精确等于 3.5。"},"douyin_jade":{"title":"抖音 · 勾玉 7~9 级实测数据","url":"https://www.iesdouyin.com/share/video/7615606564635905289","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"7 级 400/1400、8 级 684/2394、9 级 ≈1140/≈3990（9 级自称由 3 合 1 推导、无实测）。页面本身核不了（抖音短链是 JS 挑战页），数值按转写采信且已验算系数一致。"},"china_scroll":{"title":"中华网 2020-11-02 · 280 级神器消耗与战力","url":"https://3g.china.com/act/game/11043230/20201102/38915478.html","kind":"guide","retrievedAt":"2026-10-18","note":"与小米 2021 的 239 万忍玉 / 56.73 万轮回石 / 41 万战力三个数一致 → 同源可能性高，不算独立双源。"},"sohu_scroll":{"title":"搜狐 · 查克拉秘卷 1~10 级升级消耗（碎片 + 铜币）","url":"https://m.sohu.com/a/228942261_162492/","kind":"guide","retrievedAt":"2026-10-18","note":"碎片 5/10/15/20/25/40/45/50/55/60 与 17173 那条完全一致（互相印证）；铜币 6345→130000，1→10 级合计 585271。"},"wenda_3839":{"title":"3839 问答 · 装备等级与战力对应（110 级全套橙+20 ≈18~22 万）","url":"https://m.3839.com/wenda/732/6949732.htm","kind":"forum","retrievedAt":"2026-10-18","note":"玩家口径，非实测记录；与本项目\"装备是主力板块\"的直觉相反 —— 说明单板块战力远小于总战力。"},"bili_coef_cross":{"title":"B站 BV1uZQkBNEzp · 秘卷战力换算（1 碎片 ≈ 9.5 战力）","url":"https://www.bilibili.com/video/BV1uZQkBNEzp/","kind":"video","retrievedAt":"2026-10-18","verified":false,"note":"未取到正文，仅按用户提供的转述记录。325 碎片 × 9.5 ≈ 3088，与其\"单本 1000~3000\"勉强吻合，但与其\"全秘卷 4~5 万\"不吻合（34 本 × 3000 = 10.2 万）→ 自制矛盾。"},"douyin_shura":{"title":"抖音 · 修罗天赋机制与 60 级大节点收益","url":"https://www.iesdouyin.com/share/video/7412120652376804642","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"★ 关键：每个 60 级大节点固定 +2320 生命 / +660 攻击 / +200 防御，作者称合计约 7000 战力。本项目按其属性用 hp1/atk3.5/def11.6 反算得 6950，误差 -0.71% → 见 coefficientVerifications。另：170 级对应修罗天赋上限约 2324 级；5 万角色经验 = 1 级。"},"douyin_artifact":{"title":"抖音 · 神器升级阶段划分（70/140/280 与「对应总战力」三档）","url":"https://www.iesdouyin.com/share/video/733206194036821288","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"给出前期 7.5 万 / 中期 16.5 万 / 后期 41 万「对应总战力」。本项目用自身系数反算得 3.77 万 / 24.3 万 / 41.6 万 → **前期中期偏差近一半且方向相反，该列不采信**；但「280 级＝天沼矛及之后」「白牙为分水岭、之后轮回石翻倍且收益减半」这几点与小米 2023 一致，可采。"},"xiaomi_jade_advance":{"title":"小米游戏中心 · 勾玉槽位与精炼进阶规则（通灵端 2/5/10/15 阶开孔）","url":"https://game.xiaomi.com/viewpoint/1383848159_162962799443_100","kind":"forum","retrievedAt":"2026-10-18","note":"给出通灵端「初始 2 孔，进阶 5/10/15 阶各 +1，满 5 孔」的规则；该分段与本项目通灵进阶阶数分段吻合。"},"douyin_artifact_exp":{"title":"抖音 · 神器升级阶段划分与养成逻辑（含经验公式 130+30n）","url":"https://www.iesdouyin.com/share/video/7333206194036821288","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"★ 给出「10 忍玉 = 1 次强化 = 5 经验；初始 130 经验、每级 +30」的等差公式。本项目据此推导 70/140/280 级忍玉总量 = 16.31 万 / 62.02 万 / 241.64 万，与声称值吻合 0.1%~1.1%。"},"douyin_scroll60":{"title":"抖音 · 秘卷满级（60 级）消耗与属性","url":"https://www.iesdouyin.com/share/video/7464183204958719247","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"称秘卷上限 60 级、单本满级 2800~3200 战力、全秘卷 5~6 万；60 级附近每级约 3800 碎片 +683 攻击。其中「+683 攻击 → 约 2390 战力」可被攻击系数 3.5 精确复现（683×3.5=2391）→ 高段数据本身可信；但「上限 30 vs 60」属版本冲突，另一条称 1 碎片≈9.5 战力只在低段成立。"},"douyin_fragment":{"title":"抖音 · 材料战力换算通用口径（1 秘卷碎片 ≈ 9.5 战力）","url":"https://www.iesdouyin.com/share/video/7549401740413373755","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"验证结果：该口径只在 1→10 级成立（325 碎片→3088 战力 = 9.5/碎片）；60 级附近降到 0.63/碎片，差 15 倍。**不能用于估算满级成本**。"},"douyin_def_hp":{"title":"抖音 · 生命与防御承伤实测对比（虚战阈值来源）","url":"https://www.iesdouyin.com/share/video/7666853309168258313","kind":"video","retrievedAt":"2026-10-18","verified":"partial","note":"称防御 > 自身攻击 1.5 倍进入防御虚战区间；生命 > 5 万进入生命虚战区间。⚠ 其中「生命 5 万」与本项目其它数据差至少一个数量级（本例面板生命合计数百万），**疑似量纲错误，不采信**。"},"xiaomi_equip_grade":{"title":"小米游戏中心 · 装备品阶与强化梯度（白绿蓝 +4 / 紫 +15 / 橙 +59）","url":"https://game.xiaomi.com/viewpoint/1374185274_1623801390884_13","kind":"forum","retrievedAt":"2026-10-18","note":"分品阶强化上限；橙色阶段节点与上一轮资料不一致，两者并列未合并。"},"b23_level175":{"title":"B站视频标题「版本更新175级，装备进阶提战11万」（b23.tv/QbhnMtx）","url":"https://b23.tv/QbhnMtx","kind":"video","retrievedAt":"2026-10-18","verified":false,"note":"⚠ 实测访问返回 HTTP 412，无法打开核对。仅凭标题记「175 级可能存在」，**不作数据依据**。已另行核对官方公告页（JS 模板无正文）、小米转载（纯图片）、App Store 1.79.79.9 更新说明（未提等级上限）——均无法确认。"},"official_20260910":{"title":"官方公告 2026-09-08《9月10日新版本停机公告》（已读原文）","url":"https://hyrz.qq.com/web202003/newsDetails.html?aid=18853074&pageType=0","apiUrl":"https://apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=25&p1=1&source=web_ingame&id=18853074","kind":"official","retrievedAt":"2026-10-18","verified":true,"note":"★★ 这是本项目**第一条真正读到正文的官方公告**。原文确认：①「角色等级上限提升至175级。装备等级相应提升，装备进阶提升至89阶。」②「修罗副本新增第九章。新增25、26、27、28、29、30阶修罗天赋，增加修罗天赋等级上限。」③「每日40/80/100点活跃度宝箱中的金币奖励从10/20/30，共60金币，升级为15/30/45，共90金币」④「升级大福袋每日奖励：每日100金币调整为150金币。」（2026-10-05 生效）读法：node tools/fetch-official.mjs --aid 18853074"},"official_api_method":{"title":"【内部方法】如何读官方公告原文（重要）","url":"https://apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=25&p1=1&source=web_ingame&id=<aid>","kind":"method","retrievedAt":"2026-10-18","note":"官方详情页是 Vue 模板，HTML 里只有 {{detail.sTitle}} 占位符 → 直接抓页面永远拿不到正文。正文在中转接口 searchNews.php（id=aid）。列表接口是 wmp/v3.1/?p1=searchNewsKeywordsList&id=<tagId>。栏目 tagId：18807=公告 / 18812=新闻 / 18808=攻略 / 18813=活动。★ 这条推翻了我此前「官方原文基本引用不了」的判断 —— 能读，只是要先抓接口。工具：node tools/fetch-official.mjs --aid <id> / --list --tag 18807 / --search 关键词"},"official_patch_20160830":{"title":"18183 2016-08-30 · 新版功能优化（抗暴↓暴击↑ 的完整转述）","url":"https://www.18183.com/hyrz/201608/685051.html","kind":"official-mirror","retrievedAt":"2026-10-18","verified":true,"note":"★ 比此前那条「18183 转载官方公告」更完整：给出官方原话级别的四段表述，并明确「实际战斗效果没有任何变化」（只改战力换算口径）。⚠ 但**没有给具体系数数值**，抗暴 10 / 暴击 6 仍属玩家反推。"},"gamersky_jewelry_2016":{"title":"游民星空 2016-08-31 · 新版首饰属性选择（洗练 1% 换算 + 竞技场取消首饰暴击）","url":"https://shouyou.gamersky.com/gl/201608/802003.shtml","kind":"forum","retrievedAt":"2026-10-18","note":"给出「洗练中 1% 暴击 = 10 战力，1% 血攻防抗 = 5 战力（实际不到 6）」，并提到「竞技场取消首饰暴击加成」。⚠ 该文后半段是作者自建的暴击/攻击最优解模型，作者自述「暴击率 P = 0.01‰Y 是我大胆猜测」，**模型部分不采信**。"}},"confidenceLabel":{"high":"多来源交叉确认","medium":"单一可靠来源 / UP主模板","low":"社区流传 / 口径不一","calibrated":"模型拟合值（仅可用于相对比较）","unverified":"未确证（请以游戏内为准）"},"attrWeights":{"hp":1,"atk":3.5,"def":11.6,"crit":6,"critResist":10,"elemAtk":6,"elemDef":10,"confidence":"high","perAttr":{"hp":{"value":1,"confidence":"high","sources":5,"note":"多来源独立一致"},"atk":{"value":3.5,"confidence":"high","sources":4,"note":"有算式验算 500×3.5=1750"},"def":{"value":11.6,"confidence":"medium","sources":2,"note":"唯一带游戏内反查闭环的系数（150×11.6=1740 反查「恰好1740」）；11.6/11.7/12 实指 ≈11.66"},"crit":{"value":6,"confidence":"high","sources":5,"note":"2016-08-30 官方上调后取值；有 3600×6 / 4700×6 验算"},"critResist":{"value":10,"confidence":"medium","sources":3,"note":"2016-08-30 官方下调后取值（此前实测 17.40）；缺直接算式"},"elemAtk":{"value":6,"confidence":"medium","sources":1,"note":"2026-10-18 找到首个明确来源：视频「战力提升之战力篇」原话「特殊属性攻击每一点火攻、水攻、雷攻、土攻、风攻属性可增加六战力」。该来源的可信度取决于它同时把另外五个系数全说对了（生命1/攻击3.5/防御11.6/暴击6/抗暴10，与本项目已验证值逐一吻合），所以不能当它整篇是编的。⚠ 残留冲突：恒心说「除最高的属性外，其余属性全部只加一点战力」，与本条的「每点都 +6」不一致。但两者**对结论无影响**：2450 点属攻按 ×6 也只有 1.47 万战力，占千万级战力不到 0.15%，量级上可忽略。"},"elemDef":{"value":10,"confidence":"medium","sources":1,"note":"同一来源原话「特殊属性防御每一点火防、水防、雷防、土防、风防属性可增加十战力」。此前只有 Excel 占位值 10 且零来源，现首次获得出处。⚠ 属性防御的**伤害减免**侧仍未确证（换算成战力 ≠ 减免多少伤害），见 elemMechanics。"}},"sourceIds":["xlsx_base","sohu_coef","game9_coef"]},"elemMechanics":{"rule":"只有【最高】的属性项参与属性百分比伤害（该系总属性 ÷20 换算）；其余各系对伤害**完全无用**。战力方面，主流说法是每点 +6（见 attrWeights.perAttr.elemAtk），另一种说法是其余系每点只 +1 —— 两者不影响结论（量级都＜0.15% 战力）。","formula":"(忍具该系最高属性 + 藏管该系属性) − 对方该系属防，再 ÷ 20 = 属性百分比伤害%，取整数、抹小数、不四舍五入","formulaHistory":"旧版写 ×2÷40（等价）。作者解释：老版本部分面板数值需 ×2 才对应，÷40 表示「每满 40 点属性攻击 = 1%」；现在直接面板相加 ÷20 即可。","caps":{"museumFirstTier":1816,"museumPct":0.9,"toolPct":0.27,"versionCap":1.17,"note":"藏管全一阶 1816 点 → 90%；忍具自身最多 27%；合计上限 117%（2024-11 口径，已可能过时）"},"selfCheck":["1816 ÷ 20 = 90.8 → 90%  ✔ 与原文「相当于 90%」吻合","90% + 27% = 117%        ✔ 与原文「最多 117%」吻合"],"elements":[{"id":"fire","name":"火","color":"红色"},{"id":"thunder","name":"雷","color":"绿色"},{"id":"earth","name":"土","color":"黄色"},{"id":"wind","name":"风","color":"蓝绿色"},{"id":"water","name":"水","color":"蓝色"}],"layout":{"90一星究":{"p1":"雷","p2":"雷","p3":"土","p4":"土","p5":"雷","p6":"雷"},"135二星究":{"p1":"土","p2":"土","p3":"水","p4":"水","p5":"风","p6":"风"},"145三星究":{"p1":"土","p2":"土","p3":"水","p4":"水","p5":"风","p6":"风"},"135挂件":"全部土","145藏管":"第 1 页土 / 第 2 页水 / 第 3 页风"},"sets":{"90一星究":"雷","柱间套135":"土","斑套145":"土","须佐套135":"风（残血减伤，套装效果最香）","三代套145":"风","大蛇丸套145":"水"},"recommended":{"primary":"土（不断层：90 三/四部位、135 柱间套、145 斑套）","secondary":"风（须佐套残血减伤；145 三代套）","avoid":"水（90 究与 135 究都无水，断两层；145 大蛇丸套）","decideBy":"看土系柱间套与风系须佐套哪一套出得多，就主走哪一系"},"swapRule":"换忍具时必须保证身上仍有【4 件同一套装】，否则套装效果断档、战力反而下降。推荐结构 4+2：四件 135/145 究 + 两件同名同系。","museumTrick":"藏管激活四件后，套装效果可以在藏管里更换，不必再换身上忍具、不会掉战力。","defMechanic":"属性防御按【数值直接相减】抵消对应属性的属性攻击，然后再 ÷20 换算成属性百分比伤害。即：有效属攻 = 自己的最高系属攻 - 对方该系属防（不足则归零）。这条已被实测数据闭环验证（见 damageFormulaVerification），不再是「不知道」。","damageFormula":{"steps":["1. 你的属攻（该系）= 忍具该系 + 藏管该系；只取【最高那一系】作为生效属性","2. 有效属攻 = 你的最高系属攻 - 对方该系属防（下限 0）","3. 属性百分比伤害 = 有效属攻 ÷ 20（每 20 点 = 1%）","4. 属性小字伤害 = 大字（基础）伤害 × 属性百分比","5. 总伤害 = 大字伤害 + 属性小字伤害 = 大字 × (1 + 有效属攻/20)"],"oneLiner":"总伤害 = 大字伤害 × (1 + (最高系属攻 − 对方该系属防) / 20)","capsRef":"藏管全一阶 1816 → 90%；忍具本体最多 27%；版本上限 117%（对应 2340 点有效属攻）"},"damageFormulaVerification":{"accounts":[{"id":"账号一","elemAtkByElement":{"水":2001,"风":2450,"土":2021},"highestElem":"风","highest":2450,"elemDefTotal":1100,"baseDamageWan":2279,"claimedPctNoDef":122,"claimedPctWithDef":59,"actualBonusDamageWan":1340},{"id":"账号二","highest":2797,"elemDefTotal":1260,"claimedPctWithDef":84}],"checks":[{"what":"账号一 属攻 ÷20（不减防）","calc":"2450 ÷ 20 = 122.5%","claimed":"122%","diff":"0.5pp"},{"what":"账号一 有效属攻 ÷20","calc":"(2450−1260) ÷ 20 = 59.5%","claimed":"59%","diff":"0.5pp"},{"what":"账号二 有效属攻 ÷20","calc":"(2797−1100) ÷ 20 = 84.85%","claimed":"84%","diff":"0.85pp"},{"what":"账号一 小字伤害","calc":"2279万 × 0.595 = 1356万","claimed":"1340万","diff":"1.2%"}],"structuralCheck":"账号二 2797 − 1697 = 1100，正好等于账号一属防 —— 两个独立方程共用同一套参数，不是巧合。","verdict":"四个数字全部在 1.2% 以内吻合，且存在结构性交叉约束 → 「最高系 + 减属防 + ÷20」这个模型**成立**。"},"critInteraction":"大字 100、属性小字 117% → 合计 217；若大字暴击变成 120，则小字同步变 140.4，合计 260.4。所以属性百分比堆高之后，暴击收益会被放大（小字跟着大字一起涨）。","knownLimitation":"本工具当前按「汇总值 × 系数」把 elemAtk/elemDef 当成普通属性求和、折算战力，**没有实现**上面这套「只取最高系 → 减对方属防 → ÷20」的伤害模型。所以战力数字里属性攻防那部分是近似值；要算真实伤害请按 damageFormula 手算。","confidence":"high","confidenceWhy":"原有依据：单源但含游戏内截图，且 1816÷20=90.8→90%、90+27=117% 三数同公式闭环。2026-10-18 追加：另一视频用**两个真实账号的实战伤害**反向验证，四个数字误差均 <1.2%，并有「2797−1697=1100=账号一属防」的结构性约束 → 该模型的置信度升为 high。仍非官方口径，版本可能已变。","sourceIds":["taptap_tool","douyin_dmg"]},"elemCrossCheck":{"twentyPerPercent":{"value":"每 20 点有效属性攻击 = 1% 属性百分比伤害","confidence":"high","sourceCount":2,"why":"两个互不相关的来源都得出 ÷20：①恒心 2024-11「面板属性相加除以 20 就可以」；②视频《现版本玻璃大炮的根本》「每二十点属性攻击加成百分之一伤害」，且该视频用两个真实账号的伤害数字反推，四个数字误差均 <1.2%。","lines":[{"game":"手游","source":"恒心《你真的玩的懂火影的忍具系统吗？》2024-11","quote":"÷40 是每满 40 属性攻击才会换算 1% 的属性百分比。现在面板属性相加除以 20 就可以。"},{"game":"手游","source":"抖音《现版本玻璃大炮的根本，忍具属攻属防的重要》","quote":"每二十点属性攻击加成百分之一伤害。"}],"rejectedSecondSource":"腾讯官方 2018-01-04「五行查克拉」公告也是火影系列的官方属性伤害公式，但那是《火影忍者OL》端游，其属攻/属抗本身即百分比数值、**没有 ÷20 换算**，不能拿来给手游的 ÷20 背书。所以 ÷20 的第二个来源用的是上面那条实测视频，不是 OL 公告。"},"subtractFramework":{"formula":"有效属攻 = 最高系属攻 − 对方该系属防 → ÷20 得属性百分比","belongsTo":"《火影忍者》手游（2026-10-18 由实战数据确认）","usableForMobile":true,"correction":"本条目曾被我误判为「OL 专属、手游不可用」。收到完整实测数据后更正：手游同样适用「属攻减属防」的减法，只是**没有** OL 那套「出手位/查克拉传递/是否含某属性」的分支加权。OL 的公式是 `[(1+风攻-风抗)*是否存在风属性 + …] / 存在属性数`，手游是单一最高系的线性减法 —— 两者形似而实不同。","actualQuote":"手游实测：账号一风攻 2450，账号二风防 1260，2450−1260=1190，1190÷20≈59%（视频称 59%）。","why":"两个账号的数据都能反算回来，且存在「2797−1697=1100=账号一属防」的交叉约束。"},"elemDefPerPoint":{"value":10,"unit":"战力/点","confidence":"medium","why":"视频《战力提升之战力篇》原话「特殊属性防御每一点火防、水防、雷防、土防、风防属性可增加十战力」。此前唯一依据是 Excel 占位值 10（零来源），现在首次有出处。但该视频同篇把另外五个系数全说对了（生命1/攻击3.5/防御11.6/暴击6/抗暴10），说明作者是照游戏面板读的、不是编的。"},"elemAtkPerPoint":{"value":6,"unit":"战力/点","confidence":"medium","why":"同一来源原话「特殊属性攻击每一点……可增加六战力」。⚠ 与恒心「除最高属性外其余只加一点战力」仍有冲突，但影响可忽略：2450 点属攻 ×6 = 1.47 万战力，占千万级战力不到 0.15%。"},"whyPowerMismatch":{"rune":"符文镶嵌后提供**固定战力**，但符文带的属性收益**不计入**属性面板 —— 所以「属性算出来的战力」会低于面板总战力，差额主要来自符文。","elemFlat":"属性攻防按 ×6 / ×10 折算的那点战力，也可能与面板细微不一致。","levelAndCollection":"人物等级本身给战力；忍者收集加成按百分比放大生命/攻击/防御。"}},"coefficientVerifications":[{"case":"修罗天赋 60 级大节点","given":"每个 60 级大节点固定提升 2320 生命 / 660 攻击 / 200 防御","claim":"合计约 7000 战力（不含忍者加成）","ourCalc":"2320×1 + 660×3.5 + 200×11.6 = 6950","diff":"-0.71%","meaning":"★ 一次同时验证 生命 1 / 攻击 3.5 / 防御 11.6 三个系数 —— 三个数一起对上，比单独验证某一个更难碰巧。这是本项目目前最强的系数交叉证据。","confidence":"high","sourceIds":["douyin_shura"]},{"case":"勾玉单颗：战力 ÷ 攻击","given":"1~9 级红勾玉的攻击值与对应战力","ourCalc":"9 组数据的「战力 ÷ 攻击」全部精确等于 3.5000（31.5/9、52.5/15、105/30、154/44、280/80、518/148、1400/400、2394/684、3990/1140）","diff":"0","meaning":"要么该表本来就是用「攻击×3.5」算出来的，要么它独立印证了攻击系数 = 3.5。同时说明这张 1~9 级表内部是自洽的（不是随手编的），可用。","confidence":"medium","sourceIds":["c17173_jade","douyin_jade"]},{"case":"神器 后期 280 级","given":"239 万忍玉 + 56.73 万轮回石 → 约 41 万战力","ourCalc":"2390000×0.11 + 567300×0.27 = 416071","diff":"+1.5%","meaning":"吻合，但这组数字本来就是本项目 whiteFangBenchmark 的同一来源 → **属循环验证，不能算独立新证据**。","confidence":"low","circular":true,"sourceIds":["china_scroll","xiaomi_artifact_2023"]}],"artifactPowerConflict":{"problem":"外部资料给出神器三段「对应总战力」：前期 70 级 ≈7.5 万、中期 140 级 ≈16.5 万、后期 280 级 ≈41 万。用本项目系数反算：前期 3.77 万（偏 -50%）、中期 24.3 万（偏 +47%）、后期 41.6 万（+1.5% 吻合）。","verdict":"前期/中期偏差近一半，且方向相反（一个偏低一个偏高）→ **这一列不可靠，不采信**。本项目保留自己的分段系数（0.19 / 0.155 / 0.11），理由：它是让后期吻合的那组，且与「白牙后轮回石消耗翻倍、战力收益减半」定性结论一致。⚠ 但必须承认：前期/中期的系数仍属拟合值，未获独立实测确认。","sourceIds":["china_scroll","douyin_artifact"],"extra":"另一处措辞冲突：本文说「后期＝天沼矛及之后」，而本项目记的是「白牙～」。分水岭是白牙，两者不矛盾，但触发点命名需注意。"},"officialAudit":{"searchedAt":"2026-10-18","tool":"node tools/search-official.mjs --tags all --kw ...","cases":[{"question":"属性攻防（elemAtk 6 / elemDef 10）有没有官方公告定义？","verdict":"❌ **没有找到，且大概率从来没有过**","detail":"扫了四个栏目 2016~2026 的可检索全部标题，另直接读取了 2018-05-25《忍具、秘境和团队副本调整公告》，该公告只讲秘卷技移除、团本掉落、秘境 BOSS 血量，**完全不涉及属性攻防数值**。官方 2016-06 的战斗属性说明也只列了 生命/攻击/防御/暴击/抗暴 五种。","implication":"→ 属性攻防的 6 / 10 **只能是玩家反推值**，不可能是官方数值。这两个数的 medium 置信度完全依赖\"某视频把另外五个系数都读对了\"这一旁证，不要期待能找到官方出处。"},{"question":"2016-08-30 那次「抗暴↓ 暴击↑」的官方原文是什么？","verdict":"✅ **找到接近原文的完整表述**（同日转载，非标题级二手）","quote":"「降低了抗暴属性战斗力转换系数，同时提高了暴击属性的战斗力转换系数。」「我们发现抗暴属性的战斗力价值被高估，在实际战斗中的效果达不到其战斗力所对应的能力，因此我们适当降低了抗暴属性对应的战斗力加成（属性数值不变，战斗力加成减少）。同时，提高了暴击属性对应的战斗力加成（属性数值不变，战斗力加成提高）。」「这样，属性对战斗力的影响会变得更明确，暴击优于抗暴。」「调整完成后主要影响饰品玩法，有饰品的玩家战斗力显示会有所波动，但**实际战斗效果没有任何变化**，我们将补偿给 50 级以上玩家一定饰品强化和洗炼材料。」","source":"18183 2016-08-30（同日转载官方更新说明）","url":"https://www.18183.com/hyrz/201608/685051.html","semanticClarification":"★ 关键一句是「实际战斗效果没有任何变化」—— 说明这次改的**只是战力换算系数（显示口径）**，不改战斗数值。所以「抗暴 17.40 → 10」「暴击 5.25 → 6」这些数字**只影响战力面板**，不代表抗暴变弱了。这一点很容易被误读成\"抗暴被削弱\"。","gap":"⚠ 公告**没有公布具体系数数值**。抗暴 10 / 暴击 6 仍是玩家反推，不是官方给的。"},{"question":"勾玉 / 通灵 / 饰品 三个系统的上线公告（孔位数、开槽规则）？","verdict":"❌ **在可检索范围内没找到**","detail":"三个都是 2016 年的首批系统，而公告栏目的 JSON 接口只能回溯到 2021-02；2016 年的公告在 /webplat/ 老页面，但老站无可用列表页、文章 id 无法枚举，实际不可检索。新闻栏目虽回溯到 2016-08，但那之后没有这三者的上线公告（系统已存在）。","implication":"→ 勾玉孔数、开槽规则目前只能依赖**社区二手资料**（且互相矛盾），已按冲突处理，见 growth.jade.slotsConflict。"}],"incidental":[{"what":"洗练百分比 → 战力（2016-08-31 游民星空转贴吧）","data":"1% 暴击 = 10 战力；1% 血/攻/防/抗 = 5 战力（因出战忍者加成，血攻防实际略高，不到 6）","unitCaveat":"⚠ 这是**洗练百分比**的换算，不是属性点。与 attrWeights 的「每点属性→战力」不同量纲，不要混用（1% 暴击对应多少暴击点，随饰品等级变化）。","confidence":"low","url":"https://shouyou.gamersky.com/gl/201608/802003.shtml"},{"what":"竞技场不计首饰暴击加成","data":"2016-08 新版首饰系统的同时，竞技场取消首饰暴击加成","confidence":"low","implication":"所以战力面板的暴击在竞技场里可能不生效 —— 这是「堆暴击=虚战」在 PVP 场景下的一条真实机制依据。","url":"https://shouyou.gamersky.com/gl/201608/802003.shtml"},{"what":"暴击伤害倍率存在冲突说法","data":"A：暴击伤害为普通伤害 1.5 倍（2016 游民星空）；B：大字 100 → 暴击 120，即 1.2 倍（抖音实测举例）","unitCaveat":"两说差 25%。B 是举例说明属性小字联动，可能不是精确倍率；A 是 2016 年口径，可能已调整。**未采信任一方。**","confidence":"unverified"}]},"round4Verifications":[{"case":"神器忍玉总量：可由经验公式精确推导","formula":"10 忍玉 = 5 经验 ⇒ 1 经验 = 2 忍玉；升到 L 级需 Σ(130 + 30(n−1)) 经验","results":[{"level":70,"derived":163100,"claimed":163000,"diff":"+0.06%"},{"level":140,"derived":620200,"claimed":617000,"diff":"+0.52%"},{"level":280,"derived":2416400,"claimed":2390000,"diff":"+1.10%"}],"verdict":"★ 三档全部吻合 1.1% 以内 → 忍玉消耗从此**可以自己算**，不必信任何二手表。同时反证：上一轮给的「前期 8.8 万」是错的（应为 16.31 万）。","confidence":"high","sourceIds":["douyin_artifact_exp","china_scroll"]},{"case":"秘卷高段「+683 攻击 → 约 2390 战力」","formula":"683 × 3.5 = 2390.5","verdict":"与声称的「约 2390」吻合 → 高段秘卷数据本身可信；但碎片战力比从低段 9.5 掉到 0.63（15 倍差），所以「1 碎片 ≈ 9.5 战力」不能用于估算满级成本。","confidence":"medium","sourceIds":["douyin_scroll60","douyin_fragment"]},{"case":"神器「总战力」列：单价不可唯一确定","test":"两组完全不同的单价都能落在 41 万附近：旧拆分(0.11 + 0.27)=41.6 万；本轮拆分(0.05 + 0.5)=40.3 万","verdict":"→ 只有「后期总战力 ≈41 万」这个总数稳；各单体战力率**无法由这些数据唯一确定**。本项目的 0.19/0.155/0.11 与 1/1/0.27 属一组**可行解**，非唯一解。要钉死只能游戏内实测。","confidence":"medium","sourceIds":["china_scroll","douyin_artifact"]}],"crossGameTraps":[{"game":"火影忍者Online（火影忍者OL，端游/页游，回合制）","domain":"huoyin.qq.com","looksOfficial":true,"whyWrong":"域名在 qq.com 下、标题也写「火影忍者官方网站-腾讯游戏」，但它自述是「火影忍者Online官方网站 全球唯一正版《火影忍者》网游」，是回合制端游。它的「五行查克拉」官方公式包含「出手位 / 先攻 / 控制 / 忍术 / 抗性 / 查克拉传递」，这些概念手游里**全部不存在**。","howToSpot":"出现「出手位」「先攻」「控制」「忍术」「抗性」「查克拉传递」「五行查克拉」→ 判定为 OL，立即弃用","officialUrl":"https://huoyin.qq.com/webplat/info/news_version3/5491/5492/5494/m3986/201712/676695.shtml","correctDomainForMobile":"hyrz.qq.com"},{"game":"火影忍者：忍者新世代（OL 移动版）","domain":"—","looksOfficial":false,"whyWrong":"是 OL 的手游版，同为回合制，与《火影忍者》动作手游数值不通。","howToSpot":"出现「忍者新世代」「OLモバイル」字样"}],"communityConflicts":[{"topic":"「虚战」的定义","definitionA":{"source":"B站 BV18KNXzoE4z《虚战仔 / 战力基础架构》","claim":"虚战 = 不计后果**透支潜力**换来的战力（把未来该省的资源提前烧掉），与堆哪种属性无关。","stance":"否认「堆暴击 = 虚战」"},"definitionB":{"source":"抖音《战力提升之战力篇》","claim":"虚战 = 暴击**溢出**后继续堆暴击。原话：「当暴击率达到百分之一百的情况下还继续提升暴击属性，那么战力就处于一个虚战的状态」「恭喜获得虚战仔或者暴击仔」。","stance":"明确认定「暴击溢出 = 虚战」","extraRule":"「根据游戏自身的说法，暴击属性最好控制在**攻击属性的 10% 左右**比较合理。假设总战力一千万、攻击一百万，那么暴击最多也就十万。」"},"thirdDefinition":{"source":"本轮用户提供资料（抖音多条 + 9game 问答），尚无单一权威出处","claim":"把虚战按「堆错的属性」分三种：①暴击虚战（暴击超过「2.35×对方抗暴 + 5 万」阈值后溢出）②防御虚战（1 防御 = 11.6 战力，系数高但伤害抵消边际递减）③生命虚战（1 生命 = 1 战力，换算效率最低，纯堆成「虚肉」）。","check":"其中两条能被本项目数据部分支持：防御 11.6 确实是攻击 3.5 的 3.3 倍；生命 1 确实是最低换算率。「2.35×抗暴 + 5 万」这个阈值另有一份 2026-03 资料复述（作者自注「来源于网上，不知真假」）。","thresholds":[{"what":"防御虚战","rule":"基础防御 > 自身攻击 × 1.5 时，继续堆防御的实战收益显著低于战力涨幅","checkable":"可用本项目系数自检：防御 11.6 / 攻击 3.5 = 3.3 倍，与「是攻击系数的 3.3 倍」的说法一致","verdict":"规则合理，但「1.5 倍」这个具体阈值无实测支撑 → 标 low"},{"what":"生命虚战","rule":"角色生命值突破 5 万后进入生命虚战区间；零氪/月卡 4.5 万即达标","checkable":"❌ 不通过：生命 1 战力/点 ⇒ 5 万生命仅 5 万战力，而面板生命是数百万级、总战力千万级 —— 差至少一个数量级","verdict":"**不采信**。「5 万」几乎肯定是量纲或口径错误（可能指某个子项、或旧版本数值）"},{"what":"属性防御溢出","rule":"属防超过对方同属性攻击后，溢出部分完全无实战收益","checkable":"与已确认的减法公式一致：有效属攻 = max(0, 我方属攻 − 对方属防)，溢出确实归零","verdict":"✅ 与已有公式完全吻合，可采"}],"caution":"⚠ 这一族口径与上面的口径 A **直接冲突**：A 的作者明确否认「堆暴击 = 虚战」。本项目不替任何一方站边，但提示：口径 A 讲的是**资源机会成本**，这一族讲的是**属性配比是否溢出实战需求**，两者可以同时成立（一笔资源既可能透支未来、也可能堆到溢出区）。"},"howToHandle":"两者其实不冲突在**目的**上（都指向「战力高但打不动」），差别在**判据**：A 看资源是否透支，B 看暴击是否溢出。本项目同时保留，让 agent 按用户问的是「资源规划」还是「属性配比」来选口径。"}],"collectionMilestones":{"fiveStarS":{"fullAttrBonus":{"三星":0.122,"四星":0.162,"五星":0.203},"unit":"全属性加成百分比","note":"「一个五星 S 忍全属性加成是 20.3%，四星 16.2%，三星 12.2%」——第一个五星 S 会一次性拉高全属性加成上限，所以很多人第一个五星 S 一到位就涨几十万战力；之后再升五星（或更低星级）只会增加收集加成的战力。","confidence":"low","sourceIds":["douyin_power_basics"]},"collectionBonusRule":{"rule":"全属性加成 = 取「当前拥有的忍者中属性加成百分比最高的那一位」，**不含暴击与抗暴**；收集加成按收集的忍者分类分别叠加，同样不含暴击与抗暴。","note":"这是对「收集加成只作用于生命/攻击/防御」的又一次独立确认（本项目原有 4 个来源，现为 5 个）。","confidence":"high","sourceIds":["douyin_power_basics"]},"insightNodes":{"jeibangUnlock":"忍传感悟等级达 **1800** 后解锁羁绊升级","jeibangAdvice":"建议感悟到 **2000** 再做羁绊升级","jeibangMax":"羁绊升级到 **100** 得专属忍者名片","materials":"忍传感悟消耗忍玉 + 忍魂；忍玉来自每日任务与集会所，忍魂靠收集忍者碎片","note":"羁绊升级中途换忍者不增加消耗（材料数量不变），所以可以按喜好选高招 S。","confidence":"low","sourceIds":["douyin_power_basics"]},"basePowerDefinition":{"definition":"基础战力 = **不可拆卸**的战力。去掉饰品 / 忍具 / 勾玉这些可换部件后剩下的部分。","confidence":"low","sourceIds":["douyin_power_basics"]}},"gameStatus":{"levelCap":{"value":175,"since":"2026-09-10 大版本（公告发布于 2026-09-08 17:16）","officialQuote":"角色等级上限提升至175级。装备等级相应提升，装备进阶提升至89阶。","confidence":"high","previousValue":{"value":170,"since":"2025-09-04 大版本","note":"已被 2026-09-10 版本覆盖，不要再引用"},"howToVerify":"node tools/fetch-official.mjs --aid 18853074","sourceIds":["official_20260910"],"note":"这条此前被我判为「未确证」并建议不要改表 —— 原因是我抓官方页面时只拿到 Vue 模板占位符。后来找到真正的 JSON 接口（apps.game.qq.com/wmp/v3.1/public/searchNews.php），正文可读，现已用原文确认。"},"possibleCap175":{"value":175,"confidence":"unverified","evidence":"用户提供的 B站视频标题「版本更新175级，装备进阶提战11万」（b23.tv 短链实测返回 412，无法打开核对）","checkedAndFailed":["官方公告页 hyrz.qq.com/web202003/newsDetails.html?aid=18853074 为 JS 模板，HTML 里 0 处提到 175/170/等级上限","小米游戏中心转载版（2026-09-08）正文全部是图片，无可读文字","App Store 1.79.79.9（2026-09-09）更新说明只提新忍者与平衡性调整，未提等级上限"],"action":"**不要据此改表**。170 是目前唯一有文字来源的上限；若用户确实已超过 170 级，说明 175 大概率已开放，此时请直接问用户当前等级上限，并按 175 重算达标线区间。"},"highestRaid":{"name":"轮墓边狱","level":160,"powerThreshold":{"min":30000000,"max":46000000},"confidence":"medium","note":"未找到 165/170 级团本。队伍实测「保底 3000 万，最高 4600 万」。**这是通关门槛，不是等级达标线。**","sourceIds":["sohu_160raid"]},"officialSourceCaveat":"hyrz.qq.com 的旧公告页（/webplat/...）为 GBK 编码，按 UTF-8 取会乱码；新版（web202003）是 JS 模板，正文只返回占位符。**所以本项目几乎没有可逐字引用的官方原句** —— 遇到\"官方说\"要格外小心，很可能引用者自己也没读到原文。（这一点由两次独立调研各自撞到后确认）"},"dataConflicts2026":[{"topic":"勾玉总孔位数","a":"2016 年样本「6 装备 + 4 通灵 = 54 孔」","b":"2024 年指南「每件装备 6 个勾玉槽、每只通灵兽 5 个勾玉槽」","verdict":"两者不可能同时成立（槽数正好对调）。**当前总孔位数至今无可靠数字，需实测。**","sourceIds":["diyiyou_jade","ccplay_2024","gamersky_jade"]},{"topic":"勾玉六色与属性对应","a":"同一篇 2024 指南段首写「红:攻击 蓝:防御 绿:生命」","b":"紧接着同段又写「青:攻击防御 紫:防御生命 绿:攻击生命」","verdict":"绿/蓝各出现两次且定义不同 → **该文不能当映射表用**，本项目不采任何一版。"},{"topic":"装备强化上限","a":"2024-12 文章「最高 +59」","b":"App Store 描述「装备进阶提升至 84 阶」","verdict":"可能是不同维度（强化等级 vs 进阶阶数），**无来源说明，不合并**；+59 标低置信。"},{"topic":"云迹保护符消耗","a":"CSDN 表「20→30 级需保护符 96」","b":"233乐园「0→+30 共 1608 张」","verdict":"数量级差 16 倍。至少一条口径错（可能一为单级、一为累计）。**本项目取 1608 并标低置信。**"},{"topic":"云迹上线时间","a":"CSDN 表把云迹标为「2036 年 3 月」","b":"233乐园 2025-09-11 已在测云迹强化；2026-01-23 已有 165 级云迹测评","verdict":"「2036」明显笔误；云迹实际应早于 2026-03。**说明该表连年份都会写错，其数字需逐项复核。**"},{"topic":"防御战力系数","a":"CSDN 表 1:12","b":"本项目 11.6（有游戏内反查 150×11.6=1740）","verdict":"已有结论：取 11.6。12 会高估 3.4%。"},{"topic":"神器轮回石单次消耗","a":"流传值「白牙后 30→60 个/次」","b":"小米 2023 原文「白牙是 600 轮回石提炼 10 次，白牙前都是 300 提炼 10 次」","verdict":"★ **两者等价**：300/10 = 30、600/10 = 60。这条从「单源流传」升级为「有原文算式支撑」。"}],"boards":[{"id":"equipment","name":"装备","order":0,"note":"最容易达到版本上限（5 品阶，橙后最高 +59）"},{"id":"jade","name":"勾玉","order":1,"note":"六色，上限 9 级；建议全孔同步"},{"id":"accessory","name":"饰品","order":2,"note":"3 词条；130 级起带符文；换装必折损"},{"id":"artifact","name":"神器","order":3,"note":"忍玉+轮回石；白牙后收益减半"},{"id":"tool_body","name":"忍具（身）","order":4,"note":"90 级开启；浮动基础"},{"id":"spirit","name":"通灵","order":5,"note":"未上阵也生效；社区称加战力最多"},{"id":"tool_museum","name":"忍具藏馆","order":6,"note":"固定基础；全一阶=90% 属性加成"},{"id":"ninja_insight","name":"忍传感悟","order":7,"note":"真实基础，受收集加成"},{"id":"bond_card","name":"羁绊名片","order":8,"note":"固定基础，不受百分比加成"},{"id":"title","name":"称号","order":9,"note":"真实基础"},{"id":"scroll","name":"密卷","order":10,"note":"上限 30 级，10 级即满核心效果"},{"id":"avatar_frame","name":"头像框","order":11,"note":"真实基础"},{"id":"talent","name":"天赋","order":12,"note":"铜币即可提升，性价比高"},{"id":"talent_shura","name":"修罗天赋","order":13,"note":"110 级开放"},{"id":"rune","name":"符文镶嵌","order":14,"note":"空气加成：固定战力但可能属性不匹配"},{"id":"costume","name":"装扮","order":15,"note":"固定基础"}],"boardAttrs":[{"id":"hp","name":"生命面板"},{"id":"atk","name":"攻击面板"},{"id":"def","name":"防御面板"},{"id":"crit","name":"暴击"},{"id":"critResist","name":"抗暴"},{"id":"elemAtk","name":"属性攻击"},{"id":"elemDef","name":"属性防御"}],"collectionBonus":{"hp":0,"atk":0,"def":0,"appliesTo":["hp","atk","def"],"needsUserInput":true,"confidence":"medium","sourceIds":["game9_coef"]},"growth":{"artifact":{"tiers":[{"name":"前期（幌金绳～牙）","maxLevel":70,"powerPerYanYu":0.19,"powerPerLunHuiShi":1,"lunHuiPerRoll":30},{"name":"中期（平目鲽～双袭牙）","maxLevel":140,"powerPerYanYu":0.155,"powerPerLunHuiShi":1,"lunHuiPerRoll":30},{"name":"后期（白牙～）","maxLevel":280,"powerPerYanYu":0.11,"powerPerLunHuiShi":0.27,"lunHuiPerRoll":60}],"whiteFangBenchmark":{"lunHuiShi":567300,"yanYu":2390000,"power":410000,"note":"轮回石贡献约 60%、忍玉约 40%","confidence":"low"},"expFormula":{"rules":["10 个忍玉 = 1 次强化 = 5 点神器经验","初始 1 级需 130 经验，每升一级所需经验递增 30 点（等差数列）"],"derived":"1 点经验 = 2 忍玉；升到 L 级共需 Σ(n=1..L)(130 + 30(n−1)) 经验","verified":[{"level":70,"derivedYanYu":163100,"claimed":"16.3 万","diff":"0.1%（精确吻合）"},{"level":140,"derivedYanYu":620200,"claimed":"61.7 万","diff":"+0.5%"},{"level":280,"derivedYanYu":2416400,"claimed":"239 万","diff":"+1.1%"}],"correction":"**上一轮资料说前期 70 级约 8.8 万忍玉，是错的**：按经验公式应为 16.31 万。本轮给的 16.3 万与公式吻合到 0.1%，故采本轮、弃上轮。教训：凡是能用游戏内公式推出来的，就不要采信二手表格。","confidence":"high"},"powerColumnUnresolvable":{"problem":"资料给三段「总战力贡献」：前期 7.5 万 / 中期 16.5 万 / 后期 41 万，并给「忍玉≈0.2 / 0.05 战力」。","test":"用总数反解单价：若轮回石单价取 1，则忍玉单价需为 前期 0.331 / 中期 0.029 / 后期 −0.066；取 0.5 则需 前期 0.396 / 中期 0.148 / 后期 0.053 —— 三档非单调、且正负号都变。","harder":"更关键：本项目旧拆分（忍玉 0.11 + 轮回 0.27）得 41.6 万，本轮声称拆分（忍玉 0.05 + 轮回 0.5）得 40.3 万 —— **两组完全不同的单价都能落在 41 万附近**。","verdict":"→ **「后期总战力≈41 万」这个总数是稳的，但各单体的战力率无法由这些数据唯一确定**。本项目的 0.19/0.155/0.11 与 1/1/0.27 属**一组可行解，不是唯一解**，已在 confidence 里体现。要钉死单价，只能做游戏内实测（升 1 级、只加忍玉、看战力跳变）。"},"refineCostVerification":{"quote":"白牙是 600 轮回石提炼 10 次，白牙前的话都是 300 轮回石提炼 10 次","derived":"300 ÷ 10 = 30 个/次；600 ÷ 10 = 60 个/次","verdict":"与流传值「白牙前 30、白牙后 60」完全等价 → 该条置信度可视为中高","sourceIds":["xiaomi_artifact_2023"]},"namingTiers":{"early":"幌金绳 / 七星剑 / 红葫芦 / 芭蕉扇 / 琥珀净瓶 / 斩首大刀 / 鲛肌 / 缝针 / 兜割 / 飞沫","mid":"平目鲽 / 飞雷神苦无 / 大镰 / 三星扇 / 魔笛 / 石剑 / 沙葫芦 / 双袭牙","late":"白牙 及其后"},"tip":"先升满级再补轮回石：未满级时 30 轮回石约换 1 点防御，满级后可换约 3 点（原文对比）。","note":"忍玉每级经验递增 → 忍玉边际收益递减；同档内建议平均升，不要单件猛冲。","confidence":"medium","sourceIds":["xlsx_base","xiaomi_artifact","xiaomi_artifact_2023"]},"spiritAdvance":{"stages":[{"name":"忍犬-蛤蟆仙人","stageRange":"0-4","copperWan":635.8,"power":9571,"reputationWan":24.8,"powerPerReputation":0.039},{"name":"忍犬-蛤蟆仙人","stageRange":"5—9","copperWan":1864.5,"power":14421,"reputationWan":76.4,"powerPerReputation":0.018},{"name":"鲨鱼-蜘蛛","stageRange":"0-4","copperWan":953.6,"power":14357,"reputationWan":25.7,"powerPerReputation":0.039},{"name":"鲨鱼-蜘蛛","stageRange":"5—9","copperWan":2796.8,"power":21632,"reputationWan":114.6,"powerPerReputation":0.018},{"name":"氪金通灵","stageRange":"0-4","copperWan":1907.3,"power":28715,"reputationWan":25.67,"powerPerReputation":0.039},{"name":"氪金通灵","stageRange":"5—9","copperWan":5593.5,"power":43263,"reputationWan":229.2,"powerPerReputation":0.018}],"sweetSpots":[{"desc":"全部普通通灵进阶到 +4","cost":"消耗量未确证（原流传值 60万声望+1125万铜币已被判定为农场污染）","power":null,"verdict":"策略上优先做（2 个来源支持\"先均升\"），但**具体战力增量未验证**","confidence":"low","sourceIds":["zhufu_strategy"]},{"desc":"再全部推进到 5 阶","cost":"声望约 3 倍","power":null,"verdict":"次优","confidence":"low"},{"desc":"攻击型通灵（猿魔/蛤蟆吉/山椒鱼/鲨鱼）到 15 阶","cost":"—","power":null,"verdict":"同样来自农场转载，具体数值未验证","confidence":"unverified"}],"note":"4/9/14/19 阶需要通灵卷轴。大进阶声望三档：3 万 / 4.5 万 / 9 万（对应三档通灵，来源小米，中置信）。⚠ 「均升优于单只冲高」这个**策略**有 2 源支持；但「全通灵 +4 具体涨多少战力」的流传数字来自内容农场，本项目已撤下该数字。","confidence":"low","sourceIds":["xiaomi_spirit","zhufu_strategy"]},"spiritLevelCap":{"groups":[{"range":"忍犬～蛤蟆仙人","cap":51},{"range":"鲵鲨～乌鸦","cap":151},{"range":"蛤蟆龙～鹰","cap":301},{"range":"蜘蛛","cap":601,"note":"单次升级约 200 万铜币"}],"confidence":"medium","sourceIds":["xiaomi_spirit","spirit_cost_table"],"note":"2 个独立作者（2019、2021）一致；第三份消耗表的分组边界与之一致（差 1 级是 0→N 计数方式），故「分组边界」这部分置信度可视为中偏高。"},"spiritCostTable":{"rows":[{"name":"忍犬","maxLevel":50,"reputationWan":1.5,"copperWan":181},{"name":"蓝蛇","maxLevel":50,"reputationWan":6,"copperWan":685},{"name":"蛤蟆吉","maxLevel":50,"reputationWan":11.3,"copperWan":1386},{"name":"忍龟","maxLevel":50,"reputationWan":25,"copperWan":2738},{"name":"镰鼬","maxLevel":50,"reputationWan":30,"copperWan":3650},{"name":"猿魔","maxLevel":50,"reputationWan":37,"copperWan":4500},{"name":"山椒鱼","maxLevel":50,"reputationWan":40,"copperWan":4800},{"name":"贝壳","maxLevel":50,"reputationWan":38,"copperWan":5000,"flag":"铜币有 4500 万 / 5000 万 两种说法，取多数"},{"name":"蛤蟆仙人","maxLevel":50,"reputationWan":37,"copperWan":4563},{"name":"鲛鲨","maxLevel":150,"reputationWan":160,"copperWan":21000},{"name":"蛤蟆健","maxLevel":150,"reputationWan":162,"copperWan":22000},{"name":"乌鸦","maxLevel":150,"reputationWan":580,"copperWan":46000,"flag":"声望反常：150 级上限却比 300 级的蛤蟆龙（413 万）更贵，三份资料都这样"},{"name":"蛤蟆龙","maxLevel":300,"reputationWan":413,"copperWan":60600,"flag":"另有 6.1 亿说法"},{"name":"蛤蟆广","maxLevel":300,"reputationWan":413,"copperWan":86000},{"name":"鹰","maxLevel":300,"reputationWan":413,"copperWan":86000},{"name":"（300 级第四只，名称转录不清）","maxLevel":300,"reputationWan":413,"copperWan":86000,"flag":"语音转写为「大象/孟末」，无法确定是哪只，仅占位"},{"name":"蜘蛛","maxLevel":600,"reputationWan":1356,"copperWan":500000,"flag":"约数；另有转写作 5.02 亿，疑为 50 亿听错"},{"name":"蛤蟆吾郎","maxLevel":600,"reputationWan":1354,"copperWan":520000,"flag":"约数；另有 51 亿说法"}],"unit":{"maxLevel":"级","reputationWan":"万","copperWan":"万"},"confidence":"medium","confidenceWhy":"已取到**三份独立视频的完整口述**（非二手摘要），逐条比对：绝大多数条目三源一致，仅「贝壳铜币」「蛤蟆龙铜币」「蜘蛛/蛤蟆吾郎」有细微出入，均已标注。重要发现：**乌鸦声望高于蛤蟆龙这个反常项，三份资料全部一致** → 说明它不是某一家抄错，而是源数据本身就如此（可能原始长图如此，或游戏确实这样设计）。⚠ 但这三份视频很可能都源自同一张社区长图，故只能算「传播一致」而非「三次独立实测」，给 medium 不给 high。","discrepancies":["忍犬铜币：181 万（2 票） / 180 万（1 票）→ 取 181 万","蛤蟆吉铜币：1386 万（2 票） / 1360 万（1 票）→ 取 1386 万","忍龟声望：25 万 / 23 万 → 取 25 万","贝壳铜币：5000 万（2 票） / 4500 万（1 票）→ 取 5000 万","蛤蟆龙铜币：6.06 亿 / 6.1 亿 → 取 6.06 亿","蜘蛛铜币：50 亿（2 票） / 5.02 亿（1 票，疑语音把「五十」听成「五」）→ 取 50 亿","蛤蟆吾郎铜币：52 亿 / 51 亿 → 取 52 亿","鲛鲨/蛤蟆健铜币：一份转写作「十二点一亿/十二点二亿」，与另两份的 2.1/2.2 亿冲突 → 判为语音错误，取 2.1/2.2 亿"],"advanceTips":["120 级并解锁乌鸦后开启进阶，优先给攻击型通灵（猿魔 / 蛤蟆吉 / 鲛鲨等）进阶 +5 阶。","进阶顺序：全部通灵先到 5 阶 → 攻击型到 10 阶 → 全部到 10 阶 → 再往上推。","进阶成功率 ≥60% 用声望，<60% 用培养石（省材料）。","进阶材料（通灵卷轴）来自「追击小组织」。","金币/氪金通灵都是攻击属性（普通「鲛鲨」例外是生命），所以只需优先拉到 5 阶 —— 因为高级通灵卷轴每 10 周才能在积分赛商店凑出 1 个，周期太长。"],"sourceIds":["spirit_cost_table"]},"equipment":{"tiers":["白","绿","蓝","紫","橙"],"maxEnhance":59,"enhanceCapByTier":{"白":4,"绿":4,"蓝":4,"紫":15,"橙":59},"advanceTiers":{"value":89,"officialQuote":"装备等级相应提升，装备进阶提升至89阶。","previous":{"value":84,"source":"App Store 2026 版描述"},"resolution":"「进阶 89 阶」与「强化 +59」是**两个不同维度**（进阶=阶数、强化=等级），此前把 App Store 的「84 阶」与文章里的「+59」当成同一维度的矛盾，是判断错误。两者现在都有出处，可以并存：进阶 89 阶（官方）+ 强化上限 +59（社区）。","confidence":"high","sourceIds":["official_20260910"]},"orangeStageConflict":{"previousRound":[4,16,24],"thisRound":[16,24,36,59],"verdict":"两轮都提到 +59，但中间节点不一致（4/16/24 vs 16/24/36/59）。**不合并**，两者并列，实际以游戏内为准。"},"stagePoints":[4,16,24],"powerBenchmark":{"orange20at110":{"range":[180000,220000],"note":"110 级阶段，全套橙 +20 约 18~22 万基础战力（不含忍者百分比加成）"},"orange59full":{"range":[280000,350000],"note":"全套橙 +59 满级约 28~35 万基础战力"},"caveat":"⚠ 这是「基础战力」，且是社区口径、无实测记录。它同时说明一件事：**单个板块的战力只有几十万量级**，而总战力是千万级 —— 面板里任何一块填得离谱都要先怀疑输入。","confidence":"low"},"materialRhythm":"每 4 阶一套精英副本材料；进阶材料靠体力刷副本","levelRule":"装备等级不得高于角色等级；升级消耗「幻彩石 + 铜币」","confidence":"low","confidenceWhy":"「+59」「5 品阶」「+4/+16/+24 阶段点」来自同一篇 2024-12 文章，单源且 2026 年无更新来源 → 是否已提上限未确证。另有 App Store 描述称「装备进阶提升至 84 阶」，与 +59 可能是两个不同维度（进阶阶数 vs 强化等级），**无来源说明，不能合并**，故单列在 dataConflicts2026。","sourceIds":["9game_equipment","wenda_3839"]},"scroll":{"maxLevel":30,"effectCapLevel":10,"fragmentsPerLevel":[5,10,15,20,25,40,45,50,55,60],"fragmentsTotalTo10":325,"copperPerLevel":[6345,8926,20000,30000,50000,60000,80000,90000,110000,130000],"copperTotalTo10":585271,"maxLevelConflict":{"earlier":{"value":30,"source":"官方 2018 攻略（17173 2020 转载）","confidence":"medium"},"later":{"value":60,"source":"本轮资料（抖音两条）","confidence":"unverified"},"verdict":"2018 年上限 30 级有官方攻略原文；2026 年称 60 级。**上限很可能被提高过**，属版本差异而非错误。本工具默认展示 30 级的旧口径并标注，同时记录 60 级说法；**实际以游戏内为准**。"},"fragmentDecay":{"lowTier":{"fragments":325,"power":3088,"rate":9.5,"note":"1→10 级：325 碎片 ≈ 3088 战力 → 9.5 战力/碎片"},"highTier":{"fragmentsPerLevel":3800,"atkGain":683,"powerGain":2391,"rate":0.63,"note":"60 级附近：3800 碎片 → +683 攻击 → 683×3.5 = 2391 战力（与声称「约 2390」吻合）→ 0.63 战力/碎片"},"verdict":"★ 「1 碎片 ≈ 9.5 战力」**只在低等级成立**，高等级掉到 0.63（差 15 倍）。所以那条通用口径不能拿来估算满级成本。但「+683 攻击 → 2390 战力」这一步能被 3.5 系数精确复现，说明高段数据本身可信。"},"powerClaims":{"perScrollMaxed":"单本满级（30 级）约 1000~3000 战力（不同秘卷差异较小）","allScrollsMaxed":"全秘卷满级约 4~5 万战力","perFragment":"1 个秘卷碎片 ≈ 9.5 战力","conflict":"⚠ 三条互不自洽：325 碎片 × 9.5 = 3088（≈单本上限 3000，勉强成立）；但「34 本 × 3000 = 10.2 万」远大于「全秘卷 4~5 万」。→ **只采信「单本 1→10 级约 3000 战力」这个量级**，其余两条不用于计算。","confidence":"low"},"count2020":34,"confidence":"medium","confidenceWhy":"「30 级上限 / 10 级满效果 / 1→10 级碎片 5…60」来自官方 2018 攻略的 2020 年转载，可读全文；碎片逐项加总 = 325，自洽。⚠ 但「34 个秘卷」是 2020 年数量，现版本已增，未更新。","sourceIds":["sc17173_scroll","sohu_scroll","bili_coef_cross"]},"talent":{"talentCost":"天赋点 + 铜币；天赋点来自剧情副本三星通关","shuraUnlockLevel":110,"shuraTiersOfficial":{"quote":"修罗副本新增第九章。新增25、26、27、28、29、30阶修罗天赋，增加修罗天赋等级上限。","addedTiers":[25,26,27,28,29,30],"note":"注意「阶」与「级」是两个轴：这里是**阶**（天赋档位，已到 30 阶），而社区说的「170 级对应约 2324 级」是**等级**。两个数不能混。","confidence":"high","sourceIds":["official_20260910"]},"shuraCost":"修罗天赋点 + 铜币","shura":{"unlockLevel":110,"levelCapAt170":2324,"capNote":"上限与角色等级同步提升；170 级对应约 2324 级。每年 9 月大版本会提升上限。","costPerLevel":"1 修罗天赋点 + 铜币；前期每级数万、后期每级数十万铜币","expPerLevel":"5 万角色经验 = 1 级修罗等级","bigNode":{"everyLevels":60,"gain":{"hp":2320,"atk":660,"def":200},"claimedPower":7000,"ourCalc":6950,"note":"用本项目 hp1/atk3.5/def11.6 反算 = 6950，与作者说的「约 7000」差 -0.71% → 系数交叉验证成立。"},"confidence":"medium"},"talentTiers":"普通天赋随冒险副本推进逐阶解锁（当前十余阶，无固定总上限）；一阶单点约 2000~3000 铜币，二阶约 3000~5000，高阶可达上万铜币。","confidence":"low","confidenceWhy":"110 级开放有 2 个来源，但其中一篇把天赋写成「增加影分身数量」，AI 味重，只算旁证。另 2025-08 有「2025-09 大版本开启新的修罗天赋」的说法，与「110 级早已开放」不矛盾（应理解为新增分支），但原文措辞含糊。","note":"等级上限、每级消耗、战力贡献**均未找到**；官方 2016 天赋介绍页 GBK 乱码，无法引用。","sourceIds":["ccplay_2024","sohu_level170","douyin_shura"]},"accessoryTiers":{"rows":[{"name":"自由","level":60,"magicMin":2781,"magicMax":5920},{"name":"赤魂","level":70,"magicMin":5921,"magicMax":8060},{"name":"忠诚","level":80,"magicMin":8061,"magicMax":11530},{"name":"梦魇","level":90,"magicMin":11531,"magicMax":17800},{"name":"落岩","level":100,"magicMin":17801,"magicMax":22400},{"name":"封印","level":110,"magicMin":22401,"magicMax":27000},{"name":"祝福","level":120,"magicMin":28000,"magicMax":29160,"flag":"与上一档之间有 999 点空隙（27001~27999），疑原表缺漏"},{"name":"祈愿","level":130,"magicMin":29161,"magicMax":32253},{"name":"破晓","level":140,"magicMin":32254,"magicMax":36160},{"name":"晨曦","level":145,"magicMin":36161,"magicMax":40840},{"name":"曙光","level":150,"magicMin":40841,"magicMax":44920},{"name":"旭日","level":155,"magicMin":44921,"magicMax":49420},{"name":"苍穹","level":160,"magicMin":49421,"magicMax":54350},{"name":"云迹","level":165,"magicMin":54351,"magicMax":null}],"clarification":"「曙光」是 150 级饰品，「云迹」是当前最高（165 级），**云迹之上暂无更高阶**。","enhanceCap":{"below130":30,"from130":35,"note":"100~120 级饰品强化上限 +30；130 级起 +35（云迹也是 +35）"},"dropThresholds":{"cloudOrangeMagic":54000,"cloudBlueGuaranteeMagic":68700,"note":"云迹出货：抗魔 5.4 万给橙，6.87 万抗魔保底蓝（原表口径，非确证）"},"confidence":"medium","confidenceWhy":"抗魔区间 14 档完整、单调递增，来自 2026-03 一份可读全文的表，内部一致性好。⚠「祝福」档下限 28000 与「封印」上限 27000 之间有空隙，属原表缺漏；云迹上限留空。","sourceIds":["csdn"]},"jade":{"perGemTable":[{"level":1,"atk":9,"power":31.5,"basis":"外部资料称官方精准值","confidence":"medium"},{"level":2,"atk":15,"power":52.5,"basis":"同上","confidence":"medium"},{"level":3,"atk":30,"power":105,"basis":"同上","confidence":"medium"},{"level":4,"atk":44,"power":154,"basis":"同上","confidence":"medium"},{"level":5,"atk":80,"power":280,"basis":"同上","confidence":"medium"},{"level":6,"atk":148,"power":518,"basis":"同上","confidence":"medium"},{"level":7,"atk":400,"power":1400,"basis":"外部资料称玩家实测","confidence":"low"},{"level":8,"atk":684,"power":2394,"basis":"同上","confidence":"low"},{"level":9,"atk":1140,"power":3990,"basis":"称由 3 合 1 规则推导，无实测","confidence":"unverified"}],"dualAttrExample":{"case":"6 级黄勾玉","hp":519,"atk":178,"power":678,"check":"519×1 + 178×3.5 = 1142 —— 与声称的 678 **不符**","verdict":"⚠ 这条对不上：按本项目系数应为 1142 而非 678。可能是「双属性勾玉的两个属性不是全额计入」或该数字来源有误。**不采信 678**，仅记录该说法。"},"slots":{"equipmentSides":[{"name":"武器","slots":5},{"name":"护额","slots":5},{"name":"锁甲","slots":5},{"name":"铃铛","slots":5},{"name":"项链","slots":5},{"name":"铜戒","slots":5}],"equipmentTotal":30,"note":"装备端 6 部位 × 5 孔 = 30，与 2016 年老样本的装备部分（6×5=30）一致 → 这半边可信。","confidence":"medium"},"spiritSlotRule":{"initial":2,"unlockAtAdvanceStages":[5,10,15],"maxPerSpirit":5,"note":"单只通灵初始 2 孔，进阶到 5 / 10 / 15 阶各多开 1 孔，满进阶 5 孔。这条与通灵进阶的阶数分段（0-4 / 5-9 / 10-14 / 15-19）正好对齐，**规则本身可信**。","confidence":"medium"},"equipmentSlotRule":"装备端：6 部位各固定 5 个专属颜色槽（共 30），槽位随角色等级逐步解锁、与装备品阶无关。","colorMap":{"red":{"name":"红","attrs":["atk"],"note":"纯攻击"},"blue":{"name":"蓝","attrs":["def"],"note":"纯防御"},"green":{"name":"绿","attrs":["hp"],"note":"纯生命"},"cyan":{"name":"青","attrs":["atk","def"],"note":"攻 + 防"},"purple":{"name":"紫","attrs":["def","hp"],"note":"防 + 命"},"yellow":{"name":"黄","attrs":["atk","hp"],"note":"攻 + 命"},"priority":["黄","青","紫"],"why":"黄含攻击（3.5 战力/点），青攻防次之，紫只有防御+生命 → 同等级下黄的战力最高。这与本项目系数排序一致，属于**能被自身数据解释**的说法。","conflictNote":"⚠ 2024 年那篇指南同一段内把绿/蓝写成两种属性（自相矛盾），曾是主要疑点。现两轮独立资料给出同一映射，且与本项目系数排序吻合 → **可采纳**，但仍标 medium。","confidence":"medium","sourceIds":["gamersky_jade","xiaomi_jade_advance"]},"slotsConflict":"通灵端孔数三方互斥：①2016 样本反推为「每只 6 孔」（6装备×5 + 4通灵×6 = 54）；②2024 指南写「每装备 6 孔、每通灵 5 孔」；③本轮资料写「每只通灵 5 孔 × 共 9 只 = 45」。⚠ 其中「9 只通灵」几乎肯定错 —— 本项目通灵表实有 18 只以上。**通灵端孔数至今无可靠数字，总孔数不可用。**","perLevelPower":{"2":124,"3":203,"4":402,"5":600,"6":800},"perLevelPowerDeprecated":"🔴 旧口径（2016 年 54 孔样本反推）已降级：它给 4 级 402、6 级 800，而新表的「属性×3.5」给 4 级 154、6 级 518 —— 后者 9 行全部精确自洽于 3.5，前者来源自述「5/6 级为大胆推测」。**两者差 2.6 倍和 1.5 倍，新表更可信**；旧表仅作历史记录，勿再用于计算。","extrapolated":["5","6"],"bodyTotals":[{"level":4,"power":21700,"gold":14600,"note":"⚠ 2016 年 54 孔/45级样本：全 4 级 ≈ +2.17 万战力 / 1.46 万金币"},{"level":6,"power":43200,"gold":131000,"note":"⚠ 同上：全 6 级 ≈ +4.32 万 / 13.1 万金币"}],"sampleContext":"2016-01-18 实测，样本为 45 级、我爱罗、6 装备 + 4 通灵 = 54 孔","rules2":{"synthesize":"3 颗同级合成 1 颗高一级","refineCap":30,"refineNote":"勾玉精炼满级 30 级，按百分比提升勾玉属性","maxLevel":9},"rules":["3 级两颗 > 1 颗 4 级","3 颗 5 级 > 1 颗 6 级","先全 4 级再往上"],"note":"凹曲线是**结构性规律**（4→6 级：资源 ×9、战力 ×2），所以「先铺满低等级」的策略依然成立。⚠ 2016 年的「全身 +2.17 万 / +4.32 万」基于 54 孔基数，**已不能当 2026 现值**。单颗数据请优先用 perGemTable（1~9 级完整且自洽），不要用 perLevelPower（已降级）。","confidence":"low","confidenceWhy":"「3 颗合 1 级」「1~9 级上限」「精炼 30 级」「9 级上限」有多源支持；1~9 级单颗属性/战力表内部完全自洽（÷攻击 = 3.5，9 行无一例外），故可用。但**全身总战力**与**通灵端孔数**仍不可用。","sourceIds":["diyiyou_jade","xiaomi_jade","gamersky_jade","c17173_jade","douyin_jade"]},"tool":{"enhanceCap":{"noUnique":8,"withUnique":15,"note":"无究忍具最多 +8，有究忍具建议 +15（多来源一致）"},"inheritance":"一星究 +15 继承到二星会掉 2 级，最省","museum":{"allFirstTier":1816,"attrBonus":0.9,"toolBodyMax":0.27,"versionCap":1.17,"note":"藏馆全一阶=1816点=90% 属性加成；忍具本体最多 27%；版本上限 117%"},"confidence":"medium","sourceIds":["zol_museum"]},"accessory":{"yunjiBelt30":{"power":730000,"magic":12000,"dust":1150000,"talisman":1608,"star":18000,"note":"云迹腰带 0→+30 单件（3 攻击词条）；绿水 115 万 / 保护符 1608 / 紫星 1.8 万","caveat":"csdn 与 233乐园两条的四个数字逐字相同，疑同一份实测被搬运 → **不构成独立双源**；也无人复现。按「低」处理，只当量级参考。"},"confidence":"low","sourceIds":["csdn","leyuan_yunji"]}},"powerStandards":{"table":[{"level":50,"power":500000,"confidence":"low","basis":"2026-06 表「不低于 50 万」"},{"level":60,"power":650000,"confidence":"low","basis":"2026-06 表「不低于 65 万」（旧表 56~65 万，取上限）"},{"level":70,"power":850000,"confidence":"low","basis":"2026-06 表「不低于 85 万」；旧表区间 65~85 万"},{"level":80,"power":1100000,"confidence":"low","basis":"2026-06 表「不低于 110 万」；但另一份表称 150 万 → 该段方差很大"},{"level":90,"power":1800000,"confidence":"low","basis":"2026-06 表「不低于 180 万」；旧表 150~200 万，居中"},{"level":95,"power":2100000,"confidence":"low","basis":"2026-06 表「不低于 210 万」"},{"level":100,"power":2500000,"confidence":"low","basis":"2026-06 表「不低于 250 万」；旧表 240~300 万，三源一致偏下"},{"level":105,"power":2800000,"confidence":"low","basis":"2026-06 表「不低于 280 万」"},{"level":110,"power":3200000,"confidence":"low","basis":"2026-06 表「不低于 320 万」"},{"level":115,"power":3500000,"confidence":"low","basis":"2026-06 表「不低于 350 万」"},{"level":120,"power":4000000,"confidence":"low","basis":"2026-06 表「不低于 400 万」；与本项目原有单一答主口径完全一致"},{"level":125,"power":4800000,"confidence":"low","basis":"2026-06 表「不低于 480 万」"},{"level":130,"power":5800000,"confidence":"low","basis":"2026-06 表「不低于 580 万」（原 620 万偏高）"},{"level":135,"power":7400000,"confidence":"low","basis":"2026-06 表「不低于 740 万」"},{"level":140,"power":9500000,"confidence":"low","basis":"2026-06 表「不低于 950 万」；与玩家自述「141 级起码 950 万」一致"},{"level":145,"power":11500000,"confidence":"low","basis":"2026-06 表「不低于 1150 万」"},{"level":150,"power":14000000,"confidence":"low","basis":"2026-06 表「不低于 1400 万」（原 3000 万是**团本通关门槛**，不是达标线）"},{"level":155,"power":16000000,"confidence":"low","basis":"2026-06 表「不低于 1600 万」"},{"level":160,"power":20000000,"confidence":"low","basis":"2026-06 表「不低于 2000 万」"},{"level":165,"power":25000000,"confidence":"low","basis":"2026-06 表「不低于 2500 万」"},{"level":170,"power":30000000,"confidence":"low","basis":"2026-06 表「不低于 3000 万」；★ 自 2026-09-10 起 170 已不是等级上限"},{"level":175,"power":35000000,"confidence":"unverified","basis":"**插值**：165→2500 万、170→3000 万，按每 5 级 +500 万外推 → 3500 万。无任何独立来源。"}],"raidRequirement":{"160":{"min":30000000,"max":46000000,"note":"160 级团本「轮墓边狱」实测队伍保底 3000 万、最高 4600 万","sourceIds":["sohu_160raid"]},"distinction":"「160 级达标 2000 万」≠「160 级团本能打」。前者是养成都到位的水位线，后者是要真的通关，队伍实际门槛在 3000~4600 万。**此前本表把两者混为一谈，导致 150 级被错标为 3000 万。**"},"sourceCaveats":["「这是正常一个月超玩家的标准，月卡玩家在原有的基础上加五万，零克加三万，不包含八十级以下。」","「如果你能达到这个标准，在每天保持活跃的情况下，本服前二十五问题不大。」","⚠ 上述两句为原视频自述，**未经验证**；且「月卡加五万/零氪加三万」的表述含义不明（可能是「调低」之误），仅照录备查。"],"tolerance":500000,"toleranceNote":"±50 万容差在 140 级以上明显不成立（该段跨度已达数千万），仅适用于 120 级以下。","crossCheck":["133 级 636 万 → 被判\"合格\"","132 级 753 万 → 战区 81 名 / 本服第二","142 级 750 万 → 明显偏废（说明 140+ 分档陡峭）","141 级 600 万 → 严重不达标","150 级 1000 万 → \"打 150 本一直被踢\"","160 级团本实测队伍 → 保底 3000 万、最高 4600 万","一位 2018 年月卡党 → 2026 年 3100 万"],"confidence":"low","sourceIds":["qq_standard"],"note":"⚠ 本表只能当量级参考：高段多为民工估算且已过时（游戏已开 160 级），低段（50~110）现已获第二份社区表印证量级（50万@50级 … 320万@110级），但**那份表的原始视频链接无法打开**（见下），只能算「社区口径趋于一致」，不能算严谨双源。社区实际上更认「本服排名分位」而非绝对战力阈值。请以游戏内实际体验为准，不要把本表当达标硬线。","independentSourceWarning":"120/130/140 三段的佐证全部来自同一个答主引用同一张网图 —— 实际独立来源数 = 1，不是 3。50~110 段新增的第二份表，其出处是抖音分享短链；实测 8 条短链全部返回**同一个 72914 字节的 JS 挑战页**，无法读取任何内容 → **引用不可核对**，只能按「社区口径一致」降格采信。","zeroGachaAdjust":"零氪/月卡玩家可在此基础上下调约 5%~10%（来源自述，未验证，仅作弹性参考）。"},"resourceIncome":{"gold":{"officialDeltas":{"quote1":"每日40/80/100点活跃度宝箱中的金币奖励从10/20/30，共60金币，升级为15/30/45，共90金币，其他奖励不变。","quote2":"升级大福袋每日奖励：每日100金币调整为150金币。","effect":{"activityChest":30,"bigFortuneBag":50},"effectiveAt":{"activityChest":"2026-09-10 停机更新后","bigFortuneBag":"2026-10-05 05:00"},"note":"活跃度宝箱是**所有人都有**的（零氪 +30/天）；大福袋是付费体系（≈月卡，+50/天）。所以：零氪 400 → **430**；月卡 550 → **630**（+30 活跃度 +50 福袋）。","confidence":"high","sourceIds":["official_20260910"]},"freeToPlay":430,"freeToPlayRange":[360,540],"monthlyCard":630,"monthlyCardRange":[560,720],"prevFreeToPlay":400,"prevMonthlyCard":550,"unit":"金币/天","confidence":"medium","note":"零氪约 430/天（原估 400 + 官方确认的活跃度宝箱 +30）；月卡约 630/天（再 + 大福袋 100→150 的 +50）。基线 400/550 来自 4 源互证（2025-2026 各站），增量 +30/+50 来自**官方原文**，两者可信度不同：增量是硬的，基线是估的，所以区间仍给得较宽。","sourceIds":["game9_income","zol_income","official_20260910"]},"copper":{"min":300000,"max":360000,"unit":"铜币/天","confidence":"low","note":"⚠ 仍无一手「逐项加总」明细贴。2026-10-18 新找到一条**官方**锚点（腾讯官网 2016-03）：「每天可免费招财 1 次……连续 10 次招财可获得大概 14 万多的铜币，再加上招财礼盒的奖励，差不多有 23 万铜币」 → 仅【招财】一项即 ≈23 万/天；再叠加丰饶之间赏金 3 次、积分赛每日 9 点段位发放、生存挑战 15 据点、组织荣耀礼包等，30~36 万/天在量级上说得通，但仍非确证。另有一条 2020 年明细帖称「丰饶之间单项即 46 万/天」，与官方口径差距过大，本项存疑。","anchors":[{"item":"招财 10 次（含礼盒）","amount":230000,"at":2016,"sourceId":"hyrz_daily_2016"},{"item":"招财 10 次（纯招财，不含礼盒）","amount":140000,"at":2016,"sourceId":"hyrz_daily_2016"},{"item":"奖励中心单个任务下限","amount":1000,"unit":"铜币/任务","at":2016,"sourceId":"hyrz_daily_2016"}],"sourceIds":["hyrz_daily_2016"]},"stamina":{"natural":288,"withRamen":460,"unit":"体力/天","confidence":"medium","note":"硬机制：5 分钟恢复 1 点、上限 200 → 自然恢复 288/天；加一乐拉面 3 次（约 150）→ 约 460/天。"},"reputation":{"note":"小队突袭前 3 次（150 金）得 1260 声望 + 300 忍玉/次；免费次数仅 210 声望 + 50 忍玉 → 3 倍差","confidence":"medium","sourceIds":["hyrz_official"]},"confidence":"medium","sourceIds":["game9_income","zol_income","hyrz_official"]},"priorityOrder":{"overall":["装备","饰品","通灵","神器（前期）"],"notes":["装备/饰品 > 通灵 > 神器（前期）—— 多来源一致","神器内部三段式：70 → 140 → 280，白牙后收益腰斩","通灵：先全普通通灵 +4 → 5 阶 → 攻击型 15 阶","勾玉：先全 4 级（\"3 级两颗 > 1 颗 4 级\"）","忍者收集战力 > 升星战力（官方 2016 明确\"不要为升星刷碎片\"）"],"confidence":"medium","sourceIds":["whalegame_2025","xlsx_base"]},"inflation":{"kind":"透支型（机会成本）","notAttributeBased":true,"disclaimer":"「虚战」按视频作者定义：**不计后果透支潜力换取战力** —— 指资源投向的机会成本，与「堆暴击 / 堆生命」无关（作者已明确否定该说法）。社区另有「属性溢出型虚战」（暴击超实战上限）说法，是另一个概念，本工具不采用。","thresholds":{"overConcentratedShare":0.25,"underDevelopedShare":0.03,"imbalanceRatio":5,"diminishingRatio":0.3},"typicalExamples":["硬拉绿瓶堆饰品等级（绿水收益递减后仍继续堆）","声望礼包买到后 2 次（声望边际收益已很低）","拉忍尘高强忍具（无保护符/祝福券硬强）","赌运气强化饰品不用保护符，反而亏掉更多材料"],"confidence":"medium","sourceIds":["bili_nangong","xlsx_base"]},"cautions":["官方从未公布战力公式。下表所有系数都是玩家反推的，不是官方数据。","🔍 **官方公告已定向检索过（2026-10-18），结论写在这里免得你重复劳动**：①**属性攻防 6 / 10 官方从未公布过**，只能是玩家反推 —— 别再期待找到官方出处；②2016-08-30 那次「抗暴↓暴击↑」找到了接近原文的表述，但官方**只说方向、没给数字**，而且原文明确「**实际战斗效果没有任何变化**」，改的只是战力显示口径，不代表抗暴变弱；③勾玉 / 通灵 / 饰品的上线公告超出接口可检索范围（2016 年老公告无法枚举），未找到。详见 officialAudit。","⚠ 暴击伤害倍率有冲突说法：2016 年资料称 **1.5 倍**，抖音实测举例里大字 100→暴击 120 即 **1.2 倍**。两者差 25%，未采信任一方；用到暴击收益时请说明这是未定值。","⚠ 「洗练 1% 暴击 = 10 战力、1% 血攻防抗 = 5 战力」是**洗练百分比**口径，与「每点属性 → 战力」不同量纲，**不要和 attrWeights 混用**。另：竞技场不计首饰暴击加成。","系数置信度分级：生命 1 / 攻击 3.5 / 暴击 6 = 高（多源独立一致，且有算式验算）；防御 11.6 / 抗暴 10 = 中（防御有「150×11.6=1740」游戏内反查闭环；抗暴有官方改动日志）；**属性攻击 6 / 属性防御 10 = 中（2026-10-18 首次找到明确来源，且该来源把另外五个系数全说对了）**。","防御系数存在 11.6 / 11.7 / 12 三个口径。三者其实都指向 ≈11.66（截断与进位差别）。本表取 11.6 —— 它是唯一有游戏内验证的版本。**不要用 12（会高估 3.4%）**。","2016-08-30 官方调整过系数（下调抗暴、上调暴击），所以早期资料里的抗暴 17.40 / 暴击 5.25 不能说它错，那是调整前的值。","板块划分与成长效率来自 B站 UP 主「无花果酱」的个人实测模板，不是官方数据。","「虚战」社区有**三套口径**，本项目全部保留、不替任何一方站边（详见 communityConflicts）：①**透支潜力**（B站 BV18KNXzoE4z）：资源机会成本，与堆哪种属性无关，作者明确否认「堆暴击=虚战」；②**暴击溢出**（抖音《战力提升之战力篇》）：暴击率满 100% 后继续堆即虚战，经验规则「暴击≈攻击的 10%」；③**按属性分型**（本轮资料）：暴击超「2.35×对方抗暴+5万」、或纯堆防御（系数高但边际递减）、或纯堆生命（1:1 效率最低）。三者不在同一层次：①讲资源机会成本，②③讲属性是否溢出实战需求 —— **同一笔投入可以同时违反两者**。","社区流传的「各系统战力占比 %」并不存在：官方从未公布，社区也无人做出全系统拆解。占比只针对你自己面板内部比较。","生命/攻击/防御 的战力计算需乘「忍者收集加成系数」；暴击/抗暴不享受该加成。默认按 0 会**低估**战力。","抗魔值不在战力求和内 —— 官方只把它定位为秘境掉落门槛（这条是推断，无明文断言）。","⚠ AI 内容农场黑名单：guotao606 / liutao454 / huayan226 / zhoujing757 / zhenglan979 / 921syw / 900xz / lwyysz 等。这些站点的精确数字只可当候选范围。另需防 9game 部分栏目的假系统攻略、zol 的机翻洗稿、pd.qq.com 的攻略社搬运（非官方）。","⚠ 同类陷阱：2016 年有一份魔方网稿件被 8+ 个站点逐字转载（连举例数字都一样），看似多来源实为 1 个来源。","战力标准表（50~175 级）已替换为 2026-06 的完整单份表（单调递增、覆盖 115/95 等原先缺失段）。★ **「达标线」≠「团本通关门槛」**：160 级达标 2000 万，但 160 团本实测队伍要 3000~4600 万。此前把两者混为一谈，导致 150 级被错标为 3000 万。**全表仍是社区口径，只当量级参考**。","资源日收益：体力已修正为约 460/天（原写 1200 是数量级错误）；金币零氪约 400/天；**铜币日收益未确证**。","以下数字已被撤下，因为它们来源不可信：「全通灵 +4 → +19008 战力」（唯一来源是 AI 农场且文内自相矛盾）、「勾玉全套 +2.17 万战力」（2016 年 54 孔样本，基数已失效）。相关**策略结论**仍可用，但**具体数字不要当真**。","⚠ 属性攻防：本工具把它当普通属性按 × 6 / × 10 折算战力，**没有实现真实伤害模型**。真实规则是「只取最高那一系 → 减去对方该系属防 → ÷20 换属性百分比伤害」，再用大字伤害 ×(1+百分比) 算总伤害。要算真实伤害请按 elemMechanics.damageFormula 手算。","忍具换装铁律：必须保证身上仍有 **4 件同一套装**，否则套装效果断档、战力反而下降（4+2 结构）。藏管激活四件后，套装效果可在藏管里换，不必动身上忍具、不会掉战力。","🚨 **跨游戏污染警告**：`huoyin.qq.com` 也在 qq.com 下、标题也写「火影忍者官方网站-腾讯游戏」，但它是**《火影忍者OL》端游/页游**（回合制），不是本作手游。它那套「五行查克拉」公式（含出手位/先攻/控制/忍术/抗性/查克拉传递）**不能用在手游上**。只有 `hyrz.qq.com` 才是手游官网。看到「出手位」「先攻」「忍术」「抗性」等词 → 立即判定为 OL 资料。","属性攻防两条证据线要分清：手游是「单一最高系，线性减法后 ÷20」（已用两个真实账号的实战伤害验证）；OL 是「(1+属攻-属防) 再按技能是否含某属性加权平均」（官方公告）。两者形似实不同，**OL 公告不能给手游的 ÷20 背书**。详见 elemCrossCheck。","版本现状（2026-10）：等级上限 **175**（2026-09-10 大版本，**官方原文已确认**），装备进阶上限 **89 阶**；最高团本 160 级「轮墓边狱」，其门槛 3000~4600 万仍高于 160 级达标线 2000 万。","🔄 **等级上限可能是 175 了（2026-09 大版本），但未确证**：目前只有一条 B站视频标题这么说；官方公告页是 JS 模板（HTML 里查不到正文）、小米转载纯图片、App Store 更新说明也没提。本项目仍按 170 出表。**若你已超过 170 级，请直接告诉我当前上限，我按新上限重算达标线。**","神器忍玉消耗**可以自己算**，别再信二手表：10 忍玉 = 5 经验、初始 130 经验、每级 +30（等差）。据此 70/140/280 级分别是 16.31 万 / 62.02 万 / 241.64 万忍玉（上一轮流传的「前期 8.8 万」是错的）。","秘卷「1 碎片 ≈ 9.5 战力」**只在 1→10 级成立**；到 60 级附近掉到 0.63 战力/碎片（差 15 倍），不能拿来估算满级成本。另「秘卷上限 30 级（2018 官方）」与「60 级（2026 说法）」是版本差异，不是谁错。","✅ **官方原文其实读得到（这条纠正了我之前的错误判断）**：详情页是 Vue 模板，直接抓 HTML 只有 `{{detail.sTitle}}` 占位符，所以我一度以为「官方原文引用不了」。真正的正文在接口里：`apps.game.qq.com/wmp/v3.1/public/searchNews.php?p0=25&p1=1&source=web_ingame&id=<aid>`。本仓库已封装成 `node tools/fetch-official.mjs --aid <id>`。**现在凡是能定位到 aid 的事，都该去读原文再下结论。**（旧公告页 GBK 乱码那条仍然成立，别用 /webplat/ 那个老路径。）","饰品阶数已澄清：**「曙光」是 150 级的旧阶，「云迹」才是当前最高（165 级）**，别再以为曙光在云迹之上。强化上限：130 级起 +35（100~120 级为 +30）。","秘卷：上限 30 级，但**技能效果 10 级就封顶**，升到 30 只是为了战力；1→10 级共需 325 碎片。","勾玉有两处数据至今不可靠：①**总孔位数**（2016 说 54 孔、2024 说每装备 6/每通灵 5，两者互斥）；②**六色↔属性映射**（同一篇文章内自相矛盾，绿/蓝各出现两次且定义不同）→ 本项目不采任何一版。","神器轮回石「白牙前 30 / 白牙后 60 个每次」现已有原文算式支撑（300 提炼 10 次 vs 600 提炼 10 次），不再是单纯的流传值。"]}
  var api = factory(DATA)
  if (typeof module === 'object' && module.exports) { module.exports = api }
  else if (typeof define === 'function' && define.amd) { define([], function () { return api }) }
  else { root.NarutoPower = api }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function (DATA) {
/**
 * 火影忍者手游 战力工作台 · 可移植核心（Portable Core）
 *
 * 设计目标：
 *  1. **零依赖、零网络、零 DOM** —— 纯函数，可在浏览器 / Node / 任何 JS 运行时使用
 *  2. **ES2015 语法上限** —— 不用 `?.` `??` `Object.fromEntries` `structuredClone` 等新特性，
 *     以覆盖 Chrome 51+ / Safari 10+ / Edge 15+ / iOS 10+ / 各国内套壳浏览器
 *  3. **不信任任何输入** —— 所有数值经 sanitizeNumber，所有结构经 validate 归一化
 *  4. **缺数据不编造** —— 未填 = null / filled:false，绝不填 0 冒充真实值
 *
 * 本文件由 tools/build-portable.mjs 包装成 UMD，并被 CLI / 单文件 HTML 复用。
 * 注意：本文件本身**没有** import/export —— 它是一个工厂函数源码，由打包器包裹。
 */

function createCore(DATA) {
  'use strict';

  if (!DATA || typeof DATA !== 'object') {
    throw new TypeError('createCore: 数据对象缺失');
  }

  var CORE_VERSION = '1.0.0'
  var SCHEMA_VERSION = 2

  // ───────────────────────────────── 基础工具（全部防御式）

  /** 把任意输入变成有限数字；失败返回 fallback（默认 null，绝不返回 0 冒充缺数据） */
  function sanitizeNumber(v, fallback) {
    var fb = arguments.length > 1 ? fallback : null
    if (v === null || v === undefined || v === '') return fb
    if (typeof v === 'number') {
      if (!isFinite(v)) return fb
      return v
    }
    if (typeof v === 'string') {
      // 容忍 "1,234"、" 56 "、"56万"（仅识别纯数字与千分位，不做单位换算以免误判）
      var s = v.replace(/[,\s]/g, '').replace(/[+]/g, '')
      if (s === '' || s === '-') return fb
      if (!/^-?\d*\.?\d+$/.test(s)) return fb
      var n = Number(s)
      return isFinite(n) ? n : fb
    }
    if (typeof v === 'boolean') return fb
    return fb
  }

  /** 非负数值；负数按 0 处理并计入告警 */
  function nonNegative(v, warnings, label) {
    var n = sanitizeNumber(v, null)
    if (n === null) return null
    if (n < 0) {
      if (warnings) warnings.push(label + ' 为负数（' + n + '），已按 0 处理')
      return 0
    }
    return n
  }

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
  }

  function safeKeys(o) {
    if (!isPlainObject(o)) return []
    try {
      return Object.keys(o)
    } catch (e) {
      return []
    }
  }

  /** 深拷贝（只处理 JSON 安全结构，循环引用直接切断） */
  function deepClone(v, seen) {
    var s = seen || []
    if (v === null || typeof v !== 'object') return v
    for (var i = 0; i < s.length; i++) if (s[i] === v) return null // 切断循环
    s = s.concat([v])
    if (Array.isArray(v)) {
      var arr = []
      for (var j = 0; j < v.length; j++) arr.push(deepClone(v[j], s))
      return arr
    }
    var out = {}
    var keys = safeKeys(v)
    for (var k = 0; k < keys.length; k++) out[keys[k]] = deepClone(v[keys[k]], s)
    return out
  }

  // ───────────────────────────────── 数据视图

  var BOARDS = Array.isArray(DATA.boards) ? DATA.boards.slice() : []
  var ATTRS = Array.isArray(DATA.boardAttrs) ? DATA.boardAttrs.slice() : []
  var ATTR_KEYS = []
  for (var _i = 0; _i < ATTRS.length; _i++) ATTR_KEYS.push(ATTRS[_i].id)

  var WEIGHTS = DATA.attrWeights || {}
  var BONUS = DATA.collectionBonus || { appliesTo: [] }
  var APPLIES = Array.isArray(BONUS.appliesTo) ? BONUS.appliesTo : []
  var THRESH = (DATA.inflation && DATA.inflation.thresholds) || {
    overConcentratedShare: 0.25,
    underDevelopedShare: 0.03,
  }

  function boardMeta(id) {
    for (var i = 0; i < BOARDS.length; i++) if (BOARDS[i].id === id) return BOARDS[i]
    return null
  }

  // ───────────────────────────────── 面板归一化（防脏数据的第一道关）

  /**
   * 把任意输入归一化成内部标准面板。
   * 永不抛错；问题写进 warnings。
   * @returns {{panel:Object, warnings:string[], errors:string[]}}
   */
  function validate(input) {
    var warnings = []
    var errors = []
    var src = isPlainObject(input) ? input : {}
    if (!isPlainObject(input)) errors.push('输入不是对象，已按空面板处理')

    var level = sanitizeNumber(src.level, null)
    if (level !== null && (level < 1 || level > 300)) {
      warnings.push('等级 ' + level + ' 超出合理范围 1~300，已忽略')
      level = null
    }

    var targetPower = sanitizeNumber(src.targetPower, null)
    if (targetPower !== null && targetPower < 0) {
      warnings.push('目标战力为负，已忽略')
      targetPower = null
    }
    if (targetPower !== null && targetPower > 1e12) {
      warnings.push('目标战力过大（>1 万亿），可能是误填，已忽略')
      targetPower = null
    }

    var cbSrc = isPlainObject(src.collectionBonus) ? src.collectionBonus : {}
    var collectionBonus = {}
    for (var a = 0; a < ATTR_KEYS.length; a++) {
      var ak = ATTR_KEYS[a]
      if (APPLIES.indexOf(ak) < 0) continue
      var cv = nonNegative(cbSrc[ak], warnings, '收集加成 ' + ak)
      // 收集加成按「百分比」录入，内部统一存小数；>1 视为用户填了百分数
      if (cv !== null) {
        if (cv > 1 && cv <= 500) cv = cv / 100
        collectionBonus[ak] = cv
      }
    }

    var boardsSrc = isPlainObject(src.boards) ? src.boards : {}
    if (src.boards !== undefined && !isPlainObject(src.boards)) {
      errors.push('boards 不是对象，已忽略')
    }
    var boards = {}
    var unknownBoardIds = []
    var bkeys = safeKeys(boardsSrc)
    for (var bi = 0; bi < bkeys.length; bi++) {
      if (!boardMeta(bkeys[bi])) unknownBoardIds.push(bkeys[bi])
    }
    if (unknownBoardIds.length) {
      warnings.push('忽略未知板块 id：' + unknownBoardIds.join(', '))
    }

    for (var m = 0; m < BOARDS.length; m++) {
      var bid = BOARDS[m].id
      var raw = boardsSrc[bid]
      if (!isPlainObject(raw)) continue
      var clean = {}
      var any = false
      for (var n = 0; n < ATTR_KEYS.length; n++) {
        var key = ATTR_KEYS[n]
        var val = nonNegative(raw[key], warnings, BOARDS[m].name + '.' + key)
        if (val !== null) {
          clean[key] = val
          if (val > 0) any = true
        }
      }
      if (any) boards[bid] = clean
      else if (safeKeys(raw).length) {
        // 有输入但全为 0 → 视为未填，避免"填了 0"被当成"已知为零"
        warnings.push('板块「' + BOARDS[m].name + '」所有属性均为 0，视为未填')
      }
    }

    var panel = {
      schemaVersion: SCHEMA_VERSION,
      level: level,
      targetPower: targetPower,
      collectionBonus: collectionBonus,
      boards: boards,
    }
    var meta = isPlainObject(src.meta) ? src.meta : {}
    if (meta.note && typeof meta.note === 'string') panel.meta = { note: meta.note.slice(0, 500) }
    return { panel: panel, warnings: warnings, errors: errors }
  }

  // ───────────────────────────────── 战力计算

  function boardPower(attrs, bonus) {
    if (!isPlainObject(attrs)) return 0
    var total = 0
    for (var i = 0; i < ATTR_KEYS.length; i++) {
      var k = ATTR_KEYS[i]
      var v = sanitizeNumber(attrs[k], null)
      if (v === null || v <= 0) continue
      var w = sanitizeNumber(WEIGHTS[k], 0)
      if (!w) continue
      var cb = 1
      if (APPLIES.indexOf(k) >= 0) {
        var b = sanitizeNumber(isPlainObject(bonus) ? bonus[k] : null, 0)
        cb = 1 + (b || 0)
        if (!isFinite(cb) || cb < 0) cb = 1
      }
      var add = v * w * cb
      if (isFinite(add) && add > 0) total += add
    }
    return total
  }

  /**
   * 计算全板块战力构成。
   * @returns {{boards:Array, totalPower:number, filledCount:number, totalBoards:number,
   *            topBoards:Array, weakBoards:Array, unfilled:Array, notes:Array, incomplete:boolean}}
   */
  function compute(input) {
    var v = validate(input)
    var panel = v.panel
    var bonus = panel.collectionBonus
    var rows = []
    var total = 0
    var filled = 0

    for (var i = 0; i < BOARDS.length; i++) {
      var b = BOARDS[i]
      var attrs = panel.boards[b.id]
      var isFilled = !!attrs && safeKeys(attrs).length > 0
      var power = isFilled ? boardPower(attrs, bonus) : 0
      if (!isFinite(power) || power < 0) power = 0
      if (isFilled) filled++
      total += power
      rows.push({
        boardId: b.id,
        boardName: b.name,
        power: Math.round(power),
        filled: isFilled,
        share: null,
      })
    }

    if (!isFinite(total) || total < 0) total = 0
    for (var j = 0; j < rows.length; j++) {
      rows[j].share = total > 0 && rows[j].filled ? rows[j].power / total : null
    }

    var filledRows = []
    for (var f = 0; f < rows.length; f++) if (rows[f].filled) filledRows.push(rows[f])
    filledRows.sort(function (x, y) {
      return y.power - x.power
    })

    var unfilled = []
    for (var u = 0; u < rows.length; u++) if (!rows[u].filled) unfilled.push(rows[u].boardName)

    return {
      boards: rows,
      totalPower: Math.round(total),
      filledCount: filled,
      totalBoards: BOARDS.length,
      topBoards: filledRows.slice(0, 3),
      weakBoards: filledRows.slice(-3).reverse(),
      unfilled: unfilled,
      incomplete: filled < BOARDS.length,
      level: panel.level,
      targetPower: panel.targetPower,
      collectionBonus: bonus,
      warnings: v.warnings,
      errors: v.errors,
    }
  }

  // ───────────────────────────────── 虚战诊断

  function inflation(comp) {
    if (!comp || !Array.isArray(comp.boards)) {
      return { inflationScore: null, level: '数据不足', reasons: ['缺少计算结果'], suggestions: [], confidence: 'unverified' }
    }
    var shares = []
    for (var i = 0; i < comp.boards.length; i++) {
      var b = comp.boards[i]
      if (b.filled && b.share !== null && isFinite(b.share)) shares.push(b.share)
    }
    if (shares.length < 2) {
      return {
        inflationScore: null,
        level: '数据不足',
        reasons: ['已填写板块少于 2 个，无法判断分布是否失衡（不做猜测）。'],
        suggestions: ['至少填 3~4 个板块后再看虚战诊断。'],
        confidence: 'unverified',
      }
    }

    var n = shares.length
    var avg = 1 / n
    var dev = 0
    for (var d = 0; d < shares.length; d++) dev += Math.abs(shares[d] - avg)
    var denom = 2 * (1 - avg)
    var imbalance = denom > 1e-9 ? dev / denom : 0
    if (!isFinite(imbalance)) imbalance = 0
    imbalance = Math.max(0, Math.min(1, imbalance))

    var maxShare = Math.max.apply(Math, shares)
    var threshold = sanitizeNumber(THRESH.overConcentratedShare, 0.25)
    var over = threshold < 1 ? Math.max(0, (maxShare - threshold) / (1 - threshold)) : 0
    var score = Math.round(Math.min(100, 100 * (0.7 * imbalance + 0.3 * over)))
    if (!isFinite(score)) score = 0
    score = Math.max(0, Math.min(100, score))

    var level = score >= 60 ? '虚战仔' : score >= 35 ? '偏虚' : score >= 15 ? '均衡' : '实战型'
    var reasons = [
      '分布不均度 ' + Math.round(imbalance * 100) + '/100（' + n + ' 个已填板块平均占比 ' +
        (avg * 100).toFixed(1) + '%，最高 ' + (maxShare * 100).toFixed(1) + '%）。',
      '综合分 ' + score + ' = 0.7 × 不均度 + 0.3 × 集中度；集中度指最高占比超出阈值 ' +
        (threshold * 100).toFixed(0) + '% 的部分。',
    ]
    if (maxShare > threshold) {
      reasons.push('单个板块占比 ' + (maxShare * 100).toFixed(1) + '% 超过集中阈值 ' + (threshold * 100).toFixed(0) + '%。')
    }

    return {
      inflationScore: score,
      level: level,
      reasons: reasons,
      suggestions: [
        '这是「资源过于集中」的提示，不是「属性种类错了」——虚战有两种社区口径，详见数据层 communityConflicts。',
        score >= 35 ? '建议把一部分资源转投占比最低的几个板块，先把基础铺开。' : '结构较均衡，重点转向单位资源战力更高的投入。',
      ],
      confidence: 'medium',
    }
  }

  // ───────────────────────────────── 目标倒推

  function nearestStandard(level) {
    var std = (DATA.powerStandards && DATA.powerStandards.table) || []
    var lv = sanitizeNumber(level, null)
    if (lv === null || !std.length) return null
    var best = null
    var bestDiff = Infinity
    for (var i = 0; i < std.length; i++) {
      var diff = Math.abs(std[i].level - lv)
      if (diff < bestDiff) {
        bestDiff = diff
        best = std[i]
      }
    }
    return best
  }

  /**
   * 按目标战力倒推：缺口、结构建议、按日收益估算天数。
   * 明确拒绝在数据不足时给"多少天"的假精确值。
   */
  function planTarget(opts) {
    var o = isPlainObject(opts) ? opts : {}
    var currentPower = sanitizeNumber(o.currentPower, 0) || 0
    var targetPower = sanitizeNumber(o.targetPower, null)
    var level = sanitizeNumber(o.level, null)
    var perDay = sanitizeNumber(o.incomePerDay, null)
    var std = nearestStandard(level)

    var out = {
      level: level,
      currentPower: Math.round(currentPower),
      targetPower: targetPower === null ? null : Math.round(targetPower),
      gap: null,
      standard: std ? { level: std.level, power: std.power, confidence: std.confidence, basis: std.basis } : null,
      vsStandard: null,
      daysNeeded: null,
      daysNote: null,
      directions: [],
      caveats: [],
    }

    if (targetPower !== null) {
      out.gap = Math.max(0, Math.round(targetPower - currentPower))
    }

    if (std && std.power > 0) {
      var ratio = currentPower / std.power
      out.vsStandard = ratio
      out.vsStandardLabel =
        ratio >= 1 ? '达标' : ratio >= 0.8 ? '略低' : ratio >= 0.5 ? '偏低' : '明显偏低'
    }

    if (perDay !== null && perDay > 0 && out.gap !== null) {
      var days = Math.ceil(out.gap / perDay)
      if (isFinite(days) && days >= 0 && days < 100000) {
        out.daysNeeded = days
        out.daysNote =
          '按每日 +' + Math.round(perDay) + ' 战力线性外推；实际会被递减收益、活动与运气打断，**只当量级参考**。'
      } else {
        out.daysNote = '日收益异常，未估算天数。'
      }
    } else if (out.gap !== null) {
      out.daysNote = '未提供「每日战力收益」，所以**不估算天数**（拒绝编造）。'
    }

    // 方向建议：基于已填板块的占比，找占比最低的几块
    if (o.computed && Array.isArray(o.computed.boards)) {
      var filled = []
      for (var i = 0; i < o.computed.boards.length; i++) {
        var b = o.computed.boards[i]
        if (b.filled && b.share !== null) filled.push(b)
      }
      filled.sort(function (x, y) {
        return x.share - y.share
      })
      for (var k = 0; k < Math.min(3, filled.length); k++) {
        out.directions.push({
          boardId: filled[k].boardId,
          boardName: filled[k].boardName,
          share: filled[k].share,
          power: filled[k].power,
          why: '当前占比 ' + (filled[k].share * 100).toFixed(1) + '%，属于已填板块里最薄弱的一档',
        })
      }
      if (filled.length) {
        out.caveats.push('占比只在你自己的面板内部可比，不同账号之间不可直接比占比。')
      }
    }

    if (out.gap !== null && out.gap === 0) {
      out.caveats.push('当前战力已达到或超过目标，无需追赶；若要继续，请先确认目标是否该上调。')
    }
    if (std && std.confidence === 'low') {
      out.caveats.push('「' + std.level + ' 级达标 ' + fmtPower(std.power) + '」是社区口径、置信度低，不要当硬指标。')
    }
    out.caveats.push('战力达标线 ≠ 团本通关门槛：后者要高得多（如 160 级团本实测队伍 3000~4600 万）。')
    return out
  }

  // ───────────────────────────────── 格式化

  function fmtPower(n) {
    var v = sanitizeNumber(n, null)
    if (v === null) return '—'
    var abs = Math.abs(v)
    if (abs >= 1e8) return (v / 1e8).toFixed(2) + ' 亿'
    if (abs >= 1e4) return (v / 1e4).toFixed(1) + ' 万'
    return String(Math.round(v))
  }

  function fmtPct(x, digits) {
    var v = sanitizeNumber(x, null)
    if (v === null) return '—'
    return (v * 100).toFixed(digits === undefined ? 1 : digits) + '%'
  }

  // ───────────────────────────────── 导入 / 导出（带版本迁移）

  function exportPanel(input) {
    var v = validate(input)
    return {
      format: 'naruto-workbench-panel',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      dataVersion: DATA.version || null,
      coreVersion: CORE_VERSION,
      panel: v.panel,
    }
  }

  /**
   * 导入：接受 ①本工具导出的信封 ②裸面板对象 ③任何带 boards 的对象。
   * 永不抛错。
   */
  function importPanel(raw) {
    var warnings = []
    var payload = raw
    if (typeof raw === 'string') {
      try {
        payload = JSON.parse(raw)
      } catch (e) {
        return { ok: false, panel: null, warnings: ['JSON 解析失败：' + String(e.message).slice(0, 120)] }
      }
    }
    if (!isPlainObject(payload)) {
      return { ok: false, panel: null, warnings: ['导入内容不是对象'] }
    }
    if (payload.format === 'naruto-workbench-panel' && isPlainObject(payload.panel)) {
      var sv = sanitizeNumber(payload.schemaVersion, 1)
      if (sv > SCHEMA_VERSION) {
        warnings.push('文件版本 v' + sv + ' 高于本工具 v' + SCHEMA_VERSION + '，可能丢失部分字段')
      }
      if (payload.dataVersion && DATA.version && payload.dataVersion !== DATA.version) {
        warnings.push('数据版本不同（文件 ' + payload.dataVersion + ' / 当前 ' + DATA.version + '），数值口径可能已变')
      }
      payload = payload.panel
    }
    var v = validate(payload)
    return { ok: true, panel: v.panel, warnings: warnings.concat(v.warnings) }
  }

  // ───────────────────────────────── Agent 提示词（给任何 AI 用，不限 DSH）

  function buildAgentPrompt(input) {
    var comp = compute(input)
    var infl = inflation(comp)
    var plan = planTarget({
      currentPower: comp.totalPower,
      targetPower: comp.targetPower,
      level: comp.level,
      computed: comp,
    })

    var lines = []
    lines.push('你是《火影忍者》手游的战力规划助手。下面是我在战力工作台里填的真实面板，请据此分析。')
    lines.push('')
    lines.push('【硬性要求】')
    lines.push('1. 只用我给的数据和下面附带的数据表；查不到就说查不到，**不要编数字**。')
    lines.push('2. 每个数字都要标来源或置信度。')
    lines.push('3. 注意：属性伤害公式是「只取最高那一系属攻 − 对方该系属防，再 ÷20 = 属性百分比伤害」。')
    lines.push('4. 注意：网上的 huoyin.qq.com 是《火影忍者OL》端游资料，**不能用于本作手游**。')
    lines.push('')
    lines.push('【我的面板】')
    lines.push('- 等级：' + (comp.level === null ? '未填' : comp.level))
    lines.push('- 目标战力：' + (comp.targetPower === null ? '未填' : fmtPower(comp.targetPower)))
    var cb = comp.collectionBonus || {}
    var cbParts = []
    for (var i = 0; i < APPLIES.length; i++) {
      if (cb[APPLIES[i]] !== undefined) cbParts.push(APPLIES[i] + ' ' + fmtPct(cb[APPLIES[i]]))
    }
    lines.push('- 忍者收集加成：' + (cbParts.length ? cbParts.join(' / ') : '未填'))
    lines.push('')
    lines.push('| 板块 | 战力 | 占比 |')
    lines.push('|---|---|---|')
    for (var b = 0; b < comp.boards.length; b++) {
      var row = comp.boards[b]
      if (!row.filled) continue
      lines.push('| ' + row.boardName + ' | ' + fmtPower(row.power) + ' | ' + fmtPct(row.share) + ' |')
    }
    lines.push('| **合计** | **' + fmtPower(comp.totalPower) + '** | 100% |')
    if (comp.unfilled.length) {
      lines.push('')
      lines.push('未填板块（这些**不能当作 0**，只能视为未知）：' + comp.unfilled.join('、'))
    }
    lines.push('')
    lines.push('【工具算出的初步结论】')
    if (plan.standard) {
      lines.push('- ' + plan.standard.level + ' 级社区达标线：' + fmtPower(plan.standard.power) +
        '（置信度 ' + plan.standard.confidence + '）→ 我当前' + (plan.vsStandardLabel || '无法判断'))
    }
    if (plan.gap !== null) lines.push('- 距目标缺口：' + fmtPower(plan.gap))
    lines.push('- 虚战诊断：' + infl.level + (infl.inflationScore === null ? '' : '（失衡度 ' + infl.inflationScore + '/100）'))
    for (var r = 0; r < infl.reasons.length; r++) lines.push('  - ' + infl.reasons[r])
    if (plan.directions.length) {
      lines.push('- 相对最薄弱的板块：')
      for (var d = 0; d < plan.directions.length; d++) {
        lines.push('  - ' + plan.directions[d].boardName + '（占比 ' + fmtPct(plan.directions[d].share) + '）')
      }
    }
    lines.push('')
    lines.push('【请输出】')
    lines.push('1) 我的面板结构问题（结合占比与达标线）')
    lines.push('2) 按性价比排序的提升方向，并说明每条的**依据与置信度**')
    lines.push('3) 需要我补测哪些数据才能给出更准的结论')
    lines.push('4) 明确列出你**无法确定**的部分')

    return lines.join('\n')
  }

  // ───────────────────────────────── 对外 API

  return {
    CORE_VERSION: CORE_VERSION,
    SCHEMA_VERSION: SCHEMA_VERSION,
    DATA: DATA,
    BOARDS: BOARDS,
    ATTRS: ATTRS,
    ATTR_KEYS: ATTR_KEYS,
    WEIGHTS: WEIGHTS,
    sanitizeNumber: sanitizeNumber,
    isPlainObject: isPlainObject,
    deepClone: deepClone,
    validate: validate,
    boardPower: boardPower,
    compute: compute,
    inflation: inflation,
    planTarget: planTarget,
    nearestStandard: nearestStandard,
    fmtPower: fmtPower,
    fmtPct: fmtPct,
    exportPanel: exportPanel,
    importPanel: importPanel,
    buildAgentPrompt: buildAgentPrompt,
    cautions: DATA.cautions || [],
    sources: DATA.sources || {},
  }
}

  return createCore(DATA)
})
