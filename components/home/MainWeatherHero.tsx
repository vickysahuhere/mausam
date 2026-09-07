import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Typography } from '../ui/Typography';
import { Icon, IconName } from '../ui/Icon';
import { Card } from '../ui/Card';
import { CompanionPerch } from '../companion/CompanionPerch';
import { companionEvents } from '../../lib/companion/companionEvents';
import { useCompanionStore } from '../../store/useCompanionStore';
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

  // Apple-grade organic physics animations (React 19 safe)
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [haloAnim] = useState(() => new Animated.Value(1));
  const [haloOpacity] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    // Gentle floating hover animation for the weather centerpiece
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous pulsing halo for live telemetry badge
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(haloAnim, {
            toValue: 2.2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(haloAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(haloOpacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    floatLoop.start();
    pulseLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [floatAnim, haloAnim, haloOpacity]);

  // Synchronize companion with ambient weather & track transitions
  const prevWeatherRef = React.useRef<CurrentSummaryData | null>(null);

  useEffect(() => {
    if (weather) {
      const descLower = (weather.desc || '').toLowerCase();
      const isRain = descLower.includes('rain') || descLower.includes('drizzle') || descLower.includes('shower');
      const isThunder = descLower.includes('thunder') || descLower.includes('storm');
      useCompanionStore.getState().syncWithAmbientWeather(weather.temp, isRain, isThunder);

      // Check for weather transitions
      if (prevWeatherRef.current && prevWeatherRef.current.desc !== weather.desc) {
        companionEvents.emit('weather_transition', {
          fromCondition: prevWeatherRef.current.desc,
          toCondition: weather.desc,
          temp: weather.temp,
        });
      }
      prevWeatherRef.current = weather;
    }
  }, [weather]);

  if (loading && !weather) {
    return (
      <Card
        style={{
          marginHorizontal: 0,
          marginBottom: 12,
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
          marginBottom: 12,
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
        marginTop: 0,
        marginBottom: 12,
        padding: theme.spacing.l,
        borderRadius: theme.shapes.borderRadius.l,
      }}
    >
      {/* Top Header: Location Name & Live Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressLocation}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.surfaceSecondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Icon name="map-pin" size={14} color={theme.colors.primary} />
          </View>
          <Typography variant="h3" numberOfLines={1} style={{ fontWeight: '800', fontSize: 18, flexShrink: 1, letterSpacing: -0.3 }}>
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
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceSecondary,
          }}
        >
          {/* Animated Pulsing Halo Dot */}
          <View style={{ width: 10, height: 10, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
            <Animated.View
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.success,
                transform: [{ scale: haloAnim }],
                opacity: haloOpacity,
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.success,
              }}
            />
          </View>
          <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '800', fontSize: 11, letterSpacing: 0.5 }}>
            {t('liveBadge')}
          </Typography>
        </View>
      </View>

      {/* Main Temperature & Art Centerpiece */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          {/* Hero Temperature */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              useCompanionStore.getState().incrementTempTapCount();
              companionEvents.emit('temperature_card_tapped', {
                temp: typeof temp === 'number' ? temp : 26,
              });
            }}
            style={{ flexDirection: 'row', alignItems: 'flex-start' }}
          >
            <Typography
              variant="h1"
              style={{
                fontSize: 78,
                fontWeight: '700',
                lineHeight: 82,
                letterSpacing: -2.5,
                color: theme.colors.text,
              }}
            >
              {temp}
            </Typography>
            <Typography
              variant="h2"
              color={theme.colors.primary}
              style={{
                fontSize: 34,
                fontWeight: '400',
                marginTop: 6,
                marginLeft: 2,
              }}
            >
              °
            </Typography>
          </TouchableOpacity>

          {/* Condition Title */}
          <Typography
            variant="bodyMedium"
            numberOfLines={1}
            style={{
              fontWeight: '700',
              fontSize: 18,
              marginTop: 4,
              color: theme.colors.text,
              letterSpacing: -0.2,
            }}
          >
            {desc}
          </Typography>

          {/* High / Low Glass Pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: theme.artDirection?.cardStyle === 'flat2d' ? 4 : 10,
              borderWidth: theme.artDirection?.cardStyle === 'flat2d' ? 1.5 : 0,
              borderColor: '#264653',
              backgroundColor: theme.colors.surfaceSecondary,
            }}
          >
            <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '700', fontSize: 12 }}>
              H: {high}° &bull; L: {low}°
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '600', fontSize: 12, marginLeft: 6 }}>
              {t('feelsLike')} {feelsLike}°
            </Typography>
          </View>
        </View>

        {/* Hero Weather Icon Art with Subtle Floating Hover */}
        <Animated.View
          style={{
            width: 96,
            height: 96,
            borderRadius: theme.artDirection?.cardStyle === 'flat2d' ? 16 : 48,
            borderWidth: theme.artDirection?.cardStyle === 'flat2d' ? 2 : 0,
            borderColor: '#264653',
            backgroundColor: theme.colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.artDirection?.cardStyle === 'flat2d' ? '#264653' : theme.colors.primary,
            shadowOffset: theme.artDirection?.cardStyle === 'flat2d' ? { width: 3, height: 3 } : { width: 0, height: 8 },
            shadowOpacity: theme.artDirection?.cardStyle === 'flat2d' ? 1 : 0.15,
            shadowRadius: theme.artDirection?.cardStyle === 'flat2d' ? 0 : 16,
            elevation: 0,
            transform: [{ translateY: floatAnim }],
          }}
        >
          <Icon name={icon} size={54} color={theme.colors.primary} />
        </Animated.View>
      </View>

      {/* Atmospheric Micro-Telemetry Chips */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 18,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        {/* Humidity Chip */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: theme.colors.surfaceSecondary,
          }}
        >
          <Icon name="droplet" size={13} color={theme.colors.primary} />
          <Typography variant="caption" color={theme.colors.text} style={{ marginLeft: 5, fontWeight: '700', fontSize: 11 }}>
            {humidity}% <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '500', fontSize: 11 }}>{t('humidityLabel')}</Typography>
          </Typography>
        </View>

        {/* Wind Speed Chip */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: theme.colors.surfaceSecondary,
          }}
        >
          <Icon name="wind" size={13} color={theme.colors.primary} />
          <Typography variant="caption" color={theme.colors.text} style={{ marginLeft: 5, fontWeight: '700', fontSize: 11 }}>
            {windSpeed} km/h <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '500', fontSize: 11 }}>{windDir}</Typography>
          </Typography>
        </View>

        {/* AQI Pill */}
        {aqi && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10,
              backgroundColor: aqiBg,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: aqiTextColor,
                marginRight: 5,
              }}
            />
            <Typography variant="caption" color={aqiTextColor} style={{ fontWeight: '800', fontSize: 11 }}>
              {t('aqiLabel')} {aqi.aqi} &bull; {aqi.status}
            </Typography>
          </View>
        )}
      </View>

      {/* Living Mascot Companion Perch ("Mimi") */}
      <View style={{ marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <CompanionPerch />
      </View>
    </Card>
  );
}
