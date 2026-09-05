import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme/ThemeProvider';

export default function Auth() {
  const router = useRouter();
  const { setGuest, signInWithPassword, signUpWithPassword } = useAuthStore();
  const theme = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGuestLogin = () => {
    setGuest(true);
    router.push('/onboarding/survey');
  };

  const handleAuthSubmit = async () => {
    setErrorMsg(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = mode === 'signin'
        ? await signInWithPassword(trimmedEmail, password)
        : await signUpWithPassword(trimmedEmail, password);

      if (res.success) {
        router.push('/onboarding/survey');
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: theme.spacing.l,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: theme.spacing.l }}>
            <Typography variant="h1" style={{ fontWeight: '800', marginBottom: theme.spacing.xs }}>
              Mausam
            </Typography>
            <Typography variant="body" color={theme.colors.textSecondary}>
              Personalized, hyper-local weather intelligence designed for India.
            </Typography>
          </View>

          {/* Guest Card - Top Priority Zero Friction */}
          <Card style={{ padding: theme.spacing.m, marginBottom: theme.spacing.l, borderColor: theme.colors.primary, borderWidth: 1.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.s }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary + '18',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Icon name="compass" size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                  Continue as Guest
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Instant access {'\u2022'} No login required {'\u2022'} Private
                </Typography>
              </View>
            </View>
            <Button
              title="Explore Immediately"
              onPress={handleGuestLogin}
              style={{ width: '100%' }}
            />
          </Card>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginHorizontal: 12, fontWeight: '600', textTransform: 'uppercase' }}>
              or sign in to sync
            </Typography>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          </View>

          {/* Cloud Account Card */}
          <Card style={{ padding: theme.spacing.m, marginBottom: theme.spacing.m }}>
            {/* Mode Switcher Tabs */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: theme.shapes.borderRadius.s,
                padding: 3,
                marginBottom: theme.spacing.m,
              }}
            >
              <TouchableOpacity
                onPress={() => { setMode('signin'); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderRadius: theme.shapes.borderRadius.s - 2,
                  backgroundColor: mode === 'signin' ? theme.colors.surface : 'transparent',
                }}
              >
                <Typography
                  variant="caption"
                  color={mode === 'signin' ? theme.colors.primary : theme.colors.textSecondary}
                  style={{ fontWeight: mode === 'signin' ? '700' : '500' }}
                >
                  Sign In
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setMode('signup'); setErrorMsg(null); }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderRadius: theme.shapes.borderRadius.s - 2,
                  backgroundColor: mode === 'signup' ? theme.colors.surface : 'transparent',
                }}
              >
                <Typography
                  variant="caption"
                  color={mode === 'signup' ? theme.colors.primary : theme.colors.textSecondary}
                  style={{ fontWeight: mode === 'signup' ? '700' : '500' }}
                >
                  Create Account
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Error message */}
            {errorMsg && (
              <View
                style={{
                  backgroundColor: theme.colors.error + '15',
                  borderColor: theme.colors.error,
                  borderWidth: 1,
                  borderRadius: theme.shapes.borderRadius.s,
                  padding: 10,
                  marginBottom: theme.spacing.m,
                }}
              >
                <Typography variant="caption" color={theme.colors.error} style={{ fontWeight: '600' }}>
                  {errorMsg}
                </Typography>
              </View>
            )}

            {/* Email Field */}
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 4 }}>
              Email Address
            </Typography>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: theme.shapes.borderRadius.s,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 12,
                marginBottom: theme.spacing.m,
              }}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  color: theme.colors.text,
                  fontSize: 14,
                }}
              />
            </View>

            {/* Password Field */}
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 4 }}>
              Password
            </Typography>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: theme.shapes.borderRadius.s,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 12,
                marginBottom: theme.spacing.l,
              }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  color: theme.colors.text,
                  fontSize: 14,
                }}
              />
            </View>

            {/* Submit Button */}
            {loading ? (
              <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : (
              <Button
                title={mode === 'signin' ? 'Sign In' : 'Create Cloud Account'}
                variant="primary"
                onPress={handleAuthSubmit}
                style={{ width: '100%' }}
              />
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
