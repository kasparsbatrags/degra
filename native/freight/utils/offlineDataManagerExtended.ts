import {TruckObjectDto} from '@/dto/TruckObjectDto'
import {isOfflineMode} from '@/services/offlineService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Platform} from 'react-native'
import freightAxiosInstance from '../config/freightAxios'
import {TruckRoutePageDto} from '../dto/TruckRoutePageDto'
import {executeQuery, executeSelect, executeSelectFirst, executeTransaction} from './database'
import {isConnected} from './networkUtils'

// Type for SQLite database (to avoid import issues)
type SQLiteDatabase = any

// Simple ID generation without crypto dependencies
function generateOfflineId(): string {
	// Use timestamp + multiple random parts for better uniqueness
	const timestamp = Date.now().toString()
	const randomPart1 = Math.random().toString(36).substr(2, 9)
	const randomPart2 = Math.random().toString(36).substr(2, 5)
	return `offline-${timestamp}-${randomPart1}-${randomPart2}`
}

class OfflineDataManagerExtended {
	// ==================== TRUCKS ====================

	// Sync trucks from server to mobile database
	async downloadTrucks(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			console.log('Skipping truck sync on web platform')
			return
		}

		// Check if we're in offline mode (includes both network status and manual setting)
		if (await isOfflineMode()) {
			console.log('Device is offline or force offline mode, cannot sync trucks')
			return
		}

		try {
			console.log('Syncing trucks from server...')
			const {data: serverTrucks} = await freightAxiosInstance.get<any[]>('/trucks')

			if (!Array.isArray(serverTrucks) || serverTrucks.length === 0) {
				console.warn('No trucks received from server.')
				return
			}

			console.log(`Received ${serverTrucks.length} trucks from server`)

			// Clear existing trucks
			await executeQuery('DELETE FROM truck WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE INTO truck
                (uid, truck_maker, truck_model, registration_number, fuel_consumption_norm, is_default, is_dirty, is_deleted, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const truck of serverTrucks) {
						if (!truck.uid) {
							console.warn('Skipping invalid truck:', truck)
							continue
						}

						await database.runAsync(insertSQL, [truck.uid, truck.truckMaker || '', truck.truckModel || '', truck.registrationNumber || '', truck.fuelConsumptionNorm || 0, truck.isDefault ? 1 : 0, Date.now()])
					}
				})
			} else {
				for (const truck of serverTrucks) {
					if (!truck.uid) {
						console.warn('Skipping invalid truck:', truck)
						continue
					}

					await executeQuery(insertSQL, [truck.uid, truck.truckMaker || '', truck.truckModel || '', truck.registrationNumber || '', truck.fuelConsumptionNorm || 0, truck.isDefault ? 1 : 0, Date.now()])
				}
			}

			console.log(`Successfully synced ${serverTrucks.length} trucks to local database`)
		} catch (error: any) {
			// Handle 403 Forbidden error with user-friendly message
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				console.error('Access denied:', userFriendlyMessage)
				throw new Error(userFriendlyMessage)
			}

			console.error('Failed to sync trucks:', error)
			throw error
		}
	}

	// Get trucks (offline-first)
	async getTrucks(): Promise<any[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getTrucksWeb()
			} else {
				return await this.getTrucksMobile()
			}
		} catch (error) {
			console.error('Failed to get trucks:', error)
			return []
		}
	}

	private async getTrucksWeb(): Promise<any[]> {
		try {
			const response = await freightAxiosInstance.get<any[]>('/trucks')
			return response.data || []
		} catch (error) {
			console.error('Failed to fetch trucks from server:', error)
			return []
		}
	}

	private async getTrucksMobile(): Promise<any[]> {
		const sql = `
            SELECT *
            FROM truck
            WHERE is_deleted = 0
            ORDER BY registration_number ASC
		`

		console.log('[Mobile] Executing SQL query for trucks:', sql)
		const result = await executeSelect(sql)
		console.log('[Mobile] Trucks query result:', result.length, 'rows found')

		return Array.isArray(result) ? result : []
	}

	// Get truck by ID (offline-first)
	async getTruckById(truckId: string): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.getTruckByIdWeb(truckId)
			} else {
				return await this.getTruckByIdMobile(truckId)
			}
		} catch (error) {
			console.error(`Failed to get truck with ID ${truckId}:`, error)
			return null
		}
	}

	private async getTruckByIdWeb(truckId: string): Promise<any | null> {
		try {
			const response = await freightAxiosInstance.get<any>(`/trucks/${truckId}`)
			return response.data || null
		} catch (error) {
			console.error(`Failed to fetch truck with ID ${truckId} from server:`, error)
			return null
		}
	}

	private async getTruckByIdMobile(truckId: string): Promise<any | null> {
		const sql = `
            SELECT *
            FROM truck
            WHERE uid = ? AND is_deleted = 0
		`

		console.log('[Mobile] Executing SQL query for truck by ID:', sql, 'with ID:', truckId)
		const result = await executeSelectFirst(sql, [truckId])
		console.log('[Mobile] Truck query result:', result ? 'Found' : 'Not found')

		return result || null
	}

	// ==================== OBJECTS ====================

	// Sync objects from server to mobile database
	async downloadObjects(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			console.log('📍 Skipping objects sync on web platform')
			return
		}

		// Check if we're in offline mode (includes both network status and manual setting)
		if (await isOfflineMode()) {
			console.log('📍 Device is offline or force offline mode, cannot sync objects')
			return
		}

		try {
			console.log('📍 Syncing objects from server...')
			const {data: serverObjects} = await freightAxiosInstance.get<TruckObjectDto[]>('/objects')

			if (!Array.isArray(serverObjects) || serverObjects.length === 0) {
				console.warn('📍 No objects received from server.')
				return
			}

			console.log(`📍 Received ${serverObjects.length} objects from server`)

			// Clear existing objects
			await executeQuery('DELETE FROM truck_object WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE INTO truck_object
                    (uid, name, is_dirty, is_deleted, synced_at)
                VALUES (?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const obj of serverObjects) {
						if (!obj.uid) {
							console.warn('📍 Skipping invalid object:', obj)
							continue
						}

						await database.runAsync(insertSQL, [obj.uid, obj.name || '', Date.now()])
					}
				})
			} else {
				for (const obj of serverObjects) {
					if (!obj.uid) {
						console.warn('📍 Skipping invalid object:', obj)
						continue
					}

					await executeQuery(insertSQL, [obj.uid, obj.name || '', Date.now()])
				}
			}

			console.log(`📍 Successfully synced ${serverObjects.length} objects to local database`)
		} catch (error: any) {
			// Handle 403 Forbidden error with user-friendly message
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				console.error('📍 Access denied:', userFriendlyMessage)
				throw new Error(userFriendlyMessage)
			}

			console.error('📍 Failed to sync objects:', error)
			throw error
		}
	}

	// Get objects (offline-first)
	async getObjects(): Promise<any[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getObjectsWeb()
			} else {
				return await this.getObjectsMobile()
			}
		} catch (error) {
			console.error('Failed to get objects:', error)
			return []
		}
	}

	private async getObjectsWeb(): Promise<any[]> {
		try {
			const response = await freightAxiosInstance.get<any[]>('/truck-objects')
			return response.data || []
		} catch (error) {
			console.error('Failed to fetch objects from server:', error)
			return []
		}
	}

	private async getObjectsMobile(): Promise<any[]> {
		const sql = `
            SELECT *
            FROM truck_object
            WHERE is_deleted = 0
            ORDER BY name ASC
		`

		console.log('📍 [Mobile] Executing SQL query for objects:', sql)
		const result = await executeSelect(sql)
		console.log('📍 [Mobile] Objects query result:', result.length, 'rows found')

		return Array.isArray(result) ? result : []
	}

	// ==================== TRUCK ROUTES ====================

	// Sync truck routes from server to mobile database
	async downloadTruckRoutes(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			console.log('🚗 Skipping truck routes sync on web platform')
			return
		}

		// Check if we're in offline mode (includes both network status and manual setting)
		if (await isOfflineMode()) {
			console.log('🚗 Device is offline or force offline mode, cannot sync truck routes')
			return
		}

		try {
			console.log('🚗 Syncing truck routes from server...')
			const {data: serverTruckRoutes} = await freightAxiosInstance.get<any[]>('/truck-routes')

			if (!Array.isArray(serverTruckRoutes) || serverTruckRoutes.length === 0) {
				console.warn('🚗 No truck routes received from server.')
				return
			}

			console.log(`🚗 Received ${serverTruckRoutes.length} truck routes from server`)
			console.log('🚗 First few truck routes:', serverTruckRoutes.slice(0, 3))

			// Clear existing truck routes
			await executeQuery('DELETE FROM truck_routes WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE INTO truck_routes
                (uid, truck_route_page_uid, route_date, route_number, cargo_volume,
                 out_truck_object_uid, odometer_at_start, out_date_time,
                 odometer_at_finish, in_truck_object_uid, in_date_time,
                 route_length, fuel_balance_at_start, fuel_consumed,
                 fuel_received, fuel_balance_at_finish, created_date_time,
                 last_modified_date_time, unit_type_id, is_dirty, is_deleted, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const route of serverTruckRoutes) {
						if (!route.uid) {
							console.warn('🚗 Skipping invalid truck route:', route)
							continue
						}

						await database.runAsync(insertSQL, [route.uid, route.truckRoutePage?.uid || null, route.routeDate, route.routeNumber || null, route.cargoVolume || 0, route.outTruckObject?.uid || null, route.odometerAtStart || 0, route.outDateTime, route.odometerAtFinish || null, route.inTruckObject?.uid || null, route.inDateTime || null, route.routeLength || null, route.fuelBalanceAtStart || null, route.fuelConsumed || null, route.fuelReceived || null, route.fuelBalanceAtFinish || null, route.createdDateTime || null, route.lastModifiedDateTime || null, route.unitTypeId || null, Date.now()])
					}
				})
			} else {
				for (const route of serverTruckRoutes) {
					if (!route.uid) {
						console.warn('🚗 Skipping invalid truck route:', route)
						continue
					}

					await executeQuery(insertSQL, [route.uid, route.truckRoutePage?.uid || null, route.routeDate, route.routeNumber || null, route.cargoVolume || 0, route.outTruckObject?.uid || null, route.odometerAtStart || 0, route.outDateTime, route.odometerAtFinish || null, route.inTruckObject?.uid || null, route.inDateTime || null, route.routeLength || null, route.fuelBalanceAtStart || null, route.fuelConsumed || null, route.fuelReceived || null, route.fuelBalanceAtFinish || null, route.createdDateTime || null, route.lastModifiedDateTime || null, route.unitTypeId || null, Date.now()])
				}
			}

			console.log(`🚗 Successfully synced ${serverTruckRoutes.length} truck routes to local database`)
		} catch (error: any) {
			// Handle 403 Forbidden error with user-friendly message
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				console.error('🚗 Access denied:', userFriendlyMessage)
				throw new Error(userFriendlyMessage)
			}

			console.error('🚗 Failed to sync truck routes:', error)
			throw error
		}
	}

	// Get truck routes with details (offline-first)
	async getTruckRoutes(truckRoutePageUid?: string): Promise<any[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getTruckRoutesWeb(truckRoutePageUid)
			} else {
				return await this.getTruckRoutesMobile(truckRoutePageUid)
			}
		} catch (error) {
			console.error('Failed to get truck routes:', error)
			return []
		}
	}

	private async getTruckRoutesWeb(truckRoutePageUid?: string): Promise<any[]> {
		try {
			const endpoint = truckRoutePageUid ? `/truck-routes?truckRoutePageUid=${truckRoutePageUid}` : '/truck-routes'
			const response = await freightAxiosInstance.get<any[]>(endpoint)
			return response.data || []
		} catch (error) {
			console.error('Failed to fetch truck routes from server:', error)
			return []
		}
	}

	private async getTruckRoutesMobile(truckRoutePageUid?: string): Promise<any[]> {
		let sql = `
            SELECT tr.*,
                   trp.date_from,
                   trp.date_to,
                   trp.truck_uid,
                   t.registration_number,
                   t.truck_maker,
                   t.truck_model,
                   out_obj.name as out_object_name,
                   in_obj.name  as in_object_name
            FROM truck_routes tr
                     LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
                     LEFT JOIN truck t ON trp.truck_uid = t.uid
                     LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
                     LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
            WHERE tr.is_deleted = 0
		`
		const params: any[] = []

		if (truckRoutePageUid) {
			sql += ` AND tr.truck_route_page_uid = ?`
			params.push(truckRoutePageUid)
		}

		sql += ` ORDER BY tr.out_date_time DESC`

		console.log('🚗 [Mobile] Executing SQL query for truck routes:', sql, 'with params:', params)
		const result = await executeSelect(sql, params)
		console.log('🚗 [Mobile] Truck routes query result:', result.length, 'rows found')
		console.log('🚗 [Mobile] First few results:', result.slice(0, 3))

		return Array.isArray(result) ? result : []
	}

	// ==================== ROUTE PAGES ====================

	// Sync route pages from server to mobile database
	async downloadRoutePages(db?: SQLiteDatabase): Promise<void> {
		console.log('-----------------------------------------------------------------------------')
		if (Platform.OS === 'web') {
			console.log('🔄 Skipping route pages sync on web platform')
			return
		}

		// Check if we're in offline mode (includes both network status and manual setting)
		if (await isOfflineMode()) {
			console.log('🔄 Device is offline or force offline mode, cannot sync route pages')
			return
		}

		try {
			console.log('🔄 Syncing route pages from server...')
			const {data: serverRoutePages} = await freightAxiosInstance.get<TruckRoutePageDto[]>('/route-pages')

			if (!Array.isArray(serverRoutePages) || serverRoutePages.length === 0) {
				console.warn('🔄 No route pages received from server.')
				return
			}

			console.log(`🔄 Received ${serverRoutePages.length} route pages from server`)
			console.log('🔄 First few route pages:', serverRoutePages.slice(0, 3))

			// Clear existing route pages
			await executeQuery('DELETE FROM truck_route_page WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE INTO truck_route_page
                (uid, date_from, date_to, truck_uid, user_id, fuel_balance_at_start, fuel_balance_at_end,
                 total_fuel_received_on_routes, total_fuel_consumed_on_routes, fuel_balance_at_routes_finish,
                 odometer_at_route_start, odometer_at_route_finish, computed_total_routes_length,
                 is_dirty, is_deleted, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const routePage of serverRoutePages) {
						if (!routePage.uid) {
							console.warn('🔄 Skipping invalid route page:', routePage)
							continue
						}

						await database.runAsync(insertSQL, [routePage.uid, routePage.dateFrom, routePage.dateTo, routePage.truck?.uid || null, routePage.user?.id || null, routePage.fuelBalanceAtStart || 0, routePage.fuelBalanceAtFinish || 0, routePage.totalFuelReceivedOnRoutes || null, routePage.totalFuelConsumedOnRoutes || null, routePage.fuelBalanceAtRoutesFinish || null, routePage.odometerAtRouteStart || null, routePage.odometerAtRouteFinish || null, routePage.computedTotalRoutesLength || null, Date.now()])
					}
				})
			} else {
				for (const routePage of serverRoutePages) {
					if (!routePage.uid) {
						console.warn('🔄 Skipping invalid route page:', routePage)
						continue
					}

					await executeQuery(insertSQL, [routePage.uid, routePage.dateFrom, routePage.dateTo, routePage.truck?.uid || null, routePage.user?.id || null, routePage.fuelBalanceAtStart || 0, routePage.fuelBalanceAtFinish || 0, routePage.totalFuelReceivedOnRoutes || null, routePage.totalFuelConsumedOnRoutes || null, routePage.fuelBalanceAtRoutesFinish || null, routePage.odometerAtRouteStart || null, routePage.odometerAtRouteFinish || null, routePage.computedTotalRoutesLength || null, Date.now()])
				}
			}

			console.log(`🔄 Successfully synced ${serverRoutePages.length} route pages to local database`)
		} catch (error: any) {
			// Handle 403 Forbidden error with user-friendly message
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				console.error('🔄 Access denied:', userFriendlyMessage)
				throw new Error(userFriendlyMessage)
			}

			console.error('🔄 Failed to sync route pages:', error)
			throw error
		}
	}

	// Get route pages (offline-first)
	async getRoutePages(): Promise<TruckRoutePageDto[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getRoutePagesWeb()
			} else {
				return await this.getRoutePagesMobile()
			}
		} catch (error) {
			console.error('Failed to get route pages:', error)
			return []
		}
	}

	private async getRoutePagesWeb(): Promise<TruckRoutePageDto[]> {
		const connected = await isConnected()
		const forceOffline = await isOfflineMode()

		if (connected && !forceOffline) {
			try {
				const response = await freightAxiosInstance.get<TruckRoutePageDto[]>('/route-pages')
				const routePages = response.data || []

				// Cache the data
				await AsyncStorage.setItem('cached_route_pages', JSON.stringify(routePages))
				await AsyncStorage.setItem('cached_route_pages_timestamp', Date.now().toString())

				return routePages
			} catch (error) {
				console.error('Failed to fetch route pages from server, falling back to cache:', error)
			}
		}

		// Fallback to cached data
		try {
			const cached = await AsyncStorage.getItem('cached_route_pages')
			if (cached) {
				return JSON.parse(cached)
			}
		} catch (error) {
			console.error('Failed to load cached route pages:', error)
		}

		return []
	}

	private async getRoutePagesMobile(): Promise<TruckRoutePageDto[]> {
		const sql = `
            SELECT trp.*,
                   t.truck_maker,
                   t.truck_model,
                   t.registration_number,
                   t.fuel_consumption_norm,
                   t.is_default,
                   u.email,
                   u.given_name,
                   u.family_name
            FROM truck_route_page trp
                     LEFT JOIN truck t ON trp.truck_uid = t.uid
                     LEFT JOIN user u ON trp.user_id = u.id
            WHERE trp.is_deleted = 0
            ORDER BY trp.date_from DESC
		`

		console.log('🔄 [Mobile] Executing SQL query for route pages:', sql)
		const result = await executeSelect(sql)
		console.log('🔄 [Mobile] Route pages query result:', result.length, 'rows found')
		console.log('🔄 [Mobile] First few results:', result.slice(0, 3))

		// Transform database results to DTOs
		const routePages: TruckRoutePageDto[] = result.map((row: any) => ({
			uid: row.uid,
			dateFrom: row.date_from,
			dateTo: row.date_to,
			truck: row.truck_uid ? {
				uid: row.truck_uid,
				truckMaker: row.truck_maker || '',
				truckModel: row.truck_model || '',
				registrationNumber: row.registration_number || '',
				fuelConsumptionNorm: row.fuel_consumption_norm || 0,
				isDefault: row.is_default || 0
			} : {
				uid: '', truckMaker: '', truckModel: '', registrationNumber: 'Nav pieejams', fuelConsumptionNorm: 0, isDefault: 0
			},
			user: row.user_id ? {
				id: row.user_id, email: row.email || '', givenName: row.given_name || '', familyName: row.family_name || ''
			} : {
				id: '', email: '', givenName: '', familyName: ''
			},
			fuelBalanceAtStart: row.fuel_balance_at_start || 0,
			fuelBalanceAtFinish: row.fuel_balance_at_end || 0,
			totalFuelReceivedOnRoutes: row.total_fuel_received_on_routes,
			totalFuelConsumedOnRoutes: row.total_fuel_consumed_on_routes,
			fuelBalanceAtRoutesFinish: row.fuel_balance_at_routes_finish,
			odometerAtRouteStart: row.odometer_at_route_start,
			odometerAtRouteFinish: row.odometer_at_route_finish,
			computedTotalRoutesLength: row.computed_total_routes_length
		}))

		return routePages
	}

	// ==================== ACTIVE ROUTES ====================

	// Get last active route (offline-first)
	async getLastActiveRoute(): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.getLastActiveRouteWeb()
			} else {
				return await this.getLastActiveRouteMobile()
			}
		} catch (error) {
			console.error('Failed to get last active route:', error)
			return null
		}
	}

	private async getLastActiveRouteWeb(): Promise<any | null> {
		try {
			const response = await freightAxiosInstance.get('/truck-routes/last-active')
			return response.data
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null // No active route
			}
			console.error('Failed to fetch last active route from server:', error)
			return null
		}
	}

	private async getLastActiveRouteMobile(): Promise<any | null> {
		const sql = `
            SELECT tr.*,
                   trp.date_from,
                   trp.date_to,
                   trp.truck_uid,
                   t.registration_number,
                   t.truck_maker,
                   t.truck_model,
                   out_obj.name as out_object_name,
                   in_obj.name  as in_object_name
            FROM truck_routes tr
                     LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
                     LEFT JOIN truck t ON trp.truck_uid = t.uid
                     LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
                     LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
            WHERE tr.in_date_time IS NULL
              AND tr.is_deleted = 0
            ORDER BY tr.out_date_time DESC
            LIMIT 1
		`
		return await executeSelectFirst(sql)
	}

	// ==================== FINISHED ROUTES ====================

	// Get last finished route (offline-first)
	async getLastFinishedRoute(): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.getLastFinishedRouteWeb()
			} else {
				return await this.getLastFinishedRouteMobile()
			}
		} catch (error) {
			console.error('Failed to get last finished route:', error)
			return null
		}
	}

	private async getLastFinishedRouteWeb(): Promise<any | null> {
		try {
			const response = await freightAxiosInstance.get('/truck-routes/last-finished')
			return response.data
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null // No finished route
			}
			console.error('Failed to fetch last finished route from server:', error)
			return null
		}
	}

	private async getLastFinishedRouteMobile(): Promise<any | null> {
		const sql = `
            SELECT tr.*,
                   trp.date_from,
                   trp.date_to,
                   trp.truck_uid,
                   t.registration_number,
                   t.truck_maker,
                   t.truck_model,
                   out_obj.name as out_object_name,
                   in_obj.name  as in_object_name
            FROM truck_routes tr
                     LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
                     LEFT JOIN truck t ON trp.truck_uid = t.uid
                     LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
                     LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
            WHERE tr.in_date_time IS NOT NULL
              AND tr.is_deleted = 0
            ORDER BY tr.in_date_time DESC
            LIMIT 1
		`
		return await executeSelectFirst(sql)
	}

	// ==================== SYNC ALL DATA ====================

	// Sync all data
	async syncAllData(): Promise<void> {
		console.log('🔄 Starting sync of all data...')

		try {
			await this.downloadTrucks()
			await this.downloadObjects()
			await this.downloadRoutePages()
			await this.downloadTruckRoutes()

			console.log('🔄 Successfully synced all data')
		} catch (error) {
			console.error('🔄 Failed to sync data:', error)
			throw error
		}
	}
}

// Export singleton instance
export const offlineDataManagerExtended = new OfflineDataManagerExtended()

// Export functions for backward compatibility
export const getRoutePages = () => offlineDataManagerExtended.getRoutePages()
export const downloadServerData = () => offlineDataManagerExtended.syncAllData()
export const getTrucks = () => offlineDataManagerExtended.getTrucks()
export const getObjects = () => offlineDataManagerExtended.getObjects()
export const getLastActiveRoute = () => offlineDataManagerExtended.getLastActiveRoute()
export const getLastFinishedRoute = () => offlineDataManagerExtended.getLastFinishedRoute()
