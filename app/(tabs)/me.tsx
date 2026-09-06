import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import * as Linking from 'expo-linking';
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
    verifyOtp,
    checkVerificationStatus,
    resendVerificationEmail,
    updateFullName,
  } = useAuthStore();
  const { locations } = useLocationStore();
  const { activeThemeId, layout } = useLayoutStore();
  const { locale, setLocale, t } = useLocaleStore();
  const { animationsEnabled, setAnimationsEnabled } = useAnimationStore();

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'km/h' | 'm/s'>('km/h');

  // Cloud Auth & Sync state
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [meAwaitingVerification, setMeAwaitingVerification] = useState(false);
  const [meOtpCode, setMeOtpCode] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const handleStartEditName = () => {
    setNewNameInput(user?.fullName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = newNameInput.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    setNameSaving(true);
    try {
      const ok = await updateFullName(trimmed);
      if (ok) {
        setIsEditingName(false);
        Alert.alert('Name Updated', `Your display name has been updated to "${trimmed}" and saved in Supabase.`);
      } else {
        Alert.alert('Notice', 'Could not update name in cloud. Updated locally.');
        setIsEditingName(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to update name.');
    } finally {
      setNameSaving(false);
    }
  };

  const handleOpenUrl = async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', `Could not open ${label}. Please visit: ${url}`);
      }
    } catch {
      Alert.alert('Unable to Open Link', `Could not open ${label}. Please visit: ${url}`);
    }
  };

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
    if (authMode === 'signup' && !authFullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const res = await signInWithPassword(email, authPassword);
        if (res.success) {
          setShowAuthForm(false);
          setAuthEmail('');
          setAuthPassword('');
          Alert.alert('Account Connected', 'Welcome back! Your dashboard and cloud data have been synchronized.');
        } else {
          setAuthError(res.error || 'Authentication failed. Please check your credentials.');
        }
      } else {
        const res = await signUpWithPassword(email, authPassword, authFullName.trim());
        if (res.success) {
          if (res.requiresVerification) {
            setMeAwaitingVerification(true);
          } else {
            setShowAuthForm(false);
            setAuthEmail('');
            setAuthPassword('');
            setAuthFullName('');
            Alert.alert('Account Created', 'Account created! Your dashboard and locations have been saved to the cloud.');
          }
        } else {
          setAuthError(res.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMeVerifyOtp = async () => {
    const trimmed = meOtpCode.trim();
    if (!trimmed || trimmed.length < 6) {
      setAuthError('Please enter the 6-digit confirmation code.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await verifyOtp(authEmail.trim(), trimmed);
      if (res.success) {
        setMeAwaitingVerification(false);
        setShowAuthForm(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthFullName('');
        setMeOtpCode('');
        Alert.alert('Email Confirmed!', 'Your account has been verified and synced with Supabase.');
      } else {
        setAuthError(res.error || 'Invalid or expired confirmation code.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMeCheckLink = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await checkVerificationStatus(authEmail.trim(), authPassword);
      if (res.success) {
        setMeAwaitingVerification(false);
        setShowAuthForm(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthFullName('');
        setMeOtpCode('');
        Alert.alert('Welcome!', 'Your email is confirmed and your account is active.');
      } else {
        setAuthError('Email not verified yet. Please tap the link in your email or enter the 6-digit code.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Verification check failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMeResend = async () => {
    setAuthLoading(true);
    try {
      const res = await resendVerificationEmail(authEmail.trim());
      if (res.success) {
        Alert.alert('Sent', 'Confirmation email has been resent. Please check your inbox.');
      } else {
        setAuthError(res.error || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to resend email.');
    } finally {
      setAuthLoading(false);
    }
  };

  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Typography variant="h3" style={{ fontWeight: '700' }}>
                  {hasSession && user
                    ? user.fullName || 'Mausam Explorer'
                    : 'Guest Explorer'}
                </Typography>
                {hasSession && user && (
                  <TouchableOpacity
                    onPress={handleStartEditName}
                    accessibilityRole="button"
                    accessibilityLabel="Edit display name"
                    style={{
                      padding: 4,
                      borderRadius: 6,
                      backgroundColor: theme.colors.surfaceSecondary,
                    }}
                  >
                    <Icon name="sliders" size={12} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                {hasSession && user
                  ? `${user.email || 'Registered User'} • Cloud Synced`
                  : 'Local device session • No cloud backup'}
              </Typography>
            </View>

            {/* Sync / Status Indicator */}
            {hasSession && user && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.successBg || 'rgba(16, 185, 129, 0.15)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success || '#10B981', marginRight: 4 }} />
                <Typography variant="caption" color={theme.colors.success || '#10B981'} style={{ fontWeight: '700', fontSize: 11 }}>
                  Synced
                </Typography>
              </View>
            )}
          </View>

          {/* Inline Name Editor */}
          {hasSession && user && isEditingName && (
            <View
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 6 }}>
                EDIT DISPLAY NAME
              </Typography>
              <TextInput
                value={newNameInput}
                onChangeText={setNewNameInput}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setIsEditingName(false)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                >
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    Cancel
                  </Typography>
                </TouchableOpacity>
                <Button
                  title={nameSaving ? 'Saving...' : 'Save Name'}
                  variant="primary"
                  disabled={nameSaving}
                  onPress={handleSaveName}
                  style={{ paddingHorizontal: 14, paddingVertical: 6 }}
                />
              </View>
            </View>
          )}

          {/* Database Connection Status Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isSupabaseConfigured()
                ? (theme.colors.successBg || 'rgba(16, 185, 129, 0.12)')
                : (theme.colors.warningBg || 'rgba(245, 158, 11, 0.12)'),
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
                  backgroundColor: isSupabaseConfigured() ? (theme.colors.success || '#10B981') : (theme.colors.warning || '#F59E0B'),
                }}
              />
              <Typography
                variant="caption"
                color={isSupabaseConfigured() ? (theme.colors.success || '#10B981') : (theme.colors.warning || '#F59E0B')}
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
                  {meAwaitingVerification ? (
                    <View>
                      <View style={{ alignItems: 'center', marginBottom: 12 }}>
                        <Typography variant="bodyMedium" style={{ fontWeight: '700', textAlign: 'center' }}>
                          Confirm Your Email
                        </Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 4 }}>
                          Code & link sent to {authEmail}
                        </Typography>
                      </View>

                      {authError && (
                        <Typography variant="caption" color={theme.colors.error} style={{ marginBottom: 8 }}>
                          {authError}
                        </Typography>
                      )}

                      <TextInput
                        value={meOtpCode}
                        onChangeText={setMeOtpCode}
                        placeholder="123456"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="number-pad"
                        maxLength={8}
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          fontSize: 16,
                          fontWeight: '700',
                          color: theme.colors.text,
                          textAlign: 'center',
                          letterSpacing: 4,
                          marginBottom: 8,
                        }}
                      />

                      <Button
                        title={authLoading ? 'Verifying...' : 'Verify Code'}
                        variant="primary"
                        disabled={authLoading || meOtpCode.trim().length < 6}
                        onPress={handleMeVerifyOtp}
                        style={{ marginBottom: 6 }}
                      />

                      <Button
                        title={authLoading ? 'Checking...' : "I've Clicked Email Link"}
                        variant="outline"
                        disabled={authLoading}
                        onPress={handleMeCheckLink}
                        style={{ marginBottom: 8 }}
                      />

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={handleMeResend} disabled={authLoading}>
                          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                            Resend Email
                          </Typography>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setMeAwaitingVerification(false); setAuthError(null); }}>
                          <Typography variant="caption" color={theme.colors.textSecondary}>
                            Cancel
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
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

                      {authMode === 'signup' && (
                        <TextInput
                          value={authFullName}
                          onChangeText={setAuthFullName}
                          placeholder="Full Name (e.g. Vicky Sahu)"
                          placeholderTextColor={theme.colors.textSecondary}
                          autoCapitalize="words"
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
                    </>
                  )}
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
                <Typography variant="caption" color={temperatureUnit === 'C' ? (theme.colors.onPrimary || '#FFFFFF') : theme.colors.text} style={{ fontWeight: '700' }}>
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
                <Typography variant="caption" color={temperatureUnit === 'F' ? (theme.colors.onPrimary || '#FFFFFF') : theme.colors.text} style={{ fontWeight: '700' }}>
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
                <Typography variant="caption" color={windUnit === 'km/h' ? (theme.colors.onPrimary || '#FFFFFF') : theme.colors.text} style={{ fontWeight: '700' }}>
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
                <Typography variant="caption" color={windUnit === 'm/s' ? (theme.colors.onPrimary || '#FFFFFF') : theme.colors.text} style={{ fontWeight: '700' }}>
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
                    color={locale === loc.code ? (theme.colors.onPrimary || '#FFFFFF') : theme.colors.text}
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

        {/* SECTION 5: ABOUT & MAITHIL STUDIOS */}
        <Typography
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4, letterSpacing: 0.8 }}
        >
          {t('aboutMausam')}
        </Typography>
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          {/* Studio & Brand Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
              }}
            >
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h2" style={{ fontWeight: '800', lineHeight: 28 }}>
                Mausam
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 2 }}>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  {t('productBy')}{' '}
                </Typography>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleOpenUrl('https://maithilstudios.vercel.app/', 'Maithil Studios')}
                  accessibilityRole="link"
                  accessibilityLabel="Maithil Studios, opens external website"
                  accessibilityHint="Opens official website in your web browser"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                >
                  <Typography
                    variant="caption"
                    color={theme.colors.primary}
                    style={{ fontWeight: '700', textDecorationLine: 'underline' }}
                  >
                    Maithil Studios
                  </Typography>
                  <Icon name="external-link" size={11} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mission statement */}
          <Typography
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 12, lineHeight: 18 }}
          >
            Personalized, hyper-local weather intelligence designed for India. Powered by meteorological models and open satellite data.
          </Typography>

          <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 12 }} />

          {/* Version & Studio Link Pill Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <View>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
                Version 1.0.0 &bull; Open Source (MIT)
              </Typography>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleOpenUrl('https://maithilstudios.vercel.app/', 'Maithil Studios')}
              accessibilityRole="link"
              accessibilityLabel="Visit Maithil Studios, opens external website"
              accessibilityHint="Opens the Maithil Studios official website"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: theme.shapes.borderRadius.s,
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 11 }}>
                Maithil Studios &rarr;
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 6: BE A CONTRIBUTOR */}
        <Typography
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4, letterSpacing: 0.8 }}
        >
          {t('beAContributor')}
        </Typography>
        <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
          {/* Invitation Header */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Icon name="github" size={22} color={theme.colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '800' }}>
                {t('contributorSubtitle')}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2, lineHeight: 17 }}>
                {t('contributorDesc')} Everyone is welcome to participate in the project.
              </Typography>
            </View>
          </View>

          {/* Contribution Areas Chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 }}>
            {[
              'Code & Features',
              'Bug Reports',
              'Feature Ideas',
              'Documentation',
              'Translations (Bhasha)',
            ].map((item, idx) => (
              <View
                key={idx}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderWidth: 0.5,
                  borderColor: theme.colors.border,
                }}
              >
                <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10, fontWeight: '600' }}>
                  {item}
                </Typography>
              </View>
            ))}
          </View>

          {/* Contribute CTA Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleOpenUrl('https://github.com/vickysahuhere/mausam.git', 'Mausam GitHub repository')}
            accessibilityRole="link"
            accessibilityLabel="Contribute on GitHub, opens external website"
            accessibilityHint="Opens the Mausam open source GitHub repository in your web browser"
            style={{
              minHeight: 46,
              marginTop: 6,
              paddingHorizontal: theme.spacing.m,
              paddingVertical: 10,
              borderRadius: theme.shapes.borderRadius.m,
              backgroundColor: theme.colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon name="github" size={18} color={theme.colors.onPrimary || '#FFFFFF'} />
            <Typography
              variant="bodyMedium"
              style={{
                fontWeight: '700',
                color: theme.colors.onPrimary || '#FFFFFF',
              }}
            >
              {t('contributeOnGithub')}
            </Typography>
            <Icon name="external-link" size={14} color={theme.colors.onPrimary || '#FFFFFF'} />
          </TouchableOpacity>
        </Card>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
