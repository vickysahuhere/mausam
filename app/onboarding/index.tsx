import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeProvider';

export default function Landing() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, padding: theme.spacing.l, justifyContent: 'space-between' }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Typography variant="h1" color={theme.colors.primary} align="center">
            Mausam
          </Typography>
          <Typography variant="bodyMedium" color={theme.colors.textSecondary} align="center" style={{ marginTop: theme.spacing.m }}>
            Your personalized weather companion
          </Typography>
        </View>

        <View style={{ paddingBottom: theme.spacing.xl }}>
          <Button 
            title="Get Started" 
            onPress={() => router.push('/onboarding/auth')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
