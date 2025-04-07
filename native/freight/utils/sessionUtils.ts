import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import {Platform} from 'react-native'

// Definējam storage interface, lai nodrošinātu vienotu API
interface Storage {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
}

// Web platformas storage implementācija
const webStorage: Storage = {
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

// AsyncStorage implementācija (fallback, ja SecureStore nav pieejams)
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

// Izvēlamies storage implementāciju atkarībā no platformas
const getStorage = (): Storage => {
  if (Platform.OS === 'web') {
    return webStorage;
  }
  
  // Mobilajām platformām mēģinām izmantot SecureStore, bet ar fallback uz AsyncStorage
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

// Sesijas datu tips
interface SessionData {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
  user: any;
}

// Saglabā sesijas datus
export const saveSession = async (accessToken: string, expiresIn: number, user: any) => {
  try {
    if (!accessToken) {
      throw new Error("AccessToken ir tukšs vai undefined.");
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
    console.error("Kļūda sesijas saglabāšanā:", error);
    // Don't throw error to prevent app crash in production
    if (__DEV__) {
      throw error;
    }
  }
};

// Ielādē sesijas datus
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
    
    // Pārbaudam, vai tokens nav beidzies
    if (session.expiresAt && session.expiresAt < Date.now()) {
      console.warn("Session token has expired");
      // Notīrām sesiju, ja tokens ir beidzies
      await clearSession();
      return {
        accessToken: null,
        user: null,
      };
    }
    
    return {
      accessToken: session.accessToken,
      user: session.user,
      expiresAt: session.expiresAt,
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

// Notīra sesijas datus
export const clearSession = async () => {
  try {
    const storage = getStorage();
    await storage.deleteItemAsync("user_session");
  } catch (error) {
    console.error("Kļūda sesijas dzēšanā:", error);
    // Don't throw error to prevent app crash
  }
};

// Pārbauda, vai sesija ir aktīva
export const isSessionActive = async (): Promise<boolean> => {
  try {
    const { accessToken, expiresAt } = await loadSession();
    return !!accessToken && (expiresAt ? expiresAt > Date.now() : true);
  } catch (error) {
    console.error("Kļūda sesijas pārbaudē:", error);
    return false;
  }
};
