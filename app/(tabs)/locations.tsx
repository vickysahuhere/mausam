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
import { searchCities, GeocodedLocation } from '../../lib/citySearch';

export default function Locations() {
  const router = useRouter();
  const theme = useTheme();
  const { locations, setDefaultLocation, addLocation, removeLocation } = useLocationStore();

  const [showAddSearch, setShowAddSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
      Alert.alert('Location Already Saved', `"${item.displayName}" is already in your saved locations.`);
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
      'Delete Location',
      `Remove "${loc.label}" from your saved locations?`,
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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m }}>
          <View>
            <Typography variant="h1" style={{ fontWeight: '800' }}>
              Saved Locations
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
              Manage and switch active weather locations
            </Typography>
          </View>
          {!showAddSearch && (
            <Button
              title="+ Add Location"
              variant="outline"
              onPress={() => setShowAddSearch(true)}
              style={{ paddingVertical: 6, paddingHorizontal: 12 }}
            />
          )}
        </View>

        {showAddSearch ? (
          <Card style={{ marginBottom: theme.spacing.l, padding: theme.spacing.m }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.s }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderRadius: theme.shapes.borderRadius.s,
                  paddingHorizontal: 8,
                }}
              >
                <Icon name="search" size={16} color={theme.colors.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search locality, city, or state..."
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    color: theme.colors.text,
                    fontSize: 14,
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch('')} style={{ padding: 4 }}>
                    <Icon name="close" size={14} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowAddSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                }}
                style={{ marginLeft: 6, paddingHorizontal: 8 }}
              />
            </View>

            {searching && (
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginVertical: 6 }}>
                Searching localities and cities...
              </Typography>
            )}

            {!searching && hasSearched && searchResults.length === 0 && (
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginVertical: 8, fontStyle: 'italic' }}>
                No matching locations found. Try searching for a neighborhood, district, or city name.
              </Typography>
            )}

            {searchResults.map((item) => {
              const isAlreadySaved = locations.some(
                (l) => l.id === item.id || (Math.abs(l.lat - item.lat) < 0.005 && Math.abs(l.lon - item.lon) < 0.005)
              );
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelect(item)}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{item.name}</Typography>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      {[item.locality, item.city, item.state].filter(Boolean).join(', ')}
                    </Typography>
                  </View>
                  {isAlreadySaved ? (
                    <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                      Saved
                    </Typography>
                  ) : (
                    <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                      + Add
                    </Typography>
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>
        ) : null}

        {locations.length === 0 ? (
          <Card style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
            <Icon name="map-pin" size={40} color={theme.colors.textSecondary} />
            <Typography variant="h3" style={{ marginTop: 12, fontWeight: '700' }}>
              No Saved Locations
            </Typography>
            <Typography variant="bodyMedium" color={theme.colors.textSecondary} align="center" style={{ marginTop: 6 }}>
              Add localities or cities to switch between them and track localized forecasts.
            </Typography>
            <Button
              title="Add a Location"
              variant="primary"
              onPress={() => setShowAddSearch(true)}
              style={{ marginTop: 16 }}
            />
          </Card>
        ) : (
          locations.map((loc) => (
            <Card
              key={loc.id}
              style={{
                marginBottom: theme.spacing.m,
                padding: theme.spacing.m,
                borderColor: loc.isDefault ? theme.colors.primary : theme.colors.border,
                borderWidth: loc.isDefault ? 1.5 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ flex: 1, paddingRight: 10 }}
                  onPress={() => {
                    if (!loc.isDefault) {
                      handleSetPrimary(loc);
                    }
                    router.push('/(tabs)');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="map-pin" size={16} color={loc.isDefault ? theme.colors.primary : theme.colors.textSecondary} />
                    <Typography variant="bodyMedium" style={{ fontWeight: '700', marginLeft: 6, flex: 1 }}>
                      {loc.label}
                    </Typography>
                  </View>
                  <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4, marginLeft: 22 }}>
                    {loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E
                  </Typography>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {loc.isDefault ? (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: theme.shapes.borderRadius.s,
                        backgroundColor: theme.colors.surfaceSecondary,
                      }}
                    >
                      <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                        Active
                      </Typography>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleSetPrimary(loc)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: theme.shapes.borderRadius.s,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600' }}>
                        Set Primary
                      </Typography>
                    </TouchableOpacity>
                  )}

                  {/* Delete Action */}
                  <TouchableOpacity
                    onPress={() => handleDelete(loc)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      padding: 6,
                      borderRadius: theme.shapes.borderRadius.s,
                      backgroundColor: theme.colors.surfaceSecondary,
                    }}
                  >
                    <Icon name="close" size={14} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

