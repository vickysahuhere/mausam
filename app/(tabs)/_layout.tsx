import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { Icon } from '../../components/ui/Icon';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);

  const isGlass = theme.artDirection?.cardStyle === 'glass' || theme.id === 'apple-liquid';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: isGlass ? 'absolute' : 'relative',
          bottom: isGlass ? Math.max(insets.bottom, 12) : 0,
          left: isGlass ? 20 : 0,
          right: isGlass ? 20 : 0,
          backgroundColor: theme.colors.surface,
          borderColor: isGlass ? theme.colors.border : theme.colors.border,
          borderWidth: isGlass ? 1 : 0,
          borderTopWidth: isGlass ? 1 : 1,
          borderRadius: isGlass ? 26 : 0,
          height: isGlass ? 64 : 60 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
          paddingBottom: isGlass ? 8 : Math.max(insets.bottom, 8),
          paddingTop: 8,
          shadowColor: '#0284C7',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isGlass ? 0.12 : 0,
          shadowRadius: 16,
          elevation: isGlass ? 4 : 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('homeTab'),
          tabBarIcon: ({ color }) => <Icon name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('alertsTab'),
          tabBarIcon: ({ color }) => <Icon name="alerts" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          title: t('locationsTab'),
          tabBarIcon: ({ color }) => <Icon name="locations" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('meTab'),
          tabBarIcon: ({ color }) => <Icon name="me" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
