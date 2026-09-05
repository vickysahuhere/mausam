import { buildPersonaVector } from './lib/personaEngine';

console.log('--- TEST 1: Dominant Health (Single focus) ---');
console.log(buildPersonaVector(['q1_health', 'q3_air_quality']));

console.log('\n--- TEST 2: Blended Fitness & Commuter (Multi focus) ---');
console.log(buildPersonaVector(['q1_fitness', 'q1_commute', 'q2_morning', 'q3_rain_alerts', 'q3_outdoor_time']));

console.log('\n--- TEST 3: Evenly Distributed (Parent + Event + Travel) ---');
console.log(buildPersonaVector(['q1_parent', 'q1_events', 'q2_flexible', 'q3_school_run', 'q3_travel_plans']));

console.log('\n--- TEST 4: Custom / Skip (Empty) ---');
console.log(buildPersonaVector([]));
