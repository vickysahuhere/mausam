import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography } from '../ui/Typography';
import { Icon, IconName } from '../ui/Icon';
import { Card } from '../ui/Card';
import { useTheme } from '../../theme/ThemeProvider';
import { useWidgetData } from '../widgets/useWidgetData';
import { CurrentSummaryData, AqiData } from '../../lib/weatherService';
import { useLocaleStore } from '../../store/useLocaleStore';

interface Props {
  locationName: string;
  onPressLocation?: () => void;
}

export function MainWeatherHero({ locationName, onPressLocation }: Props) {
  const theme = useTheme();
  const t = useLocaleStore((state) => state.t);
  const { data: weather, loading, error, refresh } = useWidgetData<CurrentSummaryData>('current_summary');
  const { data: aqi } = useWidgetData<AqiData>('aqi_card');

  if (loading && !weather) {
    return (
      <Card
        style={{
          marginHorizontal: 0,
          marginVertical: theme.spacing.s,
          padding: theme.spacing.l,
          minHeight: 160,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 10, fontWeight: '600' }}>
          {t('loadingLiveWeather')} {locationName}...
        </Typography>
      </Card>
    );
  }

  if (error && !weather) {
    return (
      <Card
        style={{
          marginHorizontal: 0,
          marginVertical: theme.spacing.s,
          padding: theme.spacing.m,
        }}
      >
        <Typography variant="bodyMedium" color={theme.colors.error} style={{ fontWeight: '700' }}>
          {t('unableToFetchWeather')}
        </Typography>
        <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          {error}
        </Typography>
        <TouchableOpacity
          onPress={refresh}
          style={{
            marginTop: 10,
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.primary,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: theme.shapes.borderRadius.s,
          }}
        >
          <Typography variant="caption" color={theme.colors.onPrimary || '#fff'} style={{ fontWeight: '700' }}>
            {t('refresh')}
          </Typography>
        </TouchableOpacity>
      </Card>
    );
  }

  const icon = (weather?.iconName || 'sun') as IconName;
  const temp = weather?.temp ?? '--';
  const high = weather?.high ?? '--';
  const low = weather?.low ?? '--';
  const feelsLike = weather?.feelsLike ?? '--';
  const desc = weather?.desc ?? 'Clear Sky';
  const humidity = weather?.humidity ?? 0;
  const windSpeed = weather?.windSpeed ?? 0;
  const windDir = weather?.windDirection ?? '';

  const aqiIsWarning = aqi && aqi.aqi > 100;
  const aqiBg = aqiIsWarning ? (theme.colors.errorBg || '#EF444420') : (theme.colors.successBg || '#10B98120');
  const aqiTextColor = aqiIsWarning ? theme.colors.error : theme.colors.success;

  return (
    <Card
      style={{
        marginHorizontal: 0,
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.m,
        padding: theme.spacing.l,
        borderRadius: theme.shapes.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.isDark ? theme.colors.border : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: theme.artDirection?.cardStyle === 'glass' ? 0 : 3,
      }}
    >
      {/* Top Bar: Location Label & Live Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressLocation}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: theme.colors.surfaceSecondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 6,
            }}
          >
            <Icon name="map-pin" size={13} color={theme.colors.primary} />
          </View>
          <Typography variant="h3" numberOfLines={1} style={{ fontWeight: '800', flexShrink: 1 }}>
            {locationName}
          </Typography>
          <View style={{ marginLeft: 4 }}>
            <Icon name="chevron-right" size={13} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            backgroundColor: theme.colors.surfaceSecondary,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.success,
              marginRight: 5,
            }}
          />
          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '700', fontSize: 10 }}>
            {t('liveBadge')}
          </Typography>
        </View>
      </View>

      {/* Main Temperature & Condition Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Typography variant="h1" style={{ fontSize: 56, fontWeight: '800', lineHeight: 62, letterSpacing: -1 }}>
              {temp}
            </Typography>
            <Typography variant="h2" color={theme.colors.primary} style={{ fontSize: 28, marginTop: 4, fontWeight: '600' }}>
              °C
            </Typography>
          </View>

          <Typography variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '700', marginTop: 2 }}>
            {desc}
          </Typography>

          <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4, fontWeight: '600' }}>
            {t('highShort')}: {high}° &bull; {t('lowShort')}: {low}° &bull; {t('feelsLike')} {feelsLike}°C
          </Typography>
        </View>

        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={44} color={theme.colors.primary} />
        </View>
      </View>

      {/* Atmospheric Quick Telemetry Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing.m,
          paddingTop: theme.spacing.m,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 }}>
          <Icon name="droplet" size={14} color={theme.colors.primary} />
          <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginLeft: 5, fontWeight: '600' }}>
            {humidity}% {t('humidityLabel')}
          </Typography>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 }}>
          <Icon name="wind" size={14} color={theme.colors.primary} />
          <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginLeft: 5, fontWeight: '600' }}>
            {windSpeed} km/h {windDir}
          </Typography>
        </View>

        {aqi && (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: aqiBg,
            }}
          >
            <Typography
              variant="caption"
              color={aqiTextColor}
              style={{ fontWeight: '700', fontSize: 11 }}
            >
              {t('aqiLabel')} {aqi.aqi}
            </Typography>
          </View>
        )}
      </View>
    </Card>
  );
}
