import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios'
import {isSessionActive, clearSession, loadSession, saveSession} from '@/utils/sessionUtils'
import {isDevelopment, platformSpecific} from '@/utils/platformUtils'
import {API_ENDPOINTS, getApiTimeout, getUserManagerApiUrl} from './environment'
import {router as expoRouter} from 'expo-router'
import {Platform} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import {isOnline} from '@/services/networkService'

// Flag to track if a redirect is already in progress
let isRedirectingToLogin = false;

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Function that redirects to login page
const redirectToLogin = async () => {
  // Check if redirection is already in progress to avoid multiple redirects
  if (isRedirectingToLogin) {
    return; // If redirection is already in progress, exit the function
  }
  
  // Pārbaudīt, vai lietotājs jau atrodas login lapā
  // Web platformai varam pārbaudīt URL
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    // Ja URL jau satur "login", neveikt pārvirzīšanu
    if (currentPath.includes('login')) {
      return;
    }
  }
  
  // Set flag that redirection is in progress
  isRedirectingToLogin = true;
  
  try {
    // Pārbaudīt, vai ierīce ir online režīmā
    const online = await isOnline();
    
    // Ja ierīce ir offline režīmā, tikai parādīt brīdinājumu un neveikt pārvirzīšanu
    if (!online) {
      console.warn('Sesija ir beigusies, bet ierīce ir offline režīmā. Pārvirzīšana notiks, kad būs pieejams internets.');
      
      // Uzstādīt klausītāju, lai pārvirzītu, kad ierīce atkal būs online režīmā
      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          // Notīrīt sesiju un pārvirzīt
          clearSession().then(() => {
            // Piezīme: AuthContext stāvoklis tiks atjaunināts automātiski, 
            // jo AuthContext.tsx failā ir pievienota periodiska sesijas statusa pārbaude
            
            // Pārvirzīt uz pieteikšanās lapu
            if (Platform.OS === 'web') {
              window.location.href = '/(auth)/login';
            } else {
              expoRouter.replace('/(auth)/login');
            }
          });
          
          // Noņemt klausītāju
          unsubscribe();
        }
      });
      
      // Atiestatīt karogu
      isRedirectingToLogin = false;
      return;
    }
    
    // Ja ierīce ir online režīmā, notīrīt sesiju un pārvirzīt
    await clearSession();
    
    // Piezīme: AuthContext stāvoklis tiks atjaunināts automātiski, 
    // jo AuthContext.tsx failā ir pievienota periodiska sesijas statusa pārbaude
    
    // Use setTimeout to avoid problems with React rendering cycle
    setTimeout(() => {
      // For web platform, use direct window.location for more reliable navigation
      if (Platform.OS === 'web') {
        window.location.href = '/(auth)/login';
      } else {
        // For mobile platforms, use expo-router
        expoRouter.replace('/(auth)/login');
      }
      
      // Reset flag after a short delay to avoid multiple redirects
      setTimeout(() => {
        isRedirectingToLogin = false;
      }, 2000); // 2 second delay to avoid multiple redirects
    }, 100);
  } catch (error) {
    console.error('Kļūda pārvirzot uz pieteikšanās lapu:', error);
    isRedirectingToLogin = false;
  }
};

// Export function so it can be used from other modules
export { redirectToLogin, isRedirectingToLogin };

/**
 * Creates and configures axios instance
 * @param baseURL API base URL
 * @returns Configured axios instance
 */
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  // Platform-specific headers
  const platformHeaders = platformSpecific({
    web: {
      'X-Platform': 'web',
    },
    ios: {
      'X-Platform': 'ios',
    },
    android: {
      'X-Platform': 'android',
    },
    default: {}
  });
  
  // Create axios instance with base configuration
  const instance = axios.create({
    baseURL,
    timeout: getApiTimeout(),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...platformHeaders
    },
  });
  
  // Add interceptor for requests
  instance.interceptors.request.use(
    async (config) => {
      try {
        // Check if session is active
        const isActive = await isSessionActive();
        
        if (isActive) {
          const { accessToken } = await loadSession();
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        }
        
        return config;
      } catch (error) {
        console.error('Error in request interceptor:', error);
        return config; // Continue with request even if there's an error
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add interceptor for responses
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomInternalAxiosRequestConfig;
      
      // If we receive 401 and it's not a login request, try to refresh token
      if (error.response?.status === 401 && 
          originalRequest?.url !== API_ENDPOINTS.AUTH.LOGIN &&
          !originalRequest?._retry &&
          !isRedirectingToLogin) { // Check if redirection is already in progress
        
        try {
          // Mark that this request has already been retried
          originalRequest._retry = true;
          
          // Try to refresh token
          const { accessToken, user } = await loadSession();
          
          // If there's no token, centralizēta sesijas izbeigšana un pārvirzīšana
          if (!accessToken) {
            const { SessionManager } = require('@/utils/SessionManager');
            await SessionManager.getInstance().handleUnauthorized();
            return Promise.reject(error);
          }
          
          // Try to refresh token
          const userManagerUrl = getUserManagerApiUrl();
          const response = await axios.post(
            `${userManagerUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          
          if (response.data && response.data.access_token) {
            const newToken = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600;
            
            // Save new token
            await saveSession(newToken, expiresIn, user);
            
            // Update original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry original request
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // If token refresh failed, centralizēta sesijas izbeigšana un pārvirzīšana
          const { SessionManager } = require('@/utils/SessionManager');
          await SessionManager.getInstance().handleUnauthorized();
        }
      }
      
      // If we receive 401 and it's not a login request, centralizēta sesijas izbeigšana un pārvirzīšana
      if (error.response?.status === 401 && 
          originalRequest?.url !== API_ENDPOINTS.AUTH.LOGIN &&
          !isRedirectingToLogin) { // Check if redirection is already in progress
        const { SessionManager } = require('@/utils/SessionManager');
        await SessionManager.getInstance().handleUnauthorized();
      }
      
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('Request timeout:', error);
      } else if (!error.response) {
        console.error('Network error:', error);
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};

// Disable SSL verification in development environment
if (isDevelopment) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Create and export axios instance
const axiosInstance = createAxiosInstance(getUserManagerApiUrl());
export default axiosInstance;

// Also export function to create other instances
export { createAxiosInstance };
