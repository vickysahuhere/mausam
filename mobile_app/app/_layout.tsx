import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '../theme/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    KinderChildKawaiiBubble: require('../assets/fonts/KinderChildKawaiiBubble-WpnAz.otf'),
  });

  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
