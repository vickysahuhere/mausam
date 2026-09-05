import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocationStore } from '../../store/useLocationStore';

export default function Alerts() {
  const theme = useTheme();
  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const mockAlerts = [
    {
      id: 'alert-1',
      severity: 'moderate',
      title: 'Thunderstorm & Gusty Winds Advisory',
      district: defaultLoc ? defaultLoc.label : 'Delhi NCR',
      agency: 'IMD Regional Meteorological Centre',
      time: 'Valid until 11:30 PM today',
      description:
        'Scattered thunderstorm with surface wind speeds reaching 35-45 km/h likely to occur. Travelers and commuters advised to exercise caution.',
    },
    {
      id: 'alert-2',
      severity: 'advisory',
      title: 'Elevated Air Pollution Notice',
      district: defaultLoc ? defaultLoc.label : 'Delhi NCR',
      agency: 'CPCB / IMD Air Quality Cell',
      time: 'Seasonal Advisory',
      description:
        'Stagnant morning surface winds causing localized accumulation of PM2.5 particulate matter. Sensitive groups should minimize intense morning outdoor workouts.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.m }}>
        <View style={{ marginBottom: theme.spacing.m }}>
          <Typography variant="h1" style={{ fontWeight: '800' }}>
            Weather Alerts
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 2 }}>
            Official bulletins from IMD &bull; Ministry of Earth Sciences
          </Typography>
        </View>

        {mockAlerts.map((alert) => (
          <Card
            key={alert.id}
            style={{
              marginBottom: theme.spacing.m,
              padding: theme.spacing.m,
              borderLeftWidth: 4,
              borderLeftColor: alert.severity === 'moderate' ? theme.colors.warning : theme.colors.primary,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Icon
                name="alert-triangle"
                size={16}
                color={alert.severity === 'moderate' ? theme.colors.warning : theme.colors.primary}
              />
              <Typography
                variant="caption"
                color={alert.severity === 'moderate' ? theme.colors.warning : theme.colors.primary}
                style={{ fontWeight: '700', marginLeft: 6, textTransform: 'uppercase' }}
              >
                {alert.agency}
              </Typography>
            </View>

            <Typography variant="h3" style={{ fontWeight: '700', marginBottom: 4 }}>
              {alert.title}
            </Typography>

            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', marginBottom: 6 }}>
              {alert.district} &bull; {alert.time}
            </Typography>

            <Typography variant="bodyMedium" style={{ fontSize: 13, lineHeight: 18 }}>
              {alert.description}
            </Typography>
          </Card>
        ))}

        <Card style={{ padding: theme.spacing.m, backgroundColor: theme.colors.surfaceSecondary, borderWidth: 0 }}>
          <Typography variant="caption" color={theme.colors.textSecondary} align="center">
            Mausam automatically refreshes district alert bulletins when new IMD nowcasts are issued.
          </Typography>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
