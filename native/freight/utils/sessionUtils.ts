import * as SecureStore from 'expo-secure-store'
import {Platform} from 'react-native'

const webStorage = {
  setItemAsync: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  },
  getItemAsync: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      throw error;
    }
  },
  deleteItemAsync: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      throw error;
    }
  }
};

// Izvēlamies storage implementāciju atkarībā no platformas
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export const saveSession = async (accessToken: string, expiresIn: number, user: any) => {
  try {
    if (!accessToken) {
      throw new Error("AccessToken ir tukšs vai undefined.");
    }

    if (!expiresIn) {
      throw new Error("ExpiresIn ir tukšs vai undefined.");
    }

    const sessionData = {
      accessToken,
      expiresIn,
      expiresAt: Date.now() + expiresIn * 1000,
      user: user || null
    };

    try {
      await storage.setItemAsync("user_session", JSON.stringify(sessionData));
    } catch (storageError) {
      console.warn("Storage not ready or error:", storageError);
      // Don't throw error if storage is not ready, just log warning
      return;
    }
  } catch (error) {
    console.error("Kļūda sesijas saglabāšanā:", error);
    throw error;
  }
};

export const loadSession = async () => {
  try {
    let sessionData;
    try {
      sessionData = await storage.getItemAsync("user_session");
    } catch (storageError) {
      console.warn("Storage not ready or error:", storageError);
      return {
        accessToken: null,
        user: null,
      };
    }
    
    if (!sessionData) {
      return {
        accessToken: null,
        user: null,
      };
    }

    const session = JSON.parse(sessionData);
    
    return {
      accessToken: session.accessToken,
      user: session.user,
    };
  } catch (error) {
    console.error("Kļūda sesijas ielādēšanā:", error);
    // Return null session instead of throwing to prevent app crash
    return {
      accessToken: null,
      user: null,
    };
  }
};

export const clearSession = async () => {
  try {
    try {
      await storage.deleteItemAsync("user_session");
    } catch (storageError) {
      console.warn("Storage not ready or error:", storageError);
      // Don't throw error if storage is not ready, just log warning
      return;
    }
  } catch (error) {
    console.error("Kļūda sesijas dzēšanā:", error);
    // Don't throw error to prevent app crash
    return;
  }
};
