/**
 * Cat Sound Bridge
 * High-Fidelity Audio Engine for Mausam Cat Companion
 *
 * Runs pure, zero-external-dependency embedded CC0 audio playback
 * with single-playback concurrency, instant interruption, and stop controls.
 * Supported on both React Native WebView (native Android) and HTML5 Audio (Expo Web).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, StyleSheet, AppState } from 'react-native';
import { catSoundManager, CatAudioPriority } from '../../lib/cat/catSoundManager';
import { CatSound } from '../../lib/cat/catTypes';
import { CAT_AUDIO_DATA_URIS } from '../../lib/cat/catAudioData';

// Self-contained HTML/JS payload for native WebView audio engine
const WEBVIEW_AUDIO_ENGINE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:transparent;">
<script>
  const audioMap = {
    meow: "${CAT_AUDIO_DATA_URIS.meow}",
    happy_meow: "${CAT_AUDIO_DATA_URIS.happy_meow}",
    tiny_meow: "${CAT_AUDIO_DATA_URIS.tiny_meow}",
    chirp: "${CAT_AUDIO_DATA_URIS.chirp}",
    purr: "${CAT_AUDIO_DATA_URIS.purr}",
    yawn: "${CAT_AUDIO_DATA_URIS.yawn}",
    surprised: "${CAT_AUDIO_DATA_URIS.surprised}",
    playful: "${CAT_AUDIO_DATA_URIS.playful}",
    bongo: "${CAT_AUDIO_DATA_URIS.bongo}"
  };

  const audioCache = {};
  let currentAudio = null;

  function notifyEnded(sound) {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'ended', sound: sound }));
      }
    } catch(e) {}
  }

  function getAudio(sound) {
    const key = audioMap[sound] ? sound : 'meow';
    if (!audioCache[key] && audioMap[key]) {
      try {
        const a = new Audio(audioMap[key]);
        a.preload = "auto";
        audioCache[key] = a;
      } catch(e) {}
    }
    return audioCache[key];
  }

  // Preload most common sounds immediately
  ['meow', 'happy_meow', 'tiny_meow', 'purr'].forEach(function(s) {
    getAudio(s);
  });

  function stopPlayback() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.onended = null;
      } catch(e) {}
      currentAudio = null;
    }
  }

  function playSound(sound, volume) {
    const targetVol = Math.min(Math.max(volume || 0.7, 0.05), 1.0);

    // Stop any existing playback first — STRICT SINGLE PLAYBACK POLICY
    stopPlayback();

    const audio = getAudio(sound);
    if (!audio) return;

    try {
      audio.currentTime = 0;
      audio.volume = targetVol;
      audio.playbackRate = 1.0; // Clean natural rate — zero artificial pitch distortion

      audio.onended = function() {
        if (currentAudio === audio) {
          currentAudio = null;
          notifyEnded(sound);
        }
      };

      currentAudio = audio;
      const p = audio.play();
      if (p && p.catch) {
        p.catch(function(err) {
          if (currentAudio === audio) {
            currentAudio = null;
            notifyEnded(sound);
          }
        });
      }
    } catch(err) {
      currentAudio = null;
      notifyEnded(sound);
    }
  }

  window.playSound = playSound;
  window.stopPlayback = stopPlayback;

  function handleMessage(event) {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!data) return;
      if (data.action === 'play') {
        playSound(data.sound, data.volume);
      } else if (data.action === 'stop') {
        stopPlayback();
      }
    } catch (err) {}
  }

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);
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

    const unregister = catSoundManager.registerBridge({
      play: (sound: CatSound, volume: number, _priority: CatAudioPriority) => {
        if (!catSoundManager.getSoundEnabled()) return;
        try {
          if (Platform.OS === 'web') {
            playWebAudio(sound, volume);
          } else if (webViewRef.current && activeBridgeInstanceId === instanceId) {
            const payload = JSON.stringify({ action: 'play', sound, volume });
            webViewRef.current.postMessage(payload);
            if (webViewRef.current.injectJavaScript) {
              webViewRef.current.injectJavaScript(
                `(function() { try { if (window.playSound) { window.playSound('${sound}', ${volume}); } } catch(e) {} })(); true;`
              );
            }
          }
        } catch {
          // Audio errors must never crash the app
        }
      },
      stop: () => {
        try {
          if (Platform.OS === 'web') {
            stopWebAudio();
          } else if (webViewRef.current && activeBridgeInstanceId === instanceId) {
            const payload = JSON.stringify({ action: 'stop' });
            webViewRef.current.postMessage(payload);
            if (webViewRef.current.injectJavaScript) {
              webViewRef.current.injectJavaScript(
                `(function() { try { if (window.stopPlayback) { window.stopPlayback(); } } catch(e) {} })(); true;`
              );
            }
          }
        } catch {
          // Audio errors must never crash the app
        }
      },
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      catSoundManager.handleAppStateChange(nextState);
    });

    return () => {
      appStateSub.remove();
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
        source={{ html: WEBVIEW_AUDIO_ENGINE_HTML }}
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
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data && data.action === 'ended' && data.sound) {
              catSoundManager.notifyPlaybackEnded(data.sound);
            }
          } catch {
            // Ignore non-json messages
          }
        }}
      />
    </View>
  );
});

// Clean Web Audio runner for Expo Web
let currentWebAudio: HTMLAudioElement | null = null;
const webAudioCache: Partial<Record<CatSound, HTMLAudioElement>> = {};

function stopWebAudio() {
  if (currentWebAudio) {
    try {
      currentWebAudio.pause();
      currentWebAudio.currentTime = 0;
      currentWebAudio.onended = null;
    } catch {}
    currentWebAudio = null;
  }
}

function playWebAudio(sound: CatSound, volume: number) {
  try {
    if (typeof window === 'undefined') return;

    // Strict single playback: stop existing sound immediately
    stopWebAudio();

    const dataUri = CAT_AUDIO_DATA_URIS[sound] || CAT_AUDIO_DATA_URIS.meow;
    if (!webAudioCache[sound]) {
      const a = new Audio(dataUri);
      a.preload = 'auto';
      webAudioCache[sound] = a;
    }

    const audio = webAudioCache[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.volume = Math.min(Math.max(volume || 0.7, 0.05), 1.0);
      audio.playbackRate = 1.0;

      audio.onended = () => {
        if (currentWebAudio === audio) {
          currentWebAudio = null;
          catSoundManager.notifyPlaybackEnded(sound);
        }
      };

      currentWebAudio = audio;
      audio.play().catch(() => {
        if (currentWebAudio === audio) {
          currentWebAudio = null;
          catSoundManager.notifyPlaybackEnded(sound);
        }
      });
    }
  } catch {
    // Non-blocking
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
