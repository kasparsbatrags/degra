import { TruckRouteDto } from '@/dto/TruckRouteDto'
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto'
import { TruckDto } from '@/dto/TruckDto'
import {TruckRouteResponseDto} from '@/dto/TruckRouteResponseDto'
import { TruckDataManager } from './data-managers/TruckDataManager'
import { TruckObjectDataManager } from './data-managers/TruckObjectDataManager'
import { TruckRouteDataManager } from './data-managers/TruckRouteDataManager'
import { RoutePageDataManager } from './data-managers/RoutePageDataManager'
import { PlatformDataAdapter } from './data-managers/PlatformDataAdapter'

type SQLiteDatabase = any

/**
 * Refactored Offline Data Manager
 * Coordinates all specialized data managers
 * Provides a clean interface for offline data operations
 */
class OfflineDataManagerRefactored {
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

  async saveTruckRoute(type: 'startRoute' | 'endRoute', data: TruckRouteDto): Promise<string> {
    return this.truckRouteManager.saveTruckRoute(
      type, 
      data, 
      (routePage) => this.routePageManager.saveTruckRoutePage(routePage)
    )
  }

  async getLastActiveRoute(): Promise<TruckRouteResponseDto | null> {
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
export const offlineDataManagerRefactored = new OfflineDataManagerRefactored()

// Export convenience functions (maintaining backward compatibility)
export const getRoutePages = () => offlineDataManagerRefactored.getRoutePages()
export const downloadServerData = () => offlineDataManagerRefactored.syncAllData()
export const getTrucks = (): Promise<TruckDto[]> => offlineDataManagerRefactored.getTrucks()
export const getObjects = () => offlineDataManagerRefactored.getObjects()
export const getLastActiveRoute = () => offlineDataManagerRefactored.getLastActiveRoute()
export const getLastFinishedRoute = () => offlineDataManagerRefactored.getLastFinishedRoute()
export const checkRoutePageExists = (truckId: string, date: string): Promise<TruckRoutePageDto | null> => offlineDataManagerRefactored.checkRoutePageExists(truckId, date)
export const getRoutePoint = () => offlineDataManagerRefactored.getRoutePoint()
export const saveTruckRouteLocally = (type: 'startRoute' | 'endRoute', data: TruckRouteDto) => offlineDataManagerRefactored.saveTruckRoute(type, data)
