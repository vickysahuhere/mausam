import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerBackgroundSync } from '../lib/syncService';
import { useAuthStore } from './useAuthStore';

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
  removeLocation: (id: string) => void;
  setDefaultLocation: (id: string) => void;
  hasDefaultLocation: () => boolean;
  getSelectedLocation: () => SavedLocation | undefined;
  reset: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      locations: [],
      addLocation: (loc) => {
        set((state) => {
          // Prevent duplicates by ID or by very close coordinates (< 0.005 deg)
          const isDuplicate = state.locations.some(
            (l) => l.id === loc.id || (Math.abs(l.lat - loc.lat) < 0.005 && Math.abs(l.lon - loc.lon) < 0.005)
          );
          if (isDuplicate) {
            // If already exists and marked as default, set it as default
            if (loc.isDefault) {
              return {
                locations: state.locations.map((l) => ({
                  ...l,
                  isDefault: l.id === loc.id || (Math.abs(l.lat - loc.lat) < 0.005 && Math.abs(l.lon - loc.lon) < 0.005),
                })),
              };
            }
            return state;
          }
          const makeDefault = loc.isDefault || state.locations.length === 0;
          return {
            locations: [
              ...state.locations.map((l) => (makeDefault ? { ...l, isDefault: false } : l)),
              { ...loc, isDefault: makeDefault },
            ],
          };
        });
        const userId = useAuthStore.getState().user?.id || null;
        triggerBackgroundSync(userId);
      },
      removeLocation: (id) => {
        set((state) => {
          const target = state.locations.find((l) => l.id === id);
          const remaining = state.locations.filter((l) => l.id !== id);
          // If we deleted the default location and have remaining locations, promote the first one to default
          if (target?.isDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { locations: remaining };
        });
        const userId = useAuthStore.getState().user?.id || null;
        triggerBackgroundSync(userId);
      },
      setDefaultLocation: (id) => {
        set((state) => ({
          locations: state.locations.map((l) => ({ ...l, isDefault: l.id === id })),
        }));
        const userId = useAuthStore.getState().user?.id || null;
        triggerBackgroundSync(userId);
      },
      hasDefaultLocation: () => get().locations.some((l) => l.isDefault),
      getSelectedLocation: () => get().locations.find((l) => l.isDefault) || get().locations[0],
      reset: () => set({ locations: [] }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
