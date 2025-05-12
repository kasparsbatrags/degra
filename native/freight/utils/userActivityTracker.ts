import axios from '../config/axios';
import { API_ENDPOINTS, getUserManagerApiUrl } from '@/config/environment';
import { loadSession, saveSession } from './sessionUtils';
import { Platform } from 'react-native';

// Minimum and maximum interval (ms)
const MIN_REFRESH_INTERVAL = 600000; // 10 minutes
const MAX_REFRESH_INTERVAL = 1800000; // 30 minutes
const REFRESH_RATIO = 0.7; // Refresh when 70% of the token validity period has passed

// Last session refresh timestamp
let lastRefreshTime = Date.now();

// Flag to track if a refresh is already in progress
let isRefreshInProgress = false;

// Flag to track if there was a recent refresh error
let hasRefreshError = false;
let lastRefreshErrorTime = 0;
const ERROR_COOLDOWN = 300000; // 5 minutes cooldown after an error

/**
 * Calculates the optimal refresh interval based on token expiration time
 * @returns Optimal refresh interval in milliseconds
 */
const calculateOptimalRefreshInterval = async (): Promise<number> => {
  try {
    // Get session data
    const { expiresAt } = await loadSession();
    
    if (!expiresAt) {
      return MIN_REFRESH_INTERVAL; // If no expiresAt, use minimum interval
    }
    
    // Calculate remaining time until token expiration (ms)
    const remainingTime = expiresAt - Date.now();
    
    // If token has already expired or will expire soon, use minimum interval
    if (remainingTime <= 0 || remainingTime < MIN_REFRESH_INTERVAL * 2) {
      return MIN_REFRESH_INTERVAL;
    }
    
    // Calculate interval as a percentage of remaining time
    const calculatedInterval = Math.floor(remainingTime * REFRESH_RATIO);
    
    // Ensure interval is between minimum and maximum value
    return Math.max(MIN_REFRESH_INTERVAL, Math.min(calculatedInterval, MAX_REFRESH_INTERVAL));
  } catch (error) {
    console.error('Error calculating optimal refresh interval:', error);
    return MIN_REFRESH_INTERVAL; // In case of error, use minimum interval
  }
};

/**
 * Refreshes the session token using the existing refresh token mechanism
 * @returns True if refresh was successful, false otherwise
 */
export const refreshSessionToken = async (): Promise<boolean> => {
  // If a refresh is already in progress, don't start another one
  if (isRefreshInProgress) {
    console.log("Session refresh already in progress, skipping");
    return false;
  }
  
  // If there was a recent refresh error, don't try again too soon
  if (hasRefreshError) {
    const now = Date.now();
    if (now - lastRefreshErrorTime < ERROR_COOLDOWN) {
      console.log("Recent refresh error, waiting for cooldown period");
      return false;
    }
    // Reset error flag after cooldown period
    hasRefreshError = false;
  }
  
  // Set flag that refresh is in progress
  isRefreshInProgress = true;
  
  try {
    const { accessToken, user } = await loadSession();
    
    if (!accessToken) {
      isRefreshInProgress = false;
      return false;
    }
    
    // Use existing refresh token mechanism
    const userManagerUrl = getUserManagerApiUrl();
    const response = await axios.post(
      `${userManagerUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    if (response.data && response.data.access_token) {
      const newToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      
      // Save new token
      await saveSession(newToken, expiresIn, user);
      isRefreshInProgress = false;
      return true;
    }
    
    isRefreshInProgress = false;
    return false;
  } catch (error) {
    console.error("Error refreshing session token:", error);
    isRefreshInProgress = false;
    hasRefreshError = true;
    lastRefreshErrorTime = Date.now();
    return false;
  }
};

/**
 * Activity levels for different types of user interactions
 */
export const ACTIVITY_LEVELS = {
  LOW: 'low',       // Minimal activity (e.g., mouse movement)
  MEDIUM: 'medium', // Medium activity (e.g., form field input)
  HIGH: 'high'      // High activity (e.g., form submission)
};

/**
 * Coefficients for different activity levels
 * Lower values mean more frequent refresh attempts
 */
const ACTIVITY_LEVEL_RATIOS = {
  [ACTIVITY_LEVELS.LOW]: 1.0,    // 100% of optimal interval (no change)
  [ACTIVITY_LEVELS.MEDIUM]: 0.9, // 90% of optimal interval
  [ACTIVITY_LEVELS.HIGH]: 0.8    // 80% of optimal interval
};

// Debounce mechanism to limit activity processing
let activityTimeout: NodeJS.Timeout | null = null;
const ACTIVITY_DEBOUNCE = 2000; // 2 seconds

/**
 * Handles user activity and refreshes session token if needed
 * @param activityLevel The level of user activity (low, medium, high)
 */
export const handleUserActivity = async (activityLevel = ACTIVITY_LEVELS.MEDIUM) => {
  // Debounce activity handling to prevent excessive processing
  if (activityTimeout) {
    clearTimeout(activityTimeout);
  }
  
  activityTimeout = setTimeout(async () => {
    const now = Date.now();
    
    try {
      // If a refresh is already in progress or there was a recent error, skip
      if (isRefreshInProgress || (hasRefreshError && now - lastRefreshErrorTime < ERROR_COOLDOWN)) {
        return;
      }
      
      // Calculate optimal refresh interval
      let optimalInterval = await calculateOptimalRefreshInterval();
      
      // Adjust interval based on activity level
      optimalInterval *= ACTIVITY_LEVEL_RATIOS[activityLevel];
      
      // Check if enough time has passed since last refresh
      if (now - lastRefreshTime > optimalInterval) {
        const refreshed = await refreshSessionToken();
        if (refreshed) {
          lastRefreshTime = now;
          console.log(`Session token refreshed due to ${activityLevel} user activity`);
        }
      }
    } catch (error) {
      console.error("Error handling user activity:", error);
    }
  }, ACTIVITY_DEBOUNCE);
};

// Event handler functions (defined outside to allow proper removal)
const eventHandlers: { [key: string]: (e: any) => void } = {};

/**
 * Initializes user activity tracking
 * @returns Cleanup function to remove event listeners
 */
export const initUserActivityTracking = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // For web platform, add event listeners with throttling
    const events = [
      { name: 'mousedown', level: ACTIVITY_LEVELS.MEDIUM },
      { name: 'keydown', level: ACTIVITY_LEVELS.MEDIUM },
      { name: 'touchstart', level: ACTIVITY_LEVELS.MEDIUM },
      // Removed mousemove and scroll as they're too frequent and can cause excessive refreshes
    ];
    
    // Create event handlers with proper throttling
    events.forEach(event => {
      // Create a handler for this event type
      eventHandlers[event.name] = () => handleUserActivity(event.level);
      
      // Add the event listener
      window.addEventListener(event.name, eventHandlers[event.name]);
    });
    
    // Add listener for form input fields (higher activity level)
    eventHandlers['input'] = () => handleUserActivity(ACTIVITY_LEVELS.HIGH);
    document.addEventListener('input', eventHandlers['input']);
    
    // Add listener for form submissions (highest activity level)
    eventHandlers['submit'] = () => handleUserActivity(ACTIVITY_LEVELS.HIGH);
    document.addEventListener('submit', eventHandlers['submit']);
    
    return () => {
      // Remove event listeners when component is unmounted
      events.forEach(event => {
        if (eventHandlers[event.name]) {
          window.removeEventListener(event.name, eventHandlers[event.name]);
        }
      });
      
      if (eventHandlers['input']) {
        document.removeEventListener('input', eventHandlers['input']);
      }
      
      if (eventHandlers['submit']) {
        document.removeEventListener('submit', eventHandlers['submit']);
      }
      
      // Clear any pending activity timeout
      if (activityTimeout) {
        clearTimeout(activityTimeout);
        activityTimeout = null;
      }
    };
  } else {
    // For mobile platforms, activity tracking will be added at component level
    return () => {
      // Clear any pending activity timeout
      if (activityTimeout) {
        clearTimeout(activityTimeout);
        activityTimeout = null;
      }
    };
  }
};
