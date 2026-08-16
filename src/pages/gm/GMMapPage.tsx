import React, { useState, useEffect } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { useAppStore } from '../../store/useAppStore';
import { mqttRoomService } from '../../services/mqttRoomService';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { MapToolbar } from '../../components/map/MapToolbar';
import { MapHeaderControlBar } from '../../components/map/MapHeaderControlBar';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { MapTemplatesModal } from '../../components/map/MapTemplatesModal';
import { MapSettingsModal } from '../../components/map/MapSettingsModal';
import { MapPin, Plus, Radio, Play, Trash2, Crown, Map as MapIcon, ArrowLeft } from 'lucide-react';

export const GMMapPage: React.FC = () => {
  const setRole = useAppStore((state) => state.setRole);
  const {
    setMode,
    saveCurrentMap,
    currentMapTitle,
    savedMaps,
    createNewMap,
    loadSavedMapById,
    deleteSavedMap,
    createRoom,
  } = useMapStore();

  const [viewMode, setViewMode] = useState<'library' | 'editor'>('editor');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const [newMapName, setNewMapName] = useState('');
  const [newMapWidth, setNewMapWidth] = useState(12);
  const [newMapHeight, setNewMapHeight] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('knight_domain');

  const [newRoomName, setNewRoomName] = useState('');
  const [newHostName, setNewHostName] = useState('GM 裁判');

  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>(
    new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    setRole('gm');
    setMode('gm');
  }, [setRole, setMode]);

  // 裁判模式每 5 分钟自动保存到本地
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentMap(currentMapTitle || '战役地图');
      const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      setLastAutoSaveTime(timeStr);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [saveCurrentMap, currentMapTitle]);

  // 裁判：新建地图
  const handleCreateNewMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNewMap(
      newMapName.trim() || '新战役领地',
      newMapWidth,
      newMapHeight,
      selectedTemplate
    );
    setShowCreateModal(false);
    setViewMode('editor');
  };

  // 裁判：广播开启新房间
  const handlePublishRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = createRoom(
      newRoomName.trim() || '探险房间',
      newHostName.trim() || 'GM 裁判'
    );
    const { getStatePayload } = useMapStore.getState();
    mqttRoomService.startRoomHost(
      room.id,
      room.name,
      room.hostName,
      getStatePayload
    );
    setShowCreateRoomModal(false);
    setViewMode('editor');
  };

  // 裁判：加载选定地图
  const handleOpenMap = (mapId: string) => {
    loadSavedMapById(mapId);
    setViewMode('editor');
  };

  if (viewMode === 'library') {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-16 px-3 sm:px-6">
        {/* 顶部 Hero Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 relative overflow-hidden">
          <div className="space-y-3 relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold tracking-widest uppercase border border-amber-500/30">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>GAME MASTER MAP PORTAL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-tight">
              裁判战役地图库与房间广播中枢
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed opacity-90">
              挑选项已有地图进行编辑绘制，或开启前端网络广播房间，让骑士玩家跨端连入联机探索。
            </p>
          </div>
        </div>

        {/* 头部控制栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-amber-600" />
              <span>已保存的战役地图 ({savedMaps.length})</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              挑选地图进入工作区，或新建地图、开启网络广播房间。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setViewMode('editor')}
              className="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-2xl text-xs font-bold transition border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> 返回当前编辑工作区
            </button>

            <button
              onClick={() => setShowCreateRoomModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Radio className="w-4 h-4" /> 📡 开启广播房间
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-700 hover:to-red-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> ➕ 新建地图
            </button>
          </div>
        </div>

        {/* 地图列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedMaps.map((map) => (
            <div
              key={map.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                    🗺️
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-full border border-stone-200 dark:border-stone-700">
                    {map.width} × {map.height} 六边形
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                    {map.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    最近更新: {map.updatedAt} · 包含 {map.tokens?.length || 0} 个标记
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center gap-2">
                <button
                  onClick={() => handleOpenMap(map.id)}
                  className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> 进入操作
                </button>

                <button
                  onClick={() => {
                    if (confirm(`确定要删除地图“${map.name}”吗？`)) {
                      deleteSavedMap(map.id);
                    }
                  }}
                  title="删除地图"
                  className="p-2 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 新建地图模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">新建六边形战役地图</h3>
              <form onSubmit={handleCreateNewMapSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">地图名称:</label>
                  <input
                    type="text"
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    placeholder="例如: 磨坊镇与星辉城堡"
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">宽度 (Hex):</label>
                    <input
                      type="number"
                      min={4}
                      max={30}
                      value={newMapWidth}
                      onChange={(e) => setNewMapWidth(parseInt(e.target.value, 10) || 12)}
                      className="w-full px-3 py-2 border rounded-xl bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">高度 (Hex):</label>
                    <input
                      type="number"
                      min={4}
                      max={25}
                      value={newMapHeight}
                      onChange={(e) => setNewMapHeight(parseInt(e.target.value, 10) || 10)}
                      className="w-full px-3 py-2 border rounded-xl bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">初始模板:</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                  >
                    <option value="knight_domain">🏰 骑士领地 (城堡+村落)</option>
                    <option value="misty_forest">🌲 迷雾森林 (遗迹与古木)</option>
                    <option value="coastal_isle">🌊 沿海平原 (港口与浅滩)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 rounded-xl font-bold">取消</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold">确认创建</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 开启广播房间模态框 */}
        {showCreateRoomModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span>开启广播房间 (MQTT 纯前端联机)</span>
              </h3>
              <form onSubmit={handlePublishRoomSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">房间名称:</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="例如: 探索战队-星辉领地"
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">主持裁判名字:</label>
                  <input
                    type="text"
                    value={newHostName}
                    onChange={(e) => setNewHostName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 font-bold"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateRoomModal(false)} className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 rounded-xl font-bold">取消</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">广播开启房间</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 编辑视图：显示完整的地图编辑与操控界面
  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 space-y-4 pb-12">
      {/* 顶部标题与切换库按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-full text-xs font-mono font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>👑 GM 裁判战役地图编辑</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {currentMapTitle || '六边形地图编辑与全景掌控'}
          </h2>
        </div>

        <button
          onClick={() => setViewMode('library')}
          className="py-2 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 rounded-2xl text-xs font-bold transition border border-amber-500/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <MapIcon className="w-4 h-4" />
          <span>📚 地图库与广播中枢</span>
        </button>
      </div>

      {/* 统一全局功能控制条 */}
      <MapHeaderControlBar
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        lastAutoSaveTime={lastAutoSaveTime}
      />

      {/* 顶部地图编辑工具栏 */}
      <MapToolbar
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 全宽 HexMapCanvas 画布 */}
      <div className="w-full relative shadow-lg rounded-3xl overflow-hidden">
        <HexMapCanvas />
      </div>

      {/* 六边形格子档案浮层 */}
      <HexInspectorDrawer />

      {/* 模态框 */}
      <MapTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      <MapSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default GMMapPage;
