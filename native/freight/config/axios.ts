import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios'
import {clearSession, loadSession, saveSession} from '../utils/sessionUtils'
import {API_ENDPOINTS, getApiUrl} from './environment'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Izveido axios instanci ar bāzes konfigurāciju
const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Stāvokļa mainīgie tokenu atjaunošanai
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Pārbaudam vai kļūda ir 401 un vai šis nav jau atkārtots mēģinājums
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Ja jau notiek tokena atjaunošana, pievienojam pieprasījumu rindai
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = await loadSession();
        if (!refreshToken) {
          throw new Error('Nav pieejams refresh token');
        }

        // Mēģinam atjaunot tokenu
        const response = await axios.post<RefreshTokenResponse>(
          `${getApiUrl()}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { access_token, refresh_token, expires_in } = response.data;

        // Saglabājam jaunos tokenus
        await saveSession(access_token, refresh_token, expires_in, null);

        // Atjaunojam Authorization galveni
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Apstrādājam rindu
        processQueue(null, access_token);

        // Atkārtojam sākotnējo pieprasījumu
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        await clearSession();
        throw refreshError;
      } finally {
        isRefreshing = false;
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
