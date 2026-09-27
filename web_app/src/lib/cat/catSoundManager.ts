/**
 * Centralized Cat Sound Manager for Mausam
 * Production-Grade Single-Concurrency Audio Orchestrator
 *
 * Enforces:
 * 1. Strict single-sound concurrency (NO overlapping sounds).
 * 2. Strict priority hierarchy (CRITICAL > HIGH > NORMAL > LOW).
 * 3. Graceful interruption of low-priority / ambient sounds (e.g. purr) by higher-priority events.
 * 4. Max-1 controlled audio queue with stale-sound expiration and priority replacement.
 * 5. Per-sound cooldowns + global debouncing against rapid taps and React re-render cascades.
 * 6. Per-sound loudness normalization table.
 * 7. Background/foreground app lifecycle handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatSound } from './catTypes';

const SOUND_PREF_KEY = '@mausam_cat_sound_enabled';

export enum CatAudioPriority {
  LOW = 0,      // Idle behavior, ambient purr, random cute reactions
  NORMAL = 1,   // User interaction (single tap, pet, treat, wakeup)
  HIGH = 2,     // Important weather reactions, noticeable alerts
  CRITICAL = 3, // Severe emergency weather warnings
}

export type CatSoundCategory = 'VOCAL' | 'AMBIENT' | 'REACTION' | 'INTERACTION' | 'ALERT';

export interface SoundMetadata {
  category: CatSoundCategory;
  durationMs: number;
  volumeMultiplier: number;
  cooldownMs: number;
}

export const SOUND_SPECS: Record<CatSound, SoundMetadata> = {
  meow: {
    category: 'VOCAL',
    durationMs: 1804,
    volumeMultiplier: 0.85,
    cooldownMs: 500,
  },
  happy_meow: {
    category: 'VOCAL',
    durationMs: 990,
    volumeMultiplier: 0.65,
    cooldownMs: 600,
  },
  tiny_meow: {
    category: 'VOCAL',
    durationMs: 550,
    volumeMultiplier: 0.85,
    cooldownMs: 450,
  },
  chirp: {
    category: 'VOCAL',
    durationMs: 556,
    volumeMultiplier: 0.70,
    cooldownMs: 500,
  },
  purr: {
    category: 'AMBIENT',
    durationMs: 3528,
    volumeMultiplier: 0.60,
    cooldownMs: 1200,
  },
  surprised: {
    category: 'ALERT',
    durationMs: 1630,
    volumeMultiplier: 0.75,
    cooldownMs: 1500,
  },
  playful: {
    category: 'REACTION',
    durationMs: 1379,
    volumeMultiplier: 0.70,
    cooldownMs: 600,
  },
  yawn: {
    category: 'VOCAL',
    durationMs: 1608,
    volumeMultiplier: 0.65,
    cooldownMs: 2000,
  },
  bongo: {
    category: 'INTERACTION',
    durationMs: 1550,
    volumeMultiplier: 0.85,
    cooldownMs: 600,
  },
};

export interface PlayCatSoundOptions {
  priority?: CatAudioPriority;
  volume?: number;
  force?: boolean;
  reason?: string;
}

export interface QueuedSound {
  sound: CatSound;
  priority: CatAudioPriority;
  volume?: number;
  queuedAt: number;
  reason?: string;
}

export interface AudioBridgeCallbacks {
  play: (sound: CatSound, volume: number, priority: CatAudioPriority) => void;
  stop: () => void;
}

export type SoundTriggerCallback =
  | ((sound: CatSound, volume: number) => void)
  | AudioBridgeCallbacks;

const GLOBAL_COOLDOWN_MS = 350;
const MAX_QUEUE_AGE_MS = 1500;

class CatSoundManager {
  private isSoundEnabled: boolean = false;
  private soundCallback: AudioBridgeCallbacks | null = null;
  private lastPlayTimestamp: number = 0;
  private perSoundLastPlay: Map<CatSound, number> = new Map();
  private masterVolume: number = 0.75;

  // Single Concurrency State
  private isPlaying: boolean = false;
  private currentSound: CatSound | null = null;
  private currentPriority: CatAudioPriority | null = null;
  private currentStartTime: number = 0;
  private playbackTimeout: ReturnType<typeof setTimeout> | null = null;

  // Single-Slot Audio Queue
  private queuedSound: QueuedSound | null = null;

  constructor() {
    this.loadPreference();
  }

  public handleAppStateChange(nextState: string): void {
    if (nextState !== 'active') {
      // App went to background/inactive -> clean shutdown of playing audio
      this.stopCurrentSound();
      this.queuedSound = null;
    }
  }

  public async loadPreference(): Promise<boolean> {
    // Silenced for now — database, audio synthesizers, and specs remain intact internally ("only we know")
    this.isSoundEnabled = false;
    return this.isSoundEnabled;
  }

  public async setSoundEnabled(enabled: boolean): Promise<void> {
    this.isSoundEnabled = enabled;
    if (!enabled) {
      this.stopCurrentSound();
      this.queuedSound = null;
    }
    try {
      await AsyncStorage.setItem(SOUND_PREF_KEY, JSON.stringify(enabled));
    } catch {
      // Graceful no-op
    }
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSound(): CatSound | null {
    return this.currentSound;
  }

  public resetCooldown(): void {
    this.lastPlayTimestamp = 0;
    this.perSoundLastPlay.clear();
    this.isPlaying = false;
    this.currentSound = null;
    this.currentPriority = null;
    this.queuedSound = null;
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }
  }

  public registerBridge(cb: SoundTriggerCallback): () => void {
    if (typeof cb === 'function') {
      this.soundCallback = {
        play: (sound, vol) => cb(sound, vol),
        stop: () => {},
      };
    } else {
      this.soundCallback = cb;
    }

    return () => {
      this.soundCallback = null;
    };
  }

  /**
   * Primary entry point for playing a cat sound.
   * Evaluates priority, concurrency, cooldowns, and queueing rules.
   */
  public play(sound: CatSound, options?: PlayCatSoundOptions): boolean {
    if (!this.isSoundEnabled && !options?.force) {
      return false;
    }

    const priority = options?.priority ?? CatAudioPriority.NORMAL;
    const now = Date.now();
    const spec = SOUND_SPECS[sound] ?? SOUND_SPECS.meow;

    // 1. Critical alerts bypass normal cooldowns
    const isCritical = priority === CatAudioPriority.CRITICAL;

    // 2. Strict Concurrency Evaluation: If a sound is currently playing
    if (this.isPlaying && !options?.force) {
      const activePriority = this.currentPriority ?? CatAudioPriority.NORMAL;

      // Condition A: Higher priority preempts lower priority immediately
      // Example: HIGH/CRITICAL alert interrupts NORMAL tap sound or LOW purr
      if (priority > activePriority) {
        this.stopCurrentSound();
        return this.executePlayback(sound, priority, options?.volume);
      }

      // Condition B: Purr (Ambient) is always interruptible by any interactive (NORMAL+) sound
      if (this.currentSound === 'purr' && priority >= CatAudioPriority.NORMAL) {
        this.stopCurrentSound();
        return this.executePlayback(sound, priority, options?.volume);
      }

      // Condition C: Sound cannot interrupt current sound -> Queue or Discard
      return this.handleBusyPlayback(sound, priority, options?.volume, options?.reason);
    }

    // 3. Not currently playing: evaluate cooldowns (unless critical or forced)
    if (!options?.force && !isCritical) {
      // Global cooldown: ensure minimum spacing between sounds
      if (now - this.lastPlayTimestamp < GLOBAL_COOLDOWN_MS) {
        return this.handleBusyPlayback(sound, priority, options?.volume, options?.reason);
      }

      // Per-sound cooldown
      const lastSoundPlay = this.perSoundLastPlay.get(sound) ?? 0;
      if (now - lastSoundPlay < spec.cooldownMs) {
        return this.handleBusyPlayback(sound, priority, options?.volume, options?.reason);
      }
    }

    // 4. Safe to execute playback immediately
    return this.executePlayback(sound, priority, options?.volume);
  }

  /**
   * Handles audio requests arriving while the engine is currently busy.
   * Never overlaps! Implements a 1-slot priority queue with stale expiration.
   */
  private handleBusyPlayback(
    sound: CatSound,
    priority: CatAudioPriority,
    volume?: number,
    reason?: string
  ): boolean {
    // Phase 6 Rule: Never queue low-priority or idle sounds
    if (priority <= CatAudioPriority.LOW) {
      return false;
    }

    const now = Date.now();

    // If no sound is queued, queue this one
    if (!this.queuedSound) {
      this.queuedSound = {
        sound,
        priority,
        volume,
        queuedAt: now,
        reason,
      };
      return true;
    }

    // If already queued: higher priority replaces lower priority
    if (priority > this.queuedSound.priority) {
      this.queuedSound = {
        sound,
        priority,
        volume,
        queuedAt: now,
        reason,
      };
      return true;
    }

    // Duplicate sound deduplication (refresh timestamp if same, otherwise ignore)
    if (this.queuedSound.sound === sound) {
      this.queuedSound.queuedAt = now;
    }

    return false;
  }

  /**
   * Dispatches sound execution to the active bridge and starts concurrency lock.
   */
  private executePlayback(sound: CatSound, priority: CatAudioPriority, customVolume?: number): boolean {
    const now = Date.now();
    const spec = SOUND_SPECS[sound] ?? SOUND_SPECS.meow;

    // Normalize volume using per-sound multiplier table
    const targetVol = Math.min(
      Math.max((customVolume ?? this.masterVolume) * spec.volumeMultiplier, 0.05),
      1.0
    );

    this.lastPlayTimestamp = now;
    this.perSoundLastPlay.set(sound, now);
    this.isPlaying = true;
    this.currentSound = sound;
    this.currentPriority = priority;
    this.currentStartTime = now;

    // Safety watchdog: clear playback lock if bridge fails to report completion
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
    }
    const watchdogDuration = spec.durationMs + 250;
    this.playbackTimeout = setTimeout(() => {
      this.notifyPlaybackEnded(sound);
    }, watchdogDuration);

    try {
      if (this.soundCallback) {
        this.soundCallback.play(sound, targetVol, priority);
        return true;
      }
    } catch {
      this.isPlaying = false;
      this.currentSound = null;
      this.currentPriority = null;
    }

    return false;
  }

  /**
   * Called by the bridge (or watchdog) when sound playback completes.
   * Releases concurrency lock and processes the 1-slot queue.
   */
  public notifyPlaybackEnded(sound: CatSound): void {
    if (this.currentSound !== sound && this.currentSound !== null) {
      return; // Ignore stale notifications
    }

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    this.isPlaying = false;
    this.currentSound = null;
    this.currentPriority = null;

    // Process queued item if still valid
    if (this.queuedSound) {
      const next = this.queuedSound;
      this.queuedSound = null;

      const age = Date.now() - next.queuedAt;
      if (age <= MAX_QUEUE_AGE_MS && this.isSoundEnabled) {
        this.play(next.sound, {
          priority: next.priority,
          volume: next.volume,
          reason: next.reason,
          force: true, // Force bypass debounce for legitimately queued item
        });
      }
    }
  }

  /**
   * Immediately stops any active audio playback.
   */
  public stopCurrentSound(): void {
    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }

    this.isPlaying = false;
    this.currentSound = null;
    this.currentPriority = null;

    try {
      if (this.soundCallback && this.soundCallback.stop) {
        this.soundCallback.stop();
      }
    } catch {
      // Safe no-op
    }
  }

  // --- Convenience Helper Methods (Backwards Compatible) ---

  public playMeow(volume?: number): boolean {
    return this.play('meow', { priority: CatAudioPriority.NORMAL, volume, reason: 'tap_meow' });
  }

  public playTinyMeow(volume?: number): boolean {
    return this.play('tiny_meow', { priority: CatAudioPriority.NORMAL, volume, reason: 'tiny_meow' });
  }

  public playHappyMeow(volume?: number): boolean {
    return this.play('happy_meow', { priority: CatAudioPriority.NORMAL, volume, reason: 'happy_meow' });
  }

  public playPurr(volume?: number): boolean {
    return this.play('purr', { priority: CatAudioPriority.LOW, volume, reason: 'purr' });
  }

  public playYawn(volume?: number): boolean {
    return this.play('yawn', { priority: CatAudioPriority.NORMAL, volume, reason: 'yawn' });
  }

  public playChirp(volume?: number): boolean {
    return this.play('chirp', { priority: CatAudioPriority.NORMAL, volume, reason: 'chirp' });
  }

  public playSurprised(volume?: number): boolean {
    return this.play('surprised', { priority: CatAudioPriority.HIGH, volume, reason: 'surprised' });
  }

  public playBongo(volume?: number): boolean {
    return this.play('bongo', { priority: CatAudioPriority.NORMAL, volume, reason: 'bongo_rhythm' });
  }

  public playReaction(sound: CatSound, priority: CatAudioPriority = CatAudioPriority.NORMAL): boolean {
    return this.play(sound, { priority });
  }

  public destroy(): void {
    this.stopCurrentSound();
    this.soundCallback = null;
  }
}

export const catSoundManager = new CatSoundManager();
