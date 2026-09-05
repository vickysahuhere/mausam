import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { GridRenderer } from '../../components/widgets/GridRenderer';
import { WidgetLibrarySheet } from '../../components/home/WidgetLibrarySheet';
import { ThemeSelector } from '../../components/home/ThemeSelector';
import { useAuthStore } from '../../store/useAuthStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';

export default function Home() {
  const router = useRouter();
  const personaVector = useAuthStore((state) => state.personaVector);
  const { initializeForUser } = useLayoutStore();
  const theme = useTheme();

  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [libraryVisible, setLibraryVisible] = useState(false);

  useEffect(() => {
    initializeForUser(personaVector);
  }, [personaVector, initializeForUser]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Clean Homepage Header with Hierarchy */}
      <View
        style={{
          paddingHorizontal: theme.spacing.m,
          paddingTop: theme.spacing.m,
          paddingBottom: theme.spacing.s,
          borderBottomWidth: isCustomizing ? 1 : 0,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Typography variant="h2" style={{ fontWeight: '800', letterSpacing: -0.5 }}>
              {isCustomizing ? 'Customizing Layout' : 'Mausam'}
            </Typography>

            {!isCustomizing && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/locations')}
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}
              >
                <Icon name="map-pin" size={13} color={theme.colors.primary} />
                <Typography
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ marginLeft: 4, fontWeight: '600' }}
                >
                  {defaultLoc?.label || 'Select Primary Location'}
                </Typography>
                <View style={{ marginLeft: 4 }}>
                  <Icon name="chevron-right" size={11} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {isCustomizing ? (
            <Button
              title="Done"
              variant="primary"
              onPress={() => setIsCustomizing(false)}
              style={{ paddingVertical: 6, paddingHorizontal: 16 }}
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setIsCustomizing(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: theme.shapes.borderRadius.s,
                backgroundColor: theme.colors.surfaceSecondary,
              }}
            >
              <Icon name="sliders" size={14} color={theme.colors.primary} />
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                Customize
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        {isCustomizing && (
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
            Reorder cards, remove cards, or switch themes. Changes save immediately.
          </Typography>
        )}
      </View>

      {/* Theme Picker and Add Widget drawer in Customization Mode */}
      {isCustomizing && (
        <View
          style={{
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <ThemeSelector />
          <Button
            title="+ Add Widget from Library"
            variant="outline"
            onPress={() => setLibraryVisible(true)}
          />
        </View>
      )}

      {/* Dynamic Widget Grid */}
      <GridRenderer isCustomizing={isCustomizing} />

      {/* Full Widget Library Modal */}
      <WidgetLibrarySheet visible={libraryVisible} onClose={() => setLibraryVisible(false)} />
    </SafeAreaView>
  );
}
