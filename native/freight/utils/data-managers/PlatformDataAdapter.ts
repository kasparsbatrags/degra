import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import freightAxiosInstance from '../../config/freightAxios'
import { isOnline } from '../../services/networkService'

/**
 * Platform-specific data adapter
 * Handles differences between web and mobile platforms
 */
export class PlatformDataAdapter {
  
  /**
   * Check if current platform is web
   */
  static isWeb(): boolean {
    return Platform.OS === 'web'
  }

  /**
   * Check if current platform is mobile
   */
  static isMobile(): boolean {
    return Platform.OS !== 'web'
  }

  /**
   * Get data from server with platform-specific handling
   */
  static async fetchFromServer<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await freightAxiosInstance.get<T[]>(endpoint)
      return response.data || []
    } catch (error: any) {
      if (error.response?.status === 403) {
        const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
        throw new Error(userFriendlyMessage)
      }
      throw error
    }
  }

  /**
   * Get single item from server
   */
  static async fetchSingleFromServer<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await freightAxiosInstance.get<T>(endpoint)
      return response.data || null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      if (error.response?.status === 403) {
        const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
        throw new Error(userFriendlyMessage)
      }
      throw error
    }
  }

  /**
   * Cache data for web platform
   */
  static async cacheDataForWeb<T>(key: string, data: T[]): Promise<void> {
    if (this.isWeb()) {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(data))
        await AsyncStorage.setItem(`${key}_timestamp`, Date.now().toString())
      } catch (error) {
        console.error(`Failed to cache data for key ${key}:`, error)
      }
    }
  }

  /**
   * Get cached data for web platform
   */
  static async getCachedDataForWeb<T>(key: string): Promise<T[]> {
    if (this.isWeb()) {
      try {
        const cached = await AsyncStorage.getItem(key)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (error) {
        console.error(`Failed to get cached data for key ${key}:`, error)
      }
    }
    return []
  }

  /**
   * Get data with web caching fallback
   */
  static async getDataWithWebFallback<T>(
    endpoint: string,
    cacheKey: string,
    forceOffline: boolean = false
  ): Promise<T[]> {
    if (this.isWeb()) {
      const connected = await isOnline()
      
      if (connected && !forceOffline) {
        try {
          const data = await this.fetchFromServer<T>(endpoint)
          await this.cacheDataForWeb(cacheKey, data)
          return data
        } catch (error) {
          console.error(`Failed to fetch from server, falling back to cache:`, error)
        }
      }
      
      return await this.getCachedDataForWeb<T>(cacheKey)
    }
    
    // For mobile, this should not be called - mobile uses database
    throw new Error('getDataWithWebFallback should only be used on web platform')
  }

  /**
   * Handle server response errors consistently
   */
  static handleServerError(error: any): never {
    if (error.response?.status === 403) {
      const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
      throw new Error(userFriendlyMessage)
    } else if (error.response?.status === 404) {
      // For 404 errors, we might want to handle them differently
      throw error
    } else {
      throw error
    }
  }

  /**
   * Check if we should skip operation for web platform
   */
  static shouldSkipForWeb(): boolean {
    return this.isWeb()
  }

  /**
   * Log platform-specific information
   */
  static logPlatformInfo(operation: string, details?: any): void {
    const platform = this.isWeb() ? 'WEB' : 'MOBILE'
    console.log(`[${platform}] ${operation}`, details || '')
  }
}
