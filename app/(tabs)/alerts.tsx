import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocationStore } from '../../store/useLocationStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { WeatherAtmosphere } from '../../components/ui/WeatherAtmosphere';
import { getAlertsForLocation, AlertFeedResult, AlertSeverity } from '../../lib/alertService';

export default function Alerts() {
  const theme = useTheme();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);
  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const [activeLocId, setActiveLocId] = useState<string | null>(null);
  const [feedResult, setFeedResult] = useState<AlertFeedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'red' | 'orange' | 'yellow'>('all');

  const selectedLoc = locations.find((l) => l.id === (activeLocId || defaultLoc?.id)) || defaultLoc;

  useEffect(() => {
    let cancelled = false;
    if (!selectedLoc) {
      return;
    }

    const loadAlerts = async () => {
      setLoading(true);
      try {
        const res = await getAlertsForLocation(selectedLoc.lat, selectedLoc.lon, selectedLoc.label);
        if (cancelled) return;
        setFeedResult(res);
      } catch {
        if (cancelled) return;
        setFeedResult({
          alerts: [],
          status: 'error',
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: 'Unable to connect to alert bulletin service.',
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, [selectedLoc]);

  const onRefresh = async () => {
    if (!selectedLoc) return;
    setRefreshing(true);
    try {
      const res = await getAlertsForLocation(selectedLoc.lat, selectedLoc.lon, selectedLoc.label);
      setFeedResult(res);
    } catch {
      setFeedResult({
        alerts: [],
        status: 'error',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: 'Unable to connect to alert bulletin service.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case 'red':
        return theme.colors.error;
      case 'orange':
        return theme.colors.warning;
      case 'yellow':
        return '#D97706';
      case 'advisory':
      default:
        return theme.colors.primary;
    }
  };

  const filteredAlerts = feedResult?.alerts.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  }) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <WeatherAtmosphere weatherType="clouds" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.m }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.m }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Typography variant="h2" style={{ fontWeight: '800', letterSpacing: -0.5 }}>
              {t('alertsHeader')}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
              {t('imdSource')}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            style={{
              padding: 8,
              borderRadius: theme.shapes.borderRadius.s,
              backgroundColor: theme.colors.surfaceSecondary,
              flexShrink: 0,
            }}
          >
            <Icon name="refresh" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Multi-Location Switcher Chips if user has multiple locations */}
        {locations.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.m }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {locations.map((loc) => {
                const isSelected = loc.id === selectedLoc?.id;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => setActiveLocId(loc.id)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: theme.shapes.borderRadius.pill,
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                    }}
                  >
                    <Typography
                      variant="caption"
                      numberOfLines={1}
                      color={isSelected ? '#FFFFFF' : theme.colors.text}
                      style={{ fontWeight: isSelected ? '700' : '500' }}
                    >
                      {loc.label.split(',')[0]}
                      {loc.isDefault ? ` (${t('primaryBadge')})` : ''}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Severity Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: theme.spacing.m }}>
          {(['all', 'red', 'orange', 'yellow'] as const).map((filterKey) => {
            const isSelected = severityFilter === filterKey;
            const label =
              filterKey === 'all'
                ? t('allAlerts')
                : filterKey === 'red'
                ? t('redAlert')
                : filterKey === 'orange'
                ? t('orangeAlert')
                : t('yellowAlert');
            return (
              <TouchableOpacity
                key={filterKey}
                onPress={() => setSeverityFilter(filterKey)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceSecondary,
                }}
              >
                <Typography
                  variant="caption"
                  numberOfLines={1}
                  style={{
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: 10,
                  }}
                >
                  {label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Location Display */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m }}>
          <Icon name="map-pin" size={14} color={theme.colors.primary} />
          <Typography variant="caption" numberOfLines={1} color={theme.colors.textSecondary} style={{ fontWeight: '700', marginLeft: 4, flexShrink: 1 }}>
            {selectedLoc?.label || 'Default Location'}
          </Typography>
        </View>

        {/* Loading State */}
        {loading && (
          <Card style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
              {t('bulletinStatus')}...
            </Typography>
          </Card>
        )}

        {/* Error State */}
        {!loading && feedResult?.status === 'error' && (
          <Card style={{ padding: theme.spacing.l, borderColor: theme.colors.error, borderWidth: 1, alignItems: 'center' }}>
            <Icon name="alert-triangle" size={32} color={theme.colors.error} />
            <Typography variant="h3" color={theme.colors.error} style={{ fontWeight: '700', marginTop: 8 }}>
              Unable to Load Bulletins
            </Typography>
            <Typography variant="bodyMedium" color={theme.colors.textSecondary} align="center" style={{ marginTop: 4 }}>
              {feedResult.error || 'Check network connection and retry.'}
            </Typography>
            <Button title="Retry Now" variant="outline" onPress={onRefresh} style={{ marginTop: 12 }} />
          </Card>
        )}

        {/* Clear State (No Active Alerts) */}
        {!loading && (feedResult?.status === 'clear' || filteredAlerts.length === 0) && (
          <Card style={{ padding: theme.spacing.l, alignItems: 'center', marginBottom: theme.spacing.m }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Icon name="sun" size={24} color={theme.colors.primary} />
            </View>
            <Typography variant="h3" style={{ fontWeight: '700', textAlign: 'center' }}>
              {t('noActiveAlerts')}
            </Typography>
            <Typography variant="bodyMedium" color={theme.colors.textSecondary} align="center" style={{ marginTop: 6, lineHeight: 20 }}>
              {t('noAlertsDesc')}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
              Last checked: {feedResult?.lastUpdated || new Date().toLocaleTimeString()}
            </Typography>
          </Card>
        )}

        {/* Active Alerts List */}
        {!loading && feedResult?.status === 'active' && filteredAlerts.map((alert) => {
          const sevColor = getSeverityColor(alert.severity);
          return (
            <Card
              key={alert.id}
              style={{
                marginBottom: theme.spacing.m,
                padding: theme.spacing.m,
                borderLeftWidth: 5,
                borderLeftColor: sevColor,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="alert-triangle" size={16} color={sevColor} />
                  <Typography
                    variant="caption"
                    color={sevColor}
                    style={{ fontWeight: '800', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    {alert.severity} &bull; {alert.agency}
                  </Typography>
                </View>
              </View>

              <Typography variant="h3" numberOfLines={2} style={{ fontWeight: '800', marginBottom: 4 }}>
                {alert.title}
              </Typography>

              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 8 }}>
                {alert.district} &bull; {alert.validUntil}
              </Typography>

              <Typography variant="bodyMedium" style={{ fontSize: 13, lineHeight: 19, marginBottom: 8 }}>
                {alert.description}
              </Typography>

              {alert.instructions ? (
                <View
                  style={{
                    marginTop: 4,
                    padding: 8,
                    borderRadius: theme.shapes.borderRadius.s,
                    backgroundColor: theme.colors.surfaceSecondary,
                  }}
                >
                  <Typography variant="caption" style={{ fontWeight: '700', marginBottom: 2 }}>
                    {t('safetyInstructions')}:
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textSecondary} style={{ lineHeight: 16 }}>
                    {alert.instructions}
                  </Typography>
                </View>
              ) : null}
            </Card>
          );
        })}

        {/* Informational Footer */}
        <Card style={{ padding: theme.spacing.m, backgroundColor: theme.colors.surfaceSecondary, borderWidth: 0, marginTop: theme.spacing.s }}>
          <Typography variant="caption" color={theme.colors.textSecondary} align="center">
            Alert bulletins update dynamically as atmospheric and radar nowcasts evolve. Severe weather prompts instant high-priority warnings on your home dashboard.
          </Typography>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
