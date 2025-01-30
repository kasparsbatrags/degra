import axios from 'axios'
import {clearSession, loadSession} from '../utils/sessionUtils'
import {getApiUrl} from './environment'

// Izveido axios instanci ar bāzes konfigurāciju
const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
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
  async (error) => {
    if (error.response?.status === 401) {
      // Ja saņemam 401, mēģinām atjaunot tokenu
      try {
        const { refreshToken } = await loadSession();
        if (refreshToken) {
          // Šeit varētu būt loģika tokena atjaunošanai
          // Pagaidām vienkārši notīrām sesiju
          await clearSession();
        }
      } catch (refreshError) {
        await clearSession();
      }
    }
    return Promise.reject(error);
  }
);

// Izstrādes vidē atslēdzam SSL verifikāciju
if (__DEV__) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export default axiosInstance;
