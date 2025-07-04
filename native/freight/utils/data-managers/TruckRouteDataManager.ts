import {TruckRouteDto} from '@/dto/TruckRouteDto'
import {isOfflineMode} from '@/services/offlineService'
import uuid from 'react-native-uuid'
import {executeQuery, executeSelect, executeSelectFirst, executeTransaction} from '../database'
import {addOfflineOperation} from '../offlineQueue'
import {PlatformDataAdapter} from './PlatformDataAdapter'
import {SQLQueryBuilder} from './SQLQueryBuilder'

type SQLiteDatabase = any

/**
 * Manages truck route data operations
 * Handles downloading, storing, and retrieving truck route information
 */
export class TruckRouteDataManager {

	/**
	 * Download truck routes from server and store in local database
	 */
	async downloadTruckRoutes(db?: SQLiteDatabase): Promise<void> {
		if (PlatformDataAdapter.shouldSkipForWeb()) {
			return
		}

		if (await isOfflineMode()) {
			PlatformDataAdapter.logPlatformInfo('downloadTruckRoutes', 'Skipped - offline mode')
			return
		}

		try {
			PlatformDataAdapter.logPlatformInfo('downloadTruckRoutes', 'Starting download')

			const serverTruckRoutes = await PlatformDataAdapter.fetchFromServer<any>('/truck-routes')

			if (!Array.isArray(serverTruckRoutes) || serverTruckRoutes.length === 0) {
				PlatformDataAdapter.logPlatformInfo('downloadTruckRoutes', 'No truck routes received from server')
				return
			}

			// Clear existing synced truck routes
			await executeQuery(SQLQueryBuilder.getDeleteSyncedTruckRoutesSQL())

			const insertSQL = SQLQueryBuilder.getInsertTruckRouteSQL()

			if (db) {
				await executeTransaction(async (database) => {
					for (const route of serverTruckRoutes) {
						if (!route.uid) {
							continue
						}

						await database.runAsync(insertSQL, [route.uid, route.truckRoutePage?.uid || null, route.routeDate, route.routeNumber || null, route.cargoVolume || 0, route.outTruckObject?.uid || null, route.odometerAtStart || 0, route.outDateTime, route.odometerAtFinish || null, route.inTruckObject?.uid || null, route.inDateTime || null, route.routeLength || null, route.fuelBalanceAtStart || null, route.fuelConsumed || null, route.fuelReceived || null, route.fuelBalanceAtFinish || null, route.createdDateTime || null, route.lastModifiedDateTime || null, route.unitTypeId || null, Date.now()])
					}
				})
			} else {
				for (const route of serverTruckRoutes) {
					if (!route.uid) {
						continue
					}

					await executeQuery(insertSQL, [route.uid, route.truckRoutePage?.uid || null, route.routeDate, route.routeNumber || null, route.cargoVolume || 0, route.outTruckObject?.uid || null, route.odometerAtStart || 0, route.outDateTime, route.odometerAtFinish || null, route.inTruckObject?.uid || null, route.inDateTime || null, route.routeLength || null, route.fuelBalanceAtStart || null, route.fuelConsumed || null, route.fuelReceived || null, route.fuelBalanceAtFinish || null, route.createdDateTime || null, route.lastModifiedDateTime || null, route.unitTypeId || null, Date.now()])
				}
			}

			PlatformDataAdapter.logPlatformInfo('downloadTruckRoutes', `Downloaded ${serverTruckRoutes.length} truck routes`)

		} catch (error: any) {
			PlatformDataAdapter.logPlatformInfo('downloadTruckRoutes', `Error: ${error.message}`)
			if (error.response?.status !== 404) {
				PlatformDataAdapter.handleServerError(error)
			}
		}
	}

	/**
	 * Get truck routes with platform-specific handling
	 */
	async getTruckRoutes(truckRoutePageUid?: string): Promise<any[]> {
		try {
			if (PlatformDataAdapter.isWeb()) {
				return await this.getTruckRoutesWeb(truckRoutePageUid)
			} else {
				return await this.getTruckRoutesMobile(truckRoutePageUid)
			}
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('getTruckRoutes', `Error: ${error}`)
			return []
		}
	}

	/**
	 * Get truck routes for web platform
	 */
	private async getTruckRoutesWeb(truckRoutePageUid?: string): Promise<any[]> {
		try {
			const endpoint = truckRoutePageUid ? `/truck-routes?truckRoutePageUid=${truckRoutePageUid}` : '/truck-routes'
			return await PlatformDataAdapter.fetchFromServer<any>(endpoint)
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('getTruckRoutesWeb', `Error: ${error}`)
			return []
		}
	}

	/**
	 * Get truck routes for mobile platform from local database
	 */
	private async getTruckRoutesMobile(truckRoutePageUid?: string): Promise<any[]> {
		let sql = SQLQueryBuilder.getSelectTruckRoutesSQL()
		const params: any[] = []

		if (truckRoutePageUid) {
			sql += ` AND tr.truck_route_page_uid = ?`
			params.push(truckRoutePageUid)
		}

		sql += ` ORDER BY tr.out_date_time DESC`

		const result = await executeSelect(sql, params)
		return Array.isArray(result) ? result : []
	}

	/**
	 * Save truck route (start or end route)
	 */
	async saveTruckRoute(type: 'startRoute' | 'endRoute', data: TruckRouteDto,
			saveTruckRoutePage: (routePage: any) => Promise<string>): Promise<string> {

		// Ensure UID exists
		if (!data.uid) {
			data.uid = uuid.v4().toString();
		}
		
		const uid = data.uid;

		// Save truck route page first
		const truckRoutePageUid = await saveTruckRoutePage(data.truckRoutePage)

		// NAV nepieciešams addOfflineOperation šeit - tas notiek useTruckRoute.ts

		try {
			if (type === 'startRoute') {
				const insertSQL = SQLQueryBuilder.getInsertTruckRouteSQL()
				await executeQuery(insertSQL, [uid, truckRoutePageUid, data.routeDate, null, data.cargoVolume || 0, data.outTruckObject?.uid, data.odometerAtStart, data.outDateTime, null, null, null, null, data.fuelBalanceAtStart, null, data.fuelReceived || null, null, null, null, data.unitType, Date.now()])
			} else {
				await executeQuery(SQLQueryBuilder.getUpdateTruckRouteEndSQL(), [data.inTruckObject?.uid, data.odometerAtFinish, data.inDateTime, (data.odometerAtFinish || 0) - (data.odometerAtStart || 0), data.fuelBalanceAtFinish, uid])
			}

			console.log(`💾 Saved ${type} locally with UID: ${uid}`)
		} catch (error) {
			console.error(`❌ Failed to save ${type} locally:`, error)
			throw error
		}

		return uid
	}

	/**
	 * Get last active route
	 */
	async getLastActiveRoute(): Promise<any | null> {
		try {
			if (PlatformDataAdapter.isWeb()) {
				return await this.getLastActiveRouteWeb()
			} else {
				return await this.getLastActiveRouteMobile()
			}
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('getLastActiveRoute', `Error: ${error}`)
			return null
		}
	}

	/**
	 * Get last active route for web platform
	 */
	private async getLastActiveRouteWeb(): Promise<any | null> {
		try {
			return await PlatformDataAdapter.fetchSingleFromServer<any>('/truck-routes/last-active')
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null
			}
			PlatformDataAdapter.logPlatformInfo('getLastActiveRouteWeb', `Error: ${error}`)
			return null
		}
	}

	/**
	 * Get last active route for mobile platform from local database
	 */
	private async getLastActiveRouteMobile(): Promise<any | null> {
		const result = await executeSelectFirst(SQLQueryBuilder.getSelectLastActiveRouteSQL())
		return result
	}

	/**
	 * Get last finished route
	 */
	async getLastFinishedRoute(): Promise<any | null> {
		try {
			if (PlatformDataAdapter.isWeb()) {
				return await this.getLastFinishedRouteWeb()
			} else {
				return await this.getLastFinishedRouteMobile()
			}
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('getLastFinishedRoute', `Error: ${error}`)
			return null
		}
	}

	/**
	 * Get last finished route for web platform
	 */
	private async getLastFinishedRouteWeb(): Promise<any | null> {
		try {
			return await PlatformDataAdapter.fetchSingleFromServer<any>('/truck-routes/last-finished')
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null
			}
			PlatformDataAdapter.logPlatformInfo('getLastFinishedRouteWeb', `Error: ${error}`)
			return null
		}
	}

	/**
	 * Get last finished route for mobile platform from local database
	 */
	private async getLastFinishedRouteMobile(): Promise<any | null> {
		return await executeSelectFirst(SQLQueryBuilder.getSelectLastFinishedRouteSQL())
	}

	/**
	 * Get route point (START or FINISH based on active route)
	 */
	async getRoutePoint(): Promise<string> {
		const lastActiveRoute = await this.getLastActiveRoute()
		return lastActiveRoute ? 'FINISH' : 'START'
	}
}
