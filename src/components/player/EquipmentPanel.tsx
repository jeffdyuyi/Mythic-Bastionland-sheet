import { useState } from 'react';
import { useCharacterStore } from '../../stores/useCharacterStore';
import { Trash2, Plus } from 'lucide-react';

export default function EquipmentPanel() {
  const {
    currentCharacter,
    addWeapon,
    removeWeapon,
    toggleWeaponImpaired,
    addArmour,
    removeArmour,
    toggleArmourTrapped,
    addInventory,
    removeInventory,
  } = useCharacterStore();

  const [weaponName, setWeaponName] = useState('');
  const [weaponDice, setWeaponDice] = useState('d6');
  const [weaponTagStr, setWeaponTagStr] = useState('');

  const [armourName, setArmourName] = useState('');
  const [armourScore, setArmourScore] = useState(1);
  const [armourType, setArmourType] = useState('shield');

  const [itemName, setItemName] = useState('');

  if (!currentCharacter) return null;

  function handleAddWeapon(e: React.FormEvent) {
    e.preventDefault();
    if (!weaponName.trim()) return;
    const tags = weaponTagStr
      ? weaponTagStr.split(/[,，\s]+/).filter(Boolean)
      : [];
    addWeapon({
      type: 'weapon',
      name: weaponName.trim(),
      dice: weaponDice.trim() || 'd6',
      tags,
      custom: true,
    });
    setWeaponName('');
    setWeaponTagStr('');
  }

  function handleAddArmour(e: React.FormEvent) {
    e.preventDefault();
    if (!armourName.trim()) return;
    addArmour({
      type: 'armour',
      name: armourName.trim(),
      armourType,
      score: Number(armourScore) || 1,
      custom: true,
    });
    setArmourName('');
    setArmourScore(1);
  }

  function handleAddInventory(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim()) return;
    addInventory({
      type: 'item',
      name: itemName.trim(),
      custom: true,
    });
    setItemName('');
  }

  return (
    <div className="equipment-panel-grid space-y-6">
      {/* 武器面板 */}
      <div className="panel bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="panel-header font-serif font-bold text-lg text-red-900 dark:text-red-300 pb-2 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <span>⚔️ 武器列表 (Weapons - {currentCharacter.weapons.length})</span>
        </div>
        <div className="panel-body space-y-3 mt-3">
          {currentCharacter.weapons.length === 0 && (
            <p className="text-xs text-stone-500 italic">未携带武器。</p>
          )}
          {currentCharacter.weapons.map((w, i) => {
            const itemId = w.id || `weapon-${i}`;
            return (
              <div
                key={itemId}
                className={`item-row flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                  w.impaired ? 'bg-amber-950/20 border border-amber-500/40' : 'bg-stone-50 dark:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-800 dark:text-stone-200">{w.name}</span>
                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                    w.impaired ? 'bg-amber-500 text-stone-900 line-through' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {w.impaired ? 'd4' : w.dice}
                  </span>
                  {w.impaired && (
                    <span className="px-1.5 py-0.5 bg-amber-500/30 text-amber-800 dark:text-amber-300 rounded text-[10px] font-bold">
                      ⚡ 策略受损 (Impaired)
                    </span>
                  )}
                  {w.tags?.map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded text-[10px]">
                      {t}
                    </span>
                  ))}
                  {w.note && <span className="text-stone-400 italic">({w.note})</span>}
                </div>
                <div className="flex items-center gap-1">
                  {w.id && (
                    <button
                      onClick={() => toggleWeaponImpaired(w.id!)}
                      className={`btn btn-xs ${w.impaired ? 'btn-warning' : 'btn-ghost text-stone-400'}`}
                      title="标记策略导致的武器受损（攻击降阶为 d4）"
                    >
                      ⚡ {w.impaired ? '解除受损' : '受损'}
                    </button>
                  )}
                  {w.id && (
                    <button
                      onClick={() => removeWeapon(w.id!)}
                      className="text-stone-400 hover:text-red-600 transition p-1"
                      title="删除武器"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* 添加武器表单 */}
          <form onSubmit={handleAddWeapon} className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <input
              type="text"
              placeholder="武器名称 (如: 骑士长枪)"
              value={weaponName}
              onChange={e => setWeaponName(e.target.value)}
              className="px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent flex-1 min-w-[120px]"
            />
            <select
              value={weaponDice}
              onChange={e => setWeaponDice(e.target.value)}
              className="px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent font-mono"
            >
              <option value="d4">d4</option>
              <option value="d6">d6</option>
              <option value="d8">d8</option>
              <option value="d10">d10</option>
              <option value="d12">d12</option>
            </select>
            <input
              type="text"
              placeholder="标签 (如: 沉重, 远程)"
              value={weaponTagStr}
              onChange={e => setWeaponTagStr(e.target.value)}
              className="px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent w-28"
            />
            <button type="submit" className="btn btn-xs btn-primary flex items-center gap-1">
              <Plus className="w-3 h-3" /> 添加武器
            </button>
          </form>
        </div>
      </div>

      {/* 护甲面板 */}
      <div className="panel bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="panel-header font-serif font-bold text-lg text-emerald-900 dark:text-emerald-300 pb-2 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <span>🛡️ 护甲与防具 (Armour - {currentCharacter.armour.length})</span>
        </div>
        <div className="panel-body space-y-3 mt-3">
          {currentCharacter.armour.length === 0 && (
            <p className="text-xs text-stone-500 italic">未穿戴护甲。</p>
          )}
          {currentCharacter.armour.map((a, i) => {
            const itemId = a.id || `armour-${i}`;
            return (
              <div
                key={itemId}
                className={`item-row flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                  a.trapped ? 'bg-amber-950/20 border border-amber-500/40' : 'bg-stone-50 dark:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-800 dark:text-stone-200">{a.name}</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-mono font-bold">
                    A{a.score}
                  </span>
                  {a.dice && <span className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded font-mono">{a.dice}</span>}
                  {a.trapped && (
                    <span className="px-1.5 py-0.5 bg-amber-500/30 text-amber-800 dark:text-amber-300 rounded text-[10px] font-bold">
                      🔒 盾牌被困 (Trapped)
                    </span>
                  )}
                  {a.note && <span className="text-stone-400 italic">({a.note})</span>}
                </div>
                <div className="flex items-center gap-1">
                  {a.id && (a.armourType === 'shield' || a.name.includes('盾')) && (
                    <button
                      onClick={() => toggleArmourTrapped(a.id!)}
                      className={`btn btn-xs ${a.trapped ? 'btn-warning' : 'btn-ghost text-stone-400'}`}
                      title="标记盾牌陷阱状态"
                    >
                      🔒 {a.trapped ? '解开陷阱' : '陷阱'}
                    </button>
                  )}
                  {a.id && (
                    <button
                      onClick={() => removeArmour(a.id!)}
                      className="text-stone-400 hover:text-red-600 transition p-1"
                      title="删除护甲"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* 添加护甲表单 */}
          <form onSubmit={handleAddArmour} className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <input
              type="text"
              placeholder="防具名称 (如: 纹章盾)"
              value={armourName}
              onChange={e => setArmourName(e.target.value)}
              className="px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent flex-1 min-w-[120px]"
            />
            <select
              value={armourType}
              onChange={e => setArmourType(e.target.value)}
              className="px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent"
            >
              <option value="shield">盾牌 (Shield)</option>
              <option value="gambeson">棉甲 (Gambeson)</option>
              <option value="mail">锁子甲 (Mail)</option>
              <option value="plates">板甲 (Plates)</option>
              <option value="helm">头盔 (Helm)</option>
            </select>
            <div className="flex items-center gap-1">
              <span>护甲值:</span>
              <input
                type="number"
                min="1"
                max="3"
                value={armourScore}
                onChange={e => setArmourScore(Number(e.target.value))}
                className="w-12 px-1 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent text-center font-mono"
              />
            </div>
            <button type="submit" className="btn btn-xs btn-primary flex items-center gap-1">
              <Plus className="w-3 h-3" /> 添加防具
            </button>
          </form>
        </div>
      </div>

      {/* 背包物品面板 */}
      <div className="panel bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm">
        <div className="panel-header font-serif font-bold text-lg text-amber-900 dark:text-amber-300 pb-2 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
          <span>📦 背包物品 (Inventory - {currentCharacter.inventory.length})</span>
        </div>
        <div className="panel-body space-y-3 mt-3">
          {currentCharacter.inventory.length === 0 && (
            <p className="text-xs text-stone-500 italic">背包为空。</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentCharacter.inventory.map((item, i) => {
              const itemId = item.id || `item-${i}`;
              return (
                <div
                  key={itemId}
                  className="item-row flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800/60 rounded-lg text-xs"
                >
                  <span className="font-medium text-stone-800 dark:text-stone-200">{item.name}</span>
                  {item.id && (
                    <button
                      onClick={() => removeInventory(item.id!)}
                      className="text-stone-400 hover:text-red-600 transition p-1"
                      title="删除物品"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 添加物品表单 */}
          <form onSubmit={handleAddInventory} className="pt-2 flex items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="物品名称 (如: 治疗药水)"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              className="px-2 py-1 border border-stone-300 dark:border-stone-700 rounded bg-transparent flex-1"
            />
            <button type="submit" className="btn btn-xs btn-primary flex items-center gap-1">
              <Plus className="w-3 h-3" /> 添加物品
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
