/**
 * Cat Behavior Registry — The Animation Bible for "Mimi"
 * 
 * Formalizes all character behaviors across:
 * - Layer 1: Micro-Life (continuous breathing, multi-mode blinking, ear twitches, dynamic tail, weight shifts)
 * - Layer 2: Behavior (idle look-around, stretching, yawning, grooming, user eye-contact, playful hops)
 * - Layer 3: Contextual Events (weather reactions, umbrella lifecycles, wind bracing, storm cover)
 */

import {
  CompanionExpression,
  CompanionPose,
  CompanionAccessory,
  GazeTarget,
  CompanionPriority,
} from '../companion/companionBrain';
import { CatMood, CatSound } from './catTypes';

export type BehaviorLayer = 1 | 2 | 3;
export type BehaviorRarity = 'common' | 'uncommon' | 'rare' | 'very_rare';

export interface BehaviorDefinition {
  id: string;
  name: string;
  layer: BehaviorLayer;
  priority: CompanionPriority;
  priorityScore: number;
  durationMs: number;
  cooldownMs: number;
  interruptible: boolean;
  rarity: BehaviorRarity;
  rarityWeight: number; // common=50, uncommon=25, rare=10, very_rare=3
  expression: CompanionExpression;
  pose: CompanionPose;
  accessory?: CompanionAccessory;
  gazeTarget?: GazeTarget;
  sound?: CatSound | null;
  moodCompatibility?: CatMood[];
  description: string;
}

export const RARITY_WEIGHTS: Record<BehaviorRarity, number> = {
  common: 50,
  uncommon: 25,
  rare: 10,
  very_rare: 3,
};

/**
 * Complete Catalogue of Layer 2 & 3 Autonomous Behaviors
 */
export const CAT_BEHAVIOR_CATALOGUE: Record<string, BehaviorDefinition> = {
  // ==========================================
  // LAYER 2: IDLE BEHAVIORS (Occasional actions)
  // ==========================================
  LOOK_AROUND: {
    id: 'LOOK_AROUND',
    name: 'Curious Look Around',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 18,
    durationMs: 3200,
    cooldownMs: 25000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'curious',
    pose: 'perch',
    gazeTarget: 'left',
    description: 'Cat glances to the left, pauses thoughtfully, then glances right before returning forward.',
  },

  GLANCE_SKY: {
    id: 'GLANCE_SKY',
    name: 'Contemplate Sky',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 18,
    durationMs: 2800,
    cooldownMs: 30000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'neutral',
    pose: 'perch',
    gazeTarget: 'up',
    description: 'Cat looks upward toward clouds or sunshine, blinks softly, and watches the atmosphere.',
  },

  CAT_STRETCH: {
    id: 'CAT_STRETCH',
    name: 'Pleasant Full Stretch',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 22,
    durationMs: 3200,
    cooldownMs: 45000,
    interruptible: false, // Stretch completes gracefully with follow-through
    rarity: 'uncommon',
    rarityWeight: RARITY_WEIGHTS.uncommon,
    expression: 'neutral',
    pose: 'stretch_yawn',
    gazeTarget: 'user',
    description: 'Preparation crouch, arching front stretch, gentle hold, release and settle back to perch.',
  },

  CAT_YAWN: {
    id: 'CAT_YAWN',
    name: 'Cozy Yawn',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 22,
    durationMs: 2600,
    cooldownMs: 50000,
    interruptible: false,
    rarity: 'rare',
    rarityWeight: RARITY_WEIGHTS.rare,
    expression: 'sleepy',
    pose: 'sit',
    gazeTarget: 'user',
    sound: 'yawn',
    description: 'Sleepy squint, slight head tilt back, gentle yawn, slow blink, settling into comfortable rest.',
  },

  CAT_GROOM: {
    id: 'CAT_GROOM',
    name: 'Paw Face Grooming',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 20,
    durationMs: 2700,
    cooldownMs: 40000,
    interruptible: true,
    rarity: 'uncommon',
    rarityWeight: RARITY_WEIGHTS.uncommon,
    expression: 'blissful',
    pose: 'sit',
    gazeTarget: 'down',
    description: 'Cat looks down, raises right paw toward cheek, performs sweet grooming motion, then settles.',
  },

  LOOK_USER: {
    id: 'LOOK_USER',
    name: 'Loving Companion Gaze',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 20,
    durationMs: 2500,
    cooldownMs: 30000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'happy',
    pose: 'perch',
    gazeTarget: 'user',
    description: 'Cat looks right at the user with bright anime eyes, head tilted slightly in gentle acknowledgement.',
  },

  PLAYFUL_BOUNCE: {
    id: 'PLAYFUL_BOUNCE',
    name: 'Playful Little Hop',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 24,
    durationMs: 1800,
    cooldownMs: 60000,
    interruptible: false,
    rarity: 'rare',
    rarityWeight: RARITY_WEIGHTS.rare,
    expression: 'happy',
    pose: 'wave',
    gazeTarget: 'user',
    sound: 'chirp',
    description: 'A sudden burst of feline joy: tiny hop, paw tap, and energetic tail swish.',
  },

  WEIGHT_SHIFT: {
    id: 'WEIGHT_SHIFT',
    name: 'Posture Shift & Settle',
    layer: 2,
    priority: 'AMBIENT',
    priorityScore: 16,
    durationMs: 2200,
    cooldownMs: 20000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'neutral',
    pose: 'perch',
    gazeTarget: 'user',
    description: 'Subtle lateral weight shift and body settling that makes sitting feel physically real.',
  },

  // ==========================================
  // LAYER 3: CONTEXTUAL WEATHER & EVENTS
  // ==========================================
  RAIN_UMBRELLA_CHECK: {
    id: 'RAIN_UMBRELLA_CHECK',
    name: 'Rain Observation & Umbrella Check',
    layer: 3,
    priority: 'CONTEXTUAL',
    priorityScore: 45,
    durationMs: 7000,
    cooldownMs: 50000,
    interruptible: false,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'neutral',
    pose: 'umbrella_hold',
    accessory: 'umbrella',
    gazeTarget: 'up',
    sound: 'tiny_meow',
    description: 'Cat looks up at falling rain, brings out umbrella with anticipation, holds with gentle breathing sway, then stows.',
  },

  WIND_BRACE: {
    id: 'WIND_BRACE',
    name: 'Wind Breeze React',
    layer: 3,
    priority: 'CONTEXTUAL',
    priorityScore: 45,
    durationMs: 4500,
    cooldownMs: 45000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'surprised',
    pose: 'sit',
    accessory: 'scarf',
    gazeTarget: 'left',
    description: 'Cat braces against breezy wind, ears flattening slightly and tail reacting dynamically.',
  },

  COLD_SHIVER_CURL: {
    id: 'COLD_SHIVER_CURL',
    name: 'Chilly Shiver & Settle',
    layer: 3,
    priority: 'CONTEXTUAL',
    priorityScore: 45,
    durationMs: 5500,
    cooldownMs: 50000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'neutral',
    pose: 'curl_sleep',
    accessory: 'scarf',
    gazeTarget: 'user',
    description: 'Cat feels the crisp chill, gives a tiny shiver, and curls snugly with scarf.',
  },

  HOT_FAN_BASK: {
    id: 'HOT_FAN_BASK',
    name: 'Summer Warmth Fan Rest',
    layer: 3,
    priority: 'CONTEXTUAL',
    priorityScore: 45,
    durationMs: 5500,
    cooldownMs: 50000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'sleepy',
    pose: 'sit',
    accessory: 'fan',
    gazeTarget: 'down',
    description: 'Warm summer afternoon: slow languid idle with soothing handheld cooling fan.',
  },

  STORM_SHELTER_HIDE: {
    id: 'STORM_SHELTER_HIDE',
    name: 'Thunderstorm Shelter Stance',
    layer: 3,
    priority: 'CRITICAL',
    priorityScore: 95,
    durationMs: 6500,
    cooldownMs: 35000,
    interruptible: false,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'startled',
    pose: 'duck_hide',
    accessory: 'none',
    gazeTarget: 'up',
    sound: 'surprised',
    description: 'Thunder rolls: cat drops low with alert ears tucked back, prioritizing safety.',
  },

  NIGHT_CIRCADIAN_DOZE: {
    id: 'NIGHT_CIRCADIAN_DOZE',
    name: 'Nighttime Drowse & Eye Mask',
    layer: 3,
    priority: 'AMBIENT',
    priorityScore: 25,
    durationMs: 8000,
    cooldownMs: 60000,
    interruptible: true,
    rarity: 'common',
    rarityWeight: RARITY_WEIGHTS.common,
    expression: 'sleeping',
    pose: 'curl_sleep',
    accessory: 'eye_mask',
    gazeTarget: 'down',
    sound: 'yawn',
    description: 'Late night quiet: slow drowsy eyes closing, cozy eye mask slipping on, peaceful slumber.',
  },
};
