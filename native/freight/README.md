# Freight Tracking Application

Cross-platform mobile and web application for freight tracking built with React Native and Expo.

## Optimizations

The application has been optimized for cross-platform compatibility and performance across web, iOS, and Android platforms. Key optimizations include:

### Cross-Platform Compatibility

- **Platform-specific utilities**: The `platformUtils.ts` file provides utilities for detecting the current platform and applying platform-specific configurations.
- **Responsive design**: The UI adapts to different screen sizes and orientations.
- **Platform-specific components**: Some components have platform-specific implementations (e.g., `.ios.tsx` and `.android.tsx` files).

### Network and Offline Support

- **Robust offline mode**: The application works offline with data synchronization when connectivity is restored.
- **Connection-aware data fetching**: Network requests are optimized based on connection quality.
- **Optimized API client**: The Axios configuration is optimized for each platform with appropriate error handling.
- **Token refresh mechanism**: JWT tokens are automatically refreshed when expired.

### Performance Optimizations

- **Debounced inputs**: User inputs are debounced to prevent excessive re-renders and API calls.
- **Memoization**: Components and expensive calculations are memoized to prevent unnecessary re-renders.
- **Query caching**: React Query is used for efficient data fetching and caching.
- **Platform-specific caching strategies**: Different caching strategies are applied based on the platform.

### Security Enhancements

- **Secure storage**: Sensitive data is stored securely using platform-specific secure storage mechanisms.
- **Token validation**: JWT tokens are validated and refreshed automatically.
- **Error handling**: Comprehensive error handling prevents security vulnerabilities.

## Project Structure

```
native/freight/
├── app/                  # Expo Router app directory
├── assets/               # Static assets (images, fonts, etc.)
├── components/           # Reusable UI components
├── config/               # Configuration files
├── constants/            # Constants and theme definitions
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── services/             # Service layer (API, storage, etc.)
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **TypeScript**: Type-safe JavaScript
- **React Query**: Data fetching and state management
- **Axios**: HTTP client
- **NativeWind**: Tailwind CSS for React Native
- **Expo Router**: File-based routing for Expo

## Development

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator (for Android development)

### Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Run on specific platform:
   ```
   npm run ios     # Run on iOS simulator
   npm run android # Run on Android emulator
   npm run web     # Run on web browser
   ```

### Building for Production

#### Web
```
npx expo export:web
```

#### iOS/Android
```
eas build --platform ios
eas build --platform android
```

## Best Practices

- Use the platform utilities for platform-specific code
- Leverage the network utilities for optimized data fetching
- Implement proper error handling for all API calls
- Use the debounce hooks for input fields
- Test on all target platforms regularly
