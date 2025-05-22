import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import {Platform} from 'react-native'
import Constants from 'expo-constants'

// Import secure-ls library (only for web platform)
let SecureLS: any = null;
if (Platform.OS === 'web') {
  // Dynamically import secure-ls, as it's only a web library
  try {
    SecureLS = require('secure-ls');
  } catch (error) {
    console.error('Failed to load secure-ls:', error);
  }
}

// Define storage interface to ensure a unified API
interface Storage {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
}

// Get encryption key from environment variables
const getEncryptionKey = (): string => {
  const defaultKey = 'default-encryption-key';
  return Constants.expoConfig?.extra?.ENCRYPTION_KEY || defaultKey;
};

// Web platform storage implementation with encryption
const webStorage: Storage = {
  setItemAsync: async (key: string, value: string) => {
    try {
      if (SecureLS) {
        // Initialize SecureLS with configuration
        const secureLS = new SecureLS({
          encodingType: 'aes',
          isCompression: false,
          encryptionSecret: getEncryptionKey()
        });
        
        // Save data
        secureLS.set(key, value);
      } else {
        // Fallback to regular localStorage if secure-ls is not available
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error saving to encrypted localStorage:', error);
      // Try fallback to regular localStorage
      try {
        localStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
        throw error;
      }
    }
  },
  getItemAsync: async (key: string) => {
    try {
      if (SecureLS) {
        // Initialize SecureLS with configuration
        const secureLS = new SecureLS({
          encodingType: 'aes',
          isCompression: false,
          encryptionSecret: getEncryptionKey()
        });
        
        // Try to get data
        const value = secureLS.get(key);
        return value !== undefined ? value : null;
      } else {
        // Fallback to regular localStorage if secure-ls is not available
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error reading from encrypted localStorage:', error);
      // Try fallback to regular localStorage
      try {
        return localStorage.getItem(key);
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
        // If decryption fails, return null and clear potentially corrupted data
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore error if we can't clear localStorage
        }
        return null;
      }
    }
  },
  deleteItemAsync: async (key: string) => {
    try {
      if (SecureLS) {
        // Initialize SecureLS with configuration
        const secureLS = new SecureLS({
          encodingType: 'aes',
          isCompression: false,
          encryptionSecret: getEncryptionKey()
        });
        
        // Delete data
        secureLS.remove(key);
      } else {
        // Fallback to regular localStorage if secure-ls is not available
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      // Try fallback to regular localStorage
      try {
        localStorage.removeItem(key);
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
        throw error;
      }
    }
  }
};

// AsyncStorage implementation (fallback if SecureStore is not available)
const asyncStorage: Storage = {
  setItemAsync: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      throw error;
    }
  },
  getItemAsync: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      throw error;
    }
  },
  deleteItemAsync: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
      throw error;
    }
  }
};

// Choose storage implementation depending on platform
const getStorage = (): Storage => {
  if (Platform.OS === 'web') {
    return webStorage;
  }
  
  // For mobile platforms, try to use SecureStore with fallback to AsyncStorage
  return {
    setItemAsync: async (key: string, value: string) => {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn('SecureStore failed, falling back to AsyncStorage:', error);
        await asyncStorage.setItemAsync(key, value);
      }
    },
    getItemAsync: async (key: string) => {
      try {
        const value = await SecureStore.getItemAsync(key);
        return value;
      } catch (error) {
        console.warn('SecureStore failed, falling back to AsyncStorage:', error);
        return asyncStorage.getItemAsync(key);
      }
    },
    deleteItemAsync: async (key: string) => {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn('SecureStore failed, falling back to AsyncStorage:', error);
        await asyncStorage.deleteItemAsync(key);
      }
    }
  };
};

// Session data type
interface SessionData {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
  user: any;
}

// Save session data
export const saveSession = async (accessToken: string, expiresIn: number, user: any) => {
  try {
    if (!accessToken) {
      throw new Error("AccessToken is empty or undefined.");
    }

    const sessionData: SessionData = {
      accessToken,
      expiresIn: expiresIn || 3600, // Default to 1 hour if not provided
      expiresAt: Date.now() + (expiresIn || 3600) * 1000,
      user: user || null
    };

    const storage = getStorage();
    await storage.setItemAsync("user_session", JSON.stringify(sessionData));
  } catch (error) {
    console.error("Error saving session:", error);
    // Don't throw error to prevent app crash in production
    if (__DEV__) {
      throw error;
    }
  }
};

// Load session data
export const loadSession = async () => {
  try {
    const storage = getStorage();
    const sessionData = await storage.getItemAsync("user_session");
    
    if (!sessionData) {
      return {
        accessToken: null,
        user: null,
      };
    }

    const session: SessionData = JSON.parse(sessionData);
    
    // Check if token has expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      console.warn("Session token has expired");
      // Clear session if token has expired
      await clearSession();
      return {
        accessToken: null,
        user: null,
      };
    } else {
		console.warn("Session expired at: " + new Date(session.expiresAt).toLocaleString() + "");
	}
    
    return {
      accessToken: session.accessToken,
      user: session.user,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error("Error loading session:", error);
    // Return null session instead of throwing to prevent app crash
    return {
      accessToken: null,
      user: null,
    };
  }
};

// Clear session data
export const clearSession = async () => {
  try {
    const storage = getStorage();
    await storage.deleteItemAsync("user_session");
  } catch (error) {
    console.error("Error deleting session:", error);
    // Don't throw error to prevent app crash
  }
};

// Check if session is active
export const isSessionActive = async (): Promise<boolean> => {
  try {
    const { accessToken, expiresAt } = await loadSession();
    return !!accessToken && (expiresAt ? expiresAt > Date.now() : true);
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
};
