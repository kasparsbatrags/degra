import React, {createContext, useContext, useEffect, useState} from 'react'
import {createUser, getCurrentUser, signIn, signOut as apiSignOut} from '../lib/api'
import { saveOfflineCredentials, verifyOfflineCredentials } from '../utils/offlineAuth'
import NetInfo from '@react-native-community/netinfo';
import type {UserInfo, UserRegistrationData} from '@/types/auth'
import {
  clearSession, 
  saveSession, 
  isSessionActive,
  savePersistentOfflineSession,
  loadSessionEnhanced,
  clearAllSessions
} from '@/utils/sessionUtils'
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
        // Try enhanced session loading first (handles both regular and persistent sessions)
        const sessionData = await loadSessionEnhanced();
        
        if (sessionData.accessToken && sessionData.user) {
          if (mountedRef.current) {
            setUser(sessionData.user);
            setIsAuthenticated(true);
            
            console.log(`Initialized with ${sessionData.sessionType} session for:`, sessionData.user.email);
            
            // Start session timeout check when user is authenticated
            // For persistent offline sessions, we still want activity tracking
            startSessionTimeoutCheck();
          }
        } else {
          // Fallback to API call if no local session
          try {
            const currentUser = await getCurrentUser();
            if (mountedRef.current && currentUser) {
              setUser(currentUser);
              setIsAuthenticated(true);
              startSessionTimeoutCheck();
            }
          } catch (apiError) {
            console.log("No valid API session found:", apiError);
          }
        }
        
        if (mountedRef.current) {
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
    console.log('🔐 Starting sign in process for:', email);
    
    // Pārbauda tīkla statusu
    const netState = await NetInfo.fetch();
    console.log('🌐 Network state:', netState.isConnected ? 'ONLINE' : 'OFFLINE');
    
    if (netState.isConnected) {
      // Online login
      try {
        console.log('📡 Attempting online login...');
        const { accessToken, expiresIn, user } = await signIn(email, password);
        console.log('✅ Online login successful, saving session...');
        
        await saveSession(accessToken, expiresIn, user);
        console.log('💾 Session saved successfully');
        
        // Saglabā offline akreditācijas datus
        await saveOfflineCredentials(email, password);
        console.log('🔑 Offline credentials saved');
        
        if (mountedRef.current) {
          console.log('🎯 Setting user state and authentication...');
          setUser(user);
          setIsAuthenticated(true);
          // Start session timeout check after login
          startSessionTimeoutCheck();
          console.log('✨ Login process completed successfully');
        } else {
          console.warn('⚠️ Component unmounted during login');
        }
      } catch (error) {
        console.error('❌ Online sign in error:', error);
        throw error;
      }
    } else {
      // Offline login
      try {
        console.log('📴 Attempting offline login...');
        const isValid = await verifyOfflineCredentials(email, password);
        if (!isValid) {
          throw new Error("Nepareizs e-pasts vai parole (offline režīms)");
        }
        
        console.log('✅ Offline credentials verified');
        
        // Create user object for offline session
        const user = { id: email, name: email, email, firstName: "", lastName: "" };
        
        // Save persistent offline session (never expires)
        await savePersistentOfflineSession(user);
        
        console.log('💾 Created persistent offline session for:', email);
        
        if (mountedRef.current) {
          console.log('🎯 Setting offline user state and authentication...');
          setUser(user);
          setIsAuthenticated(true);
          startSessionTimeoutCheck();
          console.log('✨ Offline login process completed successfully');
        } else {
          console.warn('⚠️ Component unmounted during offline login');
        }
      } catch (error) {
        console.error('❌ Offline sign in error:', error);
        throw error;
      }
    }
  };

  const handleSignOut = async () => {
    try {
      // Try to sign out from API (might fail if offline)
      try {
        await apiSignOut();
      } catch (apiError) {
        console.warn("API sign out failed (possibly offline):", apiError);
      }
      
      // Clear all sessions (both regular and persistent offline)
      await clearAllSessions();
      
      // Stop session timeout check after logout
      stopSessionTimeoutCheck();
      
      console.log("All sessions cleared on logout");
      
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
    let interval: NodeJS.Timeout;
    
    const checkSessionStatus = async () => {
      try {
        // Pārbaudīt, vai ierīce ir online režīmā
        const online = await isConnected();
        
        // Pārbaudīt sesijas statusu tikai tad, ja ierīce ir online režīmā
        if (online && isAuthenticated) {
          const sessionActive = await isSessionActive();
          if (!sessionActive) {
            console.log('Session expired, logging out user');
            // Ja sesija nav aktīva, bet lietotājs joprojām ir autentificēts kontekstā
            // Atjaunināt konteksta stāvokli
            resetAuthState();
          }
        }
      } catch (error) {
        console.error("Error checking session status:", error);
      }
    };
    
    // Sākt sesijas pārbaudi tikai ja lietotājs ir autentificēts
    if (isAuthenticated && !loading) {
      // Pārbaudīt sesijas statusu periodiski
      interval = setInterval(checkSessionStatus, 30000); // Pārbaudīt ik pēc 30 sekundēm
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, loading]); // Pievienots loading dependency

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
