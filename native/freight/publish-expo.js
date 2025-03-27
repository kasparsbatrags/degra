// This script helps publish the project to Expo
const { execSync } = require('child_process');

try {
  console.log('Publishing to Expo...');
  
  // First, build the project
  console.log('Building the project...');
  execSync('npx expo export', { stdio: 'inherit' });
  
  console.log('Project built successfully!');
  console.log('Publishing to Expo...');
  
  // Then publish using the classic workflow
  execSync('npx expo publish:web', { stdio: 'inherit' });
  
  console.log('Project published successfully!');
} catch (error) {
  console.error('Error publishing project:', error.message);
  process.exit(1);
}
