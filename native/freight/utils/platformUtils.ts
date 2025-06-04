import { Platform } from 'react-native';

/**
 * Platform utilities for handling cross-platform compatibility
 * Especially for SQLite and other native modules that don't work on web
 */

// Check if current platform supports SQLite
export const isSQLiteSupported = (): boolean => {
  return Platform.OS !== 'web';
};

// Check if current platform is web
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

// Check if current platform is mobile (iOS or Android)
export const isMobile = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

// Safe wrapper for SQLite operations
export const withSQLiteSupport = async <T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> => {
  if (!isSQLiteSupported()) {
    if (fallback) {
      console.warn('SQLite not supported on this platform, using fallback');
      return await fallback();
    } else {
      throw new Error('SQLite operation not supported on web platform');
    }
  }
  
  return await operation();
};

// Safe wrapper for native module operations
export const withNativeSupport = async <T>(
  operation: () => Promise<T>,
  fallback?: () => Promise<T>,
  moduleName: string = 'Native module'
): Promise<T> => {
  if (isWeb()) {
    if (fallback) {
      console.warn(`${moduleName} not supported on web platform, using fallback`);
      return await fallback();
    } else {
      throw new Error(`${moduleName} operation not supported on web platform`);
    }
  }
  
  return await operation();
};

// Get platform-specific storage key prefix
export const getPlatformStoragePrefix = (): string => {
  return isWeb() ? 'web_' : 'mobile_';
};

// Log platform-specific warning
export const logPlatformWarning = (feature: string, alternative?: string): void => {
  const altText = alternative ? ` Using ${alternative} instead.` : '';
  console.warn(`${feature} is not supported on ${Platform.OS} platform.${altText}`);
};

// Check if feature is available on current platform
export const isFeatureAvailable = (feature: 'sqlite' | 'filesystem' | 'camera' | 'notifications'): boolean => {
  switch (feature) {
    case 'sqlite':
      return isSQLiteSupported();
    case 'filesystem':
    case 'camera':
    case 'notifications':
      return isMobile();
    default:
      return true;
  }
};

// Platform-specific configuration helper
export const platformSpecific = <T>(config: {
  web?: T;
  ios?: T;
  android?: T;
  default?: T;
}): T => {
  switch (Platform.OS) {
    case 'web':
      return config.web || config.default || ({} as T);
    case 'ios':
      return config.ios || config.default || ({} as T);
    case 'android':
      return config.android || config.default || ({} as T);
    default:
      return config.default || ({} as T);
  }
};

// Check if running in development mode
export const isDevelopment = (): boolean => {
  return __DEV__ || process.env.NODE_ENV === 'development';
};
