import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineManager, OfflineDataResult, OfflineDataOptions } from '@/services/OfflineManager';
import { CACHE_KEYS } from '@/config/offlineConfig';
import { useNetworkState } from '@/utils/networkUtils';

/**
 * Hook opcijas
 */
export interface UseOfflineDataOptions<T> extends OfflineDataOptions {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
}

/**
 * Hook rezultāts
 */
export interface UseOfflineDataResult<T> {
  data: T | null;
  isLoading: boolean;
  isFromCache: boolean;
  isStale: boolean;
  error: string | null;
  age: number;
  lastUpdated: number | null;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
  isRefetching: boolean;
}

/**
 * Universāls hook datu iegūšanai ar offline atbalstu
 */
export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseOfflineDataOptions<T> = {}
): UseOfflineDataResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchOnMount = true,
    refetchOnReconnect = true,
    ...offlineOptions
  } = options;

  const [result, setResult] = useState<OfflineDataResult<T>>({
    data: null,
    isFromCache: false,
    isStale: false,
    error: null,
    age: 0,
    lastUpdated: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const { isConnected } = useNetworkState();
  const mountedRef = useRef(true);
  const previousConnectedRef = useRef(isConnected);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch funkcija
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled || !mountedRef.current) return;

    try {
      const isInitialLoad = result.data === null && !result.isFromCache;
      
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      const fetchResult = await offlineManager.getData(
        key,
        fetcher,
        {
          ...offlineOptions,
          forceRefresh
        }
      );

      if (!mountedRef.current) return;

      setResult(fetchResult);

      // Callback funkcijas
      if (fetchResult.data && onSuccess) {
        onSuccess(fetchResult.data);
      }
      
      if (fetchResult.error && onError) {
        onError(fetchResult.error);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, [key, fetcher, enabled, offlineOptions, onSuccess, onError, result.data, result.isFromCache]);

  // Refetch funkcija
  const refetch = useCallback(async (forceRefresh = false) => {
    await fetchData(forceRefresh);
  }, [fetchData]);

  // Clear cache funkcija
  const clearCache = useCallback(async () => {
    try {
      await offlineManager.clearCache(key);
      // Reset local state
      setResult({
        data: null,
        isFromCache: false,
        isStale: false,
        error: null,
        age: 0,
        lastUpdated: null
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  // Initial fetch on mount
  useEffect(() => {
    if (refetchOnMount && enabled) {
      fetchData();
    }
  }, [fetchData, refetchOnMount, enabled]);

  // Refetch when network reconnects
  useEffect(() => {
    const wasDisconnected = !previousConnectedRef.current;
    const isNowConnected = isConnected;
    
    if (wasDisconnected && isNowConnected && refetchOnReconnect && enabled) {
      // Delay to ensure network is stable
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          fetchData(true); // Force refresh when reconnecting
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    previousConnectedRef.current = isConnected;
  }, [isConnected, refetchOnReconnect, enabled, fetchData]);

  return {
    data: result.data,
    isLoading,
    isFromCache: result.isFromCache,
    isStale: result.isStale,
    error: result.error,
    age: result.age,
    lastUpdated: result.lastUpdated,
    refetch,
    clearCache,
    isRefetching
  };
}

/**
 * Specializēti hooks dažādiem datu tipiem
 */

// Hook maršrutu sarakstam
export function useRoutes(options: Omit<UseOfflineDataOptions<any[]>, 'cacheKey'> = {}) {
  return useOfflineData(
    CACHE_KEYS.ROUTES,
    async () => {
      // Šeit būtu jāimportē freightAxios un jāveic API izsaukums
      throw new Error('Fetcher not implemented yet');
    },
    {
      cacheKey: CACHE_KEYS.ROUTES,
      ...options
    }
  );
}

// Hook maršruta statusam
export function useRouteStatus(options: Omit<UseOfflineDataOptions<string>, 'cacheKey'> = {}) {
  return useOfflineData(
    CACHE_KEYS.ROUTE_STATUS,
    async () => {
      // Šeit būtu jāimportē freightAxios un jāveic API izsaukums
      throw new Error('Fetcher not implemented yet');
    },
    {
      cacheKey: CACHE_KEYS.ROUTE_STATUS,
      ...options
    }
  );
}

// Hook objektu sarakstam
export function useObjects(options: Omit<UseOfflineDataOptions<any[]>, 'cacheKey'> = {}) {
  return useOfflineData(
    CACHE_KEYS.OBJECTS,
    async () => {
      // Šeit būtu jāimportē freightAxios un jāveic API izsaukums
      throw new Error('Fetcher not implemented yet');
    },
    {
      cacheKey: CACHE_KEYS.OBJECTS,
      ...options
    }
  );
}

// Hook kravas automašīnu sarakstam
export function useTrucks(options: Omit<UseOfflineDataOptions<any[]>, 'cacheKey'> = {}) {
  return useOfflineData(
    CACHE_KEYS.TRUCKS,
    async () => {
      // Šeit būtu jāimportē freightAxios un jāveic API izsaukums
      throw new Error('Fetcher not implemented yet');
    },
    {
      cacheKey: CACHE_KEYS.TRUCKS,
      ...options
    }
  );
}

// Hook lietotāja profilam
export function useProfile(options: Omit<UseOfflineDataOptions<any>, 'cacheKey'> = {}) {
  return useOfflineData(
    CACHE_KEYS.PROFILE,
    async () => {
      // Šeit būtu jāimportē axios un jāveic API izsaukums
      throw new Error('Fetcher not implemented yet');
    },
    {
      cacheKey: CACHE_KEYS.PROFILE,
      ...options
    }
  );
}
