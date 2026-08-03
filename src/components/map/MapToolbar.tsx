import React, { useState, useRef } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import type { MapTool, TerrainType, StructureType } from '../../types/map';
import {
  Paintbrush,
  PaintBucket,
  UserPlus,
  Eye,
  Eraser,
  Undo,
  Redo,
  Sparkles,
  Layers,
  Save,
  Download,
  Upload,
  Settings,
  EyeOff,
  Crosshair,
} from 'lucide-react';

const TERRAINS: { id: TerrainType; label: string; color: string }[] = [
  { id: 'plains', label: '平原', color: '#E2F1E7' },
  { id: 'forest', label: '森林', color: '#22543D' },
  { id: 'mountain', label: '山脉', color: '#64748B' },
  { id: 'water', label: '水域', color: '#0284C7' },
  { id: 'shallow_water', label: '浅滩', color: '#38BDF8' },
  { id: 'deep_water', label: '深海', color: '#0C4A6E' },
  { id: 'swamp', label: '沼泽', color: '#713F12' },
  { id: 'desert', label: '荒漠', color: '#FACC15' },
  { id: 'hills', label: '丘陵', color: '#84CC16' },
  { id: 'wasteland', label: '废土', color: '#475569' },
];

const STRUCTURES: { id: StructureType; label: string; icon: string }[] = [
  { id: 'none', label: '无建筑', icon: '❌' },
  { id: 'village', label: '村庄', icon: '🏡' },
  { id: 'town', label: '城镇', icon: '🏙️' },
  { id: 'castle', label: '城堡/堡垒', icon: '🏰' },
  { id: 'ruins', label: '遗迹/古迹', icon: '🏛️' },
  { id: 'myth_site', label: '神话圣所', icon: '✨' },
];

interface Props {
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  isPlayerLocked?: boolean;
}

export const MapToolbar: React.FC<Props> = ({ onOpenTemplates, onOpenSettings, isPlayerLocked = false }) => {
  const {
    mode,
    setMode,
    activeTool,
    setActiveTool,
    selectedTerrain,
    setSelectedTerrain,
    selectedStructure,
    setSelectedStructure,
    sightDistance,
    setSightDistance,
    revealMode,
    setRevealMode,
    undo,
    redo,
    historyIndex,
    history,
    generateRandomBiome,
    addToken,
    saveCurrentMap,
    hexes,
    width,
    height,
    tokens,
    importMapJSON,
  } = useMapStore();

  const [mapNameInput, setMapNameInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 导出 JSON
  const handleExportJSON = () => {
    const data = JSON.stringify({ width, height, hexes, tokens }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mythic-hex-map-${Date.now()}.json`;
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
    addToken(newTokenName.trim(), Math.floor(width / 2), Math.floor(height / 2), '#BE123C', true);
    setNewTokenName('');
    setShowTokenModal(false);
  };

  const handleSaveMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCurrentMap(mapNameInput.trim() || '未命名地图');
    setMapNameInput('');
    setShowSaveModal(false);
    alert('地图存入列表成功！');
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-5">
      {/* 1. 模式切换大标头 - 玩家端锁定隐藏，仅 GM 可见 */}
      {!isPlayerLocked && (
        <div className="flex justify-between items-center bg-stone-100 dark:bg-stone-800/60 p-1.5 rounded-2xl">
          <button
            onClick={() => setMode('gm')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'gm'
                ? 'bg-amber-700 text-white shadow'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <span>👑 GM 裁判模式</span>
          </button>
          <button
            onClick={() => setMode('player')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'player'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <span>🛡️ 玩家探索模式</span>
          </button>
        </div>
      )}

      {/* 玩家模式锁定提示 */}
      {isPlayerLocked && (
        <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-600/30 rounded-2xl px-4 py-2.5">
          <span className="text-emerald-400 text-sm">🛡️</span>
          <span className="text-xs font-bold text-emerald-300">玩家探索视角 · 战争迷雾已启动</span>
          <span className="ml-auto text-xs text-emerald-500/70">地图编辑功能由 GM 专属掌控</span>
        </div>
      )}

      {/* 2. GM 专属绘制工具集 */}
      {mode === 'gm' && (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              地图绘制工具
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'brush', label: '画笔', icon: Paintbrush },
                { id: 'fill', label: '填充', icon: PaintBucket },
                { id: 'fog_toggle', label: '迷雾', icon: EyeOff },
                { id: 'erase', label: '橡皮', icon: Eraser },
                { id: 'inspect', label: '查看', icon: Eye },
              ].map((tool) => {
                const IconComp = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as MapTool)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl text-xs font-medium border transition cursor-pointer ${
                      activeTool === tool.id
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750'
                    }`}
                  >
                    <IconComp className="w-4 h-4 mb-1" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 地形选择调色板 */}
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              地形调色板
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {TERRAINS.map((terrain) => (
                <button
                  key={terrain.id}
                  onClick={() => setSelectedTerrain(terrain.id)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[11px] font-medium transition cursor-pointer ${
                    selectedTerrain === terrain.id
                      ? 'border-amber-600 ring-2 ring-amber-500/50 scale-105 shadow-sm'
                      : 'border-stone-200 dark:border-stone-700'
                  }`}
                  style={{ backgroundColor: terrain.color + '25' }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 mb-1"
                    style={{ backgroundColor: terrain.color }}
                  />
                  <span className="text-stone-800 dark:text-stone-200">{terrain.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 建筑与标志 */}
          <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              放置建筑结构
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {STRUCTURES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStructure(s.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition cursor-pointer ${
                    selectedStructure === s.id
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 撤销 / 重做与模版成生成 */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="flex-1 py-1.5 px-2 bg-stone-100 dark:bg-stone-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                <Undo className="w-3.5 h-3.5" /> 撤销
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-1.5 px-2 bg-stone-100 dark:bg-stone-800 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                <Redo className="w-3.5 h-3.5" /> 重做
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={generateRandomBiome}
                className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> 随机生成群系
              </button>

              <button
                onClick={onOpenTemplates}
                className="py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Layers className="w-4 h-4" /> 预设地图模板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. 玩家模式视角设置 */}
      {mode === 'player' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Crosshair className="w-4 h-4 text-emerald-600" />
              探索玩法操作说明
            </div>
            <p className="text-[11px] opacity-80">
              直接点击地图上的六边形格子，你的骑士 Token 将会自动行走并揭开周围的战争迷雾！
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                视野感知范围 (Sight Distance):
              </span>
              <span className="text-xs font-mono font-bold text-amber-700">{sightDistance} 格</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={sightDistance}
              onChange={(e) => setSightDistance(parseInt(e.target.value, 10))}
              className="w-full accent-amber-700"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
              迷雾揭开模式 (Reveal Mode):
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRevealMode('permanent')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                  revealMode === 'permanent'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                永久记忆揭开
              </button>
              <button
                onClick={() => setRevealMode('los')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                  revealMode === 'los'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                动态视线遮蔽
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 通用 Token 标志添加与管理 */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            角色与棋子 ({tokens.length})
          </span>
          <button
            onClick={() => setShowTokenModal(true)}
            className="text-xs text-amber-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> 添加棋子
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-xs text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: token.color }}
              />
              <span className="font-medium">{token.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 底部导入导出与设置文件栏 */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-4 gap-2">
        <button
          onClick={() => setShowSaveModal(true)}
          className="py-1.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> 保存
        </button>

        <button
          onClick={handleExportJSON}
          className="py-1.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> 导出
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="py-1.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" /> 导入
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
          className="py-1.5 px-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-center gap-1 border border-stone-200 dark:border-stone-700 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" /> 设置
        </button>
      </div>

      {/* 模态框：添加 Token */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              添加新棋子 Token
            </h4>
            <form onSubmit={handleAddTokenSubmit} className="space-y-4">
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="例如: 镜之骑士 Meridian"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模态框：保存地图 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              存入战役地图列表
            </h4>
            <form onSubmit={handleSaveMapSubmit} className="space-y-4">
              <input
                type="text"
                value={mapNameInput}
                onChange={(e) => setMapNameInput(e.target.value)}
                placeholder="例如: 边缘荒野战役 01"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
