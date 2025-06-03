import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery, executeSelect, executeSelectFirst } from './database';
import { Truck, TruckObject } from './databaseExtended';
import { addOfflineOperation } from './offlineQueue';
import { isConnected } from './networkUtils';
import freightAxiosInstance from '../config/freightAxios';

// Extended data manager for trucks, objects, and active routes
class OfflineDataManagerExtended {
  
  // ==================== TRUCKS ====================

  // Get all trucks (offline-first)
  async getTrucks(): Promise<Truck[]> {
    try {
      if (Platform.OS === 'web') {
        return await this.getTrucksWeb();
      } else {
        return await this.getTrucksMobile();
      }
    } catch (error) {
      console.error('Failed to get trucks:', error);
      return [];
    }
  }

  private async getTrucksWeb(): Promise<Truck[]> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get<Truck[]>('/trucks');
        await AsyncStorage.setItem('cached_trucks', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.log('Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cached = await AsyncStorage.getItem('cached_trucks');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to load cached trucks:', error);
      return [];
    }
  }

  private async getTrucksMobile(): Promise<Truck[]> {
    const sql = `
      SELECT * FROM trucks 
      WHERE is_deleted = 0 
      ORDER BY registration_number ASC
    `;
    return await executeSelect(sql);
  }

  // ==================== OBJECTS ====================

  // Get all objects (offline-first)
  async getObjects(): Promise<TruckObject[]> {
    try {
      if (Platform.OS === 'web') {
        return await this.getObjectsWeb();
      } else {
        return await this.getObjectsMobile();
      }
    } catch (error) {
      console.error('Failed to get objects:', error);
      return [];
    }
  }

  private async getObjectsWeb(): Promise<TruckObject[]> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get<TruckObject[]>('/objects');
        await AsyncStorage.setItem('cached_objects', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.log('Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cached = await AsyncStorage.getItem('cached_objects');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to load cached objects:', error);
      return [];
    }
  }

  private async getObjectsMobile(): Promise<TruckObject[]> {
    const sql = `
      SELECT * FROM objects 
      WHERE is_deleted = 0 
      ORDER BY name ASC
    `;
    return await executeSelect(sql);
  }

  // Create object (offline-first)
  async createObject(objectData: Omit<TruckObject, 'id' | 'created_at' | 'updated_at'>): Promise<TruckObject> {
    const object: TruckObject = {
      ...objectData,
      id: Platform.OS === 'web' ? Date.now() : undefined,
      is_dirty: 1,
      is_deleted: 0,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    try {
      if (Platform.OS === 'web') {
        return await this.createObjectWeb(object);
      } else {
        return await this.createObjectMobile(object);
      }
    } catch (error) {
      console.error('Failed to create object:', error);
      throw error;
    }
  }

  private async createObjectWeb(object: TruckObject): Promise<TruckObject> {
    // Store locally first
    const cached = await AsyncStorage.getItem('cached_objects');
    const objects: TruckObject[] = cached ? JSON.parse(cached) : [];
    objects.unshift(object);
    await AsyncStorage.setItem('cached_objects', JSON.stringify(objects));

    // Add to offline queue
    await addOfflineOperation('CREATE', 'objects', '/objects', object);

    return object;
  }

  private async createObjectMobile(object: TruckObject): Promise<TruckObject> {
    const sql = `
      INSERT INTO objects 
      (name, type, is_dirty, is_deleted, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(sql, [
      object.name,
      object.type || null,
      1, // is_dirty
      0, // is_deleted
      Date.now(),
      Date.now()
    ]);

    const createdObject = { ...object, id: result.lastInsertRowId };

    // Add to offline queue
    await addOfflineOperation('CREATE', 'objects', '/objects', createdObject);

    return createdObject;
  }

  // ==================== ACTIVE ROUTES ====================

  // Get last active route
  async getLastActiveRoute(): Promise<any | null> {
    try {
      if (Platform.OS === 'web') {
        return await this.getLastActiveRouteWeb();
      } else {
        return await this.getLastActiveRouteMobile();
      }
    } catch (error) {
      console.error('Failed to get last active route:', error);
      return null;
    }
  }

  private async getLastActiveRouteWeb(): Promise<any | null> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get('/truck-routes/last-active');
        await AsyncStorage.setItem('cached_last_active_route', JSON.stringify(response.data));
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          await AsyncStorage.removeItem('cached_last_active_route');
          return null;
        }
        console.log('Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cached = await AsyncStorage.getItem('cached_last_active_route');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to load cached last active route:', error);
      return null;
    }
  }

  private async getLastActiveRouteMobile(): Promise<any | null> {
    const sql = `
      SELECT * FROM active_routes 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await executeSelectFirst(sql);
    return result ? JSON.parse(result.route_data) : null;
  }

  // Get last finished route
  async getLastFinishedRoute(): Promise<any | null> {
    try {
      if (Platform.OS === 'web') {
        return await this.getLastFinishedRouteWeb();
      } else {
        return await this.getLastFinishedRouteMobile();
      }
    } catch (error) {
      console.error('Failed to get last finished route:', error);
      return null;
    }
  }

  private async getLastFinishedRouteWeb(): Promise<any | null> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get('/truck-routes?pageSize=1');
        const lastRoute = response.data.content?.[0] || null;
        if (lastRoute) {
          await AsyncStorage.setItem('cached_last_finished_route', JSON.stringify(lastRoute));
        }
        return lastRoute;
      } catch (error) {
        console.log('Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cached = await AsyncStorage.getItem('cached_last_finished_route');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to load cached last finished route:', error);
      return null;
    }
  }

  private async getLastFinishedRouteMobile(): Promise<any | null> {
    const sql = `
      SELECT * FROM truck_routes 
      WHERE is_deleted = 0 
      ORDER BY updated_at DESC 
      LIMIT 1
    `;
    return await executeSelectFirst(sql);
  }

  // Set active route
  async setActiveRoute(routeData: any): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await this.setActiveRouteWeb(routeData);
      } else {
        await this.setActiveRouteMobile(routeData);
      }
    } catch (error) {
      console.error('Failed to set active route:', error);
      throw error;
    }
  }

  private async setActiveRouteWeb(routeData: any): Promise<void> {
    await AsyncStorage.setItem('cached_last_active_route', JSON.stringify(routeData));
  }

  private async setActiveRouteMobile(routeData: any): Promise<void> {
    // Deactivate all existing routes
    await executeQuery('UPDATE active_routes SET is_active = 0');
    
    // Insert new active route
    const sql = `
      INSERT INTO active_routes (route_data, is_active, created_at, updated_at)
      VALUES (?, 1, ?, ?)
    `;
    
    await executeQuery(sql, [
      JSON.stringify(routeData),
      Date.now(),
      Date.now()
    ]);
  }

  // Clear active route
  async clearActiveRoute(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('cached_last_active_route');
      } else {
        await executeQuery('UPDATE active_routes SET is_active = 0');
      }
    } catch (error) {
      console.error('Failed to clear active route:', error);
      throw error;
    }
  }

  // Check route page exists
  async checkRoutePageExists(truckId: string, routeDate: string): Promise<any | null> {
    try {
      if (Platform.OS === 'web') {
        return await this.checkRoutePageExistsWeb(truckId, routeDate);
      } else {
        return await this.checkRoutePageExistsMobile(truckId, routeDate);
      }
    } catch (error) {
      console.error('Failed to check route page exists:', error);
      return null;
    }
  }

  private async checkRoutePageExistsWeb(truckId: string, routeDate: string): Promise<any | null> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get(`/route-pages/exists?truckId=${truckId}&routeDate=${routeDate}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        console.log('Online check failed');
      }
    }
    
    // For offline, we can't really check server data, so return null
    return null;
  }

  private async checkRoutePageExistsMobile(truckId: string, routeDate: string): Promise<any | null> {
    const sql = `
      SELECT * FROM route_pages 
      WHERE truck_registration_number = ? AND date_from <= ? AND date_to >= ? AND is_deleted = 0
      LIMIT 1
    `;
    return await executeSelectFirst(sql, [truckId, routeDate, routeDate]);
  }
}

// Export singleton instance
export const offlineDataManagerExtended = new OfflineDataManagerExtended();

// Convenience functions
export const getTrucks = () => offlineDataManagerExtended.getTrucks();
export const getObjects = () => offlineDataManagerExtended.getObjects();
export const createObject = (data: Omit<TruckObject, 'id' | 'created_at' | 'updated_at'>) => 
  offlineDataManagerExtended.createObject(data);

export const getLastActiveRoute = () => offlineDataManagerExtended.getLastActiveRoute();
export const getLastFinishedRoute = () => offlineDataManagerExtended.getLastFinishedRoute();
export const setActiveRoute = (routeData: any) => offlineDataManagerExtended.setActiveRoute(routeData);
export const clearActiveRoute = () => offlineDataManagerExtended.clearActiveRoute();
export const checkRoutePageExists = (truckId: string, routeDate: string) => 
  offlineDataManagerExtended.checkRoutePageExists(truckId, routeDate);
