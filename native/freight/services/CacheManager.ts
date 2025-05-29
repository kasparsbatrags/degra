import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getCacheConfig, getStorageConfig, CACHE_VERSION, CacheStrategy } from '@/config/offlineConfig';

/**
 * Kešotie dati ar metadata
 */
export interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  size?: number;
}

/**
 * Cache statistika
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  hitRate: number;
  missRate: number;
}

/**
 * Cache operāciju rezultāts
 */
export interface CacheResult<T> {
  data: T | null;
  isFromCache: boolean;
  isStale: boolean;
  age: number; // Vecums milisekundēs
}

/**
 * Universāls cache manager, kas nodrošina konsekventu cache funkcionalitāti
 * visai aplikācijai ar atbalstu dažādām platformām
 */
export class CacheManager {
  private static instance: CacheManager;
  private hitCount = 0;
  private missCount = 0;
  private readonly storagePrefix = 'cache_';

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Iegūt datus no cache
   */
  async get<T>(key: string, strategy?: CacheStrategy): Promise<CacheResult<T>> {
    try {
      const config = strategy || getCacheConfig(key);
      const storageKey = this.getStorageKey(key);
      
      const cachedDataStr = await AsyncStorage.getItem(storageKey);
      
      if (!cachedDataStr) {
        this.missCount++;
        return {
          data: null,
          isFromCache: false,
          isStale: false,
          age: 0
        };
      }

      const cachedData: CachedData<T> = JSON.parse(cachedDataStr);
      const now = Date.now();
      const age = now - cachedData.timestamp;
      const isExpired = age > cachedData.ttl;
      
      // Pārbaudīt versiju
      if (cachedData.version !== CACHE_VERSION) {
        await this.delete(key);
        this.missCount++;
        return {
          data: null,
          isFromCache: false,
          isStale: false,
          age: 0
        };
      }

      this.hitCount++;
      
      return {
        data: cachedData.data,
        isFromCache: true,
        isStale: isExpired,
        age
      };
    } catch (error) {
      console.error('Cache get error:', error);
      this.missCount++;
      return {
        data: null,
        isFromCache: false,
        isStale: false,
        age: 0
      };
    }
  }

  /**
   * Saglabāt datus cache
   */
  async set<T>(key: string, data: T, strategy?: CacheStrategy): Promise<void> {
    try {
      const config = strategy || getCacheConfig(key);
      const storageKey = this.getStorageKey(key);
      
      const cachedData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        ttl: config.ttl,
        version: CACHE_VERSION,
        size: this.calculateSize(data)
      };

      await AsyncStorage.setItem(storageKey, JSON.stringify(cachedData));
      
      // Pārbaudīt cache izmēru un tīrīt, ja nepieciešams
      await this.enforceMaxSize(key, config.maxSize);
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  /**
   * Dzēst konkrētu cache ierakstu
   */
  async delete(key: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Cache delete error:', error);
      throw error;
    }
  }

  /**
   * Dzēst cache ierakstus pēc pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(this.storagePrefix) && 
        key.includes(pattern)
      );
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
      throw error;
    }
  }

  /**
   * Tīrīt visu cache
   */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.storagePrefix));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
      // Reset statistiku
      this.hitCount = 0;
      this.missCount = 0;
    } catch (error) {
      console.error('Cache clear error:', error);
      throw error;
    }
  }

  /**
   * Tīrīt novecojušos ierakstus
   */
  async cleanup(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.storagePrefix));
      
      let cleanedCount = 0;
      const now = Date.now();
      
      for (const key of cacheKeys) {
        try {
          const dataStr = await AsyncStorage.getItem(key);
          if (dataStr) {
            const cachedData: CachedData<any> = JSON.parse(dataStr);
            const age = now - cachedData.timestamp;
            
            // Dzēst, ja novecojis vai nepareiza versija
            if (age > cachedData.ttl || cachedData.version !== CACHE_VERSION) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // Ja nevar parsēt, dzēst
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  /**
   * Iegūt cache statistiku
   */
  async getStats(): Promise<CacheStats> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.storagePrefix));
      
      let totalSize = 0;
      let oldestEntry: number | null = null;
      let newestEntry: number | null = null;
      
      for (const key of cacheKeys) {
        try {
          const dataStr = await AsyncStorage.getItem(key);
          if (dataStr) {
            const cachedData: CachedData<any> = JSON.parse(dataStr);
            totalSize += cachedData.size || 0;
            
            if (!oldestEntry || cachedData.timestamp < oldestEntry) {
              oldestEntry = cachedData.timestamp;
            }
            if (!newestEntry || cachedData.timestamp > newestEntry) {
              newestEntry = cachedData.timestamp;
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
      
      const totalRequests = this.hitCount + this.missCount;
      const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
      const missRate = totalRequests > 0 ? this.missCount / totalRequests : 0;
      
      return {
        totalEntries: cacheKeys.length,
        totalSize,
        oldestEntry,
        newestEntry,
        hitRate,
        missRate
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
        hitRate: 0,
        missRate: 0
      };
    }
  }

  /**
   * Pārbaudīt, vai cache ieraksts eksistē un nav novecojis
   */
  async isValid(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result.data !== null && !result.isStale;
  }

  /**
   * Iegūt cache ieraksta vecumu
   */
  async getAge(key: string): Promise<number | null> {
    const result = await this.get(key);
    return result.data !== null ? result.age : null;
  }

  /**
   * Privātās utility funkcijas
   */
  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  private async enforceMaxSize(keyPrefix: string, maxSize: number): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const relatedKeys = allKeys.filter(key => 
        key.startsWith(this.getStorageKey(keyPrefix))
      );
      
      if (relatedKeys.length <= maxSize) return;
      
      // Iegūt visus ierakstus ar timestamp
      const entries: Array<{ key: string; timestamp: number }> = [];
      
      for (const key of relatedKeys) {
        try {
          const dataStr = await AsyncStorage.getItem(key);
          if (dataStr) {
            const cachedData: CachedData<any> = JSON.parse(dataStr);
            entries.push({ key, timestamp: cachedData.timestamp });
          }
        } catch (error) {
          // Ja nevar parsēt, pievienot ar 0 timestamp (tiks dzēsts pirmais)
          entries.push({ key, timestamp: 0 });
        }
      }
      
      // Kārtot pēc timestamp (vecākie pirmie)
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Dzēst vecākos ierakstus
      const toDelete = entries.slice(0, entries.length - maxSize);
      const keysToDelete = toDelete.map(entry => entry.key);
      
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
      }
    } catch (error) {
      console.error('Cache size enforcement error:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();
