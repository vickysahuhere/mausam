import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CompanionState,
  CompanionMood,
  CompanionExpression,
  CompanionPose,
  CompanionAccessory,
  CompanionPriority,
  GazeTarget,
  getDefaultRestingState,
  canOverrideState,
  getNextIdleRoutine,
  IdleBehavior,
  registerCompanionEventListeners,
} from '../lib/companion/companionBrain';
import { selectContextualRemark } from '../lib/companion/companionRemarks';
import { companionEvents } from '../lib/companion/companionEvents';
import { CatMood, CatActivity } from '../lib/cat/catTypes';
import { catSoundManager } from '../lib/cat/catSoundManager';
import { CatStateEngine } from '../lib/cat/catStateEngine';
import { WeatherContextData } from '../lib/cat/catMicroAdvice';
import { haptics } from '../lib/haptics';

const STORAGE_KEY = '@mausam_companion_storage_v1';
const SOUND_STORAGE_KEY = '@mausam_cat_sound_enabled';
const REACTIONS_STORAGE_KEY = '@mausam_cat_reactions_enabled';
let activeTimerId: any = null;

let debouncePersistTimeout: any = null;
function schedulePersistCompanion(data: {
  isEnabled: boolean;
  name: string;
  pettedCount: number;
  treatsGiven: number;
  affinityLevel: number;
}) {
  if (debouncePersistTimeout) {
    clearTimeout(debouncePersistTimeout);
  }
  debouncePersistTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...data,
          lastSessionTimestamp: Date.now(),
        })
      );
    } catch {
      // Non-blocking
    }
  }, 400);
}

interface CompanionStoreState {
  isEnabled: boolean;
  soundEnabled: boolean;
  reactionsEnabled: boolean;
  name: string;
  currentState: CompanionState;
  catMood: CatMood;
  catActivity: CatActivity;
  pettedCount: number;
  treatsGiven: number;
  affinityLevel: number;
  consecutiveTaps: number;
  lastTapTime: number;
  lastBehavior?: IdleBehavior;
  isInitialized: boolean;

  // Session & Inactivity Metrics
  refreshCountInSession: number;
  tempTapCountInSession: number;
  locationChangeCountInSession: number;
  lastSessionTimestamp: number;
  recentMessageIds: string[];
  processedAlertIds: string[];
  inactivitySeconds: number;
  inactivityTier: number;
  wakeStep: number;
  isWaking: boolean;

  // Actions
  initialize: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setReactionsEnabled: (enabled: boolean) => Promise<void>;
  setName: (name: string) => Promise<void>;
  wakeUp: () => void;
  triggerReaction: (params: {
    mood?: CompanionMood;
    catMood?: CatMood;
    catActivity?: CatActivity;
    expression: CompanionExpression;
    pose: CompanionPose;
    accessory?: CompanionAccessory;
    gazeTarget?: GazeTarget;
    speechText?: string | null;
    priority: CompanionPriority;
    priorityScore: number;
    durationMs: number;
  }) => boolean;
  petCat: () => void;
  feedCat: () => void;
  tapCat: () => void;
  longPressCat: () => void;
  dismissSpeech: () => void;
  tickIdle: () => void;
  incrementInactivity: (deltaSecs?: number) => void;
  resetInactivity: () => void;
  recordMessageId: (id: string) => void;
  incrementRefreshCount: () => void;
  incrementTempTapCount: () => void;
  incrementLocationChangeCount: () => void;
  syncWithAmbientWeather: (temp?: number, isRain?: boolean, isThunder?: boolean) => void;
  surfaceWeatherGuidance: (ctx: WeatherContextData) => void;
  resetAll: () => Promise<void>;
}

export const useCompanionStore = create<CompanionStoreState>((set, get) => ({
  isEnabled: true,
  soundEnabled: true,
  reactionsEnabled: true,
  name: 'Mimi',
  currentState: getDefaultRestingState(),
  catMood: 'relaxed',
  catActivity: 'resting',
  pettedCount: 0,
  treatsGiven: 0,
  affinityLevel: 10,
  consecutiveTaps: 0,
  lastTapTime: 0,
  isInitialized: false,

  refreshCountInSession: 0,
  tempTapCountInSession: 0,
  locationChangeCountInSession: 0,
  lastSessionTimestamp: Date.now(),
  recentMessageIds: [],
  processedAlertIds: [],
  inactivitySeconds: 0,
  inactivityTier: 1,
  wakeStep: 0,
  isWaking: false,

  initialize: async () => {
    if (get().isInitialized) return;

    // Register event listeners with dynamic context bridge
    registerCompanionEventListeners(
      (params) => get().triggerReaction(params),
      {
        getAffinity: () => Math.floor(get().affinityLevel / 10),
        getRecentMessageIds: () => get().recentMessageIds,
        getSessionRefreshCount: () => get().refreshCountInSession,
        getSessionTempTapCount: () => get().tempTapCountInSession,
        getSessionLocationChangeCount: () => get().locationChangeCountInSession,
        getLastSessionTime: () => get().lastSessionTimestamp,
        recordMessageId: (id) => get().recordMessageId(id),
      }
    );

    // Extra listener for alert deduplication and location reactions
    companionEvents.on('severe_alert_triggered', (payload) => {
      const { processedAlertIds, reactionsEnabled } = get();
      if (!reactionsEnabled) return;
      if (processedAlertIds.includes(payload.title)) {
        return; // Deduplicate: do not repeat on every re-render!
      }
      set({ processedAlertIds: [...processedAlertIds, payload.title] });
      if (get().soundEnabled) {
        catSoundManager.play('surprised');
      }
    });

    try {
      const [raw, soundPref, reactPref] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(SOUND_STORAGE_KEY),
        AsyncStorage.getItem(REACTIONS_STORAGE_KEY),
      ]);

      const isSound = soundPref !== null ? JSON.parse(soundPref) : true;
      const isReact = reactPref !== null ? JSON.parse(reactPref) : true;
      catSoundManager.setSoundEnabled(isSound);

      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          isEnabled: parsed.isEnabled ?? true,
          soundEnabled: isSound,
          reactionsEnabled: isReact,
          name: parsed.name ?? 'Mimi',
          pettedCount: parsed.pettedCount ?? 0,
          treatsGiven: parsed.treatsGiven ?? 0,
          affinityLevel: parsed.affinityLevel ?? 10,
          lastSessionTimestamp: parsed.lastSessionTimestamp ?? Date.now(),
          isInitialized: true,
        });

        companionEvents.emit('app_opened', undefined);
        return;
      }

      set({
        soundEnabled: isSound,
        reactionsEnabled: isReact,
        isInitialized: true,
      });
    } catch {
      set({ isInitialized: true });
    }

    companionEvents.emit('app_opened', undefined);
  },

  setEnabled: async (enabled: boolean) => {
    set({ isEnabled: enabled });
    try {
      const current = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isEnabled: enabled,
          name: current.name,
          pettedCount: current.pettedCount,
          treatsGiven: current.treatsGiven,
          affinityLevel: current.affinityLevel,
          lastSessionTimestamp: Date.now(),
        })
      );
    } catch {
      // Non-blocking
    }
  },

  setSoundEnabled: async (enabled: boolean) => {
    set({ soundEnabled: enabled });
    await catSoundManager.setSoundEnabled(enabled);
    try {
      await AsyncStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(enabled));
    } catch {
      // Non-blocking
    }
  },

  setReactionsEnabled: async (enabled: boolean) => {
    set({ reactionsEnabled: enabled });
    try {
      await AsyncStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(enabled));
    } catch {
      // Non-blocking
    }
  },

  setName: async (name: string) => {
    set({ name });
    try {
      const current = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isEnabled: current.isEnabled,
          name,
          pettedCount: current.pettedCount,
          treatsGiven: current.treatsGiven,
          affinityLevel: current.affinityLevel,
          lastSessionTimestamp: Date.now(),
        })
      );
    } catch {
      // Non-blocking
    }
  },

  triggerReaction: (params) => {
    const { currentState, isWaking, inactivityTier, reactionsEnabled } = get();
    if (!reactionsEnabled && params.priority !== 'CRITICAL') {
      return false;
    }
    if (isWaking && params.priorityScore < 80) {
      return false;
    }
    if (!canOverrideState(currentState, params.priorityScore)) {
      return false;
    }

    const isSleeping =
      currentState.expression === 'sleeping' ||
      currentState.pose === 'curl_sleep' ||
      currentState.accessory === 'eye_mask' ||
      inactivityTier >= 5;

    // Suppress speech if cat is sleeping unless waking sequence
    const speech = isSleeping && params.priority !== 'INTERACTION' ? null : (params.speechText ?? null);

    const nextState: CompanionState = {
      mood: params.mood ?? currentState.mood,
      expression: params.expression,
      pose: params.pose,
      accessory: params.accessory ?? currentState.accessory,
      gazeTarget: params.gazeTarget ?? currentState.gazeTarget ?? 'user',
      speechText: speech,
      speechKey: speech ? `${Date.now()}` : null,
      priority: params.priority,
      priorityScore: params.priorityScore,
      durationMs: params.durationMs,
      timestamp: Date.now(),
    };

    set({
      currentState: nextState,
      catMood: (params.catMood ?? (params.mood as any) ?? get().catMood),
      catActivity: (params.catActivity ?? get().catActivity),
    });

    // Auto-revert to resting state after duration finishes
    if (params.durationMs > 0) {
      if (activeTimerId) {
        clearTimeout(activeTimerId);
      }
      activeTimerId = setTimeout(() => {
        const stateNow = get().currentState;
        if (stateNow.timestamp === nextState.timestamp) {
          set({
            currentState: {
              ...stateNow,
              expression: 'neutral',
              pose: 'perch',
              gazeTarget: 'user',
              speechText: null,
              durationMs: 0,
              priority: 'AMBIENT',
              priorityScore: 10,
            },
            catActivity: 'resting',
          });
        }
      }, params.durationMs);
    }

    return true;
  },

  wakeUp: () => {
    if (get().isWaking) return;
    set({ isWaking: true, wakeStep: 1, consecutiveTaps: 0 });
    get().resetInactivity();

    if (get().soundEnabled) {
      catSoundManager.playYawn();
    }

    // Stage 1: Touch / Stir -> Drowsy, eyes crack open, sitting up, eye mask removed
    get().triggerReaction({
      mood: 'sleepy',
      catMood: 'sleepy',
      catActivity: 'napping',
      expression: 'sleepy',
      pose: 'sit',
      accessory: 'none',
      gazeTarget: 'user',
      speechText: null,
      priority: 'INTERACTION',
      priorityScore: 80,
      durationMs: 1100,
    });

    setTimeout(() => {
      if (!get().isWaking) return;
      set({ wakeStep: 2 });
      // Stage 2: Intentional stretch & yawn
      get().triggerReaction({
        mood: 'curious',
        catMood: 'relaxed',
        catActivity: 'resting',
        expression: 'neutral',
        pose: 'stretch_yawn',
        accessory: 'none',
        gazeTarget: 'user',
        speechText: null,
        priority: 'INTERACTION',
        priorityScore: 80,
        durationMs: 1400,
      });

      setTimeout(() => {
        set({ isWaking: false, wakeStep: 0 });
        // Stage 3: Fully awake, perching peacefully
        get().triggerReaction({
          mood: 'peaceful',
          catMood: 'relaxed',
          catActivity: 'resting',
          expression: 'neutral',
          pose: 'perch',
          accessory: 'none',
          gazeTarget: 'user',
          speechText: null,
          priority: 'AMBIENT',
          priorityScore: 10,
          durationMs: 0,
        });
      }, 1400);
    }, 1100);
  },

  petCat: () => {
    const { pettedCount, affinityLevel, recentMessageIds, currentState, inactivityTier, isWaking, soundEnabled } = get();
    if (isWaking) return;

    const isSleeping =
      currentState.expression === 'sleeping' ||
      currentState.pose === 'curl_sleep' ||
      currentState.accessory === 'eye_mask' ||
      inactivityTier >= 5;

    if (isSleeping) {
      get().wakeUp();
      return;
    }

    const newCount = pettedCount + 1;
    const newAffinity = Math.min(100, affinityLevel + 2);

    get().resetInactivity();
    set({
      pettedCount: newCount,
      affinityLevel: newAffinity,
      consecutiveTaps: 0,
      wakeStep: 0,
    });

    if (soundEnabled) {
      catSoundManager.playPurr();
    }
    haptics.felinePurr();

    let speech: string | null = null;
    if (newCount % 5 === 0) {
      const remark = selectContextualRemark('general', Math.floor(newAffinity / 10), recentMessageIds);
      speech = remark?.text ?? 'Purrrr...';
      if (remark) get().recordMessageId(remark.id);
    }

    get().triggerReaction({
      mood: 'happy',
      catMood: 'happy',
      catActivity: 'grooming',
      expression: 'blissful',
      pose: 'bongo_tap',
      gazeTarget: 'user',
      speechText: speech,
      priority: 'INTERACTION',
      priorityScore: 65,
      durationMs: 2400,
    });

    companionEvents.emit('user_pet_cat', undefined);

    const state = get();
    schedulePersistCompanion({
      isEnabled: state.isEnabled,
      name: state.name,
      pettedCount: newCount,
      treatsGiven: state.treatsGiven,
      affinityLevel: newAffinity,
    });
  },

  feedCat: () => {
    const { treatsGiven, affinityLevel, currentState, inactivityTier, isWaking, soundEnabled } = get();
    if (isWaking) return;

    const isSleeping =
      currentState.expression === 'sleeping' ||
      currentState.pose === 'curl_sleep' ||
      currentState.accessory === 'eye_mask' ||
      inactivityTier >= 5;

    if (isSleeping) {
      get().wakeUp();
      return;
    }

    const newTreats = treatsGiven + 1;
    const newAffinity = Math.min(100, affinityLevel + 3);

    get().resetInactivity();
    set({
      treatsGiven: newTreats,
      affinityLevel: newAffinity,
      consecutiveTaps: 0,
      wakeStep: 0,
    });

    if (soundEnabled) {
      catSoundManager.playChirp();
    }
    haptics.notificationSuccess();

    get().triggerReaction({
      mood: 'happy',
      catMood: 'happy',
      catActivity: 'celebrating',
      expression: 'happy',
      pose: 'bongo_tap',
      gazeTarget: 'user',
      speechText: 'Crunch crunch! *happy tail*',
      priority: 'INTERACTION',
      priorityScore: 65,
      durationMs: 2800,
    });

    companionEvents.emit('user_feed_cat', undefined);

    const state = get();
    schedulePersistCompanion({
      isEnabled: state.isEnabled,
      name: state.name,
      pettedCount: state.pettedCount,
      treatsGiven: newTreats,
      affinityLevel: newAffinity,
    });
  },

  tapCat: () => {
    const now = Date.now();
    const { currentState, consecutiveTaps, lastTapTime, inactivityTier, isWaking, affinityLevel, recentMessageIds, soundEnabled } = get();

    if (isWaking) return;

    const isSleeping =
      currentState.expression === 'sleeping' ||
      currentState.pose === 'curl_sleep' ||
      currentState.accessory === 'eye_mask' ||
      inactivityTier >= 5;

    // Check if sleeping -> multi-stage wake up progression
    if (isSleeping) {
      get().wakeUp();
      return;
    }

    // Awake: Tap progression
    get().resetInactivity();
    const isConsecutive = now - lastTapTime < 2200;
    const tapCount = isConsecutive ? consecutiveTaps + 1 : 1;

    set({ consecutiveTaps: tapCount, lastTapTime: now });
    companionEvents.emit('user_tap_cat', { tapCount });

    // Special discoverable: 3+ consecutive taps easter egg!
    if (tapCount >= 3 && tapCount < 5) {
      const easterEgg = CatStateEngine.computeInteractionReaction('single_tap', tapCount);
      if (soundEnabled) {
        catSoundManager.playHappyMeow();
      }
      get().triggerReaction({
        mood: 'happy',
        catMood: easterEgg.mood,
        catActivity: easterEgg.activity,
        expression: easterEgg.expression,
        pose: easterEgg.pose,
        gazeTarget: easterEgg.gazeTarget,
        speechText: easterEgg.message?.text ?? null,
        priority: easterEgg.priority,
        priorityScore: easterEgg.priorityScore,
        durationMs: easterEgg.durationMs,
      });
      return;
    }

    if (tapCount >= 5) {
      // Annoyance reaction
      const remark = selectContextualRemark('repeated_tap', Math.floor(affinityLevel / 10), recentMessageIds);
      if (remark) get().recordMessageId(remark.id);
      if (soundEnabled) {
        catSoundManager.playTinyMeow();
      }

      get().triggerReaction({
        mood: 'curious',
        catMood: 'neutral',
        catActivity: 'resting',
        expression: 'annoyed',
        pose: 'sit',
        gazeTarget: 'user',
        speechText: remark?.text ?? 'Meow? Give me some space~',
        priority: 'INTERACTION',
        priorityScore: 72,
        durationMs: 2400,
      });
      return;
    }

    // Normal 1st or 2nd tap
    if (soundEnabled) {
      catSoundManager.playMeow();
    }
    haptics.impactLight();

    if (tapCount === 1) {
      get().triggerReaction({
        mood: 'curious',
        catMood: 'happy',
        catActivity: 'resting',
        expression: 'surprised',
        pose: 'wave',
        gazeTarget: 'user',
        speechText: null,
        priority: 'INTERACTION',
        priorityScore: 66,
        durationMs: 1600,
      });
      return;
    }

    // 2 taps: cheerful greeting
    get().triggerReaction({
      mood: 'happy',
      catMood: 'happy',
      catActivity: 'resting',
      expression: 'happy',
      pose: 'bongo_tap',
      gazeTarget: 'user',
      speechText: null,
      priority: 'INTERACTION',
      priorityScore: 68,
      durationMs: 1800,
    });
  },

  longPressCat: () => {
    const { currentState, isWaking, soundEnabled } = get();
    if (isWaking) return;

    get().resetInactivity();
    if (soundEnabled) {
      catSoundManager.playPurr();
    }
    haptics.felinePurr();

    const cuddleReaction = CatStateEngine.computeInteractionReaction('long_press');
    get().triggerReaction({
      mood: 'happy',
      catMood: cuddleReaction.mood,
      catActivity: cuddleReaction.activity,
      expression: cuddleReaction.expression,
      pose: cuddleReaction.pose,
      gazeTarget: cuddleReaction.gazeTarget,
      speechText: cuddleReaction.message?.text ?? null,
      priority: cuddleReaction.priority,
      priorityScore: cuddleReaction.priorityScore,
      durationMs: cuddleReaction.durationMs,
    });
  },

  surfaceWeatherGuidance: (ctx: WeatherContextData) => {
    const { reactionsEnabled, currentState, isWaking } = get();
    if (!reactionsEnabled || isWaking) return;
    if (currentState.priorityScore >= 60) return; // Don't interrupt interaction or critical alert

    const env = CatStateEngine.computeEnvironmentReaction({ weather: ctx });
    if (env.message) {
      get().triggerReaction({
        mood: env.mood as any,
        catMood: env.mood,
        catActivity: env.activity,
        expression: env.expression,
        pose: env.pose,
        accessory: env.accessory,
        gazeTarget: env.gazeTarget,
        speechText: env.message.text,
        priority: env.priority,
        priorityScore: env.priorityScore,
        durationMs: env.durationMs,
      });
    }
  },

  dismissSpeech: () => {
    const { currentState } = get();
    if (currentState.speechText) {
      set({ currentState: { ...currentState, speechText: null } });
    }
  },

  tickIdle: () => {
    const { currentState, lastBehavior, isWaking } = get();
    if (isWaking) return;
    // Don't interrupt if busy or sleeping
    if (currentState.priorityScore > 20) return;

    const next = getNextIdleRoutine(lastBehavior);
    set({ lastBehavior: next.behavior });

    get().triggerReaction({
      expression: next.expression,
      pose: next.pose,
      gazeTarget: next.gazeTarget,
      priority: 'AMBIENT',
      priorityScore: 15,
      durationMs: next.durationMs,
    });
  },

  incrementInactivity: (deltaSecs: number = 1) => {
    const { inactivitySeconds, inactivityTier } = get();
    const newSecs = inactivitySeconds + deltaSecs;
    let newTier = 1;

    if (newSecs >= 120) {
      newTier = 5;
    } else if (newSecs >= 60) {
      newTier = 4;
    } else if (newSecs >= 30) {
      newTier = 3;
    } else if (newSecs >= 15) {
      newTier = 2;
    }

    set({ inactivitySeconds: newSecs, inactivityTier: newTier });

    if (newTier !== inactivityTier) {
      companionEvents.emit('inactivity_tier_reached', {
        tier: newTier,
        seconds: newSecs,
      });
    }
  },

  resetInactivity: () => {
    set({ inactivitySeconds: 0, inactivityTier: 1 });
  },

  recordMessageId: (id: string) => {
    const { recentMessageIds } = get();
    const updated = [id, ...recentMessageIds.filter((m) => m !== id)].slice(0, 5);
    set({ recentMessageIds: updated });
  },

  incrementRefreshCount: () => {
    set({ refreshCountInSession: get().refreshCountInSession + 1 });
  },

  incrementTempTapCount: () => {
    set({ tempTapCountInSession: get().tempTapCountInSession + 1 });
  },

  incrementLocationChangeCount: () => {
    set({ locationChangeCountInSession: get().locationChangeCountInSession + 1 });
  },

  syncWithAmbientWeather: (temp, isRain, isThunder) => {
    const { currentState } = get();
    if (currentState.priorityScore >= 50) return;

    const resting = getDefaultRestingState(temp, isRain, isThunder);
    set({ currentState: resting });
  },

  resetAll: async () => {
    const defaultState = getDefaultRestingState();
    set({
      isEnabled: true,
      soundEnabled: true,
      reactionsEnabled: true,
      name: 'Mimi',
      currentState: defaultState,
      catMood: 'relaxed',
      catActivity: 'resting',
      pettedCount: 0,
      treatsGiven: 0,
      affinityLevel: 10,
      consecutiveTaps: 0,
      lastTapTime: 0,
      refreshCountInSession: 0,
      tempTapCountInSession: 0,
      locationChangeCountInSession: 0,
      lastSessionTimestamp: Date.now(),
      recentMessageIds: [],
      processedAlertIds: [],
      inactivitySeconds: 0,
      inactivityTier: 1,
      wakeStep: 0,
    });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(SOUND_STORAGE_KEY);
      await AsyncStorage.removeItem(REACTIONS_STORAGE_KEY);
    } catch {
      // Non-blocking
    }
  },
}));
