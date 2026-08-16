import React, { useState, useRef } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import {
  UserPlus,
  Save,
  Download,
  Upload,
  Settings,
  Layers,
  Clock,
} from 'lucide-react';

interface Props {
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  lastAutoSaveTime: string;
}

export const MapHeaderControlBar: React.FC<Props> = ({
  onOpenTemplates,
  onOpenSettings,
  lastAutoSaveTime,
}) => {
  const {
    tokens,
    addToken,
    width,
    height,
    hexes,
    saveCurrentMap,
    importMapJSON,
    mode,
    currentMapTitle,
    movementPhaseActive,
    setMovementPhaseActive,
    partyGroupMode,
    setPartyGroupMode,
    selectedTokenId,
    selectToken,
  } = useMapStore();

  const [newTokenName, setNewTokenName] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isJustSaved, setIsJustSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 导出 JSON
  const handleExportJSON = () => {
    const data = JSON.stringify({ width, height, hexes, tokens, name: currentMapTitle }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMapTitle || 'mythic-hex-map'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importMapJSON(content);
        if (success) {
          alert('地图导入成功！');
        } else {
          alert('地图文件格式不正确！');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAddTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;
    addToken(newTokenName.trim(), Math.floor(width / 2), Math.floor(height / 2), '#B45309', true);
    setNewTokenName('');
    setShowTokenModal(false);
  };

  const handleQuickSave = () => {
    saveCurrentMap(currentMapTitle || '战役地图');
    setIsJustSaved(true);
    setTimeout(() => setIsJustSaved(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm space-y-3">
      {/* 行 1：队伍棋子管理与移动回合状态 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 shrink-0">
            队伍棋子 ({tokens.length}):
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {tokens.map((token) => {
              const isSelected = selectedTokenId === token.id;
              return (
                <button
                  key={token.id}
                  onClick={() => selectToken(token.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-200 dark:hover:bg-stone-750'
                  }`}
                  title="点击切换选定操控此棋子"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: token.color || '#B45309' }}
                  />
                  <span>{token.name}</span>
                  <span className="text-[10px] opacity-75">[{token.col},{token.row}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 仅主持人端允许新增棋子 */}
        {mode === 'gm' && (
          <button
            onClick={() => setShowTokenModal(true)}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer shrink-0 self-end sm:self-center"
          >
            <UserPlus className="w-4 h-4 text-amber-600" />
            <span>+ 新增棋子</span>
          </button>
        )}
      </div>

      {/* 行 2：控制按钮、移动回合开关与组队模式开关 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {mode === 'gm' ? (
            <>
              {/* GM 独享：移动回合开关 */}
              <button
                onClick={() => setMovementPhaseActive(!movementPhaseActive)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  movementPhaseActive
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-sm'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                }`}
                title="开启后骑士端的玩家才可以点击移动棋子"
              >
                <span>{movementPhaseActive ? '🔓 移动回合已开启' : '🔒 移动回合锁盘中'}</span>
              </button>

              {/* GM 独享：组队移动开关 */}
              <button
                onClick={() => setPartyGroupMode(!partyGroupMode)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                  partyGroupMode
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                }`}
                title="开启后整队骑士整合为同一单位组队同频移动"
              >
                <span>{partyGroupMode ? '🛡️ 队伍组队同频移动 (已开启)' : '🤺 骑士独立独立移动'}</span>
              </button>

              <button
                onClick={handleQuickSave}
                className="py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-stone-200/80 dark:border-stone-700 transition cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-600" />
                <span>{isJustSaved ? '已保存' : '保存'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-stone-200/80 dark:border-stone-700 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>导出</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-stone-200/80 dark:border-stone-700 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>导入</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />

              <button
                onClick={onOpenSettings}
                className="py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-stone-200/80 dark:border-stone-700 transition cursor-pointer"
              >
                <Settings className="w-4 h-4 text-purple-600" />
                <span>设置</span>
              </button>

              <button
                onClick={onOpenTemplates}
                className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-600" />
                <span>预设模板</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1.5 rounded-2xl text-xs font-bold border flex items-center gap-1.5 ${
                movementPhaseActive
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40'
              }`}>
                <span>{movementPhaseActive ? '🟢 移动回合开启中 (按顺序每次可移动 1 格)' : '🔒 移动回合暂未开启 (请等待裁判指令)'}</span>
              </span>

              {partyGroupMode && (
                <span className="px-3 py-1.5 bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 rounded-2xl text-xs font-bold border border-indigo-500/40">
                  🛡️ 队伍组队推移模式
                </span>
              )}
            </div>
          )}
        </div>

        {/* 自动保存指示器 */}
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-mono bg-stone-50 dark:bg-stone-800/60 px-3 py-1.5 rounded-xl border border-stone-200/60 dark:border-stone-800 ml-auto sm:ml-0">
          <Clock className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>自动保存 (5分钟/次)</span>
          {lastAutoSaveTime && (
            <span className="text-[11px] text-stone-400 font-sans">
              ({lastAutoSaveTime})
            </span>
          )}
        </div>
      </div>

      {/* 模态框：添加 Token */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-600" />
              <span>添加新角色/棋子 Token</span>
            </h4>
            <form onSubmit={handleAddTokenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  棋子名称
                </label>
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="例如: 镜之骑士 Meridian"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
                >
                  添加棋子
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapHeaderControlBar;
