import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function Landing() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" color={colors.primary} align="center">
            Mausam
          </Typography>
          <Typography variant="bodyMedium" color={colors.textSecondary} align="center" style={styles.subtitle}>
            Your personalized weather companion
          </Typography>
        </View>

        <View style={styles.footer}>
          <Button 
            title="Get Started" 
            onPress={() => router.push('/onboarding/auth')} 
          />
        </View>
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
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: spacing.m,
  },
  footer: {
    paddingBottom: spacing.xl,
  }
});
