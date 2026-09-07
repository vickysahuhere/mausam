/**
 * Companion Brain & 5-Level Priority Engine for "Mimi".
 * Governs expressions, poses, weather intelligence, circadian rhythm,
 * cooldown management, gaze targeting, and priority-driven state transitions.
 */

import { selectContextualRemark, RemarkCategory } from './companionRemarks';

export type CompanionMood =
  | 'peaceful'
  | 'happy'
  | 'curious'
  | 'sleepy'
  | 'sleeping'
  | 'startled'
  | 'chilly'
  | 'warm'
  | 'protective';

export type CompanionExpression =
  | 'neutral'
  | 'happy'
  | 'surprised'
  | 'sleepy'
  | 'sleeping'
  | 'startled'
  | 'curious'
  | 'annoyed'
  | 'blissful';

export type CompanionPose =
  | 'sit'
  | 'perch'
  | 'wave'
  | 'bongo_tap'
  | 'umbrella_hold'
  | 'curl_sleep'
  | 'duck_hide'
  | 'stretch_yawn';

export type CompanionAccessory =
  | 'none'
  | 'umbrella'
  | 'sunglasses'
  | 'scarf'
  | 'fan'
  | 'eye_mask'
  | 'sleeping_cap';

export type GazeTarget = 'user' | 'left' | 'right' | 'up' | 'down';

export type CompanionPriority =
  | 'CRITICAL'     // Level 5 (score: 100) — severe weather alerts, storm hide
  | 'MAJOR'        // Level 4 (score: 80) — weather transitions, long absence returns
  | 'INTERACTION'  // Level 3 (score: 65) — direct user taps, petting, treating, manual refresh
  | 'CONTEXTUAL'   // Level 2 (score: 45) — temperature check, UV check, scroll awareness, location change
  | 'AMBIENT'      // Level 1 (score: 20) — 12 idle routines, background subtle movements, circadian sleep
  | 'HIGH'         // Legacy alias (score: 75)
  | 'MEDIUM'       // Legacy alias (score: 50)
  | 'LOW';         // Legacy alias (score: 25)

export interface CompanionState {
  mood: CompanionMood;
  expression: CompanionExpression;
  pose: CompanionPose;
  accessory: CompanionAccessory;
  gazeTarget: GazeTarget;
  speechText: string | null;
  speechKey: string | null;
  priority: CompanionPriority;
  priorityScore: number;
  durationMs: number;
  timestamp: number;
}

export const IDLE_BEHAVIORS = [
  'IDLE_01_BLINK',
  'IDLE_02_LOOK_LEFT',
  'IDLE_03_LOOK_RIGHT',
  'IDLE_04_TAIL_SWISH',
  'IDLE_05_EAR_TWITCH',
  'IDLE_06_STRETCH',
  'IDLE_07_YAWN',
  'IDLE_08_LOOK_UP_SKY',
  'IDLE_09_GROOM_PAW',
  'IDLE_10_DOZE_OFF',
  'IDLE_11_LOOK_AT_USER',
  'IDLE_12_PAW_PAT',
] as const;

export type IdleBehavior = typeof IDLE_BEHAVIORS[number];

export function getTimeOfDayCategory(hour: number = new Date().getHours()): 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  if (hour >= 22 || hour < 1) return 'night';
  return 'late_night';
}

/**
 * Returns default resting state according to the circadian rhythm and ambient weather.
 */
export function getDefaultRestingState(
  temp?: number,
  isRain?: boolean,
  isThunder?: boolean,
  hour: number = new Date().getHours()
): CompanionState {
  const timeCat = getTimeOfDayCategory(hour);

  if (timeCat === 'late_night') {
    return {
      mood: 'sleeping',
      expression: 'sleeping',
      pose: 'curl_sleep',
      accessory: 'eye_mask',
      gazeTarget: 'down',
      speechText: null,
      speechKey: null,
      priority: 'AMBIENT',
      priorityScore: 10,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }

  if (timeCat === 'night') {
    return {
      mood: 'sleepy',
      expression: 'sleepy',
      pose: 'sit',
      accessory: 'none',
      gazeTarget: 'user',
      speechText: null,
      speechKey: null,
      priority: 'AMBIENT',
      priorityScore: 15,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }

  // Weather-influenced default
  if (isThunder) {
    return {
      mood: 'startled',
      expression: 'startled',
      pose: 'duck_hide',
      accessory: 'none',
      gazeTarget: 'user',
      speechText: null,
      speechKey: null,
      priority: 'CRITICAL',
      priorityScore: 100,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }

  if (isRain) {
    return {
      mood: 'protective',
      expression: 'neutral',
      pose: 'umbrella_hold',
      accessory: 'umbrella',
      gazeTarget: 'up',
      speechText: null,
      speechKey: null,
      priority: 'CONTEXTUAL',
      priorityScore: 45,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }

  if (temp !== undefined && temp <= 10) {
    return {
      mood: 'chilly',
      expression: 'neutral',
      pose: 'sit',
      accessory: 'scarf',
      gazeTarget: 'user',
      speechText: null,
      speechKey: null,
      priority: 'AMBIENT',
      priorityScore: 20,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }

  if (temp !== undefined && temp >= 35) {
    return {
      mood: 'warm',
      expression: 'sleepy',
      pose: 'sit',
      accessory: 'fan',
      gazeTarget: 'user',
      speechText: null,
      speechKey: null,
      priority: 'AMBIENT',
      priorityScore: 20,
      durationMs: 0,
      timestamp: Date.now(),
    };
  }

  return {
    mood: 'peaceful',
    expression: 'neutral',
    pose: 'perch',
    accessory: 'none',
    gazeTarget: 'user',
    speechText: null,
    speechKey: null,
    priority: 'AMBIENT',
    priorityScore: 10,
    durationMs: 0,
    timestamp: Date.now(),
  };
}

/**
 * Generate a random next idle routine avoiding immediate repeats and directing gaze.
 */
export function getNextIdleRoutine(lastBehavior?: IdleBehavior): {
  behavior: IdleBehavior;
  expression: CompanionExpression;
  pose: CompanionPose;
  gazeTarget: GazeTarget;
  durationMs: number;
} {
  const filtered = IDLE_BEHAVIORS.filter((b) => b !== lastBehavior);
  const choice = filtered[Math.floor(Math.random() * filtered.length)];

  switch (choice) {
    case 'IDLE_01_BLINK':
      return { behavior: choice, expression: 'sleepy', pose: 'perch', gazeTarget: 'user', durationMs: 1200 };
    case 'IDLE_02_LOOK_LEFT':
      return { behavior: choice, expression: 'curious', pose: 'perch', gazeTarget: 'left', durationMs: 1800 };
    case 'IDLE_03_LOOK_RIGHT':
      return { behavior: choice, expression: 'curious', pose: 'perch', gazeTarget: 'right', durationMs: 1800 };
    case 'IDLE_04_TAIL_SWISH':
      return { behavior: choice, expression: 'happy', pose: 'sit', gazeTarget: 'user', durationMs: 2200 };
    case 'IDLE_05_EAR_TWITCH':
      return { behavior: choice, expression: 'neutral', pose: 'perch', gazeTarget: 'user', durationMs: 1500 };
    case 'IDLE_06_STRETCH':
      return { behavior: choice, expression: 'happy', pose: 'stretch_yawn', gazeTarget: 'up', durationMs: 2500 };
    case 'IDLE_07_YAWN':
      return { behavior: choice, expression: 'sleepy', pose: 'stretch_yawn', gazeTarget: 'user', durationMs: 2200 };
    case 'IDLE_08_LOOK_UP_SKY':
      return { behavior: choice, expression: 'surprised', pose: 'perch', gazeTarget: 'up', durationMs: 2000 };
    case 'IDLE_09_GROOM_PAW':
      return { behavior: choice, expression: 'blissful', pose: 'sit', gazeTarget: 'down', durationMs: 2400 };
    case 'IDLE_10_DOZE_OFF':
      return { behavior: choice, expression: 'sleeping', pose: 'curl_sleep', gazeTarget: 'down', durationMs: 3000 };
    case 'IDLE_11_LOOK_AT_USER':
      return { behavior: choice, expression: 'happy', pose: 'sit', gazeTarget: 'user', durationMs: 2000 };
    case 'IDLE_12_PAW_PAT':
    default:
      return { behavior: choice, expression: 'happy', pose: 'bongo_tap', gazeTarget: 'user', durationMs: 1600 };
  }
}

/**
 * 5-Level Priority scoring table:
 * Level 5: CRITICAL (score: 100)
 * Level 4: MAJOR (score: 80)
 * Level 3: INTERACTION (score: 65)
 * Level 2: CONTEXTUAL (score: 45)
 * Level 1: AMBIENT (score: 20)
 */
export function canOverrideState(currentState: CompanionState, incomingPriorityScore: number): boolean {
  const elapsed = Date.now() - currentState.timestamp;
  if (currentState.durationMs > 0 && elapsed < currentState.durationMs) {
    // Current state still active: only strictly higher priority can override
    return incomingPriorityScore > currentState.priorityScore;
  }
  // Completed current duration: equal or higher priority can transition
  return incomingPriorityScore >= currentState.priorityScore;
}

export interface WeatherTransitionResult {
  detected: boolean;
  type?: 'rain_started' | 'rain_stopped' | 'storm_started' | 'extreme_temp_change';
  speechText?: string;
  expression?: CompanionExpression;
  pose?: CompanionPose;
  accessory?: CompanionAccessory;
}

/**
 * Deterministically detect notable weather state transitions.
 */
export function detectWeatherTransition(prevDesc?: string, currDesc?: string): WeatherTransitionResult {
  if (!prevDesc || !currDesc) return { detected: false };
  const prev = prevDesc.toLowerCase();
  const curr = currDesc.toLowerCase();

  const isRain = (s: string) => s.includes('rain') || s.includes('drizzle') || s.includes('shower');
  const isClear = (s: string) => s.includes('clear') || s.includes('sun') || s.includes('fair');
  const isThunder = (s: string) => s.includes('thunder') || s.includes('storm') || s.includes('squall');

  if (!isThunder(prev) && isThunder(curr)) {
    return {
      detected: true,
      type: 'storm_started',
      speechText: 'Thunder in the air! Stay indoors and safe.',
      expression: 'startled',
      pose: 'duck_hide',
      accessory: 'none',
    };
  }

  if (!isRain(prev) && isRain(curr)) {
    return {
      detected: true,
      type: 'rain_started',
      speechText: 'Rain started! Umbrella deployed.',
      expression: 'surprised',
      pose: 'umbrella_hold',
      accessory: 'umbrella',
    };
  }

  if (isRain(prev) && isClear(curr)) {
    return {
      detected: true,
      type: 'rain_stopped',
      speechText: 'The rain stopped! Fresh air outside.',
      expression: 'happy',
      pose: 'wave',
      accessory: 'none',
    };
  }

  return { detected: false };
}

export interface CompanionContext {
  getAffinity?: () => number;
  getRecentMessageIds?: () => string[];
  getSessionRefreshCount?: () => number;
  getSessionTempTapCount?: () => number;
  getSessionLocationChangeCount?: () => number;
  getLastSessionTime?: () => number;
  recordMessageId?: (id: string) => void;
}

/**
 * Connects application event bus to companion reactive states.
 */
export function registerCompanionEventListeners(
  triggerReaction: (params: {
    mood?: CompanionMood;
    expression: CompanionExpression;
    pose: CompanionPose;
    accessory?: CompanionAccessory;
    gazeTarget?: GazeTarget;
    speechText?: string | null;
    priority: CompanionPriority;
    priorityScore: number;
    durationMs: number;
  }) => boolean,
  context?: CompanionContext
): () => void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { companionEvents } = require('./companionEvents');

  const getAffinity = () => context?.getAffinity?.() ?? 10;
  const getRecentIds = () => context?.getRecentMessageIds?.() ?? [];
  const pickRemark = (category: RemarkCategory) => {
    const remark = selectContextualRemark(category, getAffinity(), getRecentIds());
    if (remark && context?.recordMessageId) {
      context.recordMessageId(remark.id);
    }
    return remark?.text ?? null;
  };

  const unsubs = [
    // 1. App Opened with Absence Intelligence
    companionEvents.on('app_opened', () => {
      const hour = new Date().getHours();
      const timeCat = getTimeOfDayCategory(hour);
      const lastSession = context?.getLastSessionTime?.() ?? Date.now();
      const absenceMs = Date.now() - lastSession;

      // Absence > 48 hours: Level 4 Major
      if (absenceMs > 48 * 60 * 60 * 1000) {
        const speech = pickRemark('returning_very_long') ?? 'I was starting to think you moved.';
        triggerReaction({
          mood: 'happy',
          expression: 'surprised',
          pose: 'wave',
          gazeTarget: 'user',
          speechText: speech,
          priority: 'MAJOR',
          priorityScore: 80,
          durationMs: 3200,
        });
        return;
      }

      // Absence > 8 hours: Level 3 Interaction
      if (absenceMs > 8 * 60 * 60 * 1000) {
        const speech = pickRemark('returning_long') ?? 'Where have you been?';
        triggerReaction({
          mood: 'happy',
          expression: 'happy',
          pose: 'wave',
          gazeTarget: 'user',
          speechText: speech,
          priority: 'INTERACTION',
          priorityScore: 65,
          durationMs: 2800,
        });
        return;
      }

      // 1 AM - 5 AM: Late night self-aware remark
      if (timeCat === 'late_night') {
        const speech = pickRemark('late_night_3am') ?? 'Why are YOU awake?';
        triggerReaction({
          mood: 'sleeping',
          expression: 'sleeping',
          pose: 'curl_sleep',
          accessory: 'eye_mask',
          gazeTarget: 'down',
          speechText: speech,
          priority: 'INTERACTION',
          priorityScore: 65,
          durationMs: 3000,
        });
        return;
      }

      // Morning greeting
      if (timeCat === 'morning') {
        const speech = pickRemark('time_morning') ?? 'Good morning!';
        triggerReaction({
          mood: 'happy',
          expression: 'happy',
          pose: 'wave',
          gazeTarget: 'user',
          speechText: speech,
          priority: 'CONTEXTUAL',
          priorityScore: 50,
          durationMs: 2500,
        });
        return;
      }

      // Regular short absence return
      const speech = pickRemark('returning_short');
      triggerReaction({
        mood: 'happy',
        expression: 'happy',
        pose: 'wave',
        gazeTarget: 'user',
        speechText: speech,
        priority: 'CONTEXTUAL',
        priorityScore: 45,
        durationMs: 2000,
      });
    }),

    // 2. Screen Navigation
    companionEvents.on('screen_focused', (payload: { screenName: string }) => {
      triggerReaction({
        mood: 'curious',
        expression: 'curious',
        pose: 'perch',
        gazeTarget: payload.screenName === 'alerts' ? 'right' : 'user',
        priority: 'CONTEXTUAL',
        priorityScore: 40,
        durationMs: 1400,
      });
    }),

    // 3. User Scrolling -> Look down at content
    companionEvents.on('user_scrolled', () => {
      triggerReaction({
        mood: 'curious',
        expression: 'neutral',
        pose: 'perch',
        gazeTarget: 'down',
        priority: 'CONTEXTUAL',
        priorityScore: 35,
        durationMs: 1200,
      });
    }),

    // 4. Refresh Started with Repeated Refresh Detection
    companionEvents.on('weather_refresh_started', () => {
      const refreshCount = context?.getSessionRefreshCount?.() ?? 1;
      let speech: string | null = null;
      if (refreshCount >= 3) {
        speech = pickRemark('repeated_refresh') ?? 'Checking again?';
      }

      triggerReaction({
        mood: 'curious',
        expression: 'curious',
        pose: 'bongo_tap',
        gazeTarget: 'left',
        speechText: speech,
        priority: 'INTERACTION',
        priorityScore: 70,
        durationMs: speech ? 2600 : 1800,
      });
    }),

    // 5. Refresh Success
    companionEvents.on('weather_refresh_success', () => {
      triggerReaction({
        mood: 'happy',
        expression: 'happy',
        pose: 'wave',
        gazeTarget: 'user',
        speechText: 'Updated!',
        priority: 'INTERACTION',
        priorityScore: 68,
        durationMs: 2000,
      });
    }),

    // 6. Refresh Failed
    companionEvents.on('weather_refresh_failed', () => {
      triggerReaction({
        mood: 'curious',
        expression: 'sleepy',
        pose: 'sit',
        gazeTarget: 'user',
        speechText: 'Offline for now',
        priority: 'CONTEXTUAL',
        priorityScore: 45,
        durationMs: 2200,
      });
    }),

    // 7. Temperature Card Tapped with Repeated Tap Detection
    companionEvents.on('temperature_card_tapped', (payload: { temp: number }) => {
      const tapCount = context?.getSessionTempTapCount?.() ?? 1;
      if (tapCount >= 3) {
        const speech = pickRemark('repeated_temp') ?? 'It is still the exact same temperature.';
        triggerReaction({
          mood: 'curious',
          expression: 'annoyed',
          pose: 'sit',
          gazeTarget: 'left',
          speechText: speech,
          priority: 'INTERACTION',
          priorityScore: 65,
          durationMs: 2600,
        });
        return;
      }

      if (payload.temp >= 33) {
        triggerReaction({
          mood: 'warm',
          expression: 'sleepy',
          pose: 'sit',
          accessory: 'fan',
          gazeTarget: 'left',
          speechText: `${payload.temp}°C today! Stay hydrated~`,
          priority: 'CONTEXTUAL',
          priorityScore: 50,
          durationMs: 2600,
        });
      } else if (payload.temp <= 12) {
        triggerReaction({
          mood: 'chilly',
          expression: 'neutral',
          pose: 'sit',
          accessory: 'scarf',
          gazeTarget: 'left',
          speechText: `Brrr, ${payload.temp}°C! Wrap up warm.`,
          priority: 'CONTEXTUAL',
          priorityScore: 50,
          durationMs: 2600,
        });
      } else {
        triggerReaction({
          mood: 'happy',
          expression: 'happy',
          pose: 'bongo_tap',
          gazeTarget: 'left',
          speechText: 'Breezy and pleasant!',
          priority: 'CONTEXTUAL',
          priorityScore: 48,
          durationMs: 2200,
        });
      }
    }),

    // 8. Location Changed with Repeated Switch Detection
    companionEvents.on('location_changed', (payload: { locationName: string }) => {
      const changeCount = context?.getSessionLocationChangeCount?.() ?? 1;
      let speech: string | null = null;
      if (changeCount >= 3) {
        speech = pickRemark('repeated_location') ?? 'Checking every city on the map?';
      } else {
        speech = `Exploring ${payload.locationName}~`;
      }

      triggerReaction({
        mood: 'curious',
        expression: 'curious',
        pose: 'perch',
        gazeTarget: 'right',
        speechText: speech,
        priority: 'CONTEXTUAL',
        priorityScore: 46,
        durationMs: 2400,
      });
    }),

    // 9. Rain Forecast Viewed
    companionEvents.on('rain_forecast_viewed', () => {
      triggerReaction({
        mood: 'protective',
        expression: 'happy',
        pose: 'umbrella_hold',
        accessory: 'umbrella',
        gazeTarget: 'up',
        speechText: 'Keep an umbrella handy!',
        priority: 'INTERACTION',
        priorityScore: 65,
        durationMs: 2800,
      });
    }),

    // 10. UV Index Viewed
    companionEvents.on('uv_index_viewed', (payload: { uvIndex: number }) => {
      if (payload.uvIndex >= 6) {
        triggerReaction({
          mood: 'curious',
          expression: 'happy',
          pose: 'perch',
          accessory: 'sunglasses',
          gazeTarget: 'up',
          speechText: 'High UV! Wear sunscreen~',
          priority: 'INTERACTION',
          priorityScore: 65,
          durationMs: 2800,
        });
      }
    }),

    // 11. Weather Transition (Level 4 Major)
    companionEvents.on('weather_transition', (payload: { fromCondition: string; toCondition: string }) => {
      const transition = detectWeatherTransition(payload.fromCondition, payload.toCondition);
      if (transition.detected) {
        triggerReaction({
          mood: transition.type === 'rain_started' ? 'protective' : 'happy',
          expression: transition.expression ?? 'surprised',
          pose: transition.pose ?? 'umbrella_hold',
          accessory: transition.accessory ?? 'umbrella',
          gazeTarget: 'up',
          speechText: transition.speechText ?? 'Weather changed!',
          priority: 'MAJOR',
          priorityScore: 80,
          durationMs: 3500,
        });
      }
    }),

    // 12. Severe Alert (Level 5 Critical)
    companionEvents.on('severe_alert_triggered', (payload: { title: string; severity: 'red' | 'orange' | 'yellow' }) => {
      triggerReaction({
        mood: 'startled',
        expression: 'startled',
        pose: 'duck_hide',
        accessory: 'none',
        gazeTarget: 'user',
        speechText: `${payload.title}! Stay safe indoors.`,
        priority: 'CRITICAL',
        priorityScore: 100,
        durationMs: 4500,
      });
    }),

    // 13. Tiered Inactivity (Level 1 Ambient)
    companionEvents.on('inactivity_tier_reached', (payload: { tier: number }) => {
      if (payload.tier === 2) {
        triggerReaction({
          mood: 'peaceful',
          expression: 'neutral',
          pose: 'sit',
          gazeTarget: 'user',
          priority: 'AMBIENT',
          priorityScore: 20,
          durationMs: 0,
        });
      } else if (payload.tier === 3) {
        triggerReaction({
          mood: 'sleepy',
          expression: 'sleepy',
          pose: 'sit',
          gazeTarget: 'down',
          priority: 'AMBIENT',
          priorityScore: 22,
          durationMs: 0,
        });
      } else if (payload.tier === 4) {
        triggerReaction({
          mood: 'sleepy',
          expression: 'sleepy',
          pose: 'stretch_yawn',
          gazeTarget: 'down',
          priority: 'AMBIENT',
          priorityScore: 24,
          durationMs: 2500,
        });
      } else if (payload.tier >= 5) {
        const speech = pickRemark('inactivity_nap');
        triggerReaction({
          mood: 'sleeping',
          expression: 'sleeping',
          pose: 'curl_sleep',
          accessory: 'eye_mask',
          gazeTarget: 'down',
          speechText: speech,
          priority: 'AMBIENT',
          priorityScore: 25,
          durationMs: 0,
        });
      }
    }),
  ];

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}
