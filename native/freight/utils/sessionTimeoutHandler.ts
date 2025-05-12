import { isSessionActive, loadSession } from './sessionUtils';
import { redirectToLogin, isRedirectingToLogin } from '@/config/axios';
import { Platform, AppState, AppStateStatus } from 'react-native';

// Minimum and maximum interval (ms)
const MIN_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_CHECK_INTERVAL = 300000; // 5 minutes
const INTERVAL_RATIO = 0.1; // 10% of token validity period

let sessionCheckInterval: NodeJS.Timeout | null = null;
let appStateSubscription: any = null;

/**
 * Calculates the optimal session check interval based on token validity period
 */
const calculateOptimalInterval = async (): Promise<number> => {
  try {
    // Get session data
    const { expiresAt } = await loadSession();
    
    if (!expiresAt) {
      return MIN_CHECK_INTERVAL; // If no expiresAt, use minimum interval
    }
    
    // Calculate remaining time until token expiration (ms)
    const remainingTime = expiresAt - Date.now();
    
    // If token has already expired or will expire soon, use minimum interval
    if (remainingTime <= 0 || remainingTime < MIN_CHECK_INTERVAL * 2) {
      return MIN_CHECK_INTERVAL;
    }
    
    // Calculate interval as a percentage of remaining time
    const calculatedInterval = Math.floor(remainingTime * INTERVAL_RATIO);
    
    // Ensure interval is between minimum and maximum value
    return Math.max(MIN_CHECK_INTERVAL, Math.min(calculatedInterval, MAX_CHECK_INTERVAL));
  } catch (error) {
    console.error('Error calculating optimal interval:', error);
    return MIN_CHECK_INTERVAL; // In case of error, use minimum interval
  }
};

/**
 * Performs session check
 */
const checkSession = async () => {
  // Check if redirection to login page is already in progress
  if (isRedirectingToLogin) {
    return; // If redirection is already in progress, exit the function
  }
  
  const active = await isSessionActive();
  
  // If session is no longer active, redirect to login page
  if (!active) {
    // Use the shared redirectToLogin function from axios.ts
    redirectToLogin();
    return;
  }
  
  // If session is active, update interval with new optimal value
  restartSessionCheck();
};

/**
 * Restarts session check with new optimal interval
 */
const restartSessionCheck = async () => {
  // Stop existing interval if it exists
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  
  // Calculate new optimal interval
  const interval = await calculateOptimalInterval();
  
  // Create new interval
  sessionCheckInterval = setInterval(checkSession, interval);
};

/**
 * Handles application state changes (only for mobile platforms)
 */
const handleAppStateChange = async (nextAppState: AppStateStatus) => {
  // If application returns to foreground (active), perform immediate session check
  if (nextAppState === 'active') {
    await checkSession();
  }
};

/**
 * Starts session timeout check
 */
export const startSessionTimeoutCheck = async () => {
  // First perform immediate session check
  await checkSession();
  
  // Add AppState listener for mobile platforms
  if (Platform.OS !== 'web') {
    // Remove existing subscription if it exists
    if (appStateSubscription) {
      appStateSubscription.remove();
    }
    
    // Add new subscription
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }
  
  // Add event listener to stop interval when page is closed (web only)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopSessionTimeoutCheck);
  }
};

/**
 * Stops session timeout check
 */
export const stopSessionTimeoutCheck = () => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
  
  // Remove AppState listener (mobile platforms only)
  if (Platform.OS !== 'web' && appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  
  // Remove event listener (web only)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', stopSessionTimeoutCheck);
  }
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
