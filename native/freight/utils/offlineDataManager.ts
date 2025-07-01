import { TruckRouteDto } from '@/dto/TruckRouteDto'
import { TruckRoutePageDto } from '../dto/TruckRoutePageDto'
import { TruckDataManager } from './data-managers/TruckDataManager'
import { TruckObjectDataManager } from './data-managers/TruckObjectDataManager'
import { TruckRouteDataManager } from './data-managers/TruckRouteDataManager'
import { RoutePageDataManager } from './data-managers/RoutePageDataManager'

type SQLiteDatabase = any

/**
 * Centralized offline data manager using composition pattern
 * Delegates functionality to specialized data managers
 * Maintains backward compatibility with existing API
 */
class OfflineDataManager {
  private truckManager = new TruckDataManager()
  private truckObjectManager = new TruckObjectDataManager()
  private truckRouteManager = new TruckRouteDataManager()
  private routePageManager = new RoutePageDataManager()

  // Truck operations
  async downloadTrucks(db?: SQLiteDatabase): Promise<void> {
    return this.truckManager.downloadTrucks(db)
  }

  async getTrucks(): Promise<any[]> {
    return this.truckManager.getTrucks()
  }

  async getTruckById(truckId: string): Promise<any | null> {
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
      (routePage: any) => this.routePageManager.saveTruckRoutePage(routePage)
    )
  }

  async getLastActiveRoute(): Promise<any | null> {
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

  async checkRoutePageExists(truckId: string, date: string): Promise<any | null> {
    return this.routePageManager.checkRoutePageExists(truckId, date)
  }

  // Synchronization operations
  async syncAllData(): Promise<void> {
    try {
      await this.downloadTrucks()
      await this.downloadObjects()
      await this.downloadRoutePages()
      await this.downloadTruckRoutes()
    } catch (error) {
      throw error
    }
  }
}

export const offlineDataManager = new OfflineDataManager()

// Backward compatibility exports - maintain existing API
export const getRoutePages = () => offlineDataManager.getRoutePages()
export const downloadServerData = () => offlineDataManager.syncAllData()
export const getTrucks = () => offlineDataManager.getTrucks()
export const getObjects = () => offlineDataManager.getObjects()
export const getLastActiveRoute = () => offlineDataManager.getLastActiveRoute()
export const getLastFinishedRoute = () => offlineDataManager.getLastFinishedRoute()
export const checkRoutePageExists = (truckId: string, date: string) => offlineDataManager.checkRoutePageExists(truckId, date)
export const getRoutePoint = () => offlineDataManager.getRoutePoint()
export const saveTruckRouteLocally = (type: 'startRoute' | 'endRoute', data: TruckRouteDto) => offlineDataManager.saveTruckRoute(type, data)
