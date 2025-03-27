# Freight Tracking App - Expo Instructions

This document provides instructions on how to run and use the Freight Tracking app using Expo.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app installed on your mobile device

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install missing dependencies:
   ```bash
   npm install @react-native-community/netinfo @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister uuid --force
   ```

3. Start the Expo development server:
   ```bash
   node start-expo.js
   ```

4. Once the server starts, you'll see a QR code in the terminal. Scan this QR code with your mobile device:
   - **Android**: Use the Expo Go app to scan the QR code
   - **iOS**: Use the Camera app to scan the QR code, which will open the Expo Go app

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed:
   ```bash
   npm install --force
   ```

2. Clear the npm cache:
   ```bash
   npm cache clean --force
   ```

3. Restart the Expo server:
   ```bash
   node start-expo.js
   ```

## Building for Production

To build the app for production, you can use EAS (Expo Application Services):

1. Configure EAS:
   ```bash
   npx eas build:configure
   ```

2. Build for Android:
   ```bash
   npx eas build -p android --profile preview
   ```

Note: Building for production requires an Expo account and may require additional setup.
