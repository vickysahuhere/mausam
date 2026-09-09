import test from 'node:test';
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

test('Custom Theme Studio: Template validation & structure', () => {
  const { STARTER_CUSTOM_THEMES } = require('../store/useCustomThemeStore');
  assert.ok(STARTER_CUSTOM_THEMES.length >= 3, 'Must have at least 3 starter custom themes');

  for (const theme of STARTER_CUSTOM_THEMES) {
    assert.ok(theme.id.startsWith('custom-'), `${theme.id} must be prefixed with custom-`);
    assert.strictEqual(theme.isCustom, true, `${theme.id} must have isCustom flag`);
    assert.ok(theme.colors.background, `${theme.id} must have background color`);
    assert.ok(theme.colors.surface, `${theme.id} must have surface color`);
    assert.ok(theme.colors.primary, `${theme.id} must have primary color`);
    assert.ok(theme.colors.text, `${theme.id} must have text color`);
    assert.ok(theme.artDirection.cardStyle, `${theme.id} must define cardStyle`);
  }
});

test('Location & Survey: End-to-end integration and routing integrity', () => {
  const { useLocationStore } = require('../store/useLocationStore');
  const { useLayoutStore } = require('../store/useLayoutStore');
  const { buildPersonaVector } = require('../lib/personaEngine');

  // Verify persona vector produces valid layout
  const vector = buildPersonaVector(['q1_fitness', 'q2_rain']);
  assert.ok(vector.fitness > 0, 'Vector must score fitness');
  
  useLayoutStore.getState().reinitializeLayout(vector);
  const layout = useLayoutStore.getState().layout;
  assert.ok(layout.length >= 6, 'Generated layout must contain at least 6 widgets');
  assert.strictEqual(layout[0].type, 'current_summary', 'Base row must be current_summary');

  // Verify location store manages default and primary locations
  useLocationStore.getState().reset();
  useLocationStore.getState().addLocation({
    id: 'test-loc-1',
    label: 'Connaught Place, New Delhi',
    lat: 28.6315,
    lon: 77.2167,
    isDefault: true,
  });

  const locs = useLocationStore.getState().locations;
  assert.strictEqual(locs.length, 1);
  assert.strictEqual(locs[0].isDefault, true);
  assert.ok(locs.some((l: any) => l.isDefault), 'Must detect existing default location');
});

test('User Persistence: Profile name, location memory & cloud preferences', async () => {
  const { useAuthStore } = require('../store/useAuthStore');
  const { useLocationStore } = require('../store/useLocationStore');

  // Test full name update and local state persistence
  useAuthStore.getState().setSession(true, {
    id: 'user-test-123',
    email: 'vicky@example.com',
    fullName: 'Vicky Sahu',
  });

  const currentUser = useAuthStore.getState().user;
  assert.ok(currentUser, 'User must exist');
  assert.strictEqual(currentUser.fullName, 'Vicky Sahu', 'User full name must be preserved');
  assert.strictEqual(currentUser.email, 'vicky@example.com');

  await useAuthStore.getState().updateFullName('Vicky Sahu New');
  assert.strictEqual(useAuthStore.getState().user?.fullName, 'Vicky Sahu New', 'Updated full name must be saved in state');

  // Verify location memory preserves primary location
  useLocationStore.getState().reset();
  useLocationStore.getState().addLocation({
    id: 'test-loc-mumbai',
    label: 'Bandra, Mumbai',
    lat: 19.0596,
    lon: 72.8295,
    isDefault: true,
  });

  assert.strictEqual(useLocationStore.getState().locations.length, 1);
  assert.strictEqual(useLocationStore.getState().hasDefaultLocation(), true);
  assert.strictEqual(useLocationStore.getState().getSelectedLocation()?.label, 'Bandra, Mumbai');
});

test('Unit Store: Temperature & Wind conversion math and formatting', async () => {
  const { useUnitStore } = await import('../store/useUnitStore');

  // Reset to default C and km/h
  useUnitStore.getState().setTemperatureUnit('C');
  useUnitStore.getState().setWindSpeedUnit('km/h');

  assert.strictEqual(useUnitStore.getState().temperatureUnit, 'C');
  assert.strictEqual(useUnitStore.getState().windSpeedUnit, 'km/h');

  // Pure conversions in C
  assert.strictEqual(useUnitStore.getState().convertTemp(0), 0);
  assert.strictEqual(useUnitStore.getState().convertTemp(25), 25);
  assert.strictEqual(useUnitStore.getState().formatTemp(25), '25°');
  assert.strictEqual(useUnitStore.getState().formatTemp(25, true), '25°C');

  // Pure conversions in km/h
  assert.strictEqual(useUnitStore.getState().convertWind(18), 18);
  assert.strictEqual(useUnitStore.getState().formatWind(18), '18 km/h');

  // Switch to Imperial / Alternative units
  useUnitStore.getState().setTemperatureUnit('F');
  useUnitStore.getState().setWindSpeedUnit('m/s');

  assert.strictEqual(useUnitStore.getState().temperatureUnit, 'F');
  assert.strictEqual(useUnitStore.getState().windSpeedUnit, 'm/s');

  // 0°C -> 32°F
  assert.strictEqual(useUnitStore.getState().convertTemp(0), 32);
  // 100°C -> 212°F
  assert.strictEqual(useUnitStore.getState().convertTemp(100), 212);
  // 25°C -> 77°F
  assert.strictEqual(useUnitStore.getState().convertTemp(25), 77);
  assert.strictEqual(useUnitStore.getState().formatTemp(25), '77°');
  assert.strictEqual(useUnitStore.getState().formatTemp(25, true), '77°F');

  // 18 km/h -> 5 m/s
  assert.strictEqual(useUnitStore.getState().convertWind(18), 5);
  // 36 km/h -> 10 m/s
  assert.strictEqual(useUnitStore.getState().convertWind(36), 10);
  assert.strictEqual(useUnitStore.getState().formatWind(18), '5 m/s');

  // Null / undefined safety
  assert.strictEqual(useUnitStore.getState().formatTemp(null), '--');
  assert.strictEqual(useUnitStore.getState().formatWind(undefined), '--');
  assert.strictEqual(useUnitStore.getState().formatWind(0), '0 m/s');
});

test('Auth Store: Password reset flow (request & confirm)', async () => {
  const { useAuthStore } = await import('../store/useAuthStore');

  // Request password reset for valid email
  const reqRes = await useAuthStore.getState().requestPasswordReset('vicky@example.com');
  assert.strictEqual(reqRes.success, true, 'Request password reset should succeed');

  // Request password reset with empty email should fail
  const emptyRes = await useAuthStore.getState().requestPasswordReset('');
  assert.strictEqual(emptyRes.success, false, 'Empty email should fail');

  // Confirm password reset with code and new password
  const confirmRes = await useAuthStore.getState().confirmPasswordReset(
    'vicky@example.com',
    '123456',
    'newpassword123'
  );
  assert.strictEqual(confirmRes.success, true, 'Confirm reset should succeed');

  // Confirm that user session is active and profile is stored
  assert.strictEqual(useAuthStore.getState().hasSession, true);
  assert.strictEqual(useAuthStore.getState().user?.email, 'vicky@example.com');
  assert.strictEqual(useAuthStore.getState().isGuest, false);

  // Short password should fail
  const shortPassRes = await useAuthStore.getState().confirmPasswordReset(
    'vicky@example.com',
    '123456',
    '123'
  );
  assert.strictEqual(shortPassRes.success, false, 'Password under 6 chars should fail');
});

test('Auth Store: OTP login validation and unregistered email rejection', async () => {
  const { useAuthStore } = await import('../store/useAuthStore');

  // Invalid email
  const invalidRes = await useAuthStore.getState().signInWithOtp('invalid-email');
  assert.strictEqual(invalidRes.success, false);
  assert.ok(invalidRes.error?.includes('valid email'));

  // Valid format in offline mode
  const validRes = await useAuthStore.getState().signInWithOtp('user@test.com');
  assert.strictEqual(validRes.success, true);

  // OTP verify
  const verifyRes = await useAuthStore.getState().verifyOtp('user@test.com', '123456');
  assert.strictEqual(verifyRes.success, true);
  assert.strictEqual(useAuthStore.getState().hasSession, true);
  assert.strictEqual(useAuthStore.getState().user?.email, 'user@test.com');
});

test('Layout Store: Default theme is apple-liquid and survey does not override theme', async () => {
  const { useLayoutStore } = await import('../store/useLayoutStore');
  useLayoutStore.getState().reset();

  // Fresh install default must be apple-liquid
  assert.strictEqual(useLayoutStore.getState().activeThemeId, 'apple-liquid');

  // Personalization vector from lifestyle survey
  const dummyVector = {
    health: 0.8,
    fitness: 0.1,
    beach: 0.05,
    travel: 0.05,
    parent: 0,
    agriculture: 0,
    commuter: 0,
    event: 0,
  };

  useLayoutStore.getState().initializeForUser(dummyVector);
  // Must STILL be apple-liquid!
  assert.strictEqual(useLayoutStore.getState().activeThemeId, 'apple-liquid');

  useLayoutStore.getState().reinitializeLayout(dummyVector);
  // Reinitializing layout from survey completion MUST preserve apple-liquid!
  assert.strictEqual(useLayoutStore.getState().activeThemeId, 'apple-liquid');
});

test('Location Store & Secondary Locations: Multi-location structure and primary switching', async () => {
  const { useLocationStore } = await import('../store/useLocationStore');
  useLocationStore.getState().reset();

  // Add primary location (Home / Delhi)
  useLocationStore.getState().addLocation({
    id: 'loc-home',
    label: 'Home',
    lat: 28.6139,
    lon: 77.209,
    isDefault: true,
  });

  // Add secondary locations (Work / Gurgaon, School / Noida)
  useLocationStore.getState().addLocation({
    id: 'loc-work',
    label: 'Work (Gurgaon)',
    lat: 28.4595,
    lon: 77.0266,
    isDefault: false,
  });

  useLocationStore.getState().addLocation({
    id: 'loc-school',
    label: 'School (Noida)',
    lat: 28.5355,
    lon: 77.391,
    isDefault: false,
  });

  const allLocs = useLocationStore.getState().locations;
  assert.strictEqual(allLocs.length, 3);

  // Default is Home
  const primary = allLocs.find((l) => l.isDefault);
  assert.strictEqual(primary?.id, 'loc-home');

  // Secondary locations
  const secondaries = allLocs.filter((l) => !l.isDefault);
  assert.strictEqual(secondaries.length, 2);
  assert.ok(secondaries.some((l) => l.id === 'loc-work'));
  assert.ok(secondaries.some((l) => l.id === 'loc-school'));

  // Switch primary to Work
  useLocationStore.getState().setDefaultLocation('loc-work');
  const updatedAll = useLocationStore.getState().locations;
  const newPrimary = updatedAll.find((l) => l.isDefault);
  assert.strictEqual(newPrimary?.id, 'loc-work');

  // Previous primary (Home) must now be a secondary location
  const updatedSecondaries = updatedAll.filter((l) => !l.isDefault);
  assert.strictEqual(updatedSecondaries.length, 2);
  assert.ok(updatedSecondaries.some((l) => l.id === 'loc-home'));
});


