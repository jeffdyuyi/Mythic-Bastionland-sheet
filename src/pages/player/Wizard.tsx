import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../../stores/useCharacterStore';
import { KNIGHT_DB, getKnightGroups } from '../../data/knights';
import type { KnightArchetype, SquireData } from '../../types';
import { generateRandomKnightName } from '../../utils/nameGenerator';
import {
  rollStartStats,
  rollRandomKnightArchetype,
  generateRandomSquire,
  type StartRollResult,
} from '../../utils/characterGenerator';

const STARTS = [
  { id: 'adventurer', name: '冒险者 (Adventurer)', virtueFormula: '1d12 + 1d6', gdFormula: '1d6' },
  { id: 'courtier', name: '廷臣 (Courtier)', virtueFormula: '1d12 + 6', gdFormula: '2d6' },
  { id: 'ruler', name: '统治者 (Ruler)', virtueFormula: '1d12 + 6', gdFormula: '1d6 + 6' },
];

export default function Wizard() {
  const navigate = useNavigate();
  const { createCharacter } = useCharacterStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 1. 开局 (默认选定 'adventurer')
  const [selectedStart, setSelectedStart] = useState<string>('adventurer');

  // 2. 属性状态 (默认未投掷，限投 1 次)
  const [hasRolledAttributes, setHasRolledAttributes] = useState<boolean>(false);
  const [attributeRollCount, setAttributeRollCount] = useState<number>(0);
  const [allowUnlimitedRolls, setAllowUnlimitedRolls] = useState<boolean>(false);
  const [rolledStats, setRolledStats] = useState<StartRollResult | null>(null);

  const [rolledVig, setRolledVig] = useState(0);
  const [rolledCla, setRolledCla] = useState(0);
  const [rolledSpi, setRolledSpi] = useState(0);
  const [rolledGd, setRolledGd] = useState(0);

  // 3. 原型
  const [hasRolledKnight, setHasRolledKnight] = useState<boolean>(false);
  const [knightRoll, setKnightRoll] = useState<{ knight: KnightArchetype; d6: number; d12: number } | null>(null);
  const [selectedKnightId, setSelectedKnightId] = useState<string>('');

  // 4. 姓名与侍从
  const [knightName, setKnightName] = useState<string>('');
  const [createSquire, setCreateSquire] = useState<boolean>(false);
  const [squire, setSquire] = useState<SquireData | null>(null);

  const canRollAttributes = attributeRollCount === 0 || allowUnlimitedRolls;

  function handleRollStep1() {
    if (!canRollAttributes) return;
    const stats = rollStartStats(selectedStart);
    setRolledStats(stats);
    setRolledVig(stats.vig);
    setRolledCla(stats.cla);
    setRolledSpi(stats.spi);
    setRolledGd(stats.gd);
    setHasRolledAttributes(true);
    setAttributeRollCount(prev => prev + 1);
  }

  function handleStartChange(id: string) {
    setSelectedStart(id);
    setHasRolledAttributes(false);
    setAttributeRollCount(0);
    setRolledStats(null);
    setRolledVig(0);
    setRolledCla(0);
    setRolledSpi(0);
    setRolledGd(0);
  }

  function handleRandomKnight() {
    const rolled = rollRandomKnightArchetype();
    setKnightRoll(rolled);
    setSelectedKnightId(rolled.knight.id);
    setHasRolledKnight(true);
  }

  function handleRandomName() {
    setKnightName(generateRandomKnightName());
  }

  function handleToggleSquire(checked: boolean) {
    setCreateSquire(checked);
    if (checked && !squire) {
      setSquire(generateRandomSquire());
    }
  }

  function handleFinishCreation() {
    if (!hasRolledAttributes || !selectedKnightId) return;
    const finalName = knightName || '新骑士';
    createCharacter(
      selectedKnightId,
      finalName,
      {
        vig: rolledVig,
        cla: rolledCla,
        spi: rolledSpi,
        gd: rolledGd,
      },
      createSquire && squire ? squire : undefined
    );
    navigate('/player');
  }

  const selectedKnight: KnightArchetype | undefined = KNIGHT_DB.find(k => k.id === selectedKnightId);
  const groups = getKnightGroups();

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* 步骤导航 */}
      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚔️ 骑士车卡向导 (Character Wizard)</span>
        </div>
        <div className="panel-body" style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ fontWeight: step === 1 ? 700 : 400, color: step === 1 ? 'var(--crimson-primary)' : 'var(--text-dim)' }}>
            1. 开局与属性
          </div>
          <div style={{ color: 'var(--text-dim)' }}>➔</div>
          <div style={{ fontWeight: step === 2 ? 700 : 400, color: step === 2 ? 'var(--crimson-primary)' : 'var(--text-dim)' }}>
            2. 选择原型
          </div>
          <div style={{ color: 'var(--text-dim)' }}>➔</div>
          <div style={{ fontWeight: step === 3 ? 700 : 400, color: step === 3 ? 'var(--crimson-primary)' : 'var(--text-dim)' }}>
            3. 命名保存
          </div>
        </div>
      </div>

      {/* 步骤 1 */}
      {step === 1 && (
        <div className="panel">
          <div className="panel-header">步骤 1：骑士开局 (Start) 与美德掷骰</div>
          <div className="panel-body" style={{ gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {STARTS.map(start => (
                <label
                  key={start.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedStart === start.id ? 'var(--crimson-light)' : 'var(--bg-surface)',
                    border: `1px solid ${selectedStart === start.id ? 'var(--crimson-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="start"
                    value={start.id}
                    checked={selectedStart === start.id}
                    onChange={() => handleStartChange(start.id)}
                    style={{ marginTop: '0.2rem', accentColor: 'var(--crimson-primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--crimson-primary)' }}>{start.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      美德: {start.virtueFormula} | 防护: {start.gdFormula}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--crimson-primary)' }}>属性随机掷骰：</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allowUnlimitedRolls}
                      onChange={e => setAllowUnlimitedRolls(e.target.checked)}
                      style={{ accentColor: 'var(--crimson-primary)' }}
                    />
                    ⚡ 允许无限重掷
                  </label>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleRollStep1}
                    disabled={!canRollAttributes}
                  >
                    🎲 投掷属性 {!allowUnlimitedRolls && `(${attributeRollCount}/1)`}
                  </button>
                </div>
              </div>

              {hasRolledAttributes && rolledStats ? (
                <>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    掷骰明细: 活力 {rolledStats.details.vigRoll} | 敏锐 {rolledStats.details.claRoll} | 精神 {rolledStats.details.spiRoll} | 防护 {rolledStats.details.gdRoll}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textWrap: 'nowrap', textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>活力 (VIG)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--crimson-primary)' }}>{rolledVig}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>敏锐 (CLA)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--crimson-primary)' }}>{rolledCla}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>精神 (SPI)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--crimson-primary)' }}>{rolledSpi}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>防护 (GD)</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--crimson-primary)' }}>{rolledGd}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  请先点击右侧“🎲 投掷属性”按规则公式掷骰
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!hasRolledAttributes}>
                下一步：选择骑士原型 ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 2 */}
      {step === 2 && (
        <div className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>步骤 2：骑士原型 (72 原型 d6+d12)</span>
            <button className="btn btn-sm btn-primary" onClick={handleRandomKnight}>
              🎲 抽选骑士 (d6+d12)
            </button>
          </div>
          <div className="panel-body" style={{ gap: '1rem' }}>
            {hasRolledKnight && knightRoll ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                抽选结果: 🎲 Group {knightRoll.d6}, Roll {knightRoll.d12} ➔ <strong>{knightRoll.knight.number}: {knightRoll.knight.name}</strong>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                请点击右上角“🎲 抽选骑士 (d6+d12)”随机抽取，或从下方下拉列表选择。
              </div>
            )}

            <div className="form-group">
              <label className="form-label">骑士原型</label>
              <select
                className="form-select"
                value={selectedKnightId}
                onChange={e => { setSelectedKnightId(e.target.value); setHasRolledKnight(true); }}
              >
                <option value="">— 选择原型 —</option>
                {Object.entries(groups).map(([g, list]) => (
                  <optgroup key={g} label={`第 ${g} 组`}>
                    {list.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.number}: {k.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedKnight && (
              <div className="ability-card" style={{ background: 'var(--bg-surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--crimson-primary)', marginBottom: '0.2rem' }}>
                  {selectedKnight.number}: {selectedKnight.name}
                </div>
                <div style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)', color: 'var(--text-muted)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  “{selectedKnight.flavor}”
                </div>
                <div style={{ fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                  <strong>能力:</strong> {selectedKnight.ability.name} — {selectedKnight.ability.description}
                </div>
                <div style={{ fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                  <strong>热忱:</strong> {selectedKnight.passion.name} — {selectedKnight.passion.description}
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  <strong>先知:</strong> {selectedKnight.seer.name}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>上一步</button>
              <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!selectedKnightId}>
                下一步：命名与保存 ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 步骤 3 */}
      {step === 3 && selectedKnight && (
        <div className="panel">
          <div className="panel-header">步骤 3：命名与保存</div>
          <div className="panel-body" style={{ gap: '1rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>骑士姓名 / 名号</label>
                <button className="btn btn-sm btn-primary" onClick={handleRandomName}>
                  🎲 随机生成名号
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="例如: 瑟娜拉"
                value={knightName}
                onChange={e => setKnightName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: 'var(--crimson-primary)' }}>
                <input
                  type="checkbox"
                  checked={createSquire}
                  onChange={e => handleToggleSquire(e.target.checked)}
                  style={{ accentColor: 'var(--crimson-primary)' }}
                />
                生成随从侍从 (Squire)
              </label>
              {createSquire && squire && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  侍从属性: VIG {squire.vig.current} | CLA {squire.cla.current} | SPI {squire.spi.current} | GD {squire.gd.current} | 装备: {squire.weapons.map(w=>w.name).join(', ')}
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--crimson-primary)', fontSize: '0.95rem' }}>
                {knightName || '未命名'} · {selectedKnight.name}
              </div>
              <div>美德: VIG {rolledVig} · CLA {rolledCla} · SPI {rolledSpi} · GD {rolledGd}</div>
              <div>能力: {selectedKnight.ability.name}</div>
              <div>先知: {selectedKnight.seer.name}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>上一步</button>
              <button className="btn btn-primary btn-lg" onClick={handleFinishCreation}>
                完成创建
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
