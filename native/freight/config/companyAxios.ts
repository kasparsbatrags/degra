import axios from 'axios'
import {getCompanyApiUrl} from './environment'

const companyAxiosInstance = axios.create({
  baseURL: getCompanyApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor to handle CORS errors with a more descriptive message
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

export default companyAxiosInstance;
