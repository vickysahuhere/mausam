import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { searchCities, GeocodedLocation } from '../../lib/citySearch';

export default function LocationSetup() {
  const router = useRouter();
  const addLocation = useLocationStore((state) => state.addLocation);
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [permDenied, setPermDenied] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    setPermDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermDenied(true);
        setLoading(false);
        return;
      }

      let position = await Location.getLastKnownPositionAsync();
      if (!position) {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const { latitude, longitude } = position.coords;

      // Extract the most specific locality available from reverse geocoding
      let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocoded.length > 0) {
          const g = geocoded[0];
          const locality = g.name || g.district || g.subregion;
          const cityOrState = g.city || g.region;
          const parts = [locality, cityOrState, g.country].filter(Boolean);
          if (parts.length > 0) {
            label = parts.join(', ');
          }
        }
      } catch {
        // Reverse geocoding failed — keep coordinates
      }

      addLocation({
        id: `loc-gps-${Date.now()}`,
        label,
        lat: latitude,
        lon: longitude,
        isDefault: true,
      });

      setSelectedLabel(label);
      setLoading(false);
    } catch {
      setLoading(false);
      Alert.alert(
        'Location Error',
        'Could not determine your current device coordinates. Please verify device location is on, or search for your locality below.'
      );
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchCities(text);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSelectCity = (loc: GeocodedLocation) => {
    addLocation({
      id: loc.id,
      label: loc.displayName,
      lat: loc.lat,
      lon: loc.lon,
      isDefault: true,
    });
    setSelectedLabel(loc.displayName);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const canContinue = selectedLabel !== null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, padding: theme.spacing.l }}>
        <Typography variant="h2" style={{ fontWeight: '800', marginBottom: theme.spacing.s }}>
          Primary Location
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.l }}>
          Mausam customizes weather alerts, marine data, and hourly timelines for your exact locality.
        </Typography>

        {/* Selected location confirmation card */}
        {selectedLabel && (
          <Card
            style={{
              padding: theme.spacing.m,
              marginBottom: theme.spacing.l,
              borderColor: theme.colors.success,
              borderWidth: 1.5,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Icon name="check" size={16} color={theme.colors.success} strokeWidth={2.5} />
              <Typography variant="caption" color={theme.colors.success} style={{ fontWeight: '700', marginLeft: 6 }}>
                SELECTED PRIMARY LOCATION
              </Typography>
            </View>
            <Typography variant="h3" style={{ fontWeight: '700' }}>{selectedLabel}</Typography>
          </Card>
        )}

        {!showSearch ? (
          <Card style={{ padding: theme.spacing.l }}>
            <Button
              title="Use Current Location (GPS)"
              onPress={handleUseCurrentLocation}
              loading={loading}
              style={{ marginBottom: theme.spacing.m }}
            />

            {permDenied && (
              <View
                style={{
                  padding: theme.spacing.m,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: theme.colors.surfaceSecondary,
                  marginBottom: theme.spacing.m,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.colors.error,
                }}
              >
                <Typography variant="bodyMedium" color={theme.colors.error} style={{ fontWeight: '600', marginBottom: 4 }}>
                  Location Permission Denied
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Device GPS permission was denied. You can grant permission in your system settings, or search for your locality/city below.
                </Typography>
              </View>
            )}

            <Button
              title="Search Locality or City"
              variant="outline"
              onPress={() => setShowSearch(true)}
            />
          </Card>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.shapes.borderRadius.m,
                  paddingHorizontal: theme.spacing.m,
                }}
              >
                <Icon name="search" size={18} color={theme.colors.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search locality (e.g. Mundka, Rohini, Saket)..."
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                  style={{
                    flex: 1,
                    paddingVertical: theme.spacing.m,
                    paddingHorizontal: 8,
                    fontSize: theme.typography.sizes.m,
                    color: theme.colors.text,
                  }}
                />
              </View>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{ marginLeft: theme.spacing.s }}
              />
            </View>

            {searching && (
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginBottom: 6 }}>
                Searching localities...
              </Typography>
            )}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectCity(item)} activeOpacity={0.7}>
                  <Card style={{ marginBottom: theme.spacing.s, padding: theme.spacing.m }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ marginRight: 12 }}>
                        <Icon name="map-pin" size={18} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color={theme.colors.textSecondary}>
                          {[item.locality, item.city, item.state, item.country].filter(Boolean).join(', ')}
                        </Typography>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2 && !searching ? (
                  <Typography variant="bodyMedium" color={theme.colors.textSecondary} align="center" style={{ marginTop: theme.spacing.l }}>
                    No localities found for &ldquo;{searchQuery}&rdquo;
                  </Typography>
                ) : null
              }
            />
          </View>
        )}
      </View>

      {/* Continue button */}
      <View
        style={{
          padding: theme.spacing.l,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Button
          title="Continue to Mausam"
          onPress={() => router.replace('/(tabs)')}
          disabled={!canContinue}
        />
      </View>
    </SafeAreaView>
  );
}
