/**
 * Design System Tokens
 * Centralized design tokens for consistent theming across platforms
 */

// Color palette
export const colors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  
  // Secondary colors
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main secondary
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Poppins-Regular', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: { size: 12, lineHeight: 16 },
    sm: { size: 14, lineHeight: 20 },
    base: { size: 16, lineHeight: 24 },
    lg: { size: 18, lineHeight: 28 },
    xl: { size: 20, lineHeight: 28 },
    '2xl': { size: 24, lineHeight: 32 },
    '3xl': { size: 30, lineHeight: 36 },
    '4xl': { size: 36, lineHeight: 40 },
    '5xl': { size: 48, lineHeight: 48 },
    '6xl': { size: 60, lineHeight: 60 },
  },
  
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

// Spacing scale
export const spacing = {
  0: 0,
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  7: 28,   // 1.75rem
  8: 32,   // 2rem
  9: 36,   // 2.25rem
  10: 40,  // 2.5rem
  11: 44,  // 2.75rem
  12: 48,  // 3rem
  14: 56,  // 3.5rem
  16: 64,  // 4rem
  18: 72,  // 4.5rem
  20: 80,  // 5rem
  24: 96,  // 6rem
  28: 112, // 7rem
  32: 128, // 8rem
  36: 144, // 9rem
  40: 160, // 10rem
  44: 176, // 11rem
  48: 192, // 12rem
  52: 208, // 13rem
  56: 224, // 14rem
  60: 240, // 15rem
  64: 256, // 16rem
  72: 288, // 18rem
  80: 320, // 20rem
  96: 384, // 24rem
} as const;

// Border radius
export const borderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Animation durations
export const duration = {
  fastest: '75ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '1000ms',
} as const;

// Breakpoints
export const breakpoints = {
  xs: 475,   // Small mobile
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536, // Extra large desktop
  '3xl': 1920, // Ultra wide
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    padding: {
      sm: { x: 12, y: 6 },
      md: { x: 16, y: 8 },
      lg: { x: 20, y: 12 },
      xl: { x: 24, y: 16 },
    },
    borderRadius: borderRadius.md,
  },
  
  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    padding: {
      sm: { x: 8, y: 6 },
      md: { x: 12, y: 8 },
      lg: { x: 16, y: 12 },
    },
    borderRadius: borderRadius.md,
  },
  
  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    borderRadius: borderRadius.lg,
    shadow: shadows.sm,
  },
  
  header: {
    height: {
      mobile: 56,
      desktop: 64,
    },
    padding: spacing[4],
  },
  
  sidebar: {
    width: {
      collapsed: 64,
      expanded: 256,
    },
    padding: spacing[4],
  },
} as const;

// Theme variants
export const themes = {
  light: {
    background: {
      primary: colors.neutral[50],
      secondary: colors.neutral[100],
      elevated: '#ffffff',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
      inverse: colors.neutral[50],
    },
    border: {
      primary: colors.neutral[200],
      secondary: colors.neutral[300],
      focus: colors.primary[500],
    },
  },
  
  dark: {
    background: {
      primary: colors.neutral[900],
      secondary: colors.neutral[800],
      elevated: colors.neutral[800],
    },
    text: {
      primary: colors.neutral[100],
      secondary: colors.neutral[400],
      disabled: colors.neutral[600],
      inverse: colors.neutral[900],
    },
    border: {
      primary: colors.neutral[700],
      secondary: colors.neutral[600],
      focus: colors.primary[400],
    },
  },
} as const;

// Export all tokens as default
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  duration,
  breakpoints,
  components,
  themes,
} as const;

export default tokens;