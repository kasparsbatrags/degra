import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery, executeSelect, executeSelectFirst, executeTransaction, RoutePage } from './database';
import { addOfflineOperation } from './offlineQueue';
import { isConnected } from './networkUtils';
import freightAxiosInstance from '../config/freightAxios';

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
        const response = await freightAxiosInstance.get<RoutePage[]>(endpoint);
        
        // Cache the data
        const cacheKey = truckRouteId ? `cached_route_pages_${truckRouteId}` : 'cached_route_pages';
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.log('Online fetch failed, trying cache');
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

    return await executeSelect(sql, params);
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
    const connected = await isConnected();
    if (!connected) {
      console.log('Device is offline, cannot sync route pages');
      return;
    }

    if (Platform.OS === 'web') return; // Skip for web

    try {
      const response = await freightAxiosInstance.get<RoutePage[]>('/route-pages');
      const serverPages = response.data;

      await executeTransaction(async (db) => {
        // Clear existing server data
        await db.runAsync('DELETE FROM route_pages WHERE server_id IS NOT NULL AND is_dirty = 0');

        // Insert server data
        for (const page of serverPages) {
          await db.runAsync(`
            INSERT OR REPLACE INTO route_pages 
            (server_id, truck_route_server_id, date_from, date_to, truck_registration_number, 
             fuel_consumption_norm, fuel_balance_at_start, total_fuel_received_on_routes, 
             total_fuel_consumed_on_routes, fuel_balance_at_routes_finish, odometer_at_route_start, 
             odometer_at_route_finish, computed_total_routes_length, is_dirty, is_deleted, synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
          `, [
            page.id || null,
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
      });

      console.log(`Synced ${serverPages.length} route pages from server`);
    } catch (error) {
      console.error('Failed to sync route pages:', error);
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
