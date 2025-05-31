import React, {createContext, useContext, useEffect, useState} from 'react'
import {createUser, getCurrentUser, signIn, signOut as apiSignOut} from '../lib/api'
import { saveOfflineCredentials, verifyOfflineCredentials } from '../utils/offlineAuth'
import NetInfo from '@react-native-community/netinfo';
import type {UserInfo, UserRegistrationData} from '@/types/auth'
import {clearSession, saveSession, isSessionActive} from '@/utils/sessionUtils'
import {startSessionTimeoutCheck, stopSessionTimeoutCheck} from '@/utils/sessionTimeoutHandler'
import {initUserActivityTracking} from '@/utils/userActivityTracker'
import {isConnected} from '@/utils/networkUtils'

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (data: UserRegistrationData) => Promise<void>;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = React.useRef(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mountedRef.current) {
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            
            // Start session timeout check when user is authenticated
            startSessionTimeoutCheck();
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      
      // Stop session timeout check when component is unmounted
      stopSessionTimeoutCheck();
    };
  }, []);
  
  // Initialize user activity tracking
  useEffect(() => {
    // Only initialize activity tracking when user is authenticated
    if (isAuthenticated) {
      // Initialize user activity tracking
      const cleanupActivityTracking = initUserActivityTracking();
      
      return () => {
        // Remove activity tracking when component is unmounted
        cleanupActivityTracking();
      };
    }
  }, [isAuthenticated]);

  const handleSignIn = async (email: string, password: string) => {
    // Pārbauda tīkla statusu
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      // Online login
      try {
        const { accessToken, expiresIn, user } = await signIn(email, password);
        await saveSession(accessToken, expiresIn, user);
        // Saglabā offline akreditācijas datus
        await saveOfflineCredentials(email, password);
        if (mountedRef.current) {
          setUser(user);
          setIsAuthenticated(true);
          // Start session timeout check after login
          startSessionTimeoutCheck();
        }
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    } else {
      // Offline login
      try {
        const isValid = await verifyOfflineCredentials(email, password);
        if (!isValid) {
          throw new Error("Nepareizs e-pasts vai parole (offline režīms)");
        }
        // Izveido lokālu sesiju ar fiktīvu accessToken
        const user = { id: email, name: email, email, firstName: "", lastName: "" };
        await saveSession("offline-access-token", 3600, user);
        if (mountedRef.current) {
          setUser(user);
          setIsAuthenticated(true);
          startSessionTimeoutCheck();
        }
      } catch (error) {
        console.error("Offline sign in error:", error);
        throw error;
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await apiSignOut();
      await clearSession();
      
      // Stop session timeout check after logout
      stopSessionTimeoutCheck();
      
      if (mountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const handleRegister = async (data: UserRegistrationData) => {
    try {
      await createUser(data);
      // Automatically login after registration
      if (mountedRef.current) {
        await handleSignIn(data.email, data.password);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Funkcija, lai atiestatītu autentifikācijas stāvokli
  // Šī funkcija tikai atjaunina AuthContext stāvokli, bet neveic pārvirzīšanu
  // Pārvirzīšanu veic AuthLayout, kad isAuthenticated kļūst false
  const resetAuthState = () => {
    if (mountedRef.current) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Periodiski pārbaudīt sesijas statusu
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        // Pārbaudīt, vai ierīce ir online režīmā
        const online = await isConnected();
        
        // Pārbaudīt sesijas statusu tikai tad, ja ierīce ir online režīmā
        if (online && isAuthenticated) {
          const sessionActive = await isSessionActive();
          if (!sessionActive) {
            // Ja sesija nav aktīva, bet lietotājs joprojām ir autentificēts kontekstā
            // Atjaunināt konteksta stāvokli
            resetAuthState();
          }
        }
      } catch (error) {
        console.error("Error checking session status:", error);
      }
    };
    
    // Pārbaudīt sesijas statusu periodiski
    const interval = setInterval(checkSessionStatus, 30000); // Pārbaudīt ik pēc 30 sekundēm
    
    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        register: handleRegister,
        resetAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
