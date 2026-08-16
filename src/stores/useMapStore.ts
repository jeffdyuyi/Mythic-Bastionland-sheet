import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HexCell, TerrainType, StructureType, MapToken, MapTool, DiceRollResult, SavedMap, MapRoom } from '../types/map';

interface MapState {
  // 地图尺寸与视口
  width: number;
  height: number;
  hexSize: number;
  
  // 模式与工具
  mode: 'gm' | 'player';
  activeTool: MapTool;
  selectedTerrain: TerrainType;
  selectedStructure: StructureType;
  
  // 战争迷雾与视距
  sightDistance: number; // 1-5 格
  revealMode: 'permanent' | 'los'; // 永久揭示 vs 动态视线
  
  // 数据
  currentMapTitle: string;
  hexes: Record<string, HexCell>;
  tokens: MapToken[];
  selectedHexKey: string | null;
  selectedTokenId: string | null;
  savedMaps: SavedMap[];
  rooms: MapRoom[];
  activeRoom: MapRoom | null;
  
  // 撤销/重做
  history: Record<string, HexCell>[];
  historyIndex: number;

  // 掷骰聚合
  diceLogs: DiceRollResult[];

  // Actions
  setMode: (mode: 'gm' | 'player') => void;
  setActiveTool: (tool: MapTool) => void;
  setSelectedTerrain: (t: TerrainType) => void;
  setSelectedStructure: (s: StructureType) => void;
  setSightDistance: (dist: number) => void;
  setRevealMode: (mode: 'permanent' | 'los') => void;
  setGridDimensions: (width: number, height: number, hexSize?: number) => void;
  setCurrentMapTitle: (title: string) => void;
  
  // 绘制与编辑
  paintHex: (col: number, row: number) => void;
  floodFillTerrain: (col: number, row: number, newTerrain: TerrainType) => void;
  toggleHexExplored: (col: number, row: number) => void;
  updateHexLabel: (col: number, row: number, label: string, notes?: string) => void;
  linkMythToHex: (col: number, row: number, mythInstanceId?: string, omenIndex?: number) => void;
  selectHex: (key: string | null) => void;
  
  // Token 操作
  addToken: (name: string, col: number, row: number, color?: string, isPlayer?: boolean) => void;
  moveToken: (id: string, col: number, row: number) => void;
  removeToken: (id: string) => void;
  selectToken: (id: string | null) => void;
  
  // 模版与生成
  applyTemplate: (templateName: string) => void;
  generateRandomBiome: () => void;
  clearMap: () => void;
  
  // Undo / Redo
  undo: () => void;
  redo: () => void;

  // 地图与房间管理
  createNewMap: (name: string, width: number, height: number, templateName?: string) => SavedMap;
  saveCurrentMap: (name: string) => SavedMap;
  loadSavedMapById: (mapId: string) => boolean;
  loadMap: (mapId: string) => void;
  deleteSavedMap: (mapId: string) => void;
  importMapJSON: (jsonStr: string) => boolean;
  
  // 房间列表与加入
  setActiveRoom: (room: MapRoom | null) => void;
  joinRoomById: (roomId: string) => boolean;
  createRoom: (name: string, hostName: string, mapName?: string) => MapRoom;

  // 投骰聚合
  rollDice: (expression: string, label: string, roller?: string) => DiceRollResult;
  clearDiceLogs: () => void;
}

const DEFAULT_WIDTH = 12;
const DEFAULT_HEIGHT = 10;
const DEFAULT_HEX_SIZE = 42;

// 辅助：生成 key
export const getHexKey = (col: number, row: number) => `${col}_${row}`;

// 辅助：六边形邻居计算 (Odd-r offset coordinate system)
export const getHexNeighbors = (col: number, row: number, maxCol: number, maxRow: number): [number, number][] => {
  const isEvenRow = row % 2 === 0;
  const offsets = isEvenRow ? [
    [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 0]
  ] : [
    [-1, -1], [0, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]
  ];

  const neighbors: [number, number][] = [];
  for (const [dc, dr] of offsets) {
    const nc = col + dc;
    const nr = row + dr;
    if (nc >= 0 && nc < maxCol && nr >= 0 && nr < maxRow) {
      neighbors.push([nc, nr]);
    }
  }
  return neighbors;
};

// 计算指定视距范围内的所有六边形 (BFS 搜索)
export const getHexesInRange = (startCol: number, startRow: number, range: number, maxCol: number, maxRow: number): Set<string> => {
  const visited = new Set<string>();
  const queue: Array<{ col: number; row: number; dist: number }> = [{ col: startCol, row: startRow, dist: 0 }];
  visited.add(getHexKey(startCol, startRow));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.dist >= range) continue;

    const neighbors = getHexNeighbors(current.col, current.row, maxCol, maxRow);
    for (const [nc, nr] of neighbors) {
      const key = getHexKey(nc, nr);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ col: nc, row: nr, dist: current.dist + 1 });
      }
    }
  }

  return visited;
};

// 初始化网格数据
const createInitialHexes = (w: number, h: number): Record<string, HexCell> => {
  const hexes: Record<string, HexCell> = {};
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const key = getHexKey(c, r);
      hexes[key] = {
        col: c,
        row: r,
        terrain: 'plains',
        structure: 'none',
        explored: false,
      };
    }
  }
  return hexes;
};

const DEFAULT_PRESET_MAPS: SavedMap[] = [
  {
    id: 'preset-map-1',
    name: '星辉堡垒与磨坊镇领地',
    updatedAt: '2026-08-16',
    width: 12,
    height: 10,
    hexes: (() => {
      const hexes = createInitialHexes(12, 10);
      hexes[getHexKey(6, 5)].structure = 'castle';
      hexes[getHexKey(6, 5)].label = '星辉城堡';
      hexes[getHexKey(5, 4)].structure = 'village';
      hexes[getHexKey(5, 4)].label = '磨坊镇';
      hexes[getHexKey(7, 6)].terrain = 'forest';
      hexes[getHexKey(7, 6)].structure = 'ruins';
      hexes[getHexKey(7, 6)].label = '古木遗迹';
      hexes[getHexKey(4, 5)].terrain = 'water';
      hexes[getHexKey(4, 5)].label = '清泉水域';
      return hexes;
    })(),
    tokens: [
      { id: 'token-preset-1', name: '镜之骑士', col: 5, row: 4, color: '#B45309', symbol: 'M', isPlayer: true },
      { id: 'token-preset-2', name: '守护骑士', col: 6, row: 5, color: '#15803D', symbol: 'G', isPlayer: true },
    ],
  },
  {
    id: 'preset-map-2',
    name: '迷雾森林与上古巨石阵',
    updatedAt: '2026-08-16',
    width: 12,
    height: 10,
    hexes: (() => {
      const hexes = createInitialHexes(12, 10);
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 12; c++) {
          const key = getHexKey(c, r);
          if ((c + r) % 3 === 0) hexes[key].terrain = 'forest';
          else if ((c + r) % 5 === 0) hexes[key].terrain = 'swamp';
          else if ((c + r) % 7 === 0) hexes[key].terrain = 'hills';
        }
      }
      hexes[getHexKey(3, 3)].structure = 'myth_site';
      hexes[getHexKey(3, 3)].label = '上古巨石阵';
      hexes[getHexKey(8, 7)].structure = 'ruins';
      hexes[getHexKey(8, 7)].label = '破损哨塔';
      return hexes;
    })(),
    tokens: [
      { id: 'token-preset-3', name: '游侠骑士', col: 3, row: 3, color: '#0284C7', symbol: 'R', isPlayer: true },
    ],
  },
];

const DEFAULT_PRESET_ROOMS: MapRoom[] = [
  {
    id: 'ROOM-8891',
    name: '⚔️ 磨坊镇与堡垒探险团',
    hostName: 'GM 埃尔德',
    mapName: '星辉堡垒与磨坊镇领地',
    mapId: 'preset-map-1',
    currentPlayers: 3,
    maxPlayers: 5,
    status: 'open',
    description: '正在探索星辉城堡周边的古木遗迹与磨坊镇，欢迎新骑士加入！',
    updatedAt: '10分钟前',
  },
  {
    id: 'ROOM-1024',
    name: '🌲 迷雾森林上古神话远征',
    hostName: 'GM 柯米',
    mapName: '迷雾森林与上古巨石阵',
    mapId: 'preset-map-2',
    currentPlayers: 2,
    maxPlayers: 4,
    status: 'open',
    description: '深山迷雾中发现了神秘巨石阵预兆，急需有勇气的骑士前往解密。',
    updatedAt: '25分钟前',
  },
  {
    id: 'ROOM-7788',
    name: '🌊 海岸关口与深海哨塔领地',
    hostName: 'GM 风魔',
    mapName: '海岸与远征岛屿',
    currentPlayers: 4,
    maxPlayers: 4,
    status: 'in_progress',
    description: '海岸线风暴来袭，探索小队正在坚守深海哨塔。',
    updatedAt: '1小时前',
  },
];

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      hexSize: DEFAULT_HEX_SIZE,
      
      mode: 'gm',
      activeTool: 'brush',
      selectedTerrain: 'plains',
      selectedStructure: 'none',
      
      sightDistance: 2,
      revealMode: 'permanent',
      
      currentMapTitle: '星辉堡垒与磨坊镇领地',
      hexes: createInitialHexes(DEFAULT_WIDTH, DEFAULT_HEIGHT),
      tokens: [
        { id: 'player-1', name: '探索骑士', col: 2, row: 2, color: '#B45309', symbol: 'K', isPlayer: true }
      ],
      selectedHexKey: null,
      selectedTokenId: null,
      savedMaps: DEFAULT_PRESET_MAPS,
      rooms: DEFAULT_PRESET_ROOMS,
      activeRoom: null,
      
      history: [createInitialHexes(DEFAULT_WIDTH, DEFAULT_HEIGHT)],
      historyIndex: 0,

      diceLogs: [
        {
          id: 'init-roll',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          roller: '探索日志',
          label: '踏入神话堡垒之地',
          expression: '2d12',
          rolls: [8, 5],
          total: 13,
          detail: '战役开启！已准备六边形探索网格与骰子塔。',
        }
      ],

      setMode: (mode) => set({ mode }),
      setActiveTool: (activeTool) => set({ activeTool }),
      setSelectedTerrain: (selectedTerrain) => set({ selectedTerrain }),
      setSelectedStructure: (selectedStructure) => set({ selectedStructure }),
      setSightDistance: (sightDistance) => set({ sightDistance }),
      setRevealMode: (revealMode) => set({ revealMode }),
      
      setGridDimensions: (width, height, hexSize = DEFAULT_HEX_SIZE) => {
        const newHexes = createInitialHexes(width, height);
        set({
          width,
          height,
          hexSize,
          hexes: newHexes,
          history: [newHexes],
          historyIndex: 0,
        });
      },

      selectHex: (selectedHexKey) => set({ selectedHexKey }),
      selectToken: (selectedTokenId) => set({ selectedTokenId }),

      // 涂色
      paintHex: (col, row) => {
        const key = getHexKey(col, row);
        const { hexes, selectedTerrain, selectedStructure, activeTool, history, historyIndex } = get();
        const currentCell = hexes[key];
        if (!currentCell) return;

        const updatedCell = { ...currentCell };

        if (activeTool === 'brush') {
          updatedCell.terrain = selectedTerrain;
          if (selectedStructure !== 'none') {
            updatedCell.structure = selectedStructure;
          }
        } else if (activeTool === 'erase') {
          updatedCell.terrain = 'plains';
          updatedCell.structure = 'none';
          updatedCell.label = '';
          updatedCell.notes = '';
        } else if (activeTool === 'fog_toggle') {
          updatedCell.explored = !updatedCell.explored;
        }

        const newHexes = { ...hexes, [key]: updatedCell };
        
        // 记录历史
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newHexes);

        set({
          hexes: newHexes,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      // 泛洪填充 (Flood Fill)
      floodFillTerrain: (startCol, startRow, newTerrain) => {
        const { hexes, width, height, history, historyIndex } = get();
        const startKey = getHexKey(startCol, startRow);
        const startCell = hexes[startKey];
        if (!startCell || startCell.terrain === newTerrain) return;

        const targetTerrain = startCell.terrain;
        const newHexes = { ...hexes };
        const visited = new Set<string>();
        const queue: [number, number][] = [[startCol, startRow]];

        while (queue.length > 0) {
          const [c, r] = queue.shift()!;
          const key = getHexKey(c, r);
          if (visited.has(key)) continue;
          visited.add(key);

          if (newHexes[key] && newHexes[key].terrain === targetTerrain) {
            newHexes[key] = { ...newHexes[key], terrain: newTerrain };
            const neighbors = getHexNeighbors(c, r, width, height);
            for (const [nc, nr] of neighbors) {
              queue.push([nc, nr]);
            }
          }
        }

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newHexes);

        set({
          hexes: newHexes,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      toggleHexExplored: (col, row) => {
        const key = getHexKey(col, row);
        const { hexes } = get();
        if (!hexes[key]) return;
        set({
          hexes: {
            ...hexes,
            [key]: { ...hexes[key], explored: !hexes[key].explored },
          },
        });
      },

      updateHexLabel: (col, row, label, notes) => {
        const key = getHexKey(col, row);
        const { hexes } = get();
        if (!hexes[key]) return;
        set({
          hexes: {
            ...hexes,
            [key]: { ...hexes[key], label, notes: notes !== undefined ? notes : hexes[key].notes },
          },
        });
      },

      linkMythToHex: (col, row, mythInstanceId, omenIndex) => {
        const key = getHexKey(col, row);
        const { hexes } = get();
        if (!hexes[key]) return;
        set({
          hexes: {
            ...hexes,
            [key]: {
              ...hexes[key],
              linkedMythInstanceId: mythInstanceId,
              linkedOmenIndex: omenIndex,
            },
          },
        });
      },

      // Token 操作与视距迷雾联动
      addToken: (name, col, row, color = '#BE123C', isPlayer = false) => {
        const { tokens, width, height, sightDistance, hexes } = get();
        const newToken: MapToken = {
          id: `token-${Date.now()}`,
          name,
          col,
          row,
          color,
          symbol: name.charAt(0).toUpperCase() || 'T',
          isPlayer,
        };

        const newHexes = { ...hexes };
        // 如果是玩家 Token，自动解锁视距迷雾
        if (isPlayer) {
          const visibleKeys = getHexesInRange(col, row, sightDistance, width, height);
          visibleKeys.forEach((key) => {
            if (newHexes[key]) {
              newHexes[key] = { ...newHexes[key], explored: true };
            }
          });
        }

        set({
          tokens: [...tokens, newToken],
          hexes: newHexes,
        });
      },

      moveToken: (id, col, row) => {
        const { tokens, width, height, sightDistance, hexes, revealMode } = get();
        const tokenIndex = tokens.findIndex((t) => t.id === id);
        if (tokenIndex === -1) return;

        const targetToken = tokens[tokenIndex];
        const updatedTokens = [...tokens];
        updatedTokens[tokenIndex] = { ...targetToken, col, row };

        const newHexes = { ...hexes };

        if (targetToken.isPlayer) {
          // 如果是动态视线 (LOS)，先清空旧遮罩
          if (revealMode === 'los') {
            Object.keys(newHexes).forEach((key) => {
              newHexes[key] = { ...newHexes[key], explored: false };
            });
          }

          // 重新解锁所有玩家 Token 的周围格子
          updatedTokens.forEach((t) => {
            if (t.isPlayer) {
              const visibleKeys = getHexesInRange(t.col, t.row, sightDistance, width, height);
              visibleKeys.forEach((key) => {
                if (newHexes[key]) {
                  newHexes[key] = { ...newHexes[key], explored: true };
                }
              });
            }
          });
        }

        set({
          tokens: updatedTokens,
          hexes: newHexes,
        });
      },

      removeToken: (id) => {
        set({ tokens: get().tokens.filter((t) => t.id !== id), selectedTokenId: null });
      },

      // 程序生成群系 (Procedural Biome Generation)
      generateRandomBiome: () => {
        const { width, height } = get();
        const newHexes: Record<string, HexCell> = {};

        // 默认全平原
        for (let r = 0; r < height; r++) {
          for (let c = 0; c < width; c++) {
            const key = getHexKey(c, r);
            newHexes[key] = { col: c, row: r, terrain: 'plains', structure: 'none', explored: false };
          }
        }

        // 辅助随机放置地形簇
        const placeCluster = (terrain: TerrainType, count: number) => {
          for (let i = 0; i < count; i++) {
            const rc = Math.floor(Math.random() * width);
            const rr = Math.floor(Math.random() * height);
            const key = getHexKey(rc, rr);
            if (newHexes[key]) {
              newHexes[key].terrain = terrain;
              // 扩散邻居
              const neighbors = getHexNeighbors(rc, rr, width, height);
              neighbors.forEach(([nc, nr]) => {
                if (Math.random() > 0.45) {
                  const nkey = getHexKey(nc, nr);
                  if (newHexes[nkey]) newHexes[nkey].terrain = terrain;
                }
              });
            }
          }
        };

        placeCluster('mountain', 3);
        placeCluster('forest', 5);
        placeCluster('water', 2);
        placeCluster('swamp', 2);
        placeCluster('hills', 4);

        // 随机放置1-2个村庄与废墟
        const randomHexes = Object.values(newHexes);
        const v1 = randomHexes[Math.floor(Math.random() * randomHexes.length)];
        if (v1) v1.structure = 'village';
        const v2 = randomHexes[Math.floor(Math.random() * randomHexes.length)];
        if (v2) v2.structure = 'ruins';

        const history = [newHexes];

        set({
          hexes: newHexes,
          history,
          historyIndex: 0,
        });
      },

      // 应用预设模板
      applyTemplate: (templateName) => {
        const { width, height } = get();
        const newHexes = createInitialHexes(width, height);

        if (templateName === 'knight_domain') {
          // 骑士领地：中心堡垒 + 环绕村落与平原
          const midC = Math.floor(width / 2);
          const midR = Math.floor(height / 2);
          newHexes[getHexKey(midC, midR)].structure = 'castle';
          newHexes[getHexKey(midC, midR)].label = '星辉城堡';

          getHexNeighbors(midC, midR, width, height).forEach(([c, r], idx) => {
            const key = getHexKey(c, r);
            if (idx === 0) {
              newHexes[key].structure = 'village';
              newHexes[key].label = '磨坊镇';
            } else if (idx === 2) {
              newHexes[key].terrain = 'forest';
            } else {
              newHexes[key].terrain = 'plains';
            }
          });
        } else if (templateName === 'misty_forest') {
          // 迷雾森林：大量森林与遗迹
          for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
              const key = getHexKey(c, r);
              const rand = Math.random();
              if (rand < 0.5) newHexes[key].terrain = 'forest';
              else if (rand < 0.7) newHexes[key].terrain = 'swamp';
              else newHexes[key].terrain = 'hills';
            }
          }
          newHexes[getHexKey(2, 2)].structure = 'ruins';
          newHexes[getHexKey(2, 2)].label = '上古石圈';
        } else if (templateName === 'coastal_isle') {
          // 海岸与浅滩
          for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
              const key = getHexKey(c, r);
              if (c === 0 || c === 1 || r === 0) {
                newHexes[key].terrain = 'deep_water';
              } else if (c === 2) {
                newHexes[key].terrain = 'shallow_water';
              } else if (c > 5) {
                newHexes[key].terrain = 'mountain';
              } else {
                newHexes[key].terrain = 'plains';
              }
            }
          }
          newHexes[getHexKey(4, 4)].structure = 'town';
          newHexes[getHexKey(4, 4)].label = '海风港';
        }

        set({
          hexes: newHexes,
          history: [newHexes],
          historyIndex: 0,
        });
      },

      clearMap: () => {
        const { width, height } = get();
        const empty = createInitialHexes(width, height);
        set({
          hexes: empty,
          tokens: [],
          history: [empty],
          historyIndex: 0,
        });
      },

      setCurrentMapTitle: (title) => set({ currentMapTitle: title }),

      createNewMap: (name, width, height, templateName) => {
        const newHexes = createInitialHexes(width, height);
        const newMap: SavedMap = {
          id: `map-${Date.now()}`,
          name: name || `自定义地图 ${get().savedMaps.length + 1}`,
          updatedAt: new Date().toLocaleDateString('zh-CN'),
          width,
          height,
          hexes: newHexes,
          tokens: [
            { id: 'token-player', name: '探索骑士', col: Math.floor(width / 2), row: Math.floor(height / 2), color: '#B45309', symbol: 'K', isPlayer: true }
          ]
        };
        const updatedSavedMaps = [newMap, ...get().savedMaps];
        set({
          savedMaps: updatedSavedMaps,
          width,
          height,
          hexes: newHexes,
          tokens: newMap.tokens,
          currentMapTitle: newMap.name,
          mode: 'gm',
          history: [newHexes],
          historyIndex: 0,
        });
        if (templateName) {
          get().applyTemplate(templateName);
        }
        return newMap;
      },

      saveCurrentMap: (name) => {
        const { savedMaps, width, height, hexes, tokens, currentMapTitle } = get();
        const mapName = name || currentMapTitle || `战役地图 ${savedMaps.length + 1}`;
        const newMap: SavedMap = {
          id: `map-${Date.now()}`,
          name: mapName,
          updatedAt: new Date().toLocaleDateString('zh-CN'),
          width,
          height,
          hexes,
          tokens,
        };
        set({ savedMaps: [newMap, ...savedMaps], currentMapTitle: mapName });
        return newMap;
      },

      loadSavedMapById: (mapId) => {
        const target = get().savedMaps.find((m) => m.id === mapId);
        if (!target) return false;
        set({
          width: target.width,
          height: target.height,
          hexes: target.hexes,
          tokens: target.tokens,
          currentMapTitle: target.name,
          mode: 'gm',
          history: [target.hexes],
          historyIndex: 0,
        });
        return true;
      },

      loadMap: (mapId) => {
        get().loadSavedMapById(mapId);
      },

      deleteSavedMap: (mapId) => {
        set({ savedMaps: get().savedMaps.filter((m) => m.id !== mapId) });
      },

      importMapJSON: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (data.hexes && data.width && data.height) {
            set({
              width: data.width,
              height: data.height,
              hexes: data.hexes,
              tokens: data.tokens || [],
              currentMapTitle: data.name || '导入地图',
              history: [data.hexes],
              historyIndex: 0,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      setActiveRoom: (room) => set({ activeRoom: room }),

      joinRoomById: (roomId) => {
        const room = get().rooms.find((r) => r.id.toLowerCase() === roomId.trim().toLowerCase());
        if (room) {
          if (room.mapId) {
            get().loadSavedMapById(room.mapId);
          }
          set({
            activeRoom: room,
            currentMapTitle: `${room.name}`,
            mode: 'player', // 骑士视角加入
          });
          return true;
        }
        const customRoom: MapRoom = {
          id: roomId.toUpperCase(),
          name: `房间 ${roomId.toUpperCase()}`,
          hostName: '未知 GM',
          mapName: '探险地图',
          currentPlayers: 1,
          maxPlayers: 4,
          status: 'open',
          description: '通过房间代码直连加入的探索通道',
          updatedAt: '刚刚',
        };
        set({
          activeRoom: customRoom,
          currentMapTitle: customRoom.name,
          mode: 'player',
        });
        return true;
      },

      createRoom: (name, hostName, mapName) => {
        const { savedMaps, currentMapTitle } = get();
        const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
        const newRoom: MapRoom = {
          id: roomId,
          name: name || `GM 探险小队 ${roomId}`,
          hostName: hostName || 'GM 裁判',
          mapName: mapName || currentMapTitle || '星辉堡垒领地',
          mapId: savedMaps[0]?.id,
          currentPlayers: 1,
          maxPlayers: 5,
          status: 'open',
          description: '在线房间已开启，等待骑士连接并进行探索。',
          updatedAt: '刚刚',
        };
        set({
          rooms: [newRoom, ...get().rooms],
          activeRoom: newRoom,
          mode: 'gm',
        });
        return newRoom;
      },

      // Undo / Redo
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIdx = historyIndex - 1;
          set({
            hexes: history[newIdx],
            historyIndex: newIdx,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIdx = historyIndex + 1;
          set({
            hexes: history[newIdx],
            historyIndex: newIdx,
          });
        }
      },

      // 掷骰聚合核心函数
      rollDice: (expression, label, roller = 'GM') => {
        // 解析表达式如 "1d20", "2d12", "d6+d12", "3d6+2"
        let rolls: number[] = [];
        let modifier = 0;
        let total = 0;
        let detailStr = '';

        if (expression === 'd6+d12') {
          const d6 = Math.floor(Math.random() * 6) + 1;
          const d12 = Math.floor(Math.random() * 12) + 1;
          rolls = [d6, d12];
          total = d6 + d12;
          detailStr = `d6 (${d6}) + d12 (${d12}) = ${total}`;
        } else {
          // 通用 xdy+z 解析
          const regex = /^(\d*)d(\d+)(?:([+-])(\d+))?$/i;
          const match = expression.match(regex);

          if (match) {
            const count = parseInt(match[1] || '1', 10);
            const sides = parseInt(match[2], 10);
            const sign = match[3] || '+';
            const modVal = match[4] ? parseInt(match[4], 10) : 0;
            modifier = sign === '-' ? -modVal : modVal;

            for (let i = 0; i < count; i++) {
              rolls.push(Math.floor(Math.random() * sides) + 1);
            }
            const sumRolls = rolls.reduce((a, b) => a + b, 0);
            total = sumRolls + modifier;
            detailStr = `掷 ${count}d${sides}: [${rolls.join(', ')}]${modifier !== 0 ? ` ${sign} ${modVal}` : ''} = ${total}`;
          } else {
            // 默认 d20
            const val = Math.floor(Math.random() * 20) + 1;
            rolls = [val];
            total = val;
            detailStr = `1d20: ${val}`;
          }
        }

        const newResult: DiceRollResult = {
          id: `roll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          roller,
          label,
          expression,
          rolls,
          modifier,
          total,
          detail: detailStr,
          isCritical: (expression.includes('20') && rolls[0] === 20) || (expression.includes('20') && rolls[0] === 1),
        };

        set({
          diceLogs: [newResult, ...get().diceLogs.slice(0, 49)], // 保留最近50条记录
        });

        return newResult;
      },

      clearDiceLogs: () => set({ diceLogs: [] }),
    }),
    {
      name: 'mb-hex-map-storage',
      partialize: (state) => ({
        width: state.width,
        height: state.height,
        hexSize: state.hexSize,
        hexes: state.hexes,
        tokens: state.tokens,
        savedMaps: state.savedMaps,
        sightDistance: state.sightDistance,
        revealMode: state.revealMode,
        diceLogs: state.diceLogs,
      }),
    }
  )
);
