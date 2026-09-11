import { test } from 'node:test';
import assert from 'node:assert/strict';

if (typeof (global as any).window === 'undefined') {
  (global as any).window = {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
  };
}
import { companionEvents } from '../lib/companion/companionEvents';
import {
  getTimeOfDayCategory,
  getDefaultRestingState,
  canOverrideState,
  getNextIdleRoutine,
  CompanionState,
} from '../lib/companion/companionBrain';
import { useCompanionStore } from '../store/useCompanionStore';

test('Companion Event Bus: Subscription, dispatch, and unsubscribe', () => {
  let receivedTemp = 0;
  const unsub = companionEvents.on('temperature_card_tapped', (payload) => {
    receivedTemp = payload.temp;
  });

  companionEvents.emit('temperature_card_tapped', { temp: 34 });
  assert.equal(receivedTemp, 34, 'Listener should receive emitted payload');

  unsub();
  companionEvents.emit('temperature_card_tapped', { temp: 18 });
  assert.equal(receivedTemp, 34, 'Unsubscribed listener should not be called');
});

test('Companion Brain: Circadian rhythm categorization', () => {
  assert.equal(getTimeOfDayCategory(8), 'morning');
  assert.equal(getTimeOfDayCategory(14), 'afternoon');
  assert.equal(getTimeOfDayCategory(19), 'evening');
  assert.equal(getTimeOfDayCategory(23), 'night');
  assert.equal(getTimeOfDayCategory(3), 'late_night');
});

test('Companion Brain: Weather-informed resting states', () => {
  // Late night sleep takes top circadian priority
  const lateNight = getDefaultRestingState(25, false, false, 3);
  assert.equal(lateNight.mood, 'sleeping');
  assert.equal(lateNight.accessory, 'eye_mask');

  // Thunderstorm triggers startled hide
  const storm = getDefaultRestingState(24, true, true, 14);
  assert.equal(storm.mood, 'startled');
  assert.equal(storm.pose, 'duck_hide');

  // Rain triggers umbrella hold
  const rain = getDefaultRestingState(22, true, false, 14);
  assert.equal(rain.mood, 'protective');
  assert.equal(rain.accessory, 'umbrella');

  // Cold (< 10°C) triggers scarf
  const cold = getDefaultRestingState(8, false, false, 14);
  assert.equal(cold.mood, 'chilly');
  assert.equal(cold.accessory, 'scarf');

  // Extreme heat (>= 35°C) triggers fan
  const hot = getDefaultRestingState(38, false, false, 14);
  assert.equal(hot.mood, 'warm');
  assert.equal(hot.accessory, 'fan');
});

test('Companion Brain: Priority scoring and override rules', () => {
  const activeMediumState: CompanionState = {
    mood: 'happy',
    expression: 'happy',
    pose: 'wave',
    accessory: 'none',
    speechText: null,
    speechKey: null,
    priority: 'MEDIUM',
    priorityScore: 50,
    durationMs: 5000,
    timestamp: Date.now(), // Active right now
  };

  // Low priority cannot override active medium state
  assert.equal(canOverrideState(activeMediumState, 25), false);

  // Critical priority (100) CAN override active medium state
  assert.equal(canOverrideState(activeMediumState, 100), true);

  // Expired medium state can be overridden by equal or higher priority
  const expiredState: CompanionState = {
    ...activeMediumState,
    timestamp: Date.now() - 6000,
  };
  assert.equal(canOverrideState(expiredState, 50), true);
});

test('Companion Brain: Idle routine generation variety', () => {
  const first = getNextIdleRoutine();
  assert.ok(first.behavior.startsWith('IDLE_'), 'Behavior should have IDLE_ prefix');
  assert.ok(first.durationMs > 0, 'Duration should be positive');

  // Next routine should avoid immediately repeating the previous behavior
  const second = getNextIdleRoutine(first.behavior);
  assert.notEqual(second.behavior, first.behavior, 'Next idle behavior should differ from immediate predecessor');
});

test('Companion Store: Interactive state transitions & user bonding', async () => {
  const store = useCompanionStore.getState();
  await store.resetAll();

  assert.equal(store.name, 'Mimi');
  assert.equal(store.isEnabled, true);
  assert.equal(store.pettedCount, 0);

  // Pet cat
  store.petCat();
  const stateAfterPet = useCompanionStore.getState();
  assert.equal(stateAfterPet.pettedCount, 1);
  assert.equal(stateAfterPet.affinityLevel, 12);
  assert.equal(stateAfterPet.currentState.expression, 'blissful');

  // Feed treat
  store.feedCat();
  const stateAfterTreat = useCompanionStore.getState();
  assert.equal(stateAfterTreat.treatsGiven, 1);
  assert.equal(stateAfterTreat.affinityLevel, 15);

  // Tap progression
  store.tapCat(); // tap 1: wave
  assert.equal(useCompanionStore.getState().currentState.pose, 'wave');

  store.tapCat(); // tap 2: sit
  assert.equal(useCompanionStore.getState().currentState.pose, 'sit');

  store.tapCat(); // tap 3: bongo easter egg
  assert.equal(useCompanionStore.getState().currentState.pose, 'bongo_tap');
  assert.equal(useCompanionStore.getState().currentState.speechText, 'Ba-dum! You found the secret bongo rhythm!');

  // Toggle enabled/disabled
  await store.setEnabled(false);
  assert.equal(useCompanionStore.getState().isEnabled, false);

  await store.setEnabled(true);
  assert.equal(useCompanionStore.getState().isEnabled, true);
});

test('Companion Intelligence: Weather transition detection', () => {
  const { detectWeatherTransition } = require('../lib/companion/companionBrain');

  // Sunny to Rain transition
  const toRain = detectWeatherTransition('Sunny', 'Heavy Rain');
  assert.equal(toRain.detected, true);
  assert.equal(toRain.type, 'rain_started');
  assert.equal(toRain.pose, 'umbrella_hold');
  assert.equal(toRain.accessory, 'umbrella');

  // Rain to Clear transition
  const toClear = detectWeatherTransition('Moderate Rain', 'Clear Sky');
  assert.equal(toClear.detected, true);
  assert.equal(toClear.type, 'rain_stopped');
  assert.equal(toClear.expression, 'happy');

  // Storm onset
  const toStorm = detectWeatherTransition('Cloudy', 'Severe Thunderstorm');
  assert.equal(toStorm.detected, true);
  assert.equal(toStorm.type, 'storm_started');
  assert.equal(toStorm.pose, 'duck_hide');

  // No transition for minor same-weather updates
  const noChange = detectWeatherTransition('Partly Cloudy', 'Partly Cloudy');
  assert.equal(noChange.detected, false);
});

test('Companion Remarks: Affinity filtering & ring buffer deduplication', () => {
  const { selectContextualRemark } = require('../lib/companion/companionRemarks');

  // Select general remark at affinity level 1
  const remarkLow = selectContextualRemark('general', 1, []);
  assert.ok(remarkLow, 'Should return a valid remark');
  assert.ok(!remarkLow.minAffinity || remarkLow.minAffinity <= 1, 'Should respect low affinity threshold');

  // Ring buffer: excluding specific ID
  const remarkWithBuffer = selectContextualRemark('repeated_temp', 10, ['rep_tmp_01', 'rep_tmp_02']);
  assert.ok(remarkWithBuffer, 'Should return an alternative remark');
  assert.equal(remarkWithBuffer.id, 'rep_tmp_03', 'Should avoid messages present in the ring buffer');
});

test('Companion Brain: Gaze direction targeting', () => {
  const resting = getDefaultRestingState(22, false, false, 12);
  assert.equal(resting.gazeTarget, 'user', 'Default resting gaze should look at user');

  const rainResting = getDefaultRestingState(20, true, false, 12);
  assert.equal(rainResting.gazeTarget, 'up', 'Rain resting state should look up at the sky');

  const sleepResting = getDefaultRestingState(20, false, false, 2);
  assert.equal(sleepResting.gazeTarget, 'down', 'Late night sleep resting state should look down');
});

test('Companion Store: Inactivity tiers and multi-touch wake progression', async () => {
  const store = useCompanionStore.getState();
  await store.resetAll();

  // Test inactivity tier progression
  assert.equal(store.inactivityTier, 1);
  for (let i = 0; i < 16; i++) store.incrementInactivity();
  assert.equal(useCompanionStore.getState().inactivityTier, 2, '16s should reach Tier 2');

  for (let i = 0; i < 15; i++) store.incrementInactivity();
  assert.equal(useCompanionStore.getState().inactivityTier, 3, '31s should reach Tier 3');

  for (let i = 0; i < 30; i++) store.incrementInactivity();
  assert.equal(useCompanionStore.getState().inactivityTier, 4, '61s should reach Tier 4');

  for (let i = 0; i < 60; i++) store.incrementInactivity();
  assert.equal(useCompanionStore.getState().inactivityTier, 5, '121s should reach Tier 5 (Deep Sleep)');

  // In deep sleep (Tier 5), tapping Mimi starts intentional multi-stage wake progression
  store.tapCat();
  const waking = useCompanionStore.getState();
  assert.equal(waking.inactivityTier, 1, 'Inactivity should reset to Tier 1 on wake');
  assert.equal(waking.isWaking, true, 'Cat should be in isWaking state during wake sequence');
  assert.equal(waking.currentState.pose, 'sit', 'Stage 1 wake pose should be sit');
  assert.equal(waking.currentState.expression, 'sleepy', 'Stage 1 wake expression should be sleepy');
  assert.equal(waking.currentState.accessory, 'none', 'Eye mask should be removed on wake');
  assert.strictEqual(waking.currentState.speechText, null, 'Should NOT show speech while waking');
});

test('Cat State Engine: Weather, time & alert reaction evaluation', () => {
  const { CatStateEngine } = require('../lib/cat/catStateEngine');

  // Storm evaluation
  const stormMood = CatStateEngine.evaluateMood({ weather: { isThunder: true } });
  assert.equal(stormMood, 'stormy');
  const stormVisuals = CatStateEngine.mapToVisuals('stormy', 'seeking_shelter');
  assert.equal(stormVisuals.expression, 'startled');
  assert.equal(stormVisuals.pose, 'duck_hide');

  // Rain evaluation
  const rainMood = CatStateEngine.evaluateMood({ weather: { isRain: true } });
  assert.equal(rainMood, 'rainy');

  // Heat & Cold evaluation
  const hotMood = CatStateEngine.evaluateMood({ weather: { temp: 39 } });
  assert.equal(hotMood, 'hot');
  const coldMood = CatStateEngine.evaluateMood({ weather: { temp: 4 } });
  assert.equal(coldMood, 'cold');

  // Air quality sick-air evaluation
  const aqiMood = CatStateEngine.evaluateMood({ weather: { aqi: 250 } });
  assert.equal(aqiMood, 'sick-air');

  // Alert priority reaction
  const alertReaction = CatStateEngine.computeEnvironmentReaction({
    activeAlert: { id: 'alert_123', title: 'Cyclone Warning', severity: 'red' },
  });
  assert.equal(alertReaction.priority, 'CRITICAL');
  assert.equal(alertReaction.priorityScore, 100);
  assert.ok(alertReaction.message?.text.includes('Cyclone Warning'));
});

test('Cat Sound Manager: Cooldown debounce and preference controls', async () => {
  const { catSoundManager } = require('../lib/cat/catSoundManager');

  catSoundManager.resetCooldown();
  await catSoundManager.setSoundEnabled(true);
  assert.equal(catSoundManager.getSoundEnabled(), true);

  let soundsPlayed: string[] = [];
  const unregister = catSoundManager.registerBridge((sound) => {
    soundsPlayed.push(sound);
  });

  // First sound should play
  const played1 = catSoundManager.playMeow();
  assert.equal(played1, true);
  assert.equal(soundsPlayed.length, 1);
  assert.equal(soundsPlayed[0], 'meow');

  // Rapid immediate second sound should be debounced or queued
  const played2 = catSoundManager.playPurr();
  assert.equal(played2, false, 'Low priority should not queue or play during active playback');

  // Disable sound preference
  await catSoundManager.setSoundEnabled(false);
  assert.equal(catSoundManager.getSoundEnabled(), false);
  const playedWhenDisabled = catSoundManager.playMeow();
  assert.equal(playedWhenDisabled, false, 'Should not play when sound preference is disabled');

  // Cleanup
  unregister();
  await catSoundManager.setSoundEnabled(true);
});

test('Cat Sound Manager: Single Concurrency, Priority Preemption, and 1-Slot Queue', async () => {
  const { catSoundManager, CatAudioPriority, SOUND_SPECS } = require('../lib/cat/catSoundManager');
  const { CAT_AUDIO_DATA_URIS } = require('../lib/cat/catAudioData');

  // 1. Verify all 9 sounds exist in audio assets and sound specifications
  const expectedSounds = ['meow', 'happy_meow', 'tiny_meow', 'chirp', 'purr', 'surprised', 'playful', 'yawn', 'bongo'];
  for (const s of expectedSounds) {
    assert.ok(CAT_AUDIO_DATA_URIS[s], `Audio asset missing for ${s}`);
    assert.ok(SOUND_SPECS[s], `Sound spec missing for ${s}`);
    assert.ok(SOUND_SPECS[s].durationMs > 0, `Invalid duration for ${s}`);
    assert.ok(SOUND_SPECS[s].volumeMultiplier > 0 && SOUND_SPECS[s].volumeMultiplier <= 1.0, `Invalid volume factor for ${s}`);
  }

  catSoundManager.resetCooldown();
  await catSoundManager.setSoundEnabled(true);

  let playHistory: string[] = [];
  let stopCount = 0;

  const unregister = catSoundManager.registerBridge({
    play: (sound) => {
      playHistory.push(sound);
    },
    stop: () => {
      stopCount++;
    },
  });

  // 2. Play ambient PURR (Priority LOW)
  const playedPurr = catSoundManager.playPurr();
  assert.equal(playedPurr, true);
  assert.equal(catSoundManager.getIsPlaying(), true);
  assert.equal(catSoundManager.getCurrentSound(), 'purr');
  assert.equal(playHistory.length, 1);
  assert.equal(playHistory[0], 'purr');

  // 3. Purr is interruptible: User taps cat -> playMeow (Priority NORMAL) interrupts Purr
  const playedMeow = catSoundManager.playMeow();
  assert.equal(playedMeow, true, 'Normal priority should interrupt ambient purr immediately');
  assert.equal(stopCount, 1, 'Stop should have been called on the bridge for purr');
  assert.equal(catSoundManager.getCurrentSound(), 'meow');
  assert.equal(playHistory.length, 2);
  assert.equal(playHistory[1], 'meow');

  // 4. While MEOW is playing, another NORMAL sound (chirp) arrives -> Queued, not overlapped!
  const playedChirp = catSoundManager.playChirp();
  assert.equal(playedChirp, true, 'Chirp should be accepted into the 1-slot queue');
  assert.equal(playHistory.length, 2, 'Chirp must NOT start playing yet (no overlapping!)');

  // 5. While MEOW is still playing, a CRITICAL / HIGH emergency alert arrives -> Preempts MEOW immediately!
  const playedAlert = catSoundManager.playSurprised();
  assert.equal(playedAlert, true, 'High priority alert should preempt playing sound');
  assert.ok(stopCount >= 2, 'Stop should have been called on the bridge to halt meow');
  assert.equal(catSoundManager.getCurrentSound(), 'surprised');
  assert.equal(playHistory.length, 3);
  assert.equal(playHistory[2], 'surprised');

  // 6. Alert finishes playback -> reports to manager
  catSoundManager.notifyPlaybackEnded('surprised');
  // 1-slot queue automatically dequeues and plays chirp!
  assert.equal(catSoundManager.getCurrentSound(), 'chirp');
  assert.equal(catSoundManager.getIsPlaying(), true);
  assert.equal(playHistory.length, 4);
  assert.equal(playHistory[3], 'chirp');

  // When queued chirp finishes:
  catSoundManager.notifyPlaybackEnded('chirp');
  assert.equal(catSoundManager.getIsPlaying(), false);
  assert.equal(catSoundManager.getCurrentSound(), null);

  // 7. Test Mute halting active playback
  catSoundManager.resetCooldown();
  catSoundManager.playMeow();
  assert.equal(catSoundManager.getIsPlaying(), true);
  const currentStops = stopCount;
  await catSoundManager.setSoundEnabled(false);
  assert.equal(catSoundManager.getIsPlaying(), false, 'Playback should stop when muted');
  assert.ok(stopCount > currentStops, 'Stop must be triggered when sound is disabled');

  // Cleanup
  unregister();
  await catSoundManager.setSoundEnabled(true);
});

test('Cat Theme Adapter: 11 Theme style derivation', () => {
  const { getCatThemeStyle } = require('../lib/cat/catThemeAdapter');
  const { THEME_REGISTRY } = require('../theme/registry');

  // Test all 11 themes produce valid, unique CatThemeStyle objects
  const themeIds = [
    'apple-liquid',
    'retro-peaceful',
    'health',
    'fitness',
    'beach',
    'travel',
    'parent',
    'agriculture',
    'commuter',
    'event',
  ];

  for (const id of themeIds) {
    const theme = THEME_REGISTRY[id];
    assert.ok(theme, `Theme ${id} must exist in registry`);
    const style = getCatThemeStyle(theme, false);
    assert.ok(style.coatColor, `${id} must have coatColor`);
    assert.ok(style.outlineColor, `${id} must have outlineColor`);
    assert.ok(style.eyeColor, `${id} must have eyeColor`);
    assert.ok(style.noseColor, `${id} must have noseColor`);
    assert.ok(style.motionIntensity > 0, `${id} must have positive motionIntensity`);
  }

  // Retro 2D must have comic offset shadow
  const retroStyle = getCatThemeStyle(THEME_REGISTRY['retro-peaceful'], false);
  assert.equal(retroStyle.shadowStyle, 'comic_offset');
  assert.equal(retroStyle.outlineWidth, 2);

  // Apple Liquid must have glass ambient shadow
  const liquidStyle = getCatThemeStyle(THEME_REGISTRY['apple-liquid'], false);
  assert.equal(liquidStyle.shadowStyle, 'glass_ambient');
});

test('Cat Micro-Advice: Environmental & persona-informed weather guidance', () => {
  const { generateWeatherMicroAdvice } = require('../lib/cat/catMicroAdvice');

  // Thunder advice
  const thunderMsg = generateWeatherMicroAdvice({ isThunder: true });
  assert.ok(thunderMsg?.text.includes('Thunder'));

  // Air quality advice
  const aqiMsg = generateWeatherMicroAdvice({ aqi: 220 });
  assert.ok(aqiMsg?.text.includes('Air quality'));

  // Rain advice
  const rainMsg = generateWeatherMicroAdvice({ isRain: true });
  assert.ok(rainMsg?.text.includes('umbrella'));

  // Fitness persona advice
  const fitnessMsg = generateWeatherMicroAdvice({ isRain: true, dominantPersona: 'fitness' });
  assert.ok(fitnessMsg?.text.includes('outdoor run'));

  // Beach persona advice
  const beachMsg = generateWeatherMicroAdvice({ isClear: true, temp: 26, dominantPersona: 'beach' });
  assert.ok(beachMsg?.text.includes('beach'));
});

test('Cat Interaction: Single tap, consecutive tap combo easter egg & cuddle', () => {
  const { CatStateEngine } = require('../lib/cat/catStateEngine');

  // Normal tap
  const single = CatStateEngine.computeInteractionReaction('single_tap', 1);
  assert.equal(single.mood, 'happy');
  assert.equal(single.sound, 'meow');

  // Combo easter egg (3+ taps)
  const combo = CatStateEngine.computeInteractionReaction('single_tap', 3);
  assert.equal(combo.mood, 'excited');
  assert.equal(combo.pose, 'bongo_tap');
  assert.equal(combo.sound, 'bongo');
  assert.ok(combo.message?.text.includes('bongo'));

  // Long press cuddle
  const longPress = CatStateEngine.computeInteractionReaction('long_press');
  assert.equal(longPress.sound, 'purr');
  assert.ok(longPress.message?.text.includes('purrs'));

  // Test skipReaction returns Mimi to perch
  const store = useCompanionStore.getState();
  store.petCat();
  store.skipReaction();
  assert.equal(useCompanionStore.getState().currentState.pose, 'perch');
  assert.equal(useCompanionStore.getState().currentState.speechText, null);
});

