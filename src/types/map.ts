export type TerrainType = 
  | 'plains'         // 平原 (Plains)
  | 'forest'         // 森林 (Forest)
  | 'mountain'       // 山脉 (Mountain)
  | 'water'          // 水域 (Water)
  | 'swamp'          // 沼泽 (Swamp)
  | 'desert'         // 荒漠 (Desert)
  | 'hills'          // 丘陵 (Hills)
  | 'shallow_water'  // 浅滩 (Shallow Water)
  | 'deep_water'     // 深海 (Deep Water)
  | 'wasteland';     // 废土/荒地 (Wasteland)

export type StructureType = 
  | 'none'
  | 'village'   // 村庄
  | 'hamlet'    // 聚落
  | 'town'      // 城镇
  | 'city'      // 城市
  | 'castle'    // 堡垒/城堡
  | 'ruins'     // 古迹/废墟
  | 'myth_site' // 神话圣所
  | 'tower'     // 哨塔
  | 'camp';     // 营地

export interface HexCell {
  col: number;
  row: number;
  terrain: TerrainType;
  structure: StructureType;
  label?: string;
  notes?: string;
  explored: boolean; // 是否解开迷雾
  linkedMythInstanceId?: string; // 关联的活跃神话 ID
  linkedOmenIndex?: number;      // 关联的预兆序号 (0-5)
}

export interface MapToken {
  id: string;
  name: string;
  col: number;
  row: number;
  color: string;
  symbol?: string; // 图标/字母
  isPlayer?: boolean;
}

export type MapTool = 'brush' | 'fill' | 'token' | 'erase' | 'inspect' | 'fog_toggle';

export interface DiceRollResult {
  id: string;
  timestamp: string;
  roller: string; // 谁掷的 (GM / 骑士名)
  label: string;  // 掷骰名称 (如 "敏锐美德判定", "剑击伤害", "六边形探索")
  expression: string; // "1d20", "2d12", "d6+d12"
  rolls: number[];
  modifier?: number;
  total: number;
  detail?: string; // 额外解说
  isCritical?: boolean;
}

export interface SavedMap {
  id: string;
  name: string;
  updatedAt: string;
  width: number;
  height: number;
  hexes: Record<string, HexCell>;
  tokens: MapToken[];
}

export interface MapRoom {
  id: string;          // 房间代码，例如 "ROOM-8891"
  name: string;        // 房间名字，例如 "磨坊镇与堡垒探险团"
  hostName: string;    // 裁判名，例如 "GM 埃尔德"
  mapName: string;     // 使用的地图名，例如 "骑士领地与城堡"
  mapId?: string;      // 关联的 savedMap id
  currentPlayers: number;
  maxPlayers: number;
  status: 'open' | 'in_progress';
  description: string;
  updatedAt: string;
}

