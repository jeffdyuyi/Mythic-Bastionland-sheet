import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, WeaponItem, ArmourItem, InventoryItem, MountData } from '../types';
import { generateId } from '../data/gameTables';
import { getKnightById } from '../data/knights';

// ============================================================
// Character Factory
// ============================================================

export function createDefaultCharacter(knightId: string, name: string): Character {
  const knight = getKnightById(knightId);
  const id = generateId();

  const char: Character = {
    version: 1,
    id,
    name: name || 'New Knight',
    knightType: knightId,
    glory: 0,
    age: 'Young',
    season: 'Spring',
    virtues: {
      vig: { current: 10, max: 10 },
      cla: { current: 10, max: 10 },
      spi: { current: 10, max: 10 },
    },
    gd: { current: 1, max: 1 },
    ability: knight ? { ...knight.ability } : { name: '', description: '' },
    passion: knight ? { ...knight.passion } : { name: '', description: '' },
    weapons: [],
    armour: [],
    carried: [],
    inventory: [],
    remedies: { sustenance: 0, stimulant: 0, sacrament: 0 },
    mount: null,
    squire: null,
    scars: [],
    feats: { smite: 'available', focus: 'available', deny: 'available' },
    conditions: { doomScar: false, wounded: false, mortalWound: false, customConditions: [] },
    contacts: [],
    seasonLog: [],
    journal: [],
  };

  // Populate equipment from knight archetype
  if (knight) {
    knight.property.forEach(p => {
      if (p.type === 'weapon') {
        const w: WeaponItem = {
          type: 'weapon',
          id: generateId(),
          name: p.name,
          dice: (p as WeaponItem).dice,
          tags: (p as WeaponItem).tags || [],
          note: (p as WeaponItem).note,
        };
        char.weapons.push(w);
      } else if (p.type === 'armour') {
        const a: ArmourItem = {
          type: 'armour',
          id: generateId(),
          name: p.name,
          armourType: (p as ArmourItem).armourType,
          score: (p as ArmourItem).score,
          dice: (p as ArmourItem).dice,
          note: (p as ArmourItem).note,
        };
        char.armour.push(a);
      } else if (p.type === 'mount') {
        const mp = p as { type: 'mount'; name: string; vig: number; cla: number; spi: number; gd: number; trample?: string; armour?: number; note?: string };
        const mount: MountData = {
          name: mp.name,
          vig: { current: mp.vig, max: mp.vig },
          cla: { current: mp.cla, max: mp.cla },
          spi: { current: mp.spi, max: mp.spi },
          gd: { current: mp.gd, max: mp.gd },
          trample: mp.trample,
          armour: mp.armour,
          note: mp.note,
        };
        char.mount = mount;
      } else if (p.type === 'item') {
        const item: InventoryItem = {
          type: 'item',
          id: generateId(),
          name: p.name,
        };
        char.inventory.push(item);
      }
    });
  }

  // Ensure Base Gear from Rulebook Section 1.2 is added
  if (!char.weapons.some(w => w.name.includes('匕首'))) {
    char.weapons.push({ type: 'weapon', id: generateId(), name: '匕首', dice: 'd6', tags: [] });
  }
  const baseItems = ['火把', '绳索', '干粮', '露营用具'];
  baseItems.forEach(itemName => {
    if (!char.inventory.some(i => i.name === itemName)) {
      char.inventory.push({ type: 'item', id: generateId(), name: itemName });
    }
  });

  return char;
}

// ============================================================
// Store State
// ============================================================

interface CharacterStore {
  // Data
  characterIds: string[];
  characters: Record<string, Character>;
  currentCharacterId: string | null;

  // Derived
  currentCharacter: Character | null;

  // Character lifecycle
  createCharacter: (
    knightId: string,
    name: string,
    virtues?: { vig: number; cla: number; spi: number; gd: number },
    squireData?: Character['squire']
  ) => string;
  deleteCharacter: (id: string) => void;
  switchCharacter: (id: string) => void;
  importCharacter: (data: Character | Character[]) => string | null;
  exportCharacter: (id?: string) => Character | null;

  // Character mutation
  updateCharacter: (id: string, mutator: (c: Character) => void) => void;
  updateCurrentCharacter: (mutator: (c: Character) => void) => void;

  // Virtue management (current character)
  adjustVirtue: (virtue: 'vig' | 'cla' | 'spi', delta: number) => void;
  adjustVirtueMax: (virtue: 'vig' | 'cla' | 'spi', delta: number) => void;
  restoreVirtue: (virtue: 'vig' | 'cla' | 'spi') => void;
  adjustGD: (delta: number) => void;
  adjustGDMax: (delta: number) => void;
  restoreGD: () => void;

  // Virtue management (specific character by id — for GM dashboard)
  adjustVirtueForChar: (charId: string, virtue: 'vig' | 'cla' | 'spi', delta: number) => void;
  adjustGDForChar: (charId: string, delta: number) => void;

  // Glory & metadata
  adjustGlory: (delta: number) => void;
  setAge: (age: 'Young' | 'Mature' | 'Old') => void;
  setSeason: (season: 'Spring' | 'Harvest' | 'Winter') => void;
  setName: (name: string) => void;

  // Feats
  setFeatState: (feat: 'smite' | 'focus' | 'deny', state: 'available' | 'pending' | 'fatigued') => void;
  restoreFeats: () => void;

  // Conditions
  setCondition: (condition: 'doomScar' | 'wounded' | 'mortalWound', value: boolean) => void;
  addCustomCondition: (condition: string) => void;
  removeCustomCondition: (condition: string) => void;

  // Remedies
  adjustRemedy: (remedy: 'sustenance' | 'stimulant' | 'sacrament', delta: number) => void;
  consumeRemedy: (remedy: 'sustenance' | 'stimulant' | 'sacrament') => void;

  // Journal
  addJournalEntry: (text: string, auto?: boolean) => void;

  // Scars
  addScar: (scar: Character['scars'][0]) => void;

  // Equipment CRUD & Gambit states
  addWeapon: (weapon: Omit<WeaponItem, 'id'>) => void;
  removeWeapon: (id: string) => void;
  toggleWeaponImpaired: (id: string) => void;
  addArmour: (armour: Omit<ArmourItem, 'id'>) => void;
  removeArmour: (id: string) => void;
  toggleArmourTrapped: (id: string) => void;
  addInventory: (item: Omit<InventoryItem, 'id'>) => void;
  removeInventory: (id: string) => void;

  // Mount management
  adjustMountVirtue: (virtue: 'vig' | 'cla' | 'spi', delta: number) => void;
  adjustMountGD: (delta: number) => void;
  restoreMount: () => void;
}

// ============================================================
// Store Implementation
// ============================================================

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characterIds: [],
      characters: {},
      currentCharacterId: null,
      currentCharacter: null,

      createCharacter: (knightId, name, virtues, squireData) => {
        const char = createDefaultCharacter(knightId, name);
        if (virtues) {
          char.virtues.vig = { current: virtues.vig, max: virtues.vig };
          char.virtues.cla = { current: virtues.cla, max: virtues.cla };
          char.virtues.spi = { current: virtues.spi, max: virtues.spi };
          char.gd = { current: virtues.gd, max: virtues.gd };
        }
        if (squireData) {
          char.squire = squireData;
        }
        set(state => ({
          characterIds: [...state.characterIds, char.id],
          characters: { ...state.characters, [char.id]: char },
          currentCharacterId: char.id,
          currentCharacter: char,
        }));
        return char.id;
      },

      deleteCharacter: (id) => {
        set(state => {
          const newIds = state.characterIds.filter(cid => cid !== id);
          const newChars = { ...state.characters };
          delete newChars[id];
          const newCurrentId = state.currentCharacterId === id
            ? (newIds[0] ?? null)
            : state.currentCharacterId;
          return {
            characterIds: newIds,
            characters: newChars,
            currentCharacterId: newCurrentId,
            currentCharacter: newCurrentId ? newChars[newCurrentId] ?? null : null,
          };
        });
      },

      switchCharacter: (id) => {
        set(state => ({
          currentCharacterId: id,
          currentCharacter: state.characters[id] ?? null,
        }));
      },

      importCharacter: (data) => {
        const chars: Character[] = Array.isArray(data) ? data : [data];
        let lastId: string | null = null;
        set(state => {
          const newIds = [...state.characterIds];
          const newChars = { ...state.characters };
          chars.forEach(char => {
            if (!char.name || !char.virtues || !char.gd) return;
            const newChar = { ...char, id: generateId() };
            newIds.push(newChar.id);
            newChars[newChar.id] = newChar;
            lastId = newChar.id;
          });
          return {
            characterIds: newIds,
            characters: newChars,
            currentCharacterId: lastId ?? state.currentCharacterId,
            currentCharacter: lastId ? newChars[lastId] : state.currentCharacter,
          };
        });
        return lastId;
      },

      exportCharacter: (id) => {
        const state = get();
        const charId = id ?? state.currentCharacterId;
        return charId ? state.characters[charId] ?? null : null;
      },

      updateCharacter: (id, mutator) => {
        set(state => {
          const char = state.characters[id];
          if (!char) return state;
          const updated = { ...char };
          mutator(updated);
          const newChars = { ...state.characters, [id]: updated };
          return {
            characters: newChars,
            currentCharacter: state.currentCharacterId === id ? updated : state.currentCharacter,
          };
        });
      },

      updateCurrentCharacter: (mutator) => {
        const state = get();
        if (!state.currentCharacterId) return;
        get().updateCharacter(state.currentCharacterId, mutator);
      },

      // ---- Virtue helpers ----
      adjustVirtue: (virtue, delta) => {
        get().updateCurrentCharacter(c => {
          const v = c.virtues[virtue];
          v.current = Math.max(0, Math.min(v.max, v.current + delta));
        });
      },

      adjustVirtueForChar: (charId, virtue, delta) => {
        get().updateCharacter(charId, c => {
          const v = c.virtues[virtue];
          v.current = Math.max(0, Math.min(v.max, v.current + delta));
        });
      },

      adjustGDForChar: (charId, delta) => {
        get().updateCharacter(charId, c => {
          c.gd.current = Math.max(0, Math.min(c.gd.max, c.gd.current + delta));
        });
      },

      adjustVirtueMax: (virtue, delta) => {
        get().updateCurrentCharacter(c => {
          const v = c.virtues[virtue];
          v.max = Math.max(0, Math.min(19, v.max + delta));
          v.current = Math.min(v.current, v.max);
        });
      },

      restoreVirtue: (virtue) => {
        get().updateCurrentCharacter(c => {
          c.virtues[virtue].current = c.virtues[virtue].max;
        });
      },

      adjustGD: (delta) => {
        get().updateCurrentCharacter(c => {
          c.gd.current = Math.max(0, Math.min(c.gd.max, c.gd.current + delta));
        });
      },

      adjustGDMax: (delta) => {
        get().updateCurrentCharacter(c => {
          c.gd.max = Math.max(0, Math.min(19, c.gd.max + delta));
          c.gd.current = Math.min(c.gd.current, c.gd.max);
        });
      },

      restoreGD: () => {
        get().updateCurrentCharacter(c => {
          c.gd.current = c.gd.max;
        });
      },

      // ---- Glory & metadata ----
      adjustGlory: (delta) => {
        get().updateCurrentCharacter(c => {
          c.glory = Math.max(0, c.glory + delta);
        });
      },

      setAge: (age) => {
        get().updateCurrentCharacter(c => { c.age = age; });
      },

      setSeason: (season) => {
        get().updateCurrentCharacter(c => { c.season = season; });
      },

      setName: (name) => {
        get().updateCurrentCharacter(c => { c.name = name; });
      },

      // ---- Feats ----
      setFeatState: (feat, state) => {
        get().updateCurrentCharacter(c => { c.feats[feat] = state; });
      },

      restoreFeats: () => {
        get().updateCurrentCharacter(c => {
          c.feats.smite = 'available';
          c.feats.focus = 'available';
          c.feats.deny = 'available';
        });
      },

      // ---- Conditions ----
      setCondition: (condition, value) => {
        get().updateCurrentCharacter(c => { c.conditions[condition] = value; });
      },

      addCustomCondition: (condition) => {
        get().updateCurrentCharacter(c => {
          if (!c.conditions.customConditions.includes(condition)) {
            c.conditions.customConditions.push(condition);
          }
        });
      },

      removeCustomCondition: (condition) => {
        get().updateCurrentCharacter(c => {
          c.conditions.customConditions = c.conditions.customConditions.filter(x => x !== condition);
        });
      },

      // ---- Remedies ----
      adjustRemedy: (remedy, delta) => {
        get().updateCurrentCharacter(c => {
          c.remedies[remedy] = Math.max(0, c.remedies[remedy] + delta);
        });
      },

      consumeRemedy: (remedy) => {
        get().updateCurrentCharacter(c => {
          if (c.remedies[remedy] <= 0) return;
          c.remedies[remedy] -= 1;
          if (remedy === 'sustenance') c.virtues.vig.current = c.virtues.vig.max;
          if (remedy === 'stimulant')  c.virtues.cla.current = c.virtues.cla.max;
          if (remedy === 'sacrament')  c.virtues.spi.current = c.virtues.spi.max;
        });
      },

      // ---- Journal ----
      addJournalEntry: (text, auto = false) => {
        get().updateCurrentCharacter(c => {
          const state = get();
          const char = state.currentCharacter;
          c.journal.unshift({
            timestamp: new Date().toISOString(),
            season: char?.season ?? 'Spring',
            age: char?.age ?? 'Young',
            text,
            auto,
          });
        });
      },

      // ---- Scars ----
      addScar: (scar) => {
        get().updateCurrentCharacter(c => { c.scars.push(scar); });
      },

      // ---- Equipment CRUD ----
      addWeapon: (weapon) => {
        get().updateCurrentCharacter(c => {
          c.weapons.push({ ...weapon, id: generateId() });
        });
      },
      removeWeapon: (id) => {
        get().updateCurrentCharacter(c => {
          c.weapons = c.weapons.filter(w => w.id !== id);
        });
      },
      toggleWeaponImpaired: (id) => {
        get().updateCurrentCharacter(c => {
          const w = c.weapons.find(x => x.id === id);
          if (w) w.impaired = !w.impaired;
        });
      },
      addArmour: (armour) => {
        get().updateCurrentCharacter(c => {
          c.armour.push({ ...armour, id: generateId() });
        });
      },
      removeArmour: (id) => {
        get().updateCurrentCharacter(c => {
          c.armour = c.armour.filter(a => a.id !== id);
        });
      },
      toggleArmourTrapped: (id) => {
        get().updateCurrentCharacter(c => {
          const a = c.armour.find(x => x.id === id);
          if (a) a.trapped = !a.trapped;
        });
      },
      addInventory: (item) => {
        get().updateCurrentCharacter(c => {
          c.inventory.push({ ...item, id: generateId() });
        });
      },
      removeInventory: (id) => {
        get().updateCurrentCharacter(c => {
          c.inventory = c.inventory.filter(i => i.id !== id);
        });
      },

      // ---- Mount Management ----
      adjustMountVirtue: (virtue, delta) => {
        get().updateCurrentCharacter(c => {
          if (!c.mount) return;
          const v = c.mount[virtue];
          v.current = Math.max(0, Math.min(v.max, v.current + delta));
        });
      },
      adjustMountGD: (delta) => {
        get().updateCurrentCharacter(c => {
          if (!c.mount) return;
          c.mount.gd.current = Math.max(0, Math.min(c.mount.gd.max, c.mount.gd.current + delta));
        });
      },
      restoreMount: () => {
        get().updateCurrentCharacter(c => {
          if (!c.mount) return;
          c.mount.vig.current = c.mount.vig.max;
          c.mount.cla.current = c.mount.cla.max;
          c.mount.spi.current = c.mount.spi.max;
          c.mount.gd.current = c.mount.gd.max;
        });
      },
    }),
    {
      name: 'mythicBastionland-characters',
      version: 1,
      // Re-derive currentCharacter from id after rehydration
      onRehydrateStorage: () => (state) => {
        if (state && state.currentCharacterId && state.characters[state.currentCharacterId]) {
          state.currentCharacter = state.characters[state.currentCharacterId];
        }
      },
    }
  )
);
