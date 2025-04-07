import {
  isAndroid, 
  isDevelopment, 
  isIOS, 
  isWeb, 
  platformSpecific, 
  getEnvironment,
  Environment as EnvType
} from '../utils/platformUtils'

/**
 * Vides konfigurācija
 */
interface Environment {
  // API URLs
  userManagerApiUrl: string;
  companyApiUrl: string;
  freightTrackingApiUrl: string;
  
  // Citi konfigurācijas parametri
  apiTimeout: number;
  cacheTime: number;
  maxRetries: number;
}

/**
 * Izstrādes vides konfigurācija
 */
const devEnvironment: Environment = {
  userManagerApiUrl: platformSpecific({
    web: 'http://localhost:8080',
    ios: 'http://localhost:8080',
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080'
  }),
  companyApiUrl:  platformSpecific({
	  web: 'http://localhost:8085',
	  ios: 'http://localhost:8085',
	  android: 'http://10.0.2.2:8085',
	  default: 'http://localhost:8085'
  }),

  freightTrackingApiUrl: platformSpecific({
    web: 'http://localhost:8084',
    ios: 'http://localhost:8084',
    android: 'http://10.0.2.2:8084',
    default: 'http://localhost:8084'
  }),
  apiTimeout: 15000,
  cacheTime: 1000 * 60 * 60, // 1 stunda
  maxRetries: 3
};

/**
 * Testa vides konfigurācija
 */
const testEnvironment: Environment = {
  userManagerApiUrl: 'https://test-usermanager.degra.lv',
  companyApiUrl: 'https://test-company.degra.lv',
  freightTrackingApiUrl: 'https://test-freight-tracking.degra.lv',
  apiTimeout: 12000,
  cacheTime: 1000 * 60 * 45, // 45 minūtes
  maxRetries: 3
};

/**
 * Produkcijas vides konfigurācija
 */
const prodEnvironment: Environment = {
  userManagerApiUrl: 'https://api.degra.lv',
  companyApiUrl: 'https://company.degra.lv',
  freightTrackingApiUrl: 'https://freight-tracking-api.degra.lv',
  apiTimeout: 10000,
  cacheTime: 1000 * 60 * 30, // 30 minūtes
  maxRetries: 2
};

/**
 * Aktīvā vides konfigurācija
 */
export const ENV: Environment = (() => {
  const env = getEnvironment();
  switch (env) {
    case 'development':
      return devEnvironment;
    case 'test':
      return testEnvironment;
    case 'production':
    default:
      return prodEnvironment;
  }
})();

/**
 * Iegūst pašreizējās vides nosaukumu
 */
export const getCurrentEnvironmentName = (): EnvType => getEnvironment();

/**
 * Iegūst Company API URL
 */
export const getCompanyApiUrl = (): string => ENV.companyApiUrl;

/**
 * Iegūst User Manager API URL
 */
export const getUserManagerApiUrl = (): string => ENV.userManagerApiUrl;

/**
 * Iegūst Freight Tracking API URL
 */
export const getFreightTrackingApiUrl = (): string => ENV.freightTrackingApiUrl;

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
    REGISTER: '/api/user/register',
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
    GET_ME: '/api/user/me',
    REFRESH: '/api/user/refresh'
  },
  FREIGHT: {
    BASE: '/api/freight',
    LIST: '/api/freight/list',
    DETAILS: (id: string) => `/api/freight/${id}`,
    STATUS: (id: string) => `/api/freight/${id}/status`
  },
  COMPANY: {
    SUGGESTION: '/api/companys/suggestions'
  }
};
