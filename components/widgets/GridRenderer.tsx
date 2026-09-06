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
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';

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

export function GridRenderer({ isCustomizing }: { isCustomizing: boolean }) {
  const { layout, removeWidget, setLayout } = useLayoutStore();
  const theme = useTheme();

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLayout = [...layout];
    [newLayout[index - 1], newLayout[index]] = [newLayout[index], newLayout[index - 1]];
    setLayout(newLayout);
  };

  const moveDown = (index: number) => {
    if (index === layout.length - 1) return;
    const newLayout = [...layout];
    [newLayout[index + 1], newLayout[index]] = [newLayout[index], newLayout[index + 1]];
    setLayout(newLayout);
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
              <Icon name="sliders" size={13} color={isActive ? '#fff' : theme.colors.primary} />
              <Typography
                variant="caption"
                color={isActive ? '#fff' : theme.colors.primary}
                style={{ fontWeight: '700', marginLeft: 6, fontSize: 11 }}
              >
                {isActive ? 'Dragging Widget...' : 'Hold to Drag & Reorder'}
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
                  Move Up
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => moveDown(index)}
                disabled={index === layout.length - 1}
                style={{
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                  borderRadius: theme.shapes.borderRadius.s,
                  backgroundColor: theme.colors.surfaceSecondary,
                  opacity: index === layout.length - 1 ? 0.35 : 1,
                }}
              >
                <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                  Move Down
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScaleDecorator>
    );
  };

  if (isCustomizing) {
    return (
      <DraggableFlatList
        data={layout}
        onDragEnd={({ data }) => setLayout(data)}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        containerStyle={{ flex: 1, padding: theme.spacing.m }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: theme.spacing.m }} showsVerticalScrollIndicator={false}>
      {layout.map((item) => {
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
