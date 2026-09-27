import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';

export default function Auth() {
  const router = useRouter();
  const {
    setGuest,
    signInWithPassword,
    signUpWithPassword,
    signInWithOtp,
    verifyOtp,
    resendVerificationEmail,
    checkVerificationStatus,
    requestPasswordReset,
    confirmPasswordReset,
  } = useAuthStore();
  const theme = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [signinMethod, setSigninMethod] = useState<'otp' | 'password'>('otp');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [isUnregisteredError, setIsUnregisteredError] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password Reset State
  const [resetStage, setResetStage] = useState<'request' | 'confirm'>('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Email Confirmation State (Sign up link)
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const navigateAfterAuth = () => {
    const hasDefaultLoc = useLocationStore.getState().locations.some((l) => l.isDefault);
    const isSurveyDone = useAuthStore.getState().surveyCompleted;

    if (hasDefaultLoc && isSurveyDone) {
      router.replace('/(tabs)');
    } else if (!isSurveyDone) {
      router.replace('/onboarding/survey');
    } else {
      router.replace('/onboarding/location-setup');
    }
  };

  const handleGuestLogin = () => {
    setGuest(true);
    router.push('/onboarding/survey');
  };

  const handleRequestReset = async () => {
    setErrorMsg(null);
    setResetSuccessMsg(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(trimmedEmail);
      if (res.success) {
        setResetStage('confirm');
        setResetSuccessMsg('Recovery code sent! Check your inbox or use 123456 in demo mode.');
      } else {
        setErrorMsg(res.error || 'Failed to send recovery code.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error sending recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    setErrorMsg(null);
    setResetSuccessMsg(null);
    const trimmedEmail = email.trim();
    const trimmedCode = resetCode.trim();
    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMsg('Please enter the 6-digit recovery code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await confirmPasswordReset(trimmedEmail, trimmedCode, newPassword);
      if (res.success) {
        Alert.alert('Password Updated', 'Your password has been reset successfully. Logging you in...');
        navigateAfterAuth();
      } else {
        setErrorMsg(res.error || 'Failed to reset password. Please check your recovery code.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error confirming password reset.');
    } finally {
      setLoading(false);
    }
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
          navigateAfterAuth();
        } else {
          setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
        }
      } else {
        const res = await signUpWithPassword(trimmedEmail, password, fullName.trim());
        if (res.success) {
          if (res.requiresVerification) {
            setAwaitingVerification(true);
          } else {
            navigateAfterAuth();
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

  const handleSendLoginOtp = async () => {
    setErrorMsg(null);
    setIsUnregisteredError(false);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await signInWithOtp(trimmedEmail);
      if (res.success) {
        setLoginOtpSent(true);
        setIsUnregisteredError(false);
      } else {
        setErrorMsg(res.error || 'Failed to send verification code.');
        if (res.error?.includes("isn't registered") || res.error?.includes('create an account')) {
          setIsUnregisteredError(true);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error sending login code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    const trimmedCode = loginOtpCode.trim();
    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyOtp(email.trim(), trimmedCode);
      if (res.success) {
        Alert.alert('Signed In', 'Welcome back to Mausam!');
        navigateAfterAuth();
      } else {
        setErrorMsg(res.error || 'Invalid or expired verification code.');
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
        navigateAfterAuth();
      } else {
        setErrorMsg('Email not verified yet. Please tap the verification link sent to your email.');
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
          <View style={{ marginBottom: theme.spacing.l, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="h1" style={{ fontWeight: '800', marginBottom: 2 }}>
                Mausam
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                Personalized, hyper-local weather intelligence designed for India.
              </Typography>
            </View>
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
                  Verify Your Email
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ textAlign: 'center', marginTop: 6, lineHeight: 18 }}
                >
                  We sent a verification link to{'\n'}
                  <Typography variant="caption" style={{ fontWeight: '700', color: theme.colors.text }}>
                    {email.trim()}
                  </Typography>
                  {'\n'}Please check your inbox and tap the link to confirm your account.
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

              <Button
                title={loading ? 'Checking...' : "I've Clicked the Verification Link"}
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
                    {resending ? 'Sending...' : 'Resend Verification Link'}
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
                {mode === 'reset' ? (
                  <View>
                    <View style={{ alignItems: 'center', marginBottom: theme.spacing.m }}>
                      <View
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 23,
                          backgroundColor: theme.colors.primary + '18',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <Icon name="compass" size={24} color={theme.colors.primary} />
                      </View>
                      <Typography variant="h3" style={{ fontWeight: '800', textAlign: 'center' }}>
                        Reset Password
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 4 }}>
                        {resetStage === 'request'
                          ? 'Enter your email to receive a 6-digit recovery code.'
                          : `Enter code sent to ${email} and your new password.`}
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

                    {resetSuccessMsg && (
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
                          {resetSuccessMsg}
                        </Typography>
                      </View>
                    )}

                    {resetStage === 'request' ? (
                      <>
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
                            marginBottom: theme.spacing.l,
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

                        <Button
                          title={loading ? 'Sending Code...' : 'Send Recovery Code'}
                          onPress={handleRequestReset}
                          disabled={loading}
                          style={{ width: '100%', marginBottom: 12 }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 4 }}>
                          6-Digit Recovery Code
                        </Typography>
                        <TextInput
                          value={resetCode}
                          onChangeText={setResetCode}
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
                            marginBottom: theme.spacing.m,
                          }}
                        />

                        <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 4 }}>
                          New Password
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
                            value={newPassword}
                            onChangeText={setNewPassword}
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
                          title={loading ? 'Resetting...' : 'Set New Password & Sign In'}
                          onPress={handleConfirmReset}
                          disabled={loading || resetCode.trim().length < 6 || newPassword.length < 6}
                          style={{ width: '100%', marginBottom: 12 }}
                        />
                      </>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setMode('signin');
                          setErrorMsg(null);
                          setResetSuccessMsg(null);
                        }}
                        style={{ paddingVertical: 6, paddingHorizontal: 12 }}
                      >
                        <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                          Back to Sign In
                        </Typography>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
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
                        onPress={() => {
                          setMode('signin');
                          setErrorMsg(null);
                          setIsUnregisteredError(false);
                        }}
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
                        onPress={() => {
                          setMode('signup');
                          setErrorMsg(null);
                          setIsUnregisteredError(false);
                        }}
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
                    {errorMsg && !isUnregisteredError && (
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

                    {/* Unregistered Account Alert */}
                    {isUnregisteredError && (
                      <View
                        style={{
                          backgroundColor: theme.colors.error + '15',
                          borderColor: theme.colors.error,
                          borderWidth: 1,
                          borderRadius: theme.shapes.borderRadius.s,
                          padding: 12,
                          marginBottom: theme.spacing.m,
                        }}
                      >
                        <Typography variant="caption" color={theme.colors.error} style={{ fontWeight: '700', marginBottom: 4 }}>
                          This email isn&apos;t registered. Please create an account first.
                        </Typography>
                        <TouchableOpacity
                          onPress={() => {
                            setMode('signup');
                            setErrorMsg(null);
                            setIsUnregisteredError(false);
                          }}
                          style={{ marginTop: 4 }}
                        >
                          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '800' }}>
                            Switch to Create Account →
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* 6-Digit OTP verification stage for existing user */}
                    {mode === 'signin' && loginOtpSent ? (
                      <View>
                        <View style={{ alignItems: 'center', marginBottom: theme.spacing.m }}>
                          <View
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                              backgroundColor: theme.colors.primary + '18',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <Icon name="compass" size={22} color={theme.colors.primary} />
                          </View>
                          <Typography variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>
                            Enter 6-Digit Code
                          </Typography>
                          <Typography
                            variant="caption"
                            color={theme.colors.textSecondary}
                            style={{ textAlign: 'center', marginTop: 4, lineHeight: 18 }}
                          >
                            We sent a login verification code to{'\n'}
                            <Typography variant="caption" style={{ fontWeight: '700', color: theme.colors.text }}>
                              {email.trim()}
                            </Typography>
                          </Typography>
                        </View>

                        <TextInput
                          value={loginOtpCode}
                          onChangeText={setLoginOtpCode}
                          placeholder="123456"
                          placeholderTextColor={theme.colors.textSecondary}
                          keyboardType="number-pad"
                          maxLength={6}
                          style={{
                            backgroundColor: theme.colors.surfaceSecondary,
                            borderRadius: theme.shapes.borderRadius.s,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            fontSize: 20,
                            fontWeight: '700',
                            color: theme.colors.text,
                            textAlign: 'center',
                            letterSpacing: 6,
                            marginBottom: theme.spacing.m,
                          }}
                        />

                        <Button
                          title={loading ? 'Verifying...' : 'Verify & Sign In'}
                          onPress={handleVerifyLoginOtp}
                          disabled={loading || loginOtpCode.trim().length < 6}
                          style={{ width: '100%', marginBottom: 12 }}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <TouchableOpacity
                            onPress={handleSendLoginOtp}
                            disabled={loading}
                            style={{ paddingVertical: 4 }}
                          >
                            <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                              Resend Code
                            </Typography>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setLoginOtpSent(false);
                              setLoginOtpCode('');
                              setErrorMsg(null);
                            }}
                            style={{ paddingVertical: 4 }}
                          >
                            <Typography variant="caption" color={theme.colors.textSecondary}>
                              Change Email
                            </Typography>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <>
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
                            marginBottom: mode === 'signin' && signinMethod === 'otp' ? theme.spacing.l : theme.spacing.m,
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

                        {/* If Sign In and OTP method selected */}
                        {mode === 'signin' && signinMethod === 'otp' ? (
                          <>
                            <Button
                              title={loading ? 'Sending Code...' : 'Send 6-Digit Login Code'}
                              onPress={handleSendLoginOtp}
                              disabled={loading}
                              style={{ width: '100%', marginBottom: 12 }}
                            />

                            <TouchableOpacity
                              onPress={() => {
                                setSigninMethod('password');
                                setErrorMsg(null);
                                setIsUnregisteredError(false);
                              }}
                              style={{ alignItems: 'center', paddingVertical: 6 }}
                            >
                              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                                Sign in with Password instead
                              </Typography>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            {/* Password Field Header with Forgot? link */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                                Password
                              </Typography>
                              {mode === 'signin' && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setMode('reset');
                                    setResetStage('request');
                                    setErrorMsg(null);
                                    setResetSuccessMsg(null);
                                  }}
                                  style={{ paddingVertical: 2, paddingHorizontal: 4 }}
                                >
                                  <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                                    Forgot Password?
                                  </Typography>
                                </TouchableOpacity>
                              )}
                            </View>
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
                              title={loading ? 'Please wait...' : mode === 'signin' ? 'Sign In with Password' : 'Create Account'}
                              onPress={handleAuthSubmit}
                              disabled={loading}
                              style={{ width: '100%', marginBottom: mode === 'signin' ? 12 : 0 }}
                            />

                            {mode === 'signin' && (
                              <TouchableOpacity
                                onPress={() => {
                                  setSigninMethod('otp');
                                  setErrorMsg(null);
                                  setIsUnregisteredError(false);
                                }}
                                style={{ alignItems: 'center', paddingVertical: 6 }}
                              >
                                <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                                  Sign in with 6-Digit Email Code instead
                                </Typography>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
