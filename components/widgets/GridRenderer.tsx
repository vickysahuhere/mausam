import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLayoutStore } from '../../store/useLayoutStore';
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

  return (
    <ScrollView style={{ flex: 1, padding: theme.spacing.m }} showsVerticalScrollIndicator={false}>
      {layout.map((item, index) => {
        const WidgetComponent = WIDGET_MAP[item.type];
        if (!WidgetComponent) return null;

        return (
          <View key={item.id} style={{ marginBottom: isCustomizing ? theme.spacing.s : 0 }}>
            <WidgetComponent
              id={item.id}
              isCustomizing={isCustomizing}
              onRemove={() => removeWidget(item.id)}
            />

            {/* Reorder controls in customize mode */}
            {isCustomizing && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: -6,
                  marginBottom: 14,
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
        );
      })}

      {/* Spacer for bottom tab bar */}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}
