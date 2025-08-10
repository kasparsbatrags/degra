import { Platform } from 'react-native';

/**
 * Platform types
 */
export type PlatformType = 'web' | 'ios' | 'android' | 'native';

/**
 * Device types based on screen size and platform
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Screen size breakpoints (matches Tailwind config)
 */
export const BREAKPOINTS = {
  xs: 475,   // Small mobile
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536, // Extra large desktop
  '3xl': 1920, // Ultra wide
} as const;

/**
 * Get current platform type
 */
export const getPlatform = (): PlatformType => {
  if (Platform.OS === 'web') return 'web';
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'native';
};

/**
 * Check if current platform is web
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Check if current platform is native (iOS or Android)
 */
export const isNative = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Check if current platform is mobile (native or web mobile)
 */
export const isMobile = (): boolean => {
  if (isNative()) return true;
  
  // Web mobile detection
  if (isWeb() && typeof window !== 'undefined') {
    return window.innerWidth < BREAKPOINTS.md;
  }
  
  return false;
};

/**
 * Get device type based on screen size
 */
export const getDeviceType = (): DeviceType => {
  // Native platforms are always considered mobile
  if (isNative()) return 'mobile';
  
  // Web device type detection
  if (isWeb() && typeof window !== 'undefined') {
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.md) return 'mobile';
    if (width < BREAKPOINTS.lg) return 'tablet';
    return 'desktop';
  }
  
  return 'mobile'; // Default fallback
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  
  // Fallback for native platforms (will be overridden by Dimensions API)
  return {
    width: 375, // iPhone default
    height: 667,
  };
};

/**
 * Check if screen width matches breakpoint
 */
export const matchesBreakpoint = (breakpoint: keyof typeof BREAKPOINTS): boolean => {
  const { width } = getScreenDimensions();
  return width >= BREAKPOINTS[breakpoint];
};

/**
 * Platform-specific class names generator
 */
export const platformClasses = (webClasses: string, nativeClasses: string = ''): string => {
  return isWeb() ? webClasses : nativeClasses;
};

/**
 * Responsive class names based on device type
 */
export const responsiveClasses = (mobileClass: string, tabletClass?: string, desktopClass?: string): string => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return desktopClass || tabletClass || mobileClass;
    case 'tablet':
      return tabletClass || mobileClass;
    case 'mobile':
    default:
      return mobileClass;
  }
};

/**
 * Platform detection utilities object
 */
export const PlatformUtils = {
  // Platform checks
  isWeb,
  isNative,
  isMobile,
  getPlatform,
  getDeviceType,
  
  // Screen utilities
  getScreenDimensions,
  matchesBreakpoint,
  
  // Class helpers
  platformClasses,
  responsiveClasses,
  
  // Constants
  BREAKPOINTS,
} as const;

export default PlatformUtils;