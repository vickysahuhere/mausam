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
import { RadarMapModal } from '../../components/map/RadarMapModal';
import { WeatherAtmosphere } from '../../components/ui/WeatherAtmosphere';
import { useAuthStore } from '../../store/useAuthStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useAnimationStore } from '../../store/useAnimationStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useTheme } from '../../theme/ThemeProvider';
import { useWidgetData } from '../../components/widgets/useWidgetData';
import { getAlertsForLocation, WeatherAlert } from '../../lib/alertService';
import { processSevereAlerts } from '../../lib/notificationService';

export default function Home() {
  const router = useRouter();
  const personaVector = useAuthStore((state) => state.personaVector);
  const { initializeForUser } = useLayoutStore();
  const theme = useTheme();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);
  const { animationsEnabled, toggleAnimations } = useAnimationStore();

  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [libraryVisible, setLibraryVisible] = useState(false);
  const [radarVisible, setRadarVisible] = useState(false);
  const [severeAlert, setSevereAlert] = useState<WeatherAlert | null>(null);

  // SWR status for homepage
  const { isStale, isOffline, refresh } = useWidgetData('current_summary');

  useEffect(() => {
    initializeForUser(personaVector);
  }, [personaVector, initializeForUser]);

  // Check for severe weather alerts on primary location
  useEffect(() => {
    let cancelled = false;
    if (!defaultLoc) {
      return;
    }
    getAlertsForLocation(defaultLoc.lat, defaultLoc.lon, defaultLoc.label)
      .then((res) => {
        if (cancelled) return;
        const severe = res.alerts.find((a) => a.severity === 'red' || a.severity === 'orange');
        setSevereAlert(severe || null);
        if (res.alerts.length > 0) {
          processSevereAlerts(res.alerts);
        }
      })
      .catch(() => {
        if (!cancelled) setSevereAlert(null);
      });

    return () => {
      cancelled = true;
    };
  }, [defaultLoc]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <WeatherAtmosphere>
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
            <View style={{ flex: 1, flexShrink: 1, minWidth: 0, marginRight: 10 }}>
              <Typography variant="h2" numberOfLines={1} style={{ fontWeight: '800', letterSpacing: -0.5 }}>
                {isCustomizing ? t('customizingLayout') : t('appName')}
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
                    numberOfLines={1}
                    style={{ marginLeft: 4, fontWeight: '600', flexShrink: 1 }}
                  >
                    {defaultLoc?.label || t('selectPrimaryLocation')}
                  </Typography>
                  <View style={{ marginLeft: 4 }}>
                    <Icon name="chevron-right" size={11} color={theme.colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
              {!isCustomizing && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={toggleAnimations}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: theme.shapes.borderRadius.s,
                    backgroundColor: animationsEnabled ? theme.colors.surfaceSecondary : theme.colors.border,
                    marginRight: 8,
                  }}
                >
                  <Icon name={animationsEnabled ? 'pause' : 'play'} size={12} color={theme.colors.primary} />
                  <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4, fontWeight: '700' }}>
                    {animationsEnabled ? t('motion') : t('static')}
                  </Typography>
                </TouchableOpacity>
              )}

              {isCustomizing ? (
                <Button
                  title={t('done')}
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
                    {t('customize')}
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isCustomizing && (
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              {t('customizingDesc')}
            </Typography>
          )}
        </View>

        {/* Offline / Stale Status Indicator */}
        {!isCustomizing && (isOffline || isStale) && (
          <View
            style={{
              marginHorizontal: theme.spacing.m,
              marginTop: 4,
              marginBottom: 6,
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: theme.shapes.borderRadius.s,
              backgroundColor: theme.colors.surfaceSecondary,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexShrink: 1 }}>
              <Icon name="cloud" size={13} color={theme.colors.textSecondary} />
              <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginLeft: 6, fontWeight: '600', fontSize: 11, flexShrink: 1 }}>
                {isOffline ? t('offlineBanner') : t('revalidatingBanner')}
              </Typography>
            </View>
            <TouchableOpacity onPress={refresh} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 11 }}>
                {t('refresh')}
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Severe Alert Banner */}
        {!isCustomizing && severeAlert && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/alerts')}
            style={{
              marginHorizontal: theme.spacing.m,
              marginTop: 4,
              marginBottom: 8,
              padding: 10,
              borderRadius: theme.shapes.borderRadius.m,
              backgroundColor: severeAlert.severity === 'red' ? '#FEE2E2' : '#FEF3C7',
              borderColor: severeAlert.severity === 'red' ? '#EF4444' : '#F59E0B',
              borderWidth: 1.5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
              <Icon name="alert-triangle" size={18} color={severeAlert.severity === 'red' ? '#DC2626' : '#D97706'} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Typography variant="caption" numberOfLines={1} style={{ fontWeight: '800', color: severeAlert.severity === 'red' ? '#991B1B' : '#92400E' }}>
                  {severeAlert.title}
                </Typography>
                <Typography variant="caption" numberOfLines={1} style={{ color: severeAlert.severity === 'red' ? '#B91C1C' : '#B45309', fontSize: 11, marginTop: 1 }}>
                  {severeAlert.validUntil} &bull; {t('tapToViewAdvisory')}
                </Typography>
              </View>
            </View>
            <Icon name="chevron-right" size={14} color={severeAlert.severity === 'red' ? '#DC2626' : '#D97706'} />
          </TouchableOpacity>
        )}

        {/* Interactive Live Radar & Satellite Map Card */}
        {!isCustomizing && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setRadarVisible(true)}
            style={{
              marginHorizontal: theme.spacing.m,
              marginTop: 2,
              marginBottom: 8,
              padding: 12,
              borderRadius: theme.shapes.borderRadius.m,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: 8 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: theme.colors.surfaceSecondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                  flexShrink: 0,
                }}
              >
                <Icon name="radar" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Typography variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '700' }}>
                  {t('radarCardTitle')}
                </Typography>
                <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginTop: 2 }}>
                  {t('radarCardSubtitle')}
                </Typography>
              </View>
            </View>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: theme.colors.primary,
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" numberOfLines={1} color="#fff" style={{ fontWeight: '700', fontSize: 11 }}>
                {t('viewRadar')}
              </Typography>
            </View>
          </TouchableOpacity>
        )}

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

        {/* Fullscreen Interactive Weather Radar Modal */}
        <RadarMapModal
          visible={radarVisible}
          onClose={() => setRadarVisible(false)}
          initialLat={defaultLoc?.lat ?? 28.6139}
          initialLon={defaultLoc?.lon ?? 77.2090}
          locationName={defaultLoc?.label ?? 'India'}
        />
      </WeatherAtmosphere>
    </SafeAreaView>
  );
}

