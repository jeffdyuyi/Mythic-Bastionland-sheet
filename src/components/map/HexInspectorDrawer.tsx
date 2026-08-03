import React from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { useGMStore } from '../../stores/useGMStore';
import { MYTH_DB } from '../../data/myths';
import { MapPin, BookOpen, Eye, X } from 'lucide-react';
import type { TerrainType, StructureType } from '../../types/map';

const TERRAIN_NAMES: Record<TerrainType, string> = {
  plains: '平原 (Plains)',
  forest: '森林 (Forest)',
  mountain: '山脉 (Mountain)',
  water: '水域 (Water)',
  shallow_water: '浅滩 (Shallow Water)',
  deep_water: '深海 (Deep Water)',
  swamp: '沼泽 (Swamp)',
  desert: '荒漠 (Desert)',
  hills: '丘陵 (Hills)',
  wasteland: '废土 (Wasteland)',
};

const STRUCTURE_NAMES: Record<StructureType, string> = {
  none: '无建筑',
  village: '村庄',
  hamlet: '聚落',
  town: '城镇',
  city: '城市',
  castle: '堡垒/城堡',
  ruins: '古迹/废墟',
  myth_site: '神话圣所',
  tower: '哨塔',
  camp: '营地',
};

export const HexInspectorDrawer: React.FC = () => {
  const { selectedHexKey, selectHex, hexes, updateHexLabel, linkMythToHex, paintHex } = useMapStore();
  const { activeMyths, activeMythIds } = useGMStore();

  if (!selectedHexKey || !hexes[selectedHexKey]) return null;

  const cell = hexes[selectedHexKey];

  // 找已绑定的活跃神话信息
  const activeMyth = cell.linkedMythInstanceId ? activeMyths[cell.linkedMythInstanceId] : null;
  const mythDef = activeMyth ? MYTH_DB.find(m => m.id === activeMyth.mythId) : null;

  function handleMythSelect(instanceId: string) {
    if (!instanceId) {
      linkMythToHex(cell.col, cell.row, undefined, undefined);
    } else {
      linkMythToHex(cell.col, cell.row, instanceId, 0);
    }
  }

  function handleOmenSelect(omenIdx: number) {
    if (!cell.linkedMythInstanceId) return;
    linkMythToHex(cell.col, cell.row, cell.linkedMythInstanceId, omenIdx);
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* 头部 */}
      <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2 font-serif font-bold text-lg text-amber-900 dark:text-amber-200">
          <MapPin className="w-5 h-5 text-amber-600" />
          <span>六边形格子档案 ({cell.col}, {cell.row})</span>
        </div>
        <button
          onClick={() => selectHex(null)}
          className="text-stone-400 hover:text-stone-600 transition p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 地形与迷雾控制 */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-stone-400 font-bold">地形种类:</span>
          <div className="font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 p-2 rounded-lg">
            {TERRAIN_NAMES[cell.terrain] || cell.terrain}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-stone-400 font-bold">建筑/结构:</span>
          <div className="font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 p-2 rounded-lg">
            {STRUCTURE_NAMES[cell.structure] || cell.structure}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
        <span className="font-bold text-stone-700 dark:text-stone-300">战争迷雾状态:</span>
        <button
          onClick={() => paintHex(cell.col, cell.row)}
          className={`btn btn-xs flex items-center gap-1 ${
            cell.explored ? 'btn-success' : 'btn-ghost'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{cell.explored ? '已探索 (视野开阔)' : '未探索 (迷雾遮罩)'}</span>
        </button>
      </div>

      {/* 地名与备注 */}
      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-stone-400 font-bold mb-1">自定义地名 / 标识:</label>
          <input
            type="text"
            value={cell.label || ''}
            onChange={e => updateHexLabel(cell.col, cell.row, e.target.value)}
            placeholder="例如: 恶狼之林, 古木遗迹..."
            className="w-full px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent"
          />
        </div>
        <div>
          <label className="block text-stone-400 font-bold mb-1">GM 探索笔记 / 描述:</label>
          <textarea
            value={cell.notes || ''}
            onChange={e => updateHexLabel(cell.col, cell.row, cell.label || '', e.target.value)}
            placeholder="填写在此格遭遇的线索、怪物、宝藏说明..."
            rows={2}
            className="w-full px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent resize-none"
          />
        </div>
      </div>

      {/* 神话 & 预兆关联中枢 (Myth Linkage) */}
      <div className="border-t border-stone-200 dark:border-stone-800 pt-3 space-y-3">
        <div className="flex items-center gap-2 font-serif font-bold text-sm text-indigo-900 dark:text-indigo-300">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>关联神话与预兆 (Myth & Omen Link)</span>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block text-stone-400 font-bold">选择绑定已激活的神话:</label>
          <select
            value={cell.linkedMythInstanceId || ''}
            onChange={e => handleMythSelect(e.target.value)}
            className="w-full px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg bg-transparent font-medium"
          >
            <option value="">-- 未关联神话 --</option>
            {activeMythIds.map(instId => {
              const active = activeMyths[instId];
              const def = MYTH_DB.find(m => m.id === active?.mythId);
              return (
                <option key={instId} value={instId}>
                  📜 {def ? def.name : active.mythId} (包含 {def?.omens.length || 6} 预兆)
                </option>
              );
            })}
          </select>
        </div>

        {/* 若已绑定神话，选择具体预兆 */}
        {mythDef && (
          <div className="space-y-2 pt-1 text-xs bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/30">
            <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
              <span>关联预兆分支 (Omen Spot):</span>
              {cell.linkedOmenIndex !== undefined && (
                <span className="text-[10px] text-indigo-400">预兆 #{cell.linkedOmenIndex + 1}</span>
              )}
            </div>
            <div className="space-y-1">
              {mythDef.omens.map((omen, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOmenSelect(idx)}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2 cursor-pointer ${
                    cell.linkedOmenIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow'
                      : 'bg-white/5 hover:bg-white/10 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="font-mono font-bold shrink-0">#{idx + 1}</span>
                  <span className="line-clamp-2 leading-relaxed">{omen}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
