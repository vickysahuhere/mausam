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

  store.tapCat(); // tap 2: bongo_tap
  assert.equal(useCompanionStore.getState().currentState.pose, 'bongo_tap');

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

  // In deep sleep (Tier 5), a single tap wakes Mimi up completely!
  store.tapCat();
  const awake = useCompanionStore.getState();
  assert.equal(awake.inactivityTier, 1, 'Inactivity should reset to Tier 1 on wake');
  assert.equal(awake.currentState.pose, 'stretch_yawn');
  assert.equal(awake.currentState.expression, 'happy');
  assert.equal(awake.currentState.accessory, 'none', 'Eye mask should be removed on wake');
  assert.ok(awake.currentState.speechText, 'Should say wake-up remark');
});
