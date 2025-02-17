import React, {createContext, useContext, useEffect, useState} from 'react'
import {createUser, getCurrentUser, signIn, signOut as apiSignOut} from '../lib/api'
import type {UserInfo, UserRegistrationData} from '../types/auth'
import {clearSession, saveSession} from '../utils/sessionUtils'

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (data: UserRegistrationData) => Promise<void>;
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
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { accessToken, refreshToken, expiresIn, user } = await signIn(email, password);
      await saveSession(accessToken, expiresIn, user);
      if (mountedRef.current) {
        setUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await apiSignOut();
      await clearSession();
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
      // Automātiski piesakāmies pēc reģistrācijas
      if (mountedRef.current) {
        await handleSignIn(data.email, data.password);
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
