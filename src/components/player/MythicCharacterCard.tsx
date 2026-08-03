import React from 'react';
import type { Character } from '../../types';
import { getKnightById } from '../../data/knights';
import './MythicCharacterSheet.css';

interface MythicCharacterCardProps {
  character: Character;
  theme?: 'classic' | 'parchment';
  isEditable?: boolean;
  showGMSecrets?: boolean;
  onUpdate?: (mutator: (c: Character) => void) => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function MythicCharacterCard({
  character: c,
  theme = 'classic',
  isEditable = false,
  showGMSecrets = false,
  onUpdate,
  cardRef,
}: MythicCharacterCardProps) {
  // Helper for field updating
  const handleTextChange = (field: string, val: string) => {
    if (!onUpdate) return;
    onUpdate(draft => {
      if (field === 'name') draft.name = val;
      else if (field === 'age') draft.age = val as 'Young' | 'Mature' | 'Old';
      else if (field === 'glory') draft.glory = parseInt(val) || 0;
    });
  };

  const handleVirtueChange = (virtue: 'vig' | 'cla' | 'spi', key: 'current' | 'max', val: number) => {
    if (!onUpdate) return;
    onUpdate(draft => {
      draft.virtues[virtue][key] = Math.max(0, val);
    });
  };

  const handleGDChange = (key: 'current' | 'max', val: number) => {
    if (!onUpdate) return;
    onUpdate(draft => {
      draft.gd[key] = Math.max(0, val);
    });
  };

  const handleCustomConditionToggle = (condition: string) => {
    if (!onUpdate) return;
    onUpdate(draft => {
      if (draft.conditions.customConditions.includes(condition)) {
        draft.conditions.customConditions = draft.conditions.customConditions.filter(x => x !== condition);
      } else {
        draft.conditions.customConditions.push(condition);
      }
    });
  };

  const knightDef = getKnightById(c.knightType);

  // Extract weapons, property items
  const weaponsList = c.weapons.map(w => `${w.name} (${w.dice}${w.tags.length ? ' ' + w.tags.join(' ') : ''})`);

  // Total armour score calculation
  const totalArmour = c.armour.reduce((sum, a) => sum + a.score, 0);

  // Property items formatted
  const propertyItems: string[] = [];
  if (weaponsList.length > 0) propertyItems.push(weaponsList.join(', '));
  c.inventory.forEach(i => propertyItems.push(i.name));
  c.carried.forEach(i => propertyItems.push(i.name + (i.dice ? ` (${i.dice})` : '')));
  if (c.mount) propertyItems.push(`坐骑: ${c.mount.name} (${c.mount.type || '战马'})`);

  const ageLabelMap: Record<string, string> = {
    Young: '青年',
    Mature: '中年',
    Old: '老年',
  };

  const getRankLabel = (glory: number) => {
    if (glory >= 30) return '荣光骑士';
    if (glory >= 20) return '御统骑士';
    if (glory >= 10) return '拥土骑士';
    if (glory >= 5) return '勇武骑士';
    return '游侠骑士';
  };

  return (
    <div className="mythic-sheet-wrapper">
      <div
        ref={cardRef}
        className={`mythic-sheet ${theme === 'parchment' ? 'theme-parchment' : ''}`}
        id="mythic-character-sheet"
      >
        {/* Top Ornament Filigree */}
        <div className="mythic-border-top">
          <div className="mythic-border-pattern"></div>
        </div>

        {/* Top 3-Column Grid */}
        <div className="mythic-grid-top">
          {/* ================= LEFT COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Name */}
            <div>
              <div className="mythic-field-label">其名为</div>
              <div className="mythic-box-input">
                {isEditable ? (
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => handleTextChange('name', e.target.value)}
                    placeholder="骑士姓名"
                  />
                ) : (
                  <span>{c.name || '未命名骑士'}</span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="mythic-field-label">乃是</div>
              <div className="mythic-box-input">
                {isEditable ? (
                  <input
                    type="text"
                    value={c.ability.name ? `${c.ability.name.replace(/^[†‡\s]+|[†‡\s]+$/g, '')}` : '骑士'}
                    onChange={e => {
                      if (onUpdate) {
                        const val = e.target.value;
                        onUpdate(draft => { draft.ability.name = val; });
                      }
                    }}
                  />
                ) : (
                  <span>{c.ability.name ? `${c.ability.name}` : (knightDef?.name || '骑士')}</span>
                )}
              </div>
            </div>

            {/* Rank */}
            <div>
              <div className="mythic-field-label">阶层</div>
              <div className="mythic-box-input">
                <span>{getRankLabel(c.glory)}</span>
              </div>
            </div>

            {/* Conditions */}
            <div className="mythic-conditions">
              <div className="mythic-field-label" style={{ fontSize: '1.25rem' }}>状态</div>
              {[
                { id: 'Exhausted', label: '精疲力竭 (Exhausted)' },
                { id: 'Impaired', label: '受损阻碍 (Impaired)' },
                { id: 'Exposed', label: '遭受暴露 (Exposed)' },
                { id: 'Fatigued', label: '疲劳 (Fatigued)' },
              ].map(cond => {
                const isChecked = c.conditions.customConditions.includes(cond.id) ||
                  (cond.id === 'Fatigued' && (c.feats.smite === 'fatigued' || c.feats.focus === 'fatigued' || c.feats.deny === 'fatigued')) ||
                  (cond.id === 'Exhausted' && c.virtues.vig.current === 0) ||
                  (cond.id === 'Exposed' && c.virtues.cla.current === 0) ||
                  (cond.id === 'Impaired' && c.virtues.spi.current === 0);

                return (
                  <div
                    key={cond.id}
                    className="mythic-condition-row"
                    onClick={() => isEditable && handleCustomConditionToggle(cond.id)}
                  >
                    <span>{cond.label}</span>
                    <span className={`mythic-diamond-checkbox ${isChecked ? 'checked' : ''}`}></span>
                  </div>
                );
              })}
            </div>

            {/* Steed Sub-Card */}
            <div className="mythic-steed-box">
              <div className="mythic-field-label" style={{ fontSize: '1.15rem', marginTop: '4px' }}>坐骑</div>
              <div style={{ fontSize: '0.78rem' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>坐骑名</div>
                <div className="mythic-box-input" style={{ minHeight: '22px', fontSize: '0.82rem' }}>
                  <span>{c.mount?.name || '忠诚坐骑'}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>描述</div>
                <div className="mythic-box-input" style={{ minHeight: '22px', fontSize: '0.82rem' }}>
                  <span>{c.mount?.note || '并肩作战的巡礼战马'}</span>
                </div>
              </div>
              <div className="mythic-steed-line">
                <span>活力 VIG</span>
                <span>{c.mount?.vig.current ?? 9}</span>
              </div>
              <div className="mythic-steed-line">
                <span>敏锐 CLA</span>
                <span>{c.mount?.cla.current ?? 8}</span>
              </div>
              <div className="mythic-steed-line">
                <span>精神 SPI</span>
                <span>{c.mount?.spi.current ?? 5}</span>
              </div>
              <div className="mythic-steed-line">
                <span>防护 Guard</span>
                <span>{c.mount?.gd.current ?? 3}</span>
              </div>
              <div className="mythic-steed-line">
                <span>护甲 Armour</span>
                <span>{c.mount?.armour ?? 0}</span>
              </div>
              <div className="mythic-steed-line">
                <span>践踏 / 攻击</span>
                <span>{c.mount?.trample || '—'}</span>
              </div>
            </div>

            {/* Extra Lines */}
            <div style={{ marginTop: '8px' }}>
              <div className="mythic-field-label" style={{ fontSize: '1.1rem' }}>角色备注 / 伤痕</div>
              <div style={{ borderBottom: '1px solid #000', height: '18px', marginBottom: '4px' }}></div>
              <div style={{ borderBottom: '1px solid #000', height: '18px' }}></div>
            </div>
          </div>

          {/* ================= CENTER COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Gothic Header Title */}
            <div className="mythic-main-title">
              <h1 className="mythic-logo-text font-gothic">
                <span className="first-letter">m</span>ythic <span className="first-letter">B</span>astionlan<span className="first-letter">D</span>
              </h1>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'serif', marginTop: '2px', letterSpacing: '0.1em' }}>
                神话堡垒之地
              </div>
              <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>
                誓言·OATH ： 探寻神话 · 尊崇先知 · 保护国度
              </div>
            </div>

            {/* 3 Main Virtues */}
            <div className="mythic-virtues-row">
              {/* Vigour */}
              <div className="mythic-virtue-cell">
                <div className="mythic-field-label">活力 VIGour</div>
                <div className="mythic-diamond-container">
                  <div className="mythic-diamond-content">
                    <div className="mythic-stat-val">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '28px', textAlign: 'center', fontSize: '1rem', border: 'none', background: 'transparent' }}
                          value={c.virtues.vig.current}
                          onChange={e => handleVirtueChange('vig', 'current', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.virtues.vig.current
                      )}
                    </div>
                    <div className="mythic-diamond-line"></div>
                    <div className="mythic-stat-subval">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '24px', textAlign: 'center', fontSize: '0.7rem', border: 'none', background: 'transparent' }}
                          value={c.virtues.vig.max}
                          onChange={e => handleVirtueChange('vig', 'max', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.virtues.vig.max
                      )}
                    </div>
                  </div>
                </div>
                <div className="mythic-virtue-subtext">
                  回复：热情招待或消耗燃料
                </div>
              </div>

              {/* Clarity */}
              <div className="mythic-virtue-cell">
                <div className="mythic-field-label">敏锐 CLArity</div>
                <div className="mythic-diamond-container">
                  <div className="mythic-diamond-content">
                    <div className="mythic-stat-val">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '28px', textAlign: 'center', fontSize: '1rem', border: 'none', background: 'transparent' }}
                          value={c.virtues.cla.current}
                          onChange={e => handleVirtueChange('cla', 'current', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.virtues.cla.current
                      )}
                    </div>
                    <div className="mythic-diamond-line"></div>
                    <div className="mythic-stat-subval">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '24px', textAlign: 'center', fontSize: '0.7rem', border: 'none', background: 'transparent' }}
                          value={c.virtues.cla.max}
                          onChange={e => handleVirtueChange('cla', 'max', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.virtues.cla.max
                      )}
                    </div>
                  </div>
                </div>
                <div className="mythic-virtue-subtext">
                  回复：先知指引或消耗活剂
                </div>
              </div>

              {/* Spirit */}
              <div className="mythic-virtue-cell">
                <div className="mythic-field-label">精神 SPIrit</div>
                <div className="mythic-diamond-container">
                  <div className="mythic-diamond-content">
                    <div className="mythic-stat-val">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '28px', textAlign: 'center', fontSize: '1rem', border: 'none', background: 'transparent' }}
                          value={c.virtues.spi.current}
                          onChange={e => handleVirtueChange('spi', 'current', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.virtues.spi.current
                      )}
                    </div>
                    <div className="mythic-diamond-line"></div>
                    <div className="mythic-stat-subval">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '24px', textAlign: 'center', fontSize: '0.7rem', border: 'none', background: 'transparent' }}
                          value={c.virtues.spi.max}
                          onChange={e => handleVirtueChange('spi', 'max', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.virtues.spi.max
                      )}
                    </div>
                  </div>
                </div>
                <div className="mythic-virtue-subtext">
                  回复：追求热忱或消耗圣物
                </div>
              </div>
            </div>

            {/* Guard & Armour Row */}
            <div className="mythic-guard-armour-row">
              {/* Guard */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="mythic-field-label">防护 GuarD</div>
                <div className="mythic-diamond-container">
                  <div className="mythic-diamond-content">
                    <div className="mythic-stat-val">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '28px', textAlign: 'center', fontSize: '1rem', border: 'none', background: 'transparent' }}
                          value={c.gd.current}
                          onChange={e => handleGDChange('current', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.gd.current
                      )}
                    </div>
                    <div className="mythic-diamond-line"></div>
                    <div className="mythic-stat-subval">
                      {isEditable ? (
                        <input
                          type="number"
                          style={{ width: '24px', textAlign: 'center', fontSize: '0.7rem', border: 'none', background: 'transparent' }}
                          value={c.gd.max}
                          onChange={e => handleGDChange('max', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        c.gd.max
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Armour */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="mythic-field-label">护甲 Armour</div>
                <div className="mythic-diamond-container">
                  <div className="mythic-diamond-content">
                    <div className="mythic-stat-val" style={{ fontSize: '1.4rem' }}>
                      {totalArmour}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ornamental Flourish Header Line */}
            <div style={{ textAlign: 'center', margin: '-4px 0 2px 0' }}>
              <svg width="60" height="16" viewBox="0 0 60 16" fill="none">
                <path d="M5,8 Q15,0 30,8 Q45,16 55,8 M28,8 A2,2 0 1,1 32,8 A2,2 0 1,1 28,8" stroke="#000" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Ability Banner Block */}
            <div className="mythic-banner-block">
              <div className="mythic-banner-header">能力</div>
              <div className="mythic-banner-content">
                <div className="mythic-dagger-title">
                  † {c.ability.name || '死亡拒绝'} †
                </div>
                <div>
                  {c.ability.description || '在死亡时触发。获得生还，身体维持死亡前的状态，防护与美德也是如此。'}
                </div>
              </div>
            </div>

            {/* Passion Banner Block */}
            <div className="mythic-banner-block">
              <div className="mythic-banner-header">热忱</div>
              <div className="mythic-banner-content">
                <div className="mythic-dagger-title">
                  ‡ {c.passion.name || '接纳'} ‡
                </div>
                <div>
                  {c.passion.description || '当被某人热情地邀请到家中时，恢复精神。'}
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Age */}
            <div>
              <div className="mythic-field-label">年龄</div>
              <div className="mythic-box-input">
                {isEditable ? (
                  <select
                    value={c.age}
                    onChange={e => handleTextChange('age', e.target.value)}
                    style={{ border: 'none', background: 'transparent', textAlign: 'center', fontFamily: 'inherit', outline: 'none' }}
                  >
                    <option value="Young">青年</option>
                    <option value="Mature">中年</option>
                    <option value="Old">老年</option>
                  </select>
                ) : (
                  <span>{ageLabelMap[c.age] || c.age}</span>
                )}
              </div>
            </div>

            {/* Glory */}
            <div>
              <div className="mythic-field-label">荣誉 Glory</div>
              <div className="mythic-box-input">
                {isEditable ? (
                  <input
                    type="number"
                    value={c.glory}
                    onChange={e => handleTextChange('glory', e.target.value)}
                  />
                ) : (
                  <span>{c.glory}</span>
                )}
              </div>
            </div>

            {/* Crossed Swords SVG Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
                <path d="M15,45 L85,5 M85,5 L80,3 M85,5 L87,10" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                <path d="M85,45 L15,5 M15,5 L20,3 M15,5 L13,10" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="40" r="3" fill="#000" />
                <circle cx="80" cy="40" r="3" fill="#000" />
              </svg>
            </div>

            {/* Arms Box */}
            <div>
              <div className="mythic-field-label">兵器 / 武器</div>
              <div className="mythic-arms-table">
                {c.weapons.length > 0 ? (
                  c.weapons.map((w, idx) => (
                    <div key={idx} className="mythic-item-line">
                      {w.name} ({w.dice}{w.tags.length ? ` ${w.tags.join(' ')}` : ''})
                    </div>
                  ))
                ) : (
                  <>
                    <div className="mythic-item-line">芒刺斧 (d10 长)</div>
                    <div className="mythic-item-line">匕首 (d6)</div>
                  </>
                )}
              </div>
            </div>

            {/* Shield SVG Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <svg width="70" height="70" viewBox="0 0 60 70" fill="none">
                <path d="M30,5 Q55,5 55,30 Q55,60 30,68 Q5,60 5,30 Q5,5 30,5 Z" stroke="#000" strokeWidth="2" fill="none" />
                <path d="M30,12 L30,60 M12,30 L48,30" stroke="#000" strokeWidth="1" strokeDasharray="3 2" />
              </svg>
            </div>

            {/* Armour Box */}
            <div>
              <div className="mythic-field-label">防具 / 护甲</div>
              <div className="mythic-armour-table">
                {c.armour.length > 0 ? (
                  c.armour.map((a, idx) => (
                    <div key={idx} className="mythic-item-line">
                      {a.name} (A{a.score})
                    </div>
                  ))
                ) : (
                  <div className="mythic-item-line">蒙尘链甲 (A1)</div>
                )}
                <div className="mythic-item-line" style={{ height: '18px' }}></div>
                <div className="mythic-item-line" style={{ height: '18px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM GRID ================= */}
        <div className="mythic-grid-bottom">
          {/* Property Block */}
          <div className="mythic-banner-block">
            <div className="mythic-banner-header">财产</div>
            <div className="mythic-banner-content">
              <ul className="mythic-gambit-list">
                {propertyItems.length > 0 ? (
                  propertyItems.map((item, idx) => <li key={idx}>{item}</li>)
                ) : (
                  <>
                    <li>芒刺斧 (d10 长), 匕首 (d6)</li>
                    <li>洗盐（可让完全腐败的食物也能变得安全可口，每个新季节开始时补足）</li>
                    <li>动物木偶</li>
                    <li>火把、绳索、干粮、露营用具</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Notes Block (Player View vs GM View) */}
          <div className="mythic-banner-block">
            <div className="mythic-banner-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>{showGMSecrets ? '册封先知秘辛与笔记 (GM视角)' : '册封先知印记与战役笔记'}</span>
            </div>
            <div className="mythic-banner-content">
              {showGMSecrets ? (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                    Ø {knightDef?.seer.name || '册封先知秘辛'} Ø
                  </div>
                  <div style={{ fontSize: '0.82rem', marginBottom: '4px', color: '#854d0e', fontWeight: 'bold' }}>
                    {knightDef?.seer.description || '由裁判掌控的先知属性与隐秘秘辛。'}
                  </div>
                </>
              ) : (
                <>
                  {knightDef?.seer ? (
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px dashed #d6d3d1', paddingBottom: '4px' }}>
                      Ø 册封先知：{knightDef.seer.name} Ø
                      <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#78716c', marginTop: '2px' }}>
                        🔒 (先知具体属性、神圣秘辛与隐秘意图由裁判控制台独享掌理)
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      Ø 骑士巡礼笔记 Ø
                    </div>
                  )}
                </>
              )}

              {/* Player Journal / Campaign Notes */}
              {c.journal && c.journal.length > 0 ? (
                <ul className="mythic-gambit-list" style={{ marginTop: '4px' }}>
                  {c.journal.slice(-4).map((entry, idx) => (
                    <li key={idx}>{entry.timestamp ? `${entry.timestamp.split('T')[0]}: ` : ''}{entry.text}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#78716c', fontStyle: 'italic', marginTop: '4px' }}>
                  在此书写巡礼誓言、战役留痕或预兆记录...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= GAMBITS & FEATS ROW ================= */}
        <div className="mythic-gambits-feats-row">
          {/* Gambits Block */}
          <div>
            <div className="mythic-field-label" style={{ textAlign: 'left', fontSize: '1.4rem' }}>策略 (弃掉4+骰子，强效为8+)</div>
            <ul className="mythic-gambit-list">
              <li><strong>猛力</strong>：攻击来造成额外+1点伤害</li>
              <li><strong>移动</strong>：在发起攻击之后</li>
              <li><strong>击退</strong>：你面前的敌人</li>
              <li><strong>阻挡</strong>：敌人移动一回合</li>
              <li><strong>缴械</strong>：敌人一回合</li>
              <li><strong>锁死</strong>：敌人的盾牌一回合</li>
              <li><strong>落马</strong>：击落敌人马下</li>
            </ul>
            <div style={{ fontSize: '0.78rem', fontStyle: 'italic', marginTop: '6px' }}>
              其他效果只要影响相近，目标可通过活力豁免规避。
            </div>
          </div>

          {/* Feats Block */}
          <div>
            <div className="mythic-field-label" style={{ textAlign: 'left', fontSize: '1.4rem' }}>战技</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {/* Smite */}
              <div className="mythic-feat-item">
                <div className="mythic-feat-name">猛击</div>
                <div className="mythic-feat-details">
                  让近战攻击+d12或变为范围。<br />
                  通过活力豁免否则疲劳。
                </div>
              </div>

              {/* Focus */}
              <div className="mythic-feat-item">
                <div className="mythic-feat-name">专注</div>
                <div className="mythic-feat-details">
                  不消耗骰子使用策略。<br />
                  通过敏锐豁免否则疲劳。
                </div>
              </div>

              {/* Deny */}
              <div className="mythic-feat-item">
                <div className="mythic-feat-name">招架</div>
                <div className="mythic-feat-details">
                  弃掉一颗针对你，或相邻盟友的攻击骰。<br />
                  通过精神豁免否则疲劳。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Ornament Filigree */}
        <div className="mythic-border-bottom">
          <div className="mythic-border-pattern"></div>
        </div>
      </div>
    </div>
  );
}
