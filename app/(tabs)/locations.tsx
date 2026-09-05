import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { searchCities, GeocodedLocation } from '../../lib/citySearch';

export default function Locations() {
  const theme = useTheme();
  const { locations, setDefaultLocation, addLocation } = useLocationStore();

  const [showAddSearch, setShowAddSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const res = await searchCities(text);
    setSearchResults(res);
    setSearching(false);
  };

  const handleSelect = (item: GeocodedLocation) => {
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
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m }}>
          <Typography variant="h1" style={{ fontWeight: '800' }}>
            Saved Locations
          </Typography>
          {!showAddSearch && (
            <Button
              title="+ Add"
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
                  placeholder="Search locality or city..."
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
              </View>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowAddSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{ marginLeft: 6, paddingHorizontal: 8 }}
              />
            </View>

            {searching && (
              <Typography variant="caption" color={theme.colors.textSecondary}>Searching...</Typography>
            )}

            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSelect(item)}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{item.name}</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  {[item.locality, item.city, item.state].filter(Boolean).join(', ')}
                </Typography>
              </TouchableOpacity>
            ))}
          </Card>
        ) : null}

        {locations.length === 0 ? (
          <Card style={{ padding: theme.spacing.l, alignItems: 'center' }}>
            <Icon name="map-pin" size={32} color={theme.colors.textSecondary} />
            <Typography variant="bodyMedium" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>
              No locations saved yet.
            </Typography>
            <Button
              title="Add a Location"
              variant="secondary"
              onPress={() => setShowAddSearch(true)}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : (
          locations.map((loc) => (
            <Card key={loc.id} style={{ marginBottom: theme.spacing.m, padding: theme.spacing.m }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="map-pin" size={15} color={loc.isDefault ? theme.colors.primary : theme.colors.textSecondary} />
                    <Typography variant="bodyMedium" style={{ fontWeight: '700', marginLeft: 6 }}>
                      {loc.label}
                    </Typography>
                  </View>
                  <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4, marginLeft: 21 }}>
                    {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                  </Typography>
                </View>

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
                      Primary
                    </Typography>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setDefaultLocation(loc.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: theme.shapes.borderRadius.s,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      Set Primary
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
