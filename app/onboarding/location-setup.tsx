import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useLocationStore } from '../../store/useLocationStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function LocationSetup() {
  const router = useRouter();
  const { addLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to get localized weather data.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // We would normally reverse-geocode here. Mocking for Phase 2.
      const newLocId = Date.now().toString();
      addLocation({
        id: newLocId,
        label: 'Current Location',
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        isDefault: true,
      });
      
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Unable to fetch location.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    // Phase 2 placeholder for manual search flow
    const mockDelhiId = 'delhi-123';
    addLocation({
      id: mockDelhiId,
      label: 'New Delhi (Mock)',
      lat: 28.6139,
      lon: 77.2090,
      isDefault: true,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>Where are you?</Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Mausam needs your location to provide accurate weather, alerts, and personalized widgets for your area.
        </Typography>

        <Card style={styles.card}>
          <Button 
            title="Use Current Location" 
            loading={loading}
            onPress={requestLocation} 
            style={styles.button}
          />
          <Button 
            title="Search City Manually" 
            variant="outline"
            onPress={handleManualSearch} 
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
