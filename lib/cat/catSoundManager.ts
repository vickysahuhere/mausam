/**
 * Centralized Cat Sound Manager for Mausam
 * Provides copyright-free, procedurally synthesized cute cat audio
 * Safe, debounced, crash-proof, and obeys user preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatSound } from './catTypes';

const SOUND_PREF_KEY = '@mausam_cat_sound_enabled';

type SoundTriggerCallback = (sound: CatSound, volume: number) => void;

class CatSoundManager {
  private isSoundEnabled: boolean = true;
  private soundCallback: SoundTriggerCallback | null = null;
  private lastPlayTimestamp: number = 0;
  private cooldownMs: number = 600;
  private masterVolume: number = 0.7;

  constructor() {
    this.loadPreference();
  }

  public async loadPreference(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(SOUND_PREF_KEY);
      if (stored !== null) {
        this.isSoundEnabled = JSON.parse(stored);
      }
    } catch {
      this.isSoundEnabled = true;
    }
    return this.isSoundEnabled;
  }

  public async setSoundEnabled(enabled: boolean): Promise<void> {
    this.isSoundEnabled = enabled;
    try {
      await AsyncStorage.setItem(SOUND_PREF_KEY, JSON.stringify(enabled));
    } catch {
      // Graceful no-op
    }
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  public resetCooldown(): void {
    this.lastPlayTimestamp = 0;
  }

  public registerBridge(cb: SoundTriggerCallback): () => void {
    this.soundCallback = cb;
    return () => {
      if (this.soundCallback === cb) {
        this.soundCallback = null;
      }
    };
  }

  public play(sound: CatSound, options?: { force?: boolean; volume?: number }): boolean {
    if (!this.isSoundEnabled && !options?.force) {
      return false;
    }

    const now = Date.now();
    if (!options?.force && now - this.lastPlayTimestamp < this.cooldownMs) {
      return false; // Debounce / cooldown active
    }

    this.lastPlayTimestamp = now;
    const vol = options?.volume ?? this.masterVolume;

    try {
      if (this.soundCallback) {
        this.soundCallback(sound, vol);
        return true;
      }
    } catch {
      // Audio failure must never crash the app
    }
    return false;
  }

  public playMeow(volume?: number): boolean {
    return this.play('meow', { volume });
  }

  public playTinyMeow(volume?: number): boolean {
    return this.play('tiny_meow', { volume });
  }

  public playHappyMeow(volume?: number): boolean {
    return this.play('happy_meow', { volume });
  }

  public playPurr(volume?: number): boolean {
    return this.play('purr', { volume });
  }

  public playYawn(volume?: number): boolean {
    return this.play('yawn', { volume });
  }

  public playChirp(volume?: number): boolean {
    return this.play('chirp', { volume });
  }

  public playReaction(sound: CatSound): boolean {
    return this.play(sound);
  }
}

export const catSoundManager = new CatSoundManager();
