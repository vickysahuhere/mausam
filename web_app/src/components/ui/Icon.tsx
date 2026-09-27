import React from 'react';
import {
  Home,
  AlertTriangle,
  MapPin,
  User,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  CloudFog,
  Thermometer,
  Droplets,
  Compass,
  Waves,
  Sprout,
  Activity,
  Calendar,
  Search,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Sliders,
  Shield,
  Play,
  Pause,
  Radio,
  Layers,
  Globe,
  Bell,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export type IconName =
  | 'home'
  | 'alerts'
  | 'locations'
  | 'me'
  | 'sun'
  | 'moon'
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
  | 'clock'
  | 'github'
  | 'external-link';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  style,
}: IconProps) {
  const props = {
    size,
    color,
    strokeWidth,
    className,
    style,
  };

  switch (name) {
    case 'home':
      return <Home {...props} />;
    case 'alerts':
      return <AlertTriangle {...props} />;
    case 'locations':
      return <MapPin {...props} />;
    case 'me':
      return <User {...props} />;
    case 'sun':
      return <Sun {...props} />;
    case 'moon':
      return <Moon {...props} />;
    case 'cloud':
      return <Cloud {...props} />;
    case 'rain':
      return <CloudRain {...props} />;
    case 'wind':
      return <Wind {...props} />;
    case 'fog':
      return <CloudFog {...props} />;
    case 'thermometer':
      return <Thermometer {...props} />;
    case 'droplet':
      return <Droplets {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'wave':
      return <Waves {...props} />;
    case 'plant':
      return <Sprout {...props} />;
    case 'run':
      return <Activity {...props} />;
    case 'calendar':
      return <Calendar {...props} />;
    case 'alert-triangle':
      return <AlertTriangle {...props} />;
    case 'map-pin':
      return <MapPin {...props} />;
    case 'search':
      return <Search {...props} />;
    case 'check':
      return <Check {...props} />;
    case 'close':
    case 'x':
      return <X {...props} />;
    case 'chevron-right':
      return <ChevronRight {...props} />;
    case 'refresh':
      return <RefreshCw {...props} />;
    case 'sliders':
      return <Sliders {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'play':
      return <Play {...props} />;
    case 'pause':
      return <Pause {...props} />;
    case 'radar':
      return <Radio {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'bell':
      return <Bell {...props} />;
    case 'plus':
      return <Plus {...props} />;
    case 'trash':
      return <Trash2 {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'external-link':
      return <ExternalLink {...props} />;
    case 'github':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          style={style}
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      );
    default:
      return <Sun {...props} />;
  }
}
