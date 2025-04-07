import {Dimensions, Platform, ScaledSize} from 'react-native'

/**
 * Utility functions for platform-specific optimizations
 */

/**
 * Checks if the current platform is web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Checks if the current platform is iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Checks if the current platform is Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Checks if the current platform is mobile (iOS or Android)
 */
export const isMobile = isIOS || isAndroid;

/**
 * Gets the current window dimensions
 */
export const getWindowDimensions = (): ScaledSize => Dimensions.get('window');

/**
 * Checks if the current device is a tablet based on screen size
 * (rough estimation, not 100% accurate)
 */
export const isTablet = (): boolean => {
  const {width, height} = getWindowDimensions();
  const screenSize = Math.sqrt(width * width + height * height);
  return screenSize >= 1000; // Rough estimation for tablet size
};

/**
 * Checks if the current device is in landscape orientation
 */
export const isLandscape = (): boolean => {
  const {width, height} = getWindowDimensions();
  return width > height;
};

/**
 * Returns a value based on the current platform
 * @param webValue Value to return on web
 * @param mobileValue Value to return on mobile (iOS and Android)
 * @param defaultValue Default value to return if no platform matches
 */
export function platformSelect<T>(webValue: T, mobileValue: T, defaultValue?: T): T {
  if (isWeb) return webValue;
  if (isMobile) return mobileValue;
  return defaultValue !== undefined ? defaultValue : mobileValue;
}

/**
 * Returns a value based on the current platform
 * @param options Object with platform-specific values
 */
export function platformSpecific<T>({
  web,
  ios,
  android,
  default: defaultValue,
}: {
  web?: T;
  ios?: T;
  android?: T;
  default: T;
}): T {
  if (isWeb && web !== undefined) return web;
  if (isIOS && ios !== undefined) return ios;
  if (isAndroid && android !== undefined) return android;
  return defaultValue;
}

/**
 * Adds platform-specific styles to a style object
 * @param baseStyles Base styles to apply on all platforms
 * @param webStyles Styles to apply only on web
 * @param iosStyles Styles to apply only on iOS
 * @param androidStyles Styles to apply only on Android
 */
export function platformStyles(
  baseStyles: Record<string, any>,
  webStyles: Record<string, any> = {},
  iosStyles: Record<string, any> = {},
  androidStyles: Record<string, any> = {}
): Record<string, any> {
  let platformSpecificStyles = {};
  
  if (isWeb) {
    platformSpecificStyles = webStyles;
  } else if (isIOS) {
    platformSpecificStyles = iosStyles;
  } else if (isAndroid) {
    platformSpecificStyles = androidStyles;
  }
  
  return {
    ...baseStyles,
    ...platformSpecificStyles,
  };
}

/**
 * Returns a platform-specific font family
 * @param options Font family options for different platforms
 */
export function platformFont({
  web = 'Poppins-Regular',
  ios = 'Poppins-Regular',
  android = 'Poppins-Regular',
}: {
  web?: string;
  ios?: string;
  android?: string;
} = {}): string {
  return platformSpecific({
    web,
    ios,
    android,
    default: 'Poppins-Regular',
  });
}

/**
 * Vides tipi
 */
export type Environment = 'development' | 'test' | 'production';

/**
 * Checks if the app is running in development mode
 */
export const isDevelopment = __DEV__;

/**
 * Nosaka pašreizējo vidi
 * @returns Pašreizējā vide (development, test, production)
 */
export const getEnvironment = (): Environment => {
  if (__DEV__) return 'development';
  
  // Testa vides noteikšana
  // Šeit var pievienot loģiku testa vides noteikšanai
  // Piemēram, balstoties uz URL vai konfigurācijas mainīgo
  const isTestEnv = process.env.REACT_APP_ENV === 'test' || 
                    (typeof window !== 'undefined' && window.location.hostname.includes('test-'));
  
  return isTestEnv ? 'test' : 'production';
};

/**
 * Pārbauda, vai pašreizējā vide ir testa vide
 */
export const isTestEnvironment = (): boolean => getEnvironment() === 'test';

/**
 * Pārbauda, vai pašreizējā vide ir produkcijas vide
 */
export const isProductionEnvironment = (): boolean => getEnvironment() === 'production';
