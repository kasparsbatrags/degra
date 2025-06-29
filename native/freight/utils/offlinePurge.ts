import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { clearAllData, getDatabase } from './database';

export async function purgeAllOfflineData() {
  try {

    await purgeSQLiteData();
    
    console.log('[offlinePurge] ✅ All offline data purged successfully');
  } catch (error) {
    console.error('[offlinePurge] ❌ Error purging offline data:', error);
    throw error;
  }
}

async function purgeSQLiteData() {
  if (Platform.OS === 'web') {
    console.log('[offlinePurge] Skipping SQLite purge on web platform');
    return;
  }

  try {
    await clearAllData();
    console.log('[offlinePurge] Purged SQLite database data');
  } catch (error) {
    console.error('[offlinePurge] Failed to purge SQLite data:', error);
    console.warn('[offlinePurge] Continuing with AsyncStorage-only purge');
  }
}

export async function purgeSQLiteOnly() {
  await purgeSQLiteData();
}
