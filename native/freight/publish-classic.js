// This script helps publish the project to Expo using the classic workflow
const { execSync } = require('child_process');

try {
  console.log('Publishing to Expo using classic workflow...');
  
  // Run the classic publish command
  execSync('npx expo publish --non-interactive', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_LEGACY_IMPORT: '1', // Use legacy import
      EXPO_NO_DOCTOR: '1', // Skip doctor checks
      EXPO_USE_DEV_SERVER: '0' // Don't use dev server
    }
  });
  
  console.log('Project published successfully!');
} catch (error) {
  console.error('Error publishing project:', error.message);
  process.exit(1);
}
