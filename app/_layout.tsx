import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../theme/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
