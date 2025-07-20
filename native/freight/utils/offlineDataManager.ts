/**
 * Offline data management utilities
 * Handles local saving of truck routes and related data
 * Maintains backward compatibility with existing imports
 */

import uuid from 'react-native-uuid';
import { TruckRouteDto } from '@/dto/TruckRouteDto'
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto'
import { TruckDto } from '@/dto/TruckDto'
import { TruckDataManager } from './data-managers/TruckDataManager'
import { TruckObjectDataManager } from './data-managers/TruckObjectDataManager'
import { TruckRouteDataManager } from './data-managers/TruckRouteDataManager'
import { RoutePageDataManager } from './data-managers/RoutePageDataManager'
import { PlatformDataAdapter } from './data-managers/PlatformDataAdapter'

type SQLiteDatabase = any

/**
 * Offline Data Manager
 * Coordinates all specialized data managers
 * Provides a clean interface for offline data operations
 */
class OfflineDataManager {
  private truckManager: TruckDataManager
  private truckObjectManager: TruckObjectDataManager
  private truckRouteManager: TruckRouteDataManager
  private routePageManager: RoutePageDataManager

  constructor() {
    this.truckManager = new TruckDataManager()
    this.truckObjectManager = new TruckObjectDataManager()
    this.truckRouteManager = new TruckRouteDataManager()
    this.routePageManager = new RoutePageDataManager()
  }

  // Truck operations
  async downloadTrucks(db?: SQLiteDatabase): Promise<void> {
    return this.truckManager.downloadTrucks(db)
  }

  async getTrucks(): Promise<TruckDto[]> {
    return this.truckManager.getTrucks()
  }

  async getTruckById(truckId: string): Promise<TruckDto | null> {
    return this.truckManager.getTruckById(truckId)
  }

  // Truck Object operations
  async downloadObjects(db?: SQLiteDatabase): Promise<void> {
    return this.truckObjectManager.downloadObjects(db)
  }

  async getObjects(): Promise<any[]> {
    return this.truckObjectManager.getObjects()
  }

  // Truck Route operations
  async downloadTruckRoutes(db?: SQLiteDatabase): Promise<void> {
    return this.truckRouteManager.downloadTruckRoutes(db)
  }

  async getTruckRoutes(truckRoutePageUid?: string): Promise<any[]> {
    return this.truckRouteManager.getTruckRoutes(truckRoutePageUid)
  }

  /**
   * Save truck route locally with UUID generation
   * Enhanced version that ensures UID exists and handles route page saving
   */
  async saveTruckRouteLocally(
      type: 'startRoute' | 'endRoute',
      routeData: TruckRouteDto
  ): Promise<string> {
      // Ensure UID exists
      if (!routeData.uid) {
          routeData.uid = uuid.v4().toString();
      }
      
      // Update route page odometer for end route
      if (routeData.truckRoutePage) {
          if (type === 'endRoute') {
              routeData.truckRoutePage.odometerAtRouteFinish = routeData.odometerAtFinish
          }
      }
      
      try {
          // Create mock saveTruckRoutePage function that handles route page locally
          const saveTruckRoutePage = async (routePage: any): Promise<string> => {
              if (!routePage) {
                  throw new Error('Route page is required');
              }
              
              if (!routePage.uid) {
                  routePage.uid = uuid.v4().toString();
              }

              // Save route page locally using existing data manager
              await this.routePageManager.saveRoutePageToDatabase(routePage);
              return routePage.uid;
          };
          
          const savedUid = await this.truckRouteManager.saveTruckRoute(
              type,
              routeData,
              saveTruckRoutePage
          );
          
          console.log(`💾 Saved ${type} locally with UID: ${savedUid}`);
          return savedUid;
      } catch (error) {
          console.error(`❌ Failed to save ${type} locally:`, error);
          throw error;
      }
  }

  /**
   * Save truck route (alias for saveTruckRouteLocally for backward compatibility)
   * @deprecated Use saveTruckRouteLocally instead
   */
  async saveTruckRoute(type: 'startRoute' | 'endRoute', data: TruckRouteDto): Promise<string> {
      return this.saveTruckRouteLocally(type, data);
  }

  async updateTruckRouteLocally(
      routeData: TruckRouteDto
  ): Promise<void> {
      if (!routeData.uid) {
          throw new Error('UID is required for updating truck route');
      }
      
      try {
          await this.saveTruckRouteLocally('endRoute', routeData);
          console.log(`💾 Updated truck route locally: ${routeData.uid}`);
      } catch (error) {
          console.error(`❌ Failed to update truck route locally:`, error);
          throw error;
      }
  }

  async getLastActiveRoute(): Promise<TruckRouteDto | null> {
    return this.truckRouteManager.getLastActiveRoute()
  }

  async getLastFinishedRoute(): Promise<any | null> {
    return this.truckRouteManager.getLastFinishedRoute()
  }

  async getRoutePoint(): Promise<string> {
    return this.truckRouteManager.getRoutePoint()
  }

  // Route Page operations
  async fetchRoutePagesFromServer(): Promise<TruckRoutePageDto[]> {
    return this.routePageManager.fetchRoutePagesFromServer()
  }

  async saveRoutePageToDatabase(routePageDto: TruckRoutePageDto): Promise<string> {
    return this.routePageManager.saveRoutePageToDatabase(routePageDto)
  }

  async saveRoutePagesToDatabase(routePageDtos: TruckRoutePageDto[]): Promise<string[]> {
    return this.routePageManager.saveRoutePagesToDatabase(routePageDtos)
  }

  async updateRoutePageInDatabase(routePageDto: TruckRoutePageDto): Promise<boolean> {
    return this.routePageManager.updateRoutePageInDatabase(routePageDto)
  }

  async saveOrUpdateRoutePage(routePageDto: TruckRoutePageDto, isUpdate: boolean = false): Promise<string> {
    return this.routePageManager.saveOrUpdateRoutePage(routePageDto, isUpdate)
  }

  async downloadRoutePages(): Promise<void> {
    return this.routePageManager.downloadRoutePages()
  }

  async saveTruckRoutePage(routePageDto: TruckRoutePageDto): Promise<string> {
    return this.routePageManager.saveTruckRoutePage(routePageDto)
  }

  async getRoutePages(): Promise<TruckRoutePageDto[]> {
    return this.routePageManager.getRoutePages()
  }

  async checkRoutePageExists(truckId: string, date: string): Promise<TruckRoutePageDto | null> {
    return this.routePageManager.checkRoutePageExists(truckId, date)
  }

  // Sync all data
  async syncAllData(): Promise<void> {
    try {
      PlatformDataAdapter.logPlatformInfo('syncAllData', 'Starting sync of all data')
      
      await Promise.all([
        this.downloadTrucks(),
        this.downloadObjects(),
        this.downloadRoutePages(),
        this.downloadTruckRoutes()
      ])

      PlatformDataAdapter.logPlatformInfo('syncAllData', 'Completed sync of all data')
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('syncAllData', `Error: ${error}`)
      throw error
    }
  }
}

// Create singleton instance
const offlineDataManagerInstance = new OfflineDataManager()

// Export the main offline data manager instance (backward compatibility)
export const offlineDataManager = offlineDataManagerInstance
export const offlineDataManagerRefactored = offlineDataManagerInstance

// Export individual functions for backward compatibility
export const downloadServerData = () => offlineDataManagerInstance.syncAllData()
export const getRoutePages = () => offlineDataManagerInstance.getRoutePages()
export const getTrucks = (): Promise<TruckDto[]> => offlineDataManagerInstance.getTrucks()
export const getObjects = () => offlineDataManagerInstance.getObjects()
export const getLastActiveRoute = () => offlineDataManagerInstance.getLastActiveRoute()
export const getLastFinishedRoute = () => offlineDataManagerInstance.getLastFinishedRoute()
export const checkRoutePageExists = (truckId: string, date: string): Promise<TruckRoutePageDto | null> => offlineDataManagerInstance.checkRoutePageExists(truckId, date)
export const getRoutePoint = () => offlineDataManagerInstance.getRoutePoint()

// Enhanced save functions with UUID generation
export const saveTruckRouteLocally = (type: 'startRoute' | 'endRoute', data: TruckRouteDto) => offlineDataManagerInstance.saveTruckRouteLocally(type, data)
export const updateTruckRouteLocally = (routeData: TruckRouteDto) => offlineDataManagerInstance.updateTruckRouteLocally(routeData)

// Backward compatibility exports
export const saveTruckRoute = (type: 'startRoute' | 'endRoute', data: TruckRouteDto) => offlineDataManagerInstance.saveTruckRoute(type, data)
