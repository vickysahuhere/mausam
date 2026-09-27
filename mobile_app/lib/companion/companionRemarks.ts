/**
 * Categorized Personality Remarks Catalog for Mimi.
 * Governed by cooldowns, probability gates, and a recent-message ring buffer
 * to guarantee that speech is rare, charming, contextual, and never repetitive.
 */

export interface CompanionRemark {
  id: string;
  text: string;
  minAffinity?: number; // 1 to 10
}

export type RemarkCategory =
  | 'general'
  | 'weather_rain'
  | 'weather_heat'
  | 'weather_cold'
  | 'weather_uv'
  | 'weather_wind'
  | 'weather_storm'
  | 'repeated_refresh'
  | 'repeated_temp'
  | 'repeated_location'
  | 'repeated_tap'
  | 'returning_short'
  | 'returning_long'
  | 'returning_very_long'
  | 'inactivity_nap'
  | 'wake_up'
  | 'time_morning'
  | 'time_night'
  | 'late_night_3am'
  | 'easter_egg'
  | 'self_aware';

export const REMARKS_CATALOG: Record<RemarkCategory, CompanionRemark[]> = {
  general: [
    { id: 'gen_01', text: 'Everything is under control.' },
    { id: 'gen_02', text: 'I am professionally qualified to sit here.' },
    { id: 'gen_03', text: 'My prediction is: weather.' },
    { id: 'gen_04', text: 'I have paws. You have thumbs. Teamwork.' },
    { id: 'gen_05', text: 'The weather is doing weather things.' },
    { id: 'gen_06', text: 'Still here? Me too.', minAffinity: 3 },
    { id: 'gen_07', text: 'Looking better than usual today, huh?', minAffinity: 5 },
  ],

  weather_rain: [
    { id: 'rain_01', text: 'Rain soon. Umbrella deployed.' },
    { id: 'rain_02', text: 'Rain again. We meet once more.' },
    { id: 'rain_03', text: 'Keep that umbrella handy!' },
    { id: 'rain_04', text: 'No rain yet. Suspicious.' },
    { id: 'rain_05', text: 'The puddles are calling my name.', minAffinity: 4 },
    { id: 'rain_06', text: 'Raindrops on my whiskers... peaceful.', minAffinity: 6 },
  ],

  weather_heat: [
    { id: 'heat_01', text: '37°C. Absolutely not.' },
    { id: 'heat_02', text: 'Take it easy in this heat.' },
    { id: 'heat_03', text: 'Water breaks are mandatory today.' },
    { id: 'heat_04', text: 'Seeking maximum shade right now.' },
    { id: 'heat_05', text: 'Is it melting outside or just me?', minAffinity: 4 },
  ],

  weather_cold: [
    { id: 'cold_01', text: 'Brrr! Scarf weather.' },
    { id: 'cold_02', text: 'A bit chilly today. Wrap up warm.' },
    { id: 'cold_03', text: 'My tail is fully tucked in.' },
    { id: 'cold_04', text: 'Ideal weather for staying inside.', minAffinity: 3 },
    { id: 'cold_05', text: 'Too cold for adventures today.', minAffinity: 5 },
  ],

  weather_uv: [
    { id: 'uv_01', text: 'High UV! Sunglasses on.' },
    { id: 'uv_02', text: 'Sunscreen recommended today.' },
    { id: 'uv_03', text: 'Bright sunshine out there!' },
    { id: 'uv_04', text: 'Looking cool with these shades.', minAffinity: 4 },
  ],

  weather_wind: [
    { id: 'wind_01', text: 'Hold onto your hat!' },
    { id: 'wind_02', text: 'Breezy today... my ears are flapping.' },
    { id: 'wind_03', text: 'Windy! Good kite weather.' },
  ],

  weather_storm: [
    { id: 'storm_01', text: 'Thunder! Staying right here.' },
    { id: 'storm_02', text: 'Storm alert. Stay indoors and safe.' },
    { id: 'storm_03', text: 'That was loud... ears tucked back.' },
  ],

  repeated_refresh: [
    { id: 'rep_ref_01', text: 'Still waiting for the weather to change?' },
    { id: 'rep_ref_02', text: 'Checking again?' },
    { id: 'rep_ref_03', text: 'The weather is not going anywhere.' },
    { id: 'rep_ref_04', text: 'You refreshed 3 times! It is still the same sky.', minAffinity: 4 },
  ],

  repeated_temp: [
    { id: 'rep_tmp_01', text: 'It is still the exact same temperature.' },
    { id: 'rep_tmp_02', text: 'Yes. That is definitely a number.' },
    { id: 'rep_tmp_03', text: 'Tapping it does not make it warmer!', minAffinity: 4 },
  ],

  repeated_location: [
    { id: 'rep_loc_01', text: 'We are moving again?' },
    { id: 'rep_loc_02', text: 'Checking every city on the map?' },
    { id: 'rep_loc_03', text: 'Pack your bags, I guess!', minAffinity: 5 },
  ],

  repeated_tap: [
    { id: 'rep_tap_01', text: 'Meow? Give me some space~' },
    { id: 'rep_tap_02', text: 'Poking me will not change the forecast!' },
    { id: 'rep_tap_03', text: 'I am a cat, not a button.', minAffinity: 4 },
    { id: 'rep_tap_04', text: 'Okay, okay, I see you!', minAffinity: 6 },
  ],

  returning_short: [
    { id: 'ret_s_01', text: 'Oh, you are back.' },
    { id: 'ret_s_02', text: 'Welcome back!' },
  ],

  returning_long: [
    { id: 'ret_l_01', text: 'Where have you been?' },
    { id: 'ret_l_02', text: 'You are back! I was getting bored.', minAffinity: 5 },
  ],

  returning_very_long: [
    { id: 'ret_vl_01', text: 'I was starting to think you moved.' },
    { id: 'ret_vl_02', text: 'Long time no see, weather traveler!', minAffinity: 4 },
  ],

  inactivity_nap: [
    { id: 'inac_01', text: 'Nobody is moving... nap time.' },
    { id: 'inac_02', text: 'Power nap activated.' },
  ],

  wake_up: [
    { id: 'wake_01', text: 'Is something happening?' },
    { id: 'wake_02', text: 'Yawn... what did I miss?' },
    { id: 'wake_03', text: 'I was having a very important nap.', minAffinity: 4 },
  ],

  time_morning: [
    { id: 'tm_01', text: 'Good morning!' },
    { id: 'tm_02', text: 'Morning skies are looking interesting.' },
    { id: 'tm_03', text: 'Ready for today? Check the rain chance.', minAffinity: 3 },
  ],

  time_night: [
    { id: 'tn_01', text: 'Wind-down time.' },
    { id: 'tn_02', text: 'Quiet night outside.' },
    { id: 'tn_03', text: 'Rest well tonight.', minAffinity: 4 },
  ],

  late_night_3am: [
    { id: 'ln_01', text: 'Why are YOU awake?' },
    { id: 'ln_02', text: 'Late night forecast check?' },
    { id: 'ln_03', text: 'Go to sleep! The clouds will still be here.', minAffinity: 4 },
  ],

  easter_egg: [
    { id: 'ee_01', text: 'I think those clouds are suspicious.', minAffinity: 5 },
    { id: 'ee_02', text: 'You know, you could just look outside.', minAffinity: 6 },
    { id: 'ee_03', text: 'That was a very important blink.', minAffinity: 7 },
    { id: 'ee_04', text: 'I was having a meeting with the clouds.', minAffinity: 8 },
  ],

  self_aware: [
    { id: 'sa_01', text: 'I spent all morning looking at clouds.' },
    { id: 'sa_02', text: 'Professional weather observer at your service.' },
    { id: 'sa_03', text: 'Don\'t mind me, just inspecting the sky.' },
  ],
};

/**
 * Select a contextual remark avoiding recently seen messages and matching user affinity.
 */
export function selectContextualRemark(
  category: RemarkCategory,
  affinityLevel: number = 10,
  recentMessageIds: string[] = []
): CompanionRemark | null {
  const list = REMARKS_CATALOG[category];
  if (!list || list.length === 0) return null;

  // Filter eligible remarks by affinity level and exclude recent message IDs
  const eligible = list.filter((r) => {
    const affinityOk = !r.minAffinity || affinityLevel >= r.minAffinity;
    const notRecent = !recentMessageIds.includes(r.id);
    return affinityOk && notRecent;
  });

  // Fallback to all affinity-matching remarks if all were recently used
  const pool = eligible.length > 0 ? eligible : list.filter((r) => !r.minAffinity || affinityLevel >= r.minAffinity);
  if (pool.length === 0) return null;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen;
}
