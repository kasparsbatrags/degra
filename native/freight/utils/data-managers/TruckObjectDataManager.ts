import { TruckObjectDto } from '@/dto/TruckObjectDto'
import { isOfflineMode } from '@/services/offlineService'
import { executeQuery, executeSelect, executeTransaction } from '../database'
import { SQLQueryBuilder } from './SQLQueryBuilder'
import { PlatformDataAdapter } from './PlatformDataAdapter'

type SQLiteDatabase = any

/**
 * Manages truck object data operations
 * Handles downloading, storing, and retrieving truck object information
 */
export class TruckObjectDataManager {

  /**
   * Download truck objects from server and store in local database
   */
  async downloadObjects(db?: SQLiteDatabase): Promise<void> {
    if (PlatformDataAdapter.shouldSkipForWeb()) {
      return
    }

    if (await isOfflineMode()) {
      PlatformDataAdapter.logPlatformInfo('downloadObjects', 'Skipped - offline mode')
      return
    }

    try {
      PlatformDataAdapter.logPlatformInfo('downloadObjects', 'Starting download')
      
      const serverObjects = await PlatformDataAdapter.fetchFromServer<TruckObjectDto>('/objects')

      if (!Array.isArray(serverObjects) || serverObjects.length === 0) {
        PlatformDataAdapter.logPlatformInfo('downloadObjects', 'No objects received from server')
        return
      }

      // Clear existing synced objects
      await executeQuery(SQLQueryBuilder.getDeleteSyncedObjectsSQL())

      const insertSQL = SQLQueryBuilder.getInsertObjectSQL()

      if (db) {
        await executeTransaction(async (database) => {
          for (const obj of serverObjects) {
            if (!obj.uid) {
              continue
            }

            await database.runAsync(insertSQL, [
              obj.uid,
              obj.name || '',
              Date.now()
            ])
          }
        })
      } else {
        for (const obj of serverObjects) {
          if (!obj.uid) {
            continue
          }

          await executeQuery(insertSQL, [
            obj.uid,
            obj.name || '',
            Date.now()
          ])
        }
      }

      PlatformDataAdapter.logPlatformInfo('downloadObjects', `Downloaded ${serverObjects.length} objects`)

    } catch (error: any) {
      PlatformDataAdapter.logPlatformInfo('downloadObjects', `Error: ${error.message}`)
      PlatformDataAdapter.handleServerError(error)
    }
  }

  /**
   * Get all truck objects with platform-specific handling
   */
  async getObjects(): Promise<any[]> {
    try {
      if (PlatformDataAdapter.isWeb()) {
        return await this.getObjectsWeb()
      } else {
        return await this.getObjectsMobile()
      }
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('getObjects', `Error: ${error}`)
      return []
    }
  }

  /**
   * Get truck objects for web platform
   */
  private async getObjectsWeb(): Promise<any[]> {
    try {
      return await PlatformDataAdapter.fetchFromServer<any>('/truck-objects')
    } catch (error) {
      PlatformDataAdapter.logPlatformInfo('getObjectsWeb', `Error: ${error}`)
      return []
    }
  }

  /**
   * Get truck objects for mobile platform from local database
   */
  private async getObjectsMobile(): Promise<any[]> {
    const result = await executeSelect(SQLQueryBuilder.getSelectObjectsSQL())
    return Array.isArray(result) ? result : []
  }
}
