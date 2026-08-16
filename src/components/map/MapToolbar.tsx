import React from 'react';
import { useMapStore } from '../../stores/useMapStore';
import type { MapTool, TerrainType, StructureType } from '../../types/map';
import {
  Paintbrush,
  PaintBucket,
  Eye,
  Eraser,
  Undo,
  Redo,
  Sparkles,
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
}

export const MapToolbar: React.FC<Props> = () => {
  const {
    mode,
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
  } = useMapStore();

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-5">
      {/* 头部模式标识 */}
      <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2 font-bold text-xs">
          {mode === 'gm' ? (
            <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-serif text-sm">
              👑 裁判地图工具
            </span>
          ) : (
            <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-serif text-sm">
              🛡️ 队伍探索视野
            </span>
          )}
        </div>
      </div>

      {/* 裁判专属绘制控制 */}
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
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm font-bold'
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
                      ? 'border-amber-600 ring-2 ring-amber-500/50 scale-105 shadow-sm font-bold'
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
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 撤销 / 重做与随机生成 */}
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

            <button
              onClick={generateRandomBiome}
              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> 随机生成群系
            </button>
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800 leading-relaxed">
            💡 点击或双击地图上的六边形格子，可直接调出详细地名与档案编辑面板。
          </div>
        </div>
      )}

      {/* 玩家模式视角设置 */}
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
    </div>
  );
};
