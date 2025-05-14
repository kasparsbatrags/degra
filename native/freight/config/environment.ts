import Constants from 'expo-constants'
import {Platform} from 'react-native'
import {Environment as EnvType} from '../utils/platformUtils'

// Get environment variables from expo-constants or window.APP_ENV (in web environment)
const Config = Constants.expoConfig?.extra || {}

// In web environment, check if window.APP_ENV is available
if (typeof window !== 'undefined' && window.APP_ENV) {
	// If APP_ENV is not set in Config object, but window.APP_ENV is available, use it
	if (!Config.APP_ENV) {
		Config.APP_ENV = window.APP_ENV
	}
}

/**
 * Environment configuration
 */
interface Environment {
	// API URLs
	apiBaseUrl: string;
	apiPaths: {
		userManager: string; company: string; freightTracking: string;
	};

	// Other configuration parameters
	apiTimeout: number;
	cacheTime: number;
	maxRetries: number;
}

/**
 * Platform-specific URLs
 */
const getPlatformSpecificUrl = (url: string): string => {
	if (Platform.OS === 'android' && url.includes('localhost')) {
		return url.replace('localhost', '10.0.2.2')
	}
	return url
}

/**
 * Active environment configuration
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
}

/**
 * Gets current environment name
 */
export const getCurrentEnvironmentName = (): EnvType => (Config.APP_ENV as EnvType) || 'production'

/**
 * Gets Company API URL
 */
export const getCompanyApiUrl = (): string => `${ENV.apiBaseUrl}${ENV.apiPaths.company}`

/**
 * Gets User Manager API URL
 */
export const getUserManagerApiUrl = (): string => `${ENV.apiBaseUrl}${ENV.apiPaths.userManager}`

/**
 * Gets Freight Tracking API URL
 */
export const getFreightTrackingApiUrl = (): string => `${ENV.apiBaseUrl}${ENV.apiPaths.freightTracking}`

/**
 * Gets API timeout value
 */
export const getApiTimeout = (): number => ENV.apiTimeout

/**
 * Gets cache time
 */
export const getCacheTime = (): number => ENV.cacheTime

/**
 * Gets maximum retry count
 */
export const getMaxRetries = (): number => ENV.maxRetries

/**
 * API endpoint definitions
 */
export const API_ENDPOINTS = {
	AUTH: {
		REGISTER: '/register', LOGIN: '/login', LOGOUT: '/logout', GET_ME: '/me', REFRESH: '/refresh'
	}, FREIGHT: {
		BASE: '', LIST: '/list', DETAILS: (id: string) => `/${id}`, STATUS: (id: string) => `/${id}/status`
	}, COMPANY: {
		SUGGESTION: '/suggestions'
	}
}
