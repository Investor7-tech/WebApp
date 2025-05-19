import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'GHS',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'settings-storage',
    }
  )
);