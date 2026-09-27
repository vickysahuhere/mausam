import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANIMATION_STORAGE_KEY = '@mausam_animations_enabled';

interface AnimationState {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  loadPreferences: () => Promise<void>;
}

export const useAnimationStore = create<AnimationState>((set, get) => ({
  animationsEnabled: true,

  toggleAnimations: () => {
    const nextState = !get().animationsEnabled;
    set({ animationsEnabled: nextState });
    AsyncStorage.setItem(ANIMATION_STORAGE_KEY, JSON.stringify(nextState)).catch(() => {});
  },

  setAnimationsEnabled: (enabled: boolean) => {
    set({ animationsEnabled: enabled });
    AsyncStorage.setItem(ANIMATION_STORAGE_KEY, JSON.stringify(enabled)).catch(() => {});
  },

  loadPreferences: async () => {
    try {
      const stored = await AsyncStorage.getItem(ANIMATION_STORAGE_KEY);
      if (stored !== null) {
        set({ animationsEnabled: JSON.parse(stored) });
      }
    } catch {
      // Default to true
    }
  },
}));

// Auto-load preference on module initialization
useAnimationStore.getState().loadPreferences();
