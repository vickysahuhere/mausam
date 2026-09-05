import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-public-anon-key')
  );
};

// Safe client initializer that uses real Supabase when keys exist,
// or a fallback local storage client for local development / testing without cloud credentials.
const createMausamSupabaseClient = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  // Graceful fallback client for offline/local development
  // Ensures zero crashes when EXPO_PUBLIC_* env vars are not set
  return createClient(
    'https://placeholder-mausam-project.supabase.co',
    'placeholder-anon-key',
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
};

export const supabase = createMausamSupabaseClient();
