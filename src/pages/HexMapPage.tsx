import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useMapStore } from '../stores/useMapStore';
import { HexMapCanvas } from '../components/map/HexMapCanvas';
import { MapToolbar } from '../components/map/MapToolbar';
import { HexDicePanel } from '../components/map/HexDicePanel';
import { HexInspectorDrawer } from '../components/map/HexInspectorDrawer';
import { MapTemplatesModal } from '../components/map/MapTemplatesModal';
import { MapSettingsModal } from '../components/map/MapSettingsModal';
import { Compass, Map as MapIcon, HelpCircle, Shield, Dices } from 'lucide-react';

export const HexMapPage: React.FC = () => {
  const userRole = useAppStore((state) => state.userRole);
  const setMode = useMapStore((state) => state.setMode);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isPlayerMode = userRole === 'player';

  // 玩家端强制锁定为玩家探索模式，防止切换到 GM 权限
  const hasLockedMode = React.useRef(false);
  useEffect(() => {
    if (isPlayerMode && !hasLockedMode.current) {
      setMode('player');
      hasLockedMode.current = true;
    }
  }, [isPlayerMode, setMode]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 头部标题卡片区域 */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-red-950 text-white rounded-2xl p-6 shadow-xl border border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold tracking-widest uppercase border border-amber-500/30">
            <Compass className="w-4 h-4 animate-spin-slow text-amber-400" />
            <span>MYTHIC BASTIONLAND MAPPER</span>
            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${isPlayerMode ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' : 'bg-red-900/80 text-red-300 border border-red-500/40'}`}>
              {isPlayerMode ? '👁️ 玩家探索视角' : '👑 GM 战役地图中枢'}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-amber-100 tracking-tight">
            {isPlayerMode ? '骑士巡礼探索地图' : '六边形地图与投骰中枢'}
          </h1>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md z-10 shrink-0 cursor-pointer ${
            showHelp
              ? 'bg-amber-500 text-stone-900 shadow-amber-500/30 ring-2 ring-amber-400'
              : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showHelp ? '收起玩法指南' : '展开玩法指南'}</span>
        </button>
      </div>

      {/* 玩法帮助提示 3-卡片分块 */}
      {showHelp && (
        <div className="bg-amber-900/10 border border-amber-600/30 rounded-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-amber-900 dark:text-amber-300">
            <MapIcon className="w-5 h-5 text-amber-700" />
            <span>六边形地图与投骰模块使用指南</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GM 裁判卡 */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 text-sm">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>GM 裁判模式</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                具备全图视野与完整绘制权。可使用涂色刷子、泛洪填充、绘制建筑、程序生成群系或加载预设地图。
              </p>
            </div>

            {/* 玩家探索卡 */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 text-sm">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>玩家探索模式</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                全图覆盖战争迷雾。点击任意格子可放置或移动骑士 Token，周围视距内的格子将自动揭开。
              </p>
            </div>

            {/* 投骰塔卡 */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-400 text-sm">
                <Dices className="w-4 h-4 text-red-600" />
                <span>聚合投骰塔</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                右侧集成了神话堡垒机制快捷骰（美德判定 1d20、六边形遭遇 1d6、诗号 d6+d12 等）与历史日志，可随时掷骰。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 主布局：左侧地图与控制，右侧抽屉与投骰面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧两列：Canvas 画布 + 绘制控制栏 */}
        <div className="lg:col-span-2 space-y-6">
          <HexMapCanvas />
          <MapToolbar
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isPlayerLocked={isPlayerMode}
          />
        </div>

        {/* 右侧一列：格子档案抽屉与投骰聚合控制台 */}
        <div className="lg:col-span-1 space-y-6">
          <HexInspectorDrawer />
          <HexDicePanel />
        </div>
      </div>

      {/* 模态框 */}
      <MapTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      <MapSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
export default HexMapPage;

