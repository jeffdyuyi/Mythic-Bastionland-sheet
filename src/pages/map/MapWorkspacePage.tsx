import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapStore } from '../../stores/useMapStore';
import { mqttRoomService } from '../../services/mqttRoomService';
import type { DiceRollResult } from '../../types/map';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { MapToolbar } from '../../components/map/MapToolbar';
import { MapHeaderControlBar } from '../../components/map/MapHeaderControlBar';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { MapTemplatesModal } from '../../components/map/MapTemplatesModal';
import { MapSettingsModal } from '../../components/map/MapSettingsModal';
import { ArrowLeft, Compass, Map as MapIcon, HelpCircle, Shield, Dices, Radio, PowerOff } from 'lucide-react';

export const MapWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, currentMapTitle, activeRoom, updateRoomHeartbeat, closeRoom, saveCurrentMap } = useMapStore();

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>(
    new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );

  const isPlayerMode = mode === 'player';

  // 监听纯前端 MQTT 实时网络消息 (Real-time Cross-device Sync)
  useEffect(() => {
    const unsubscribe = mqttRoomService.onMessage((msg) => {
      const store = useMapStore.getState();
      if (msg.type === 'JOIN_REQUEST' && store.mode === 'gm') {
        // Host 响应玩家加入请求，广播发送全量地图状态
        mqttRoomService.broadcastFullState('GM 裁判', store.getStatePayload());
      } else if (msg.type === 'FULL_STATE_SYNC' && store.mode === 'player') {
        // 骑士同步最新地图全量状态
        store.applyNetworkState(msg.payload as Parameters<typeof store.applyNetworkState>[0]);
      } else if (msg.type === 'TOKEN_MOVED') {
        // 棋子移动实时同步
        const payload = msg.payload as { tokenId: string; col: number; row: number };
        if (payload?.tokenId) {
          store.applyNetworkTokenMove(payload.tokenId, payload.col, payload.row);
        }
      } else if (msg.type === 'TOGGLE_MOVEMENT_PHASE') {
        const payload = msg.payload as { active: boolean };
        useMapStore.setState({ movementPhaseActive: payload.active });
      } else if (msg.type === 'TOGGLE_PARTY_MODE') {
        const payload = msg.payload as { active: boolean };
        useMapStore.setState({ partyGroupMode: payload.active });
      } else if (msg.type === 'MAP_HEX_UPDATED') {
        const payload = msg.payload as { hexes: ReturnType<typeof store.getStatePayload>['hexes'] };
        useMapStore.setState({ hexes: payload.hexes });
      } else if (msg.type === 'DICE_ROLLED') {
        const payload = msg.payload as { diceLog: DiceRollResult };
        const currentLogs = useMapStore.getState().diceLogs;
        if (payload?.diceLog && !currentLogs.some((l) => l.id === payload.diceLog.id)) {
          useMapStore.setState({ diceLogs: [payload.diceLog, ...currentLogs.slice(0, 49)] });
        }
      } else if (msg.type === 'ROOM_CLOSED' && store.mode === 'player') {
        alert('GM 已解散该探险房间！');
        navigate('/map');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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

  // 每隔 5 分钟自动存入本机 1 次 (Auto Save every 5 minutes)
  useEffect(() => {
    if (isPlayerMode) return;

    const interval = setInterval(() => {
      saveCurrentMap(currentMapTitle || '战役地图');
      const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      setLastAutoSaveTime(timeStr);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isPlayerMode, saveCurrentMap, currentMapTitle]);

  const handleDissolveRoom = () => {
    if (!activeRoom) return;
    if (confirm(`确定要解散房间“${activeRoom.name} (${activeRoom.id})”并释放占用吗？`)) {
      mqttRoomService.closeRoom('GM 裁判');
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
                具备全图视野与完整绘制权。右侧操控台可切换画笔、调色板、结构与生成群系。每 5 分钟自动保存到本地。
              </p>
            </div>

            {/* 玩家探索卡 */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 text-sm">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>玩家探索模式</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                全图覆盖战争迷雾。点击任意格子可移动骑士 Token 并自动揭开迷雾。
              </p>
            </div>

            {/* 投骰塔卡 */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-red-800 dark:text-red-400 text-sm">
                <Dices className="w-4 h-4 text-red-600" />
                <span>面团线下投骰</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                遵循面团辅助工具原则：骑士端精简投骰塔，鼓励跑团现场进行实体投骰。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 统一全局功能控制条 (参考图中的功能条 - 位于整个房间标题下方，地图上方) */}
      <MapHeaderControlBar
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lastAutoSaveTime={lastAutoSaveTime}
      />

      {/* 六边形格子档案 slide-over 抽屉 */}
      <HexInspectorDrawer />

      {/* 主布局：骑士端 100% 全宽屏幕利用；裁判端 3 列栅格 */}
      {isPlayerMode ? (
        <div className="w-full space-y-6">
          <HexMapCanvas />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧两列：Canvas 地图画布 */}
          <div className="lg:col-span-2 space-y-6">
            <HexMapCanvas />
          </div>

          {/* 右侧一列：GM 裁判地图工具操控台 */}
          <div className="lg:col-span-1 space-y-6">
            <MapToolbar
              onOpenTemplates={() => setIsTemplatesOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      )}

      {/* 模态框 */}
      <MapTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      <MapSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default MapWorkspacePage;
