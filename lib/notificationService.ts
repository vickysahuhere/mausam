import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AlertSeverity } from './alertService';

const NOTIFIED_ALERTS_KEY = '@mausam_notified_alerts';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: any = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    });
  } catch {
    Notifications = null;
  }
}

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (!Notifications) {
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('severe_weather', {
        name: 'Severe Weather Warnings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF4444',
      });
    }

    return true;
  } catch {
    return false;
  }
}

export async function triggerLocalWeatherAlert(
  title: string,
  body: string,
  severity: AlertSeverity | string
): Promise<void> {
  if (!Notifications) {
    // In Expo Go, notifications are displayed as high-visibility in-app alerts
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${severity === 'red' ? '?? RED ALERT' : '?? WARNING'}: ${title}`,
        body,
        data: { severity },
        sound: true,
      },
      trigger: null,
    });
  } catch {
    // Graceful fallback
  }
}

export async function processSevereAlerts(
  alerts: Array<{ id: string; title: string; description: string; severity: AlertSeverity | string }>
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_ALERTS_KEY);
    const notifiedIds: string[] = stored ? JSON.parse(stored) : [];

    for (const alert of alerts) {
      if ((alert.severity === 'red' || alert.severity === 'orange') && !notifiedIds.includes(alert.id)) {
        await triggerLocalWeatherAlert(alert.title, alert.description, alert.severity);
        notifiedIds.push(alert.id);
      }
    }

    await AsyncStorage.setItem(NOTIFIED_ALERTS_KEY, JSON.stringify(notifiedIds.slice(-20)));
  } catch {
    // Ignore error
  }
}
