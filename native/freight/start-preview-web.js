// This script starts the Expo web development server with preview profile (using test environment)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Starting Expo web development server with preview profile (test environment)...');
  
  // Path to the app.html file
  const appHtmlPath = path.join(__dirname, 'app.html');
  
  // Check if app.html already exists
  let htmlContent = '';
  if (fs.existsSync(appHtmlPath)) {
    // Read the existing file
    htmlContent = fs.readFileSync(appHtmlPath, 'utf8');
    console.log('Found existing app.html file');
    
    // Check if the APP_ENV script is already in the file
    if (!htmlContent.includes('window.APP_ENV')) {
      // Add the APP_ENV script to the head section
      htmlContent = htmlContent.replace(
        /<head>([\s\S]*?)<\/head>/,
        '<head>$1\n  <script>\n    // Set APP_ENV in the window object so it\'s accessible to the application\n    window.APP_ENV = \'test\';\n    console.log(\'Set window.APP_ENV to:\', window.APP_ENV);\n  </script>\n</head>'
      );
      
      // Write the modified file
      fs.writeFileSync(appHtmlPath, htmlContent);
      console.log('Modified existing app.html to set APP_ENV to "test"');
    } else {
      console.log('APP_ENV script already exists in app.html');
    }
  } else {
    // Create a new app.html file
    htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>Krava</title>
  <script>
    // Set APP_ENV in the window object so it's accessible to the application
    window.APP_ENV = 'test';
    console.log('Set window.APP_ENV to:', window.APP_ENV);
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
`;
    
    // Write the HTML file
    fs.writeFileSync(appHtmlPath, htmlContent);
    console.log('Created new app.html with APP_ENV set to "test"');
  }
  
  // Start Expo with the custom HTML template
  execSync('npx expo start --web', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      APP_ENV: 'test',
      EXPO_NO_DOCTOR: '1'
    }
  });
  
} catch (error) {
  console.error('Error starting Expo web server:', error.message);
  process.exit(1);
}
