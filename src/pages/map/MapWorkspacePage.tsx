import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapStore } from '../../stores/useMapStore';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { MapToolbar } from '../../components/map/MapToolbar';
import { HexDicePanel } from '../../components/map/HexDicePanel';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { MapTemplatesModal } from '../../components/map/MapTemplatesModal';
import { MapSettingsModal } from '../../components/map/MapSettingsModal';
import { ArrowLeft, Compass, Map as MapIcon, HelpCircle, Shield, Dices, Radio, PowerOff } from 'lucide-react';

export const MapWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, currentMapTitle, activeRoom, updateRoomHeartbeat, closeRoom } = useMapStore();

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isPlayerMode = mode === 'player';

  // 定时发送心跳更新房主活跃时间 (每15秒心跳一次)
  useEffect(() => {
    if (!activeRoom || isPlayerMode) return;

    // 立即更新一次心跳
    updateRoomHeartbeat(activeRoom.id);

    const interval = setInterval(() => {
      updateRoomHeartbeat(activeRoom.id);
    }, 15000);

    return () => clearInterval(interval);
  }, [activeRoom, isPlayerMode, updateRoomHeartbeat]);

  const handleDissolveRoom = () => {
    if (!activeRoom) return;
    if (confirm(`确定要解散房间“${activeRoom.name} (${activeRoom.id})”并释放占用吗？`)) {
      closeRoom(activeRoom.id);
      navigate('/map');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 顶栏控制导航卡片 */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-red-950 text-white rounded-3xl p-6 shadow-xl border border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={() => navigate('/map')}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-amber-200 rounded-2xl border border-amber-400/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="返回地图门廊大厅"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回地图大厅</span>
          </button>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold tracking-widest uppercase border border-amber-500/30">
              <Compass className="w-3.5 h-3.5 animate-spin-slow text-amber-400" />
              <span>MAP WORKSPACE</span>
              <span
                className={`ml-1 px-2 py-0.2 rounded text-[10px] font-bold ${
                  isPlayerMode
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-900/80 text-red-300 border border-red-500/40'
                }`}
              >
                {isPlayerMode ? '👁️ 骑士探索视角' : '👑 裁判操作视角'}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-amber-100 tracking-tight">
              {currentMapTitle || '六边形地图工作区'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          {activeRoom && (
            <div className="flex items-center gap-2">
              <div className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>房间: {activeRoom.id}</span>
              </div>

              {!isPlayerMode && (
                <button
                  onClick={handleDissolveRoom}
                  className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  title="解散此房间并释放占用"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>解散房间</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              showHelp
                ? 'bg-amber-500 text-stone-900 shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/30'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showHelp ? '收起指南' : '玩法指南'}</span>
          </button>
        </div>
      </div>

      {/* 玩法指南提示盒 */}
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

      {/* 主布局：左侧地图 Canvas + 绘制控制栏，右侧抽屉 + 投骰面板 */}
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

export default MapWorkspacePage;
