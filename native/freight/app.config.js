const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Nosaka, kurš .env fails jāizmanto
let envFile = '.env';

// Ja ir iestatīts ENVFILE, izmantojam to
if (process.env.ENVFILE) {
  envFile = process.env.ENVFILE;
  console.log(`Izmantojam ENVFILE: ${envFile}`);
}
// Ja nav iestatīts ENVFILE, bet ir iestatīts APP_ENV, izmantojam atbilstošu .env failu
else if (process.env.APP_ENV) {
  envFile = `.env.${process.env.APP_ENV}`;
  console.log(`Izmantojam APP_ENV: ${process.env.APP_ENV}, envFile: ${envFile}`);
}

const envPath = path.resolve(__dirname, envFile);
console.log(`Pilnais ceļš uz .env failu: ${envPath}`);

// Pārbaudām, vai norādītais .env fails eksistē
if (!fs.existsSync(envPath)) {
  console.error(`BRĪDINĀJUMS: Fails ${envFile} nav atrasts. Izmantojam noklusējuma .env failu.`);
  envFile = '.env';
}

// Notīrām iepriekš ielādētos vides mainīgos
Object.keys(process.env).forEach(key => {
  if (key.startsWith('API_') || key === 'APP_ENV' || key === 'CACHE_TIME' || key === 'MAX_RETRIES') {
    console.log(`Notīrām vides mainīgo: ${key}`);
    delete process.env[key];
  }
});

// Ielādē vides mainīgos no .env faila
console.log(`Ielādējam vides mainīgos no faila: ${envFile}`);
const env = dotenv.config({ path: path.resolve(__dirname, envFile) }).parsed || {};

console.log(`Ielādēti vides mainīgie no ${envFile} faila:`, Object.keys(env).join(', '));
console.log(`API_BASE_URL: ${env.API_BASE_URL}`);
console.log(`APP_ENV: ${env.APP_ENV}`);

// Iegūst app.json konfigurāciju
const appJson = require('./app.json');

// Eksportē apvienoto konfigurāciju
const config = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // Vides mainīgie, kas būs pieejami caur expo-constants
      API_BASE_URL: env.API_BASE_URL,
      API_PATHS_USER_MANAGER: env.API_PATHS_USER_MANAGER,
      API_PATHS_COMPANY: env.API_PATHS_COMPANY,
      API_PATHS_FREIGHT_TRACKING: env.API_PATHS_FREIGHT_TRACKING,
  API_TIMEOUT: env.API_TIMEOUT,
  CACHE_TIME: env.CACHE_TIME,
  MAX_RETRIES: env.MAX_RETRIES,
  APP_ENV: env.APP_ENV,
  ENCRYPTION_KEY: env.ENCRYPTION_KEY // Pievienots jaunais mainīgais
    }
  }
};

console.log(`Konfigurācijas extra.API_BASE_URL: ${config.expo.extra.API_BASE_URL}`);
console.log(`Konfigurācijas extra.APP_ENV: ${config.expo.extra.APP_ENV}`);

module.exports = config;
