import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheManager, cacheManager } from '@/services/CacheManager';
import { CACHE_VERSION } from '@/config/offlineConfig';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('CacheManager', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return null when no cached data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await cacheManager.get('test-key');

      expect(result.data).toBeNull();
      expect(result.isFromCache).toBe(false);
      expect(result.isStale).toBe(false);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('cache_test-key');
    });

    it('should return cached data when valid', async () => {
      const testData = { id: 1, name: 'Test' };
      const cachedData = {
        data: testData,
        timestamp: Date.now() - 1000, // 1 second ago
        ttl: 60000, // 1 minute
        version: CACHE_VERSION,
        size: 100
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await cacheManager.get('test-key');

      expect(result.data).toEqual(testData);
      expect(result.isFromCache).toBe(true);
      expect(result.isStale).toBe(false);
      expect(result.age).toBeGreaterThan(0);
    });

    it('should return stale data when TTL expired', async () => {
      const testData = { id: 1, name: 'Test' };
      const cachedData = {
        data: testData,
        timestamp: Date.now() - 120000, // 2 minutes ago
        ttl: 60000, // 1 minute TTL
        version: CACHE_VERSION,
        size: 100
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await cacheManager.get('test-key');

      expect(result.data).toEqual(testData);
      expect(result.isFromCache).toBe(true);
      expect(result.isStale).toBe(true);
    });

    it('should invalidate cache when version mismatch', async () => {
      const testData = { id: 1, name: 'Test' };
      const cachedData = {
        data: testData,
        timestamp: Date.now(),
        ttl: 60000,
        version: 'old-version',
        size: 100
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const result = await cacheManager.get('test-key');

      expect(result.data).toBeNull();
      expect(result.isFromCache).toBe(false);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_test-key');
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');

      const result = await cacheManager.get('test-key');

      expect(result.data).toBeNull();
      expect(result.isFromCache).toBe(false);
    });
  });

  describe('set', () => {
    it('should store data with correct metadata', async () => {
      const testData = { id: 1, name: 'Test' };
      const strategy = { ttl: 60000, maxSize: 10, strategy: 'cache-first' as const };

      await cacheManager.set('test-key', testData, strategy);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'cache_test-key',
        expect.stringContaining('"data":{"id":1,"name":"Test"}')
      );

      const setCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setCall[1]);
      
      expect(storedData.data).toEqual(testData);
      expect(storedData.ttl).toBe(60000);
      expect(storedData.version).toBe(CACHE_VERSION);
      expect(storedData.timestamp).toBeCloseTo(Date.now(), -2);
    });

    it('should handle storage errors', async () => {
      const testData = { id: 1, name: 'Test' };
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      await expect(cacheManager.set('test-key', testData)).rejects.toThrow('Storage full');
    });
  });

  describe('delete', () => {
    it('should remove item from storage', async () => {
      await cacheManager.delete('test-key');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_test-key');
    });

    it('should handle deletion errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Delete failed'));

      await expect(cacheManager.delete('test-key')).rejects.toThrow('Delete failed');
    });
  });

  describe('invalidate', () => {
    it('should remove items matching pattern', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'cache_routes_1',
        'cache_routes_2',
        'cache_profile',
        'other_key'
      ]);

      await cacheManager.invalidate('routes');

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_routes_1',
        'cache_routes_2'
      ]);
    });

    it('should handle no matching keys', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue(['other_key']);

      await cacheManager.invalidate('routes');

      expect(mockAsyncStorage.multiRemove).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all cache items', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'cache_routes',
        'cache_profile',
        'other_key'
      ]);

      await cacheManager.clear();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_routes',
        'cache_profile'
      ]);
    });
  });

  describe('cleanup', () => {
    it('should remove expired and invalid version items', async () => {
      const now = Date.now();
      const validData = {
        data: { id: 1 },
        timestamp: now - 1000,
        ttl: 60000,
        version: CACHE_VERSION
      };
      const expiredData = {
        data: { id: 2 },
        timestamp: now - 120000,
        ttl: 60000,
        version: CACHE_VERSION
      };
      const invalidVersionData = {
        data: { id: 3 },
        timestamp: now,
        ttl: 60000,
        version: 'old-version'
      };

      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'cache_valid',
        'cache_expired',
        'cache_invalid_version',
        'cache_invalid_json'
      ]);

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(validData))
        .mockResolvedValueOnce(JSON.stringify(expiredData))
        .mockResolvedValueOnce(JSON.stringify(invalidVersionData))
        .mockResolvedValueOnce('invalid-json');

      const cleanedCount = await cacheManager.cleanup();

      expect(cleanedCount).toBe(3);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(3);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_expired');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_invalid_version');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_invalid_json');
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const now = Date.now();
      const data1 = {
        data: { id: 1 },
        timestamp: now - 1000,
        ttl: 60000,
        version: CACHE_VERSION,
        size: 100
      };
      const data2 = {
        data: { id: 2 },
        timestamp: now - 2000,
        ttl: 60000,
        version: CACHE_VERSION,
        size: 200
      };

      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'cache_item1',
        'cache_item2',
        'other_key'
      ]);

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(data1))
        .mockResolvedValueOnce(JSON.stringify(data2));

      // Mock some hit/miss counts
      await cacheManager.get('test1'); // This will be a miss
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(data1));
      await cacheManager.get('test2'); // This will be a hit

      const stats = await cacheManager.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.totalSize).toBe(300);
      expect(stats.oldestEntry).toBe(now - 2000);
      expect(stats.newestEntry).toBe(now - 1000);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.missRate).toBeGreaterThan(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid non-stale data', async () => {
      const validData = {
        data: { id: 1 },
        timestamp: Date.now() - 1000,
        ttl: 60000,
        version: CACHE_VERSION
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(validData));

      const isValid = await cacheManager.isValid('test-key');

      expect(isValid).toBe(true);
    });

    it('should return false for stale data', async () => {
      const staleData = {
        data: { id: 1 },
        timestamp: Date.now() - 120000,
        ttl: 60000,
        version: CACHE_VERSION
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(staleData));

      const isValid = await cacheManager.isValid('test-key');

      expect(isValid).toBe(false);
    });

    it('should return false for non-existent data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const isValid = await cacheManager.isValid('test-key');

      expect(isValid).toBe(false);
    });
  });
});
