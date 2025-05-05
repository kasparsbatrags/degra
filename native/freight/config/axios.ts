import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios'
import {decodeJwt} from '../lib/api'
import {isSessionActive, clearSession, loadSession, saveSession} from '../utils/sessionUtils'
import {isDevelopment, platformSpecific} from '../utils/platformUtils'
import {API_ENDPOINTS, getApiTimeout, getMaxRetries, getUserManagerApiUrl} from './environment'
import {router} from 'expo-router'
import {Platform} from 'react-native'

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Funkcija, kas novirza uz login lapu
const redirectToLogin = () => {
  // Izmantojam setTimeout, lai izvairītos no problēmām ar React rendering ciklu
  setTimeout(() => {
    // Tikai web platformā veicam automātisku redirektu
    if (Platform.OS === 'web') {
      router.replace('/(auth)/login');
    }
  }, 100);
};

/**
 * Izveido un konfigurē axios instanci
 * @param baseURL API bāzes URL
 * @returns Konfigurēta axios instance
 */
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  // Platformai specifiski headeri
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
  
  // Izveido axios instanci ar bāzes konfigurāciju
  const instance = axios.create({
    baseURL,
    timeout: getApiTimeout(),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...platformHeaders
    },
  });
  
  // Pievieno interceptoru pieprasījumiem
  instance.interceptors.request.use(
    async (config) => {
      try {
        // Pārbaudam, vai sesija ir aktīva
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
        return config; // Turpinām ar pieprasījumu pat ja ir kļūda
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Pievieno interceptoru atbildēm
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomInternalAxiosRequestConfig;
      
      // Ja saņemam 401 un tas nav login pieprasījums, mēģinām atjaunot tokenu
      if (error.response?.status === 401 && 
          originalRequest?.url !== API_ENDPOINTS.AUTH.LOGIN &&
          !originalRequest?._retry) {
        
        try {
          // Atzīmējam, ka šis pieprasījums jau ir mēģināts atkārtot
          originalRequest._retry = true;
          
          // Mēģinām atjaunot tokenu
          const { accessToken, user } = await loadSession();
          
          // Ja nav tokena, notīrām sesiju, novirzām uz login lapu un atgriežam kļūdu
          if (!accessToken) {
            await clearSession();
            redirectToLogin();
            return Promise.reject(error);
          }
          
          // Mēģinām atjaunot tokenu
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
            
            // Dekodējam jauno tokenu, lai iegūtu lietotāja informāciju
            const userInfo = decodeJwt(newToken);
            
            // Saglabājam jauno tokenu
            await saveSession(newToken, expiresIn, user);
            
            // Atjaunojam oriģinālo pieprasījumu ar jauno tokenu
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Atkārtojam oriģinālo pieprasījumu
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Ja neizdevās atjaunot tokenu, notīrām sesiju un novirzām uz login lapu
          await clearSession();
          redirectToLogin();
        }
      }
      
      // Ja saņemam 401 un tas nav login pieprasījums, novirzām uz login lapu
      if (error.response?.status === 401 && 
          originalRequest?.url !== API_ENDPOINTS.AUTH.LOGIN) {
        // Notīrām sesiju un novirzām uz login lapu
        await clearSession();
        redirectToLogin();
      }
      
      // Apstrādājam tīkla kļūdas
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

// Izstrādes vidē atslēdzam SSL verifikāciju
if (isDevelopment) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Izveido un eksportē axios instanci
const axiosInstance = createAxiosInstance(getUserManagerApiUrl());
export default axiosInstance;

// Eksportējam arī funkciju, lai varētu izveidot citas instances
export { createAxiosInstance };
