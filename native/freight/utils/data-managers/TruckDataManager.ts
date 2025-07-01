import { isOfflineMode } from '@/services/offlineService'
import { executeQuery, executeSelect, executeSelectFirst, executeTransaction } from '../database'
import { SQLQueryBuilder } from './SQLQueryBuilder'
import { PlatformDataAdapter } from './PlatformDataAdapter'

type SQLiteDatabase = any

/**
 * Manages truck data operations
 * Handles downloading, storing, and retrieving truck information
 */
export class TruckDataManager {

  /**
   * Download trucks from server and store in local database
   */
  async downloadTrucks(db?: SQLiteDatabase): Promise<void> {
    if (PlatformDataAdapter.shouldSkipForWeb()) {
      return
    }

    if (await isOfflineMode()) {
      PlatformDataAdapter.logPlatformInfo('downloadTrucks', 'Skipped - offline mode')
      return
    }

    try {
      PlatformDataAdapter.logPlatformInfo('downloadTrucks', 'Starting download')
      
      const serverTrucks = await PlatformDataAdapter.fetchFromServer<any>('/trucks')

      if (!Array.isArray(serverTrucks) || serverTrucks.length === 0) {
        PlatformDataAdapter.logPlatformInfo('downloadTrucks', 'No trucks received from server')
        return
      }

      // Clear existing synced trucks
      await executeQuery(SQLQueryBuilder.getDeleteSyncedTrucksSQL())

      const insertSQL = SQLQueryBuilder.getInsertTruckSQL()

      if (db) {
        await executeTransaction(async (database) => {
          for (const truck of serverTrucks) {
            if (!truck.uid) {
              continue
            }

            await database.runAsync(insertSQL, [
              truck.uid,
              truck.truckMaker || '',
              truck.truckModel || '',
              truck.registrationNumber || '',
              truck.fuelConsumptionNorm || 0,
              truck.isDefault ? 1 : 0,
              Date.now()
            ])
          }
        })
      } else {
        for (const truck of serverTrucks) {
          if (!truck.uid) {
            continue
          }

          await executeQuery(insertSQL, [
            truck.uid,
            truck.truckMaker || '',
            truck.truckModel || '',
            truck.registrationNumber || '',
            truck.fuelConsumptionNorm || 0,
            truck.isDefault ? 1 : 0,
            Date.now()
          ])
        }
      }

      PlatformDataAdapter.logPlatformInfo('downloadTrucks', `Downloaded ${serverTrucks.length} trucks`)

    } catch (error: any) {
      PlatformDataAdapter.logPlatformInfo('downloadTrucks', `Error: ${error.message}`)
      PlatformDataAdapter.handleServerError(error)
    }
  }

  /**
   * Get all trucks with platform-specific handling
   */
  async getTrucks(): Promise<any[]> {
    try {
      if (PlatformDataAdapter.isWeb()) {
        return await this.getTrucksWeb()
      } else {
        return await this.getTrucksMobile()
      }
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('getTrucks', `Error: ${error}`)
      return []
    }
  }

  /**
   * Get trucks for web platform
   */
  private async getTrucksWeb(): Promise<any[]> {
    try {
      return await PlatformDataAdapter.fetchFromServer<any>('/trucks')
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('getTrucksWeb', `Error: ${error}`)
      return []
    }
  }

  /**
   * Get trucks for mobile platform from local database
   */
  private async getTrucksMobile(): Promise<any[]> {
    const result = await executeSelect(SQLQueryBuilder.getSelectTrucksSQL())
    return Array.isArray(result) ? result : []
  }

  /**
   * Get truck by ID with platform-specific handling
   */
  async getTruckById(truckId: string): Promise<any | null> {
    try {
      if (PlatformDataAdapter.isWeb()) {
        return await this.getTruckByIdWeb(truckId)
      } else {
        return await this.getTruckByIdMobile(truckId)
      }
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('getTruckById', `Error: ${error}`)
      return null
    }
  }

  /**
   * Get truck by ID for web platform
   */
  private async getTruckByIdWeb(truckId: string): Promise<any | null> {
    try {
      return await PlatformDataAdapter.fetchSingleFromServer<any>(`/trucks/${truckId}`)
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('getTruckByIdWeb', `Error: ${error}`)
      return null
    }
  }

  /**
   * Get truck by ID for mobile platform from local database
   */
  private async getTruckByIdMobile(truckId: string): Promise<any | null> {
    const result = await executeSelectFirst(SQLQueryBuilder.getSelectTruckByIdSQL(), [truckId])
    return result || null
  }
}
