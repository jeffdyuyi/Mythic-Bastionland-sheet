import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMapStore } from '../../stores/useMapStore';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { MapHeaderControlBar } from '../../components/map/MapHeaderControlBar';

export const PlayerMapPage: React.FC = () => {
  const { setMode } = useMapStore();

  useEffect(() => {
    setMode('player');
  }, [setMode]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 顶部标题与行动说明 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
            <span>🛡️ 队伍探索视野</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            六边形地图探索
          </h2>
        </div>

        <Link
          to="/map/workspace"
          className="py-2 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold transition border border-amber-500/30 flex items-center gap-1.5"
        >
          <span>↗ 全屏大图模式</span>
        </Link>
      </div>

      {/* 队伍棋子与基础控制条 */}
      <MapHeaderControlBar
        onOpenTemplates={() => {}}
        onOpenSettings={() => {}}
        lastAutoSaveTime=""
      />

      {/* 地图工作区：左侧 Canvas 画布，右侧格子档案 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HexMapCanvas />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <HexInspectorDrawer />
        </div>
      </div>
    </div>
  );
};

export default PlayerMapPage;
