import { rollDie, generateId } from '../data/gameTables';
import { KNIGHT_DB } from '../data/knights';
import type { KnightArchetype, SquireData, WeaponItem, ArmourItem, CarriedItem } from '../types';

export interface StartRollResult {
  startId: string;
  vig: number;
  cla: number;
  spi: number;
  gd: number;
  details: {
    virtueFormula: string;
    gdFormula: string;
    vigRoll: string;
    claRoll: string;
    spiRoll: string;
    gdRoll: string;
  };
}

// Alias for backward compatibility
export type ScopeRollResult = StartRollResult;

export function rollStartStats(startId: string = 'adventurer'): StartRollResult {
  const rollFormulaDetail = (formula: string): { total: number; detail: string } => {
    if (formula === '1d12+1d6') {
      const d12 = rollDie(12);
      const d6 = rollDie(6);
      return { total: d12 + d6, detail: `1d12[${d12}] + 1d6[${d6}]` };
    }
    if (formula === '1d12+6') {
      const d12 = rollDie(12);
      return { total: d12 + 6, detail: `1d12[${d12}] + 6` };
    }
    if (formula === '1d6') {
      const d6 = rollDie(6);
      return { total: d6, detail: `1d6[${d6}]` };
    }
    if (formula === '2d6') {
      const d6_1 = rollDie(6);
      const d6_2 = rollDie(6);
      return { total: d6_1 + d6_2, detail: `1d6[${d6_1}] + 1d6[${d6_2}]` };
    }
    if (formula === '1d6+6') {
      const d6 = rollDie(6);
      return { total: d6 + 6, detail: `1d6[${d6}] + 6` };
    }
    return { total: 10, detail: '10' };
  };

  let vFormula = '1d12+1d6';
  let gdFormula = '1d6';
  if (startId === 'courtier') {
    vFormula = '1d12+6';
    gdFormula = '2d6';
  } else if (startId === 'ruler') {
    vFormula = '1d12+6';
    gdFormula = '1d6+6';
  }

  const vig = rollFormulaDetail(vFormula);
  const cla = rollFormulaDetail(vFormula);
  const spi = rollFormulaDetail(vFormula);
  const gd = rollFormulaDetail(gdFormula);

  return {
    startId,
    vig: vig.total,
    cla: cla.total,
    spi: spi.total,
    gd: gd.total,
    details: {
      virtueFormula: vFormula,
      gdFormula,
      vigRoll: vig.detail,
      claRoll: cla.detail,
      spiRoll: spi.detail,
      gdRoll: gd.detail,
    },
  };
}

// Alias for backward compatibility
export const rollScopeStats = rollStartStats;

export function rollRandomKnightArchetype(): { knight: KnightArchetype; d6: number; d12: number } {
  const d6 = rollDie(6);
  const d12 = rollDie(12);
  const targetNumber = `${d6}-${d12}`;
  const matched = KNIGHT_DB.find(k => k.number === targetNumber);
  if (matched) {
    return { knight: matched, d6, d12 };
  }
  const randomIndex = Math.floor(Math.random() * KNIGHT_DB.length);
  return { knight: KNIGHT_DB[randomIndex], d6, d12 };
}

export function generateRandomSquire(): SquireData {
  const vVig = rollDie(6) + rollDie(6);
  const vCla = rollDie(6) + rollDie(6);
  const vSpi = rollDie(6) + rollDie(6);
  const extraRoll = rollDie(6);

  const weapons: WeaponItem[] = [
    { type: 'weapon', id: generateId(), name: '匕首', dice: 'd6', tags: [] }
  ];
  const armour: ArmourItem[] = [];
  const carried: CarriedItem[] = [
    { type: 'carried', id: generateId(), name: '小马 (活力7, 敏锐7, 精神2, 2 GD)' }
  ];

  if (extraRoll === 1) {
    weapons.push({ type: 'weapon', id: generateId(), name: '短棒', dice: 'd8', tags: ['沉重'] });
  } else if (extraRoll === 2) {
    weapons.push({ type: 'weapon', id: generateId(), name: '斧子', dice: 'd8', tags: ['沉重'] });
  } else if (extraRoll === 3) {
    weapons.push({ type: 'weapon', id: generateId(), name: '短柄斧', dice: 'd6', tags: [] });
  } else if (extraRoll === 4) {
    weapons.push({ type: 'weapon', id: generateId(), name: '短弓', dice: 'd6', tags: ['长'] });
  } else if (extraRoll === 5) {
    armour.push({ type: 'armour', id: generateId(), name: '盾牌', armourType: 'shield', score: 1, dice: 'd4' });
  } else if (extraRoll === 6) {
    weapons.push({ type: 'weapon', id: generateId(), name: '三把标枪', dice: 'd6', tags: [] });
  }

  return {
    name: '随从侍从',
    vig: { current: vVig, max: vVig },
    cla: { current: vCla, max: vCla },
    spi: { current: vSpi, max: vSpi },
    gd: { current: 1, max: 1 },
    weapons,
    armour,
    carried,
  };
}
