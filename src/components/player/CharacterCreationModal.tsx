import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KNIGHT_DB, getKnightGroups } from '../../data/knights';
import { useCharacterStore } from '../../stores/useCharacterStore';
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

export default function CharacterCreationModal({
  onClose,
  canClose,
}: {
  onClose: () => void;
  canClose: boolean;
}) {
  const navigate = useNavigate();
  const { createCharacter } = useCharacterStore();

  // 1. 开局 (默认选定 'adventurer')
  const [startId, setStartId] = useState<string>('adventurer');

  // 2. 属性投掷状态 (默认未投掷，限投 1 次)
  const [hasRolledAttributes, setHasRolledAttributes] = useState<boolean>(false);
  const [attributeRollCount, setAttributeRollCount] = useState<number>(0);
  const [allowUnlimitedRolls, setAllowUnlimitedRolls] = useState<boolean>(false);
  const [startRollDetails, setStartRollDetails] = useState<StartRollResult | null>(null);

  const [vig, setVig] = useState<number>(0);
  const [cla, setCla] = useState<number>(0);
  const [spi, setSpi] = useState<number>(0);
  const [gd, setGd] = useState<number>(0);

  // 3. 骑士原型
  const [hasRolledKnight, setHasRolledKnight] = useState<boolean>(false);
  const [knightRoll, setKnightRoll] = useState<{ knight: KnightArchetype; d6: number; d12: number } | null>(null);
  const [knightId, setKnightId] = useState<string>('');

  // 4. 骑士姓名
  const [name, setName] = useState<string>('');

  // 5. 侍从
  const [createSquire, setCreateSquire] = useState<boolean>(false);
  const [squire, setSquire] = useState<SquireData | null>(null);

  const groups = getKnightGroups();
  const selectedKnight: KnightArchetype | undefined = KNIGHT_DB.find(k => k.id === knightId);

  // 判断是否允许投掷属性
  const canRollAttributes = attributeRollCount === 0 || allowUnlimitedRolls;

  // 投掷属性
  function handleRollAttributes() {
    if (!canRollAttributes) return;
    const rolled = rollStartStats(startId);
    setStartRollDetails(rolled);
    setVig(rolled.vig);
    setCla(rolled.cla);
    setSpi(rolled.spi);
    setGd(rolled.gd);
    setHasRolledAttributes(true);
    setAttributeRollCount(prev => prev + 1);
  }

  // 切换开局
  function handleStartChange(newStartId: string) {
    setStartId(newStartId);
    // 切换开局时重置投掷状态
    setHasRolledAttributes(false);
    setAttributeRollCount(0);
    setStartRollDetails(null);
    setVig(0);
    setCla(0);
    setSpi(0);
    setGd(0);
  }

  // 抽选骑士原型
  function handleRollKnight() {
    const rolled = rollRandomKnightArchetype();
    setKnightRoll(rolled);
    setKnightId(rolled.knight.id);
    setHasRolledKnight(true);
  }

  // 生成骑士名号
  function handleRollName() {
    setName(generateRandomKnightName());
  }

  // 切换/生成侍从
  function handleToggleSquire(checked: boolean) {
    setCreateSquire(checked);
    if (checked && !squire) {
      setSquire(generateRandomSquire());
    }
  }

  function handleRollSquire() {
    setSquire(generateRandomSquire());
  }

  function handleCreate() {
    if (!hasRolledAttributes) {
      alert('请先完成第 2 步：投掷属性。');
      return;
    }
    if (!knightId) {
      alert('请先完成第 3 步：抽选骑士原型。');
      return;
    }

    createCharacter(
      knightId,
      name || '新骑士',
      { vig, cla, spi, gd },
      createSquire && squire ? squire : undefined
    );
    navigate('/player');
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && canClose) onClose(); }}>
      <div className="modal-box creation-modal" style={{ maxWidth: '780px', width: '92%' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>⚔️ 创建新骑士 (Create Knight)</h2>
          {canClose && (
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          )}
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. 骑士开局 */}
          <div className="creation-section" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--crimson-primary)' }}>
              1. 选择骑士开局 (Start)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {STARTS.map(s => (
                <label
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: startId === s.id ? 'var(--crimson-light)' : 'var(--bg-card)',
                    border: `1px solid ${startId === s.id ? 'var(--crimson-primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <input
                    type="radio"
                    name="modal-start"
                    value={s.id}
                    checked={startId === s.id}
                    onChange={() => handleStartChange(s.id)}
                    style={{ accentColor: 'var(--crimson-primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      美德: {s.virtueFormula} | 防护: {s.gdFormula}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. 投掷属性 */}
          <div className="creation-section" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--crimson-primary)' }}>
                2. 投掷属性 (Virtues & GD)
              </div>
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
                  onClick={handleRollAttributes}
                  disabled={!canRollAttributes}
                >
                  🎲 投掷属性 {!allowUnlimitedRolls && `(${attributeRollCount}/1)`}
                </button>
              </div>
            </div>

            {hasRolledAttributes && startRollDetails ? (
              <>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  投掷明细: 活力 {startRollDetails.details.vigRoll} | 敏锐 {startRollDetails.details.claRoll} | 精神 {startRollDetails.details.spiRoll} | 防护 {startRollDetails.details.gdRoll}
                </div>

                <div className="virtue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label">活力 (VIG)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, padding: '0.4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--crimson-primary)' }}>
                      {vig}
                    </div>
                  </div>
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label">敏锐 (CLA)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, padding: '0.4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--crimson-primary)' }}>
                      {cla}
                    </div>
                  </div>
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label">精神 (SPI)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, padding: '0.4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--crimson-primary)' }}>
                      {spi}
                    </div>
                  </div>
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label">防护 (GD)</label>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, padding: '0.4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--crimson-primary)' }}>
                      {gd}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                点击“🎲 投掷属性”按钮进行初始美德与防护随机投掷
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              💡 提示：建卡阶段属性由掷骰决定，完成建卡后可在角色卡页面直接修改/自定义属性。
            </div>
          </div>

          {/* 3. 抽选骑士原型 */}
          <div className="creation-section" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--crimson-primary)' }}>
                3. 抽选骑士原型 (Knight Archetype)
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleRollKnight}>
                🎲 抽选骑士 (d6+d12)
              </button>
            </div>

            {hasRolledKnight && knightRoll ? (
              <>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  抽选结果: 🎲 Group {knightRoll.d6}, Roll {knightRoll.d12} ➔ <strong>{knightRoll.knight.number}: {knightRoll.knight.name}</strong>
                </div>

                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <select
                    className="form-select"
                    value={knightId}
                    onChange={e => { setKnightId(e.target.value); setHasRolledKnight(true); }}
                  >
                    <option value="">— 请选择骑士原型 —</option>
                    <option value="custom">— 自定义骑士 (Custom Knight) —</option>
                    {Object.entries(groups)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([group, knights]) => (
                        <optgroup key={group} label={`第 ${group} 组 (Group ${group})`}>
                          {knights.map(k => (
                            <option key={k.id} value={k.id}>
                              {k.number}: {k.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </div>

                {/* 骑士预览 */}
                {selectedKnight && (
                  <div className="knight-preview" style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <p className="knight-flavor" style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>“{selectedKnight.flavor}”</p>
                    <div className="knight-preview-detail" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <strong>⚡ 能力:</strong> {selectedKnight.ability.name} — {selectedKnight.ability.description}
                    </div>
                    <div className="knight-preview-detail" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <strong>🔥 热忱:</strong> {selectedKnight.passion.name} — {selectedKnight.passion.description}
                    </div>
                    <div className="knight-preview-detail" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <strong>🔮 册封先知:</strong> {selectedKnight.seer.name} ({selectedKnight.seer.description})
                    </div>
                    <div className="knight-preview-props" style={{ fontSize: '0.85rem' }}>
                      <strong>📦 初始财产:</strong>
                      <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0 }}>
                        {selectedKnight.property.map((p, i) => {
                          if (p.type === 'weapon') return <li key={i}>⚔️ {p.name} ({(p as { type: 'weapon'; dice: string }).dice}{(p as { type: 'weapon'; tags: string[] }).tags?.length ? ', ' + (p as { type: 'weapon'; tags: string[] }).tags.join(', ') : ''})</li>;
                          if (p.type === 'armour') return <li key={i}>🛡️ {p.name}</li>;
                          if (p.type === 'mount') return <li key={i}>🐴 {p.name} (活力 {(p as { type: 'mount'; vig: number }).vig}, 敏锐 {(p as { type: 'mount'; cla: number }).cla}, 精神 {(p as { type: 'mount'; spi: number }).spi}, 防护 {(p as { type: 'mount'; gd: number }).gd})</li>;
                          return <li key={i}>📦 {p.name}</li>;
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                点击“🎲 抽选骑士 (d6+d12)”按钮随机决定你的 72 骑士原型
              </div>
            )}
          </div>

          {/* 4. 骑士姓名与名号 */}
          <div className="creation-section" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--crimson-primary)' }}>
                4. 骑士姓名 / 名号
              </label>
              <button className="btn btn-sm btn-primary" onClick={handleRollName}>
                🎲 随机生成名号
              </button>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="text"
                className="form-input"
                placeholder="点击右侧按钮随机生成，或手动输入骑士姓名..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          {/* 5. 随从侍从 (可选) */}
          <div className="creation-section" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, color: 'var(--crimson-primary)' }}>
                <input
                  type="checkbox"
                  checked={createSquire}
                  onChange={e => handleToggleSquire(e.target.checked)}
                  style={{ accentColor: 'var(--crimson-primary)' }}
                />
                5. 生成随从侍从 (Squire - 1-2名骑士队伍适用)
              </label>
              {createSquire && (
                <button className="btn btn-sm btn-primary" onClick={handleRollSquire}>
                  🎲 重新掷骰侍从
                </button>
              )}
            </div>

            {createSquire && squire && (
              <div style={{ marginTop: '0.75rem', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <div><strong>侍从属性 (2d6):</strong> 活力 {squire.vig.current} | 敏锐 {squire.cla.current} | 精神 {squire.spi.current} | 防护 {squire.gd.current} GD</div>
                <div><strong>坐骑:</strong> 小马 (活力 7, 敏锐 7, 精神 2, 2 GD)</div>
                <div><strong>装备:</strong> 匕首 (d6) {squire.weapons.length > 1 ? `+ ${squire.weapons[1].name} (${squire.weapons[1].dice}${squire.weapons[1].tags.length ? ', ' + squire.weapons[1].tags.join(', ') : ''})` : ''}{squire.armour.length > 0 ? `+ ${squire.armour[0].name}` : ''}</div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          {canClose && (
            <button className="btn btn-ghost" onClick={onClose}>取消</button>
          )}
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCreate}
            disabled={!hasRolledAttributes || !knightId}
          >
            完成创建 (Create)
          </button>
        </div>

      </div>
    </div>
  );
}
