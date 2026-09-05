import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { useLocaleStore } from '../../store/useLocaleStore';
import { Icon } from '../../components/ui/Icon';

export default function TabsLayout() {
  const theme = useTheme();
  const _locale = useLocaleStore((state) => state.locale);
  void _locale;
  const t = useLocaleStore((state) => state.t);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
