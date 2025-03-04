import {DimensionValue} from 'react-native'

export const COLORS = {
  primary: '#161622',
  secondary: '#FF9C01',
  secondary100: '#FF9001',
  secondary200: '#FF8E01',

  black: '#000000',
  black100: '#252536',       // Updated: Lighter and more saturated for better contrast
  black200: '#2D2D45',       // Updated: Even lighter for tab containers
  
  gray: '#CDCDE0',

  white: '#FFFFFF',

  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  highlight: '#3E7BFA',      // Added: Blue highlight color for variety

  background: {
    primary: '#161622',
    secondary: '#252536',    // Updated to match black100
    app: '#161622',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#CDCDE0',
    tertiary: '#CDCDE0',
  },

  border: {
    default: '#E0E0E0',
    focus: '#007AFF',
    error: '#FF3B30',
  }
};

export const FONT = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

export const SIZES = {
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3, // Increased from 2 for better visibility on Android
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.84,
    elevation: 6, // Increased from 5 for better visibility on Android
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
};

export const CONTAINER_WIDTH: {
  mobile: DimensionValue;
  web: number;
} = {
  mobile: "100%",
  web: 400,
};
