import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateInitialLayout, getRecommendedTheme } from '../lib/personaEngine';
import { Persona } from '../lib/surveyQuestions';

export interface LayoutItem {
  id: string;
  type: string;
}

interface LayoutState {
  activeThemeId: string;
  layout: LayoutItem[];
  hasInitialized: boolean;

  initializeForUser: (vector: Record<Persona, number> | null) => void;
  reinitializeLayout: (vector: Record<Persona, number> | null) => void;
  setTheme: (themeId: string) => void;
  setLayout: (layout: LayoutItem[]) => void;
  addWidget: (type: string) => void;
  removeWidget: (id: string) => void;
  reset: () => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      activeThemeId: 'custom',
      layout: [],
      hasInitialized: false,

      initializeForUser: (vector) =>
        set((state) => {
          // If already initialized and contains full widgets, preserve user ownership
          if (state.hasInitialized && state.layout.length > 1) return state;

          return {
            hasInitialized: true,
            activeThemeId: state.hasInitialized && state.activeThemeId !== 'custom'
              ? state.activeThemeId
              : getRecommendedTheme(vector),
            layout: generateInitialLayout(vector),
          };
        }),

      reinitializeLayout: (vector) =>
        set({
          hasInitialized: true,
          activeThemeId: getRecommendedTheme(vector),
          layout: generateInitialLayout(vector),
        }),

      setTheme: (themeId) => set({ activeThemeId: themeId }),
      setLayout: (layout) => set({ layout }),

      addWidget: (type) =>
        set((state) => ({
          layout: [...state.layout, { id: `widget-${type}-${Date.now()}`, type }],
        })),

      removeWidget: (id) =>
        set((state) => ({
          layout: state.layout.filter((w) => w.id !== id),
        })),

      reset: () =>
        set({
          hasInitialized: false,
          activeThemeId: 'custom',
          layout: [],
        }),
    }),
    {
      name: 'layout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
