const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.trim() + '\n');
};

write('theme/colors.ts', \
export const colors = {
  primary: '#208AEF',
  primaryDark: '#176BBA',
  background: '#F4F4F5',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B'
};
\);

write('theme/spacing.ts', \
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};
\);

write('theme/typography.ts', \
export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const },
};
\);

write('components/ui/Typography.tsx', \
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';

interface Props extends TextProps {
  variant?: keyof typeof t;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Typography({ variant = 'body', color = colors.text, align = 'left', style, ...props }: Props) {
  return (
    <Text style={[t[variant], { color, textAlign: align }, style]} {...props} />
  );
}
\);

write('components/ui/Button.tsx', \
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, style, ...props }: Props) {
  const getBgColor = () => {
    if (props.disabled) return colors.border;
    if (variant === 'primary') return colors.primary;
    if (variant === 'secondary') return colors.surface;
    return 'transparent';
  };

  const getTextColor = () => {
    if (props.disabled) return colors.textSecondary;
    if (variant === 'primary') return '#FFF';
    if (variant === 'secondary' || variant === 'outline') return colors.primary;
    return colors.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: getBgColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    ...typography.bodyMedium,
  },
});
\);

write('components/ui/Card.tsx', \
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
\);

write('lib/surveyQuestions.ts', \
export type Persona = 'health' | 'fitness' | 'beach' | 'travel' | 'parent' | 'agriculture' | 'commuter' | 'event';

export const SURVEY_WEIGHTS: Record<string, Partial<Record<Persona, number>>> = {
  'q1_health':     { health: 3 },
  'q1_fitness':    { fitness: 3, health: 1 },
  'q1_beach':      { beach: 3 },
  'q1_travel':     { travel: 3 },
  'q1_parent':     { parent: 3 },
  'q1_agriculture':{ agriculture: 3 },
  'q1_commute':    { commuter: 3 },
  'q1_events':     { event: 3 },
  'q2_air_quality':{ health: 2, agriculture: 1 },
  'q2_rain_alerts':{ commuter: 2, parent: 2, agriculture: 1 },
  'q2_outdoor_time':{ fitness: 2, beach: 1, event: 1 },
  'q2_travel_plans':{ travel: 2 },
  'q2_school_run': { parent: 3 },
  'q2_planting':   { agriculture: 3 },
};

export interface SurveyOption {
  id: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: SurveyOption[];
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    title: 'What brings you here most?',
    subtitle: 'Select the one that best describes you.',
    type: 'single',
    options: [
      { id: 'q1_health', label: 'Health & Allergies' },
      { id: 'q1_fitness', label: 'Outdoor Fitness & Sports' },
      { id: 'q1_beach', label: 'Beach & Surfing' },
      { id: 'q1_travel', label: 'Travel Planning' },
      { id: 'q1_parent', label: 'Parenting & Family' },
      { id: 'q1_agriculture', label: 'Farming & Gardening' },
      { id: 'q1_commute', label: 'Daily Commuting' },
      { id: 'q1_events', label: 'Event Planning' },
    ]
  },
  {
    id: 'q2',
    title: 'What matters most to you day-to-day?',
    subtitle: 'Select up to 3 options.',
    type: 'multi',
    options: [
      { id: 'q2_air_quality', label: 'Air Quality & Pollen' },
      { id: 'q2_rain_alerts', label: 'Rain & Storm Alerts' },
      { id: 'q2_outdoor_time', label: 'Best Time to go Outside' },
      { id: 'q2_travel_plans', label: 'Weather at Destinations' },
      { id: 'q2_school_run', label: 'School Commute Conditions' },
      { id: 'q2_planting', label: 'Soil & Planting Guidance' },
    ]
  }
];
\);

write('lib/personaEngine.ts', \
import { Persona, SURVEY_WEIGHTS } from './surveyQuestions';

export function buildPersonaVector(selectedAnswerIds: string[]): Record<Persona, number> {
  const raw: Record<Persona, number> = {
    health: 0, fitness: 0, beach: 0, travel: 0,
    parent: 0, agriculture: 0, commuter: 0, event: 0,
  };
  
  for (const id of selectedAnswerIds) {
    const w = SURVEY_WEIGHTS[id] || {};
    for (const [p, val] of Object.entries(w)) {
      raw[p as Persona] += val;
    }
  }
  
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const vector = {} as Record<Persona, number>;
  
  for (const p of Object.keys(raw) as Persona[]) {
    vector[p] = raw[p] / total;
  }
  
  return vector;
}
\);

write('store/useAuthStore.ts', \
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
\);

write('store/useLocationStore.ts', \
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
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
\);
