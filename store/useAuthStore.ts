import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Persona } from '../lib/surveyQuestions';

interface AuthState {
  hasSession: boolean;
  isGuest: boolean;
  personaVector: Record<Persona, number> | null;
  surveyCompleted: boolean;
  setSession: (val: boolean) => void;
  setGuest: (val: boolean) => void;
  setPersonaVector: (vector: Record<Persona, number>) => void;
  completeSurvey: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasSession: false,
      isGuest: false,
      personaVector: null,
      surveyCompleted: false,
      setSession: (val) => set({ hasSession: val, isGuest: !val }),
      setGuest: (val) => set({ isGuest: val, hasSession: false }),
      setPersonaVector: (vector) => set({ personaVector: vector }),
      completeSurvey: () => set({ surveyCompleted: true }),
      signOut: () => set({ hasSession: false, isGuest: false, personaVector: null, surveyCompleted: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
