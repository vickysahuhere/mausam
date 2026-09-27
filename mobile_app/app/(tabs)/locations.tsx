import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useLocationStore, SavedLocation } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { WeatherAtmosphere } from '../../components/ui/WeatherAtmosphere';
import { searchCities, GeocodedLocation } from '../../lib/citySearch';
import * as Location from 'expo-location';
import { companionEvents } from '../../lib/companion/companionEvents';
import { useCompanionStore } from '../../store/useCompanionStore';

export default function Locations() {
  const router = useRouter();
  const theme = useTheme();
  useLocaleStore((state) => state.locale);
  const t = useLocaleStore((state) => state.t);
  const { locations, setDefaultLocation, addLocation, removeLocation } = useLocationStore();

  const [showAddSearch, setShowAddSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  const handleUseGps = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionDenied'), t('permissionDeniedDesc'));
        setLoadingGps(false);
        return;
      }
      let position = await Location.getLastKnownPositionAsync();
      if (!position) {
        position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }
      const { latitude, longitude } = position.coords;
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
        // Keep coordinates
      }

      addLocation({
        id: `loc-gps-${Date.now()}`,
        label,
        lat: latitude,
        lon: longitude,
        isDefault: locations.length === 0,
      });
      setShowAddSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      Alert.alert(t('gpsError'), t('permissionDeniedDesc'));
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    setHasSearched(true);
    const res = await searchCities(text);
    setSearchResults(res);
    setSearching(false);
  };

  const handleSelect = (item: GeocodedLocation) => {
    const isAlreadySaved = locations.some(
      (l) => l.id === item.id || (Math.abs(l.lat - item.lat) < 0.005 && Math.abs(l.lon - item.lon) < 0.005)
    );

    if (isAlreadySaved) {
      Alert.alert(t('locationAlreadySaved'), `"${item.displayName}" is already in your saved locations.`);
      setShowAddSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    addLocation({
      id: item.id,
      label: item.displayName,
      lat: item.lat,
      lon: item.lon,
      isDefault: locations.length === 0,
    });
    setShowAddSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleDelete = (loc: SavedLocation) => {
    Alert.alert(
      t('removeLocation'),
      t('deleteLocationConfirm'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeLocation(loc.id);
          },
        },
      ]
    );
  };

  const handleSetPrimary = (loc: SavedLocation) => {
    setDefaultLocation(loc.id);
    useCompanionStore.getState().incrementLocationChangeCount();
    companionEvents.emit('location_changed', { locationName: loc.label });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <WeatherAtmosphere weatherType="clear" />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: theme.spacing.m }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Typography variant="h2" style={{ fontWeight: '800', letterSpacing: -0.5 }}>
                {t('locationsHeader')}
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
                {t('savedLocations')} ({locations.length})
              </Typography>
            </View>
            {!showAddSearch && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAddSearch(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingVertical: 7,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Icon name="plus" size={13} color={theme.colors.onPrimary || '#FFFFFF'} />
                <Typography variant="caption" style={{ color: theme.colors.onPrimary || '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                  {t('addNewLocation')}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Add Location Search Box */}
        {showAddSearch && (
          <Card style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m, borderColor: theme.colors.primary, borderWidth: 1.5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.s }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                {t('addNewLocation')}
              </Typography>
              <TouchableOpacity
                onPress={() => {
                  setShowAddSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{ padding: 4 }}
              >
                <Icon name="x" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Button
              title={loadingGps ? t('acquiringGps') : t('detectGps')}
              variant="primary"
              onPress={handleUseGps}
              disabled={loadingGps}
              loading={loadingGps}
              style={{ marginBottom: 10 }}
            />
            <Typography variant="caption" color={theme.colors.textSecondary} align="center" style={{ marginBottom: 8 }}>
              {t('orSearchCity')}
            </Typography>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surfaceSecondary,
                borderRadius: theme.shapes.borderRadius.s,
                paddingHorizontal: 10,
                marginBottom: 8,
              }}
            >
              <Icon name="search" size={16} color={theme.colors.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder={t('searchCitiesPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  color: theme.colors.text,
                  fontSize: 14,
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')} style={{ padding: 4 }}>
                  <Icon name="x" size={14} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {searching && (
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ paddingVertical: 8 }}>
                {t('searchingRegistry')}
              </Typography>
            )}

            {!searching && hasSearched && searchResults.length === 0 && (
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ paddingVertical: 8 }}>
                {t('noLocationsFound')}
              </Typography>
            )}

            {searchResults.length > 0 && (
              <View style={{ maxHeight: 200 }}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelect(item)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Icon name="map-pin" size={14} color={theme.colors.primary} />
                    <View style={{ marginLeft: 8, flex: 1, minWidth: 0 }}>
                      <Typography variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '600' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" numberOfLines={1} color={theme.colors.textSecondary}>
                        {item.locality ? `${item.locality}, ` : ''}{item.state} &bull; India
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Saved Locations List — Apple Weather Style */}
        {locations.map((loc) => {
          const cityName = loc.label.split(',')[0].trim();
          const regionName = loc.label.split(',').slice(1).join(',').trim();

          return (
            <TouchableOpacity
              key={loc.id}
              activeOpacity={0.8}
              onPress={() => {
                if (!loc.isDefault) {
                  setDefaultLocation(loc.id);
                  companionEvents.emit('location_changed', { locationName: cityName });
                }
                router.push('/(tabs)');
              }}
            >
              <Card
                style={{
                  marginBottom: 10,
                  padding: 14,
                  borderColor: loc.isDefault ? theme.colors.primary : theme.colors.border,
                  borderWidth: loc.isDefault ? 1.5 : 1,
                  borderRadius: 16,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          backgroundColor: loc.isDefault ? theme.colors.primary : (theme.colors.primary + '18'),
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        }}
                      >
                        <Icon name="map-pin" size={15} color={loc.isDefault ? (theme.colors.onPrimary || '#FFFFFF') : theme.colors.primary} />
                      </View>
                      <Typography variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '800', fontSize: 16, flexShrink: 1, letterSpacing: -0.3 }}>
                        {cityName}
                      </Typography>
                      {loc.isDefault && (
                        <View
                          style={{
                            marginLeft: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2.5,
                            borderRadius: 6,
                            backgroundColor: theme.colors.primary + '20',
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" style={{ color: theme.colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }}>
                            {t('primaryBadge')}
                          </Typography>
                        </View>
                      )}
                    </View>

                    <Typography variant="caption" numberOfLines={1} color={theme.colors.textSecondary} style={{ fontSize: 12, fontWeight: '500', marginLeft: 42 }}>
                      {regionName || `${loc.lat.toFixed(2)}°, ${loc.lon.toFixed(2)}°`}
                    </Typography>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {!loc.isDefault && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleSetPrimary(loc);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 8,
                          backgroundColor: theme.colors.surfaceSecondary,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                        }}
                      >
                        <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 11 }}>
                          {t('setAsPrimary')}
                        </Typography>
                      </TouchableOpacity>
                    )}

                    {locations.length > 1 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDelete(loc);
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: theme.colors.surfaceSecondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="trash" size={15} color={theme.colors.error} />
                      </TouchableOpacity>
                    )}

                    <Icon name="chevron-right" size={14} color={theme.colors.textSecondary} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
