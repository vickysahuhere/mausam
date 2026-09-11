import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Animated, AppState, AppStateStatus } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
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
import { useUnitStore } from '../../store/useUnitStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useAnimationStore } from '../../store/useAnimationStore';
import { calculateSolarTimes } from '../../lib/solarAlmanac';
import { haptics } from '../../lib/haptics';

interface Props {
  locationName: string;
  onPressLocation?: () => void;
}

export const MainWeatherHero = React.memo(function MainWeatherHero({ locationName, onPressLocation }: Props) {
  const theme = useTheme();
  const t = useLocaleStore((state) => state.t);
  const convertTemp = useUnitStore((state) => state.convertTemp);
  const formatWind = useUnitStore((state) => state.formatWind);
  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);

  const { data: weather, loading, error, refresh } = useWidgetData<CurrentSummaryData>('current_summary');
  const { data: aqi } = useWidgetData<AqiData>('aqi_card');
  const { data: uvData } = useWidgetData<any>('uv_index');
  const { data: rainData } = useWidgetData<any>('rain_timeline');

  const locations = useLocationStore((state) => state.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0];

  const solarTimes = useMemo(() => {
    if (!defaultLoc) return null;
    try {
      return calculateSolarTimes(defaultLoc.lat, defaultLoc.lon);
    } catch {
      return null;
    }
  }, [defaultLoc]);

  const ambianceGlowColor = useMemo(() => {
    return theme.colors.glow || theme.colors.primary;
  }, [theme.colors]);

  const daylightChipLabel = useMemo(() => {
    if (!solarTimes) return null;
    const now = new Date();
    if (solarTimes.isDaylight) {
      const msLeft = solarTimes.sunset.getTime() - now.getTime();
      if (msLeft <= 0) return 'Dusk approaching';
      const h = Math.floor(msLeft / 3600000);
      const m = Math.floor((msLeft % 3600000) / 60000);
      return `${h}h ${m}m light`;
    } else {
      const riseHours = solarTimes.sunrise.getHours().toString().padStart(2, '0');
      const riseMins = solarTimes.sunrise.getMinutes().toString().padStart(2, '0');
      return `Dawn at ${riseHours}:${riseMins}`;
    }
  }, [solarTimes]);

  // Lean animated values initialized via ref (zero re-render allocations)
  const floatAnim = useRef(new Animated.Value(0)).current;
  const haloAnim = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.8)).current;

  // AppState awareness for battery and CPU preservation
  const [isAppActive, setIsAppActive] = useState(() => AppState.currentState === 'active');

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      setIsAppActive(state === 'active');
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!animationsEnabled || !isAppActive) {
      floatAnim.setValue(0);
      haloAnim.setValue(1);
      haloOpacity.setValue(0);
      return;
    }

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
  }, [animationsEnabled, isAppActive, floatAnim, haloAnim, haloOpacity]);

  // Synchronize companion with ambient weather & track transitions
  const prevWeatherRef = React.useRef<CurrentSummaryData | null>(null);

  useEffect(() => {
    if (weather) {
      const descLower = (weather.desc || '').toLowerCase();
      const isRain = descLower.includes('rain') || descLower.includes('drizzle') || descLower.includes('shower');
      const isHeavyRain = isRain && (descLower.includes('heavy') || descLower.includes('torrential') || descLower.includes('downpour'));
      const isThunder = descLower.includes('thunder') || descLower.includes('storm');
      const isClear = descLower.includes('clear') || descLower.includes('sun') || descLower.includes('fair');
      const isCloudy = descLower.includes('cloud') || descLower.includes('overcast');

      useCompanionStore.getState().syncWithAmbientWeather(weather.temp, isRain, isThunder);

      // Check for weather transitions
      if (prevWeatherRef.current && prevWeatherRef.current.desc !== weather.desc) {
        companionEvents.emit('weather_transition', {
          fromCondition: prevWeatherRef.current.desc,
          toCondition: weather.desc,
          temp: weather.temp,
        });
      } else if (!prevWeatherRef.current) {
        // Initial load of session: evaluate weather micro-advice
        useCompanionStore.getState().surfaceWeatherGuidance({
          temp: weather.temp,
          condition: weather.desc,
          isRain,
          isHeavyRain,
          isThunder,
          isClear,
          isCloudy,
          windSpeed: weather.windSpeed,
          aqi: aqi?.aqi,
          cityName: locationName,
        });
      }
      prevWeatherRef.current = weather;
    }
  }, [weather, aqi, locationName]);

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
  const temp = weather?.temp != null ? convertTemp(weather.temp) : '--';
  const high = weather?.high != null ? convertTemp(weather.high) : '--';
  const low = weather?.low != null ? convertTemp(weather.low) : '--';
  const feelsLike = weather?.feelsLike != null ? convertTemp(weather.feelsLike) : '--';
  const desc = weather?.desc ?? 'Clear Sky';
  const humidity = weather?.humidity ?? 0;
  const formattedWind = weather?.windSpeed != null ? formatWind(weather.windSpeed) : '0 km/h';
  const windDir = weather?.windDirection ?? '';

  const aqiIsWarning = aqi && aqi.aqi > 100;
  const aqiBg = aqiIsWarning ? (theme.colors.errorBg || (theme.colors.error + '20')) : (theme.colors.successBg || (theme.colors.success + '20'));
  const aqiTextColor = aqiIsWarning ? theme.colors.error : theme.colors.success;
  const aqiBorder = aqiIsWarning ? (theme.colors.error + '40') : (theme.colors.success + '40');

  return (
    <Card
      style={{
        marginHorizontal: 0,
        marginTop: 0,
        marginBottom: 12,
        padding: theme.spacing.l,
        borderRadius: theme.shapes.borderRadius.l,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Weather Ambiance Dynamic Atmosphere Glow */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: theme.shapes.borderRadius.l,
          overflow: 'hidden',
        }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="heroAtmosphereGlow" cx="82%" cy="28%" rx="72%" ry="58%" fx="82%" fy="28%">
              <Stop offset="0%" stopColor={ambianceGlowColor} stopOpacity={theme.isDark ? 0.32 : 0.20} />
              <Stop offset="55%" stopColor={ambianceGlowColor} stopOpacity={theme.isDark ? 0.08 : 0.04} />
              <Stop offset="100%" stopColor={ambianceGlowColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroAtmosphereGlow)" />
        </Svg>
      </View>
      {/* Top Header: Location Name & Live Badge */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressLocation}
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              backgroundColor: theme.colors.primary + (theme.isDark ? '28' : '18'),
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}
          >
            <Icon name="map-pin" size={15} color={theme.colors.primary} />
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
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Current temperature ${temp} degrees, ${desc}`}
            onPress={() => {
              haptics.impactLight();
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
                fontSize: 82,
                fontWeight: '400',
                lineHeight: 88,
                letterSpacing: 0.5,
                color: theme.colors.text,
                fontVariant: ['tabular-nums'],
              }}
            >
              {temp}
            </Typography>
            <Typography
              variant="h2"
              color={theme.colors.textSecondary}
              style={{
                fontSize: 38,
                fontWeight: '300',
                marginTop: 4,
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
              fontWeight: '600',
              fontSize: 18,
              marginTop: 4,
              color: theme.colors.text,
              letterSpacing: -0.3,
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
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceSecondary,
            }}
          >
            <Typography variant="caption" color={theme.colors.text} style={{ fontWeight: '600', fontSize: 12 }}>
              H: {high}° &bull; L: {low}°
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontWeight: '500', fontSize: 12, marginLeft: 6 }}>
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
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: theme.artDirection?.cardStyle === 'flat2d' ? { width: 2, height: 2 } : { width: 0, height: 6 },
            shadowOpacity: theme.isDark ? 0.2 : 0.08,
            shadowRadius: 12,
            elevation: 0,
            transform: [{ translateY: floatAnim }],
          }}
        >
          <Icon name={icon} size={54} color={theme.colors.primary} />
        </Animated.View>
      </View>

      {/* Environmental Safety & Comfort Micro-Pills Strip */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 10,
          marginBottom: 2,
        }}
      >
        {/* UV Index Badge */}
        {uvData?.uvIndex != null && (
          <View
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`UV Index: ${uvData.uvIndex}, ${uvData.level || 'Moderate'}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 3.5,
              borderRadius: 8,
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: uvData.uvIndex >= 6 ? theme.colors.warning : theme.colors.border,
            }}
          >
            <Icon
              name="shield"
              size={11}
              color={uvData.uvIndex >= 6 ? theme.colors.warning : theme.colors.primary}
            />
            <Typography
              variant="caption"
              color={uvData.uvIndex >= 6 ? theme.colors.warning : theme.colors.text}
              style={{ marginLeft: 4, fontWeight: '700', fontSize: 11, fontVariant: ['tabular-nums'] }}
            >
              UV {uvData.uvIndex} {uvData.level ? `• ${uvData.level}` : ''}
            </Typography>
          </View>
        )}

        {/* Rain Probability Badge */}
        {rainData?.timeline?.[0]?.prob != null && (
          <View
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Rain probability: ${rainData.timeline[0].prob} percent`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 3.5,
              borderRadius: 8,
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: rainData.timeline[0].prob > 50 ? theme.colors.primary : theme.colors.border,
            }}
          >
            <Icon name="droplet" size={11} color={theme.colors.primary} />
            <Typography
              variant="caption"
              color={theme.colors.text}
              style={{ marginLeft: 4, fontWeight: '700', fontSize: 11, fontVariant: ['tabular-nums'] }}
            >
              {rainData.timeline[0].prob}% Rain
            </Typography>
          </View>
        )}

        {/* Daylight / Night Celestial Badge */}
        {daylightChipLabel && (
          <View
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={daylightChipLabel}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 3.5,
              borderRadius: 8,
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Icon name={solarTimes?.isDaylight ? 'sun' : 'moon'} size={11} color={theme.colors.primary} />
            <Typography
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ marginLeft: 4, fontWeight: '600', fontSize: 11 }}
            >
              {daylightChipLabel}
            </Typography>
          </View>
        )}
      </View>

      {/* Modern 3-Column Atmospheric Micro-Telemetry Deck */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 18,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        {/* Humidity Card */}
        <View
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${t('humidityLabel')}: ${humidity} percent`}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 9,
            paddingHorizontal: 4,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Icon name="droplet" size={12} color={theme.colors.primary} />
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginLeft: 4, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {t('humidityLabel')}
            </Typography>
          </View>
          <Typography variant="bodyMedium" color={theme.colors.text} style={{ fontWeight: '800', fontSize: 14, fontVariant: ['tabular-nums'] }}>
            {humidity}%
          </Typography>
        </View>

        {/* Wind Speed Card */}
        <View
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Wind speed: ${formattedWind} ${windDir}`}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 9,
            paddingHorizontal: 4,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Icon name="wind" size={12} color={theme.colors.primary} />
            <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={{ marginLeft: 4, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {windDir || 'Wind'}
            </Typography>
          </View>
          <Typography variant="bodyMedium" color={theme.colors.text} numberOfLines={1} style={{ fontWeight: '800', fontSize: 14, fontVariant: ['tabular-nums'] }}>
            {formattedWind}
          </Typography>
        </View>

        {/* Air Quality (AQI) Card */}
        <View
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${t('aqiLabel')}: ${aqi ? aqi.aqi : 75}, ${aqi ? aqi.status : 'Moderate'}`}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 9,
            paddingHorizontal: 4,
            borderRadius: 12,
            backgroundColor: aqi ? aqiBg : theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: aqi ? aqiBorder : theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: aqiTextColor, marginRight: 4 }} />
            <Typography variant="caption" color={aqiTextColor} style={{ fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {t('aqiLabel')}
            </Typography>
          </View>
          <Typography variant="bodyMedium" color={aqiTextColor} numberOfLines={1} style={{ fontWeight: '800', fontSize: 14, fontVariant: ['tabular-nums'] }}>
            {aqi ? aqi.aqi : 75} <Typography variant="caption" color={aqiTextColor} style={{ fontWeight: '600', fontSize: 10.5 }}>{aqi ? aqi.status : 'Mod'}</Typography>
          </Typography>
        </View>
      </View>

      {/* Living Mascot Companion Perch ("Mimi") */}
      <View style={{ marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <CompanionPerch />
      </View>
    </Card>
  );
});
