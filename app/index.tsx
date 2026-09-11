import { useEffect } from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useLocationStore } from '../store/useLocationStore';
import { useLayoutStore } from '../store/useLayoutStore';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndRoute() {
      try {
        // 1. Wait for local AsyncStorage persistence hydration
        await Promise.all([
          useAuthStore.persist?.hasHydrated()
            ? Promise.resolve()
            : new Promise((res) => {
                const unsub = useAuthStore.persist?.onFinishHydration(() => {
                  unsub?.();
                  res(true);
                });
                setTimeout(res, 500);
              }),
          useLocationStore.persist?.hasHydrated()
            ? Promise.resolve()
            : new Promise((res) => {
                const unsub = useLocationStore.persist?.onFinishHydration(() => {
                  unsub?.();
                  res(true);
                });
                setTimeout(res, 500);
              }),
          useLayoutStore.persist?.hasHydrated()
            ? Promise.resolve()
            : new Promise((res) => {
                const unsub = useLayoutStore.persist?.onFinishHydration(() => {
                  unsub?.();
                  res(true);
                });
                setTimeout(res, 500);
              }),
        ]);

        // 2. Restore cloud session & sync cloud database records
        await useAuthStore.getState().restoreSession();
      } catch (err) {
        console.warn('Splash session check error:', err);
      } finally {
        if (!isMounted) return;

        // 3. Make routing decision with complete, synchronized state
        const { hasSession, isGuest, personaVector, surveyCompleted } = useAuthStore.getState();
        const locations = useLocationStore.getState().locations;
        const isActiveUser = hasSession || isGuest;
        const hasDefaultLocation = locations.some((l) => l.isDefault);

        if (!isActiveUser) {
          router.replace('/onboarding');
        } else if (!personaVector || !surveyCompleted) {
          router.replace('/onboarding/survey');
        } else if (!hasDefaultLocation) {
          router.replace('/onboarding/location-setup');
        } else {
          router.replace('/(tabs)');
        }
      }
    }

    checkAuthAndRoute();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#B4B4B4' }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
      <ActivityIndicator size="small" color="#1C1C1E" />
    </View>
  );
}
