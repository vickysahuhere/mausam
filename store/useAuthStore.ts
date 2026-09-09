import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Persona } from '../lib/surveyQuestions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { migrateGuestToAccount, syncFromCloud } from '../lib/syncService';

export interface AuthUser {
  id: string;
  email?: string;
  fullName?: string;
}

interface AuthState {
  hasSession: boolean;
  isGuest: boolean;
  user: AuthUser | null;
  personaVector: Record<Persona, number> | null;
  surveyCompleted: boolean;
  isRestoringSession: boolean;

  setSession: (val: boolean, user?: AuthUser | null) => void;
  setGuest: (val: boolean) => void;
  setPersonaVector: (vector: Record<Persona, number>) => void;
  completeSurvey: () => void;
  updateFullName: (name: string) => Promise<boolean>;

  signInWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithPassword: (
    email: string,
    pass: string,
    fullName?: string
  ) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean; email?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  checkVerificationStatus: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmPasswordReset: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasSession: false,
      isGuest: false,
      user: null,
      personaVector: null,
      surveyCompleted: false,
      isRestoringSession: false,

      reset: () =>
        set({
          hasSession: false,
          isGuest: false,
          user: null,
          personaVector: null,
          surveyCompleted: false,
          isRestoringSession: false,
        }),

      setSession: (val, user = null) =>
        set({ hasSession: val, isGuest: !val, user: val ? user : null }),

      setGuest: (val) =>
        set({ isGuest: val, hasSession: false, user: null }),

      setPersonaVector: (vector) => set({ personaVector: vector }),

      completeSurvey: () => set({ surveyCompleted: true }),

      updateFullName: async (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return false;

        const currentUser = get().user;
        if (!currentUser) return false;

        const updatedUser: AuthUser = {
          ...currentUser,
          fullName: trimmed,
        };
        set({ user: updatedUser });

        try {
          if (isSupabaseConfigured()) {
            await Promise.all([
              supabase.auth.updateUser({
                data: { full_name: trimmed },
              }),
              supabase.from('user_profiles').upsert({
                user_id: currentUser.id,
                full_name: trimmed,
                updated_at: new Date().toISOString(),
              }),
            ]);
          }
          return true;
        } catch (err) {
          console.warn('updateFullName error:', err);
          return false;
        }
      },

      signInWithPassword: async (email, password) => {
        try {
          if (!isSupabaseConfigured()) {
            // Offline mock authentication fallback
            const existingName = get().user?.fullName || '';
            const mockUser: AuthUser = {
              id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email,
              fullName: existingName,
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
            const metaName =
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              get().user?.fullName ||
              '';
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              fullName: metaName,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await syncFromCloud(data.user.id);
            return { success: true };
          }
          return { success: false, error: 'Sign in failed' };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Authentication error' };
        }
      },

      signUpWithPassword: async (email, password, fullName = '') => {
        try {
          if (!isSupabaseConfigured()) {
            // Offline mock authentication fallback
            const mockUser: AuthUser = {
              id: `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email,
              fullName,
            };
            set({ hasSession: true, isGuest: false, user: mockUser });
            await migrateGuestToAccount(mockUser.id);
            return { success: true };
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

          if (error) return { success: false, error: error.message };

          if (data.user) {
            // Check if email confirmation is required (session is null)
            if (!data.session) {
              return {
                success: true,
                requiresVerification: true,
                email: data.user.email || email,
              };
            }

            // If session already exists immediately
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || fullName,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await migrateGuestToAccount(data.user.id);
            return { success: true };
          }
          return { success: false, error: 'Registration failed' };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Registration error' };
        }
      },

      checkVerificationStatus: async (email, password) => {
        return get().signInWithPassword(email, password);
      },

      resendVerificationEmail: async (email) => {
        try {
          if (!isSupabaseConfigured()) return { success: true };
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
          });
          if (error) return { success: false, error: error.message };
          return { success: true };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Failed to resend email' };
        }
      },

      signInWithOtp: async (email) => {
        try {
          const trimmedEmail = email.trim();
          if (!trimmedEmail || !trimmedEmail.includes('@')) {
            return { success: false, error: 'Please enter a valid email address.' };
          }
          if (!isSupabaseConfigured()) {
            return { success: true };
          }
          const { error } = await supabase.auth.signInWithOtp({
            email: trimmedEmail,
            options: {
              shouldCreateUser: false,
            },
          });
          if (error) {
            const isUnregistered =
              (error as any).status === 422 ||
              (error as any).code === 'otp_disabled' ||
              error.message?.toLowerCase().includes('signups not allowed') ||
              error.message?.toLowerCase().includes('signup disabled') ||
              error.message?.toLowerCase().includes('user not found');

            if (isUnregistered) {
              return {
                success: false,
                error: "This email isn't registered. Please create an account first.",
              };
            }
            return { success: false, error: error.message };
          }
          return { success: true };
        } catch (e: any) {
          return { success: false, error: e?.message || 'OTP request failed' };
        }
      },

      verifyOtp: async (email, token) => {
        try {
          const trimmedEmail = email.trim();
          const trimmedToken = token.trim();
          if (!trimmedEmail || !trimmedToken) {
            return { success: false, error: 'Email and verification code are required.' };
          }

          if (!isSupabaseConfigured()) {
            const mockUser: AuthUser = {
              id: `user-${trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email: trimmedEmail,
            };
            set({ hasSession: true, isGuest: false, user: mockUser });
            await syncFromCloud(mockUser.id);
            return { success: true };
          }

          // 1. Try email OTP verification first (standard for signInWithOtp)
          const { data: dataEmail, error: errEmail } = await supabase.auth.verifyOtp({
            email: trimmedEmail,
            token: trimmedToken,
            type: 'email',
          });

          if (!errEmail && dataEmail?.user) {
            const authUser: AuthUser = {
              id: dataEmail.user.id,
              email: dataEmail.user.email,
              fullName: dataEmail.user.user_metadata?.full_name,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await migrateGuestToAccount(dataEmail.user.id);
            return { success: true };
          }

          // 2. Fallback: try signup verification type
          const { data: dataSignup, error: errSignup } = await supabase.auth.verifyOtp({
            email: trimmedEmail,
            token: trimmedToken,
            type: 'signup',
          });

          if (!errSignup && dataSignup?.user) {
            const authUser: AuthUser = {
              id: dataSignup.user.id,
              email: dataSignup.user.email,
              fullName: dataSignup.user.user_metadata?.full_name,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await migrateGuestToAccount(dataSignup.user.id);
            return { success: true };
          }

          return {
            success: false,
            error: errEmail?.message || errSignup?.message || 'Verification failed. Invalid or expired code.',
          };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Verification error' };
        }
      },

      requestPasswordReset: async (email: string) => {
        try {
          const trimmed = email.trim();
          if (!trimmed || !trimmed.includes('@')) {
            return { success: false, error: 'Please enter a valid email address.' };
          }
          if (!isSupabaseConfigured()) {
            return { success: true };
          }
          const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
          if (error) return { success: false, error: error.message };
          return { success: true };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Password reset request failed' };
        }
      },

      confirmPasswordReset: async (email: string, token: string, newPassword: string) => {
        try {
          const trimmedEmail = email.trim();
          const trimmedToken = token.trim();
          if (!trimmedEmail || !trimmedToken) {
            return { success: false, error: 'Email and recovery code are required.' };
          }
          if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters.' };
          }

          if (!isSupabaseConfigured()) {
            // Mock recovery session
            const mockUser: AuthUser = {
              id: `user-${trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email: trimmedEmail,
            };
            set({ hasSession: true, isGuest: false, user: mockUser });
            await syncFromCloud(mockUser.id);
            return { success: true };
          }

          // 1. Verify the recovery token
          const { data, error } = await supabase.auth.verifyOtp({
            email: trimmedEmail,
            token: trimmedToken,
            type: 'recovery',
          });

          if (error) {
            return { success: false, error: error.message };
          }

          // 2. Update to the new password
          const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (updateError) {
            return { success: false, error: updateError.message };
          }

          if (data.user) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await migrateGuestToAccount(data.user.id);
            return { success: true };
          }

          return { success: true };
        } catch (e: any) {
          return { success: false, error: e?.message || 'Failed to update password' };
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
        set({ isRestoringSession: true });
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
            const metaName =
              data.session.user.user_metadata?.full_name ||
              data.session.user.user_metadata?.name ||
              get().user?.fullName ||
              '';
            const authUser: AuthUser = {
              id: data.session.user.id,
              email: data.session.user.email,
              fullName: metaName,
            };
            set({ hasSession: true, isGuest: false, user: authUser });
            await syncFromCloud(data.session.user.id);
          }
        } catch (e) {
          console.warn('Session restoration failed:', e);
        } finally {
          set({ isRestoringSession: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
