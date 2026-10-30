export const Colors = {
  // Brand & Core Surfaces
  background: '#F5F8FA',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',

  // Deep Navy & Hero Card Palette (from reference mockup)
  heroNavy: '#0F2238',
  navy: '#17324D',
  navyDark: '#0A1726',
  navyLight: '#EAEFF5',

  // Primary & Accent Emerald Green
  primary: '#087F5B', // Primary Green
  primaryDark: '#066347',
  primaryLight: '#E6F4EA',
  emeraldAccent: '#10B981',
  tealLight: '#E6FFFA',

  // Typography Colors
  textMain: '#25364A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E7EDF2',
  borderLight: '#F1F5F9',
  borderDark: '#1E3A5F',

  // Functional & Semantic States
  success: '#087F5B',
  successLight: '#E8F5E9',
  warning: '#E8A23A',
  warningLight: '#FEF3E2',
  danger: '#D9534F',
  dangerLight: '#FDEDEC',
  info: '#17324D',
  infoLight: '#EBF3FA',

  // Occupancy State Badges
  occupancyEmpty: '#64748B',
  occupancyActive: '#087F5B',
  occupancyIdle: '#E8A23A',

  // Overlay / Backdrop
  backdrop: 'rgba(15, 34, 56, 0.6)',
} as const;

export const Typography = {
  fontFamily: 'System',
  sizes: {
    xxs: 10,
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '800' as const,
  },
  lineHeights: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.55,
  },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  card: 18, // 16-20px as per UI/UX guidelines
  full: 9999,
} as const;

export const Shadows = {
  subtle: {
    shadowColor: '#0F2238',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F2238',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  hero: {
    shadowColor: '#0F2238',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  modal: {
    shadowColor: '#0F2238',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
