const express = require('express')
const app = require('./src/app')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const { baseWebhookURL, useFrontend } = require('./src/config')
require('dotenv').config()

// Start the server
const port = process.env.API_PORT || 5000

// Check if BASE_WEBHOOK_URL environment variable is available
if (!baseWebhookURL) {
  console.error('BASE_WEBHOOK_URL environment variable is not available. Exiting...')
  process.exit(1) // Terminate the application with an error code
}

// Function to filter and write React environment variables
const writeReactEnvFile = () => {
  console.log("Extracting React environment variables...");

  // Filter out only variables that start with REACT_APP_
  const reactEnvVars = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .map(key => `${key}=${process.env[key]}`)
    .join('\n');

  if (!reactEnvVars) {
    console.warn("No REACT_APP_* environment variables found.");
    return;
  }

  // Write the environment variables to frontend/.env
  const envFilePath = path.join(__dirname, 'frontend', '.env');
  fs.writeFileSync(envFilePath, reactEnvVars);
  console.log(`Environment variables written to ${envFilePath}`);
};

if (useFrontend) {

  const frontendPath = path.join(__dirname, 'frontend');

  if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
    console.log("Installing frontend dependencies...");
    try {
      execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });
      console.log("Frontend dependencies installed.");
    } catch (error) {
      console.error("Failed to install frontend dependencies:", error);
      process.exit(1);
    }
  } else {
    console.log("Frontend dependencies already installed. Skipping `npm install`.");
  }

  writeReactEnvFile();

  console.log("Building frontend for production...");

  try {
    execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
    console.log("Frontend built successfully.");
  } catch (error) {
    console.error("Failed to build frontend:", error);
    process.exit(1);
  }

  // Serve static files from the React app
  const buildPath = path.join(frontendPath, 'build');
  app.use(express.static(buildPath))
  // Handle any requests that don't match the ones above
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
