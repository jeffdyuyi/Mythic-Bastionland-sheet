import { useState } from 'react';
import { GAMBITS, rollDie } from '../../data/gameTables';
import { useCharacterStore } from '../../stores/useCharacterStore';

interface DiceInPool {
  id: string;
  sides: number;
  value: number | null;
}

export default function BattlePanel() {
  const { currentCharacter } = useCharacterStore();
  const [pool, setPool] = useState<DiceInPool[]>([]);
  const [lastRoll, setLastRoll] = useState<{ pool: number[]; highest: number; gambits: string[] } | null>(null);

  function addDie(sides: number) {
    setPool(prev => [...prev, { id: Date.now().toString() + Math.random(), sides, value: null }]);
  }

  function addWeaponDie(diceStr: string, impaired?: boolean) {
    let sides = 6;
    if (impaired) {
      sides = 4;
    } else {
      const match = diceStr.match(/d(\d+)/i);
      if (match) sides = parseInt(match[1]);
    }
    addDie(sides);
  }

  function removeDie(id: string) {
    setPool(prev => prev.filter(d => d.id !== id));
  }

  function rollPool() {
    if (pool.length === 0) return;
    const rolls = pool.map(d => rollDie(d.sides));
    const highest = Math.max(...rolls);

    const counts: Record<number, number> = {};
    rolls.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
    const hasDuplicate = Object.values(counts).some(c => c >= 2);
    const triggeredGambits: string[] = [];

    if (hasDuplicate) {
      const matchingValue = Math.max(...Object.entries(counts).filter(([, c]) => c >= 2).map(([v]) => parseInt(v)));
      const isStrong = matchingValue >= 8;
      triggeredGambits.push(isStrong ? '⭐ 强效策略 (Strong Gambit) 触发可用！' : '🎯 策略 (Gambit) 触发可用！');
    }

    setPool(prev => prev.map((d, i) => ({ ...d, value: rolls[i] })));
    setLastRoll({ pool: rolls, highest, gambits: triggeredGambits });
  }

  function clearPool() {
    setPool([]);
    setLastRoll(null);
  }

  const DICE = [4, 6, 8, 10, 12];

  return (
    <div className="battle-panel">

      {/* ===== 骰池构建器 ===== */}
      <div className="panel dice-pool-panel">
        <div className="panel-header">攻击骰池构建 (Attack Dice Pool)</div>
        <div className="panel-body">
          {/* 快捷载入已装备武器 */}
          {currentCharacter && currentCharacter.weapons.length > 0 && (
            <div className="mb-3 space-y-1">
              <span className="text-xs font-bold text-stone-400 block">点击快捷加入角色已装备武器:</span>
              <div className="flex gap-1.5 flex-wrap">
                {currentCharacter.weapons.map((w, idx) => (
                  <button
                    key={w.id || idx}
                    onClick={() => addWeaponDie(w.dice, w.impaired)}
                    className={`btn btn-xs flex items-center gap-1 ${
                      w.impaired ? 'btn-warning' : 'btn-ghost border border-stone-300 dark:border-stone-700'
                    }`}
                    title={w.impaired ? '武器已受损！自动降阶为 d4' : `加入 ${w.name} 攻击骰 (${w.dice})`}
                  >
                    <span>⚔️ {w.name}</span>
                    <span className="font-mono font-bold">{w.impaired ? 'd4 (受损)' : w.dice}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="dice-adder">
            {DICE.map(sides => (
              <button key={sides} className="btn btn-ghost die-btn" onClick={() => addDie(sides)}>
                + d{sides}
              </button>
            ))}
          </div>

          <div className="dice-pool-display">
            {pool.length === 0 && (
              <div className="pool-empty">点击上方按钮加入武器或能力的攻击骰子（如 d6、d8、d10）</div>
            )}
            {pool.map(die => (
              <div
                key={die.id}
                className={`die-token d${die.sides} ${die.value !== null ? 'rolled' : ''}`}
                onClick={() => removeDie(die.id)}
                title="点击移除"
              >
                <span className="die-sides">d{die.sides}</span>
                {die.value !== null && <span className="die-value">{die.value}</span>}
              </div>
            ))}
          </div>

          <div className="pool-actions">
            <button className="btn btn-primary btn-lg" onClick={rollPool} disabled={pool.length === 0}>
              🎲 投掷攻击 (Roll Attack)
            </button>
            <button className="btn btn-ghost" onClick={clearPool}>清空骰池</button>
          </div>

          {lastRoll && (
            <div className="roll-result">
              <div className="roll-summary">
                <span className="roll-dice-list">[{lastRoll.pool.join(', ')}]</span>
                <span className="roll-highest">→ 最高点数: <strong>{lastRoll.highest}</strong> 伤害</span>
              </div>
              {lastRoll.gambits.map((g, i) => (
                <div key={i} className="gambit-trigger">{g}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== 策略速查 ===== */}
      <div className="panel gambits-panel">
        <div className="panel-header">策略速查 (Gambits Reference)</div>
        <div className="panel-body">
          <div className="gambits-mini-list">
            {GAMBITS.filter(g => !g.strong).map(g => (
              <div key={g.name} className="gambit-item-mini">
                <span className="gambit-name">{g.name}</span>
                <span className="gambit-effect">{g.effect}</span>
              </div>
            ))}
          </div>
          <div className="gambits-strong-label">⭐ 强效策略 (8+ 点数触发)</div>
          <div className="gambits-mini-list strong">
            {GAMBITS.filter(g => g.strong).map(g => (
              <div key={g.name} className="gambit-item-mini strong">
                <span className="gambit-name">{g.name}</span>
                <span className="gambit-effect">{g.effect}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
