import AsyncStorage from '@/lib/AsyncStorage';
import { AlertSeverity } from './alertService';

const NOTIFIED_ALERTS_KEY = '@mausam_notified_alerts';

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch {
    return false;
  }
}

export async function triggerLocalWeatherAlert(
  title: string,
  body: string,
  severity: AlertSeverity | string
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(`${severity === 'red' ? '🚨 RED ALERT' : '⚠️ WARNING'}: ${title}`, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // Graceful fallback
    }
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
