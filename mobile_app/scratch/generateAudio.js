const fs = require('fs');

const sounds = {
  meow: 'scratch/meow_kitten.mp3',
  happy_meow: 'scratch/little_04.mp3',
  tiny_meow: 'scratch/meow_small_2.mp3',
  chirp: 'scratch/little_01.mp3',
  purr: 'scratch/purr_1.mp3',
  surprised: 'scratch/meow_short_1.mp3',
  playful: 'scratch/meow_small_1.mp3',
  yawn: 'scratch/meow_short_2.mp3',
  bongo: 'scratch/soft_bongo_tune.wav',
};

const encoded = {};
for (const [key, filepath] of Object.entries(sounds)) {
  const b64 = fs.readFileSync(filepath).toString('base64');
  const mime = filepath.endsWith('.wav') ? 'audio/wav' : 'audio/mp3';
  encoded[key] = `data:${mime};base64,${b64}`;
}

const fileContent = `/**
 * Authentic CC0 1.0 Universal Public Domain Studio Cat Vocalization & Audio Assets
 * Sourced from BigSoundBank (Joseph Sardin) / CC0 1.0 Universal Public Domain.
 * Clean, natural, cute, and professionally recorded feline vocalizations and bongo rhythm.
 */

export const CAT_AUDIO_DATA_URIS: Record<string, string> = {
  meow: '${encoded.meow}',
  happy_meow: '${encoded.happy_meow}',
  tiny_meow: '${encoded.tiny_meow}',
  chirp: '${encoded.chirp}',
  purr: '${encoded.purr}',
  surprised: '${encoded.surprised}',
  playful: '${encoded.playful}',
  yawn: '${encoded.yawn}',
  bongo: '${encoded.bongo}',
};

// Backwards-compatible legacy exports
export const CUTE_KITTEN_MEOW_DATA_URI = CAT_AUDIO_DATA_URIS.meow;
export const HAPPY_MEOW_DATA_URI = CAT_AUDIO_DATA_URIS.happy_meow;
export const TINY_MEOW_DATA_URI = CAT_AUDIO_DATA_URIS.tiny_meow;
export const REAL_PURR_DATA_URI = CAT_AUDIO_DATA_URIS.purr;
export const REAL_MEOW_DATA_URI = CAT_AUDIO_DATA_URIS.meow;
`;

fs.writeFileSync('lib/cat/catAudioData.ts', fileContent);
console.log('Successfully generated lib/cat/catAudioData.ts');
console.log('File size:', (fs.statSync('lib/cat/catAudioData.ts').size / 1024).toFixed(1), 'KB');
