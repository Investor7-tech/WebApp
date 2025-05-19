import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  language: string;
  timezone: string;
  currency: string;
  toggleDarkMode: () => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setCurrency: (currency: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      language: 'en',
      timezone: 'Africa/Accra',
      currency: 'GHS',
      toggleDarkMode: () => {
        set((state) => {
          const isDarkMode = !state.isDarkMode;
          // Apply dark mode to the document
          if (isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode };
        });
      },
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'theme-storage',
    }
  )
);