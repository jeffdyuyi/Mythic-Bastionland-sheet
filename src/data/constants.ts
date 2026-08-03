export const CHARACTER_STARTS = [
    { id: 'adventurer', name: '冒险者 (Adventurer)', virtueFormula: '1d12+1d6', gdFormula: '1d6' },
    { id: 'courtier', name: '廷臣 (Courtier)', virtueFormula: '1d12+6', gdFormula: '2d6' },
    { id: 'ruler', name: '统治者 (Ruler)', virtueFormula: '1d12+6', gdFormula: '1d6+6' }
];

export const CHARACTER_SCOPES = CHARACTER_STARTS;

export const BASE_GEAR = [
    "一把匕首 (d6)",
    "火把",
    "绳索",
    "干粮",
    "露营用具"
];

export const BASE_SKILLS = [
    "猛击",
    "专注",
    "招架"
];

export const KNIGHT_OATH = "探寻神话、尊崇先知、保护国度";

// 侍从额外装备 1d6
export const SQUIRE_EXTRA_GEAR = {
    1: "短棒（d8 沉重）",
    2: "斧子（d8 沉重）",
    3: "短柄斧（d6）",
    4: "短弓（d6 长）",
    5: "盾牌（d4，A1护甲）",
    6: "三把标枪（d6）"
};

// 伤痕表 (1d12)
export const SCARS_TABLE = {
    1: "压力—幸得逃脱。失去 d6 精神。",
    2: "毁容—永久的伤疤。投 1d6 (1:眼睛 2:脸颊 3:脖颈 4:躯干 5:鼻子 6:下颚)。如果你的最大 GD 为 2 或更低，将其提升 d6。",
    3: "重创—鲜血淋漓。失去 d6 活力。",
    4: "击晕—痛楚模糊了感官。失去 d6 敏锐。如果你的最大 GD 为 4 或更低，将其提升 d6。",
    5: "破裂—内脏刺穿，纠成一团。失去 2d6 活力。",
    6: "拉伤—血肉自骨头上撕离。当你被包扎时，如果你的最大 GD 为 6 或更低，将其提升 d6。",
    7: "震荡—重击使头脑麻木。失去 2d6 敏锐。",
    8: "撕裂—一阵暴力扭打之后，有什么被取走了。投 1d6 (1:鼻子 2:耳朵 3:手指 4:拇指 5:眼睛 6:一块头皮)。当你被包扎时，如果你的最大 GD 为 8 或更低，将其提升 d6。",
    9: "剧痛—因暴虐的击打而崩溃。失去 2d6 精神。",
    10: "断肢—肢体断裂，或再无法使用。投 1d6 (1-2:腿 3-4:持盾手 5-6:持剑手)。等到下个季节，你会获得假肢或逐渐适应，并且那时如果你的最大 GD 为 10 或更低，将其提升 d6。",
    11: "毁灭—死亡如影随形。如果你在当前季节中获得一个致命伤，你将死去。",
    12: "羞辱—无比惨痛的一击。当你完成复仇之时，如果你的最大 GD 为 12 或更低，将其提升 d6。"
};

export const QUICK_ROLL_TABLES = {
    luckRolls: {
        name: "幸运骰 (Luck Rolls)",
        entries: [{ range: [1, 1], result: "危机：迫在眉睫的危机。" }, { range: [2, 3], result: "问题：潜在的危机。" }, { range: [4, 6], result: "祝福：好的结果。" }]
    },
    advancingTime: {
        name: "时间流逝 (Advancing Time)",
        entries: [{ range: [1, 1], result: "现在立刻跳转一个季节或时代。" }, { range: [2, 3], result: "下次聚会后，跳转一个季节或时代。" }, { range: [4, 6], result: "继续当前这个季节或时代。" }]
    },
    unresolvedSituations: {
        name: "未解决的事件 (赛季/时代推进时)",
        entries: [{ range: [1, 1], result: "状况变得糟糕透顶。" }, { range: [2, 3], result: "状况恶化了。" }, { range: [4, 6], result: "状况好转了。" }]
    },
    wildernessRoll: {
        name: "荒野检定 (在荒野结束时段时)",
        entries: [{ range: [1, 1], result: "遭遇国度中一个随机神话的下一个预兆。" }, { range: [2, 3], result: "遭遇最近一处神话的下一个预兆。" }, { range: [4, 6], result: "遭遇当前六角格的地标。否则无事发生。" }]
    },
    travellingBlind: {
        name: "盲目旅行 (Travelling Blind)",
        entries: [{ range: [1, 1], result: "原地打转回到开始的地方。" }, { range: [2, 3], result: "向左（2）或向右（3）偏离。" }, { range: [4, 6], result: "如计划般顺利前行。" }]
    },
    direWeather: {
        name: "恶劣天气 (Dire Weather)",
        entries: [{ range: [1, 1], result: "恶劣天气。你无法离开当前六角格，且无法获得足够睡眠。" }, { range: [2, 3], result: "威胁将至。如果连续两次投出该结果，则视作恶劣天气。" }, { range: [4, 6], result: "适合旅行的好天气。" }]
    },
    localMood: {
        name: "当地情况 (到达定居点时)",
        entries: [{ range: [1, 1], result: "被迫在眉睫或刚刚发生的灾祸所笼罩。" }, { range: [2, 3], result: "似乎一切都在衰败。" }, { range: [4, 6], result: "氛围良好，一切看起来都还不错。" }]
    },
    crisis: {
        name: "领地危机骰 (每个季节开始或游历归来时)",
        entries: [{ range: [1, 1], result: "灾难：立刻获得 2 个危机。" }, { range: [2, 3], result: "困境：从 2 个危机中选择一个。" }, { range: [4, 6], result: "繁荣：日子平稳度过。" }]
    },
    taxes: {
        name: "领地增加税负 (Taxes)",
        entries: [{ range: [1, 1], result: "立刻陷入动荡。" }, { range: [2, 3], result: "你的财库被填满，但获得 1 个危机。" }, { range: [4, 6], result: "领民们情愿掏钱……大概吧。" }]
    },
    courtlyConflict: {
        name: "宫廷剧变卷入 (Courtly Conflict)",
        entries: [{ range: [1, 1], result: "你本人被卷入其中。" }, { range: [2, 3], result: "你被牵连其中，因为你和涉事一方有联系。" }, { range: [4, 6], result: "此事与你无关。" }]
    }
};
