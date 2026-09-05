import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useLocationStore } from '../store/useLocationStore';
import { colors } from '../theme/colors';

export default function Splash() {
  const [isReady, setIsReady] = useState(false);
  const { hasSession, isGuest, personaVector, surveyCompleted } = useAuthStore();
  const hasDefaultLocation = useLocationStore((state) => state.hasDefaultLocation());

  useEffect(() => {
    // Artificial delay to simulate loading or checking session tokens if Supabase was used
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Routing Logic
  const isActiveUser = hasSession || isGuest;

  if (!isActiveUser) {
    return <Redirect href="/onboarding" />;
  }

  if (!personaVector || !surveyCompleted) {
    return <Redirect href="/onboarding/survey" />;
  }

  if (!hasDefaultLocation) {
    return <Redirect href="/onboarding/location-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
