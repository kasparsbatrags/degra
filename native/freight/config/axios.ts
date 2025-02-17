import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios'
import {clearSession, loadSession} from '../utils/sessionUtils'
import {API_ENDPOINTS, getUserManagerApiUrl} from './environment'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Izveido axios instanci ar bāzes konfigurāciju
const axiosInstance = axios.create({
  baseURL: getUserManagerApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Pievieno interceptoru pieprasījumiem
axiosInstance.interceptors.request.use(
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

// Pievieno interceptoru atbildēm
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Ja saņemam 401 un tas nav login pieprasījums, notīram sesiju
    if (error.response?.status === 401 && 
        error.config?.url !== API_ENDPOINTS.AUTH.LOGIN) {
      await clearSession();
    }
    return Promise.reject(error);
  }
);

// Izstrādes vidē atslēdzam SSL verifikāciju
if (__DEV__) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export default axiosInstance;
