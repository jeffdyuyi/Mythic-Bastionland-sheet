import React from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { useGMStore } from '../../stores/useGMStore';
import { MYTH_DB } from '../../data/myths';
import { MapPin, BookOpen, Eye, X, Edit3 } from 'lucide-react';
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
  const { selectedHexKey, selectHex, hexes, updateHexLabel, linkMythToHex, paintHex, mode } = useMapStore();
  const { activeMyths, activeMythIds } = useGMStore();

  if (!selectedHexKey || !hexes[selectedHexKey]) return null;

  const cell = hexes[selectedHexKey];
  const isPlayerMode = mode === 'player';

  // 找已绑定的活跃神话信息
  const activeMyth = cell.linkedMythInstanceId ? activeMyths[cell.linkedMythInstanceId] : null;
  const mythDef = activeMyth ? MYTH_DB.find(m => m.id === activeMyth.mythId) : null;

  function handleMythSelect(instanceId: string) {
    if (isPlayerMode) return;
    if (!instanceId) {
      linkMythToHex(cell.col, cell.row, undefined, undefined);
    } else {
      linkMythToHex(cell.col, cell.row, instanceId, 0);
    }
  }

  function handleOmenSelect(omenIdx: number) {
    if (isPlayerMode || !cell.linkedMythInstanceId) return;
    linkMythToHex(cell.col, cell.row, cell.linkedMythInstanceId, omenIdx);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in p-2 sm:p-4">
      {/* 点击背景遮罩关闭 */}
      <div className="absolute inset-0" onClick={() => selectHex(null)} />

      {/* 抽屉/弹窗本体：桌面端右侧滑出浮层，移动端全屏/底栏 */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-stone-900 h-full sm:h-auto sm:max-h-[92vh] sm:my-auto sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 overflow-y-auto space-y-4">
        {/* 头部 */}
        <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2 font-serif font-bold text-lg text-amber-900 dark:text-amber-200">
            <MapPin className="w-5 h-5 text-amber-600" />
            <span>六边形格子档案 ({cell.col}, {cell.row})</span>
          </div>
          <button
            onClick={() => selectHex(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition p-1 cursor-pointer rounded-lg bg-stone-100 dark:bg-stone-800"
            title="关闭档案"
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
          {isPlayerMode ? (
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg font-bold">
              {cell.explored ? '👁️ 已解开探索' : '🌫️ 迷雾遮盖中'}
            </span>
          ) : (
            <button
              onClick={() => paintHex(cell.col, cell.row)}
              className={`btn btn-xs flex items-center gap-1 cursor-pointer ${
                cell.explored ? 'btn-success' : 'btn-ghost'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{cell.explored ? '已探索 (视野开阔)' : '未探索 (迷雾遮罩)'}</span>
            </button>
          )}
        </div>

        {/* 地名与备注描述 */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="flex items-center gap-1 text-stone-400 font-bold mb-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>自定义地名 / 标识:</span>
            </label>
            {isPlayerMode ? (
              <div className="p-2.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl text-stone-800 dark:text-stone-200 font-bold text-sm">
                {cell.label || '未命名地点'}
              </div>
            ) : (
              <input
                type="text"
                value={cell.label || ''}
                onChange={e => updateHexLabel(cell.col, cell.row, e.target.value)}
                placeholder="例如: 恶狼之林, 古木遗迹..."
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent font-bold text-stone-900 dark:text-stone-100"
              />
            )}
          </div>
          <div>
            <label className="block text-stone-400 font-bold mb-1">探索笔记 / 描述:</label>
            {isPlayerMode ? (
              <div className="p-3 bg-stone-100 dark:bg-stone-800/80 rounded-xl text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                {cell.notes || '暂无更多现场细节记录。'}
              </div>
            ) : (
              <textarea
                value={cell.notes || ''}
                onChange={e => updateHexLabel(cell.col, cell.row, cell.label || '', e.target.value)}
                placeholder="填写在此格遭遇的线索、怪物、宝藏说明..."
                rows={3}
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent resize-none leading-relaxed text-stone-900 dark:text-stone-100"
              />
            )}
          </div>
        </div>

        {/* 神话 & 预兆关联中枢 (Myth Linkage) */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-3 space-y-3">
          <div className="flex items-center gap-2 font-serif font-bold text-sm text-indigo-900 dark:text-indigo-300">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>关联神话与预兆 (Myth & Omen Link)</span>
          </div>

          {isPlayerMode ? (
            <div className="text-xs space-y-2">
              <div className="p-2.5 bg-indigo-950/20 rounded-xl border border-indigo-500/30 text-indigo-900 dark:text-indigo-200">
                <span className="font-bold block mb-1">已检测到的关联神话:</span>
                <span className="font-serif text-sm font-bold text-indigo-400">
                  {mythDef ? `📜 ${mythDef.name}` : '未在此格发现神话迹象'}
                </span>
              </div>
              {mythDef && cell.linkedOmenIndex !== undefined && (
                <div className="p-2.5 bg-indigo-900/20 rounded-xl border border-indigo-500/30 text-xs space-y-1">
                  <span className="font-bold text-indigo-300 block">
                    预兆线索 #{cell.linkedOmenIndex + 1}:
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    {mythDef.omens[cell.linkedOmenIndex] || '未知预兆'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2 text-xs">
                <label className="block text-stone-400 font-bold">选择绑定已激活的神话:</label>
                <select
                  value={cell.linkedMythInstanceId || ''}
                  onChange={e => handleMythSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-xl bg-transparent font-medium"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HexInspectorDrawer;
