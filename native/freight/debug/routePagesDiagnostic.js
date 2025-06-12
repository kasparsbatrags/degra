/**
 * Route Pages Diagnostic Script
 * 
 * This script helps diagnose why route pages are not loading on Android.
 * Run this in the React Native debugger console or add it to a test component.
 */

import { Platform } from 'react-native';
import { getRoutePages, syncRoutePages } from '../utils/offlineDataManagerExtended';
import { executeSelect, checkDatabaseHealth } from '../utils/database';
import { isConnected } from '../utils/networkUtils';
import freightAxiosInstance from '../config/freightAxios';

export const runRoutePagesDiagnostic = async () => {
  console.log('🔧 [DIAGNOSTIC] Starting route pages diagnostic...');
  console.log('🔧 [DIAGNOSTIC] Platform:', Platform.OS);
  
  try {
    // 1. Check network connectivity
    const connected = await isConnected();
    console.log('🔧 [DIAGNOSTIC] Network connected:', connected);
    
    // 2. Check database health (mobile only)
    if (Platform.OS !== 'web') {
      const dbHealthy = await checkDatabaseHealth();
      console.log('🔧 [DIAGNOSTIC] Database healthy:', dbHealthy);
      
      if (!dbHealthy) {
        console.error('🔧 [DIAGNOSTIC] Database is not healthy - this could be the issue!');
        return;
      }
    }
    
    // 3. Check current route pages count
    const currentRoutes = await getRoutePages();
    console.log('🔧 [DIAGNOSTIC] Current route pages count:', currentRoutes.length);
    console.log('🔧 [DIAGNOSTIC] Current route pages:', currentRoutes);
    
    // 4. Check raw database content (mobile only)
    if (Platform.OS !== 'web') {
      try {
        const allRoutes = await executeSelect('SELECT * FROM route_pages');
        console.log('🔧 [DIAGNOSTIC] Raw database route_pages count:', allRoutes.length);
        console.log('🔧 [DIAGNOSTIC] Raw database route_pages:', allRoutes);
        
        const deletedRoutes = await executeSelect('SELECT * FROM route_pages WHERE is_deleted = 1');
        console.log('🔧 [DIAGNOSTIC] Deleted routes count:', deletedRoutes.length);
        
        const dirtyRoutes = await executeSelect('SELECT * FROM route_pages WHERE is_dirty = 1');
        console.log('🔧 [DIAGNOSTIC] Dirty routes count:', dirtyRoutes.length);
      } catch (dbError) {
        console.error('🔧 [DIAGNOSTIC] Database query error:', dbError);
      }
    }
    
    // 5. Test server connectivity and data
    if (connected) {
      try {
        console.log('🔧 [DIAGNOSTIC] Testing server endpoint...');
        const response = await freightAxiosInstance.get('/route-pages');
        console.log('🔧 [DIAGNOSTIC] Server response status:', response.status);
        console.log('🔧 [DIAGNOSTIC] Server route pages count:', response.data.length);
        console.log('🔧 [DIAGNOSTIC] Server route pages (raw):', response.data.slice(0, 3));
        
        // Test normalization process
        console.log('🔧 [DIAGNOSTIC] Testing data normalization...');
        const normalizedData = normalizeRoutePagesFromApi(response.data);
        console.log('🔧 [DIAGNOSTIC] Normalized route pages count:', normalizedData.length);
        console.log('🔧 [DIAGNOSTIC] Normalized route pages:', normalizedData.slice(0, 3));
        
        if (normalizedData.length !== response.data.length) {
          console.warn('🔧 [DIAGNOSTIC] ⚠️ Some data was filtered out during normalization!');
          console.warn('🔧 [DIAGNOSTIC] Raw count:', response.data.length, 'Normalized count:', normalizedData.length);
        }
        
      } catch (serverError) {
        console.error('🔧 [DIAGNOSTIC] Server request failed:', serverError);
        console.error('🔧 [DIAGNOSTIC] Server error details:', serverError.response?.status, serverError.response?.data);
      }
    }
    
    // 6. Try manual sync
    if (connected && Platform.OS !== 'web') {
      try {
        console.log('🔧 [DIAGNOSTIC] Attempting manual sync...');
        await syncRoutePages();
        console.log('🔧 [DIAGNOSTIC] Manual sync completed');
        
        // Check routes again after sync
        const routesAfterSync = await getRoutePages();
        console.log('🔧 [DIAGNOSTIC] Route pages count after sync:', routesAfterSync.length);
        console.log('🔧 [DIAGNOSTIC] Route pages after sync:', routesAfterSync);
      } catch (syncError) {
        console.error('🔧 [DIAGNOSTIC] Manual sync failed:', syncError);
      }
    }
    
    console.log('🔧 [DIAGNOSTIC] Diagnostic completed');
    
  } catch (error) {
    console.error('🔧 [DIAGNOSTIC] Diagnostic failed:', error);
  }
};

// Export for easy use in components
export default runRoutePagesDiagnostic;
