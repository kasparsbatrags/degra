import axios, {AxiosInstance} from 'axios'
import {getCompanyApiUrl} from './environment'
import {createAxiosInstance} from './axios'
import {isWeb} from '../utils/platformUtils'

// Create base axios instance
const companyAxiosInstance = createAxiosInstance(getCompanyApiUrl());

// Add additional interceptor to handle CORS errors (especially important for web platform)
if (isWeb) {
  companyAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.message.includes('CORS')) {
        console.error('CORS Error:', error);
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
        throw new Error(
          'Organization API server (' + getCompanyApiUrl() + ') does not have CORS configured.\n\n' +
          'To allow requests from ' + currentOrigin + ', add the following headers to API responses:\n\n' +
          '1. Access-Control-Allow-Origin: ' + currentOrigin + '\n' +
          '2. Access-Control-Allow-Methods: GET, OPTIONS\n' +
          '3. Access-Control-Allow-Headers: Content-Type\n\n' +
          'Example for Express.js server:\n\n' +
          'app.use(cors({\n' +
          '  origin: "' + currentOrigin + '",\n' +
          '  methods: ["GET", "OPTIONS"],\n' +
          '  allowedHeaders: ["Content-Type"]\n' +
          '}));'
        );
      }
      throw error;
    }
  );
}

export default companyAxiosInstance;
