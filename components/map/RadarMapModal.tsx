import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui/Icon';
import { useTheme } from '../../theme/ThemeProvider';
import { useAnimationStore } from '../../store/useAnimationStore';
import { useLocaleStore } from '../../store/useLocaleStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLon?: number;
  locationName?: string;
}

interface RadarFrame {
  time: number;
  path: string;
}

export function RadarMapModal({
  visible,
  onClose,
  initialLat = 28.6139,
  initialLon = 77.2090,
  locationName = 'New Delhi',
}: Props) {
  const theme = useTheme();
  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);
  const t = useLocaleStore((state) => state.t);

  const [activeLayer, setActiveLayer] = useState<'radar' | 'satellite' | 'wind'>('radar');
  const [isPlaying, setIsPlaying] = useState(animationsEnabled);
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [satellitePath, setSatellitePath] = useState<string | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const webViewRef = useRef<WebView>(null);
  const playIntervalRef = useRef<any>(null);

  // Fetch RainViewer radar and satellite timestamps for live Doppler coverage
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const past = data.radar?.past || [];
        const nowcast = data.radar?.nowcast || [];
        const all = [...past, ...nowcast];
        setFrames(all);
        setCurrentFrameIndex(past.length > 0 ? past.length - 1 : 0);

        const satInfra = data.satellite?.infrared || [];
        if (satInfra.length > 0) {
          setSatellitePath(satInfra[satInfra.length - 1].path);
        }

        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        const now = Math.floor(Date.now() / 1000);
        setFrames([{ time: now, path: `/v2/radar/${now}` }]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Handle Play/Pause timeline animation
  useEffect(() => {
    if (isPlaying && animationsEnabled && frames.length > 1) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const next = (prev + 1) % frames.length;
          if (webViewRef.current && frames[next]) {
            webViewRef.current.postMessage(
              JSON.stringify({ type: 'SET_FRAME', path: frames[next].path })
            );
          }
          return next;
        });
      }, 1200);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, animationsEnabled, frames]);

  const handleLayerChange = (layer: 'radar' | 'satellite' | 'wind') => {
    setActiveLayer(layer);
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'SET_LAYER', layer, satellitePath }));
    }
  };

  const centerMap = (lat: number, lon: number) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'CENTER', lat, lon }));
    }
  };

  const currentTimestamp = frames[currentFrameIndex]?.time;
  const formattedTime = currentTimestamp
    ? new Date(currentTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Live';

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #111; }
    .leaflet-control-attribution { display: none; }
    .custom-marker {
      background: ${theme.colors.primary};
      width: 14px;
      height: 14px;
      border-radius: 7px;
      border: 2px solid #fff;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    .dbz-legend {
      position: absolute;
      bottom: 12px;
      left: 12px;
      z-index: 999;
      background: rgba(0,0,0,0.75);
      padding: 6px 10px;
      border-radius: 8px;
      color: #fff;
      font-family: sans-serif;
      font-size: 10px;
    }
    .dbz-bar {
      width: 120px;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(to right, #7bf, #09f, #0c0, #ff0, #f80, #f00, #f0f);
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="dbz-legend">
    <div style="display:flex; justify-content:space-between;">
      <span>Light</span><span>Heavy Rain</span>
    </div>
    <div class="dbz-bar"></div>
  </div>

  <script>
    var map = L.map('map', { zoomControl: false }).setView([${initialLat}, ${initialLon}], 6);
    var baseTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(baseTileUrl, { maxZoom: 18 }).addTo(map);

    var radarLayer = null;
    var currentPath = '${frames[currentFrameIndex]?.path || ''}';

    function updateRadarTile(path) {
      if (!path) return;
      var tileUrl = 'https://tilecache.rainviewer.com' + path + '/256/{z}/{x}/{y}/2/1_1.png';
      if (radarLayer) {
        map.removeLayer(radarLayer);
      }
      radarLayer = L.tileLayer(tileUrl, { opacity: 0.72, maxZoom: 16 }).addTo(map);
    }

    if (currentPath) {
      updateRadarTile(currentPath);
    }

    var marker = L.marker([${initialLat}, ${initialLon}], {
      icon: L.divIcon({ className: 'custom-marker', iconSize: [14, 14] })
    }).addTo(map);

    window.addEventListener('message', function(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'SET_FRAME') {
          updateRadarTile(data.path);
        } else if (data.type === 'CENTER') {
          map.panTo([data.lat, data.lon]);
          marker.setLatLng([data.lat, data.lon]);
        } else if (data.type === 'SET_LAYER') {
          if (data.layer === 'satellite') {
            if (radarLayer) map.removeLayer(radarLayer);
            var satPath = data.satellitePath || ('/v2/satellite/' + Math.floor(Date.now() / 1000 - 600));
            radarLayer = L.tileLayer('https://tilecache.rainviewer.com' + satPath + '/256/{z}/{x}/{y}/0/0_0.png', { opacity: 0.65 }).addTo(map);
          } else {
            updateRadarTile(currentPath);
          }
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typography variant="h3" numberOfLines={1} style={{ fontWeight: '800' }}>
              {t('liveRadarSatellite')}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
              {locationName} ({initialLat.toFixed(2)}N, {initialLon.toFixed(2)}E)
            </Typography>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={[styles.closeButton, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <Icon name="close" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Layer Selectors (Horizontally Scrollable) */}
        <View style={{ marginBottom: 4 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 8,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}
          >
            {(['radar', 'satellite', 'wind'] as const).map((l) => (
              <TouchableOpacity
                key={l}
                onPress={() => handleLayerChange(l)}
                activeOpacity={0.7}
                style={[
                  styles.layerChip,
                  {
                    backgroundColor: activeLayer === l ? theme.colors.primary : theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Icon
                  name={l === 'radar' ? 'radar' : l === 'satellite' ? 'cloud' : 'wind'}
                  size={13}
                  color={activeLayer === l ? (theme.colors.onPrimary || '#fff') : theme.colors.text}
                />
                <Typography
                  variant="caption"
                  color={activeLayer === l ? (theme.colors.onPrimary || '#fff') : theme.colors.text}
                  style={{ marginLeft: 4, fontWeight: '700', textTransform: 'capitalize' }}
                >
                  {l === 'radar' ? t('dopplerRadar') : l === 'satellite' ? t('insatClouds') : t('windVectors')}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interactive Map WebView */}
        <View style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>
                {t('loadingRadar')}
              </Typography>
            </View>
          )}

          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        {/* Timeline Scrubber Controls */}
        <View style={[styles.timelineContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                activeOpacity={0.7}
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
              >
                <Icon name={isPlaying ? 'pause' : 'play'} size={14} color={theme.colors.onPrimary || '#fff'} />
              </TouchableOpacity>
              <View style={{ marginLeft: 10 }}>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  {t('radarLoopTime')}
                </Typography>
                <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                  {formattedTime}
                </Typography>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => centerMap(initialLat, initialLon)}
              activeOpacity={0.7}
              style={[styles.centerButton, { backgroundColor: theme.colors.surfaceSecondary }]}
            >
              <Icon name="map-pin" size={13} color={theme.colors.primary} />
              <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4, fontWeight: '700' }}>
                {t('centerMap')}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Stepper Dots */}
          <View style={styles.stepperRow}>
            {frames.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setCurrentFrameIndex(i);
                  if (webViewRef.current && frames[i]) {
                    webViewRef.current.postMessage(JSON.stringify({ type: 'SET_FRAME', path: frames[i].path }));
                  }
                }}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: i === currentFrameIndex ? theme.colors.primary : theme.colors.border,
                    width: i === currentFrameIndex ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  layerBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  layerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  loader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
});
