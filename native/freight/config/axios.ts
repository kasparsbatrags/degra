import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios'
import {isSessionActive, clearSession, loadSession, saveSession} from '@/utils/sessionUtils'
import {isDevelopment, platformSpecific} from '@/utils/platformUtils'
import {API_ENDPOINTS, getApiTimeout, getUserManagerApiUrl} from './environment'
import {router as expoRouter} from 'expo-router'
import {Platform} from 'react-native'

// Flag to track if a redirect is already in progress
let isRedirectingToLogin = false;

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Function that redirects to login page
const redirectToLogin = () => {
  // Check if redirection is already in progress to avoid multiple redirects
  if (isRedirectingToLogin) {
    return; // If redirection is already in progress, exit the function
  }
  
  // Set flag that redirection is in progress
  isRedirectingToLogin = true;
  
  // Use setTimeout to avoid problems with React rendering cycle
  setTimeout(() => {
    // For web platform, use direct window.location for more reliable navigation
    if (Platform.OS === 'web') {
      console.log('Redirecting to login page using window.location');
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
          
          // If there's no token, clear session, redirect to login page and return error
          if (!accessToken) {
            await clearSession();
            redirectToLogin();
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
          // If token refresh failed, clear session and redirect to login page
          await clearSession();
          redirectToLogin();
        }
      }
      
      // If we receive 401 and it's not a login request, redirect to login page
      if (error.response?.status === 401 && 
          originalRequest?.url !== API_ENDPOINTS.AUTH.LOGIN &&
          !isRedirectingToLogin) { // Check if redirection is already in progress
        // Clear session and redirect to login page
        await clearSession();
        redirectToLogin();
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
