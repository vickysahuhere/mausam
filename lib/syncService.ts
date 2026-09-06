import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import type { SavedLocation } from '../store/useLocationStore';
import type { LayoutItem } from '../store/useLayoutStore';
import type { Persona } from './surveyQuestions';

// Lazy store accessors to eliminate circular require cycles
const getLocationStore = () => require('../store/useLocationStore').useLocationStore;
const getLayoutStore = () => require('../store/useLayoutStore').useLayoutStore;
const getAuthStore = () => require('../store/useAuthStore').useAuthStore;

export interface CloudSyncState {
  status: 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

// In-memory sync status tracker
let currentSyncState: CloudSyncState = {
  status: 'idle',
  lastSyncedAt: null,
  errorMessage: null,
};

const listeners: Array<(state: CloudSyncState) => void> = [];

export const getSyncState = (): CloudSyncState => currentSyncState;

export const subscribeSyncState = (fn: (state: CloudSyncState) => void): (() => void) => {
  listeners.push(fn);
  fn(currentSyncState);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifySyncState = (partial: Partial<CloudSyncState>) => {
  currentSyncState = { ...currentSyncState, ...partial };
  listeners.forEach((fn) => fn(currentSyncState));
};

// ---------------------------------------------------------------------------
// MOCK CLOUD STORAGE HELPERS (Active when Supabase credentials are not set)
// ---------------------------------------------------------------------------
const MOCK_PROFILE_PREFIX = '@mausam_cloud_profile_';
const MOCK_LOCATIONS_PREFIX = '@mausam_cloud_locations_';
const MOCK_LAYOUT_PREFIX = '@mausam_cloud_layout_';

async function getMockCloudData(userId: string) {
  const profileRaw = await AsyncStorage.getItem(`${MOCK_PROFILE_PREFIX}${userId}`);
  const locationsRaw = await AsyncStorage.getItem(`${MOCK_LOCATIONS_PREFIX}${userId}`);
  const layoutRaw = await AsyncStorage.getItem(`${MOCK_LAYOUT_PREFIX}${userId}`);
  return {
    profile: profileRaw ? JSON.parse(profileRaw) : null,
    locations: locationsRaw ? JSON.parse(locationsRaw) : null,
    layout: layoutRaw ? JSON.parse(layoutRaw) : null,
  };
}

async function saveMockCloudData(
  userId: string,
  data: { profile?: any; locations?: SavedLocation[]; layout?: { layout: LayoutItem[]; activeThemeId: string } }
) {
  if (data.profile !== undefined) {
    await AsyncStorage.setItem(`${MOCK_PROFILE_PREFIX}${userId}`, JSON.stringify(data.profile));
  }
  if (data.locations !== undefined) {
    await AsyncStorage.setItem(`${MOCK_LOCATIONS_PREFIX}${userId}`, JSON.stringify(data.locations));
  }
  if (data.layout !== undefined) {
    await AsyncStorage.setItem(`${MOCK_LAYOUT_PREFIX}${userId}`, JSON.stringify(data.layout));
  }
}

// ---------------------------------------------------------------------------
// GUEST TO ACCOUNT MIGRATION
// Uploads local Zustand state into user's cloud account on login/register
// ---------------------------------------------------------------------------
export async function migrateGuestToAccount(userId: string): Promise<boolean> {
  notifySyncState({ status: 'syncing', errorMessage: null });
  try {
    const localLocations = getLocationStore().getState().locations;
    const localLayout = getLayoutStore().getState().layout;
    const localTheme = getLayoutStore().getState().activeThemeId;
    const localVector = getAuthStore().getState().personaVector;

    if (!isSupabaseConfigured()) {
      // Mock cloud persistence
      await saveMockCloudData(userId, {
        profile: {
          user_id: userId,
          persona_vector: localVector,
          active_theme_id: localTheme,
          survey_completed: true,
          updated_at: new Date().toISOString(),
        },
        locations: localLocations,
        layout: {
          layout: localLayout,
          activeThemeId: localTheme,
        },
      });
      notifySyncState({ status: 'synced', lastSyncedAt: new Date().toISOString() });
      return true;
    }

    const userFullName = getAuthStore().getState().user?.fullName;

    // 1. Migrate user_profiles
    const { error: profileErr } = await supabase.from('user_profiles').upsert({
      user_id: userId,
      full_name: userFullName,
      persona_vector: localVector,
      active_theme_id: localTheme,
      survey_completed: true,
      updated_at: new Date().toISOString(),
    });
    if (profileErr) console.warn('Supabase profile migration error:', profileErr.message);

    // 2. Migrate user_layouts
    const { error: layoutErr } = await supabase.from('user_layouts').upsert({
      user_id: userId,
      layout: localLayout,
      active_theme_id: localTheme,
      updated_at: new Date().toISOString(),
    });
    if (layoutErr) console.warn('Supabase layout migration error:', layoutErr.message);

    // 3. Migrate user_locations
    if (localLocations.length > 0) {
      for (const loc of localLocations) {
        await supabase.from('user_locations').upsert(
          {
            user_id: userId,
            label: loc.label,
            lat: loc.lat,
            lon: loc.lon,
            is_default: loc.isDefault,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lat,lon' }
        );
      }
    }

    notifySyncState({ status: 'synced', lastSyncedAt: new Date().toISOString() });
    return true;
  } catch (err: any) {
    console.error('Guest migration error:', err);
    notifySyncState({ status: 'error', errorMessage: err?.message || 'Sync failed' });
    return false;
  }
}

// ---------------------------------------------------------------------------
// SYNC FROM CLOUD
// Hydrates local Zustand stores with cloud records when logging into an existing account
// ---------------------------------------------------------------------------
export async function syncFromCloud(userId: string): Promise<boolean> {
  notifySyncState({ status: 'syncing', errorMessage: null });
  try {
    if (!isSupabaseConfigured()) {
      const mockData = await getMockCloudData(userId);
      if (mockData.profile || mockData.locations || mockData.layout) {
        if (mockData.locations && mockData.locations.length > 0) {
          getLocationStore().setState({ locations: mockData.locations });
        }
        if (mockData.layout) {
          getLayoutStore().setState({
            layout: mockData.layout.layout || [],
            activeThemeId: mockData.layout.activeThemeId || 'custom',
            hasInitialized: true,
          });
        }
        if (mockData.profile?.persona_vector) {
          getAuthStore().setState({
            personaVector: mockData.profile.persona_vector,
            surveyCompleted: true,
          });
        }
        notifySyncState({ status: 'synced', lastSyncedAt: new Date().toISOString() });
        return true;
      }
      // If cloud is empty for this user, push local state up
      return await migrateGuestToAccount(userId);
    }

    // 1. Fetch user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 2. Fetch user_layouts
    const { data: layoutData } = await supabase
      .from('user_layouts')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 3. Fetch user_locations
    const { data: locationsData } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId);

    const hasCloudRecords = profile || layoutData || (locationsData && locationsData.length > 0);

    if (hasCloudRecords) {
      if (locationsData && locationsData.length > 0) {
        const mappedLocations: SavedLocation[] = locationsData.map((l: any) => ({
          id: l.id,
          label: l.label,
          lat: l.lat,
          lon: l.lon,
          isDefault: !!l.is_default,
        }));
        getLocationStore().setState({ locations: mappedLocations });
      }

      if (layoutData) {
        getLayoutStore().setState({
          layout: layoutData.layout || [],
          activeThemeId: layoutData.active_theme_id || 'custom',
          hasInitialized: true,
        });
      }

      if (profile?.persona_vector) {
        getAuthStore().setState({
          personaVector: profile.persona_vector,
          surveyCompleted: true,
        });
      }

      notifySyncState({ status: 'synced', lastSyncedAt: new Date().toISOString() });
      return true;
    }

    // New user with no cloud records yet: upload current local state
    return await migrateGuestToAccount(userId);
  } catch (err: any) {
    console.error('syncFromCloud error:', err);
    notifySyncState({ status: 'offline', errorMessage: 'Network offline / using cached state' });
    return false;
  }
}

// ---------------------------------------------------------------------------
// BACKGROUND MUTATION SYNC (Debounced non-blocking updates)
// ---------------------------------------------------------------------------
let syncDebounceTimer: any = null;

export function triggerBackgroundSync(userId: string | null) {
  if (!userId) return; // Guest mode does not sync to cloud

  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      const locations = getLocationStore().getState().locations;
      const layout = getLayoutStore().getState().layout;
      const themeId = getLayoutStore().getState().activeThemeId;
      const vector = getAuthStore().getState().personaVector;

      if (!isSupabaseConfigured()) {
        await saveMockCloudData(userId, {
          profile: {
            user_id: userId,
            persona_vector: vector,
            active_theme_id: themeId,
            updated_at: new Date().toISOString(),
          },
          locations,
          layout: { layout, activeThemeId: themeId },
        });
        notifySyncState({ status: 'synced', lastSyncedAt: new Date().toISOString() });
        return;
      }

      // Sync locations, layout, and profile
      await Promise.all([
        supabase.from('user_layouts').upsert({
          user_id: userId,
          layout,
          active_theme_id: themeId,
          updated_at: new Date().toISOString(),
        }),
        supabase.from('user_profiles').upsert({
          user_id: userId,
          persona_vector: vector,
          active_theme_id: themeId,
          updated_at: new Date().toISOString(),
        }),
      ]);

      notifySyncState({ status: 'synced', lastSyncedAt: new Date().toISOString() });
    } catch (e: any) {
      console.warn('Background sync deferred:', e.message);
      notifySyncState({ status: 'offline' });
    }
  }, 1000);
}
