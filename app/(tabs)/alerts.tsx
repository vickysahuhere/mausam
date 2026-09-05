import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocationStore } from '../../store/useLocationStore';
import { getAlertsForLocation, AlertFeedResult, AlertSeverity } from '../../lib/alertService';

export default function Alerts() {
  const theme = useTheme();
  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const [activeLocId, setActiveLocId] = useState<string | null>(null);
  const [feedResult, setFeedResult] = useState<AlertFeedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const selectedLoc = locations.find((l) => l.id === (activeLocId || defaultLoc?.id)) || defaultLoc;

  useEffect(() => {
    let cancelled = false;
    if (!selectedLoc) {
      return;
    }

    const loadAlerts = async () => {
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
        return '#D97706'; // Amber
      case 'advisory':
      default:
        return theme.colors.primary;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.m }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.m }}>
          <View style={{ flex: 1 }}>
            <Typography variant="h1" style={{ fontWeight: '800' }}>
              Weather Alerts
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
              Official meteorological bulletins &bull; Ministry of Earth Sciences / IMD
            </Typography>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            style={{
              padding: 8,
              borderRadius: theme.shapes.borderRadius.s,
              backgroundColor: theme.colors.surfaceSecondary,
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
                      color={isSelected ? '#FFFFFF' : theme.colors.text}
                      style={{ fontWeight: isSelected ? '700' : '500' }}
                    >
                      {loc.label.split(',')[0]}
                      {loc.isDefault ? ' (Primary)' : ''}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Active Location Display */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m }}>
          <Icon name="map-pin" size={14} color={theme.colors.primary} />
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '700', marginLeft: 4 }}>
            MONITORING: {selectedLoc?.label || 'Default Location'}
          </Typography>
        </View>

        {/* Loading State */}
        {loading && (
          <Card style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
              Fetching latest meteorological bulletins...
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
        {!loading && feedResult?.status === 'clear' && (
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
            <Typography variant="h3" style={{ fontWeight: '700' }}>
              No Active Severe Warnings
            </Typography>
            <Typography variant="bodyMedium" color={theme.colors.textSecondary} align="center" style={{ marginTop: 6, lineHeight: 20 }}>
              Atmospheric conditions for {selectedLoc?.label || 'your locality'} are within normal parameters. Mausam continuously monitors IMD nowcasts and live regional radar feeds.
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
              Last checked: {feedResult.lastUpdated}
            </Typography>
          </Card>
        )}

        {/* Active Alerts List */}
        {!loading && feedResult?.status === 'active' && feedResult.alerts.map((alert) => {
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

              <Typography variant="h3" style={{ fontWeight: '800', marginBottom: 4 }}>
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
                    PRECAUTIONS & ADVISORY:
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

