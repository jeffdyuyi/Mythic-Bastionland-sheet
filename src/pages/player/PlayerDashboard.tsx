import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacterStore } from '../../stores/useCharacterStore';
import { getKnightLabel } from '../../data/knights';
import { getRank } from '../../data/gameTables';
import CharacterSheet from '../../components/player/CharacterSheet';
import CharacterCreationModal from '../../components/player/CharacterCreationModal';
import BattlePanel from '../../components/player/BattlePanel';
import EquipmentPanel from '../../components/player/EquipmentPanel';

export default function PlayerDashboard() {
  const {
    characterIds,
    characters,
    currentCharacterId,
    currentCharacter,
    switchCharacter,
    deleteCharacter,
    importCharacter,
    exportCharacter,
  } = useCharacterStore();

  const [showCreate, setShowCreate] = useState(!currentCharacterId && characterIds.length === 0);
  const [activeTab, setActiveTab] = useState<'sheet' | 'battle' | 'equipment'>('sheet');

  function handleExport() {
    const char = exportCharacter();
    if (!char) return;
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (char.name || 'knight').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          importCharacter(parsed);
        } catch {
          alert('导入失败：无效的 JSON 文件格式');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleDelete() {
    if (!currentCharacter) return;
    if (!confirm(`确认要删除角色 “${currentCharacter.name}” 吗？`)) return;
    deleteCharacter(currentCharacter.id);
  }

  const rank = currentCharacter ? getRank(currentCharacter.glory) : null;

  return (
    <div className="player-dashboard">
      {/* 角色切换与快捷操作 */}
      <div className="char-switcher-bar">
        <div className="char-switcher-left">
          {characterIds.length > 0 && (
            <select
              value={currentCharacterId ?? ''}
              onChange={e => switchCharacter(e.target.value)}
              className="char-select"
            >
              {characterIds.map(id => (
                <option key={id} value={id}>
                  {characters[id]?.name ?? id}
                </option>
              ))}
            </select>
          )}
          <button className="btn btn-sm btn-primary" onClick={() => setShowCreate(true)}>
            + 新角色
          </button>
          {currentCharacter && (
            <>
              <Link to="/player/card" className="btn btn-sm btn-warning">角色卡 (导出/打印)</Link>
              <button className="btn btn-sm btn-ghost" onClick={handleExport}>导出 JSON</button>
              <button className="btn btn-sm btn-ghost" onClick={handleImport}>导入 JSON</button>
              <button className="btn btn-sm btn-danger" onClick={handleDelete}>删除</button>
            </>
          )}
        </div>

        {currentCharacter && rank && (
          <div className="char-header-info">
            <span className="char-name-display">{currentCharacter.name}</span>
            <Link to={`/player/library`} className="char-type-display hover:underline cursor-pointer" title="点击查阅骑士原型档案">
              {getKnightLabel(currentCharacter.knightType)} 📖
            </Link>
            <span className="char-rank-badge">{rank.rank}</span>
            <span className="char-glory">荣耀: {currentCharacter.glory}</span>
          </div>
        )}
      </div>

      {/* 空状态 */}
      {characterIds.length === 0 && !showCreate && (
        <div className="empty-state">
          <div className="empty-state-icon">⚔️</div>
          <h2>暂无角色</h2>
          <p>请创建您的第一位骑士角色。</p>
          <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
            创建角色
          </button>
        </div>
      )}

      {/* 标签页 */}
      {currentCharacter && (
        <>
          <div className="tab-bar">
            <button
              className={`tab-btn ${activeTab === 'sheet' ? 'active' : ''}`}
              onClick={() => setActiveTab('sheet')}
            >
              角色卡
            </button>
            <button
              className={`tab-btn ${activeTab === 'battle' ? 'active' : ''}`}
              onClick={() => setActiveTab('battle')}
            >
              战斗
            </button>
            <button
              className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
              onClick={() => setActiveTab('equipment')}
            >
              装备
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'sheet' && <CharacterSheet />}
            {activeTab === 'battle' && <BattlePanel />}
            {activeTab === 'equipment' && <EquipmentPanel />}
          </div>
        </>
      )}

      {/* 创建弹窗 */}
      {showCreate && (
        <CharacterCreationModal
          onClose={() => setShowCreate(false)}
          canClose={characterIds.length > 0}
        />
      )}
    </div>
  );
}
