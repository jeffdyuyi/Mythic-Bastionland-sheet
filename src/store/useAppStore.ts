import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'player' | 'gm' | null;

interface AppState {
    userRole: UserRole;
    setRole: (role: UserRole) => void;
    clearRole: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            userRole: null,
            setRole: (role) => set({ userRole: role }),
            clearRole: () => set({ userRole: null }),
        }),
        {
            name: 'mb-companion-storage',
        }
    )
)
