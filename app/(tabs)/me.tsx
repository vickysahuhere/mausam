import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { ThemeSelector } from '../../components/home/ThemeSelector';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useTheme } from '../../theme/ThemeProvider';
import { THEME_REGISTRY } from '../../theme/registry';
import { Persona } from '../../lib/surveyQuestions';

export default function MeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { isGuest, personaVector, signOut, setPersonaVector, completeSurvey, setGuest } = useAuthStore();
  const { locations, reset: resetLocations } = useLocationStore();
  const { activeThemeId, reset: resetLayout, reinitializeLayout, layout } = useLayoutStore();

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'km/h' | 'm/s'>('km/h');

  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  // Developer Reset Flow
  const handleDeveloperReset = () => {
    signOut();
    resetLocations();
    resetLayout();
    router.replace('/onboarding');
  };

  // Developer Quick Seed Persona for instant testing
  const handleSeedPersona = (persona: Persona) => {
    const vector: Record<Persona, number> = {
      health: 0,
      fitness: 0,
      beach: 0,
      travel: 0,
      parent: 0,
      agriculture: 0,
      commuter: 0,
      event: 0,
    };
    vector[persona] = 1.0;
    setPersonaVector(vector);
    completeSurvey();
    setGuest(true);
    reinitializeLayout(vector);
    Alert.alert('Persona Seeded', 'Generated homepage for ' + persona.toUpperCase() + ' persona.');
  };

  // Find dominant persona
  let dominantPersona = 'Custom';
  if (personaVector) {
    let max = 0;
    for (const [p, val] of Object.entries(personaVector)) {
      if (val > max) {
        max = val;
        dominantPersona = p.charAt(0).toUpperCase() + p.slice(1);
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m }} showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <Typography variant="h1" style={{ fontWeight: '800', marginBottom: theme.spacing.m }}>
          Me
        </Typography>

        {/* SECTION 1: PROFILE */}
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Icon name="me" size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="h3" style={{ fontWeight: '700' }}>
                {isGuest ? 'Guest Explorer' : 'Registered User'}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {isGuest ? 'Local session \u2022 No cloud sync' : 'Supabase authenticated'}
              </Typography>
            </View>
          </View>
        </Card>

        {/* SECTION 2: PERSONALIZATION */}
        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 }}>
          Personalization & Themes
        </Typography>
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          {/* Persona Display */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <View>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Active Persona</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {dominantPersona} (Blended weights)
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/onboarding/survey')}
              style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.shapes.borderRadius.s, backgroundColor: theme.colors.surfaceSecondary }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                Retake Survey
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />

          {/* Theme Display & Toggle */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <View>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Active Visual Theme</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {THEME_REGISTRY[activeThemeId]?.name || 'Theme'}
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setThemePickerOpen(!themePickerOpen)}
              style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.shapes.borderRadius.s, backgroundColor: theme.colors.surfaceSecondary }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                {themePickerOpen ? 'Hide Picker' : 'Change Theme'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Collapsible Visual Theme Selector */}
          {themePickerOpen && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
              <ThemeSelector />
            </View>
          )}

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />

          {/* Homepage Widgets Count */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <View>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Homepage Layout</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {layout.length} active widgets configured
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.shapes.borderRadius.s, backgroundColor: theme.colors.surfaceSecondary }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                Edit on Home
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 3: LOCATIONS */}
        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 }}>
          Location Management
        </Typography>
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
            <View>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Primary Location</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {defaultLoc ? defaultLoc.label : 'None set'}
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/locations')}
              style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.shapes.borderRadius.s, backgroundColor: theme.colors.surfaceSecondary }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                Manage ({locations.length})
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 4: PREFERENCES */}
        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 }}>
          Weather Units & Preferences
        </Typography>
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Temperature Unit</Typography>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => setTemperatureUnit('C')}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: temperatureUnit === 'C' ? theme.colors.primary : theme.colors.surfaceSecondary,
                }}
              >
                <Typography variant="caption" color={temperatureUnit === 'C' ? '#FFFFFF' : theme.colors.text} style={{ fontWeight: '700' }}>
                  {'\u00B0'}C
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTemperatureUnit('F')}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: temperatureUnit === 'F' ? theme.colors.primary : theme.colors.surfaceSecondary,
                }}
              >
                <Typography variant="caption" color={temperatureUnit === 'F' ? '#FFFFFF' : theme.colors.text} style={{ fontWeight: '700' }}>
                  {'\u00B0'}F
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>Wind Speed</Typography>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => setWindUnit('km/h')}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: windUnit === 'km/h' ? theme.colors.primary : theme.colors.surfaceSecondary,
                }}
              >
                <Typography variant="caption" color={windUnit === 'km/h' ? '#FFFFFF' : theme.colors.text} style={{ fontWeight: '700' }}>
                  km/h
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWindUnit('m/s')}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: windUnit === 'm/s' ? theme.colors.primary : theme.colors.surfaceSecondary,
                }}
              >
                <Typography variant="caption" color={windUnit === 'm/s' ? '#FFFFFF' : theme.colors.text} style={{ fontWeight: '700' }}>
                  m/s
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* SECTION 5: ABOUT */}
        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 }}>
          About
        </Typography>
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>Mausam</Typography>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
            Personalized Weather Platform {'\u2022'} Ministry of Earth Sciences / IMD
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
            Version 1.0.0 {'\u2022'} Open Source (MIT)
          </Typography>
        </Card>

        {/* SECTION 6: DEVELOPER OPTIONS (DEV ONLY) */}
        {__DEV__ && (
          <View style={{ marginTop: theme.spacing.s, marginBottom: theme.spacing.xl }}>
            <Typography variant="caption" color={theme.colors.error} style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 }}>
              Developer Options [DEV ONLY]
            </Typography>
            <Card style={{ padding: theme.spacing.m, borderColor: theme.colors.error, borderWidth: 1.5 }}>
              <Typography variant="h3" color={theme.colors.error} style={{ fontWeight: '700', marginBottom: 4 }}>
                Development & Testing Controls
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.m }}>
                Quick controls to reset persisted state or test personas during development.
              </Typography>

              {/* Reset Action */}
              <Button
                title="Reset Onboarding & State"
                variant="outline"
                onPress={handleDeveloperReset}
                style={{ borderColor: theme.colors.error, marginBottom: theme.spacing.m }}
              />

              {/* Seed Persona Shortcuts */}
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 8 }}>
                Quick Seed Persona (Instant Layout):
              </Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {(['health', 'fitness', 'beach', 'travel', 'agriculture', 'parent'] as Persona[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => handleSeedPersona(p)}
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: theme.shapes.borderRadius.s,
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Typography variant="caption" style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                      {p}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
