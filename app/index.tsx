import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useLocationStore } from '../store/useLocationStore';
import { useTheme } from '../theme/ThemeProvider';

export default function Splash() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { hasSession, isGuest, personaVector, surveyCompleted } = useAuthStore();
  const locations = useLocationStore((state) => state.locations);
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const isActiveUser = hasSession || isGuest;
    const hasDefaultLocation = locations.some((l) => l.isDefault);

    if (!isActiveUser) {
      router.replace('/onboarding');
    } else if (!personaVector || !surveyCompleted) {
      router.replace('/onboarding/survey');
    } else if (!hasDefaultLocation) {
      router.replace('/onboarding/location-setup');
    } else {
      router.replace('/(tabs)');
    }
  }, [isReady, hasSession, isGuest, personaVector, surveyCompleted, locations, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
