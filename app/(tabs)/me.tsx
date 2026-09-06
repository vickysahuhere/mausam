import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
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
import { syncFromCloud, triggerBackgroundSync } from '../../lib/syncService';
import { useLocaleStore } from '../../store/useLocaleStore';
import { SUPPORTED_LOCALES, SupportedLocale } from '../../lib/i18n';
import { useAnimationStore } from '../../store/useAnimationStore';
import { triggerLocalWeatherAlert } from '../../lib/notificationService';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function MeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const {
    hasSession,
    user,
    personaVector,
    signOut,
    signInWithPassword,
    signUpWithPassword,
    setPersonaVector,
    completeSurvey,
    setGuest,
  } = useAuthStore();
  const { locations, reset: resetLocations } = useLocationStore();
  const { activeThemeId, reset: resetLayout, reinitializeLayout, layout } = useLayoutStore();
  const { locale, setLocale, t } = useLocaleStore();
  const { animationsEnabled, setAnimationsEnabled } = useAnimationStore();

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'km/h' | 'm/s'>('km/h');

  // Cloud Auth & Sync state
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    try {
      await syncFromCloud(user.id);
      await triggerBackgroundSync(user.id);
      Alert.alert('Cloud Sync Complete', 'All locations, layouts, and preferences are up to date.');
    } catch (e: any) {
      Alert.alert('Sync Notice', e?.message || 'Could not complete cloud sync.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your current dashboard settings will be preserved locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleAuthSubmit = async () => {
    setAuthError(null);
    const email = authEmail.trim();
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = authMode === 'signin'
        ? await signInWithPassword(email, authPassword)
        : await signUpWithPassword(email, authPassword);

      if (res.success) {
        setShowAuthForm(false);
        setAuthEmail('');
        setAuthPassword('');
        Alert.alert(
          'Account Connected',
          authMode === 'signup'
            ? 'Account created! Your current dashboard and locations have been saved to the cloud.'
            : 'Welcome back! Your dashboard and cloud data have been synchronized.'
        );
      } else {
        setAuthError(res.error || 'Authentication failed. Please try again.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

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
        {/* SECTION 1: PROFILE & CLOUD ACCOUNT */}
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
                {hasSession && user ? user.email || 'Registered User' : 'Guest Explorer'}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {hasSession && user ? 'Cloud Synced \u2022 PostgreSQL / RLS' : 'Local device session \u2022 No cloud backup'}
              </Typography>
            </View>

            {/* Sync / Status Indicator */}
            {hasSession && user && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#10B98120',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 }} />
                <Typography variant="caption" color="#10B981" style={{ fontWeight: '700', fontSize: 11 }}>
                  Synced
                </Typography>
              </View>
            )}
          </View>

          {/* Database Connection Status Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isSupabaseConfigured() ? '#10B98115' : '#F59E0B15',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              marginTop: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isSupabaseConfigured() ? '#10B981' : '#F59E0B',
                }}
              />
              <Typography
                variant="caption"
                color={isSupabaseConfigured() ? '#10B981' : '#F59E0B'}
                style={{ fontWeight: '700', fontSize: 11 }}
                numberOfLines={1}
              >
                {isSupabaseConfigured()
                  ? 'Database: Connected to Supabase Cloud'
                  : 'Database: Local Offline Storage'}
              </Typography>
            </View>
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ fontSize: 10 }}
            >
              {isSupabaseConfigured() ? 'PostgreSQL / RLS' : 'AsyncStorage'}
            </Typography>
          </View>
          {!isSupabaseConfigured() && (
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ fontSize: 10, marginTop: 4, fontStyle: 'italic' }}
            >
              Add EXPO_PUBLIC_SUPABASE_URL and ANON_KEY to .env to connect live cloud database.
            </Typography>
          )}

          {/* Authenticated Controls */}
          {hasSession && user ? (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, flexDirection: 'row', gap: 10 }}>
              <Button
                title={syncing ? 'Syncing...' : 'Sync Now'}
                variant="outline"
                onPress={handleManualSync}
                disabled={syncing}
                style={{ flex: 1 }}
              />
              <Button
                title="Sign Out"
                variant="ghost"
                onPress={handleSignOut}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            /* Guest Controls: In-App Sign In / Register toggle */
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Create an account to sync locations and layouts across devices.
                </Typography>
              </View>
              <Button
                title={showAuthForm ? 'Hide Sign In' : 'Sign In / Register Cloud Account'}
                variant={showAuthForm ? 'ghost' : 'outline'}
                onPress={() => { setShowAuthForm(!showAuthForm); setAuthError(null); }}
                style={{ marginTop: 8 }}
              />

              {/* Inline Auth Form */}
              {showAuthForm && (
                <View style={{ marginTop: 12, backgroundColor: theme.colors.surfaceSecondary, padding: 12, borderRadius: theme.shapes.borderRadius.s }}>
                  {/* Mode tabs */}
                  <View style={{ flexDirection: 'row', marginBottom: 10, backgroundColor: theme.colors.surface, borderRadius: 6, padding: 2 }}>
                    <TouchableOpacity
                      onPress={() => { setAuthMode('signin'); setAuthError(null); }}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        alignItems: 'center',
                        borderRadius: 4,
                        backgroundColor: authMode === 'signin' ? theme.colors.surfaceSecondary : 'transparent',
                      }}
                    >
                      <Typography variant="caption" style={{ fontWeight: authMode === 'signin' ? '700' : '500' }}>
                        Sign In
                      </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setAuthMode('signup'); setAuthError(null); }}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        alignItems: 'center',
                        borderRadius: 4,
                        backgroundColor: authMode === 'signup' ? theme.colors.surfaceSecondary : 'transparent',
                      }}
                    >
                      <Typography variant="caption" style={{ fontWeight: authMode === 'signup' ? '700' : '500' }}>
                        Create Account
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  {authError && (
                    <Typography variant="caption" color={theme.colors.error} style={{ marginBottom: 8 }}>
                      {authError}
                    </Typography>
                  )}

                  <TextInput
                    value={authEmail}
                    onChangeText={setAuthEmail}
                    placeholder="Email address"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      fontSize: 13,
                      color: theme.colors.text,
                      marginBottom: 8,
                    }}
                  />

                  <TextInput
                    value={authPassword}
                    onChangeText={setAuthPassword}
                    placeholder={authMode === 'signup' ? 'Password (min 6 chars)' : 'Password'}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    autoCapitalize="none"
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      fontSize: 13,
                      color: theme.colors.text,
                      marginBottom: 10,
                    }}
                  />

                  <Button
                    title={authLoading ? 'Connecting...' : authMode === 'signin' ? 'Sign In & Sync' : 'Register & Sync'}
                    variant="primary"
                    disabled={authLoading}
                    onPress={handleAuthSubmit}
                  />
                </View>
              )}
            </View>
          )}
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

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />

          {/* Regional Bhasha / Language Selection */}
          <View style={{ paddingVertical: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{t('languageSetting')}</Typography>
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                {SUPPORTED_LOCALES.find((l) => l.code === locale)?.nativeName}
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {SUPPORTED_LOCALES.map((loc) => (
                <TouchableOpacity
                  key={loc.code}
                  onPress={() => setLocale(loc.code as SupportedLocale)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderRadius: theme.shapes.borderRadius.s,
                    backgroundColor: locale === loc.code ? theme.colors.primary : theme.colors.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: locale === loc.code ? theme.colors.primary : theme.colors.border,
                  }}
                >
                  <Typography
                    variant="caption"
                    color={locale === loc.code ? '#FFFFFF' : theme.colors.text}
                    style={{ fontWeight: locale === loc.code ? '700' : '500' }}
                  >
                    {loc.nativeName}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />

          {/* Motion & Animations Master Toggle */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{t('animationsSetting')}</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                {t('animationsDesc')}
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setAnimationsEnabled(!animationsEnabled)}
              activeOpacity={0.7}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 12,
                borderRadius: theme.shapes.borderRadius.s,
                backgroundColor: animationsEnabled ? theme.colors.primary : theme.colors.surfaceSecondary,
              }}
            >
              <Typography variant="caption" color={animationsEnabled ? '#FFFFFF' : theme.colors.text} style={{ fontWeight: '700' }}>
                {animationsEnabled ? t('motion') : t('static')}
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />

          {/* Severe Alert Notification Test */}
          <View style={{ paddingVertical: 6 }}>
            <Button
              title={t('testNotification')}
              variant="outline"
              onPress={async () => {
                await triggerLocalWeatherAlert(
                  'Heavy Monsoon Downpour & Gale Winds',
                  'IMD issues Red Alert: Torrential rain (>120mm) and wind gusts up to 65km/h expected in your district. Avoid waterlogged areas.',
                  'red'
                );
                Alert.alert('Alert Triggered', t('testNotificationSent'));
              }}
            />
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
