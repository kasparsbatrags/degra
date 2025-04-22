// This script starts the Expo development server with preview profile (using test environment)
const { execSync } = require('child_process');

try {
  console.log('Starting Expo development server with preview profile (test environment)...');
  
  execSync('npx expo start --dev-client', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      APP_ENV: 'test',
      EXPO_NO_DOCTOR: '1'
    }
  });
  
} catch (error) {
  console.error('Error starting Expo server:', error.message);
  process.exit(1);
}
