import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { Icon } from '../../components/ui/Icon';
import { companionEvents } from '../../lib/companion/companionEvents';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);

  const isFlat2D = theme.artDirection?.cardStyle === 'flat2d' || theme.id === 'retro-peaceful';

  return (
    <Tabs
      screenListeners={{
        state: (e: any) => {
          const routeName = e.data?.state?.routes[e.data?.state?.index]?.name;
          if (routeName) {
            companionEvents.emit('screen_focused', { screenName: routeName });
          }
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: isFlat2D ? 16 : 18,
          right: isFlat2D ? 16 : 18,
          backgroundColor: isFlat2D
            ? theme.colors.surface
            : (theme.isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)'),
          borderColor: isFlat2D
            ? '#264653'
            : (theme.isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)'),
          borderWidth: isFlat2D ? 2.5 : 1,
          borderRadius: isFlat2D ? 16 : 28,
          height: 64,
          paddingBottom: 8,
          paddingTop: 7,
          shadowColor: isFlat2D ? '#264653' : (theme.colors.primary || '#0284C7'),
          shadowOffset: isFlat2D ? { width: 3, height: 3 } : { width: 0, height: 6 },
          shadowOpacity: isFlat2D ? 1 : 0.14,
          shadowRadius: isFlat2D ? 0 : 16,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          letterSpacing: -0.2,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('homeTab'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: focused ? (theme.colors.primary + (theme.isDark ? '2A' : '1C')) : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="home" size={19} color={color} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('alertsTab'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: focused ? (theme.colors.primary + (theme.isDark ? '2A' : '1C')) : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="alerts" size={19} color={color} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: t('locationsTab'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: focused ? (theme.colors.primary + (theme.isDark ? '2A' : '1C')) : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="locations" size={19} color={color} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('meTab'),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 44,
                height: 26,
                borderRadius: 13,
                backgroundColor: focused ? (theme.colors.primary + (theme.isDark ? '2A' : '1C')) : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="me" size={19} color={color} strokeWidth={focused ? 2.4 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
