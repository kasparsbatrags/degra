import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isConnected } from './networkUtils';
import freightAxiosInstance from '../config/freightAxios';
import { getTrucks, getObjects } from './offlineDataManagerExtended';

// Generic dropdown data manager for offline-first dropdown operations
class DropdownDataManager {
  
  // Get dropdown data based on endpoint (offline-first)
  async getDropdownData(endpoint: string): Promise<any[]> {
    try {
      // Check if we have a specific offline handler for this endpoint
      const offlineData = await this.getOfflineDataForEndpoint(endpoint);
      if (offlineData) {
        console.log(`Using offline data for endpoint: ${endpoint}`);
        return offlineData;
      }

      // Fallback to hybrid approach
      if (Platform.OS === 'web') {
        return await this.getDropdownDataWeb(endpoint);
      } else {
        return await this.getDropdownDataMobile(endpoint);
      }
    } catch (error) {
      console.error(`Failed to get dropdown data for ${endpoint}:`, error);
      return [];
    }
  }

  // Check if we have specific offline handlers for known endpoints
  private async getOfflineDataForEndpoint(endpoint: string): Promise<any[] | null> {
    try {
      // Handle trucks endpoint
      if (endpoint.includes('/truck')) {
        const trucks = await getTrucks();
        console.log('Raw trucks data:', trucks);
        return trucks.map(truck => {
          // Handle both camelCase and snake_case field names
          const regNumber = truck.registrationNumber || truck.registration_number || '';
          const truckId = truck.uid || truck.id || 'N/A';
          
          return {
            // Always prioritize uid for backend compatibility
            uid: truckId,
            id: truckId, // For legacy compatibility
            // Standardize field names in both formats
            registrationNumber: regNumber,
            registration_number: regNumber,
            truckModel: truck.truckModel || truck.truck_model || '',
            truckMaker: truck.truckMaker || truck.truck_maker || '',
            fuelConsumptionNorm: truck.fuelConsumptionNorm || truck.fuel_consumption_norm || 0,
            isDefault: truck.isDefault || truck.is_default || false,
            // Set name for display in dropdowns
            name: regNumber || `${truck.truckMaker || truck.truck_maker || ''} ${truck.truckModel || truck.truck_model || ''}`.trim() || `Auto ${truckId}`,
            model: truck.truckModel || truck.truck_model || ''
          };
        });
      }

      // Handle objects endpoint
      if (endpoint.includes('/objects')) {
        const objects = await getObjects();
        // Filter unique by uid
        const unique = new Map();
        for (const obj of objects) {
          const uid = String(obj.uid || '');
          if (!unique.has(uid)) {
            unique.set(uid, {
              id: uid,
              uid: obj.uid,
              name: obj.name,
            });
          }
        }
        return Array.from(unique.values());
      }

      // Handle cargo types (static data)
      if (endpoint.includes('/cargo-types') || endpoint.includes('/cargoTypes')) {
        return [
          { id: '1', name: 'Konteiners' },
          { id: '2', name: 'Paletes' },
          { id: '3', name: 'Beramkrāva' },
          { id: '4', name: 'Šķidrums' },
          { id: '5', name: 'Cits' }
        ];
      }

      // Handle unit types (static data)
      if (endpoint.includes('/unit-types') || endpoint.includes('/unitTypes')) {
        return [
          { id: 'kg', name: 'Kilogrami (kg)' },
          { id: 't', name: 'Tonnas (t)' },
          { id: 'm3', name: 'Kubikmetri (m³)' },
          { id: 'l', name: 'Litri (l)' },
          { id: 'gab', name: 'Gabali (gab.)' }
        ];
      }

      return null; // No specific offline handler
    } catch (error) {
      console.error('Error in offline data handler:', error);
      return null;
    }
  }

  private async getDropdownDataWeb(endpoint: string): Promise<any[]> {
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get(endpoint);
        // Cache the data
        const cacheKey = `dropdown_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.log('Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cacheKey = `dropdown_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to load cached dropdown data:', error);
      return [];
    }
  }

  private async getDropdownDataMobile(endpoint: string): Promise<any[]> {
    // For mobile, try online first, then fallback to cache
    const connected = await isConnected();
    
    if (connected) {
      try {
        const response = await freightAxiosInstance.get(endpoint);
        // Cache the data
        const cacheKey = `dropdown_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.log('Online fetch failed, trying cache');
      }
    }
    
    // Fallback to cache
    try {
      const cacheKey = `dropdown_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to load cached dropdown data:', error);
      return [];
    }
  }

  // Clear dropdown cache
  async clearDropdownCache(endpoint?: string): Promise<void> {
    try {
      if (endpoint) {
        const cacheKey = `dropdown_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await AsyncStorage.removeItem(cacheKey);
      } else {
        // Clear all dropdown caches
        const keys = await AsyncStorage.getAllKeys();
        const dropdownKeys = keys.filter(key => key.startsWith('dropdown_cache_'));
        await AsyncStorage.multiRemove(dropdownKeys);
      }
      console.log('Dropdown cache cleared');
    } catch (error) {
      console.error('Failed to clear dropdown cache:', error);
    }
  }

  // Refresh dropdown data
  async refreshDropdownData(endpoint: string): Promise<any[]> {
    try {
      // Clear cache first
      await this.clearDropdownCache(endpoint);
      
      // Fetch fresh data
      return await this.getDropdownData(endpoint);
    } catch (error) {
      console.error('Failed to refresh dropdown data:', error);
      return [];
    }
  }
}

// Export singleton instance
export const dropdownDataManager = new DropdownDataManager();

// Convenience functions
export const getDropdownData = (endpoint: string) => dropdownDataManager.getDropdownData(endpoint);
export const refreshDropdownData = (endpoint: string) => dropdownDataManager.refreshDropdownData(endpoint);
export const clearDropdownCache = (endpoint?: string) => dropdownDataManager.clearDropdownCache(endpoint);
