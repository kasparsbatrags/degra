import axios, {InternalAxiosRequestConfig} from 'axios'
import {loadSession} from '../utils/sessionUtils'
import {getFreightTrackingApiUrl} from './environment'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const freightAxiosInstance = axios.create({
  baseURL: getFreightTrackingApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add request interceptor to include access token
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

export default freightAxiosInstance;
