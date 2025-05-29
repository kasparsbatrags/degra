const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Use global variable to prevent repeated loading across module reloads
const CACHE_KEY = '__FREIGHT_CONFIG_CACHE__';

// Function to load environment configuration
function loadEnvironmentConfig() {
  // Nosaka, kurš .env fails jāizmanto
  let envFile = '.env';

  // Ja ir iestatīts ENVFILE, izmantojam to
  if (process.env.ENVFILE) {
    envFile = process.env.ENVFILE;
  }
  // Ja nav iestatīts ENVFILE, bet ir iestatīts APP_ENV, izmantojam atbilstošu .env failu
  else if (process.env.APP_ENV) {
    envFile = `.env.${process.env.APP_ENV}`;
  }

  // Create cache key based on environment file
  const cacheKey = `${CACHE_KEY}_${envFile}`;

  // Check if we already loaded this configuration in global scope
  if (global[cacheKey]) {
    return global[cacheKey];
  }

  console.log(`🔧 Ielādējam konfigurāciju no: ${envFile}`);

  const envPath = path.resolve(__dirname, envFile);

  // Pārbaudām, vai norādītais .env fails eksistē
  if (!fs.existsSync(envPath)) {
    console.error(`⚠️  BRĪDINĀJUMS: Fails ${envFile} nav atrasts. Izmantojam noklusējuma .env failu.`);
    envFile = '.env';
  }

  // Notīrām iepriekš ielādētos vides mainīgos (only on first load)
  if (!global[CACHE_KEY + '_CLEANED']) {
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('API_') || key === 'APP_ENV' || key === 'CACHE_TIME' || key === 'MAX_RETRIES' || key === 'ENCRYPTION_KEY') {
        delete process.env[key];
      }
    });
    global[CACHE_KEY + '_CLEANED'] = true;
  }

  // Ielādē vides mainīgos no .env faila
  const env = dotenv.config({ path: path.resolve(__dirname, envFile) }).parsed || {};

  console.log(`✅ Ielādēta vide: ${env.APP_ENV || 'unknown'} (${env.API_BASE_URL || 'no URL'})`);

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
        ENCRYPTION_KEY: env.ENCRYPTION_KEY
      }
    }
  };

  // Cache the configuration globally
  global[cacheKey] = config;

  return config;
}

// Export the configuration
module.exports = loadEnvironmentConfig();
