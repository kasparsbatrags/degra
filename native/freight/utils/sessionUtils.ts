import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import {Platform} from 'react-native'
import Constants from 'expo-constants'

// Import crypto libraries
let Crypto: any = null;
if (Platform.OS !== 'web') {
  try {
    Crypto = require('expo-crypto');
  } catch (error) {
    console.error('Failed to load expo-crypto:', error);
  }
}

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

// ============================================================================
// OFFLINE AUTHENTICATION FUNCTIONS
// ============================================================================

// Helper function to create password hash
async function getPasswordHash(password: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web: use Web Crypto API
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback: simple hash (not secure, but better than plain text)
      let hash = 0, i, chr;
      for (i = 0; i < password.length; i++) {
        chr = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return hash.toString();
    }
  } else {
    // Mobile: use expo-crypto
    if (Crypto) {
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
    } else {
      // Fallback if expo-crypto is not available
      let hash = 0, i, chr;
      for (i = 0; i < password.length; i++) {
        chr = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return hash.toString();
    }
  }
}

// Save user email and password hash securely for offline authentication
export const saveOfflineCredentials = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const key = `offline_credentials_${email.toLowerCase()}`;
    const passwordHash = await getPasswordHash(password);

    const storage = getStorage();
    await storage.setItemAsync(key, passwordHash);
  } catch (error) {
    console.error("Error saving offline credentials:", error);
    // Don't throw error to prevent app crash in production
    if (__DEV__) {
      throw error;
    }
  }
};

// Verify if entered credentials match locally stored ones
export const verifyOfflineCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    if (!email || !password) {
      return false;
    }

    const key = `offline_credentials_${email.toLowerCase()}`;
    const storage = getStorage();
    const storedHash = await storage.getItemAsync(key);

    if (!storedHash) {
      return false;
    }

    const inputHash = await getPasswordHash(password);
    return storedHash === inputHash;
  } catch (error) {
    console.error("Error verifying offline credentials:", error);
    return false;
  }
};

// Clear offline credentials for specific email
export const clearOfflineCredentials = async (email: string) => {
  try {
    if (!email) {
      return;
    }

    const key = `offline_credentials_${email.toLowerCase()}`;
    const storage = getStorage();
    await storage.deleteItemAsync(key);
  } catch (error) {
    console.error("Error clearing offline credentials:", error);
    // Don't throw error to prevent app crash
  }
};

// Check if offline credentials exist for specific email
export const hasOfflineCredentials = async (email: string): Promise<boolean> => {
  try {
    if (!email) {
      return false;
    }

    const key = `offline_credentials_${email.toLowerCase()}`;
    const storage = getStorage();
    const storedHash = await storage.getItemAsync(key);
    return !!storedHash;
  } catch (error) {
    console.error("Error checking offline credentials:", error);
    return false;
  }
};

// Clear all offline credentials (useful for logout or data cleanup)
export const clearAllOfflineCredentials = async () => {
  try {
    // Note: This is a basic implementation. For a more thorough cleanup,
    // you might want to keep track of all stored credential keys
    console.warn("clearAllOfflineCredentials: Basic implementation - consider keeping track of credential keys for thorough cleanup");
  } catch (error) {
    console.error("Error clearing all offline credentials:", error);
  }
};

// ============================================================================
// PERSISTENT OFFLINE SESSION FUNCTIONS
// ============================================================================

// Persistent offline session data type
interface PersistentOfflineSession {
  email: string;
  user: any;
  createdAt: number;
  lastAccessedAt: number;
  isPersistent: boolean;
}

// Save persistent offline session (never expires)
export const savePersistentOfflineSession = async (user: any) => {
  try {
    if (!user || !user.email) {
      throw new Error("User data with email is required for persistent offline session");
    }

    const persistentSession: PersistentOfflineSession = {
      email: user.email,
      user,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      isPersistent: true
    };

    const storage = getStorage();
    await storage.setItemAsync("persistent_offline_session", JSON.stringify(persistentSession));
    
    console.log("Persistent offline session saved for:", user.email);
  } catch (error) {
    console.error("Error saving persistent offline session:", error);
    if (__DEV__) {
      throw error;
    }
  }
};

// Load persistent offline session
export const loadPersistentOfflineSession = async () => {
  try {
    const storage = getStorage();
    const sessionData = await storage.getItemAsync("persistent_offline_session");
    
    if (!sessionData) {
      return {
        accessToken: null,
        user: null,
        isPersistent: false
      };
    }

    const session: PersistentOfflineSession = JSON.parse(sessionData);
    
    // Update last accessed time
    session.lastAccessedAt = Date.now();
    await storage.setItemAsync("persistent_offline_session", JSON.stringify(session));
    
    console.log("Persistent offline session loaded for:", session.email);
    
    return {
      accessToken: "persistent-offline-token",
      user: session.user,
      isPersistent: true,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt
    };
  } catch (error) {
    console.error("Error loading persistent offline session:", error);
    return {
      accessToken: null,
      user: null,
      isPersistent: false
    };
  }
};

// Clear persistent offline session
export const clearPersistentOfflineSession = async () => {
  try {
    const storage = getStorage();
    await storage.deleteItemAsync("persistent_offline_session");
    console.log("Persistent offline session cleared");
  } catch (error) {
    console.error("Error clearing persistent offline session:", error);
  }
};

// Check if persistent offline session exists
export const hasPersistentOfflineSession = async (): Promise<boolean> => {
  try {
    const storage = getStorage();
    const sessionData = await storage.getItemAsync("persistent_offline_session");
    return !!sessionData;
  } catch (error) {
    console.error("Error checking persistent offline session:", error);
    return false;
  }
};

// Enhanced session loading that handles both regular and persistent sessions
export const loadSessionEnhanced = async () => {
  try {
    // First try to load regular session
    const regularSession = await loadSession();
    
    if (regularSession.accessToken) {
      return {
        ...regularSession,
        isPersistent: false,
        sessionType: 'regular'
      };
    }
    
    // If no regular session, try persistent offline session
    const persistentSession = await loadPersistentOfflineSession();
    
    if (persistentSession.accessToken) {
      return {
        ...persistentSession,
        sessionType: 'persistent-offline'
      };
    }
    
    // No session found
    return {
      accessToken: null,
      user: null,
      isPersistent: false,
      sessionType: 'none'
    };
  } catch (error) {
    console.error("Error loading enhanced session:", error);
    return {
      accessToken: null,
      user: null,
      isPersistent: false,
      sessionType: 'error'
    };
  }
};

// Enhanced session clearing that clears both regular and persistent sessions
export const clearAllSessions = async () => {
  try {
    await clearSession();
    await clearPersistentOfflineSession();
    console.log("All sessions cleared");
  } catch (error) {
    console.error("Error clearing all sessions:", error);
  }
};
