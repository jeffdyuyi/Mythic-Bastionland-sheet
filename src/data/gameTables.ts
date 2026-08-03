import type { ScarTableEntry, RankThreshold, FeatDefinition, Gambit } from '../types';

// ============================================================
// 伤疤表 (SCAR TABLE - 1d12 / 武器骰)
// ============================================================

export const SCAR_TABLE: ScarTableEntry[] = [
  {
    roll: 1,
    name: '压力 (Distress)',
    description: '幸得逃脱，但惊魂未定。',
    effect: '失去 d6 点精神',
  },
  {
    roll: 2,
    name: '毁容 (Disfigurement)',
    description: '留下了永久的伤疤。(投 1d6 确定部位：1眼睛 2脸颊 3脖颈 4躯干 5鼻子 6下颚)',
    effect: '若最大防护（GD）≤ 2，则将其提升 d6',
    gdThreshold: 2,
  },
  {
    roll: 3,
    name: '重创 (Smash)',
    description: '肉体承受惨重击打，鲜血淋漓。',
    effect: '失去 d6 点活力',
  },
  {
    roll: 4,
    name: '击晕 (Stun)',
    description: '剧烈的痛楚模糊了感官。',
    effect: '失去 d6 点敏锐。若最大防护（GD）≤ 4，则将其提升 d6',
    gdThreshold: 4,
  },
  {
    roll: 5,
    name: '破裂 (Rupture)',
    description: '内脏受到刺穿重创，纠成一团。',
    effect: '失去 2d6 点活力',
  },
  {
    roll: 6,
    name: '拉伤 (Gouge)',
    description: '血肉从骨头上被残暴地撕离。',
    effect: '当获得包扎救治时，若最大防护（GD）≤ 6，则将其提升 d6',
    gdThreshold: 6,
  },
  {
    roll: 7,
    name: '震荡 (Concussion)',
    description: '头部遭受重击，使大脑一片麻木。',
    effect: '失去 2d6 点敏锐',
  },
  {
    roll: 8,
    name: '撕裂 (Tear)',
    description: '一阵暴虐的扭打之后，关键部位遭撕裂损毁。(投 1d6 确定部位：1鼻子 2耳朵 3手指 4拇指 5眼睛 6一块头皮)',
    effect: '当获得包扎救治时，若最大防护（GD）≤ 8，则将其提升 d6',
    gdThreshold: 8,
  },
  {
    roll: 9,
    name: '剧痛 (Agony)',
    description: '因极其暴虐的殴打而在精神上崩溃。',
    effect: '失去 2d6 点精神',
  },
  {
    roll: 10,
    name: '断肢 (Mutilation)',
    description: '肢体断裂或永久失能。(投 1d6 确定部位：1-2腿 3-4持盾手 5-6持剑手)。等到下个季节获得假肢适应后。',
    effect: '若最大防护（GD）≤ 10，则将其提升 d6',
    gdThreshold: 10,
  },
  {
    roll: 11,
    name: '毁灭 (Doom)',
    description: '死亡之影如影随形。',
    effect: '若在当前季节中遭受致命伤，你将直接死亡（毁灭伤痕）',
    isDoom: true,
  },
  {
    roll: 12,
    name: '羞辱 (Humiliation)',
    description: '承受了无比惨痛且受辱的致命一击。',
    effect: '当亲手完成复仇之时，若最大防护（GD）≤ 12，则将其提升 d6',
    gdThreshold: 12,
  },
];

// ============================================================
// 荣耀与等阶阈值 (GLORY & RANK THRESHOLDS)
// ============================================================

export const RANK_THRESHOLDS: RankThreshold[] = [
  { glory: 0, rank: '游侠骑士 (Knight-Errant)', worthy: '获得领导战团 (Warband) 的资格' },
  { glory: 3, rank: '勇武骑士 (Knight Valiant)', worthy: '获得位列议会或跻身宫廷 (Council / Court) 的资格' },
  { glory: 6, rank: '拥土骑士 (Knight Landed)', worthy: '获得统治领地与封地 (Holding) 的资格' },
  { glory: 9, rank: '御统骑士 (Knight Paramount)', worthy: '获得统治权力之座 (Seat of Power) 的资格' },
  { glory: 12, rank: '荣光骑士 (Knight High)', worthy: '获得进行圣城巡旅与寻回 (City Quest) 的资格' },
];

// ============================================================
// 绝技 (FEATS OF KNIGHTHOOD)
// ============================================================

export const FEATS: Record<string, FeatDefinition> = {
  smite: {
    name: '猛击 Smite',
    subtitle: '释放你的正义之怒',
    description: '在近战攻击掷骰前使用。近战攻击 +d12 或变为范围攻击。通过活力豁免来避免陷入疲劳。',
    bullets: [
      '在近战攻击掷骰前使用。',
      '近战攻击 +d12 或变为范围攻击。',
      '通过活力豁免来避免陷入疲劳。',
    ],
    save: '活力',
  },
  focus: {
    name: '专注 Focus',
    subtitle: '创造可乘之机',
    description: '在攻击掷骰后使用。以此使用策略不需要消耗骰子。通过敏锐豁免来避免陷入疲劳。',
    bullets: [
      '在攻击掷骰后使用。',
      '以此使用策略不需要消耗骰子。',
      '通过敏锐豁免来避免陷入疲劳。',
    ],
    save: '敏锐',
  },
  deny: {
    name: '招架 Deny',
    subtitle: '在攻击落下之前招架',
    description: '在一次以你或你一臂之内的盟友为目标的攻击掷骰后使用。弃掉一颗攻击骰。通过精神豁免来避免陷入疲劳。',
    bullets: [
      '在一次以你或你一臂之内的盟友为目标的攻击掷骰后使用。',
      '弃掉一颗攻击骰。',
      '通过精神豁免来避免陷入疲劳。',
    ],
    save: '精神',
  },
};

// ============================================================
// 策略 (GAMBITS)
// ============================================================

export const GAMBITS: Gambit[] = [
  { name: '增势 (Bolster)', effect: '攻击总伤害额外 +1 点', strong: false },
  { name: '移动 (Move)', effect: '在攻击后自由移动，即使本回合已移动或陷入无法移动状态', strong: false },
  { name: '击退 (Repel)', effect: '将敌人自你身旁击退一段距离', strong: true },
  { name: '截断 (Stop)', effect: '阻止敌人下一个回合进行任何移动', strong: true },
  { name: '压制 (Impair)', effect: '压制敌人下一个回合的武器（其攻击骰降为 d4）', strong: true },
  { name: '绞械 (Trap)', effect: '牵制或封锁敌人的盾牌/武器直到你下一个回合', strong: true },
  { name: '落马 (Dismount)', effect: '强制将骑乘状态下的敌人击落马下', strong: true },
  { name: '其他 (Other)', effect: '经 GM 认可的其他同等影响力的战术效果', strong: true },
];

// ============================================================
// 骰子工具函数 (DICE UTILITIES)
// ============================================================

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDice(diceStr: string): { count: number; sides: number } | null {
  const match = diceStr.match(/(\d*)d(\d+)/);
  if (!match) return null;
  return { count: parseInt(match[1] || '1'), sides: parseInt(match[2]) };
}

export function rollDiceStr(diceStr: string): number[] {
  const parsed = parseDice(diceStr);
  if (!parsed) return [];
  const results: number[] = [];
  for (let i = 0; i < parsed.count; i++) results.push(rollDie(parsed.sides));
  return results;
}

export function rollDiceTotal(diceStr: string): number {
  return rollDiceStr(diceStr).reduce((a, b) => a + b, 0);
}

// ============================================================
// 等阶查找 (RANK HELPERS)
// ============================================================

export function getRank(glory: number): RankThreshold {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (glory >= RANK_THRESHOLDS[i].glory) return RANK_THRESHOLDS[i];
  }
  return RANK_THRESHOLDS[0];
}

// ============================================================
// ID 生成器
// ============================================================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
