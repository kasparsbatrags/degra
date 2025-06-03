import FontAwesome from '@expo/vector-icons/FontAwesome'
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native'
import {QueryClientProvider} from '@tanstack/react-query'
import {useFonts} from 'expo-font'
import {Stack} from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import {useEffect} from 'react'
import {useColorScheme, View} from 'react-native'
import queryClient from '../config/queryClient'
import {AuthProvider} from '../context/AuthContext'
import {OfflineProvider} from '../context/OfflineContext'
import {setupSyncListener} from '../services/syncService'
import {setupTruckRouteSyncListener} from '../services/truckRouteSyncService'
import {initializeOfflineService} from '../services/offlineService'
import EnvironmentIndicator from '../components/EnvironmentIndicator'
import OfflineIndicator from '../components/OfflineIndicator'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Uzstāda sinhronizācijas klausītājus un offline servisu, kad komponente tiek montēta
  useEffect(() => {
    // Inicializē offline servisu
    initializeOfflineService();
    
    // Uzstāda vispārīgo sinhronizācijas klausītāju
    const unsubscribeSync = setupSyncListener();
    
    // Uzstāda braucienu sinhronizācijas klausītāju
    const unsubscribeTruckRouteSync = setupTruckRouteSyncListener();
    
    // Notīra klausītājus, kad komponente tiek nomontēta
    return () => {
      if (unsubscribeSync) {
        unsubscribeSync();
      }
      if (unsubscribeTruckRouteSync) {
        unsubscribeTruckRouteSync();
      }
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <OfflineProvider>
          <AuthProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
              <EnvironmentIndicator />
              <OfflineIndicator />
            </View>
          </AuthProvider>
        </OfflineProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
