import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveMyth, TemporaryNPC } from '../types';
import type { HexCell, MapToken } from '../types/map';

interface GMStoreState {
  activeMyths: Record<string, ActiveMyth>; // key: instanceId
  activeMythIds: string[];
  npcs: TemporaryNPC[];

  // Map state (persisted)
  hexes: Record<string, HexCell>; // key: "col_row"
  tokens: MapToken[];

  // Actions
  activateMyth: (mythId: string) => string; // returns instanceId
  removeActiveMyth: (instanceId: string) => void;
  toggleOmen: (instanceId: string, omenIndex: number) => void;
  updateMythNotes: (instanceId: string, notes: string) => void;
  addNpc: (npc: TemporaryNPC) => void;
  removeNpc: (id: string) => void;
  // Combat round tracker
  combatRound: number;
  adjustCombatRound: (delta: number) => void;
  resetCombatRound: () => void;

  // Map actions
  updateHexCell: (key: string, mutator: (cell: HexCell) => void, defaultCol?: number, defaultRow?: number) => void;
  setMapTokens: (tokens: MapToken[]) => void;
  clearMapHexes: () => void;
}

export const useGMStore = create<GMStoreState>()(
  persist(
    (set) => ({
      activeMyths: {},
      activeMythIds: [],

      activateMyth: (mythId: string) => {
        const instanceId = 'myth_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        const newActive: ActiveMyth = {
          instanceId,
          mythId,
          currentOmenIndex: 0,
          checkedOmens: [false, false, false, false, false, false],
          notes: '',
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          activeMyths: { ...state.activeMyths, [instanceId]: newActive },
          activeMythIds: [instanceId, ...state.activeMythIds],
        }));

        return instanceId;
      },

      removeActiveMyth: (instanceId: string) => {
        set(state => {
          const updated = { ...state.activeMyths };
          delete updated[instanceId];
          return {
            activeMyths: updated,
            activeMythIds: state.activeMythIds.filter(id => id !== instanceId),
          };
        });
      },

      toggleOmen: (instanceId: string, omenIndex: number) => {
        set(state => {
          const current = state.activeMyths[instanceId];
          if (!current) return state;

          const updatedChecked = [...current.checkedOmens];
          updatedChecked[omenIndex] = !updatedChecked[omenIndex];

          // Calculate current omen index as highest checked + 1
          const highestChecked = updatedChecked.lastIndexOf(true);
          const nextOmenIndex = highestChecked >= 0 ? Math.min(5, highestChecked + 1) : 0;

          return {
            activeMyths: {
              ...state.activeMyths,
              [instanceId]: {
                ...current,
                checkedOmens: updatedChecked,
                currentOmenIndex: nextOmenIndex,
              },
            },
          };
        });
      },

      updateMythNotes: (instanceId: string, notes: string) => {
        set(state => {
          const current = state.activeMyths[instanceId];
          if (!current) return state;

          return {
            activeMyths: {
              ...state.activeMyths,
              [instanceId]: {
                ...current,
                notes,
              },
            },
          };
        });
      },

      npcs: [],

      addNpc: (npc) => set(state => ({ npcs: [npc, ...state.npcs] })),

      removeNpc: (id) => set(state => ({ npcs: state.npcs.filter(n => n.id !== id) })),

      clearNpcs: () => set({ npcs: [] }),

      combatRound: 1,
      adjustCombatRound: (delta) => set(state => ({ combatRound: Math.max(1, state.combatRound + delta) })),
      resetCombatRound: () => set({ combatRound: 1 }),

      // ---- Map actions ----
      hexes: {},
      tokens: [],

      updateHexCell: (key, mutator, defaultCol = 0, defaultRow = 0) => {
        set(state => {
          const current = state.hexes[key] || {
            col: defaultCol,
            row: defaultRow,
            terrain: 'plains',
            structure: 'none',
            explored: false,
          };
          const updated = { ...current };
          mutator(updated);
          return {
            hexes: {
              ...state.hexes,
              [key]: updated,
            },
          };
        });
      },

      setMapTokens: (tokens) => set({ tokens }),

      clearMapHexes: () => set({ hexes: {}, tokens: [] }),
    }),
    {
      name: 'mythicBastionland-gm',
    }
  )
);
