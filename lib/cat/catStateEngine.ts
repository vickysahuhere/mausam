/**
 * Centralized Cat State Engine for Mausam
 * Governs Mood, Activity, Animation, Reactions, Sounds, and Contextual Micro-Advice.
 */

import {
  CatMood,
  CatActivity,
  CatReaction,
  CatSound,
  CatMessage,
  CatInteractionType,
} from './catTypes';
import {
  CompanionExpression,
  CompanionPose,
  CompanionAccessory,
  GazeTarget,
  getTimeOfDayCategory,
} from '../companion/companionBrain';
import { generateWeatherMicroAdvice, WeatherContextData } from './catMicroAdvice';

export interface StateEngineInput {
  weather?: WeatherContextData;
  hour?: number;
  interaction?: {
    type: CatInteractionType;
    consecutiveCount?: number;
  };
  activeAlert?: {
    id: string;
    title: string;
    severity: 'red' | 'orange' | 'yellow';
  };
  locationChange?: {
    cityName: string;
  };
  isSleeping?: boolean;
}

export class CatStateEngine {
  /**
   * Determine primary mood from environmental & behavioral signals.
   */
  public static evaluateMood(input: StateEngineInput): CatMood {
    const w = input.weather;
    const hour = input.hour ?? new Date().getHours();
    const timeCat = getTimeOfDayCategory(hour);

    // 1. Critical alerts
    if (input.activeAlert) {
      return 'stormy';
    }

    // 2. Weather extremes
    if (w?.isThunder) return 'stormy';
    if (w?.isHeavyRain) return 'worried';
    if (w?.isRain) return 'rainy';
    if (w?.windSpeed && w.windSpeed >= 35) return 'windy';
    if (w?.aqi && w.aqi > 200) return 'sick-air';
    if (w?.temp !== undefined && w.temp >= 36) return 'hot';
    if (w?.temp !== undefined && w.temp <= 8) return 'cold';

    // 3. Time of day
    if (timeCat === 'late_night') return 'sleepy';
    if (timeCat === 'night') return 'relaxed';
    if (timeCat === 'morning') return 'happy';

    // 4. Persona adaptation
    const p = w?.dominantPersona?.toLowerCase();
    if (p === 'fitness') return 'fitness';
    if (p === 'beach') return 'beach';
    if (p === 'parent') return 'parent';
    if (p === 'agriculture') return 'agriculture';
    if (p === 'commuter') return 'commuter';
    if (p === 'event') return 'event';
    if (p === 'travel') return 'travelling';

    // 5. Pleasant default
    return 'relaxed';
  }

  /**
   * Determine cat activity from current mood & environmental state.
   */
  public static evaluateActivity(mood: CatMood, input: StateEngineInput): CatActivity {
    if (input.isSleeping || mood === 'sleepy') return 'napping';
    if (mood === 'stormy' || mood === 'worried') return 'seeking_shelter';
    if (mood === 'hot') return 'panting';
    if (mood === 'cold') return 'shivering';
    if (mood === 'rainy') return 'gazing_sky';
    if (mood === 'fitness' || mood === 'energetic') return 'exercising';
    if (mood === 'agriculture') return 'farming';
    if (mood === 'commuter') return 'commuting';
    if (mood === 'travelling') return 'checking_map';
    if (mood === 'beach') return 'basking';
    if (mood === 'event') return 'celebrating';
    if (mood === 'parent') return 'parenting';
    return 'resting';
  }

  /**
   * Map CatMood and CatActivity to visual rendering primitives.
   */
  public static mapToVisuals(mood: CatMood, activity: CatActivity): {
    expression: CompanionExpression;
    pose: CompanionPose;
    accessory: CompanionAccessory;
    gazeTarget: GazeTarget;
  } {
    switch (mood) {
      case 'stormy':
        return { expression: 'startled', pose: 'duck_hide', accessory: 'none', gazeTarget: 'up' };
      case 'worried':
        return { expression: 'surprised', pose: 'sit', accessory: 'umbrella', gazeTarget: 'up' };
      case 'rainy':
        return { expression: 'neutral', pose: 'umbrella_hold', accessory: 'umbrella', gazeTarget: 'up' };
      case 'windy':
        return { expression: 'surprised', pose: 'sit', accessory: 'scarf', gazeTarget: 'left' };
      case 'hot':
        return { expression: 'sleepy', pose: 'sit', accessory: 'fan', gazeTarget: 'down' };
      case 'cold':
        return { expression: 'neutral', pose: 'sit', accessory: 'scarf', gazeTarget: 'user' };
      case 'sick-air':
        return { expression: 'annoyed', pose: 'sit', accessory: 'none', gazeTarget: 'down' };
      case 'sleepy':
        return { expression: 'sleeping', pose: 'curl_sleep', accessory: 'eye_mask', gazeTarget: 'down' };
      case 'excited':
      case 'energetic':
      case 'fitness':
        return { expression: 'happy', pose: 'bongo_tap', accessory: 'none', gazeTarget: 'user' };
      case 'beach':
        return { expression: 'happy', pose: 'perch', accessory: 'sunglasses', gazeTarget: 'up' };
      case 'travelling':
        return { expression: 'curious', pose: 'perch', accessory: 'none', gazeTarget: 'right' };
      case 'happy':
        return { expression: 'happy', pose: 'wave', accessory: 'none', gazeTarget: 'user' };
      case 'relaxed':
      case 'neutral':
      default:
        return { expression: 'neutral', pose: 'perch', accessory: 'none', gazeTarget: 'user' };
    }
  }

  /**
   * Produce complete CatReaction for user interaction.
   */
  public static computeInteractionReaction(type: CatInteractionType, consecutiveTaps: number = 1): CatReaction {
    // Consecutive taps easter egg (3+ taps) -> Playful bongo tap
    if (type === 'single_tap' && consecutiveTaps >= 3) {
      return {
        mood: 'excited',
        activity: 'celebrating',
        expression: 'blissful',
        pose: 'bongo_tap',
        accessory: 'none',
        gazeTarget: 'user',
        animation: 'paw_tap',
        message: {
          id: 'tap_combo',
          text: 'Purr! You found the secret bongo rhythm! 🐾',
          category: 'discoverable',
          importance: 'medium',
        },
        sound: 'happy_meow',
        priority: 'INTERACTION',
        priorityScore: 75,
        durationMs: 2500,
      };
    }

    if (type === 'long_press') {
      return {
        mood: 'happy',
        activity: 'grooming',
        expression: 'blissful',
        pose: 'sit',
        accessory: 'none',
        gazeTarget: 'user',
        animation: 'tail_swish',
        message: {
          id: 'long_cuddle',
          text: 'Soft purrs... you\'re a true friend. ❤️',
          category: 'interaction',
          importance: 'medium',
        },
        sound: 'purr',
        priority: 'INTERACTION',
        priorityScore: 72,
        durationMs: 3000,
      };
    }

    if (type === 'pet') {
      return {
        mood: 'happy',
        activity: 'grooming',
        expression: 'blissful',
        pose: 'sit',
        accessory: 'none',
        gazeTarget: 'user',
        animation: 'tail_swish',
        message: {
          id: 'pet_reaction',
          text: '*Happy purrs*',
          category: 'interaction',
          importance: 'low',
        },
        sound: 'purr',
        priority: 'INTERACTION',
        priorityScore: 68,
        durationMs: 2200,
      };
    }

    if (type === 'treat') {
      return {
        mood: 'excited',
        activity: 'celebrating',
        expression: 'happy',
        pose: 'wave',
        accessory: 'none',
        gazeTarget: 'user',
        animation: 'paw_tap',
        message: {
          id: 'treat_reaction',
          text: 'Mmm, delicious treat! Thank you!',
          category: 'interaction',
          importance: 'low',
        },
        sound: 'chirp',
        priority: 'INTERACTION',
        priorityScore: 68,
        durationMs: 2200,
      };
    }

    // Regular single tap
    const tapPhrases = [
      'Observing the forecast with you!',
      'Mausam is looking dynamic today.',
      'Always keeping an eye on the skies!',
      'Need a quick weather forecast?',
    ];
    const chosen = tapPhrases[Math.floor(Math.random() * tapPhrases.length)];

    return {
      mood: 'happy',
      activity: 'resting',
      expression: 'happy',
      pose: 'perch',
      accessory: 'none',
      gazeTarget: 'user',
      animation: 'head_bob',
      message: {
        id: 'tap_standard',
        text: chosen,
        category: 'interaction',
        importance: 'low',
      },
      sound: 'meow',
      priority: 'INTERACTION',
      priorityScore: 65,
      durationMs: 2200,
    };
  }

  /**
   * Produce weather & alert reaction.
   */
  public static computeEnvironmentReaction(input: StateEngineInput): CatReaction {
    const mood = this.evaluateMood(input);
    const activity = this.evaluateActivity(mood, input);
    const visuals = this.mapToVisuals(mood, activity);
    let message: CatMessage | null = null;
    let sound: CatSound = 'meow';

    if (input.activeAlert) {
      message = {
        id: `alert_${input.activeAlert.id}`,
        text: `${input.activeAlert.title}! Safety first.`,
        category: 'alert',
        importance: 'high',
      };
      sound = 'surprised';
    } else if (input.locationChange) {
      message = {
        id: `loc_${input.locationChange.cityName}`,
        text: `Arrived in ${input.locationChange.cityName}! Checking skies.`,
        category: 'weather',
        importance: 'medium',
      };
      sound = 'chirp';
    } else if (input.weather) {
      message = generateWeatherMicroAdvice(input.weather);
      if (input.weather.isThunder) sound = 'surprised';
      else if (input.weather.isRain) sound = 'tiny_meow';
      else if (mood === 'sleepy') sound = 'yawn';
      else sound = 'meow';
    }

    return {
      mood,
      activity,
      expression: visuals.expression,
      pose: visuals.pose,
      accessory: visuals.accessory,
      gazeTarget: visuals.gazeTarget,
      message,
      sound,
      priority: input.activeAlert ? 'CRITICAL' : 'CONTEXTUAL',
      priorityScore: input.activeAlert ? 100 : 45,
      durationMs: input.activeAlert ? 4500 : 2500,
    };
  }
}
