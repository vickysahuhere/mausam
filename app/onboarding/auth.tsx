import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme/ThemeProvider';

export default function Auth() {
  const router = useRouter();
  const setGuest = useAuthStore((state) => state.setGuest);
  const theme = useTheme();

  const handleGuestLogin = () => {
    setGuest(true);
    router.push('/onboarding/survey');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, padding: theme.spacing.l, justifyContent: 'center' }}>
        <Typography variant="h2" style={{ marginBottom: theme.spacing.s }}>Welcome</Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.xl }}>
          Sign in or continue as a guest to build your personalized weather dashboard.
        </Typography>

        <Card style={{ padding: theme.spacing.xl }}>
          <Typography variant="bodyMedium" align="center" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.l }}>
            (Supabase Auth not yet implemented for Phase 3)
          </Typography>
          
          <Button 
            title="Sign in with Email" 
            disabled 
            style={{ marginBottom: theme.spacing.m }}
          />
          
          <Button 
            title="Continue as Guest" 
            variant="outline"
            onPress={handleGuestLogin} 
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}
