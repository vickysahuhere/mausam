import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
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
  const {
    setGuest,
    signInWithPassword,
    signUpWithPassword,
    verifyOtp,
    resendVerificationEmail,
    checkVerificationStatus,
  } = useAuthStore();
  const theme = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email Confirmation State
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleGuestLogin = () => {
    setGuest(true);
    router.push('/onboarding/survey');
  };

  const handleAuthSubmit = async () => {
    setErrorMsg(null);
    setResendStatus(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await signInWithPassword(trimmedEmail, password);
        if (res.success) {
          router.push('/onboarding/survey');
        } else {
          setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
        }
      } else {
        const res = await signUpWithPassword(trimmedEmail, password, fullName.trim());
        if (res.success) {
          if (res.requiresVerification) {
            setAwaitingVerification(true);
          } else {
            router.push('/onboarding/survey');
          }
        } else {
          setErrorMsg(res.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedCode = otpCode.trim();
    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMsg('Please enter the 6-digit confirmation code.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyOtp(email.trim(), trimmedCode);
      if (res.success) {
        Alert.alert('Email Confirmed!', 'Your account has been verified and synced.');
        router.push('/onboarding/survey');
      } else {
        setErrorMsg(res.error || 'Invalid or expired confirmation code.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailLink = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await checkVerificationStatus(email.trim(), password);
      if (res.success) {
        Alert.alert('Welcome!', 'Your email is confirmed and your account is active.');
        router.push('/onboarding/survey');
      } else {
        setErrorMsg('Email not verified yet. Please tap the link in your email or enter the code.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification check failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg(null);
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        setResendStatus('Confirmation email resent! Please check your inbox.');
      } else {
        setErrorMsg(res.error || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend email.');
    } finally {
      setResending(false);
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

          {/* Email Confirmation Screen */}
          {awaitingVerification ? (
            <Card style={{ padding: theme.spacing.m, borderColor: theme.colors.primary, borderWidth: 1.5 }}>
              <View style={{ alignItems: 'center', marginBottom: theme.spacing.m }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: theme.colors.primary + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Icon name="compass" size={28} color={theme.colors.primary} />
                </View>
                <Typography variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>
                  Confirm Your Email
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ textAlign: 'center', marginTop: 6, lineHeight: 18 }}
                >
                  We sent a confirmation link & 6-digit code to{'\n'}
                  <Typography variant="caption" style={{ fontWeight: '700', color: theme.colors.text }}>
                    {email.trim()}
                  </Typography>
                </Typography>
              </View>

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

              {resendStatus && (
                <View
                  style={{
                    backgroundColor: theme.colors.success + '15',
                    borderColor: theme.colors.success,
                    borderWidth: 1,
                    borderRadius: theme.shapes.borderRadius.s,
                    padding: 10,
                    marginBottom: theme.spacing.m,
                  }}
                >
                  <Typography variant="caption" color={theme.colors.success} style={{ fontWeight: '600' }}>
                    {resendStatus}
                  </Typography>
                </View>
              )}

              {/* Enter 6-digit OTP code */}
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 4 }}>
                Enter 6-Digit Code
              </Typography>
              <TextInput
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="123456"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                maxLength={8}
                style={{
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderRadius: theme.shapes.borderRadius.s,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.colors.text,
                  textAlign: 'center',
                  letterSpacing: 4,
                  marginBottom: 12,
                }}
              />

              <Button
                title={loading ? 'Verifying...' : 'Verify Code'}
                onPress={handleVerifyOtp}
                disabled={loading || otpCode.trim().length < 6}
                style={{ marginBottom: 8 }}
              />

              <Button
                title={loading ? 'Checking...' : "I've Clicked the Email Link"}
                variant="outline"
                onPress={handleCheckEmailLink}
                disabled={loading}
                style={{ marginBottom: 12 }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resending}
                  style={{ paddingVertical: 4 }}
                >
                  <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                    {resending ? 'Sending...' : 'Resend Email'}
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setAwaitingVerification(false); setErrorMsg(null); }}
                  style={{ paddingVertical: 4 }}
                >
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    Change Email
                  </Typography>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <>
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

                {/* Name Field (Sign Up Only) */}
                {mode === 'signup' && (
                  <>
                    <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 4 }}>
                      Full Name
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
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Vicky Sahu"
                        placeholderTextColor={theme.colors.textSecondary}
                        autoCapitalize="words"
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          color: theme.colors.text,
                          fontSize: 14,
                        }}
                      />
                    </View>
                  </>
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
                    placeholder="Minimum 6 characters"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      color: theme.colors.text,
                      fontSize: 14,
                    }}
                  />
                </View>

                <Button
                  title={loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  onPress={handleAuthSubmit}
                  disabled={loading}
                  style={{ width: '100%' }}
                />
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
