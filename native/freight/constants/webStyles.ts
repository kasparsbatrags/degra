import {Platform} from 'react-native'
import {BORDER_RADIUS, SIZES, SPACING} from './theme'

// Web-specific size adjustments
export const WEB_SIZES = {
  ...SIZES,
  xSmall: Platform.select({ web: 8, default: SIZES.xSmall }),
  small: Platform.select({ web: 10, default: SIZES.small }),
  medium: Platform.select({ web: 14, default: SIZES.medium }),
  large: Platform.select({ web: 16, default: SIZES.large }),
  xLarge: Platform.select({ web: 20, default: SIZES.xLarge }),
  xxLarge: Platform.select({ web: 24, default: SIZES.xxLarge }),
};

// Web-specific spacing adjustments
export const WEB_SPACING = {
  ...SPACING,
  xs: Platform.select({ web: 4, default: SPACING.xs }),
  s: Platform.select({ web: 6, default: SPACING.s }),
  m: Platform.select({ web: 12, default: SPACING.m }),
  l: Platform.select({ web: 16, default: SPACING.l }),
  xl: Platform.select({ web: 24, default: SPACING.xl }),
  xxl: Platform.select({ web: 32, default: SPACING.xxl }),
};

// Web-specific border radius adjustments
export const WEB_BORDER_RADIUS = {
  ...BORDER_RADIUS,
  xs: Platform.select({ web: 2, default: BORDER_RADIUS.xs }),
  s: Platform.select({ web: 4, default: BORDER_RADIUS.s }),
  m: Platform.select({ web: 6, default: BORDER_RADIUS.m }),
  l: Platform.select({ web: 8, default: BORDER_RADIUS.l }),
  xl: Platform.select({ web: 12, default: BORDER_RADIUS.xl }),
  xxl: Platform.select({ web: 16, default: BORDER_RADIUS.xxl }),
};

// Web-specific component size adjustments
export const WEB_COMPONENT_SIZES = {
  input: Platform.select({ web: 48, default: 48 }), // Input height
  button: Platform.select({ web: 36, default: 48 }), // Button height
  icon: Platform.select({ web: 20, default: 24 }), // Icon size
};
