import mqtt from 'mqtt';
import type { HexCell, MapToken, DiceRollResult } from '../types/map';

const BROKER_URLS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://test.mosquitto.org:8081',
];

export interface RoomAnnounceMessage {
  roomId: string;
  name: string;
  hostName: string;
  playerCount: number;
  currentMapTitle: string;
  lastActiveTime: number;
}

export interface MapStatePayload {
  width: number;
  height: number;
  currentMapTitle: string;
  hexes: Record<string, HexCell>;
  tokens: MapToken[];
  movementPhaseActive: boolean;
  partyGroupMode: boolean;
}

export interface NetworkMessage {
  type:
    | 'LOBBY_ANNOUNCE'
    | 'JOIN_REQUEST'
    | 'JOIN_ACK'
    | 'FULL_STATE_SYNC'
    | 'TOKEN_MOVED'
    | 'TOGGLE_MOVEMENT_PHASE'
    | 'TOGGLE_PARTY_MODE'
    | 'MAP_HEX_UPDATED'
    | 'DICE_ROLLED'
    | 'ROOM_CLOSED';
  senderId: string;
  senderName: string;
  payload: unknown;
  timestamp: number;
}

type MessageHandler = (msg: NetworkMessage) => void;
type LobbyAnnounceHandler = (rooms: RoomAnnounceMessage[]) => void;

class MQTTRoomService {
  private client: ReturnType<typeof mqtt.connect> | null = null;
  private currentRoomId: string | null = null;
  private isHost: boolean = false;
  private clientId: string = `user-${Math.random().toString(36).substring(2, 9)}`;
  private messageListeners: MessageHandler[] = [];
  private lobbyListeners: LobbyAnnounceHandler[] = [];
  private discoveredRooms: Map<string, RoomAnnounceMessage> = new Map();
  private announceTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatCleanerTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initLobbyClient();
  }

  // 初始化 MQTT 客户端连接
  private initLobbyClient() {
    if (this.client) return;

    try {
      this.client = mqtt.connect(BROKER_URLS[0], {
        clientId: this.clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 3000,
      });

      this.client.on('connect', () => {
        console.log('[MQTT] 已成功连接至公共通信枢纽 Broker:', BROKER_URLS[0]);
        // 订阅大厅广播，用于动态搜寻在线房间
        this.client?.subscribe('mythic/lobby/announce');
      });

      this.client.on('message', (topic, message) => {
        try {
          const data: NetworkMessage = JSON.parse(message.toString());

          if (topic === 'mythic/lobby/announce' && data.type === 'LOBBY_ANNOUNCE') {
            this.handleLobbyAnnounce(data.payload as RoomAnnounceMessage);
          } else {
            // 处理当前房间消息
            this.messageListeners.forEach((listener) => listener(data));
          }
        } catch (e) {
          console.error('[MQTT] 消息解析异常:', e);
        }
      });

      this.client.on('error', (err) => {
        console.warn('[MQTT] Broker 连接尝试告警, 尝试备用节点:', err.message);
      });
    } catch (e) {
      console.error('[MQTT] 连接初始化失败:', e);
    }

    // 定时清理超过 20 秒未心跳的超时房间
    if (!this.heartbeatCleanerTimer) {
      this.heartbeatCleanerTimer = setInterval(() => {
        const now = Date.now();
        let changed = false;
        this.discoveredRooms.forEach((room, id) => {
          if (now - room.lastActiveTime > 20000) {
            this.discoveredRooms.delete(id);
            changed = true;
          }
        });
        if (changed) {
          this.notifyLobbyListeners();
        }
      }, 5000);
    }
  }

  private handleLobbyAnnounce(announce: RoomAnnounceMessage) {
    this.discoveredRooms.set(announce.roomId, {
      ...announce,
      lastActiveTime: Date.now(),
    });
    this.notifyLobbyListeners();
  }

  private notifyLobbyListeners() {
    const list = Array.from(this.discoveredRooms.values());
    this.lobbyListeners.forEach((fn) => fn(list));
  }

  // 监听大厅房间发现
  public onLobbyRoomsUpdate(callback: LobbyAnnounceHandler) {
    this.lobbyListeners.push(callback);
    callback(Array.from(this.discoveredRooms.values()));
    return () => {
      this.lobbyListeners = this.lobbyListeners.filter((fn) => fn !== callback);
    };
  }

  // 监听房间实时网络消息
  public onMessage(callback: MessageHandler) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((fn) => fn !== callback);
    };
  }

  // 1. 主持人（GM）开启广播房间
  public startRoomHost(
    roomId: string,
    roomName: string,
    hostName: string,
    getMapState: () => MapStatePayload
  ) {
    this.currentRoomId = roomId;
    this.isHost = true;

    if (this.client && this.client.connected) {
      // 订阅 Host 专属频道 与 广播频道
      this.client.subscribe(`mythic/room/${roomId}/host`);
      this.client.subscribe(`mythic/room/${roomId}/broadcast`);
    }

    // 开启心跳大厅广播 (每 5 秒广播一次房间名和基本状态)
    if (this.announceTimer) clearInterval(this.announceTimer);
    this.announceTimer = setInterval(() => {
      const state = getMapState();
      const announce: RoomAnnounceMessage = {
        roomId,
        name: roomName,
        hostName,
        playerCount: state.tokens.filter((t) => t.isPlayer).length,
        currentMapTitle: state.currentMapTitle,
        lastActiveTime: Date.now(),
      };
      this.publishNetworkMessage('mythic/lobby/announce', 'LOBBY_ANNOUNCE', hostName, announce);
    }, 5000);

    // 立即广播一次
    const state = getMapState();
    const announce: RoomAnnounceMessage = {
      roomId,
      name: roomName,
      hostName,
      playerCount: state.tokens.filter((t) => t.isPlayer).length,
      currentMapTitle: state.currentMapTitle,
      lastActiveTime: Date.now(),
    };
    this.publishNetworkMessage('mythic/lobby/announce', 'LOBBY_ANNOUNCE', hostName, announce);
  }

  // 2. 骑士（Player）加入实时房间
  public joinRoomPlayer(roomId: string, playerName: string) {
    this.currentRoomId = roomId;
    this.isHost = false;

    if (this.client && this.client.connected) {
      // 订阅房间广播频道 与 个人私密频道
      this.client.subscribe(`mythic/room/${roomId}/broadcast`);
      this.client.subscribe(`mythic/room/${roomId}/player/${this.clientId}`);

      // 向 Host 发起请求
      this.publishNetworkMessage(`mythic/room/${roomId}/host`, 'JOIN_REQUEST', playerName, {
        playerId: this.clientId,
        playerName,
      });
    }
  }

  // 3. 广播全量地图状态 (Host -> All Players)
  public broadcastFullState(hostName: string, state: MapStatePayload) {
    if (!this.currentRoomId) return;
    this.publishNetworkMessage(
      `mythic/room/${this.currentRoomId}/broadcast`,
      'FULL_STATE_SYNC',
      hostName,
      state
    );
  }

  // 4. 广播棋子移动
  public broadcastTokenMove(senderName: string, tokenId: string, col: number, row: number) {
    if (!this.currentRoomId) return;
    const topic = this.isHost
      ? `mythic/room/${this.currentRoomId}/broadcast`
      : `mythic/room/${this.currentRoomId}/host`;

    this.publishNetworkMessage(topic, 'TOKEN_MOVED', senderName, {
      tokenId,
      col,
      row,
    });
  }

  // 5. GM 广播回合开关与组队模式
  public broadcastMovementPhaseToggle(hostName: string, active: boolean) {
    if (!this.currentRoomId) return;
    this.publishNetworkMessage(
      `mythic/room/${this.currentRoomId}/broadcast`,
      'TOGGLE_MOVEMENT_PHASE',
      hostName,
      { active }
    );
  }

  public broadcastPartyModeToggle(hostName: string, active: boolean) {
    if (!this.currentRoomId) return;
    this.publishNetworkMessage(
      `mythic/room/${this.currentRoomId}/broadcast`,
      'TOGGLE_PARTY_MODE',
      hostName,
      { active }
    );
  }

  // 6. GM 广播地图地形/涂色更新
  public broadcastMapHexUpdated(hostName: string, hexes: Record<string, HexCell>) {
    if (!this.currentRoomId) return;
    this.publishNetworkMessage(
      `mythic/room/${this.currentRoomId}/broadcast`,
      'MAP_HEX_UPDATED',
      hostName,
      { hexes }
    );
  }

  // 7. 广播公开掷骰
  public broadcastDiceRoll(senderName: string, diceLog: DiceRollResult) {
    if (!this.currentRoomId) return;
    this.publishNetworkMessage(
      `mythic/room/${this.currentRoomId}/broadcast`,
      'DICE_ROLLED',
      senderName,
      { diceLog }
    );
  }

  // 8. 解散/离开房间
  public closeRoom(hostName: string) {
    if (this.currentRoomId && this.isHost) {
      this.publishNetworkMessage(
        `mythic/room/${this.currentRoomId}/broadcast`,
        'ROOM_CLOSED',
        hostName,
        { roomId: this.currentRoomId }
      );
    }
    if (this.announceTimer) clearInterval(this.announceTimer);
    this.currentRoomId = null;
    this.isHost = false;
  }

  private publishNetworkMessage(
    topic: string,
    type: NetworkMessage['type'],
    senderName: string,
    payload: unknown
  ) {
    if (!this.client || !this.client.connected) return;

    const message: NetworkMessage = {
      type,
      senderId: this.clientId,
      senderName,
      payload,
      timestamp: Date.now(),
    };

    this.client.publish(topic, JSON.stringify(message), { qos: 0 });
  }

  public getClientId() {
    return this.clientId;
  }

  public getCurrentRoomId() {
    return this.currentRoomId;
  }

  public getDiscoveredRooms() {
    return Array.from(this.discoveredRooms.values());
  }
}

export const mqttRoomService = new MQTTRoomService();
