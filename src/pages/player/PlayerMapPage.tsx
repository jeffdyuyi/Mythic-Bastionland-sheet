import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMapStore } from '../../stores/useMapStore';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { MapHeaderControlBar } from '../../components/map/MapHeaderControlBar';
import { Crosshair, Maximize2 } from 'lucide-react';

export const PlayerMapPage: React.FC = () => {
  const { setMode, sightDistance, setSightDistance, revealMode, setRevealMode } = useMapStore();

  useEffect(() => {
    setMode('player');
  }, [setMode]);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 space-y-4 pb-12">
      {/* 顶部标题与行动说明 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>🛡️ 队伍探索视野</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            六边形荒野地图探索
          </h2>
        </div>

        <Link
          to="/map/workspace"
          className="py-2 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold transition border border-amber-500/30 flex items-center gap-1.5 shrink-0"
        >
          <Maximize2 className="w-4 h-4" />
          <span>↗ 全屏大图模式</span>
        </Link>
      </div>

      {/* 队伍棋子与基础控制条 */}
      <MapHeaderControlBar
        onOpenTemplates={() => {}}
        onOpenSettings={() => {}}
        lastAutoSaveTime=""
      />

      {/* 骑士端专用视距与迷雾模式微调栏 (全宽横排) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>直接点击地图上的六边形格子，你的骑士 Token 将会自动行走并揭开周围的战争迷雾！</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/80 px-3 py-1.5 rounded-2xl border border-stone-200 dark:border-stone-700">
            <span className="text-stone-500 font-bold">视野感知:</span>
            <input
              type="range"
              min={1}
              max={5}
              value={sightDistance}
              onChange={(e) => setSightDistance(parseInt(e.target.value, 10))}
              className="w-24 accent-emerald-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-emerald-600">{sightDistance} 格</span>
          </div>

          <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-800/80 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setRevealMode('permanent')}
              className={`py-1 px-3 rounded-xl font-bold transition cursor-pointer ${
                revealMode === 'permanent'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              永久记忆
            </button>
            <button
              onClick={() => setRevealMode('los')}
              className={`py-1 px-3 rounded-xl font-bold transition cursor-pointer ${
                revealMode === 'los'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              视线遮蔽
            </button>
          </div>
        </div>
      </div>

      {/* 全宽 HexMapCanvas 画布 (占据100%容器宽度) */}
      <div className="w-full relative shadow-lg rounded-3xl overflow-hidden">
        <HexMapCanvas />
      </div>

      {/* 六边形格子档案浮层 (点击格后从右侧滑出抽屉/弹窗) */}
      <HexInspectorDrawer />
    </div>
  );
};

export default PlayerMapPage;
