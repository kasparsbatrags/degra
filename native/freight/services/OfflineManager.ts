import NetInfo from '@react-native-community/netinfo';
import { cacheManager, CacheResult } from './CacheManager';
import { syncManager } from './SyncManager';
import { getCacheConfig, getNetworkConfig, CACHE_KEYS, SYNC_KEYS } from '@/config/offlineConfig';
import { isConnected } from '@/utils/networkUtils';

/**
 * Offline datu iegūšanas opcijas
 */
export interface OfflineDataOptions {
  cacheKey?: string;
  forceRefresh?: boolean;
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  ttl?: number;
  maxRetries?: number;
}

/**
 * Offline datu rezultāts
 */
export interface OfflineDataResult<T> {
  data: T | null;
  isFromCache: boolean;
  isStale: boolean;
  error: string | null;
  age: number;
  lastUpdated: number | null;
}

/**
 * Offline operācijas opcijas
 */
export interface OfflineOperationOptions {
  priority?: 'high' | 'medium' | 'low';
  maxRetries?: number;
  dependencies?: string[];
  queueType?: string;
}

/**
 * Offline statuss
 */
export interface OfflineStatus {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingOperations: number;
  cacheSize: number;
  lastSync: number | null;
}

/**
 * Galvenais offline pārvaldnieks, kas koordinē cache un sync funkcionalitāti
 */
export class OfflineManager {
  private static instance: OfflineManager;
  private isOfflineMode = false;
  private networkListeners: Set<(status: OfflineStatus) => void> = new Set();

  private constructor() {
    this.setupNetworkMonitoring();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Universāla datu iegūšanas funkcija ar offline atbalstu
   */
  async getData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: OfflineDataOptions = {}
  ): Promise<OfflineDataResult<T>> {
    const {
      cacheKey = key,
      forceRefresh = false,
      strategy,
      ttl,
      maxRetries = 3
    } = options;

    try {
      const config = getCacheConfig(cacheKey);
      const effectiveStrategy = strategy || config.strategy;
      const online = await isConnected();

      // Ja ir force offline mode, izmantot tikai cache
      if (this.isOfflineMode || !online) {
        return await this.getCachedData<T>(cacheKey);
      }

      switch (effectiveStrategy) {
        case 'cache-first':
          return await this.cacheFirstStrategy<T>(cacheKey, fetcher, forceRefresh);
        
        case 'network-first':
          return await this.networkFirstStrategy<T>(cacheKey, fetcher, maxRetries);
        
        case 'stale-while-revalidate':
          return await this.staleWhileRevalidateStrategy<T>(cacheKey, fetcher);
        
        default:
          return await this.cacheFirstStrategy<T>(cacheKey, fetcher, forceRefresh);
      }
    } catch (error) {
      console.error('Error in getData:', error);
      
      // Fallback uz cache, ja ir kļūda
      const cachedResult = await this.getCachedData<T>(cacheKey);
      if (cachedResult.data !== null) {
        return {
          ...cachedResult,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      return {
        data: null,
        isFromCache: false,
        isStale: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        age: 0,
        lastUpdated: null
      };
    }
  }

  /**
   * Saglabāt datus cache
   */
  async saveData<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const config = getCacheConfig(key);
      const strategy = ttl ? { ...config, ttl } : config;
      await cacheManager.set(key, data, strategy);
    } catch (error) {
      console.error('Error saving data to cache:', error);
      throw error;
    }
  }

  /**
   * Pievienot offline operāciju
   */
  async addOfflineOperation(
    type: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data: any,
    options: OfflineOperationOptions = {}
  ): Promise<string> {
    try {
      const {
        priority = 'medium',
        maxRetries,
        dependencies,
        queueType = SYNC_KEYS.TRUCK_ROUTES
      } = options;

      return await syncManager.addToQueue(queueType, {
        type,
        method,
        endpoint,
        data,
        priority,
        maxRetries,
        dependencies
      });
    } catch (error) {
      console.error('Error adding offline operation:', error);
      throw error;
    }
  }

  /**
   * Sinhronizēt visus pending datus
   */
  async syncPendingData(axiosInstances?: Record<string, any>): Promise<boolean> {
    try {
      const online = await isConnected();
      if (!online) {
        console.log('Cannot sync - no network connection');
        return false;
      }

      const results = await syncManager.syncAll(axiosInstances);
      
      // Pārbaudīt, vai visas operācijas bija veiksmīgas
      const allSuccessful = Object.values(results).every(queueResults =>
        queueResults.every(result => result.success)
      );

      if (allSuccessful) {
        // Notīrīt cache, lai iegūtu jaunākos datus
        await this.invalidateStaleCache();
      }

      return allSuccessful;
    } catch (error) {
      console.error('Error syncing pending data:', error);
      return false;
    }
  }

  /**
   * Tīrīt cache
   */
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        await cacheManager.invalidate(pattern);
      } else {
        await cacheManager.clear();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Iegūt offline statusu
   */
  async getOfflineStatus(): Promise<OfflineStatus> {
    try {
      const online = await isConnected();
      const hasPending = await syncManager.hasPendingOperations();
      const cacheStats = await cacheManager.getStats();
      
      // Iegūt pēdējās sinhronizācijas laiku
      const stats = await syncManager.getQueueStats(SYNC_KEYS.TRUCK_ROUTES);

      return {
        isOnline: online,
        isOfflineMode: this.isOfflineMode,
        pendingOperations: stats.pendingOperations || 0,
        cacheSize: cacheStats.totalSize,
        lastSync: stats.lastSuccessfulSync ?? null
      };
    } catch (error) {
      console.error('Error getting offline status:', error);
      return {
        isOnline: false,
        isOfflineMode: this.isOfflineMode,
        pendingOperations: 0,
        cacheSize: 0,
        lastSync: null
      };
    }
  }

  /**
   * Ieslēgt/izslēgt force offline mode
   */
  async setOfflineMode(enabled: boolean): Promise<void> {
    this.isOfflineMode = enabled;
    await this.notifyStatusChange();
  }

  /**
   * Pievienot network status listener
   */
  addNetworkListener(callback: (status: OfflineStatus) => void): () => void {
    this.networkListeners.add(callback);
    
    // Atgriezt unsubscribe funkciju
    return () => {
      this.networkListeners.delete(callback);
    };
  }

  /**
   * Tīrīt novecojušos cache ierakstus
   */
  async cleanup(): Promise<number> {
    try {
      return await cacheManager.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }

  /**
   * Destroy instance un tīrīt resources
   */
  destroy(): void {
    syncManager.destroy();
    this.networkListeners.clear();
  }

  /**
   * Privātās utility funkcijas
   */
  private async getCachedData<T>(key: string): Promise<OfflineDataResult<T>> {
    const cacheResult = await cacheManager.get<T>(key);
    
    return {
      data: cacheResult.data,
      isFromCache: cacheResult.isFromCache,
      isStale: cacheResult.isStale,
      error: null,
      age: cacheResult.age,
      lastUpdated: cacheResult.data ? Date.now() - cacheResult.age : null
    };
  }

  private async cacheFirstStrategy<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh: boolean
  ): Promise<OfflineDataResult<T>> {
    // Vispirms mēģināt no cache
    if (!forceRefresh) {
      const cacheResult = await cacheManager.get<T>(key);
      if (cacheResult.data !== null && !cacheResult.isStale) {
        return {
          data: cacheResult.data,
          isFromCache: true,
          isStale: false,
          error: null,
          age: cacheResult.age,
          lastUpdated: Date.now() - cacheResult.age
        };
      }
    }

    // Ja nav cache vai ir stale, mēģināt no network
    try {
      const data = await fetcher();
      await cacheManager.set(key, data);
      
      return {
        data,
        isFromCache: false,
        isStale: false,
        error: null,
        age: 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      // Ja network fails, izmantot cache (pat ja stale)
      const cacheResult = await cacheManager.get<T>(key);
      return {
        data: cacheResult.data,
        isFromCache: cacheResult.isFromCache,
        isStale: true,
        error: error instanceof Error ? error.message : 'Network error',
        age: cacheResult.age,
        lastUpdated: cacheResult.data ? Date.now() - cacheResult.age : null
      };
    }
  }

  private async networkFirstStrategy<T>(
    key: string,
    fetcher: () => Promise<T>,
    maxRetries: number
  ): Promise<OfflineDataResult<T>> {
    // Vispirms mēģināt no network
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const data = await fetcher();
        await cacheManager.set(key, data);
        
        return {
          data,
          isFromCache: false,
          isStale: false,
          error: null,
          age: 0,
          lastUpdated: Date.now()
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries - 1) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // Ja network fails, izmantot cache
    const cacheResult = await cacheManager.get<T>(key);
    return {
      data: cacheResult.data,
      isFromCache: cacheResult.isFromCache,
      isStale: cacheResult.isStale,
      error: lastError?.message || 'Network error',
      age: cacheResult.age,
      lastUpdated: cacheResult.data ? Date.now() - cacheResult.age : null
    };
  }

  private async staleWhileRevalidateStrategy<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<OfflineDataResult<T>> {
    // Iegūt no cache (pat ja stale)
    const cacheResult = await cacheManager.get<T>(key);
    
    // Ja ir stale vai nav cache, sākt background refresh
    if (cacheResult.isStale || cacheResult.data === null) {
      // Background refresh (don't await)
      fetcher()
        .then(data => cacheManager.set(key, data))
        .catch(error => console.error('Background refresh failed:', error));
    }

    return {
      data: cacheResult.data,
      isFromCache: cacheResult.isFromCache,
      isStale: cacheResult.isStale,
      error: null,
      age: cacheResult.age,
      lastUpdated: cacheResult.data ? Date.now() - cacheResult.age : null
    };
  }

  private async invalidateStaleCache(): Promise<void> {
    try {
      // Tīrīt tikai stale ierakstus, nevis visu cache
      await cacheManager.cleanup();
    } catch (error) {
      console.error('Error invalidating stale cache:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(async (state) => {
      await this.notifyStatusChange();
    });
  }

  private async notifyStatusChange(): Promise<void> {
    try {
      const status = await this.getOfflineStatus();
      this.networkListeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in network listener callback:', error);
        }
      });
    } catch (error) {
      console.error('Error notifying status change:', error);
    }
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();
