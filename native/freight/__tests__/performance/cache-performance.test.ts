/**
 * Performance tests for cache operations
 * These tests ensure the offline system performs well under load
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheManager } from '@/services/CacheManager';
import { CACHE_VERSION } from '@/config/offlineConfig';

// Mock AsyncStorage for performance testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Cache Performance Tests', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheManager = CacheManager.getInstance();
    
    // Mock fast storage operations
    mockAsyncStorage.getItem.mockImplementation(() => Promise.resolve(null));
    mockAsyncStorage.setItem.mockImplementation(() => Promise.resolve());
    mockAsyncStorage.removeItem.mockImplementation(() => Promise.resolve());
    mockAsyncStorage.getAllKeys.mockImplementation(() => Promise.resolve([]));
    mockAsyncStorage.multiRemove.mockImplementation(() => Promise.resolve());
  });

  describe('Single Operations Performance', () => {
    it('should handle cache get operations quickly', async () => {
      const startTime = performance.now();
      
      // Perform 100 get operations
      const promises = Array.from({ length: 100 }, (_, i) => 
        cacheManager.get(`test-key-${i}`)
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 operations in less than 100ms
      expect(duration).toBeLessThan(100);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(100);
    });

    it('should handle cache set operations efficiently', async () => {
      const testData = { id: 1, name: 'Test', data: new Array(100).fill('x').join('') };
      const strategy = { ttl: 60000, maxSize: 10, strategy: 'cache-first' as const };
      
      const startTime = performance.now();
      
      // Perform 50 set operations
      const promises = Array.from({ length: 50 }, (_, i) => 
        cacheManager.set(`test-key-${i}`, { ...testData, id: i }, strategy)
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 50 operations in less than 200ms
      expect(duration).toBeLessThan(200);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(50);
    });
  });

  describe('Bulk Operations Performance', () => {
    it('should handle cache cleanup efficiently', async () => {
      // Mock 1000 cache entries
      const cacheKeys = Array.from({ length: 1000 }, (_, i) => `cache_item_${i}`);
      mockAsyncStorage.getAllKeys.mockResolvedValue(cacheKeys);
      
      // Mock some expired and some valid entries
      mockAsyncStorage.getItem.mockImplementation((key) => {
        const index = parseInt(key.split('_')[2]);
        const isExpired = index % 3 === 0; // Every 3rd item is expired
        
        const data = {
          data: { id: index },
          timestamp: Date.now() - (isExpired ? 120000 : 1000),
          ttl: 60000,
          version: CACHE_VERSION
        };
        
        return Promise.resolve(JSON.stringify(data));
      });
      
      const startTime = performance.now();
      
      const cleanedCount = await cacheManager.cleanup();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should clean up 1000 entries in less than 500ms
      expect(duration).toBeLessThan(500);
      expect(cleanedCount).toBeGreaterThan(0);
    });

    it('should handle cache invalidation efficiently', async () => {
      // Mock 500 cache entries with pattern
      const allKeys = [
        ...Array.from({ length: 200 }, (_, i) => `cache_routes_${i}`),
        ...Array.from({ length: 200 }, (_, i) => `cache_objects_${i}`),
        ...Array.from({ length: 100 }, (_, i) => `cache_other_${i}`)
      ];
      
      mockAsyncStorage.getAllKeys.mockResolvedValue(allKeys);
      
      const startTime = performance.now();
      
      await cacheManager.invalidate('routes');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should invalidate pattern in less than 50ms
      expect(duration).toBeLessThan(50);
      
      // Should only remove routes entries
      const removedKeys = mockAsyncStorage.multiRemove.mock.calls[0][0];
      expect(removedKeys).toHaveLength(200);
      expect(removedKeys.every(key => key.includes('routes'))).toBe(true);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should handle large data objects efficiently', async () => {
      // Create a large data object (1MB)
      const largeData = {
        id: 1,
        content: new Array(1024 * 1024).fill('x').join(''),
        metadata: {
          created: Date.now(),
          size: 1024 * 1024
        }
      };
      
      const strategy = { ttl: 60000, maxSize: 5, strategy: 'cache-first' as const };
      
      const startTime = performance.now();
      
      await cacheManager.set('large-data', largeData, strategy);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 1MB object in less than 50ms
      expect(duration).toBeLessThan(50);
      
      // Verify the data was serialized correctly
      const setCall = mockAsyncStorage.setItem.mock.calls[0];
      const serializedData = setCall[1];
      expect(serializedData.length).toBeGreaterThan(1024 * 1024);
    });

    it('should calculate data sizes accurately', async () => {
      const testCases = [
        { data: { id: 1 }, expectedMinSize: 10 },
        { data: { id: 1, name: 'test' }, expectedMinSize: 20 },
        { data: { id: 1, content: 'x'.repeat(1000) }, expectedMinSize: 1000 }
      ];
      
      for (const testCase of testCases) {
        const strategy = { ttl: 60000, maxSize: 10, strategy: 'cache-first' as const };
        
        await cacheManager.set('size-test', testCase.data, strategy);
        
        const setCall = mockAsyncStorage.setItem.mock.calls.pop();
        const storedData = JSON.parse(setCall![1]);
        
        expect(storedData.size).toBeGreaterThanOrEqual(testCase.expectedMinSize);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent reads efficiently', async () => {
      // Mock cached data
      const cachedData = {
        data: { id: 1, name: 'Test' },
        timestamp: Date.now(),
        ttl: 60000,
        version: CACHE_VERSION
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));
      
      const startTime = performance.now();
      
      // Perform 100 concurrent reads
      const promises = Array.from({ length: 100 }, () => 
        cacheManager.get('concurrent-test')
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 100 concurrent reads in less than 100ms
      expect(duration).toBeLessThan(100);
      
      // All results should be identical
      results.forEach(result => {
        expect(result.data).toEqual(cachedData.data);
        expect(result.isFromCache).toBe(true);
      });
    });

    it('should handle concurrent writes efficiently', async () => {
      const strategy = { ttl: 60000, maxSize: 10, strategy: 'cache-first' as const };
      
      const startTime = performance.now();
      
      // Perform 50 concurrent writes
      const promises = Array.from({ length: 50 }, (_, i) => 
        cacheManager.set(`concurrent-write-${i}`, { id: i, data: `test-${i}` }, strategy)
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 50 concurrent writes in less than 200ms
      expect(duration).toBeLessThan(200);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(50);
    });
  });

  describe('Cache Statistics Performance', () => {
    it('should calculate statistics efficiently', async () => {
      // Mock 100 cache entries
      const cacheKeys = Array.from({ length: 100 }, (_, i) => `cache_item_${i}`);
      mockAsyncStorage.getAllKeys.mockResolvedValue(cacheKeys);
      
      // Mock cache data
      mockAsyncStorage.getItem.mockImplementation((key) => {
        const index = parseInt(key.split('_')[2]);
        const data = {
          data: { id: index },
          timestamp: Date.now() - (index * 1000),
          ttl: 60000,
          version: CACHE_VERSION,
          size: 100 + index
        };
        return Promise.resolve(JSON.stringify(data));
      });
      
      const startTime = performance.now();
      
      const stats = await cacheManager.getStats();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should calculate stats for 100 entries in less than 100ms
      expect(duration).toBeLessThan(100);
      
      expect(stats.totalEntries).toBe(100);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestEntry).toBeLessThan(stats.newestEntry!);
    });
  });

  describe('Edge Cases Performance', () => {
    it('should handle empty cache efficiently', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([]);
      
      const startTime = performance.now();
      
      const stats = await cacheManager.getStats();
      const cleanedCount = await cacheManager.cleanup();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle empty cache operations in less than 10ms
      expect(duration).toBeLessThan(10);
      expect(stats.totalEntries).toBe(0);
      expect(cleanedCount).toBe(0);
    });

    it('should handle corrupted cache entries efficiently', async () => {
      const cacheKeys = Array.from({ length: 50 }, (_, i) => `cache_item_${i}`);
      mockAsyncStorage.getAllKeys.mockResolvedValue(cacheKeys);
      
      // Mock corrupted data (invalid JSON)
      mockAsyncStorage.getItem.mockImplementation((key) => {
        const index = parseInt(key.split('_')[2]);
        return Promise.resolve(index % 2 === 0 ? 'invalid-json' : null);
      });
      
      const startTime = performance.now();
      
      // Should handle corrupted entries gracefully
      const promises = Array.from({ length: 50 }, (_, i) => 
        cacheManager.get(`item_${i}`)
      );
      
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle corrupted entries in less than 100ms
      expect(duration).toBeLessThan(100);
      
      // All results should handle corruption gracefully
      results.forEach(result => {
        expect(result.data).toBeNull();
        expect(result.isFromCache).toBe(false);
      });
    });
  });
});

describe('Real-world Performance Scenarios', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = CacheManager.getInstance();
  });

  it('should simulate typical app usage pattern', async () => {
    // Simulate typical app usage:
    // - Load routes (large dataset)
    // - Check route status (frequent)
    // - Load objects (medium dataset)
    // - Update profile (small, frequent)
    
    const routesData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Route ${i}`,
      description: `Description for route ${i}`.repeat(10)
    }));
    
    const strategy = { ttl: 60000, maxSize: 100, strategy: 'cache-first' as const };
    
    const startTime = performance.now();
    
    // Simulate app startup
    await Promise.all([
      cacheManager.set('routes', routesData, strategy),
      cacheManager.set('route-status', 'active', strategy),
      cacheManager.set('profile', { id: 1, name: 'User' }, strategy)
    ]);
    
    // Simulate frequent reads
    for (let i = 0; i < 20; i++) {
      await Promise.all([
        cacheManager.get('routes'),
        cacheManager.get('route-status'),
        cacheManager.get('profile')
      ]);
    }
    
    // Simulate cache cleanup
    await cacheManager.cleanup();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Typical usage should complete in less than 500ms
    expect(duration).toBeLessThan(500);
  });

  it('should handle app background/foreground cycle', async () => {
    const strategy = { ttl: 60000, maxSize: 50, strategy: 'cache-first' as const };
    
    // Simulate app going to background (save state)
    const backgroundData = {
      routes: Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Route ${i}` })),
      currentRoute: { id: 1, status: 'active' },
      userPreferences: { theme: 'dark', language: 'lv' }
    };
    
    const startTime = performance.now();
    
    // Save state to cache
    await Promise.all([
      cacheManager.set('background-routes', backgroundData.routes, strategy),
      cacheManager.set('background-current', backgroundData.currentRoute, strategy),
      cacheManager.set('background-prefs', backgroundData.userPreferences, strategy)
    ]);
    
    // Simulate app coming back to foreground (restore state)
    const [routes, currentRoute, prefs] = await Promise.all([
      cacheManager.get('background-routes'),
      cacheManager.get('background-current'),
      cacheManager.get('background-prefs')
    ]);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Background/foreground cycle should complete in less than 100ms
    expect(duration).toBeLessThan(100);
    
    // Data should be preserved
    expect(routes.data).toHaveLength(50);
    expect((currentRoute.data as any)?.status).toBe('active');
    expect((prefs.data as any)?.theme).toBe('dark');
  });
});
