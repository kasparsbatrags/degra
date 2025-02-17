import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios'
import {clearSession, loadSession} from '../utils/sessionUtils'
import {getFreightTrackingApiUrl, getUserManagerApiUrl} from './environment'

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

// Response interceptor to handle unauthorized errors
freightAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearSession();
    }
    return Promise.reject(error);
  }
);

export default freightAxiosInstance;
