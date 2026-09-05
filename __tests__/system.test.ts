import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonaVector, generateInitialLayout } from '../lib/personaEngine';
import { comfortIndex, frostAlert, douglasSeaScale } from '../lib/derived';
import { TRANSLATIONS, SUPPORTED_LOCALES } from '../lib/i18n';
import { WIDGET_REGISTRY } from '../lib/widgetRegistry';

test('Persona Engine: Vector normalization', () => {
  // Test single response
  const single = buildPersonaVector(['q1_fitness']);
  const totalSingle = Object.values(single).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(totalSingle - 1.0) < 0.0001, 'Single vector must sum to 1.0');
  assert.ok((single.fitness ?? 0) > 0.6, 'Fitness must dominate');

  // Test blended responses
  const blended = buildPersonaVector(['q1_fitness', 'q1_health', 'q3_outdoor_time']);
  const totalBlended = Object.values(blended).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(totalBlended - 1.0) < 0.0001, 'Blended vector must sum to 1.0');
  assert.ok((blended.fitness ?? 0) > 0.3, 'Fitness must have high weight');
  assert.ok((blended.health ?? 0) > 0.2, 'Health must have high weight');
});

test('Persona Engine: Top widget selection by persona', () => {
  // Fitness vector
  const fitnessVector = buildPersonaVector(['q1_fitness', 'q3_outdoor_time']);
  const fitnessLayout = generateInitialLayout(fitnessVector).map((w) => w.type);
  assert.ok(fitnessLayout.includes('best_run_hours'), 'Fitness should include best_run_hours');

  // Beach vector
  const beachVector = buildPersonaVector(['q1_beach']);
  const beachLayout = generateInitialLayout(beachVector).map((w) => w.type);
  assert.ok(beachLayout.includes('sea_state'), 'Beach should include sea_state');
  assert.ok(beachLayout.includes('tide_times'), 'Beach should include tide_times');

  // Agriculture vector
  const agriVector = buildPersonaVector(['q1_agriculture', 'q3_planting']);
  const agriLayout = generateInitialLayout(agriVector).map((w) => w.type);
  assert.ok(agriLayout.includes('rainfall_forecast'), 'Agri should include rainfall_forecast');
  assert.ok(agriLayout.includes('soil_moisture'), 'Agri should include soil_moisture');
});

test('Derived Metrics: Comfort Index', () => {
  const pleasant = comfortIndex(24, 45, 12);
  assert.ok(pleasant.score >= 60, 'Pleasant weather score should be >= 60');
  assert.ok(pleasant.category === 'Optimal' || pleasant.category === 'Comfortable');

  const oppressive = comfortIndex(42, 85, 2);
  assert.ok(oppressive.score <= 35, 'Oppressive weather score should be low');
  assert.strictEqual(oppressive.category, 'Oppressive');
});

test('Derived Metrics: Frost Alert Risk Detection', () => {
  const safeTemps = [
    { time: '04:00', temp: 8.5 },
    { time: '05:00', temp: 7.2 },
  ];
  const safeResult = frostAlert(safeTemps);
  assert.strictEqual(safeResult.hasFrostRisk, false);
  assert.strictEqual(safeResult.riskLevel, 'None');

  const freezingTemps = [
    { time: '04:00', temp: 1.2 },
    { time: '05:00', temp: -0.5 },
    { time: '06:00', temp: 0.8 },
  ];
  const frostResult = frostAlert(freezingTemps);
  assert.strictEqual(frostResult.hasFrostRisk, true);
  assert.strictEqual(frostResult.riskLevel, 'Severe');
  assert.strictEqual(frostResult.frostWindowHours.length, 3);
});

test('Derived Metrics: Douglas Sea Scale Classification', () => {
  assert.strictEqual(douglasSeaScale(0.05).degree, 0);
  assert.strictEqual(douglasSeaScale(0.05).surfRating, 'Flat');

  assert.strictEqual(douglasSeaScale(0.3).degree, 1);
  assert.strictEqual(douglasSeaScale(1.8).degree, 3);
  assert.strictEqual(douglasSeaScale(1.8).surfRating, 'Fun');

  assert.strictEqual(douglasSeaScale(4.8).degree, 5);
  assert.strictEqual(douglasSeaScale(4.8).surfRating, 'Hazardous');
});

test('Bhasha Engine: 6 Regional Languages Translation Integrity', () => {
  assert.strictEqual(SUPPORTED_LOCALES.length, 6, 'Should support 6 Indian regional languages');

  for (const loc of SUPPORTED_LOCALES) {
    const dict = TRANSLATIONS[loc.code];
    assert.ok(dict, `Dictionary for ${loc.name} (${loc.code}) must exist`);

    // Core keys
    assert.ok(dict.appName, `${loc.code} must have appName`);
    assert.ok(dict.homeTab, `${loc.code} must have homeTab`);
    assert.ok(dict.alertsTab, `${loc.code} must have alertsTab`);
    assert.ok(dict.locationsTab, `${loc.code} must have locationsTab`);
    assert.ok(dict.meTab, `${loc.code} must have meTab`);
    assert.ok(dict.radarCardTitle, `${loc.code} must have radarCardTitle`);

    // All 18 widgets translated
    for (const widgetId of Object.keys(WIDGET_REGISTRY)) {
      assert.ok(dict[widgetId], `${loc.code} must have translation for widget '${widgetId}'`);
    }
  }
});
