import React from 'react';
import { ColorValue } from 'react-native';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'alerts'
  | 'locations'
  | 'me'
  | 'sun'
  | 'cloud'
  | 'rain'
  | 'wind'
  | 'fog'
  | 'thermometer'
  | 'droplet'
  | 'compass'
  | 'wave'
  | 'plant'
  | 'run'
  | 'calendar'
  | 'alert-triangle'
  | 'map-pin'
  | 'search'
  | 'check'
  | 'close'
  | 'chevron-right'
  | 'refresh'
  | 'sliders'
  | 'shield'
  | 'play'
  | 'pause'
  | 'radar'
  | 'layers'
  | 'globe'
  | 'bell'
  | 'x'
  | 'plus'
  | 'trash'
  | 'github'
  | 'external-link';

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue | string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = '#000000', strokeWidth = 2 }: IconProps) {
  const strokeColor = color as any;
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M9 21V12H15V21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'alerts':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 8A6 6 0 006 8C6 15 3 17 3 17H21S18 15 18 8Z"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M13.73 21A2 2 0 0110.27 21" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'locations':
    case 'map-pin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="10" r="3" stroke={strokeColor} strokeWidth={strokeWidth} />
        </Svg>
      );

    case 'me':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="7" r="4" stroke={strokeColor} strokeWidth={strokeWidth} />
        </Svg>
      );

    case 'sun':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="5" stroke={strokeColor} strokeWidth={strokeWidth} />
          <Line x1="12" y1="1" x2="12" y2="3" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="12" y1="21" x2="12" y2="23" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="1" y1="12" x2="3" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="21" y1="12" x2="23" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'cloud':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 10H16.74C16.34 6.61 13.48 4 10 4C6.13 4 3 7.13 3 11C3 11.35 3.03 11.69 3.08 12.03C1.84 13.08 1 14.7 1 16.5C1 19.54 3.46 22 6.5 22H18C20.76 22 23 19.76 23 17C23 14.24 20.76 12 18 12V10Z"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'rain':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M19 12C19 8.69 16.31 6 13 6C10.05 6 7.57 8.13 7.08 11C4.78 11.55 3 13.57 3 16C3 18.76 5.24 21 8 21H18C20.21 21 22 19.21 22 17C22 14.93 20.43 13.22 18.42 13.03"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line x1="8" y1="17" x2="8" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="12" y1="17" x2="12" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="16" y1="17" x2="16" y2="22" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'wind':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9.59 4.59A2 2 0 1111 8H2M12.59 19.41A2 2 0 1014 16H2M17.73 7.73A2.5 2.5 0 1119.5 12H2" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'fog':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line x1="3" y1="7" x2="21" y2="7" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="6" y1="12" x2="18" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="4" y1="17" x2="20" y2="17" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'thermometer':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M14 14.76V3.5A2.5 2.5 0 009 3.5v11.26a4.5 4.5 0 105 0z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'droplet':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'compass':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={strokeColor} strokeWidth={strokeWidth} />
          <Polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" stroke={strokeColor} strokeWidth={strokeWidth} />
        </Svg>
      );

    case 'wave':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5 0M2 18c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 5 0" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'plant':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22V10M12 10C12 5 7 3 2 4c0 6 4 10 10 6zM12 10c0-5 5-7 10-6 0 6-4 10-10 6z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'run':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="16" cy="4" r="2" stroke={strokeColor} strokeWidth={strokeWidth} />
          <Path d="M7 21l3-4 2-2 3 3 4-2M15 11l-3-2-4 3-3-1" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="4" width="18" height="18" rx="2" stroke={strokeColor} strokeWidth={strokeWidth} />
          <Line x1="16" y1="2" x2="16" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="8" y1="2" x2="8" y2="6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="3" y1="10" x2="21" y2="10" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'alert-triangle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1="12" y1="9" x2="12" y2="13" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="12" y1="17" x2="12.01" y2="17" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="8" stroke={strokeColor} strokeWidth={strokeWidth} />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polyline points="20 6 9 17 4 12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'x':
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line x1="18" y1="6" x2="6" y2="18" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="6" y1="6" x2="18" y2="18" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line x1="12" y1="5" x2="12" y2="19" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="5" y1="12" x2="19" y2="12" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'trash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polyline points="3 6 5 6 21 6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polyline points="9 18 15 12 9 6" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'refresh':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'sliders':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line x1="4" y1="21" x2="4" y2="14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="4" y1="10" x2="4" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="12" y1="21" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="12" y1="8" x2="12" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="20" y1="21" x2="20" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="20" y1="12" x2="20" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="1" y1="14" x2="7" y2="14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="9" y1="8" x2="15" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="17" y1="16" x2="23" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 3l14 9-14 9V3z" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'pause':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="6" y="4" width="4" height="16" fill={color} stroke={color} strokeWidth={strokeWidth} />
          <Rect x="14" y="4" width="4" height="16" fill={color} stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );

    case 'radar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="12" cy="12" r="2" fill={color} stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 12L19 5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );

    case 'layers':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polyline points="12 2 2 7 12 12 22 7 12 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points="2 17 12 22 22 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points="2 12 12 17 22 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'globe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
          <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );

    case 'bell':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'github':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'external-link':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Polyline points="15 3 21 3 21 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Line x1="10" y1="14" x2="21" y2="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    default:
      return null;
  }
}
