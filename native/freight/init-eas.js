// This script helps initialize an EAS project
const { execSync } = require('child_process');

try {
  console.log('Initializing EAS project...');
  execSync('npx eas init --non-interactive', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      EAS_NO_VCS: '1', // Skip git checks
      EAS_ACCEPT_PROJECT_CREATION: '1' // Auto-accept project creation
    }
  });
  console.log('EAS project initialized successfully!');
} catch (error) {
  console.error('Error initializing EAS project:', error.message);
  process.exit(1);
}
