# Environment Configuration

This project uses `expo-constants` and `dotenv` to manage environment variables across different platforms (iOS, Android, Web).

## Environment Files

The following environment files are used:

- `.env` - Default environment file (used when no specific environment is specified)
- `.env.development` - Development environment configuration
- `.env.test` - Test environment configuration
- `.env.production` - Production environment configuration
- `.env.example` - Example environment file (template for creating new environment files)

## Environment Variables

The following environment variables are used:

- `API_BASE_URL` - Base URL for all APIs
- `API_PATHS_USER_MANAGER` - Path for User Manager API
- `API_PATHS_COMPANY` - Path for Company API
- `API_PATHS_FREIGHT_TRACKING` - Path for Freight Tracking API
- `API_TIMEOUT` - Timeout for API requests (in milliseconds)
- `CACHE_TIME` - Cache time for API responses (in milliseconds)
- `MAX_RETRIES` - Maximum number of retries for API requests
- `APP_ENV` - Current environment (development, test, production)

## Usage

### Running the App with Different Environments

```bash
# Development environment
npm run start:dev
npm run android:dev
npm run ios:dev
npm run web:dev

# Test environment
npm run start:test
npm run android:test
npm run ios:test
npm run web:test

# Production environment
npm run start:prod
npm run android:prod
npm run ios:prod
npm run web:prod
```

### Accessing Environment Variables in Code

```typescript
import Constants from 'expo-constants';

// Access environment variables directly
const baseUrl = Constants.expoConfig.extra.API_BASE_URL;
const userManagerPath = Constants.expoConfig.extra.API_PATHS_USER_MANAGER;
const timeout = Number(Constants.expoConfig.extra.API_TIMEOUT);

// Or use the environment.ts utility functions
import { getUserManagerApiUrl, getApiTimeout } from './config/environment';

const apiUrl = getUserManagerApiUrl(); // Returns combined base URL and path
const timeout = getApiTimeout();
```

### Adding New Environment Variables

1. Add the new variable to all environment files (`.env`, `.env.development`, `.env.test`, `.env.production`, `.env.example`)
2. Add the new variable to the `extra` section in `app.config.js`
3. Update the `Environment` interface in `config/environment.ts` if needed
4. Add getter functions in `config/environment.ts` if needed

## Docker and EAS Build

- Docker builds use the environment file specified by the `APP_ENV` build argument (e.g., `docker build --build-arg APP_ENV=production .`)
- EAS builds use the environment file specified in the `eas.json` configuration
