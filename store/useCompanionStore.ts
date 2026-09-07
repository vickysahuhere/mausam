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

const STORAGE_KEY = '@mausam_companion_storage_v1';
let activeTimerId: any = null;

interface CompanionStoreState {
  isEnabled: boolean;
  name: string;
  currentState: CompanionState;
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
  inactivitySeconds: number;
  inactivityTier: number;
  wakeStep: number;

  // Actions
  initialize: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setName: (name: string) => Promise<void>;
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
  }) => boolean;
  petCat: () => void;
  feedCat: () => void;
  tapCat: () => void;
  dismissSpeech: () => void;
  tickIdle: () => void;
  incrementInactivity: () => void;
  resetInactivity: () => void;
  recordMessageId: (id: string) => void;
  incrementRefreshCount: () => void;
  incrementTempTapCount: () => void;
  incrementLocationChangeCount: () => void;
  syncWithAmbientWeather: (temp?: number, isRain?: boolean, isThunder?: boolean) => void;
  resetAll: () => Promise<void>;
}

export const useCompanionStore = create<CompanionStoreState>((set, get) => ({
  isEnabled: true,
  name: 'Mimi',
  currentState: getDefaultRestingState(),
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
  inactivitySeconds: 0,
  inactivityTier: 1,
  wakeStep: 0,

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

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          isEnabled: parsed.isEnabled ?? true,
          name: parsed.name ?? 'Mimi',
          pettedCount: parsed.pettedCount ?? 0,
          treatsGiven: parsed.treatsGiven ?? 0,
          affinityLevel: parsed.affinityLevel ?? 10,
          lastSessionTimestamp: parsed.lastSessionTimestamp ?? Date.now(),
          isInitialized: true,
        });

        // Trigger app_opened after loading persistent state
        companionEvents.emit('app_opened', undefined);
        return;
      }
    } catch {
      // Non-blocking fallback
    }
    set({ isInitialized: true });
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
      // Local storage non-blocking
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
      // Local storage non-blocking
    }
  },

  triggerReaction: (params) => {
    const { currentState } = get();
    if (!canOverrideState(currentState, params.priorityScore)) {
      return false;
    }

    const nextState: CompanionState = {
      mood: params.mood ?? currentState.mood,
      expression: params.expression,
      pose: params.pose,
      accessory: params.accessory ?? currentState.accessory,
      gazeTarget: params.gazeTarget ?? currentState.gazeTarget ?? 'user',
      speechText: params.speechText ?? null,
      speechKey: params.speechText ? `${Date.now()}` : null,
      priority: params.priority,
      priorityScore: params.priorityScore,
      durationMs: params.durationMs,
      timestamp: Date.now(),
    };

    set({ currentState: nextState });

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
          });
        }
      }, params.durationMs);
    }

    return true;
  },

  petCat: () => {
    const { pettedCount, affinityLevel, recentMessageIds } = get();
    const newCount = pettedCount + 1;
    const newAffinity = Math.min(100, affinityLevel + 2);

    get().resetInactivity();
    set({
      pettedCount: newCount,
      affinityLevel: newAffinity,
      consecutiveTaps: 0,
      wakeStep: 0,
    });

    let speech: string | null = null;
    if (newCount % 5 === 0) {
      const remark = selectContextualRemark('general', Math.floor(newAffinity / 10), recentMessageIds);
      speech = remark?.text ?? 'Purrrr...';
      if (remark) get().recordMessageId(remark.id);
    }

    get().triggerReaction({
      mood: 'happy',
      expression: 'blissful',
      pose: 'bongo_tap',
      gazeTarget: 'user',
      speechText: speech,
      priority: 'INTERACTION',
      priorityScore: 65,
      durationMs: 2400,
    });

    companionEvents.emit('user_pet_cat', undefined);

    // Persist stats
    try {
      const state = get();
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isEnabled: state.isEnabled,
          name: state.name,
          pettedCount: newCount,
          treatsGiven: state.treatsGiven,
          affinityLevel: newAffinity,
          lastSessionTimestamp: Date.now(),
        })
      );
    } catch {
      // Non-blocking
    }
  },

  feedCat: () => {
    const { treatsGiven, affinityLevel } = get();
    const newTreats = treatsGiven + 1;
    const newAffinity = Math.min(100, affinityLevel + 3);

    get().resetInactivity();
    set({
      treatsGiven: newTreats,
      affinityLevel: newAffinity,
      consecutiveTaps: 0,
      wakeStep: 0,
    });

    get().triggerReaction({
      mood: 'happy',
      expression: 'happy',
      pose: 'bongo_tap',
      gazeTarget: 'user',
      speechText: 'Crunch crunch! *happy tail*',
      priority: 'INTERACTION',
      priorityScore: 65,
      durationMs: 2800,
    });

    companionEvents.emit('user_feed_cat', undefined);

    try {
      const state = get();
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isEnabled: state.isEnabled,
          name: state.name,
          pettedCount: state.pettedCount,
          treatsGiven: newTreats,
          affinityLevel: newAffinity,
          lastSessionTimestamp: Date.now(),
        })
      );
    } catch {
      // Non-blocking
    }
  },

  tapCat: () => {
    const now = Date.now();
    const { currentState, consecutiveTaps, lastTapTime, wakeStep, inactivityTier, affinityLevel, recentMessageIds } = get();

    // Check if sleeping -> instant complete wake up on single tap
    const isSleeping =
      currentState.expression === 'sleeping' ||
      currentState.pose === 'curl_sleep' ||
      currentState.accessory === 'eye_mask' ||
      inactivityTier >= 5;

    if (isSleeping) {
      get().resetInactivity();
      set({ wakeStep: 0, consecutiveTaps: 0 });
      const remark = selectContextualRemark('wake_up', Math.floor(affinityLevel / 10), recentMessageIds);
      if (remark) get().recordMessageId(remark.id);

      get().triggerReaction({
        mood: 'happy',
        expression: 'happy',
        pose: 'stretch_yawn',
        accessory: 'none',
        gazeTarget: 'user',
        speechText: remark?.text ?? 'Is something happening?',
        priority: 'INTERACTION',
        priorityScore: 70,
        durationMs: 2500,
      });
      return;
    }

    // Awake: Tap progression
    get().resetInactivity();
    const isConsecutive = now - lastTapTime < 2500;
    const tapCount = isConsecutive ? consecutiveTaps + 1 : 1;

    set({ consecutiveTaps: tapCount, lastTapTime: now });
    companionEvents.emit('user_tap_cat', { tapCount });

    if (tapCount >= 5) {
      // Annoyance reaction
      const remark = selectContextualRemark('repeated_tap', Math.floor(affinityLevel / 10), recentMessageIds);
      if (remark) get().recordMessageId(remark.id);

      get().triggerReaction({
        mood: 'curious',
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

    if (tapCount === 1) {
      get().triggerReaction({
        mood: 'curious',
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

    // 2-4 taps: playful bongo drumming!
    get().triggerReaction({
      mood: 'happy',
      expression: 'happy',
      pose: 'bongo_tap',
      gazeTarget: 'user',
      speechText: null,
      priority: 'INTERACTION',
      priorityScore: 68,
      durationMs: 1800,
    });
  },

  dismissSpeech: () => {
    const { currentState } = get();
    if (currentState.speechText) {
      set({ currentState: { ...currentState, speechText: null } });
    }
  },

  tickIdle: () => {
    const { currentState, lastBehavior } = get();
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

  incrementInactivity: () => {
    const { inactivitySeconds, inactivityTier } = get();
    const newSecs = inactivitySeconds + 1;
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
    // If higher priority reaction in flight, do not override
    if (currentState.priorityScore >= 50) return;

    const resting = getDefaultRestingState(temp, isRain, isThunder);
    set({ currentState: resting });
  },

  resetAll: async () => {
    const defaultState = getDefaultRestingState();
    set({
      isEnabled: true,
      name: 'Mimi',
      currentState: defaultState,
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
      inactivitySeconds: 0,
      inactivityTier: 1,
      wakeStep: 0,
    });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Non-blocking
    }
  },
}));
