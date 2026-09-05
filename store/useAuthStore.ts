import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Persona } from '../lib/surveyQuestions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { migrateGuestToAccount, syncFromCloud } from '../lib/syncService';

export interface AuthUser {
  id: string;
  email?: string;
}

interface AuthState {
  hasSession: boolean;
  isGuest: boolean;
  user: AuthUser | null;
  personaVector: Record<Persona, number> | null;
  surveyCompleted: boolean;

  setSession: (val: boolean, user?: AuthUser | null) => void;
  setGuest: (val: boolean) => void;
  setPersonaVector: (vector: Record<Persona, number>) => void;
  completeSurvey: () => void;

  signInWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasSession: false,
      isGuest: false,
      user: null,
      personaVector: null,
      surveyCompleted: false,

      setSession: (val, user = null) =>
        set({ hasSession: val, isGuest: !val, user: val ? user : null }),

      setGuest: (val) =>
        set({ isGuest: val, hasSession: false, user: null }),

      setPersonaVector: (vector) => set({ personaVector: vector }),

      completeSurvey: () => set({ surveyCompleted: true }),

      signInWithPassword: async (email, password) => {
        try {
          if (!isSupabaseConfigured()) {
            // Offline mock authentication fallback
            const mockUser: AuthUser = {
              id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email,
            };
            set({ hasSession: true, isGuest: false, user: mockUser });
            await syncFromCloud(mockUser.id);
            return { success: true };
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) return { success: false, error: error.message };

          if (data.user) {
            const authUser: AuthUser = { id: data.user.id, email: data.user.email };
            set({ hasSession: true, isGuest: false, user: authUser });
            await syncFromCloud(data.user.id);
            return { success: true };
          }
          return { success: false, error: 'Sign in failed' };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Authentication error' };
        }
      },

      signUpWithPassword: async (email, password) => {
        try {
          if (!isSupabaseConfigured()) {
            // Offline mock authentication fallback
            const mockUser: AuthUser = {
              id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email,
            };
            set({ hasSession: true, isGuest: false, user: mockUser });
            await migrateGuestToAccount(mockUser.id);
            return { success: true };
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) return { success: false, error: error.message };

          if (data.user) {
            const authUser: AuthUser = { id: data.user.id, email: data.user.email };
            set({ hasSession: true, isGuest: false, user: authUser });
            await migrateGuestToAccount(data.user.id);
            return { success: true };
          }
          return { success: false, error: 'Account created. Please check your email to verify.' };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Registration error' };
        }
      },

      signInWithOtp: async (email) => {
        try {
          if (!isSupabaseConfigured()) {
            return { success: true };
          }
          const { error } = await supabase.auth.signInWithOtp({ email });
          if (error) return { success: false, error: error.message };
          return { success: true };
        } catch (e: any) {
          return { success: false, error: e?.message || 'OTP request failed' };
        }
      },

      verifyOtp: async (email, token) => {
        try {
          if (!isSupabaseConfigured()) {
            const mockUser: AuthUser = {
              id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email,
            };
            set({ hasSession: true, isGuest: false, user: mockUser });
            await syncFromCloud(mockUser.id);
            return { success: true };
          }

          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink',
          });

          if (error) return { success: false, error: error.message };

          if (data.user) {
            const authUser: AuthUser = { id: data.user.id, email: data.user.email };
            set({ hasSession: true, isGuest: false, user: authUser });
            await syncFromCloud(data.user.id);
            return { success: true };
          }
          return { success: false, error: 'Verification failed' };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Verification error' };
        }
      },

      signOut: async () => {
        try {
          if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
          }
        } catch (e) {
          console.warn('Supabase signout error:', e);
        }
        // Revert to guest mode while preserving current local setup
        set({
          hasSession: false,
          isGuest: true,
          user: null,
        });
      },

      restoreSession: async () => {
        try {
          if (!isSupabaseConfigured()) {
            const current = get();
            if (current.user && current.hasSession) {
              await syncFromCloud(current.user.id);
            }
            return;
          }

          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const authUser: AuthUser = {
              id: data.session.user.id,
              email: data.session.user.email,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await syncFromCloud(data.session.user.id);
          }
        } catch (e) {
          console.warn('Session restoration failed:', e);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
