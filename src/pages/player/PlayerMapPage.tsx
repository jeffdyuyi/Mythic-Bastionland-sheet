import React, { useState, useEffect } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { useAppStore } from '../../store/useAppStore';
import { mqttRoomService, type RoomAnnounceMessage } from '../../services/mqttRoomService';
import { HexMapCanvas } from '../../components/map/HexMapCanvas';
import { HexInspectorDrawer } from '../../components/map/HexInspectorDrawer';
import { MapHeaderControlBar } from '../../components/map/MapHeaderControlBar';
import { Crosshair, Users, Search, Swords, Radio, ArrowLeft } from 'lucide-react';

export const PlayerMapPage: React.FC = () => {
  const setRole = useAppStore((state) => state.setRole);
  const {
    setMode,
    sightDistance,
    revealMode,
    activeRoom,
    rooms,
    joinRoomById,
    cleanupInactiveRooms,
    setActiveRoom,
  } = useMapStore();

  const [onlineRooms, setOnlineRooms] = useState<RoomAnnounceMessage[]>([]);
  const [inputRoomId, setInputRoomId] = useState('');

  useEffect(() => {
    setRole('player');
    setMode('player');
    cleanupInactiveRooms();

    const unsubscribe = mqttRoomService.onLobbyRoomsUpdate((discovered) => {
      setOnlineRooms(discovered);
    });
    return () => unsubscribe();
  }, [setRole, setMode, cleanupInactiveRooms]);

  // 骑士：加入选中房间
  const handleJoinRoom = (roomId: string) => {
    joinRoomById(roomId);
    mqttRoomService.joinRoomPlayer(roomId, '探索骑士');
  };

  // 骑士：通过代码加入房间
  const handleJoinByCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    handleJoinRoom(inputRoomId.trim());
  };

  // 未加入房间：显示骑士专用联机房间选择（有就有、没有就没有）
  if (!activeRoom) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-16 px-3 sm:px-6">
        {/* 顶部 Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
          <div className="space-y-3 relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-mono font-bold tracking-widest uppercase border border-emerald-500/30">
              <Swords className="w-4 h-4 text-emerald-400" />
              <span>KNIGHT EXPLORATION PORTAL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-100 tracking-tight">
              骑士战团 - 联机地图探索大厅
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed opacity-90">
              在此选择主持人广播开启的战役探险房间，或直接输入房间代码进入迷雾小队推移。
            </p>
          </div>
        </div>

        {/* 搜寻与直连栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>开放的探险房间 ({onlineRooms.length + rooms.length})</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              选择在线房间点击连入，或在右侧输入主持人提供的房间代码。
            </p>
          </div>

          <form onSubmit={handleJoinByCodeSubmit} className="flex gap-2 shrink-0">
            <input
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="例如: ROOM-8891"
              className="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" /> 代码直连
            </button>
          </form>
        </div>

        {/* 房间列表/空状态 (有就有，没有就没有) */}
        {onlineRooms.length === 0 && rooms.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl font-bold border border-emerald-500/20">
              🧭
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                暂无在线的战役探险房间
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-md mx-auto mt-1">
                请等待主持人开启广播房间，或让主持人提供房间代码直接输入加入。
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* MQTT 跨网发现广播房间 */}
            {onlineRooms.map((or) => (
              <div
                key={or.roomId}
                className="bg-gradient-to-br from-emerald-950/30 via-stone-900 to-stone-900 rounded-3xl p-5 border-2 border-emerald-500/60 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-500 text-stone-950 rounded-full flex items-center gap-1 shadow-sm">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-stone-950" />
                      <span>{or.roomId}</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      📡 跨网在线
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-emerald-100 text-base">
                      {or.name}
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                      地图: {or.currentMapTitle || '战役领地'}
                    </p>
                  </div>

                  <div className="text-xs text-stone-300 space-y-1 bg-black/40 p-2.5 rounded-xl border border-emerald-500/20">
                    <div className="flex justify-between">
                      <span>主持裁判:</span>
                      <span className="font-semibold text-amber-300">{or.hostName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>在线骑士:</span>
                      <span className="font-semibold text-emerald-300">{or.playerCount} 人参与</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-500/20">
                  <button
                    onClick={() => handleJoinRoom(or.roomId)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Swords className="w-4 h-4" /> 加入此房间探险
                  </button>
                </div>
              </div>
            ))}

            {/* 本地保存的广播房间 */}
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
        )}
      </div>
    );
  }

  // 已加入房间：渲染骑士地图工作区
  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 space-y-4 pb-12">
      {/* 顶部标题与行动说明 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-mono font-bold">
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>🛡️ 房间: {activeRoom.id} · {activeRoom.name}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            六边形荒野地图探索
          </h2>
        </div>

        <button
          onClick={() => setActiveRoom(null)}
          className="py-2 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-2xl text-xs font-bold transition border border-stone-200 dark:border-stone-700 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>切换/更换房间</span>
        </button>
      </div>

      {/* 队伍棋子与基础控制条 */}
      <MapHeaderControlBar
        onOpenTemplates={() => {}}
        onOpenSettings={() => {}}
        lastAutoSaveTime=""
      />

      {/* 骑士端视野展示 */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>直接点击地图上的六边形格子，你的骑士棋子将自动行走并揭开周围的战争迷雾！</span>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/80 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 font-bold text-stone-700 dark:text-stone-300 shrink-0">
          <span>👁️ 主持人设定感知: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{sightDistance} 格</strong></span>
          <span className="w-px h-3.5 bg-stone-300 dark:bg-stone-600" />
          <span>{revealMode === 'permanent' ? '📜 永久探知揭示' : '🌫️ 动态视线 (LOS)'}</span>
        </div>
      </div>

      {/* 全宽 HexMapCanvas 画布 (占据100%容器宽度) */}
      <div className="w-full relative shadow-lg rounded-3xl overflow-hidden">
        <HexMapCanvas />
      </div>

      {/* 六边形格子档案抽屉 */}
      <HexInspectorDrawer />
    </div>
  );
};

export default PlayerMapPage;
