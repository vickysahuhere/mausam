/**
 * Type-safe, decoupled event bus for Mausam's interactive companion ("Mimi").
 * Allows weather services, navigation, and user actions to emit events without
 * direct coupling to the mascot rendering layer.
 */

export type CompanionEventType =
  | 'app_opened'
  | 'screen_focused'
  | 'weather_refresh_started'
  | 'weather_refresh_success'
  | 'weather_refresh_failed'
  | 'location_changed'
  | 'weather_condition_changed'
  | 'weather_transition'
  | 'rain_forecast_viewed'
  | 'uv_index_viewed'
  | 'temperature_card_tapped'
  | 'severe_alert_triggered'
  | 'user_scrolled'
  | 'inactivity_tier_reached'
  | 'gaze_target_changed'
  | 'easter_egg_triggered'
  | 'user_tap_cat'
  | 'user_pet_cat'
  | 'user_feed_cat'
  | 'user_long_press_cat'
  | 'idle_tick';

export interface WeatherConditionPayload {
  temp: number;
  feelsLike?: number;
  conditionCode?: number;
  isRain?: boolean;
  isThunder?: boolean;
  isSnow?: boolean;
  uvIndex?: number;
  windSpeed?: number;
  aqi?: number;
}

export interface WeatherTransitionPayload {
  fromCondition: string;
  toCondition: string;
  temp?: number;
}

export interface ScreenFocusPayload {
  screenName: 'home' | 'alerts' | 'locations' | 'me' | 'radar';
}

export interface LocationChangePayload {
  locationName: string;
}

export interface SevereAlertPayload {
  title: string;
  severity: 'red' | 'orange' | 'yellow';
}

export interface UserScrolledPayload {
  direction?: 'up' | 'down';
  offsetY?: number;
}

export interface InactivityTierPayload {
  tier: number;
  seconds: number;
}

export interface GazeTargetPayload {
  target: 'user' | 'left' | 'right' | 'up' | 'down';
}

export interface EasterEggPayload {
  eggId: string;
}

export type CompanionEventPayloadMap = {
  app_opened: undefined;
  screen_focused: ScreenFocusPayload;
  weather_refresh_started: undefined;
  weather_refresh_success: { temp?: number; condition?: string };
  weather_refresh_failed: { error?: string };
  location_changed: LocationChangePayload;
  weather_condition_changed: WeatherConditionPayload;
  weather_transition: WeatherTransitionPayload;
  rain_forecast_viewed: undefined;
  uv_index_viewed: { uvIndex: number };
  temperature_card_tapped: { temp: number };
  severe_alert_triggered: SevereAlertPayload;
  user_scrolled: UserScrolledPayload;
  inactivity_tier_reached: InactivityTierPayload;
  gaze_target_changed: GazeTargetPayload;
  easter_egg_triggered: EasterEggPayload;
  user_tap_cat: { tapCount: number };
  user_pet_cat: undefined;
  user_feed_cat: undefined;
  user_long_press_cat: undefined;
  idle_tick: undefined;
};

type EventListener<T extends CompanionEventType> = (payload: CompanionEventPayloadMap[T]) => void;

class CompanionEventBus {
  private listeners: Map<CompanionEventType, Set<EventListener<any>>> = new Map();

  on<T extends CompanionEventType>(event: T, listener: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => {
      this.off(event, listener);
    };
  }

  off<T extends CompanionEventType>(event: T, listener: EventListener<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<T extends CompanionEventType>(event: T, payload?: CompanionEventPayloadMap[T]): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload as any);
        } catch {
          // Keep bus resilient against listener failures
        }
      });
    }
  }

  clearAll(): void {
    this.listeners.clear();
  }
}

export const companionEvents = new CompanionEventBus();
