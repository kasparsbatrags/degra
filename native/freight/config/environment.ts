import {Platform} from 'react-native'

interface Environment {
  apiUrl: string;
  androidUrl: string;
  iosUrl: string;
}

interface Config {
  dev: Environment;
  prod: Environment;
}

export const ENV: Config = {
  dev: {
    apiUrl: 'http://localhost:8080',
    androidUrl: 'http://10.0.2.2:8080',
    iosUrl: 'http://localhost:8080'
  },
  prod: {
    apiUrl: 'https://api.degra.lv',
    androidUrl: 'https://api.degra.lv',
    iosUrl: 'https://api.degra.lv'
  }
};

export const getApiUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return ENV.dev.androidUrl;
    }
    if (Platform.OS === 'ios') {
      return ENV.dev.iosUrl;
    }
    return ENV.dev.apiUrl; // web
  }
  return ENV.prod.apiUrl;
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/user/register',
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
    GET_ME: '/api/user/me'
  },
  FREIGHT: {
    BASE: '/api/freight',
    LIST: '/api/freight/list',
    DETAILS: (id: string) => `/api/freight/${id}`,
    STATUS: (id: string) => `/api/freight/${id}/status`
  }
};
