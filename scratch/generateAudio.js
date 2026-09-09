const fs = require('fs');

const kitten = fs.readFileSync('scratch/meow_kitten.mp3').toString('base64');
const small1 = fs.readFileSync('scratch/meow_small_1.mp3').toString('base64');
const small2 = fs.readFileSync('scratch/meow_small_2.mp3').toString('base64');
const purr = fs.readFileSync('scratch/purr_1.mp3').toString('base64');

const fileContent = `/**
 * Authentic CC0 1.0 Universal Public Domain Cat & Kitten Vocalization Audio Assets
 * Sourced from BigSoundBank (Joseph Sardin) / CC0 Universal Public Domain
 */

export const CUTE_KITTEN_MEOW_DATA_URI = 'data:audio/mp3;base64,${kitten}';
export const HAPPY_MEOW_DATA_URI = 'data:audio/mp3;base64,${small1}';
export const TINY_MEOW_DATA_URI = 'data:audio/mp3;base64,${small2}';
export const REAL_PURR_DATA_URI = 'data:audio/mp3;base64,${purr}';

// Backwards-compatible alias for existing imports
export const REAL_MEOW_DATA_URI = CUTE_KITTEN_MEOW_DATA_URI;
`;

fs.writeFileSync('lib/cat/catAudioData.ts', fileContent);
console.log('catAudioData.ts generated! Size:', fs.statSync('lib/cat/catAudioData.ts').size);
