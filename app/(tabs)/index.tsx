import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { GridRenderer } from '../../components/widgets/GridRenderer';
import { MainWeatherHero } from '../../components/home/MainWeatherHero';
import { WidgetLibrarySheet } from '../../components/home/WidgetLibrarySheet';
import { ThemeSelector } from '../../components/home/ThemeSelector';
import { RadarMapModal } from '../../components/map/RadarMapModal';
import { WeatherAtmosphere } from '../../components/ui/WeatherAtmosphere';
import { useAuthStore } from '../../store/useAuthStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useTheme } from '../../theme/ThemeProvider';
import { useWidgetData } from '../../components/widgets/useWidgetData';
import { getAlertsForLocation, WeatherAlert } from '../../lib/alertService';
import { processSevereAlerts } from '../../lib/notificationService';
import { companionEvents } from '../../lib/companion/companionEvents';
import { useCompanionStore } from '../../store/useCompanionStore';

export default function Home() {
  const router = useRouter();
  const personaVector = useAuthStore((state) => state.personaVector);
  const { initializeForUser } = useLayoutStore();
  const theme = useTheme();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);

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

  // Notify companion of app entry and screen focus
  useEffect(() => {
    companionEvents.emit('app_opened', undefined);
    companionEvents.emit('screen_focused', { screenName: 'home' });
  }, []);

  // Alert companion of severe weather conditions
  useEffect(() => {
    if (severeAlert) {
      companionEvents.emit('severe_alert_triggered', {
        title: severeAlert.title,
        severity: (severeAlert.severity as any) || 'orange',
      });
    }
  }, [severeAlert]);

  const handleManualRefresh = async () => {
    useCompanionStore.getState().incrementRefreshCount();
    companionEvents.emit('weather_refresh_started', undefined);
    try {
      await refresh();
      companionEvents.emit('weather_refresh_success', {});
    } catch {
      companionEvents.emit('weather_refresh_failed', {});
    }
  };

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

              <Typography
                variant="caption"
                color={theme.colors.textSecondary}
                numberOfLines={1}
                style={{ marginTop: 2, fontWeight: '600', flexShrink: 1 }}
              >
                {isCustomizing ? t('customizingDesc') : new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </Typography>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
              {!isCustomizing && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setRadarVisible(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.surfaceSecondary,
                    marginRight: 8,
                  }}
                  accessibilityLabel={t('radarMap')}
                >
                  <Icon name="radar" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}

              {isCustomizing ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsCustomizing(false)}
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  <Typography variant="caption" color={theme.colors.onPrimary || '#fff'} style={{ fontWeight: '800', fontSize: 12 }}>
                    {t('done')}
                  </Typography>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setIsCustomizing(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.surfaceSecondary,
                  }}
                  accessibilityLabel={t('customize')}
                >
                  <Icon name="sliders" size={16} color={theme.colors.primary} />
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
            <TouchableOpacity onPress={handleManualRefresh} style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
              <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 11 }}>
                {t('refresh')}
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Severe Alert Banner */}
        {!isCustomizing && severeAlert && (() => {
          const isRed = severeAlert.severity === 'red';
          const bannerBg = isRed ? (theme.colors.errorBg || '#FEE2E2') : (theme.colors.warningBg || '#FEF3C7');
          const bannerBorder = isRed ? theme.colors.error : theme.colors.warning;
          const bannerText = isRed ? theme.colors.error : theme.colors.warning;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/alerts')}
              style={{
                marginHorizontal: theme.spacing.m,
                marginTop: 4,
                marginBottom: 8,
                padding: 10,
                borderRadius: theme.shapes.borderRadius.m,
                backgroundColor: bannerBg,
                borderColor: bannerBorder,
                borderWidth: 1.5,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                <Icon name="alert-triangle" size={18} color={bannerBorder} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Typography variant="caption" numberOfLines={1} style={{ fontWeight: '800', color: bannerText }}>
                    {severeAlert.title}
                  </Typography>
                  <Typography variant="caption" numberOfLines={1} style={{ color: bannerText, fontSize: 11, marginTop: 1, opacity: 0.9 }}>
                    {severeAlert.validUntil} &bull; {t('tapToViewAdvisory')}
                  </Typography>
                </View>
              </View>
              <Icon name="chevron-right" size={14} color={bannerBorder} />
            </TouchableOpacity>
          );
        })()}

        {/* Dynamic Widget Grid with unified scrolling */}
        <GridRenderer
          isCustomizing={isCustomizing}
          headerComponent={
            <View style={{ marginBottom: 0 }}>
              {/* The ONE Main Weather Hero */}
              <MainWeatherHero
                locationName={defaultLoc?.label || t('selectPrimaryLocation')}
                onPressLocation={() => router.push('/locations')}
              />

              {/* Theme Picker and Add Widget drawer in Customization Mode */}
              {isCustomizing && (
                <View
                  style={{
                    marginBottom: 12,
                    padding: theme.spacing.m,
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.shapes.borderRadius.m,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <ThemeSelector />
                  <Button
                    title={t('addWidgetFromLibrary')}
                    variant="outline"
                    onPress={() => setLibraryVisible(true)}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 12,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: theme.colors.border,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={theme.colors.textSecondary}
                      style={{ fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', fontSize: 11 }}
                    >
                      {t('customizableWidgets')}
                    </Typography>
                    <TouchableOpacity onPress={() => setLibraryVisible(true)}>
                      <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                        {t('addMore')}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          }
        />

        {/* Full Widget Library Modal */}
        <WidgetLibrarySheet visible={libraryVisible} onClose={() => setLibraryVisible(false)} />

        {/* Fullscreen Interactive Weather Radar Modal */}
        <RadarMapModal
          visible={radarVisible}
          onClose={() => setRadarVisible(false)}
          initialLat={defaultLoc?.lat ?? 28.6139}
          initialLon={defaultLoc?.lon ?? 77.2090}
          locationName={defaultLoc?.label ?? t('appName')}
        />
      </WeatherAtmosphere>
    </SafeAreaView>
  );
}

