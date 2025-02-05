import {Platform} from 'react-native'

interface Environment {
  userManagerApiUrl: string;
  androidUrl: string;
  iosUrl: string;
  webUrl: string;
  companyApiUrl: string;
  freightTrackingApiUrl: string;
}

interface Config {
  dev: Environment;
  prod: Environment;
}

export const ENV: Config = {
  dev: {
    userManagerApiUrl: 'http://localhost:8080',
    androidUrl: 'http://10.0.2.2:8080',
    iosUrl: 'http://localhost:8080',
    webUrl: 'http://localhost:8080',
    companyApiUrl: 'http://localhost:8085',
    freightTrackingApiUrl: 'http://localhost:8084'
  },
  prod: {
    userManagerApiUrl: 'https://api.degra.lv',
    androidUrl: 'https://api.degra.lv',
    iosUrl: 'https://api.degra.lv',
    webUrl: 'https://api.degra.lv',
    companyApiUrl: 'https://company-api.degra.lv',
    freightTrackingApiUrl: 'https://freight-tracking-api.degra.lv'
  }
};

export const getCompanyApiUrl = (): string => {
  return __DEV__ ? ENV.dev.companyApiUrl : ENV.prod.companyApiUrl;
};

export const getUserManagerApiUrl = (): string => {
  if (__DEV__) {
    switch (Platform.OS) {
      case 'android':
        return ENV.dev.androidUrl;
      case 'ios':
        return ENV.dev.iosUrl;
      case 'web':
        return ENV.dev.webUrl;
      default:
        return ENV.dev.userManagerApiUrl;
    }
  }
  return ENV.prod.userManagerApiUrl;
};

export const getFreightTrackingApiUrl = (): string => {
  return __DEV__ ? ENV.dev.freightTrackingApiUrl : ENV.prod.freightTrackingApiUrl;
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/user/register',
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
    GET_ME: '/api/user/me',
    REFRESH: '/api/user/refresh'
  },
  FREIGHT: {
    BASE: '/api/freight',
    LIST: '/api/freight/list',
    DETAILS: (id: string) => `/api/freight/${id}`,
    STATUS: (id: string) => `/api/freight/${id}/status`
  },
  COMPANY: {
    SUGGESTION: '/api/company/suggestion'
  }
};
