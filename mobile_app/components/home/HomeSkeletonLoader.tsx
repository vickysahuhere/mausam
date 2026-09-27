import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export function HomeSkeletonLoader() {
  const theme = useTheme();
  const [pulseAnim] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const blockStyle = {
    backgroundColor: theme.colors.surfaceSecondary,
    opacity: pulseAnim,
  };

  return (
    <View style={styles.container}>
      {/* 1. Main Weather Hero Skeleton */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.shapes.borderRadius.l ?? 24,
          },
        ]}
      >
        {/* Locality pill */}
        <View style={styles.centerRow}>
          <Animated.View style={[styles.locationPill, blockStyle]} />
        </View>

        {/* Temperature & Icon */}
        <View style={[styles.centerRow, { marginTop: 20 }]}>
          <Animated.View style={[styles.tempBlock, blockStyle]} />
        </View>

        {/* Condition description */}
        <View style={[styles.centerRow, { marginTop: 12 }]}>
          <Animated.View style={[styles.descBlock, blockStyle]} />
        </View>

        {/* High / Low pill */}
        <View style={[styles.centerRow, { marginTop: 10 }]}>
          <Animated.View style={[styles.highLowPill, blockStyle]} />
        </View>

        {/* 3-Column Telemetry */}
        <View style={[styles.telemetryRow, { marginTop: 22 }]}>
          <Animated.View style={[styles.telemetryCard, blockStyle]} />
          <Animated.View style={[styles.telemetryCard, blockStyle, { marginHorizontal: 8 }]} />
          <Animated.View style={[styles.telemetryCard, blockStyle]} />
        </View>

        {/* Mascot dock placeholder */}
        <Animated.View style={[styles.mascotDock, blockStyle, { marginTop: 16 }]} />
      </View>

      {/* 2. Hourly Forecast Strip Skeleton */}
      <View
        style={[
          styles.widgetCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.shapes.borderRadius.m ?? 20,
            marginTop: 14,
          },
        ]}
      >
        <View style={styles.widgetHeader}>
          <Animated.View style={[styles.iconBadge, blockStyle]} />
          <Animated.View style={[styles.widgetTitle, blockStyle, { marginLeft: 10 }]} />
        </View>
        <View style={styles.hourlyRow}>
          {[1, 2, 3, 4, 5].map((key) => (
            <Animated.View key={key} style={[styles.hourlyCapsule, blockStyle]} />
          ))}
        </View>
      </View>

      {/* 3. Grid Card Skeletons */}
      {[1, 2].map((key) => (
        <View
          key={key}
          style={[
            styles.widgetCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.shapes.borderRadius.m ?? 20,
              marginTop: 14,
            },
          ]}
        >
          <View style={styles.widgetHeader}>
            <Animated.View style={[styles.iconBadge, blockStyle]} />
            <Animated.View style={[styles.widgetTitle, blockStyle, { marginLeft: 10 }]} />
          </View>
          <Animated.View style={[styles.widgetBody, blockStyle, { marginTop: 14 }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  heroCard: {
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  centerRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPill: {
    width: 140,
    height: 26,
    borderRadius: 13,
  },
  tempBlock: {
    width: 150,
    height: 74,
    borderRadius: 18,
  },
  descBlock: {
    width: 120,
    height: 18,
    borderRadius: 9,
  },
  highLowPill: {
    width: 170,
    height: 24,
    borderRadius: 12,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  telemetryCard: {
    flex: 1,
    height: 68,
    borderRadius: 14,
  },
  mascotDock: {
    height: 64,
    borderRadius: 14,
  },
  widgetCard: {
    padding: 16,
    borderWidth: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  widgetTitle: {
    width: 110,
    height: 16,
    borderRadius: 8,
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  hourlyCapsule: {
    width: 54,
    height: 86,
    borderRadius: 16,
  },
  widgetBody: {
    height: 90,
    borderRadius: 14,
  },
});
