'use client';

import React, { useState, useEffect } from 'react';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { getAlertsForLocation } from '../../lib/alertService';
import { registerForPushNotificationsAsync } from '../../lib/notificationService';

export default function AlertsPage() {
  const theme = useTheme();
  const locations = useLocationStore((s) => s.locations);
  const defaultLoc = locations.find((l) => l.isDefault) || locations[0] || {
    id: 'default',
    label: 'New Delhi, Delhi, India',
    lat: 28.6139,
    lon: 77.209,
    isDefault: true,
  };

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const res = await getAlertsForLocation(defaultLoc.lat, defaultLoc.lon);
        setAlerts(res.alerts || []);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [defaultLoc.lat, defaultLoc.lon]);

  const handleEnableNotifications = async () => {
    const granted = await registerForPushNotificationsAsync();
    setNotifGranted(granted);
    if (granted) {
      alert('Weather alert notifications enabled successfully for your browser!');
    } else {
      alert('Notification permissions were not granted or are not supported by your browser.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography variant="h2" className="font-extrabold">
            Active Weather Warnings & Bulletins
          </Typography>
          <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
            Official bulletins ground-sourced from India Meteorological Department (IMD)
          </Typography>
        </div>

        <Button
          title={notifGranted ? 'Notifications Active' : 'Enable Alert Notifications'}
          variant="outline"
          onClick={handleEnableNotifications}
          disabled={notifGranted}
        />
      </div>

      {/* Severity Color Matrix Guide */}
      <Card className="p-4">
        <Typography variant="h3" className="text-sm font-bold mb-3">
          IMD Alert Severity Matrix
        </Typography>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Green (No Warning)</span>
            <span className="opacity-75">No emergency weather action needed.</span>
          </div>
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Yellow (Watch)</span>
            <span className="opacity-75">Be aware of deteriorating weather.</span>
          </div>
          <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/10">
            <span className="font-bold text-orange-600 dark:text-orange-400 block mb-0.5">Orange (Alert)</span>
            <span className="opacity-75">Be prepared for hazardous conditions.</span>
          </div>
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10">
            <span className="font-bold text-red-600 dark:text-red-400 block mb-0.5">Red (Warning)</span>
            <span className="opacity-75">Take immediate safety action.</span>
          </div>
        </div>
      </Card>

      {/* Active Bulletins List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="bell" size={18} color={theme.colors.primary} />
          <Typography variant="h3" className="font-bold text-base">
            Current Alerts for {defaultLoc.label}
          </Typography>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div
              className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${theme.colors.primary} transparent ${theme.colors.primary} ${theme.colors.primary}` }}
            />
            <span className="text-xs opacity-70">Querying meteorological bulletins...</span>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 text-2xl mb-3">
              ✓
            </div>
            <Typography variant="h3" className="font-bold mb-1">
              No Severe Weather Warnings Active
            </Typography>
            <Typography variant="caption" className="max-w-md opacity-75">
              Atmospheric readings and satellite scans indicate tranquil conditions for {defaultLoc.label} and surrounding districts.
            </Typography>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, idx) => {
              const isRed = alert.severity === 'red';
              return (
                <Card
                  key={idx}
                  className={`p-5 border-l-4 ${
                    isRed ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block"
                        style={{
                          backgroundColor: isRed ? '#FEE2E2' : '#FEF3C7',
                          color: isRed ? '#991B1B' : '#92400E',
                        }}
                      >
                        {alert.severity} Alert
                      </span>
                      <h3 className="text-base font-bold">{alert.headline || alert.title}</h3>
                    </div>
                    <span className="text-xs opacity-60">{alert.time || 'Live'}</span>
                  </div>
                  <p className="text-sm opacity-85 leading-relaxed">{alert.description}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
