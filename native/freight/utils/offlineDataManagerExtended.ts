import { loadSessionEnhanced } from '@/utils/sessionUtils';
import {TruckDto} from '@/dto/TruckDto'
import {TruckObjectDto} from '@/dto/TruckObjectDto'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import {UserDto} from '@/dto/UserDto'
import {mapTruckRoutePageModelToDto} from '@/mapers/TruckRoutePageMapper'
import {Truck} from '@/models/Truck'
import {TruckObject} from '@/models/TruckObject'
import {TruckRoutePage} from '@/models/TruckRoutePage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {SQLiteDatabase} from 'expo-sqlite'
import {Platform} from 'react-native'
import freightAxiosInstance from '../config/freightAxios'
import {executeQuery, executeSelect, executeSelectFirst, executeTransaction} from './database'
import {isConnected} from './networkUtils'
import {addOfflineOperation} from './offlineQueue'

// Simple ID generation without crypto dependencies
function generateOfflineId(): string {
	// Use timestamp + multiple random parts for better uniqueness
	const timestamp = Date.now().toString()
	const randomPart1 = Math.random().toString(36).substr(2, 9)
	const randomPart2 = Math.random().toString(36).substr(2, 5)
	return `offline-${timestamp}-${randomPart1}-${randomPart2}`
}

/**
 * UNIFIED OFFLINE DATA MANAGER
 *
 * This is the main data manager that handles all offline functionality:
 * - Trucks, Objects, Route Pages
 * - Active Routes management
 * - Sync operations with 403 error handling
 * - Platform-specific implementations (web vs mobile)
 *
 * Replaces the legacy offlineDataManager.ts
 */
class OfflineDataManagerExtended {

	// ==================== TRUCKS ====================

	// Get all trucks (offline-first)
	async getTrucks(): Promise<Truck[]> {
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

	private async getTrucksWeb(): Promise<Truck[]> {
		try {
			const response = await freightAxiosInstance.get<Truck[]>('/trucks')
			return response.data
		} catch (error) {
			console.error('Failed to fetch trucks from server:', error)
			throw error
		}
	}

	private async getTrucksMobile(): Promise<Truck[]> {
		const sql = `
            SELECT *
            FROM truck
            WHERE is_deleted = 0
            ORDER BY registration_number ASC
		`
		const result = await executeSelect(sql)
		console.log('🚛 [Mobile] Loaded trucks from database:', result.length, 'items')
		console.log('🚛 [Mobile] First few trucks:', result.slice(0, 3))
		return result
	}

	// ==================== OBJECTS ====================

	// Get all objects (offline-first)
	async getObjects(): Promise<TruckObject[]> {
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

	private async getObjectsWeb(): Promise<TruckObject[]> {
		try {
			const response = await freightAxiosInstance.get<TruckObject[]>('/objects')
			return response.data
		} catch (error) {
			console.error('Failed to fetch objects from server:', error)
			throw error
		}
	}

	private async getObjectsMobile(): Promise<TruckObject[]> {
		const sql = `
            SELECT *
            FROM objects
            WHERE is_deleted = 0
            ORDER BY name ASC
		`
		return await executeSelect(sql)
	}

	// Create object (offline-first)
	async createObject(objectData: Omit<TruckObject, 'created_at' | 'updated_at'>): Promise<TruckObject> {
		const object: TruckObject = {
			...objectData,
			uid: Platform.OS === 'web' ? generateOfflineId() : undefined,
			is_dirty: 1,
			is_deleted: 0,
			created_at: Date.now(),
			updated_at: Date.now()
		}

		try {
			if (Platform.OS === 'web') {
				return await this.createObjectWeb(object)
			} else {
				return await this.createObjectMobile(object)
			}
		} catch (error) {
			console.error('Failed to create object:', error)
			throw error
		}
	}

	private async createObjectWeb(object: TruckObject): Promise<TruckObject> {
		// Add to offline queue for later sync
		await addOfflineOperation('CREATE', 'objects', '/objects', object)
		return object
	}

	private async createObjectMobile(object: TruckObject): Promise<TruckObject> {
		const sql = `
            INSERT INTO truck_object
                (uid, name, is_dirty, is_deleted)
            VALUES (?, ?, 1, 0)
		`

		const result = await executeQuery(sql, [object.uid, object.name, Date.now(), Date.now()])

		const createdObject = {...object, uid: result.lastInsertRowId}

		// Add to offline queue
		await addOfflineOperation('CREATE', 'objects', '/objects', createdObject)

		return createdObject
	}

	// ==================== ACTIVE ROUTES ====================

	// Get last active route
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
				return null
			}
			console.error('Failed to fetch last active route from server:', error)
			throw error
		}
	}

	private async getLastActiveRouteMobile(): Promise<any | null> {
		const sql = `
            SELECT *
            FROM active_routes
            WHERE is_active = 1
            ORDER BY created_at DESC
            LIMIT 1
		`
		const result = await executeSelectFirst(sql)
		return result ? JSON.parse(result.route_data) : null
	}

	// Get last finished route
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
			const response = await freightAxiosInstance.get('/truck-routes?pageSize=1')
			return response.data.content?.[0] || null
		} catch (error) {
			console.error('Failed to fetch last finished route from server:', error)
			throw error
		}
	}

	private async getLastFinishedRouteMobile(): Promise<any | null> {
		const sql = `
            SELECT *
            FROM truck_routes
            WHERE is_deleted = 0
            ORDER BY updated_at DESC
            LIMIT 1
		`
		return await executeSelectFirst(sql)
	}

	// Check route page exists
	async checkRoutePageExists(truckId: string, routeDate: string): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.checkRoutePageExistsWeb(truckId, routeDate)
			} else {
				return await this.checkRoutePageExistsMobile(truckId, routeDate)
			}
		} catch (error) {
			console.error('Failed to check route page exists:', error)
			return null
		}
	}

	private async checkRoutePageExistsWeb(truckId: string, routeDate: string): Promise<any | null> {
		const connected = await isConnected()

		if (connected) {
			try {
				const response = await freightAxiosInstance.get(`/route-pages/exists?truckId=${truckId}&routeDate=${routeDate}`)
				return response.data
			} catch (error: any) {
				if (error.response?.status === 404) {
					return null
				}
				console.log('Online check failed')
			}
		}

		// For offline, we can't really check server data, so return null
		return null
	}

	private async checkRoutePageExistsMobile(truckId: string, routeDate: string): Promise<any | null> {
		const sql = `
            SELECT *
            FROM route_pages
            WHERE truck_registration_number = ?
              AND date_from <= ?
              AND date_to >= ?
              AND is_deleted = 0
            LIMIT 1
		`
		return await executeSelectFirst(sql, [truckId, routeDate, routeDate])
	}

	// ==================== ROUTE PAGES ====================

	// Get route pages for a truck route
	async getRoutePages(truckRouteId?: number): Promise<TruckRoutePageDto[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getRoutePagesWeb(truckRouteId)
			} else {
				const routePages = await this.getRoutePagesMobile(truckRouteId)
				console.log('📱 [DEBUG] route pages from DB: ', routePages);
				console.log('📱 [DEBUG] route pages count:', routePages.length);
				
				// Ensure we have an array before mapping
				if (!Array.isArray(routePages)) {
					console.warn('📱 [WARN] Expected array from mobile DB, got:', typeof routePages);
					return []
				}
				
				const mappedPages = mapTruckRoutePageModelToDto(routePages)
				console.log('📱 [DEBUG] mapped pages:', mappedPages.length);
				
				// Ensure mapper returns an array
				return Array.isArray(mappedPages) ? mappedPages : []
			}
		} catch (error) {
			console.error('Failed to get route pages:', error)
			return []
		}
	}

	private async getRoutePagesWeb(truckRouteId?: number): Promise<TruckRoutePageDto[]> {
		const connected = await isConnected()

		if (connected) {
			try {
				const endpoint = truckRouteId ? `/route-pages?truckRouteId=${truckRouteId}` : '/route-pages'
				const response = await freightAxiosInstance.get<TruckRoutePageDto[]>(endpoint)

				console.log('🔄 [WEB] Server response received:', response.data)
				console.log('🔄 [WEB] Response data type:', typeof response.data)
				console.log('🔄 [WEB] Response data is array:', Array.isArray(response.data))

				// Ensure we always return an array
				const routePages = Array.isArray(response.data) ? response.data : []
				console.log('🔄 [WEB] Normalized to array:', routePages.length, 'pages')

				// Cache the array data
				const cacheKey = truckRouteId ? `cached_route_pages_${truckRouteId}` : 'cached_route_pages'
				await AsyncStorage.setItem(cacheKey, JSON.stringify(routePages))
				return routePages
			} catch (error: any) {
				// Handle 403 Forbidden error with user-friendly message
				if (error.response?.status === 403) {
					const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
					console.error('🔄 [WEB] Access denied:', userFriendlyMessage)
					throw new Error(userFriendlyMessage)
				}
				console.log('🔄 [WEB] Online fetch failed, trying cache')
			}
		}

		// Fallback to cache
		try {
			const cacheKey = truckRouteId ? `cached_route_pages_${truckRouteId}` : 'cached_route_pages'
			const cached = await AsyncStorage.getItem(cacheKey)
			if (cached) {
				const parsedCache = JSON.parse(cached)
				// Ensure cached data is also an array
				return Array.isArray(parsedCache) ? parsedCache : []
			}
			return []
		} catch (error) {
			console.error('Failed to load cached route pages:', error)
			return []
		}
	}

	private async getRoutePagesMobile(truckRouteId?: number): Promise<TruckRoutePage[]> {
		let sql = `
	           SELECT trp.*,
	                  t.truck_maker,
	                  t.truck_model,
	                  t.registration_number,
	                  t.fuel_consumption_norm
	           FROM truck_route_page trp
	                    LEFT JOIN truck t ON trp.truck_uid = t.uid
	           WHERE trp.is_deleted = 0
		`
		const params: any[] = []

		if (truckRouteId) {
			sql += ` AND trp.truck_route_id = ?`
			params.push(truckRouteId)
		}

		sql += ` ORDER BY created_at DESC`

		console.log('🔍 [DEBUG] Executing SQL query for route pages:', sql, 'with params:', params)
		const result = await executeSelect(sql, params)
		console.log('🔍 [DEBUG] Route pages query result:', result.length, 'rows found')
		console.log('🔍 [DEBUG] First few results:', result.slice(0, 3))

		// Ensure we always return an array
		return Array.isArray(result) ? result : []
	}

	// Create route page
	async createRoutePage(pageData: Omit<RoutePage, 'id' | 'created_at' | 'updated_at'>): Promise<RoutePage> {
		const page: RoutePage = {
			...pageData,
			id: Platform.OS === 'web' ? generateOfflineId() : undefined,
			is_dirty: 1,
			is_deleted: 0,
			created_at: Date.now(),
			updated_at: Date.now()
		}

		try {
			if (Platform.OS === 'web') {
				return await this.createRoutePageWeb(page)
			} else {
				return await this.createRoutePageMobile(page)
			}
		} catch (error) {
			console.error('Failed to create route page:', error)
			throw error
		}
	}

	private async createRoutePageWeb(page: RoutePage): Promise<RoutePage> {
		// Store locally first
		const cacheKey = page.truck_route_id ? `cached_route_pages_${page.truck_route_id}` : 'cached_route_pages'
		const cached = await AsyncStorage.getItem(cacheKey)
		const pages: RoutePage[] = cached ? JSON.parse(cached) : []
		pages.unshift(page)
		await AsyncStorage.setItem(cacheKey, JSON.stringify(pages))

		// Add to offline queue
		await addOfflineOperation('CREATE', 'route_pages', '/route-pages', page)

		return page
	}

	private async createRoutePageMobile(page: RoutePage): Promise<RoutePage> {
		const sql = `
            INSERT INTO route_pages
            (uid, truck_route_id, truck_route_server_id, date_from, date_to, truck_registration_number,
             fuel_consumption_norm, fuel_balance_at_start, total_fuel_received_on_routes,
             total_fuel_consumed_on_routes, fuel_balance_at_routes_finish, odometer_at_route_start,
             odometer_at_route_finish, computed_total_routes_length, is_dirty, is_deleted,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`

		const result = await executeQuery(sql, [page.uid || generateOfflineId(), page.truck_route_id || null, page.truck_route_server_id || null, page.date_from, page.date_to, page.truck_registration_number, page.fuel_consumption_norm, page.fuel_balance_at_start, page.total_fuel_received_on_routes || null, page.total_fuel_consumed_on_routes || null, page.fuel_balance_at_routes_finish || null, page.odometer_at_route_start || null, page.odometer_at_route_finish || null, page.computed_total_routes_length || null, 1, // is_dirty
			0, // is_deleted
			Date.now(), Date.now()])

		const createdPage = {...page, id: result.lastInsertRowId}

		// Add to offline queue
		await addOfflineOperation('CREATE', 'route_pages', '/route-pages', createdPage)

		return createdPage
	}

	async downloadTrucks(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			console.log('Skipping truck sync on web platform')
			return
		}

		if (!(await isConnected())) {
			console.log('Device is offline, cannot sync trucks')
			return
		}

		try {
			console.log('🚛 Syncing trucks from server...')
			const {data: serverTrucks} = await freightAxiosInstance.get<TruckDto[]>('/trucks')

			if (!Array.isArray(serverTrucks) || serverTrucks.length === 0) {
				console.warn('🚛 No trucks received from server.')
				return
			}

			console.log(`🚛 Received ${serverTrucks.length} trucks from server`)
			console.log('🚛 First few trucks:', serverTrucks.slice(0, 3))

			await executeQuery('DELETE FROM truck WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE
                INTO truck
                (uid, truck_maker, truck_model, registration_number, fuel_consumption_norm, is_dirty, is_deleted, synced_at)
                VALUES (?, ?, ?, ?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const truck of serverTrucks) {
						if (!truck.registrationNumber || !truck.uid) {
							console.warn('🚛 Skipping invalid truck:', truck)
							continue
						}

						await database.runAsync(insertSQL, [truck.uid, truck.truckMaker ?? '', truck.truckModel ?? '', truck.registrationNumber, truck.fuelConsumptionNorm ?? 0, Date.now(),])
					}
				})
			} else {
				for (const truck of serverTrucks) {
					if (!truck.registrationNumber || !truck.uid) {
						console.warn('🚛 Skipping invalid truck:', truck)
						continue
					}

					await executeQuery(insertSQL, [truck.uid, truck.truckMaker ?? '', truck.truckModel ?? '', truck.registrationNumber, truck.fuelConsumptionNorm ?? 0, Date.now(),])
				}
			}

			console.log(`🚛 Successfully synced ${serverTrucks.length} trucks to local database`)
		} catch (error) {
			console.error('🚛 Failed to sync trucks:', error)
			throw error
		}
	}

	// Sync objects from server to mobile database
	async downloadObjects(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			console.log('📍 Skipping objects sync on web platform')
			return
		}

		if (!(await isConnected())) {
			console.log('📍 Device is offline, cannot sync objects')
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
			console.log('📍 Clearing all existing objects from database...')
			await executeQuery('DELETE FROM truck_object WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE
                INTO truck_object
                    (uid, name, is_dirty, is_deleted, synced_at)
                VALUES (?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const obj of serverObjects) {
						if (!obj.uid || !obj.name) {
							console.warn('📍 Skipping invalid object:', obj)
							continue
						}

						await database.runAsync(insertSQL, [obj.uid, obj.name, Date.now(),])
					}
				})
			} else {
				for (const obj of serverObjects) {
					if (!obj.uid || !obj.name) {
						console.warn('📍 Skipping invalid object:', obj)
						continue
					}

					await executeQuery(insertSQL, [obj.uid, obj.name, Date.now(),])
				}
			}

			console.log(`📍 Successfully synced ${serverObjects.length} objects to local database`)
		} catch (error) {
			console.error('📍 Failed to sync objects:', error)
			throw error
		}
	}

	// Sync route pages when online
	// async syncRoutePages(): Promise<void> {
	// 	console.log('🔄 [DEBUG] syncRoutePages called')
	//
	// 	const connected = await isConnected()
	// 	if (!connected) {
	// 		console.log('🔄 [DEBUG] Device is offline, cannot sync route pages')
	// 		return
	// 	}
	//
	// 	if (Platform.OS === 'web') {
	// 		console.log('🔄 [DEBUG] Web platform detected, skipping SQLite sync')
	// 		return // Skip for web
	// 	}

	// 	try {
	// 		console.log('🔄 [DEBUG] Fetching route pages from server...')
	// 		const response = await freightAxiosInstance.get<RawApiRoutePage[]>('/route-pages')
	// 		const rawServerPages = response.data
	// 		console.log('🔄 [DEBUG] Server response:', rawServerPages.length, 'raw route pages received')
	// 		console.log('🔄 [DEBUG] First few raw server pages:', rawServerPages.slice(0, 3))
	//
	// 		// Normalize the data using the centralised normalizer
	// 		console.log('🔄 [DEBUG] Normalizing server data...')
	// 		const normalizedPages = normalizeRoutePagesFromApi(rawServerPages)
	// 		console.log('🔄 [DEBUG] Normalized pages:', normalizedPages.length, 'valid pages after normalization')
	//
	// 		if (normalizedPages.length === 0) {
	// 			console.warn('🔄 [WARN] No valid pages after normalization - skipping database update')
	// 			return
	// 		}
	//
	// 		await executeTransaction(async (db) => {
	// 			console.log('🔄 [DEBUG] Starting database transaction...')
	//
	// 			// Clear ALL existing route pages first to prevent duplicates
	// 			console.log('🔄 [DEBUG] Clearing all existing route pages from database...')
	// 			await db.runAsync('DELETE FROM route_pages')
	//
	// 			// Insert normalized data
	// 			console.log('🔄 [DEBUG] Inserting', normalizedPages.length, 'normalized pages into database...')
	// 			for (const page of normalizedPages) {
	// 				// Additional validation before database insertion
	// 				if (!validateRoutePageForDb(page)) {
	// 					console.warn('🔄 [WARN] Skipping invalid page during database insertion:', page)
	// 					continue
	// 				}
	//
	// 				console.log('🔄 [DEBUG] Inserting page:', page.id, page.truck_registration_number)
	// 				await db.runAsync(`
	//                     INSERT INTO route_pages
	//                     (server_id, truck_route_server_id, date_from, date_to, truck_registration_number,
	//                      fuel_consumption_norm, fuel_balance_at_start, total_fuel_received_on_routes,
	//                      total_fuel_consumed_on_routes, fuel_balance_at_routes_finish, odometer_at_route_start,
	//                      odometer_at_route_finish, computed_total_routes_length, is_dirty, is_deleted, synced_at)
	//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
	// 				`, [page.server_id || null, page.truck_route_server_id || null, page.date_from, page.date_to, page.truck_registration_number, page.fuel_consumption_norm, page.fuel_balance_at_start, page.total_fuel_received_on_routes || null, page.total_fuel_consumed_on_routes || null, page.fuel_balance_at_routes_finish || null, page.odometer_at_route_start || null, page.odometer_at_route_finish || null, page.computed_total_routes_length || null, Date.now()])
	// 			}
	//
	// 			console.log('🔄 [DEBUG] Database transaction completed successfully')
	// 		})
	//
	// 		console.log(`🔄 [DEBUG] Successfully synced ${normalizedPages.length} route pages from server`)
	// 	} catch (error: any) {
	// 		// Handle 403 Forbidden error with user-friendly message
	// 		if (error.response?.status === 403) {
	// 			const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
	// 			console.error('🔄 [ERROR] Access denied:', userFriendlyMessage)
	// 			throw new Error(userFriendlyMessage)
	// 		}
	//
	// 		console.error('🔄 [ERROR] Failed to sync route pages:', error)
	// 		console.error('🔄 [ERROR] Error details:', error instanceof Error ? error.message : 'Unknown error')
	// 		throw error
	// 	}
	// }

	// Sync all dropdown data
	async syncAllData(): Promise<void> {
		console.log('🔄 Starting sync of all dropdown data...')

		try {
			await this.downloadTrucks()
			await this.downloadObjects()
			await this.downloadRoutePages()

			console.log('🔄 Successfully synced all dropdown data')
		} catch (error) {
			console.error('🔄 Failed to sync dropdown data:', error)
			throw error
		}
	}

	// Sync route pages from server to mobile database
	async downloadRoutePages(db?: SQLiteDatabase): Promise<void> {
		console.log('-----------------------------------------------------------------------------')
		if (Platform.OS === 'web') {
			console.log('🔄 Skipping route pages sync on web platform')
			return
		}

		if (!(await isConnected())) {
			console.log('🔄 Device is offline, cannot sync route pages')
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
			console.log('🔄 First few raw route pages:', serverRoutePages.slice(0, 3))

			// Normalize the data using the centralised normalizer
			// console.log('🔄 Normalizing server data...');
			// const normalizedPages = normalizeRoutePagesFromApi(serverRoutePages);
			// console.log(`🔄 ----------------------------------------------------------------------------------`);
			// console.log(normalizedPages);
			// console.log(`🔄 Normalized ${normalizedPages.length} valid pages after normalization`);

			// if (normalizedPages.length === 0) {
			// 	console.warn('🔄 No valid pages after normalization - skipping database update');
			// 	return;
			// }

			console.log('🔄 Clearing all existing route pages from database...')
			await executeQuery('DELETE FROM user WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertUserSQL = `
                INSERT OR
                REPLACE
                INTO user
                (id, email, given_name, family_name,
                 is_dirty, is_deleted, synced_at)
                VALUES (?, ?, ?, ?, 0, 0, ?)
			`
			const sessionData = await loadSessionEnhanced();
			const currentUser = sessionData.user;
			if (db) {
				await executeTransaction(async (database) => {
					for (const page of serverRoutePages) {
						const user: UserDto = page.user
						await database.runAsync(insertUserSQL, [
								user.id,
								currentUser.email,
								currentUser.givenName || currentUser.firstName,
								currentUser.familyName || currentUser.lastName,
								Date.now()
						])
					}
				})
			} else {
				for (const page of serverRoutePages) {
					const user: UserDto = page.user
					await executeQuery(insertUserSQL, [
						user.id,
						currentUser.email,
						currentUser.givenName || currentUser.firstName,
						currentUser.familyName || currentUser.lastName,
						Date.now()
					])
				}
			}

			await executeQuery('DELETE FROM truck_route_page WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = `
                INSERT OR
                REPLACE
                INTO truck_route_page
                (uid, date_from, date_to, truck_uid, user_id, fuel_balance_at_start, fuel_balance_at_end,
                 total_fuel_received_on_routes, total_fuel_consumed_on_routes, fuel_balance_at_routes_finish,
                 odometer_at_route_start, odometer_at_route_finish, computed_total_routes_length,
                 is_dirty, is_deleted, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
			`

			if (db) {
				await executeTransaction(async (database) => {
					for (const page of serverRoutePages) {
						// Additional validation before database insertion
						await database.runAsync(insertSQL,
								[page.uid, page.dateFrom, page.dateTo, page.truck.uid, page.user.id,
									page.fuelBalanceAtStart, page.fuelBalanceAtFinish, page.totalFuelReceivedOnRoutes || null,
									page.totalFuelConsumedOnRoutes || null, page.fuelBalanceAtRoutesFinish || null,
									page.odometerAtRouteStart || null, page.odometerAtRouteFinish || null, page.computedTotalRoutesLength || null,
									Date.now()])
					}
				})
			} else {
				for (const page of serverRoutePages) {
					// Additional validation before database insertion
					await executeQuery(insertSQL,
							[page.uid, page.dateFrom, page.dateTo, page.truck.uid, page.user.id,
								page.fuelBalanceAtStart, page.fuelBalanceAtFinish, page.totalFuelReceivedOnRoutes || null,
								page.totalFuelConsumedOnRoutes || null, page.fuelBalanceAtRoutesFinish || null,
								page.odometerAtRouteStart || null, page.odometerAtRouteFinish || null, page.computedTotalRoutesLength || null,
								Date.now()])
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
}

// Export singleton instance
export const offlineDataManagerExtended = new OfflineDataManagerExtended()

// Convenience functions
export const getTrucks = () => offlineDataManagerExtended.getTrucks()
export const getObjects = () => offlineDataManagerExtended.getObjects()
export const createObject = (data: Omit<TruckObject, 'created_at' | 'updated_at'>) => offlineDataManagerExtended.createObject(data)

export const getLastActiveRoute = () => offlineDataManagerExtended.getLastActiveRoute()
export const getLastFinishedRoute = () => offlineDataManagerExtended.getLastFinishedRoute()
export const checkRoutePageExists = (truckId: string,
		routeDate: string) => offlineDataManagerExtended.checkRoutePageExists(truckId, routeDate)

// Route pages functions
export const getRoutePages = (truckRouteId?: number) => offlineDataManagerExtended.getRoutePages(truckRouteId)
// export const createRoutePage = (data: Omit<RoutePage, 'id' | 'created_at' | 'updated_at'>) => offlineDataManagerExtended.createRoutePage(data)

// Sync functions
// export const syncTrucks = () => offlineDataManagerExtended.syncTrucks()
// export const syncObjects = () => offlineDataManagerExtended.syncObjects()
// export const syncRoutePages = () => offlineDataManagerExtended.syncRoutePages()
export const downloadServerData = () => offlineDataManagerExtended.syncAllData()

// Legacy compatibility - export the main instance as offlineDataManager for backward compatibility
export const offlineDataManager = offlineDataManagerExtended
