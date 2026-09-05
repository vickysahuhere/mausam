import React from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function Settings() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const resetLocations = useLocationStore((state) => state.reset);

  const handleReset = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will clear all local data (persona, survey, locations) and return you to the start. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: () => {
            signOut();
            resetLocations();
            router.replace('/');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>Settings</Typography>
        
        {/* Only show this block if running in development mode */}
        {__DEV__ && (
          <Card style={styles.devCard}>
            <Typography variant="h3" color={colors.warning} style={{marginBottom: spacing.s}}>
              Developer Options
            </Typography>
            <Typography variant="bodyMedium" color={colors.textSecondary} style={{marginBottom: spacing.m}}>
              These options are only visible during local development. Use this to quickly test the onboarding flow.
            </Typography>
            <Button 
              title="Reset Onboarding State" 
              variant="outline" 
              onPress={handleReset} 
            />
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.m },
  title: { marginBottom: spacing.l },
  devCard: { 
    borderColor: colors.warning, 
    borderWidth: 1,
    backgroundColor: '#fffbeb', // Light warning tint
  }
});
