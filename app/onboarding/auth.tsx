import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function Auth() {
  const router = useRouter();
  const setGuest = useAuthStore((state) => state.setGuest);

  const handleGuestLogin = () => {
    setGuest(true);
    router.push('/onboarding/survey');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>Welcome</Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Sign in or continue as a guest to build your personalized weather dashboard.
        </Typography>

        <Card style={styles.card}>
          <Typography variant="bodyMedium" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.l }}>
            (Supabase Auth not yet implemented for Phase 2)
          </Typography>
          
          <Button 
            title="Sign in with Email" 
            disabled 
            style={styles.button}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.l,
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.s,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  card: {
    padding: spacing.xl,
  },
  button: {
    marginBottom: spacing.m,
  }
});
