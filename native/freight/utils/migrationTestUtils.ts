/**
 * Migration Testing Utilities
 * Helper functions to compare old vs new implementations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheManager } from '@/services/CacheManager';
import { CACHE_KEYS } from '@/config/offlineConfig';

export interface MigrationTestResult {
  component: string;
  oldVersion: any;
  newVersion: any;
  differences: string[];
  performance: {
    oldTime: number;
    newTime: number;
    improvement: number;
  };
  cacheStats?: any;
}

/**
 * Compare data loading between old and new implementations
 */
export async function compareDataLoading(
  oldFetcher: () => Promise<any>,
  newFetcher: () => Promise<any>,
  componentName: string
): Promise<MigrationTestResult> {
  const differences: string[] = [];
  
  // Test old implementation
  const oldStart = performance.now();
  let oldData: any;
  let oldError: any;
  
  try {
    oldData = await oldFetcher();
  } catch (error: any) {
    oldError = error;
    oldData = null;
  }
  
  const oldEnd = performance.now();
  const oldTime = oldEnd - oldStart;
  
  // Test new implementation
  const newStart = performance.now();
  let newData: any;
  let newError: any;
  
  try {
    newData = await newFetcher();
  } catch (error) {
    newError = error;
    newData = null;
  }
  
  const newEnd = performance.now();
  const newTime = newEnd - newStart;
  
  // Compare results
  if (oldError && !newError) {
    differences.push('New implementation handles errors better');
  }
  
  if (!oldError && newError) {
    differences.push('New implementation has new error that old didn\'t have');
  }
  
  if (oldData && newData) {
    if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
      differences.push('Data structure differs between implementations');
    }
  }
  
  const improvement = ((oldTime - newTime) / oldTime) * 100;
  
  return {
    component: componentName,
    oldVersion: { data: oldData, error: oldError },
    newVersion: { data: newData, error: newError },
    differences,
    performance: {
      oldTime,
      newTime,
      improvement
    }
  };
}

/**
 * Test cache functionality
 */
export async function testCacheImplementation(cacheKey: string): Promise<any> {
  try {
    const cacheResult = await cacheManager.get(cacheKey);
    const stats = await cacheManager.getStats();
    
    return {
      hasCache: cacheResult.data !== null,
      isFromCache: cacheResult.isFromCache,
      isStale: cacheResult.isStale,
      age: cacheResult.age,
      stats: {
        totalEntries: stats.totalEntries,
        hitRate: stats.hitRate,
        missRate: stats.missRate
      }
    };
  } catch (error) {
    return {
      error: (error as any)?.message || 'Unknown error',
      hasCache: false
    };
  }
}

/**
 * Compare AsyncStorage usage (old) vs Cache Manager (new)
 */
export async function compareStorageUsage(): Promise<{
  asyncStorageKeys: string[];
  cacheManagerKeys: string[];
  duplicates: string[];
}> {
  // Get all AsyncStorage keys
  const allKeys = await AsyncStorage.getAllKeys();
  const asyncStorageKeys = allKeys.filter(key => 
    key.startsWith('cached_') || 
    key.startsWith('pending_') || 
    key.includes('route') ||
    key.includes('status')
  );
  
  // Get Cache Manager stats
  const stats = await cacheManager.getStats();
  const cacheManagerKeys = Object.values(CACHE_KEYS);
  
  // Find potential duplicates
  const duplicates = asyncStorageKeys.filter(key => 
    cacheManagerKeys.some(cacheKey => key.includes(cacheKey.replace('cached_', '')))
  );
  
  return {
    asyncStorageKeys,
    cacheManagerKeys,
    duplicates
  };
}

/**
 * Performance benchmark for offline operations
 */
export async function benchmarkOfflineOperations(): Promise<{
  cacheRead: number;
  cacheWrite: number;
  asyncStorageRead: number;
  asyncStorageWrite: number;
  improvement: {
    read: number;
    write: number;
  };
}> {
  const testData = { id: 1, name: 'Test Data', timestamp: Date.now() };
  const iterations = 100;
  
  // Benchmark Cache Manager
  const cacheReadStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await cacheManager.get('benchmark_test');
  }
  const cacheReadTime = performance.now() - cacheReadStart;
  
  const cacheWriteStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await cacheManager.set(`benchmark_test_${i}`, testData, {
      ttl: 60000,
      maxSize: 10,
      strategy: 'cache-first'
    });
  }
  const cacheWriteTime = performance.now() - cacheWriteStart;
  
  // Benchmark AsyncStorage
  const asyncReadStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await AsyncStorage.getItem('benchmark_test');
  }
  const asyncReadTime = performance.now() - asyncReadStart;
  
  const asyncWriteStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    await AsyncStorage.setItem(`benchmark_test_${i}`, JSON.stringify(testData));
  }
  const asyncWriteTime = performance.now() - asyncWriteStart;
  
  // Cleanup
  const keysToRemove = Array.from({ length: iterations }, (_, i) => `benchmark_test_${i}`);
  await AsyncStorage.multiRemove(keysToRemove);
  
  return {
    cacheRead: cacheReadTime,
    cacheWrite: cacheWriteTime,
    asyncStorageRead: asyncReadTime,
    asyncStorageWrite: asyncWriteTime,
    improvement: {
      read: ((asyncReadTime - cacheReadTime) / asyncReadTime) * 100,
      write: ((asyncWriteTime - cacheWriteTime) / asyncWriteTime) * 100
    }
  };
}

/**
 * Test offline scenarios
 */
export async function testOfflineScenarios(): Promise<{
  scenario: string;
  success: boolean;
  details: any;
}[]> {
  const results = [];
  
  // Test 1: Cache availability when offline
  try {
    const routesCache = await cacheManager.get(CACHE_KEYS.ROUTES);
    results.push({
      scenario: 'Routes cache availability',
      success: routesCache.data !== null,
      details: {
        hasData: routesCache.data !== null,
        isFromCache: routesCache.isFromCache,
        age: routesCache.age
      }
    });
  } catch (error) {
    results.push({
      scenario: 'Routes cache availability',
      success: false,
      details: { error: (error as any)?.message || 'Unknown error' }
    });
  }
  
  // Test 2: Route status cache
  try {
    const statusCache = await cacheManager.get(CACHE_KEYS.ROUTE_STATUS);
    results.push({
      scenario: 'Route status cache availability',
      success: statusCache.data !== null,
      details: {
        hasData: statusCache.data !== null,
        isFromCache: statusCache.isFromCache,
        status: statusCache.data
      }
    });
  } catch (error) {
    results.push({
      scenario: 'Route status cache availability',
      success: false,
      details: { error: (error as any)?.message || 'Unknown error' }
    });
  }
  
  // Test 3: Cache statistics
  try {
    const stats = await cacheManager.getStats();
    results.push({
      scenario: 'Cache statistics',
      success: true,
      details: stats
    });
  } catch (error) {
    results.push({
      scenario: 'Cache statistics',
      success: false,
      details: { error: (error as any)?.message || 'Unknown error' }
    });
  }
  
  return results;
}

/**
 * Generate migration report
 */
export function generateMigrationReport(testResults: MigrationTestResult[]): string {
  let report = '# Migration Test Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  testResults.forEach(result => {
    report += `## ${result.component}\n\n`;
    
    // Performance
    report += `### Performance\n`;
    report += `- Old implementation: ${result.performance.oldTime.toFixed(2)}ms\n`;
    report += `- New implementation: ${result.performance.newTime.toFixed(2)}ms\n`;
    report += `- Improvement: ${result.performance.improvement.toFixed(1)}%\n\n`;
    
    // Differences
    if (result.differences.length > 0) {
      report += `### Differences\n`;
      result.differences.forEach(diff => {
        report += `- ${diff}\n`;
      });
      report += '\n';
    }
    
    // Cache stats
    if (result.cacheStats) {
      report += `### Cache Statistics\n`;
      report += `- Total entries: ${result.cacheStats.totalEntries}\n`;
      report += `- Hit rate: ${(result.cacheStats.hitRate * 100).toFixed(1)}%\n`;
      report += `- Miss rate: ${(result.cacheStats.missRate * 100).toFixed(1)}%\n\n`;
    }
  });
  
  return report;
}

/**
 * Log migration test results
 */
export function logMigrationResults(results: MigrationTestResult[]): void {
  console.group('🔄 Migration Test Results');
  
  results.forEach(result => {
    console.group(`📱 ${result.component}`);
    
    console.log('⏱️ Performance:', {
      old: `${result.performance.oldTime.toFixed(2)}ms`,
      new: `${result.performance.newTime.toFixed(2)}ms`,
      improvement: `${result.performance.improvement.toFixed(1)}%`
    });
    
    if (result.differences.length > 0) {
      console.log('🔍 Differences:', result.differences);
    }
    
    if (result.cacheStats) {
      console.log('💾 Cache Stats:', result.cacheStats);
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

/**
 * Validate migration completeness
 */
export async function validateMigration(): Promise<{
  isComplete: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for old AsyncStorage usage
  const storageComparison = await compareStorageUsage();
  if (storageComparison.duplicates.length > 0) {
    issues.push(`Found ${storageComparison.duplicates.length} duplicate storage keys`);
    recommendations.push('Clean up old AsyncStorage keys after migration');
  }
  
  // Check cache functionality
  const cacheTest = await testCacheImplementation(CACHE_KEYS.ROUTES);
  if (cacheTest.error) {
    issues.push(`Cache implementation error: ${cacheTest.error}`);
    recommendations.push('Fix cache manager configuration');
  }
  
  // Check offline scenarios
  const offlineTests = await testOfflineScenarios();
  const failedTests = offlineTests.filter(test => !test.success);
  if (failedTests.length > 0) {
    issues.push(`${failedTests.length} offline scenarios failed`);
    recommendations.push('Review offline functionality implementation');
  }
  
  return {
    isComplete: issues.length === 0,
    issues,
    recommendations
  };
}
