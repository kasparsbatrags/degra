// This script starts the Expo development server
const { execSync } = require('child_process');

try {
  console.log('Starting Expo development server...');
  
  // Run the Expo start command
  execSync('npx expo start', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_NO_DOCTOR: '1', // Skip doctor checks
    }
  });
  
} catch (error) {
  console.error('Error starting Expo server:', error.message);
  process.exit(1);
}
