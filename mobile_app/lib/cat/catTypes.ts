/**
 * Centralized Cat Types & Behavior Engine Definitions
 * Part of Mausam Cat Companion Major Feature Expansion
 */

import {
  CompanionExpression,
  CompanionPose,
  CompanionAccessory,
  GazeTarget,
  CompanionPriority,
} from '../companion/companionBrain';

export type CatMood =
  | 'happy'
  | 'sleepy'
  | 'excited'
  | 'relaxed'
  | 'worried'
  | 'hot'
  | 'cold'
  | 'rainy'
  | 'windy'
  | 'stormy'
  | 'sick-air'
  | 'energetic'
  | 'travelling'
  | 'beach'
  | 'fitness'
  | 'commuter'
  | 'parent'
  | 'agriculture'
  | 'event'
  | 'neutral';

export type CatActivity =
  | 'basking'
  | 'napping'
  | 'gazing_sky'
  | 'grooming'
  | 'seeking_shelter'
  | 'shivering'
  | 'panting'
  | 'checking_map'
  | 'exercising'
  | 'parenting'
  | 'commuting'
  | 'farming'
  | 'celebrating'
  | 'resting';

export type CatSound =
  | 'meow'
  | 'tiny_meow'
  | 'happy_meow'
  | 'purr'
  | 'yawn'
  | 'chirp'
  | 'surprised'
  | 'playful'
  | 'bongo';

export type CatAnimation =
  | 'idle_breathe'
  | 'tail_swish'
  | 'ear_twitch'
  | 'head_bob'
  | 'paw_tap'
  | 'stretch'
  | 'yawn'
  | 'shiver'
  | 'wind_brace'
  | 'pounce';

export interface CatMessage {
  id: string;
  text: string;
  category: 'weather' | 'advice' | 'persona' | 'alert' | 'time' | 'interaction' | 'discoverable';
  importance: 'low' | 'medium' | 'high';
}

export interface CatReaction {
  mood: CatMood;
  activity: CatActivity;
  expression: CompanionExpression;
  pose: CompanionPose;
  accessory: CompanionAccessory;
  gazeTarget: GazeTarget;
  animation?: CatAnimation;
  message?: CatMessage | null;
  sound?: CatSound | null;
  priority: CompanionPriority;
  priorityScore: number;
  durationMs: number;
}

export interface CatThemeStyle {
  themeId: string;
  coatColor: string;
  earInnerColor: string;
  outlineColor: string;
  outlineWidth: number;
  cheekColor: string;
  eyeColor: string;
  noseColor: string;
  auraGlowColor?: string;
  shadowStyle: 'glass_ambient' | 'comic_offset' | 'flat_soft' | 'neon_glow';
  cardSurfaceTint?: string;
  accessoryTintColor?: string;
  motionIntensity: number; // 0 = static, 0.5 = calm, 1.0 = normal, 1.2 = energetic
}

export type CatInteractionType =
  | 'single_tap'
  | 'consecutive_tap'
  | 'long_press'
  | 'pet'
  | 'treat';
