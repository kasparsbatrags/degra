import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios'
import {loadSession, saveSession} from '../utils/sessionUtils'
import {API_ENDPOINTS, getFreightTrackingApiUrl, getUserManagerApiUrl} from './environment'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const authAxiosInstance = axios.create({
  baseURL: getUserManagerApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

const freightAxiosInstance = axios.create({
  baseURL: getFreightTrackingApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Function to refresh token
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await authAxiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken
    });
    const { access_token, refresh_token, expires_in } = response.data;
    await saveSession(access_token, refresh_token, expires_in, null);
    return access_token;
  } catch (error) {
    throw error;
  }
};

// Request interceptor to include access token
freightAxiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const { accessToken } = await loadSession();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
freightAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { refreshToken } = await loadSession();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const newAccessToken = await refreshAccessToken(refreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return freightAxiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default freightAxiosInstance;
