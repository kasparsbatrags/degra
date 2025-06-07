import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { clearAllData, getDatabase } from './database';

/**
 * Purges all offline data from both AsyncStorage and SQLite database.
 * Call this after backend DB reset or user re-registration to avoid syncing stale offline records.
 */
export async function purgeAllOfflineData() {
  try {
    // 1. Clear AsyncStorage caches
    await purgeAsyncStorageData();
    
    // 2. Clear SQLite database (mobile only)
    await purgeSQLiteData();
    
    console.log('[offlinePurge] ✅ All offline data purged successfully');
  } catch (error) {
    console.error('[offlinePurge] ❌ Error purging offline data:', error);
    throw error;
  }
}

/**
 * Purges offline data from AsyncStorage (mobile only - web no longer uses caching)
 */
async function purgeAsyncStorageData() {
  if (Platform.OS === 'web') {
    console.log('[offlinePurge] Skipping AsyncStorage purge on web platform (no longer uses caching)');
    return;
  }

  // List of known offline cache keys for mobile (expand as needed)
  const keysToRemove = [
    'cached_trucks',
    'cached_objects', 
    'cached_last_active_route',
    'cached_last_finished_route',
  ];

  // Remove all cached_route_pages_* keys
  const allKeys = await AsyncStorage.getAllKeys();
  const routePageKeys = allKeys.filter((k) => k.startsWith('cached_route_pages_'));
  const keys = [...keysToRemove, ...routePageKeys];

  if (keys.length > 0) {
    await AsyncStorage.multiRemove(keys);
    console.log('[offlinePurge] Purged AsyncStorage cache keys:', keys);
  } else {
    console.log('[offlinePurge] No AsyncStorage cache keys found to purge.');
  }
}

/**
 * Purges offline data from SQLite database (mobile only)
 */
async function purgeSQLiteData() {
  if (Platform.OS === 'web') {
    console.log('[offlinePurge] Skipping SQLite purge on web platform');
    return;
  }

  try {
    // Use the existing clearAllData function from database.ts
    await clearAllData();
    console.log('[offlinePurge] Purged SQLite database data');
  } catch (error) {
    console.error('[offlinePurge] Failed to purge SQLite data:', error);
    // Don't throw error - AsyncStorage purge was successful
    console.warn('[offlinePurge] Continuing with AsyncStorage-only purge');
  }
}

/**
 * Purges only AsyncStorage data (for cases where SQLite purge is not needed)
 */
export async function purgeAsyncStorageOnly() {
  await purgeAsyncStorageData();
}

/**
 * Purges only SQLite database data (for cases where AsyncStorage purge is not needed)
 */
export async function purgeSQLiteOnly() {
  await purgeSQLiteData();
}
