import { useState } from 'react';
import { useCharacterStore } from '../../stores/useCharacterStore';
import { getRank, SCAR_TABLE, FEATS, rollDie } from '../../data/gameTables';
import { getKnightLabel } from '../../data/knights';
import type { Character } from '../../types';

export default function CharacterSheet() {
  const { currentCharacter, adjustVirtue, adjustVirtueMax,
    restoreVirtue, adjustGD, adjustGDMax, restoreGD, adjustGlory,
    setAge, setSeason, setFeatState, restoreFeats,
    setCondition, addJournalEntry, addScar,
    adjustMountVirtue, adjustMountGD, restoreMount, consumeRemedy } = useCharacterStore();

  const [rawDamageInput, setRawDamageInput] = useState('');
  const [scarWeaponDie, setScarWeaponDie] = useState<number>(12);
  const [dmgCalcLog, setDmgCalcLog] = useState<string[]>([]);

  if (!currentCharacter) {
    return <div className="empty-state"><p>未载入角色。</p></div>;
  }

  const c = currentCharacter;
  const rank = getRank(c.glory);

  const totalArmour = calcArmour(c);

  function handleApplyDamage() {
    const raw = parseInt(rawDamageInput);
    if (isNaN(raw) || raw <= 0) return;

    const logs: string[] = [];
    logs.push(`原始受击伤害: ${raw}`);

    const netDmg = Math.max(0, raw - totalArmour);
    logs.push(`扣除目标防具 (A${totalArmour})，实际生效伤害: ${netDmg}`);

    if (netDmg === 0) {
      logs.push(`🛡️ 装备护甲完全挡下了所有伤害`);
      setDmgCalcLog(logs);
      return;
    }

    let currentGD = c.gd.current;
    const currentVIG = c.virtues.vig.current;

    const gdAbsorbed = Math.min(currentGD, netDmg);
    currentGD -= gdAbsorbed;
    const remainingDmg = netDmg - gdAbsorbed;

    adjustGD(-gdAbsorbed);
    logs.push(`🛡️ 防护 (GD) 优先抵扣 ${gdAbsorbed} 点，剩余防护: ${currentGD}/${c.gd.max}`);

    if (c.gd.current > 0 && currentGD === 0) {
      logs.push(`⚡ 防护 (GD) 恰好被击破归零！根据规则触发伤疤判定...`);
      const dieSides = scarWeaponDie || 12;
      const roll = rollDie(dieSides);
      const scarObj = SCAR_TABLE[Math.min(roll - 1, SCAR_TABLE.length - 1)];
      logs.push(`🩸 重掷攻击武器骰 (d${dieSides}) 结果为 ${roll} → 获得伤疤【${scarObj.name}】：${scarObj.effect}`);
      addScar({
        roll,
        die: `d${dieSides}`,
        name: scarObj.name,
        description: scarObj.description,
        effect: scarObj.effect,
        appliedEffects: [scarObj.effect],
        timestamp: new Date().toISOString(),
      });
      addJournalEntry(`防护恰好归零，重掷 d${dieSides} 获得伤疤【${scarObj.name}】`, true);
    }

    if (remainingDmg > 0) {
      adjustVirtue('vig', -remainingDmg);
      logs.push(`💥 溢出伤害 ${remainingDmg} 点直接扣减活力，当前活力: ${Math.max(0, currentVIG - remainingDmg)}/${c.virtues.vig.max}`);
      setCondition('wounded', true);

      if (remainingDmg >= Math.ceil(currentVIG / 2)) {
        if (c.conditions.doomScar) {
          logs.push(`☠️ 在带有【毁灭伤痕】状态下遭受致命伤 → 骑士当场阵亡！`);
          addJournalEntry(`在毁灭伤痕状态下受致命伤，阵亡`, true);
        } else {
          logs.push(`⚠️ 单次活力损伤 ≥ 创前活力的一半 → 遭受【致命伤】（若1小时内未获得救援将死亡）`);
          setCondition('mortalWound', true);
          addJournalEntry(`受致命伤`, true);
        }
      }
    }

    addJournalEntry(`【战斗受击记录】原始伤害 ${raw}，防具抵扣 A${totalArmour}，GD 抵扣 ${gdAbsorbed}，活力扣减 ${remainingDmg}。`, true);
    setDmgCalcLog(logs);
    setRawDamageInput('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* 头部摘要 — 骑士纹章横幅 */}
      <div className="knight-crest-banner">

        {/* 左侧：身份区 */}
        <div className="crest-identity">
          <div className="crest-avatar">⚔️</div>
          <div className="crest-titles">
            <h1 className="crest-name">{c.name}</h1>
            <span className="crest-archetype">{getKnightLabel(c.knightType)}</span>
          </div>
        </div>

        {/* 中间：数据指标 */}
        <div className="crest-metrics">

          {/* 荣耀 */}
          <div className="metric-box">
            <span className="metric-label">荣耀</span>
            <div className="metric-controls">
              <button className="btn btn-xs btn-ghost" onClick={() => adjustGlory(-1)}>−</button>
              <span className="metric-value">{c.glory}</span>
              <button className="btn btn-xs btn-ghost" onClick={() => adjustGlory(1)}>+</button>
            </div>
          </div>

          {/* 等阶 */}
          <div className="metric-box">
            <span className="metric-label">等阶</span>
            <span className="metric-value" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{rank.rank}</span>
          </div>

          {/* 季节 */}
          <div className="metric-box">
            <span className="metric-label">季节</span>
            <select
              value={c.season}
              onChange={e => setSeason(e.target.value as 'Spring' | 'Harvest' | 'Winter')}
              className="form-select-sm"
              style={{ marginTop: '0.15rem' }}
            >
              <option value="Spring">春季</option>
              <option value="Harvest">丰收季</option>
              <option value="Winter">寒冬季</option>
            </select>
          </div>

          {/* 年龄 */}
          <div className="metric-box">
            <span className="metric-label">年龄</span>
            <select
              value={c.age}
              onChange={e => setAge(e.target.value as 'Young' | 'Mature' | 'Old')}
              className="form-select-sm"
              style={{ marginTop: '0.15rem' }}
            >
              <option value="Young">青年</option>
              <option value="Mature">壮年</option>
              <option value="Old">暮年</option>
            </select>
          </div>

        </div>



      </div>

      {/* 三大美德 */}
      <div className="virtue-pillars-grid">
        {(['vig', 'cla', 'spi'] as const).map(v => {
          const cur = c.virtues[v].current;
          const max = c.virtues[v].max;
          const isZero = cur === 0;
          const config: Record<string, { name: string; warn: string; remedyKey: 'sustenance' | 'stimulant' | 'sacrament'; remedyName: string }> = {
            vig: { name: '活力 (VIG)', warn: '疲惫：移动后不可攻击', remedyKey: 'sustenance', remedyName: '饮食' },
            cla: { name: '敏锐 (CLA)', warn: '暴露：GD 视作 0', remedyKey: 'stimulant', remedyName: '兴奋剂' },
            spi: { name: '精神 (SPI)', warn: '压制：攻击限定投 d4', remedyKey: 'sacrament', remedyName: '圣礼' },
          };
          const cfg = config[v];
          const remedyCount = c.remedies[cfg.remedyKey];
          return (
            <div key={v} className={`virtue-pillar-card ${isZero ? 'depleted' : ''}`}>
              <div className="pillar-name">{cfg.name}</div>
              <div className="pillar-gauge">{cur} / {max}</div>

              <div className="pillar-controls">
                <button className="btn btn-xs btn-ghost" onClick={() => adjustVirtue(v, -1)}>−</button>
                <button className="btn btn-xs btn-ghost" onClick={() => adjustVirtue(v, 1)}>+</button>
                <button className="btn btn-xs btn-restore" onClick={() => restoreVirtue(v)}>恢复</button>
              </div>

              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-dim)' }}>
                  <span>上限:</span>
                  <button className="btn btn-xs btn-ghost" onClick={() => adjustVirtueMax(v, -1)}>−</button>
                  <button className="btn btn-xs btn-ghost" onClick={() => adjustVirtueMax(v, 1)}>+</button>
                </div>
                <button
                  className="btn btn-xs btn-warning"
                  onClick={() => consumeRemedy(cfg.remedyKey)}
                  disabled={remedyCount <= 0}
                  title={`消耗 1 份${cfg.remedyName}直接恢复${cfg.name.split(' ')[0]}至全满`}
                >
                  🧪 喝{cfg.remedyName} ({remedyCount})
                </button>
              </div>

              {isZero && <div className="virtue-warning" style={{ marginTop: '0.4rem' }}>{cfg.warn}</div>}
            </div>
          );
        })}
      </div>

      {/* 坐骑状态与微调 */}
      {c.mount && (
        <div className="panel bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100 dark:border-stone-800">
            <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              🏇 坐骑状态: {c.mount.name} {c.mount.trample && `(践踏 ${c.mount.trample})`}
            </span>
            <button className="btn btn-xs btn-primary" onClick={restoreMount}>坐骑完全恢复</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
            <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg text-center">
              <span className="text-stone-400 font-bold block">VIG 活力</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{c.mount.vig.current}/{c.mount.vig.max}</span>
              <div className="flex justify-center gap-1 mt-1">
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountVirtue('vig', -1)}>−</button>
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountVirtue('vig', 1)}>+</button>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg text-center">
              <span className="text-stone-400 font-bold block">CLA 敏锐</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{c.mount.cla.current}/{c.mount.cla.max}</span>
              <div className="flex justify-center gap-1 mt-1">
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountVirtue('cla', -1)}>−</button>
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountVirtue('cla', 1)}>+</button>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/60 p-2 rounded-lg text-center">
              <span className="text-stone-400 font-bold block">SPI 精神</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{c.mount.spi.current}/{c.mount.spi.max}</span>
              <div className="flex justify-center gap-1 mt-1">
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountVirtue('spi', -1)}>−</button>
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountVirtue('spi', 1)}>+</button>
              </div>
            </div>
            <div className="bg-emerald-950/20 p-2 rounded-lg text-center border border-emerald-500/30">
              <span className="text-emerald-600 font-bold block">GD 防护</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{c.mount.gd.current}/{c.mount.gd.max}</span>
              <div className="flex justify-center gap-1 mt-1">
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountGD(-1)}>−</button>
                <button className="btn btn-xs btn-ghost" onClick={() => adjustMountGD(1)}>+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 战况中心：防护 + 伤害计算 + 状态 ===== */}
      <div className="combat-hub">

        {/* 左列：防护数值 (GD) + 护甲 */}
        <div className="combat-hub-defense">
          <div className="defense-stat-row">
            <div className="defense-stat">
              <span className="defense-label">🛡️ 防护 (GD)</span>
              <span className="defense-value">{c.gd.current}<span className="defense-max">/{c.gd.max}</span></span>
              <div className="defense-controls">
                <button className="btn btn-xs btn-ghost" onClick={() => adjustGD(-1)}>−</button>
                <button className="btn btn-xs btn-restore" onClick={restoreGD}>恢复</button>
                <button className="btn btn-xs btn-ghost" onClick={() => adjustGD(1)}>+</button>
              </div>
              <div className="defense-sublabel">
                上限: 
                <button className="btn btn-xs btn-ghost" onClick={() => adjustGDMax(-1)}>−</button>
                {c.gd.max}
                <button className="btn btn-xs btn-ghost" onClick={() => adjustGDMax(1)}>+</button>
              </div>
            </div>
            <div className="defense-divider" />
            <div className="defense-stat">
              <span className="defense-label">🔰 护甲 (Armour)</span>
              <span className="defense-value armour">{totalArmour > 0 ? `A${totalArmour}` : '—'}</span>
              <span className="defense-sublabel">来自装备自动累计</span>
            </div>
          </div>

          {/* 状态条件 */}
          <div className="combat-conditions">
            <span className="condition-section-label">⚠️ 状态</span>
            <div className="condition-row">
              <label className={`condition-chip ${c.conditions.wounded ? 'active' : ''}`}>
                <input type="checkbox" checked={c.conditions.wounded} onChange={e => setCondition('wounded', e.target.checked)} />
                受伤
              </label>
              <label className={`condition-chip ${c.conditions.mortalWound ? 'active danger' : ''}`}>
                <input type="checkbox" checked={c.conditions.mortalWound} onChange={e => setCondition('mortalWound', e.target.checked)} />
                致命伤
              </label>
              <label className={`condition-chip ${c.conditions.doomScar ? 'active danger' : ''}`}>
                <input type="checkbox" checked={c.conditions.doomScar} onChange={e => setCondition('doomScar', e.target.checked)} />
                毁灭伤痕
              </label>
            </div>
          </div>
        </div>

        {/* 右列：伤害计算器（内联） */}
        <div className="combat-hub-calculator">
          <div className="calc-hub-header">🗡️ 伤害计算器</div>
          <p className="calc-hub-desc">输入原始伤害，系统自动扣减护甲 → GD → VIG 并触发状态。</p>

          <div className="calc-hub-formula">
            <div className="calc-formula-step">
              <span className="formula-badge">① 护甲</span>
              <span className="formula-val">A{totalArmour}</span>
            </div>
            <span className="formula-arrow">→</span>
            <div className="calc-formula-step">
              <span className="formula-badge">② GD</span>
              <span className="formula-val">{c.gd.current}</span>
            </div>
            <span className="formula-arrow">→</span>
            <div className="calc-formula-step">
              <span className="formula-badge">③ VIG</span>
              <span className="formula-val">{c.virtues.vig.current}</span>
            </div>
          </div>

          <div className="calc-hub-input-row">
            <input
              type="number"
              className="calc-hub-input"
              placeholder="输入伤害值..."
              value={rawDamageInput}
              onChange={e => setRawDamageInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApplyDamage()}
              min={0}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>伤疤武器骰:</span>
              <select
                className="form-select-sm"
                value={scarWeaponDie}
                onChange={e => setScarWeaponDie(parseInt(e.target.value))}
                title="若恰好将防护击破至0，将重掷该武器骰决定获得的伤疤"
              >
                <option value={4}>d4</option>
                <option value={6}>d6</option>
                <option value={8}>d8</option>
                <option value={10}>d10</option>
                <option value={12}>d12</option>
              </select>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={handleApplyDamage}
              disabled={!rawDamageInput || parseInt(rawDamageInput) <= 0}
            >
              结算伤害
            </button>
            {dmgCalcLog.length > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={() => setDmgCalcLog([])}>
                清除
              </button>
            )}
          </div>

          {dmgCalcLog.length > 0 && (
            <div className="calc-hub-log">
              {dmgCalcLog.map((line, i) => (
                <div key={i} className={`calc-log-line ${i === 0 ? 'log-line-first' : ''} ${line.includes('阵亡') || line.includes('致命') ? 'log-line-danger' : ''} ${line.includes('伤疤') ? 'log-line-warn' : ''}`}>
                  <span className="log-bullet">{i === 0 ? '▶' : '↳'}</span> {line}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 能力与绝技 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        
        <div className="panel">
          <div className="panel-header">能力与热忱</div>
          <div className="panel-body">
            <div className="ability-card">
              <div className="card-title">⚡ {c.ability.name}</div>
              <div className="card-desc">{c.ability.description}</div>
            </div>
            <div className="passion-card">
              <div className="card-title">🔥 {c.passion.name}</div>
              <div className="card-desc">{c.passion.description}</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            绝技
            <button className="btn btn-xs btn-ghost" onClick={restoreFeats}>恢复全部</button>
          </div>
          <div className="panel-body">
            {(['smite', 'focus', 'deny'] as const).map(feat => {
              const def = FEATS[feat];
              const state = c.feats[feat];
              const stateLabels: Record<string, string> = {
                available: '可用',
                pending: '待检定',
                fatigued: '疲劳',
              };
              return (
                <div key={feat} className={`feat-row feat-${state}`}>
                  <div className="feat-header">
                    <span className="feat-name">{def.name}</span>
                    <span className="feat-save">{def.save} 豁免 ({stateLabels[state]})</span>
                  </div>
                  <div className="feat-desc">{def.description}</div>
                  <div className="feat-controls">
                    <button
                      className={`btn btn-xs ${state === 'available' ? 'btn-success' : 'btn-ghost'}`}
                      onClick={() => setFeatState(feat, 'available')}
                    >可用</button>
                    <button
                      className={`btn btn-xs ${state === 'pending' ? 'btn-warning' : 'btn-ghost'}`}
                      onClick={() => setFeatState(feat, 'pending')}
                    >待检定</button>
                    <button
                      className={`btn btn-xs ${state === 'fatigued' ? 'btn-danger' : 'btn-ghost'}`}
                      onClick={() => setFeatState(feat, 'fatigued')}
                    >疲劳</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 伤疤 */}
      {c.scars.length > 0 && (
        <div className="panel">
          <div className="panel-header">伤疤 ({c.scars.length})</div>
          <div className="panel-body">
            {c.scars.map((scar, i) => (
              <div key={i} className="scar-entry">
                <div className="scar-name">{scar.name} <span className="muted-text">({scar.die} 投出 {scar.roll})</span></div>
                <div className="scar-desc">{scar.description}</div>
                <div className="scar-effect">{scar.effect}</div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

function calcArmour(c: Character): number {
  let total = 0;
  c.armour.forEach(a => {
    total += a.score;
  });
  return total;
}
