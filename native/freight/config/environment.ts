import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Environment as EnvType } from '../utils/platformUtils';

// Iegūst vides mainīgos no expo-constants vai window.APP_ENV (tīmekļa vidē)
const Config = Constants.expoConfig?.extra || {};

// Tīmekļa vidē pārbaudām, vai ir pieejams window.APP_ENV
if (typeof window !== 'undefined' && window.APP_ENV) {
  // Ja APP_ENV nav iestatīts Config objektā, bet ir pieejams window.APP_ENV, izmantojam to
  if (!Config.APP_ENV) {
    Config.APP_ENV = window.APP_ENV;
  }
}

/**
 * Vides konfigurācija
 */
interface Environment {
  // API URLs
  apiBaseUrl: string;
  apiPaths: {
    userManager: string;
    company: string;
    freightTracking: string;
  };
  
  // Citi konfigurācijas parametri
  apiTimeout: number;
  cacheTime: number;
  maxRetries: number;
}

/**
 * Platformai specifiskie URL
 */
const getPlatformSpecificUrl = (url: string): string => {
    if (Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

/**
 * Aktīvā vides konfigurācija
 */
export const ENV: Environment = {
  apiBaseUrl: getPlatformSpecificUrl(Config.API_BASE_URL || 'https://krava.degra.lv'),
  apiPaths: {
    userManager: Config.API_PATHS_USER_MANAGER || '/api/user',
    company: Config.API_PATHS_COMPANY || '/api/companys',
    freightTracking: Config.API_PATHS_FREIGHT_TRACKING || '/api/freight'
  },
  apiTimeout: Number(Config.API_TIMEOUT || 10000),
  cacheTime: Number(Config.CACHE_TIME || 1800000),
  maxRetries: Number(Config.MAX_RETRIES || 2)
};

/**
 * Iegūst pašreizējās vides nosaukumu
 */
export const getCurrentEnvironmentName = (): EnvType => 
  (Config.APP_ENV as EnvType) || 'production';

/**
 * Iegūst Company API URL
 */
export const getCompanyApiUrl = (): string => `${ENV.apiBaseUrl}${ENV.apiPaths.company}`;

/**
 * Iegūst User Manager API URL
 */
export const getUserManagerApiUrl = (): string => `${ENV.apiBaseUrl}${ENV.apiPaths.userManager}`;

/**
 * Iegūst Freight Tracking API URL
 */
export const getFreightTrackingApiUrl = (): string => `${ENV.apiBaseUrl}${ENV.apiPaths.freightTracking}`;

/**
 * Iegūst API timeout vērtību
 */
export const getApiTimeout = (): number => ENV.apiTimeout;

/**
 * Iegūst kešošanas laiku
 */
export const getCacheTime = (): number => ENV.cacheTime;

/**
 * Iegūst maksimālo mēģinājumu skaitu
 */
export const getMaxRetries = (): number => ENV.maxRetries;

/**
 * API endpointu definīcijas
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    GET_ME: '/me',
    REFRESH: '/refresh'
  },
  FREIGHT: {
    BASE: '',
    LIST: '/list',
    DETAILS: (id: string) => `/${id}`,
    STATUS: (id: string) => `/${id}/status`
  },
  COMPANY: {
    SUGGESTION: '/suggestions'
  }
};
