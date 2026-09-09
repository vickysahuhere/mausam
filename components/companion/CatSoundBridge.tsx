/**
 * Cat Sound Bridge
 * Procedural Audio Synthesizer for Mausam Cat Companion
 * Runs pure Web Audio oscillator synthesis (no external audio files, zero copyright, crash-proof).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { catSoundManager } from '../../lib/cat/catSoundManager';
import { CatSound } from '../../lib/cat/catTypes';

import {
  CUTE_KITTEN_MEOW_DATA_URI,
  HAPPY_MEOW_DATA_URI,
  TINY_MEOW_DATA_URI,
  REAL_PURR_DATA_URI,
} from '../../lib/cat/catAudioData';

// HTML/JS payload for native WebView synthesizer with authentic cute audio playback
const WEBVIEW_SYNTH_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:transparent;">
<script>
  let ctx = null;
  const audioMap = {
    meow: "${CUTE_KITTEN_MEOW_DATA_URI}",
    happy_meow: "${HAPPY_MEOW_DATA_URI}",
    tiny_meow: "${TINY_MEOW_DATA_URI}",
    chirp: "${TINY_MEOW_DATA_URI}",
    purr: "${REAL_PURR_DATA_URI}",
    yawn: "${CUTE_KITTEN_MEOW_DATA_URI}",
    surprised: "${CUTE_KITTEN_MEOW_DATA_URI}",
    playful: "${HAPPY_MEOW_DATA_URI}"
  };
  const audioCache = {};

  function getAudioCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function getCatAudio(sound) {
    const key = audioMap[sound] ? sound : 'meow';
    if (!audioCache[key] && audioMap[key]) {
      try {
        const audio = new Audio(audioMap[key]);
        audio.preload = "auto";
        audioCache[key] = audio;
      } catch(e) {}
    }
    return audioCache[key];
  }

  function playSynth(sound, vol) {
    const targetVol = Math.min(Math.max(vol || 0.75, 0.1), 1.0);

    // 1. First priority: Play authentic cute kitten vocalizations and purrs
    const audio = getCatAudio(sound);
    if (audio) {
      try {
        audio.currentTime = 0;
        audio.volume = targetVol;
        if (sound === 'chirp') audio.playbackRate = 1.35;
        else if (sound === 'yawn') audio.playbackRate = 0.8;
        else if (sound === 'surprised') audio.playbackRate = 1.25;
        else if (sound === 'tiny_meow') audio.playbackRate = 1.15;
        else audio.playbackRate = 1.0;

        const p = audio.play();
        if (p && p.catch) {
          p.catch(function() {
            playProcedural(sound, targetVol);
          });
        }
        return;
      } catch(err) {
        playProcedural(sound, targetVol);
        return;
      }
    }

    // 2. Fallback to procedural synth if media fails
    playProcedural(sound, targetVol);
  }

  function playProcedural(sound, vol) {
    try {
      const c = getAudioCtx();
      if (!c) return;
      const t = c.currentTime;
      const masterGain = c.createGain();
      masterGain.gain.setValueAtTime(vol * 0.45, t);
      masterGain.connect(c.destination);

      if (sound === 'purr') {
        // Deep rhythmic feline purr motor vibration
        const carrier = c.createOscillator();
        const lfo = c.createOscillator();
        const lfoGain = c.createGain();
        const filter = c.createBiquadFilter();
        const g = c.createGain();

        carrier.type = 'triangle';
        carrier.frequency.setValueAtTime(54, t);

        lfo.type = 'sawtooth';
        lfo.frequency.setValueAtTime(28, t);
        lfoGain.gain.setValueAtTime(22, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t);

        lfo.connect(carrier.frequency);
        carrier.connect(filter);
        filter.connect(g);
        g.connect(masterGain);

        g.gain.setValueAtTime(0.01, t);
        g.gain.linearRampToValueAtTime(0.65, t + 0.15);
        g.gain.linearRampToValueAtTime(0.5, t + 0.55);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

        lfo.start(t);
        carrier.start(t);
        lfo.stop(t + 0.9);
        carrier.stop(t + 0.9);
      } else {
        // High harmonic vocal formant cute meow fallback
        const osc = c.createOscillator();
        const g = c.createGain();
        const f1 = c.createBiquadFilter();

        osc.type = 'triangle';
        const startFreq = sound === 'happy_meow' ? 680 : sound === 'tiny_meow' ? 880 : 540;
        const peakFreq = sound === 'happy_meow' ? 980 : sound === 'tiny_meow' ? 1200 : 820;
        const endFreq = sound === 'happy_meow' ? 620 : sound === 'tiny_meow' ? 820 : 460;

        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(peakFreq, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.36);

        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(800, t);
        f1.frequency.exponentialRampToValueAtTime(1600, t + 0.18);
        f1.Q.setValueAtTime(3.0, t);

        g.gain.setValueAtTime(0.01, t);
        g.gain.linearRampToValueAtTime(0.85, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(f1);
        f1.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.42);
      }
    } catch(e) {}
  }

  window.playSynth = playSynth;
  window.addEventListener('message', function(e) {
    try {
      const data = JSON.parse(e.data);
      if (data && data.action === 'play') {
        playSynth(data.sound, data.volume);
      }
    } catch (err) {}
  });
  document.addEventListener('message', function(e) {
    try {
      const data = JSON.parse(e.data);
      if (data && data.action === 'play') {
        playSynth(data.sound, data.volume);
      }
    } catch (err) {}
  });
</script>
</body>
</html>
`;

let activeBridgeInstanceId: number | null = null;
let nextBridgeId = 1;

export const CatSoundBridge = React.memo(function CatSoundBridge() {
  const [instanceId] = useState(() => nextBridgeId++);
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    // Only the primary instance acts as the active audio bridge
    if (activeBridgeInstanceId === null) {
      activeBridgeInstanceId = instanceId;
    }

    const unregister = catSoundManager.registerBridge((sound: CatSound, volume: number) => {
      try {
        if (Platform.OS === 'web') {
          playWebSynth(sound, volume);
        } else if (webViewRef.current && activeBridgeInstanceId === instanceId) {
          const payload = JSON.stringify({ action: 'play', sound, volume });
          webViewRef.current.postMessage(payload);
          if (webViewRef.current.injectJavaScript) {
            webViewRef.current.injectJavaScript(
              `(function() { try { if (window.playSynth) { window.playSynth('${sound}', ${volume}); } } catch(e) {} })(); true;`
            );
          }
        }
      } catch {
        // Must never crash
      }
    });

    return () => {
      unregister();
      if (activeBridgeInstanceId === instanceId) {
        activeBridgeInstanceId = null;
      }
    };
  }, [instanceId]);

  if (Platform.OS === 'web') {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { WebView } = require('react-native-webview');

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: WEBVIEW_SYNTH_HTML }}
        style={styles.hiddenWebView}
        javaScriptEnabled={true}
        domStorageEnabled={false}
        allowFileAccess={false}
        allowFileAccessFromFileURLs={false}
        allowUniversalAccessFromFileURLs={false}
        geolocationEnabled={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
      />
    </View>
  );
});

// In-browser Web Audio runner for Expo Web
let webAudioContext: any = null;
const webAudioCache: Record<string, HTMLAudioElement> = {};

function playWebSynth(sound: CatSound, volume: number) {
  try {
    if (typeof window === 'undefined') return;
    const targetVol = Math.min(Math.max(volume || 0.75, 0.1), 1.0);

    const map: Record<string, string> = {
      meow: CUTE_KITTEN_MEOW_DATA_URI,
      happy_meow: HAPPY_MEOW_DATA_URI,
      tiny_meow: TINY_MEOW_DATA_URI,
      chirp: TINY_MEOW_DATA_URI,
      purr: REAL_PURR_DATA_URI,
      yawn: CUTE_KITTEN_MEOW_DATA_URI,
      surprised: CUTE_KITTEN_MEOW_DATA_URI,
      playful: HAPPY_MEOW_DATA_URI,
    };
    const key = map[sound] ? sound : 'meow';

    if (!webAudioCache[key]) {
      const a = new Audio(map[key]);
      a.preload = 'auto';
      webAudioCache[key] = a;
    }

    const audio = webAudioCache[key];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = targetVol;
      if (sound === 'chirp') audio.playbackRate = 1.35;
      else if (sound === 'yawn') audio.playbackRate = 0.8;
      else if (sound === 'surprised') audio.playbackRate = 1.25;
      else if (sound === 'tiny_meow') audio.playbackRate = 1.15;
      else audio.playbackRate = 1.0;
      audio.play().catch(() => {});
      return;
    }

    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!webAudioContext) {
      webAudioContext = new AudioCtx();
    }
    if (webAudioContext.state === 'suspended') {
      webAudioContext.resume();
    }
    const t = webAudioContext.currentTime;
    const master = webAudioContext.createGain();
    master.gain.setValueAtTime(targetVol * 0.4, t);
    master.connect(webAudioContext.destination);

    const osc = webAudioContext.createOscillator();
    const g = webAudioContext.createGain();
    osc.type = sound === 'purr' ? 'sawtooth' : 'triangle';

    const startFreq = sound === 'purr' ? 55 : 580;
    const endFreq = sound === 'purr' ? 55 : 820;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.25);

    g.gain.setValueAtTime(0.01, t);
    g.gain.linearRampToValueAtTime(0.7, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.38);
  } catch {
    // Silently continue
  }
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: 'hidden',
    bottom: -100,
    right: -100,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
    backgroundColor: 'transparent',
  },
});
