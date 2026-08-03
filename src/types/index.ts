// ============================================================
// Core Virtue / Stat Types
// ============================================================

export interface VirtueValue {
  current: number;
  max: number;
}

export interface GDValue {
  current: number;
  max: number;
}

// ============================================================
// Equipment Types
// ============================================================

export interface WeaponItem {
  type: 'weapon';
  id?: string;
  name: string;
  dice: string;
  tags: string[];
  note?: string;
  impaired?: boolean; // Gambit: weapon impaired
  custom?: boolean;
}

export interface ArmourItem {
  type: 'armour';
  id?: string;
  name: string;
  armourType: 'shield' | 'coat' | 'helm' | 'plates' | 'mail' | 'gambeson' | string;
  score: number;
  dice?: string; // shield die
  note?: string;
  trapped?: boolean; // Gambit: shield trapped
  custom?: boolean;
}

export interface InventoryItem {
  type: 'item';
  id?: string;
  name: string;
  custom?: boolean;
}

export interface CarriedItem {
  type: 'carried';
  id?: string;
  name: string;
  dice?: string;
  tags?: string[];
  note?: string;
  custom?: boolean;
}

// ============================================================
// GM — Temporary NPC / Squire (persisted in useGMStore)
// ============================================================

export interface TemporaryNPC {
  id: string;
  name: string;
  type: string;
  vig: number;
  cla: number;
  spi: number;
  gd: number;
  gear: string;
}

// ============================================================
// Mount & Squire
// ============================================================

export interface MountData {
  name: string;
  vig: VirtueValue;
  cla: VirtueValue;
  spi: VirtueValue;
  gd: GDValue;
  trample?: string; // e.g. 'd6'
  armour?: number;
  note?: string;
  type?: string;
}

export interface SquireData {
  name: string;
  vig: VirtueValue;
  cla: VirtueValue;
  spi: VirtueValue;
  gd: GDValue;
  weapons: WeaponItem[];
  armour: ArmourItem[];
  carried: CarriedItem[];
}

// ============================================================
// Character Conditions
// ============================================================

export interface CharConditions {
  doomScar: boolean;
  wounded: boolean;
  mortalWound: boolean;
  customConditions: string[];
}

// ============================================================
// Feats
// ============================================================

export type FeatState = 'available' | 'pending' | 'fatigued';

export interface CharFeats {
  smite: FeatState;
  focus: FeatState;
  deny: FeatState;
}

// ============================================================
// Remedies
// ============================================================

export interface CharRemedies {
  sustenance: number;  // Restores VIG
  stimulant: number;   // Restores CLA
  sacrament: number;   // Restores SPI
}

// ============================================================
// Contact
// ============================================================

export interface Contact {
  name: string;
  description: string;
  favor: string;
}

// ============================================================
// Season Log
// ============================================================

export interface SeasonLogEntry {
  season: 'Spring' | 'Harvest' | 'Winter';
  age: 'Young' | 'Mature' | 'Old';
  pursuit: string;
  notes: string;
}

// ============================================================
// Scar Record
// ============================================================

export interface ScarRecord {
  roll: number;
  die: string;
  name: string;
  description: string;
  effect: string;
  appliedEffects: string[];
  timestamp: string;
}

// ============================================================
// Journal
// ============================================================

export interface JournalEntry {
  timestamp: string;
  season: string;
  age: string;
  text: string;
  auto: boolean;
  restoreData?: {
    type: string;
    data: unknown;
  };
  restored?: boolean;
}

// ============================================================
// Ability & Passion
// ============================================================

export interface AbilityData {
  name: string;
  description: string;
}

export interface PassionData {
  name: string;
  description: string;
}

// ============================================================
// Full Character Model
// ============================================================

export interface Character {
  version: number;
  id: string;
  name: string;
  knightType: string; // id from KNIGHT_DB or 'custom'
  glory: number;
  age: 'Young' | 'Mature' | 'Old';
  season: 'Spring' | 'Harvest' | 'Winter';
  virtues: {
    vig: VirtueValue;
    cla: VirtueValue;
    spi: VirtueValue;
  };
  gd: GDValue;
  ability: AbilityData;
  passion: PassionData;
  weapons: WeaponItem[];
  armour: ArmourItem[];
  carried: CarriedItem[];
  inventory: InventoryItem[];
  remedies: CharRemedies;
  mount: MountData | null;
  squire: SquireData | null;
  scars: ScarRecord[];
  feats: CharFeats;
  conditions: CharConditions;
  contacts: Contact[];
  seasonLog: SeasonLogEntry[];
  journal: JournalEntry[];
}

// ============================================================
// Knight DB Types (for archetype data)
// ============================================================

export type KnightPropertyItem =
  | (WeaponItem & { type: 'weapon' })
  | (ArmourItem & { type: 'armour' })
  | { type: 'mount'; name: string; vig: number; cla: number; spi: number; gd: number; trample?: string; armour?: number; note?: string }
  | { type: 'item'; name: string };

export interface KnightSeer {
  name: string;
  description: string;
}

export interface KnightSpecificTableRow {
  roll: number;
  col1: string;
  col2: string;
}

export interface KnightSpecificTable {
  name: string;
  headers: [string, string];
  rows: KnightSpecificTableRow[];
}

export interface KnightArchetype {
  id: string;
  number: string; // e.g. '1-1'
  name: string;
  flavor: string;
  property: KnightPropertyItem[];
  ability: AbilityData;
  passion: PassionData;
  seer: KnightSeer;
  specificTable?: KnightSpecificTable;
}

// ============================================================
// Equipment DB Types
// ============================================================

export interface WeaponDBEntry {
  id: string;
  name: string;
  dice: string;
  tags: string[];
  rarity: 'common' | 'uncommon' | 'rare';
  notes?: string;
}

export interface ArmourDBEntry {
  id: string;
  name: string;
  type: 'shield' | 'coat' | 'helm' | 'plates';
  score: number;
  dice?: string;
  rarity: 'common' | 'uncommon' | 'rare';
}

export interface BeastDBEntry {
  id: string;
  name: string;
  vig: number;
  cla: number;
  spi: number;
  gd: number;
  attack?: string;
  trample?: string;
  rarity: 'common' | 'uncommon' | 'rare';
}

// ============================================================
// Scar Table
// ============================================================

export interface ScarTableEntry {
  roll: number;
  name: string;
  description: string;
  effect: string;
  gdThreshold?: number;
  isDoom?: boolean;
}

// ============================================================
// Rank
// ============================================================

export interface RankThreshold {
  glory: number;
  rank: string;
  worthy: string;
}

// ============================================================
// Feats (static definitions)
// ============================================================

export interface FeatDefinition {
  name: string;
  subtitle?: string;
  description: string;
  bullets?: string[];
  save: 'VIG' | 'CLA' | 'SPI' | '活力' | '敏锐' | '精神';
}

// ============================================================
// Gambit
// ============================================================

export interface Gambit {
  name: string;
  effect: string;
  strong: boolean;
}

// ============================================================
// GM / Spark Types (kept from original)
// ============================================================

export interface SparkTable {
  category: 'nature' | 'civilization' | 'people' | 'combat';
  subCategory: string;
  leftLabel: string;
  rightLabel: string;
  left: string[];
  right: string[];
}

export type SparkCategoryData = Record<string, Omit<SparkTable, 'category' | 'subCategory'>>;

export interface SparkDatabase {
  nature: SparkCategoryData;
  civilization: SparkCategoryData;
  people: SparkCategoryData;
  combat: SparkCategoryData;
}

// ============================================================
// Myth / GM Chronicle Types
// ============================================================

export interface MythCharacter {
  name: string;
  stats?: string;
  description: string;
}

export interface MythSpecificTableRow {
  roll: number;
  col1: string;
  col2: string;
}

export interface MythSpecificTable {
  name: string;
  headers: [string, string];
  rows: MythSpecificTableRow[];
}

export interface MythArchetype {
  id: string;
  number: string; // e.g. '1-1'
  name: string;   // e.g. '瘟疫 (The Plague)'
  quote: string;
  omens: string[]; // 6 omens
  characters?: MythCharacter[];
  specificTable?: MythSpecificTable;
  flavor?: string;
}

export interface ActiveMyth {
  instanceId: string;
  mythId: string;
  currentOmenIndex: number; // 0 to 5
  checkedOmens: boolean[];  // length 6
  notes: string;
  createdAt: string;
}
