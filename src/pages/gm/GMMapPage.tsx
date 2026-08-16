import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMapStore } from '../../stores/useMapStore';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { MapToolbar } from '../../components/map/MapToolbar';
import { MapHeaderControlBar } from '../../components/map/MapHeaderControlBar';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { HexDicePanel } from '../../components/map/HexDicePanel';
import { MapTemplatesModal } from '../../components/map/MapTemplatesModal';
import { MapSettingsModal } from '../../components/map/MapSettingsModal';
import { Maximize2, MapPin } from 'lucide-react';

export const GMMapPage: React.FC = () => {
  const { setMode, saveCurrentMap, currentMapTitle } = useMapStore();

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>(
    new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    setMode('gm');
  }, [setMode]);

  // 裁判模式每 5 分钟自动保存到本地
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentMap(currentMapTitle || '战役地图');
      const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      setLastAutoSaveTime(timeStr);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [saveCurrentMap, currentMapTitle]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 顶部标题与行动说明 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>👑 战役地图中枢</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            六边形地图编辑与探索掌控
          </h2>
        </div>

        <Link
          to="/map/workspace"
          className="py-2 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold transition border border-amber-500/30 flex items-center gap-1.5"
        >
          <Maximize2 className="w-4 h-4" />
          <span>↗ 全屏大图模式</span>
        </Link>
      </div>

      {/* 统一全局功能控制条 */}
      <MapHeaderControlBar
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lastAutoSaveTime={lastAutoSaveTime}
      />

      {/* 主布局：左侧 2 列 HexMapCanvas 画布，右侧 1 列 GM 裁判操控台与格子档案 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HexMapCanvas />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <MapToolbar
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
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

export default GMMapPage;
