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
  { id: 'none', label: '无', icon: '❌' },
  { id: 'village', label: '村庄', icon: '🏡' },
  { id: 'town', label: '城镇', icon: '🏙️' },
  { id: 'castle', label: '堡垒', icon: '🏰' },
  { id: 'ruins', label: '古迹', icon: '🏛️' },
  { id: 'myth_site', label: '圣所', icon: '✨' },
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
    undo,
    redo,
    historyIndex,
    history,
    generateRandomBiome,
    sightDistance,
    setSightDistance,
    revealMode,
    setRevealMode,
  } = useMapStore();

  if (mode !== 'gm') return null;

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm space-y-3.5 w-full">
      {/* 行 1：工具模式选择 & 历史撤销 & 随机群系 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
        {/* 左侧：画笔与涂色工具组 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 font-serif mr-1.5 hidden sm:inline-flex items-center gap-1">
            👑 裁判工具:
          </span>

          {[
            { id: 'brush', label: '画笔', icon: Paintbrush },
            { id: 'fill', label: '填充', icon: PaintBucket },
            { id: 'fog_toggle', label: '迷雾', icon: EyeOff },
            { id: 'erase', label: '橡皮', icon: Eraser },
            { id: 'inspect', label: '查看', icon: Eye },
          ].map((tool) => {
            const IconComp = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as MapTool)}
                className={`py-1.5 px-3 rounded-2xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-750'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 text-amber-600" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* 右侧：撤销/重做/随机生成 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="py-1 px-2.5 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition cursor-pointer"
              title="撤销上一步"
            >
              <Undo className="w-3.5 h-3.5" /> 撤销
            </button>
            <span className="w-px h-3 bg-stone-300 dark:bg-stone-600" />
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="py-1 px-2.5 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700 transition cursor-pointer"
              title="重做下一步"
            >
              <Redo className="w-3.5 h-3.5" /> 重做
            </button>
          </div>

          {/* GM 独占控制：设定骑士战团视野距离与迷雾探知模式 */}
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 text-xs">
            <span className="font-bold text-amber-800 dark:text-amber-300">👁️ 骑士视野:</span>
            <input
              type="range"
              min={1}
              max={5}
              value={sightDistance}
              onChange={(e) => setSightDistance(parseInt(e.target.value, 10))}
              className="w-16 accent-amber-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-amber-800 dark:text-amber-300">{sightDistance}格</span>

            <span className="w-px h-3.5 bg-amber-300 dark:bg-amber-800 mx-0.5" />

            <button
              onClick={() => setRevealMode(revealMode === 'permanent' ? 'los' : 'permanent')}
              className="px-2 py-0.5 rounded-lg bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold hover:bg-amber-300 transition cursor-pointer text-[11px]"
              title="切换迷雾模式: 永久记忆 vs 动态视线 (LOS)"
            >
              {revealMode === 'permanent' ? '永久探知' : '视线 (LOS)'}
            </button>
          </div>

          <button
            onClick={generateRandomBiome}
            className="py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>随机生成群系</span>
          </button>
        </div>
      </div>

      {/* 行 2：地形调色板与建筑结构 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* 地形选择调色板 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            地形调色板:
          </span>
          {TERRAINS.map((terrain) => {
            const isSelected = selectedTerrain === terrain.id;
            return (
              <button
                key={terrain.id}
                onClick={() => setSelectedTerrain(terrain.id)}
                className={`py-1 px-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'border-amber-600 ring-2 ring-amber-500/50 scale-105 shadow-sm bg-white dark:bg-stone-800'
                    : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: terrain.color }}
                />
                <span className="text-stone-800 dark:text-stone-200">{terrain.label}</span>
              </button>
            );
          })}
        </div>

        {/* 放置建筑结构 */}
        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 border-t lg:border-t-0 border-stone-100 dark:border-stone-800 pt-2 lg:pt-0">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            放置建筑:
          </span>
          {STRUCTURES.map((s) => {
            const isSelected = selectedStructure === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStructure(s.id)}
                className={`py-1 px-2 rounded-xl text-xs font-bold border flex items-center gap-1 transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-900 dark:text-amber-200'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;
