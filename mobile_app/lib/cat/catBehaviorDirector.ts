/**
 * Cat Behavior Director — Autonomous Character Intelligence Engine
 * 
 * Enforces the core animation philosophies:
 * 1. ANTI-REPETITION: 5-slot ring buffer prevents back-to-back repetition of actions.
 * 2. QUIET PERIODS: Mandates 12-25s rest intervals between major behaviors where only
 *    Layer 1 micro-life (breathing, blinking, subtle settling) is active.
 * 3. WEIGHTED SELECTION: Probabilistic selection respecting rarity and environmental compatibility.
 * 4. INTERRUPTIBILITY: Protects multi-stage animations (stretches, prop lifecycles) from
 *    being cut short by low-priority idles, while allowing critical alerts/user taps to preempt.
 */

import {
  BehaviorDefinition,
  CAT_BEHAVIOR_CATALOGUE,
} from './catBehaviorRegistry';
import { CatMood } from './catTypes';
import { getTimeOfDayCategory } from '../companion/companionBrain';

export interface DirectorEnvironment {
  temp?: number;
  isRain?: boolean;
  isThunder?: boolean;
  windSpeed?: number;
  hour?: number;
  inactivitySeconds: number;
  currentMood: CatMood;
  isSleeping: boolean;
}

export class CatBehaviorDirector {
  private static recentHistory: string[] = [];
  private static cooldowns: Record<string, number> = {};
  private static lastBehaviorTimestamp: number = 0;
  private static nextAllowedBehaviorTimestamp: number = 0;

  /**
   * Minimum required quiet period (in ms) between autonomous Layer 2/3 behaviors.
   * Default: 12,000ms - 22,000ms. During this time, Mimi simply breathes and exists naturally.
   */
  public static getQuietPeriodDuration(): number {
    return Math.floor(12000 + Math.random() * 10000);
  }

  /**
   * Decide the next autonomous behavior to execute.
   * Returns null if inside a Quiet Period, if currently busy with a non-interruptible action,
   * or if no eligible behavior passes cooldown & environmental filters.
   */
  public static selectNextBehavior(
    env: DirectorEnvironment,
    currentScore: number = 0
  ): BehaviorDefinition | null {
    const now = Date.now();

    // 1. Enforce Quiet Period — Mimi must have quiet breathing time between behaviors!
    if (now < this.nextAllowedBehaviorTimestamp) {
      return null;
    }

    // 2. Protect non-interruptible actions or active high-priority states
    if (currentScore > 20) {
      return null;
    }

    const hour = env.hour ?? new Date().getHours();
    const timeCat = getTimeOfDayCategory(hour);

    // 3. Priority check: Environmental Layer 3 events
    if (env.isThunder) {
      const storm = CAT_BEHAVIOR_CATALOGUE.STORM_SHELTER_HIDE;
      if (this.canTrigger(storm, now)) {
        this.recordExecution(storm, now);
        return storm;
      }
    }

    if (env.isRain) {
      const rain = CAT_BEHAVIOR_CATALOGUE.RAIN_UMBRELLA_CHECK;
      if (this.canTrigger(rain, now)) {
        this.recordExecution(rain, now);
        return rain;
      }
    }

    if (env.windSpeed && env.windSpeed >= 35) {
      const wind = CAT_BEHAVIOR_CATALOGUE.WIND_BRACE;
      if (this.canTrigger(wind, now)) {
        this.recordExecution(wind, now);
        return wind;
      }
    }

    if (env.temp !== undefined && env.temp <= 8) {
      const cold = CAT_BEHAVIOR_CATALOGUE.COLD_SHIVER_CURL;
      if (this.canTrigger(cold, now)) {
        this.recordExecution(cold, now);
        return cold;
      }
    }

    if (env.temp !== undefined && env.temp >= 35) {
      const hot = CAT_BEHAVIOR_CATALOGUE.HOT_FAN_BASK;
      if (this.canTrigger(hot, now)) {
        this.recordExecution(hot, now);
        return hot;
      }
    }

    if (timeCat === 'late_night' || (timeCat === 'night' && env.inactivitySeconds > 90)) {
      const nightDoze = CAT_BEHAVIOR_CATALOGUE.NIGHT_CIRCADIAN_DOZE;
      if (this.canTrigger(nightDoze, now)) {
        this.recordExecution(nightDoze, now);
        return nightDoze;
      }
    }

    // 4. Candidate pool of Layer 2 Idle Behaviors
    const candidateKeys: Array<keyof typeof CAT_BEHAVIOR_CATALOGUE> = [
      'LOOK_AROUND',
      'GLANCE_SKY',
      'CAT_STRETCH',
      'CAT_YAWN',
      'CAT_GROOM',
      'LOOK_USER',
      'PLAYFUL_BOUNCE',
      'WEIGHT_SHIFT',
    ];

    const eligible: BehaviorDefinition[] = [];

    for (const key of candidateKeys) {
      const def = CAT_BEHAVIOR_CATALOGUE[key];
      if (!def) continue;

      // Anti-repetition filter: Cannot be in the recent 3 behaviors
      if (this.recentHistory.slice(-3).includes(def.id)) {
        continue;
      }

      // Cooldown filter
      if (!this.canTrigger(def, now)) {
        continue;
      }

      // Contextual suitability filters
      if (def.id === 'CAT_YAWN' && timeCat !== 'late_night' && timeCat !== 'night' && env.inactivitySeconds < 45) {
        continue; // Yawning is rare and reserved for night or long stillness
      }

      if (def.id === 'GLANCE_SKY' && (timeCat === 'late_night' || env.isSleeping)) {
        continue;
      }

      eligible.push(def);
    }

    if (eligible.length === 0) {
      return null;
    }

    // 5. Weighted probabilistic selection
    const totalWeight = eligible.reduce((sum, item) => sum + item.rarityWeight, 0);
    let roll = Math.random() * totalWeight;

    for (const item of eligible) {
      roll -= item.rarityWeight;
      if (roll <= 0) {
        this.recordExecution(item, now);
        return item;
      }
    }

    const fallback = eligible[0];
    this.recordExecution(fallback, now);
    return fallback;
  }

  private static canTrigger(def: BehaviorDefinition, now: number): boolean {
    const lastTrigger = this.cooldowns[def.id] ?? 0;
    return now - lastTrigger >= def.cooldownMs;
  }

  private static recordExecution(def: BehaviorDefinition, now: number): void {
    this.cooldowns[def.id] = now;
    this.lastBehaviorTimestamp = now;

    // Enforce next quiet period: behavior duration + quiet period
    this.nextAllowedBehaviorTimestamp = now + def.durationMs + this.getQuietPeriodDuration();

    // 5-slot ring buffer
    this.recentHistory.push(def.id);
    if (this.recentHistory.length > 5) {
      this.recentHistory.shift();
    }
  }

  /**
   * Reset director state (useful for tests or hard reloads)
   */
  public static reset(): void {
    this.recentHistory = [];
    this.cooldowns = {};
    this.lastBehaviorTimestamp = 0;
    this.nextAllowedBehaviorTimestamp = 0;
  }

  /**
   * Get current history buffer (for inspection/testing)
   */
  public static getHistory(): string[] {
    return [...this.recentHistory];
  }
}
