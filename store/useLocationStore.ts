import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedLocation {
  id: string;
  label: string;
  lat: number;
  lon: number;
  isDefault: boolean;
}

interface LocationState {
  locations: SavedLocation[];
  addLocation: (loc: SavedLocation) => void;
  setDefaultLocation: (id: string) => void;
  hasDefaultLocation: () => boolean;
  reset: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      locations: [],
      addLocation: (loc) => set((state) => ({ 
        locations: [...state.locations.map(l => loc.isDefault ? { ...l, isDefault: false } : l), loc] 
      })),
      setDefaultLocation: (id) => set((state) => ({
        locations: state.locations.map(l => ({ ...l, isDefault: l.id === id }))
      })),
      hasDefaultLocation: () => get().locations.some(l => l.isDefault),
      reset: () => set({ locations: [] }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
