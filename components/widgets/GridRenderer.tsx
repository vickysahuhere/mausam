import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useLayoutStore, LayoutItem } from '../../store/useLayoutStore';
import {
  CurrentSummaryWidget,
  AqiWidget,
  UvIndexWidget,
  PollenWidget,
  BestRunHoursWidget,
  SunriseSunsetWidget,
  SeaStateWidget,
  TideTimesWidget,
  DestinationWeatherWidget,
  PackingTipWidget,
  SchoolCommuteWidget,
  RainTimelineWidget,
  FrostAlertWidget,
  RainfallForecastWidget,
  SoilMoistureWidget,
  VisibilityFogWidget,
  ExtendedForecastWidget,
  ComfortIndexWidget,
} from './WeatherWidgets';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { companionEvents } from '../../lib/companion/companionEvents';
import { useCompanionStore } from '../../store/useCompanionStore';

const WIDGET_MAP: Record<string, React.FC<any>> = {
  current_summary: CurrentSummaryWidget,
  aqi_card: AqiWidget,
  uv_index: UvIndexWidget,
  pollen_estimate: PollenWidget,
  best_run_hours: BestRunHoursWidget,
  sunrise_sunset: SunriseSunsetWidget,
  sea_state: SeaStateWidget,
  tide_times: TideTimesWidget,
  destination_weather: DestinationWeatherWidget,
  packing_tip: PackingTipWidget,
  school_commute: SchoolCommuteWidget,
  rain_timeline: RainTimelineWidget,
  frost_alert: FrostAlertWidget,
  rainfall_forecast: RainfallForecastWidget,
  soil_moisture: SoilMoistureWidget,
  visibility_fog: VisibilityFogWidget,
  extended_forecast: ExtendedForecastWidget,
  comfort_index: ComfortIndexWidget,
};

interface GridRendererProps {
  isCustomizing: boolean;
  headerComponent?: React.ReactElement | null;
}

export function GridRenderer({ isCustomizing, headerComponent }: GridRendererProps) {
  const { layout, removeWidget, setLayout } = useLayoutStore();
  const theme = useTheme();
  const t = useLocaleStore((state) => state.t);

  // Exclude legacy base summary placeholder so MainWeatherHero is the single primary hero
  const displayLayout = layout.filter((item) => item.id !== 'widget-base-summary');

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLayout = [...displayLayout];
    [newLayout[index - 1], newLayout[index]] = [newLayout[index], newLayout[index - 1]];
    const baseItem = layout.find((l) => l.id === 'widget-base-summary');
    setLayout(baseItem ? [baseItem, ...newLayout] : newLayout);
  };

  const moveDown = (index: number) => {
    if (index >= displayLayout.length - 1) return;
    const newLayout = [...displayLayout];
    [newLayout[index + 1], newLayout[index]] = [newLayout[index], newLayout[index + 1]];
    const baseItem = layout.find((l) => l.id === 'widget-base-summary');
    setLayout(baseItem ? [baseItem, ...newLayout] : newLayout);
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<LayoutItem>) => {
    const WidgetComponent = WIDGET_MAP[item.type];
    if (!WidgetComponent) return null;
    const index = getIndex() ?? 0;

    return (
      <ScaleDecorator>
        <View
          style={{
            marginBottom: isCustomizing ? theme.spacing.s : 0,
            opacity: isActive ? 0.92 : 1,
            transform: [{ scale: isActive ? 1.02 : 1 }],
          }}
        >
          {isCustomizing && (
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={100}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceSecondary,
                borderRadius: theme.shapes.borderRadius.s,
                paddingVertical: 7,
                marginBottom: 6,
                borderWidth: 1,
                borderColor: isActive ? theme.colors.primary : theme.colors.border,
                borderStyle: 'dashed',
              }}
            >
              <Icon name="sliders" size={13} color={isActive ? (theme.colors.onPrimary || '#fff') : theme.colors.primary} />
              <Typography
                variant="caption"
                color={isActive ? (theme.colors.onPrimary || '#fff') : theme.colors.primary}
                style={{ fontWeight: '700', marginLeft: 6, fontSize: 11 }}
              >
                {isActive ? t('draggingWidget') : t('holdToDrag')}
              </Typography>
            </TouchableOpacity>
          )}

          <WidgetComponent
            id={item.id}
            isCustomizing={isCustomizing}
            onRemove={() => removeWidget(item.id)}
          />

          {isCustomizing && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: -4,
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => moveUp(index)}
                disabled={index === 0}
                style={{
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: theme.colors.surfaceSecondary,
                  opacity: index === 0 ? 0.35 : 1,
                }}
              >
                <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                  {t('moveUp')}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => moveDown(index)}
                disabled={index >= displayLayout.length - 1}
                style={{
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: theme.colors.surfaceSecondary,
                  opacity: index >= displayLayout.length - 1 ? 0.35 : 1,
                }}
              >
                <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                  {t('moveDown')}
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScaleDecorator>
    );
  };

  const lastScrollEmit = React.useRef(0);
  const handleScroll = (e: any) => {
    const now = Date.now();
    if (now - lastScrollEmit.current > 1500) {
      lastScrollEmit.current = now;
      companionEvents.emit('user_scrolled', {
        offsetY: e.nativeEvent?.contentOffset?.y ?? 0,
      });
      useCompanionStore.getState().resetInactivity();
    }
  };

  if (isCustomizing) {
    return (
      <DraggableFlatList
        data={displayLayout}
        onDragEnd={({ data }) => {
          const baseItem = layout.find((l) => l.id === 'widget-base-summary');
          setLayout(baseItem ? [baseItem, ...data] : data);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        containerStyle={{ flex: 1, padding: theme.spacing.m }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 120 }} />}
        onScroll={handleScroll}
        scrollEventThrottle={160}
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: theme.spacing.m }}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={160}
    >
      {headerComponent}
      {displayLayout.map((item) => {
        const WidgetComponent = WIDGET_MAP[item.type];
        if (!WidgetComponent) return null;

        return (
          <View key={item.id}>
            <WidgetComponent
              id={item.id}
              isCustomizing={false}
              onRemove={() => removeWidget(item.id)}
            />
          </View>
        );
      })}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}
