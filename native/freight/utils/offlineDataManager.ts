import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery, executeSelect, executeSelectFirst, executeTransaction, RoutePage } from './database';
import { addOfflineOperation } from './offlineQueue';
import { isConnected } from './networkUtils';
import freightAxiosInstance from '../config/freightAxios';
import { normalizeRoutePagesFromApi, validateRoutePageForDb, RawApiRoutePage } from './apiDataNormalizer';

/**
 * LEGACY DATA MANAGER - DEPRECATED
 * 
 * This file is kept for backward compatibility and route pages functionality only.
 * For new features, use offlineDataManagerExtended.ts
 * 
 * Storage: SQLite (aplikācijas dati)
 * Scope: Route pages management only
 */

// Data manager for route pages (legacy support)
class OfflineDataManager {
  
  // ==================== ROUTE PAGES ====================
  
  // Get route pages for a truck route
  async getRoutePages(truckRouteId?: number): Promise<RoutePage[]> {
    try {
      if (Platform.OS === 'web') {
        return await this.getRoutePagesWeb(truckRouteId);
      } else {
        return await this.getRoutePagesMobile(truckRouteId);
      }
    } catch (error) {
      console.error('Failed to get route pages:', error);
      return [];
    }
  }

  private async getRoutePagesWeb(truckRouteId?: number): Promise<RoutePage[]> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const endpoint = truckRouteId ? `/route-pages?truckRouteId=${truckRouteId}` : '/route-pages';
        const response = await freightAxiosInstance.get<RawApiRoutePage[]>(endpoint);
        
        // Normalize the data using the centralised normalizer
        console.log('🔄 [WEB] Normalizing server data for web...');
        const normalizedData = normalizeRoutePagesFromApi(response.data);
        console.log('🔄 [WEB] Normalized', normalizedData.length, 'pages for web');
        
        // Cache the normalized data
        const cacheKey = truckRouteId ? `cached_route_pages_${truckRouteId}` : 'cached_route_pages';
        await AsyncStorage.setItem(cacheKey, JSON.stringify(normalizedData));
        return normalizedData;
      } catch (error) {
        console.log('🔄 [WEB] Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cacheKey = truckRouteId ? `cached_route_pages_${truckRouteId}` : 'cached_route_pages';
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to load cached route pages:', error);
      return [];
    }
  }

  private async getRoutePagesMobile(truckRouteId?: number): Promise<RoutePage[]> {
    let sql = `
      SELECT * FROM route_pages 
      WHERE is_deleted = 0
    `;
    const params: any[] = [];

    if (truckRouteId) {
      sql += ` AND truck_route_id = ?`;
      params.push(truckRouteId);
    }

    sql += ` ORDER BY created_at DESC`;

    console.log('🔍 [DEBUG] Executing SQL query for route pages:', sql, 'with params:', params);
    const result = await executeSelect(sql, params);
    console.log('🔍 [DEBUG] Route pages query result:', result.length, 'rows found');
    console.log('🔍 [DEBUG] First few results:', result.slice(0, 3));
    
    return result;
  }

  // Create route page
  async createRoutePage(pageData: Omit<RoutePage, 'id' | 'created_at' | 'updated_at'>): Promise<RoutePage> {
    const page: RoutePage = {
      ...pageData,
      id: Platform.OS === 'web' ? Date.now() : undefined,
      is_dirty: 1,
      is_deleted: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    try {
      if (Platform.OS === 'web') {
        return await this.createRoutePageWeb(page);
      } else {
        return await this.createRoutePageMobile(page);
      }
    } catch (error) {
      console.error('Failed to create route page:', error);
      throw error;
    }
  }

  private async createRoutePageWeb(page: RoutePage): Promise<RoutePage> {
    // Store locally first
    const cacheKey = page.truck_route_id ? `cached_route_pages_${page.truck_route_id}` : 'cached_route_pages';
    const cached = await AsyncStorage.getItem(cacheKey);
    const pages: RoutePage[] = cached ? JSON.parse(cached) : [];
    pages.unshift(page);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(pages));

    // Add to offline queue
    await addOfflineOperation('CREATE', 'route_pages', '/route-pages', page);

    return page;
  }

  private async createRoutePageMobile(page: RoutePage): Promise<RoutePage> {
    const sql = `
      INSERT INTO route_pages 
      (truck_route_id, truck_route_server_id, date_from, date_to, truck_registration_number, 
       fuel_consumption_norm, fuel_balance_at_start, total_fuel_received_on_routes, 
       total_fuel_consumed_on_routes, fuel_balance_at_routes_finish, odometer_at_route_start, 
       odometer_at_route_finish, computed_total_routes_length, is_dirty, is_deleted, 
       created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(sql, [
      page.truck_route_id || null,
      page.truck_route_server_id || null,
      page.date_from,
      page.date_to,
      page.truck_registration_number,
      page.fuel_consumption_norm,
      page.fuel_balance_at_start,
      page.total_fuel_received_on_routes || null,
      page.total_fuel_consumed_on_routes || null,
      page.fuel_balance_at_routes_finish || null,
      page.odometer_at_route_start || null,
      page.odometer_at_route_finish || null,
      page.computed_total_routes_length || null,
      1, // is_dirty
      0, // is_deleted
      Date.now(),
      Date.now()
    ]);

    const createdPage = { ...page, id: result.lastInsertRowId };

    // Add to offline queue
    await addOfflineOperation('CREATE', 'route_pages', '/route-pages', createdPage);

    return createdPage;
  }

  // ==================== SYNC OPERATIONS ====================

  // Sync route pages when online
  async syncRoutePages(): Promise<void> {
    console.log('🔄 [DEBUG] syncRoutePages called');
    
    const connected = await isConnected();
    if (!connected) {
      console.log('🔄 [DEBUG] Device is offline, cannot sync route pages');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('🔄 [DEBUG] Web platform detected, skipping SQLite sync');
      return; // Skip for web
    }

    try {
      console.log('🔄 [DEBUG] Fetching route pages from server...');
      const response = await freightAxiosInstance.get<RawApiRoutePage[]>('/route-pages');
      const rawServerPages = response.data;
      console.log('🔄 [DEBUG] Server response:', rawServerPages.length, 'raw route pages received');
      console.log('🔄 [DEBUG] First few raw server pages:', rawServerPages.slice(0, 3));

      // Normalize the data using the centralised normalizer
      console.log('🔄 [DEBUG] Normalizing server data...');
      const normalizedPages = normalizeRoutePagesFromApi(rawServerPages);
      console.log('🔄 [DEBUG] Normalized pages:', normalizedPages.length, 'valid pages after normalization');

      if (normalizedPages.length === 0) {
        console.warn('🔄 [WARN] No valid pages after normalization - skipping database update');
        return;
      }

      await executeTransaction(async (db) => {
        console.log('🔄 [DEBUG] Starting database transaction...');
        
        // Clear existing server data
        console.log('🔄 [DEBUG] Clearing existing server data...');
        await db.runAsync('DELETE FROM route_pages WHERE server_id IS NOT NULL AND is_dirty = 0');

        // Insert normalized data
        console.log('🔄 [DEBUG] Inserting', normalizedPages.length, 'normalized pages into database...');
        for (const page of normalizedPages) {
          // Additional validation before database insertion
          if (!validateRoutePageForDb(page)) {
            console.warn('🔄 [WARN] Skipping invalid page during database insertion:', page);
            continue;
          }

          console.log('🔄 [DEBUG] Inserting page:', page.id, page.truck_registration_number);
          await db.runAsync(`
            INSERT OR REPLACE INTO route_pages 
            (server_id, truck_route_server_id, date_from, date_to, truck_registration_number, 
             fuel_consumption_norm, fuel_balance_at_start, total_fuel_received_on_routes, 
             total_fuel_consumed_on_routes, fuel_balance_at_routes_finish, odometer_at_route_start, 
             odometer_at_route_finish, computed_total_routes_length, is_dirty, is_deleted, synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
          `, [
            page.server_id || null,
            page.truck_route_server_id || null,
            page.date_from,
            page.date_to,
            page.truck_registration_number,
            page.fuel_consumption_norm,
            page.fuel_balance_at_start,
            page.total_fuel_received_on_routes || null,
            page.total_fuel_consumed_on_routes || null,
            page.fuel_balance_at_routes_finish || null,
            page.odometer_at_route_start || null,
            page.odometer_at_route_finish || null,
            page.computed_total_routes_length || null,
            Date.now()
          ]);
        }
        
        console.log('🔄 [DEBUG] Database transaction completed successfully');
      });

      console.log(`🔄 [DEBUG] Successfully synced ${normalizedPages.length} route pages from server`);
    } catch (error) {
      console.error('🔄 [ERROR] Failed to sync route pages:', error);
      console.error('🔄 [ERROR] Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}

// Export singleton instance
export const offlineDataManager = new OfflineDataManager();

// Convenience functions for route pages only
export const getRoutePages = (truckRouteId?: number) => offlineDataManager.getRoutePages(truckRouteId);
export const createRoutePage = (data: Omit<RoutePage, 'id' | 'created_at' | 'updated_at'>) => 
  offlineDataManager.createRoutePage(data);
export const syncRoutePages = () => offlineDataManager.syncRoutePages();

// DEPRECATED EXPORTS - Use offlineDataManagerExtended.ts instead
// These are kept for backward compatibility only
console.warn('offlineDataManager.ts is deprecated for new features. Use offlineDataManagerExtended.ts instead.');
