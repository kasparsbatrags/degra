import axios, {AxiosInstance} from 'axios'
import {getCompanyApiUrl} from './environment'
import {createAxiosInstance} from './axios'
import {isWeb} from '../utils/platformUtils'

// Izveido bāzes axios instanci
const companyAxiosInstance = createAxiosInstance(getCompanyApiUrl());

// Pievieno papildu interceptoru, lai apstrādātu CORS kļūdas (īpaši svarīgi web platformai)
if (isWeb) {
  companyAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.message.includes('CORS')) {
        console.error('CORS Error:', error);
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
        throw new Error(
          'Organizāciju API serverī (' + getCompanyApiUrl() + ') nav konfigurēts CORS.\n\n' +
          'Lai atļautu pieprasījumus no ' + currentOrigin + ', pievienojiet API atbildēm šādas galvenes:\n\n' +
          '1. Access-Control-Allow-Origin: ' + currentOrigin + '\n' +
          '2. Access-Control-Allow-Methods: GET, OPTIONS\n' +
          '3. Access-Control-Allow-Headers: Content-Type\n\n' +
          'Piemērs Express.js serverim:\n\n' +
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
