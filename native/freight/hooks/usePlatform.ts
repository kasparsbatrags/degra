import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { 
  PlatformType, 
  DeviceType, 
  getPlatform, 
  getDeviceType, 
  isWeb, 
  isNative, 
  isMobile,
  BREAKPOINTS,
  getScreenDimensions 
} from '../utils/platform';

/**
 * Platform information interface
 */
export interface PlatformInfo {
  platform: PlatformType;
  deviceType: DeviceType;
  isWeb: boolean;
  isNative: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Hook for platform detection and responsive behavior
 */
export const usePlatform = (): PlatformInfo => {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(() => {
    const dimensions = getScreenDimensions();
    return {
      platform: getPlatform(),
      deviceType: getDeviceType(),
      isWeb: isWeb(),
      isNative: isNative(),
      isMobile: isMobile(),
      screenWidth: dimensions.width,
      screenHeight: dimensions.height,
    };
  });

  useEffect(() => {
    if (isWeb()) {
      // Web resize listener
      const handleResize = () => {
        const dimensions = getScreenDimensions();
        setPlatformInfo(prev => ({
          ...prev,
          deviceType: getDeviceType(),
          screenWidth: dimensions.width,
          screenHeight: dimensions.height,
        }));
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      // React Native dimensions listener
      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setPlatformInfo(prev => ({
          ...prev,
          screenWidth: window.width,
          screenHeight: window.height,
        }));
      });

      return () => subscription?.remove();
    }
  }, []);

  return platformInfo;
};

/**
 * Hook for checking specific breakpoints
 */
export const useBreakpoint = () => {
  const { screenWidth } = usePlatform();

  return {
    isXs: screenWidth >= BREAKPOINTS.xs,
    isSm: screenWidth >= BREAKPOINTS.sm,
    isMd: screenWidth >= BREAKPOINTS.md,
    isLg: screenWidth >= BREAKPOINTS.lg,
    isXl: screenWidth >= BREAKPOINTS.xl,
    is2Xl: screenWidth >= BREAKPOINTS['2xl'],
    is3Xl: screenWidth >= BREAKPOINTS['3xl'],
    current: getCurrentBreakpoint(screenWidth),
  };
};

/**
 * Get current active breakpoint
 */
const getCurrentBreakpoint = (width: number): keyof typeof BREAKPOINTS => {
  if (width >= BREAKPOINTS['3xl']) return '3xl';
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

/**
 * Hook for adaptive component selection
 */
export const useAdaptiveComponents = <T extends Record<string, any>>(
  components: {
    web?: T;
    mobile?: T;
    tablet?: T;
    desktop?: T;
    fallback: T;
  }
) => {
  const { platform, deviceType } = usePlatform();

  // Platform-specific components
  if (components.web && platform === 'web') {
    return components.web;
  }

  // Device-specific components
  if (components.desktop && deviceType === 'desktop') {
    return components.desktop;
  }
  
  if (components.tablet && deviceType === 'tablet') {
    return components.tablet;
  }
  
  if (components.mobile && deviceType === 'mobile') {
    return components.mobile;
  }

  return components.fallback;
};

/**
 * Hook for responsive values
 */
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  '3xl'?: T;
  fallback: T;
}) => {
  const breakpoints = useBreakpoint();

  // Check from largest to smallest
  if (values['3xl'] !== undefined && breakpoints.is3Xl) return values['3xl'];
  if (values['2xl'] !== undefined && breakpoints.is2Xl) return values['2xl'];
  if (values.xl !== undefined && breakpoints.isXl) return values.xl;
  if (values.lg !== undefined && breakpoints.isLg) return values.lg;
  if (values.md !== undefined && breakpoints.isMd) return values.md;
  if (values.sm !== undefined && breakpoints.isSm) return values.sm;
  if (values.xs !== undefined && breakpoints.isXs) return values.xs;

  return values.fallback;
};

/**
 * Hook for platform-specific styling
 */
export const usePlatformStyles = () => {
  const { platform, deviceType, isWeb, isNative } = usePlatform();

  const getStyle = (styles: {
    web?: any;
    native?: any;
    mobile?: any;
    tablet?: any;
    desktop?: any;
    default?: any;
  }) => {
    // Platform-specific styles first
    if (styles.web && isWeb) return styles.web;
    if (styles.native && isNative) return styles.native;
    
    // Device-specific styles
    if (styles.desktop && deviceType === 'desktop') return styles.desktop;
    if (styles.tablet && deviceType === 'tablet') return styles.tablet;
    if (styles.mobile && deviceType === 'mobile') return styles.mobile;
    
    return styles.default || {};
  };

  return { getStyle, platform, deviceType, isWeb, isNative };
};

export default usePlatform;