import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapStore } from '../../stores/useMapStore';
import { useAppStore } from '../../store/useAppStore';
import {
  Compass,
  Crown,
  Swords,
  Plus,
  Map as MapIcon,
  Users,
  Play,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';

export const MapHubPage: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useAppStore((state) => state.setRole);

  const {
    savedMaps,
    rooms,
    createNewMap,
    loadSavedMapById,
    joinRoomById,
    deleteSavedMap,
    setMode,
  } = useMapStore();

  // 二级选择选项卡状态: 'gm_manage' (操作地图-裁判) | 'player_join' (加入地图-骑士)
  const [activeTab, setActiveTab] = useState<'gm_manage' | 'player_join'>('gm_manage');

  // 新建地图模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapWidth, setNewMapWidth] = useState(12);
  const [newMapHeight, setNewMapHeight] = useState(10);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('knight_domain');

  // 房间代码直连状态
  const [inputRoomId, setInputRoomId] = useState('');

  // 1. 裁判：选择已保存的地图进入操作
  const handleOpenMapAsGM = (mapId: string) => {
    setRole('gm');
    setMode('gm');
    loadSavedMapById(mapId);
    navigate('/map/workspace');
  };

  // 2. 裁判：新建地图并进入操作
  const handleCreateNewMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole('gm');
    setMode('gm');
    createNewMap(
      newMapName.trim() || '新战役领地',
      newMapWidth,
      newMapHeight,
      selectedTemplate
    );
    setShowCreateModal(false);
    navigate('/map/workspace');
  };

  // 3. 骑士：选择已有房间加入探索
  const handleJoinRoom = (roomId: string) => {
    setRole('player');
    setMode('player');
    joinRoomById(roomId);
    navigate('/map/workspace');
  };

  // 4. 骑士：通过代码加入房间
  const handleJoinByCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    setRole('player');
    setMode('player');
    joinRoomById(inputRoomId.trim());
    navigate('/map/workspace');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* 顶部 Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-red-950 text-white rounded-3xl p-8 shadow-2xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-mono font-bold tracking-widest uppercase border border-amber-500/30">
            <Compass className="w-4 h-4 animate-spin-slow text-amber-400" />
            <span>MYTHIC BASTIONLAND MAP PORTAL</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-amber-100 tracking-tight">
            六边形地图控制中心
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed opacity-90">
            独立的战役地图调度中枢。无论是裁判主持操控地图库，还是骑士联机加入探索迷雾房间，均可在此一键接入。
          </p>
        </div>
      </div>

      {/* 二级选择核心切换导航 (Sub-selection Entrance Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 二级入口 1：操作地图（裁判） */}
        <button
          onClick={() => setActiveTab('gm_manage')}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer text-left flex items-start justify-between relative overflow-hidden group ${
            activeTab === 'gm_manage'
              ? 'bg-gradient-to-br from-amber-900/20 to-red-950/20 border-amber-500/80 shadow-lg ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400'
          }`}
        >
          <div className="space-y-3 z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>操作地图 (裁判 / GM)</span>
                {activeTab === 'gm_manage' && (
                  <span className="text-xs px-2 py-0.5 bg-amber-500 text-stone-950 font-sans font-bold rounded-full">
                    当前选定
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                挑选已有战役地图或新建空白网格，具备地形刷涂、战争迷雾控制与全图广播权。
              </p>
            </div>
          </div>
          <ArrowRight
            className={`w-6 h-6 text-amber-500 transition-transform ${
              activeTab === 'gm_manage' ? 'translate-x-1' : 'opacity-40 group-hover:opacity-100'
            }`}
          />
        </button>

        {/* 二级入口 2：加入地图（骑士） */}
        <button
          onClick={() => setActiveTab('player_join')}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer text-left flex items-start justify-between relative overflow-hidden group ${
            activeTab === 'player_join'
              ? 'bg-gradient-to-br from-emerald-950/20 to-teal-950/20 border-emerald-500/80 shadow-lg ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-400'
          }`}
        >
          <div className="space-y-3 z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>加入地图 (骑士 / Player)</span>
                {activeTab === 'player_join' && (
                  <span className="text-xs px-2 py-0.5 bg-emerald-500 text-stone-950 font-sans font-bold rounded-full">
                    当前选定
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                选择前端开放的战役房间或输入代码，以骑士视角加入迷雾探索，支持视距移动。
              </p>
            </div>
          </div>
          <ArrowRight
            className={`w-6 h-6 text-emerald-500 transition-transform ${
              activeTab === 'player_join' ? 'translate-x-1' : 'opacity-40 group-hover:opacity-100'
            }`}
          />
        </button>
      </div>

      {/* 分支视图 1：操作地图 (裁判) */}
      {activeTab === 'gm_manage' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-amber-600" />
                <span>战役地图库 ({savedMaps.length})</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                挑选已有地图进入裁判工作区，或新建一张地图开始绘制。
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-700 hover:to-red-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> ➕ 新建地图
            </button>
          </div>

          {/* 地图卡片列表 */}
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
                    onClick={() => handleOpenMapAsGM(map.id)}
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
        </div>
      )}

      {/* 分支视图 2：加入地图 (骑士) */}
      {activeTab === 'player_join' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>开放的探险房间 ({rooms.length})</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                挑选已有房间直接加入，或输入房间代码连入 GM 导览窗口。
              </p>
            </div>

            {/* 快速直连加入框 */}
            <form onSubmit={handleJoinByCodeSubmit} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="例如: ROOM-8891"
                className="px-3 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" /> 直连加入
              </button>
            </form>
          </div>

          {/* 房间卡片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                      {room.id}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      {room.currentPlayers}/{room.maxPlayers} 骑士在线
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
                      {room.name}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
                    <div className="flex justify-between">
                      <span>主持裁判:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{room.hostName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>探索地图:</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{room.mapName}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60">
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Swords className="w-4 h-4" /> 加入探索地图
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 模态框：新建地图 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <span>新建战役六边形地图</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewMapSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  地图名称
                </label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="例如: 磨坊镇与遗迹领地 01"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    网格宽度 (列)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={30}
                    value={newMapWidth}
                    onChange={(e) => setNewMapWidth(parseInt(e.target.value, 10) || 12)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                    网格高度 (行)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={25}
                    value={newMapHeight}
                    onChange={(e) => setNewMapHeight(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  初始预设模板
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200"
                >
                  <option value="knight_domain">🏰 骑士领地与堡垒 (默认城堡/村庄)</option>
                  <option value="misty_forest">🌲 迷雾森林与古迹 (密林/石圈)</option>
                  <option value="coastal_isle">🌊 海岸与远征岛屿 (水域/海港)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  创建并进入操作
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapHubPage;
