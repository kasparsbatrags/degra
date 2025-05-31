/**
 * Centralizēta offline funkcionalitātes konfigurācija
 */

export interface CacheStrategy {
  ttl: number; // Time to live milisekundēs
  maxSize: number; // Maksimālais ierakstu skaits
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

export interface SyncConfig {
  maxRetries: number;
  retryDelay: number; // Sākotnējais delay milisekundēs
  backoffMultiplier: number;
  batchSize: number;
  backgroundInterval: number; // Background sync intervāls milisekundēs
}

export interface StorageConfig {
  maxCacheSize: number; // Bytes
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  cleanupInterval: number; // Cleanup intervāls milisekundēs
}

export interface OfflineConfig {
  cache: Record<string, CacheStrategy>;
  sync: SyncConfig;
  storage: StorageConfig;
  network: {
    timeoutMs: number;
    retryOnFailure: boolean;
    offlineThreshold: number; // Sekundes bez savienojuma, lai uzskatītu par offline
  };
}

export const OFFLINE_CONFIG: OfflineConfig = {
  cache: {
    // Maršrutu saraksts
    routes: {
      ttl: 24 * 60 * 60 * 1000, // 24 stundas
      maxSize: 100,
      strategy: 'stale-while-revalidate'
    },
    
    // Maršruta statuss
    routeStatus: {
      ttl: 5 * 60 * 1000, // 5 minūtes
      maxSize: 1,
      strategy: 'cache-first'
    },
    
    // Objektu saraksts
    objects: {
      ttl: 60 * 60 * 1000, // 1 stunda
      maxSize: 500,
      strategy: 'cache-first'
    },
    
    // Kravas automašīnu saraksts
    trucks: {
      ttl: 60 * 60 * 1000, // 1 stunda
      maxSize: 50,
      strategy: 'cache-first'
    },
    
    // Lietotāja profils
    profile: {
      ttl: 30 * 60 * 1000, // 30 minūtes
      maxSize: 1,
      strategy: 'network-first'
    },
    
    // Maršruta lapas
    routePages: {
      ttl: 24 * 60 * 60 * 1000, // 24 stundas
      maxSize: 200,
      strategy: 'stale-while-revalidate'
    }
  },
  
  sync: {
    maxRetries: 5,
    retryDelay: 1000, // 1 sekunde
    backoffMultiplier: 2,
    batchSize: 10,
    backgroundInterval: 5 * 60 * 1000 // 5 minūtes
  },
  
  storage: {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    compressionEnabled: true,
    encryptionEnabled: true,
    cleanupInterval: 24 * 60 * 60 * 1000 // 24 stundas
  },
  
  network: {
    timeoutMs: 10000, // 10 sekundes
    retryOnFailure: true,
    offlineThreshold: 30 // 30 sekundes
  }
};

// Cache atslēgas konstantes
export const CACHE_KEYS = {
  ROUTES: 'cached_routes',
  ROUTE_STATUS: 'cached_route_status',
  OBJECTS: 'cached_objects',
  TRUCKS: 'cached_trucks',
  PROFILE: 'cached_profile',
  ROUTE_PAGES: 'cached_route_pages',
  ROUTE_PAGE: 'cached_route_page',
  TRUCK_ROUTES: 'cached_truck_routes',
  
  // Metadata atslēgas
  LAST_SYNC: 'last_sync_timestamp',
  CACHE_VERSION: 'cache_version',
  OFFLINE_MODE: 'force_offline_mode'
} as const;

// Sync queue atslēgas
export const SYNC_KEYS = {
  TRUCK_ROUTES: 'pending_truck_routes',
  OBJECTS: 'pending_objects',
  PROFILE_UPDATES: 'pending_profile_updates'
} as const;

// Cache versioning - palielināt, kad mainās datu struktūra
export const CACHE_VERSION = '1.0.0';

// Utility funkcijas konfigurācijas iegūšanai
export function getCacheConfig(key: string): CacheStrategy {
  return OFFLINE_CONFIG.cache[key] || OFFLINE_CONFIG.cache.routes;
}

export function getSyncConfig(): SyncConfig {
  return OFFLINE_CONFIG.sync;
}

export function getStorageConfig(): StorageConfig {
  return OFFLINE_CONFIG.storage;
}

export function getNetworkConfig() {
  return OFFLINE_CONFIG.network;
}

// Validation funkcijas
export function validateCacheKey(key: string): boolean {
  return Object.values(CACHE_KEYS).includes(key as any);
}

export function validateSyncKey(key: string): boolean {
  return Object.values(SYNC_KEYS).includes(key as any);
}
