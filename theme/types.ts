export interface MausamTheme {
  id: string;
  name: string;
  tagline: string;
  isCustom?: boolean;
  isDark?: boolean;
  artDirection: {
    cardStyle: 'standard' | 'glass' | 'flat2d' | 'clinical' | 'oled' | 'pebble' | 'ticket' | 'rugged' | 'transit' | 'editorial';
    badgeStyle: 'pill' | 'square' | 'outline' | 'neon';
    dividerStyle: 'solid' | 'dashed' | 'hairline';
    shadowOffset: { width: number; height: number };
    iconStyle?: 'line' | 'bold' | 'neon';
    wallpaper?: {
      type: 'solid' | 'gradient' | 'mesh';
      gradientColors?: [string, string];
    };
  };
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    primary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    glow?: string;
    onPrimary?: string;
    successBg?: string;
    warningBg?: string;
    errorBg?: string;
  };
  typography: {
    fontFamily: {
      regular: string;
      bold: string;
    };
    sizes: {
      xs: number;
      s: number;
      m: number;
      l: number;
      xl: number;
      xxl: number;
    };
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  shapes: {
    borderRadius: {
      s: number;
      m: number;
      l: number;
      pill: number;
    };
  };
  cards: {
    elevation: number;
    borderWidth: number;
    shadowOpacity: number;
  };
}
