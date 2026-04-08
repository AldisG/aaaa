// Powered by OnSpace.AI
export const Colors = {
  // Base
  bg: '#1C1C1E',
  surface: '#2C2C2E',
  surfaceElevated: '#3A3A3C',
  border: '#48484A',
  borderLight: '#636366',

  // Text
  textPrimary: '#F5F5DC',
  textSecondary: '#AEAEB2',
  textMuted: '#6C6C70',

  // Brand
  accent: '#C8A96E',
  accentLight: '#E8C98E',
  accentDark: '#A88040',

  // Page colors
  pageLinedBg: '#FFF8F0',
  pageLinedLine: '#D4C4A8',
  pageTitle: '#2C2216',

  // Tool colors (presets)
  presets: ['#1A1A1A', '#1E3A8A', '#991B1B', '#14532D', '#4A1D96', '#7C2D12'],

  // Status
  danger: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  toolbar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};
