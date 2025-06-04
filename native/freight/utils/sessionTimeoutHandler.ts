import { isSessionActive, loadSession } from './sessionUtils';
import { redirectToLogin, isRedirectingToLogin } from '@/config/axios';
import { Platform, AppState, AppStateStatus } from 'react-native';

// Minimum and maximum interval (ms)
const MIN_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECK_INTERVAL = 300000; // 5 minutes
const INTERVAL_RATIO = 0.1; // 10% of token validity period

let appStateSubscription: any = null;


/**
 * Handles application state changes (only for mobile platforms)
 */
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  // If application returns to foreground (active), perform immediate session check
  if (nextAppState === 'active') {
    const { SessionManager } = require('./SessionManager');
    await SessionManager.getInstance().checkSessionStatus();
  }
};

/**
 * Starts session timeout check
 */
export const startSessionTimeoutCheck = async () => {
  // Centralizēta periodiskā pārbaude ar SessionManager
  const { SessionManager } = require('./SessionManager');
  SessionManager.getInstance().startPeriodicCheck(30000);

  // Add AppState listener for mobile platforms
  if (Platform.OS !== 'web') {
    if (appStateSubscription) {
      appStateSubscription.remove();
    }
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopSessionTimeoutCheck);
  }
};

/**
 * Stops session timeout check
 */
export const stopSessionTimeoutCheck = () => {
  // Remove AppState listener (mobile platforms only)
  if (Platform.OS !== 'web' && appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  // Remove event listener (web only)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', stopSessionTimeoutCheck);
  }
  // Apturēt centralizēto periodisko pārbaudi
  const { SessionManager } = require('./SessionManager');
  SessionManager.getInstance().stopPeriodicCheck();
};

/**
 * Returns remaining time until session expiration (ms)
 */
export const getSessionRemainingTime = async (): Promise<number> => {
  try {
    const { expiresAt } = await loadSession();
    
    if (!expiresAt) {
      return 0; // If no expiresAt, session is considered expired
    }
    
    const remainingTime = expiresAt - Date.now();
    return Math.max(0, remainingTime); // Negative time means session has expired
  } catch (error) {
    console.error("Error getting remaining session time:", error);
    return 0; // In case of error, consider session expired
  }
};
