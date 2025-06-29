import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useNetwork } from '../hooks/useNetwork';
import { checkNetworkStatus } from '../services/networkService';
import { initDatabase, checkDatabaseHealth } from '../utils/database';
import { offlineQueue, startOfflineQueueProcessing, stopOfflineQueueProcessing, getOfflineQueueStats } from '../utils/offlineQueue';

interface OfflineContextType {
  isInitialized: boolean;
  isOnline: boolean;
  isDatabaseReady: boolean;
  queueStats: {
    pending: number;
    failed: number;
    completed: number;
    total: number;
  };
  initializeOfflineSystem: () => Promise<void>;
  syncData: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getConnectionStatus: () => Promise<boolean>;
}

// Create context
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Provider props
interface OfflineProviderProps {
  children: ReactNode;
}

// Offline provider component
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { isOnline } = useNetwork();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [queueStats, setQueueStats] = useState({
    pending: 0,
    failed: 0,
    completed: 0,
    total: 0
  });

  // Initialize offline system
  const initializeOfflineSystem = async (): Promise<void> => {
    try {
      console.log('Initializing offline system...');

      // Check initial connection status
      const connected = await checkNetworkStatus();

      // Initialize database (skip for web)
      if (Platform.OS !== 'web') {
        try {
          await initDatabase();
          const dbHealthy = await checkDatabaseHealth();
          setIsDatabaseReady(dbHealthy);
          
          if (dbHealthy) {
            console.log('Database initialized and healthy');
          } else {
            console.warn('Database health check failed');
          }
        } catch (error: any) {
          console.error('Database initialization failed:', error);
          setIsDatabaseReady(false);
        }
      } else {
        // For web, we'll use AsyncStorage fallback
        setIsDatabaseReady(true);
        console.log('Web platform detected, using AsyncStorage fallback');
      }

      // Start offline queue processing
      startOfflineQueueProcessing(30000); // Every 30 seconds

      // Update queue stats
      await updateQueueStats();

      // Perform initial sync if online
      if (connected) {
        console.log('🌐 [DEBUG] Device is online, performing initial sync...');
        try {
          await syncData();
        } catch (error: any) {
          console.warn('🌐 [WARN] Initial sync failed (non-blocking):', error?.message || error);
        }
      } else {
        console.log('🌐 [DEBUG] Device is offline, skipping initial sync');
      }

      setIsInitialized(true);
      console.log('Offline system initialized successfully');

    } catch (error) {
      console.error('Failed to initialize offline system:', error);
      setIsInitialized(false);
    }
  };

  // Sync data with server
  const syncData = async (): Promise<void> => {
    // try {
    //   const connected = await checkNetworkStatus();
    //   if (!connected) {
    //     console.log('Device is offline, skipping sync');
    //     return;
    //   }
	//
    //   console.log('🌐 [DEBUG] Starting data synchronization...');
    //
    //   // Process offline queue first
    //   console.log('🌐 [DEBUG] Processing offline queue...');
    //   await offlineQueue.processQueue();
    //
    //   // Then sync all data from server
    //   console.log('🌐 [DEBUG] Syncing route pages...');
    //   await syncRoutePages();
    //
    //   // Update queue stats
    //   console.log('🌐 [DEBUG] Updating queue stats...');
    //   await updateQueueStats();
    //
    //   console.log('🌐 [DEBUG] Data synchronization completed successfully');
    // } catch (error) {
    //   console.error('Data synchronization failed:', error);
    //   throw error;
    // }
  };

  // Clear completed operations from queue
  const clearQueue = async (): Promise<void> => {
    try {
      await offlineQueue.clearCompletedOperations();
      await updateQueueStats();
      console.log('Queue cleared successfully');
    } catch (error) {
      console.error('Failed to clear queue:', error);
      throw error;
    }
  };

  // Get current connection status
  const getConnectionStatus = async (): Promise<boolean> => {
    const connected = await checkNetworkStatus();
    return connected;
  };

  // Update queue statistics
  const updateQueueStats = async (): Promise<void> => {
    try {
      const stats = await getOfflineQueueStats();
      setQueueStats(stats);
    } catch (error) {
      console.error('Failed to update queue stats:', error);
    }
  };

  // Monitor network connectivity
  useEffect(() => {
    const wasOnline = isOnline;

    // If we just came back online, try to sync
    if (isOnline && !wasOnline && isInitialized) {
      console.log('Device came back online, starting sync...');
      try {
        syncData();
      } catch (error) {
        console.error('Auto-sync after reconnection failed:', error);
      }
    }
  }, [isOnline, isInitialized]);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isInitialized) {
        // App became active, check connectivity and sync if needed
        const connected = await getConnectionStatus();
        if (connected) {
          try {
            await syncData();
          } catch (error) {
            console.error('Sync on app activation failed:', error);
          }
        }
      } else if (nextAppState === 'background') {
        // App going to background, update queue stats
        await updateQueueStats();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isInitialized]);

  // Update queue stats periodically
  useEffect(() => {
    let statsInterval: NodeJS.Timeout;

    if (isInitialized) {
      // Update stats every 30 seconds
      statsInterval = setInterval(updateQueueStats, 30000);
    }

    return () => {
      if (statsInterval) {
        clearInterval(statsInterval);
      }
    };
  }, [isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initializeOfflineSystem();

    // Cleanup on unmount
    return () => {
      stopOfflineQueueProcessing();
    };
  }, []);

  // Context value
  const contextValue: OfflineContextType = {
    isInitialized,
    isOnline,
    isDatabaseReady,
    queueStats,
    initializeOfflineSystem,
    syncData,
    clearQueue,
    getConnectionStatus
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

// Hook to use offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

// Hook for connection status only
export const useConnectionStatus = (): boolean => {
  const { isOnline } = useOffline();
  return isOnline;
};

// Hook for database status
export const useDatabaseStatus = (): boolean => {
  const { isDatabaseReady } = useOffline();
  return isDatabaseReady;
};

// Hook for queue statistics
export const useQueueStats = () => {
  const { queueStats } = useOffline();
  return queueStats;
};

// Hook for offline system status
export const useOfflineStatus = () => {
  const { isInitialized, isOnline, isDatabaseReady, queueStats } = useOffline();
  
  return {
    isReady: isInitialized && isDatabaseReady,
    isOnline,
    hasOfflineData: queueStats.pending > 0 || queueStats.failed > 0,
    syncNeeded: queueStats.pending > 0,
    hasErrors: queueStats.failed > 0
  };
};

// Export context for advanced usage
export { OfflineContext };
