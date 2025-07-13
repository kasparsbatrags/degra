import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import {isOfflineMode} from '@/services/offlineService'
import uuid from 'react-native-uuid'
import {mapTruckRoutePageDtoToModel, mapSingleTruckRoutePageResultToDto} from '../../mapers/TruckRoutePageMapper'
import {isOnline} from '../../services/networkService'
import {executeQuery, executeSelect, executeSelectFirst} from '../database'
import {addOfflineOperation} from '../offlineQueue'
import {PlatformDataAdapter} from './PlatformDataAdapter'
import {SQLQueryBuilder} from './SQLQueryBuilder'
import {TruckRouteDataManager} from './TruckRouteDataManager'

/**
 * Manages route page data operations
 * Handles downloading, storing, and retrieving route page information
 */
export class RoutePageDataManager {
	private truckRouteDataManager: TruckRouteDataManager

	constructor() {
		this.truckRouteDataManager = new TruckRouteDataManager()
	}

	/**
	 * Calculate computed total routes length for a route page
	 * Equivalent to Java: routes.stream().mapToLong(route -> Optional.ofNullable(route.getRouteLength()).orElse(0L)).sum()
	 */
	async calculateComputedTotalRoutesLength(truckRoutePageUid: string): Promise<number> {
		try {
			// Get all routes for this route page
			const routes = await this.truckRouteDataManager.getTruckRoutes(truckRoutePageUid)
			
			// Sum up all route lengths (equivalent to Java stream operation)
			const totalLength = routes.reduce((sum, route) => {
				const routeLength = route.route_length ?? 0
				return sum + routeLength
			}, 0)
			
			PlatformDataAdapter.logPlatformInfo('calculateComputedTotalRoutesLength',
				`Calculated total length: ${totalLength} for route page: ${truckRoutePageUid}`)
			
			return totalLength
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('calculateComputedTotalRoutesLength', `Error: ${error}`)
			return 0
		}
	}

	/**
	 * Fetch route pages from server
	 */
	async fetchRoutePagesFromServer(): Promise<TruckRoutePageDto[]> {
		try {
			const serverRoutePages = await PlatformDataAdapter.fetchFromServer<TruckRoutePageDto>('/route-pages')

			if (!Array.isArray(serverRoutePages) || serverRoutePages.length === 0) {
				return []
			}

			return serverRoutePages
		} catch (error: any) {
			if (error.response?.status !== 404) {
				PlatformDataAdapter.handleServerError(error)
			}
			return []
		}
	}

	/**
	 * Save single route page to database
	 */
	async saveRoutePageToDatabase(routePageDto: TruckRoutePageDto): Promise<string> {
		if (!routePageDto.uid) {
			routePageDto.uid = uuid.v4().toString()
		}

		// Calculate computed total routes length if not provided
		if (!routePageDto.computedTotalRoutesLength && !PlatformDataAdapter.isWeb()) {
			routePageDto.computedTotalRoutesLength = await this.calculateComputedTotalRoutesLength(routePageDto.uid)
		}

		const routePageModel = mapTruckRoutePageDtoToModel(routePageDto)
		const insertSQL = SQLQueryBuilder.getInsertRoutePageSQL()

		try {
			await executeQuery(insertSQL, [routePageModel.uid, routePageModel.date_from, routePageModel.date_to, routePageModel.truck_uid || null, routePageModel.user_id || null, routePageModel.fuel_balance_at_start || 0, routePageModel.fuel_balance_at_end || 0, routePageModel.total_fuel_received_on_routes || null, routePageModel.total_fuel_consumed_on_routes || null, routePageModel.fuel_balance_at_routes_finish || null, routePageModel.odometer_at_route_start || null, routePageModel.odometer_at_route_finish || null, routePageModel.computed_total_routes_length || null, Date.now()])

			PlatformDataAdapter.logPlatformInfo('saveRoutePageToDatabase', `Saved route page: ${routePageModel.uid}`)
			return routePageDto.uid
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('saveRoutePageToDatabase', `Error: ${error}`)
			console.error('Save insert truck_route_page error: ', error)
			throw error
		} finally {
			const result = await executeSelect('SELECT a.* from truck_route_page a')
			console.log('insert truck_route_page: ', result)
		}
	}

	/**
	 * Save multiple route pages to database
	 */
	async saveRoutePagesToDatabase(routePageDtos: TruckRoutePageDto[]): Promise<string[]> {
		const savedIds: string[] = []

		for (const routePageDto of routePageDtos) {
			if (!routePageDto.uid) {
				continue
			}

			try {
				const savedId = await this.saveRoutePageToDatabase(routePageDto)
				savedIds.push(savedId)
			} catch (error) {
				PlatformDataAdapter.logPlatformInfo('saveRoutePagesToDatabase', `Failed to save route page ${routePageDto.uid}: ${error}`)
			}
		}

		return savedIds
	}

	/**
	 * Update route page in database
	 */
	async updateRoutePageInDatabase(routePageDto: TruckRoutePageDto): Promise<boolean> {
		if (!routePageDto.uid) {
			return false
		}

		// Recalculate computed total routes length for mobile platform
		if (!PlatformDataAdapter.isWeb()) {
			routePageDto.computedTotalRoutesLength = await this.calculateComputedTotalRoutesLength(routePageDto.uid)
		}

		const routePageModel = mapTruckRoutePageDtoToModel(routePageDto)
		const updateSQL = SQLQueryBuilder.getUpdateRoutePageSQL()

		try {
			await executeQuery(updateSQL, [routePageModel.date_from, routePageModel.date_to, routePageModel.truck_uid || null, routePageModel.fuel_balance_at_start || 0, routePageModel.fuel_balance_at_end || 0, routePageModel.total_fuel_received_on_routes || null, routePageModel.total_fuel_consumed_on_routes || null, routePageModel.fuel_balance_at_routes_finish || null, routePageModel.odometer_at_route_start || null, routePageModel.odometer_at_route_finish || null, routePageModel.computed_total_routes_length || null, Date.now(), routePageModel.uid])

			PlatformDataAdapter.logPlatformInfo('updateRoutePageInDatabase', `Updated route page: ${routePageModel.uid}`)
			return true
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('updateRoutePageInDatabase', `Error: ${error}`)
			console.error('Save update truck_route_page error: ', error)
			return false
		} finally {
			const result = await executeSelect('SELECT a.* from truck_route_page a where uid=' + routePageDto.uid)
			console.log('update truck_route_page uid:{}, result:{} ', routePageDto.uid, result)

		}
	}

	/**
	 * Save or update route page
	 */
	async saveOrUpdateRoutePage(routePageDto: TruckRoutePageDto, isUpdate: boolean = false): Promise<string> {
		if (isUpdate) {
			await this.updateRoutePageInDatabase(routePageDto)
			return routePageDto.uid
		} else {
			return await this.saveRoutePageToDatabase(routePageDto)
		}
	}

	/**
	 * Download route pages from server and store in local database
	 */
	async downloadRoutePages(): Promise<void> {
		if (PlatformDataAdapter.shouldSkipForWeb()) {
			return
		}

		if (await isOfflineMode()) {
			PlatformDataAdapter.logPlatformInfo('downloadRoutePages', 'Skipped - offline mode')
			return
		}

		try {
			PlatformDataAdapter.logPlatformInfo('downloadRoutePages', 'Starting download')

			const serverRoutePages = await this.fetchRoutePagesFromServer()

			if (serverRoutePages.length === 0) {
				PlatformDataAdapter.logPlatformInfo('downloadRoutePages', 'No route pages received from server')
				return
			}

			// Clear existing synced route pages
			await executeQuery(SQLQueryBuilder.getDeleteSyncedRoutePagesSQL())

			await this.saveRoutePagesToDatabase(serverRoutePages)

			PlatformDataAdapter.logPlatformInfo('downloadRoutePages', `Downloaded ${serverRoutePages.length} route pages`)

		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('downloadRoutePages', `Error: ${error}`)
			throw error
		}
	}

	/**
	 * Save truck route page with offline support
	 */
	async saveTruckRoutePage(routePageDto: TruckRoutePageDto): Promise<string> {
		const isUpdate = !!routePageDto.uid
		PlatformDataAdapter.logPlatformInfo('saveTruckRoutePage', `${isUpdate ? 'Update' : 'Create'} route page`)

		const uid = await this.saveOrUpdateRoutePage(routePageDto, isUpdate)

		// Add to offline queue
		await addOfflineOperation(isUpdate ? 'UPDATE' : 'CREATE', 'truck_route_page', isUpdate ? `/route-pages/${uid}` : '/route-pages', routePageDto)

		return uid
	}

	/**
	 * Get route pages with platform-specific handling
	 */
	async getRoutePages(): Promise<TruckRoutePageDto[]> {
		try {
			if (PlatformDataAdapter.isWeb()) {
				return await this.getRoutePagesWeb()
			} else {
				return await this.getRoutePagesMobile()
			}
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('getRoutePages', `Error: ${error}`)
			return []
		}
	}

	/**
	 * Get route pages for web platform with caching
	 */
	private async getRoutePagesWeb(): Promise<TruckRoutePageDto[]> {
		const connected = await isOnline()
		const forceOffline = await isOfflineMode()

		if (connected && !forceOffline) {
			try {
				const routePages = await PlatformDataAdapter.fetchFromServer<TruckRoutePageDto>('/route-pages')
				await PlatformDataAdapter.cacheDataForWeb('cached_route_pages', routePages)
				return routePages
			} catch (error) {
				PlatformDataAdapter.logPlatformInfo('getRoutePagesWeb', `Server fetch failed, using cache: ${error}`)
			}
		}

		return await PlatformDataAdapter.getCachedDataForWeb<TruckRoutePageDto>('cached_route_pages')
	}

	/**
	 * Get route pages for mobile platform from local database
	 */
	private async getRoutePagesMobile(): Promise<TruckRoutePageDto[]> {
		const result = await executeSelect(SQLQueryBuilder.getSelectRoutePagesSQL())

		console.log('dddddddddddddddddddddddddddd truck_object', await executeSelect('SELECT a.* from truck_object a'))
		console.log('dddddddddddddddddddddddddddd truck', await executeSelect('SELECT a.* from truck a'))
		console.log('dddddddddddddddddddddddddddd routes', await executeSelect('SELECT a.* from truck_route a'))
		console.log('dddddddddddddddddddddddddddd route-page', await executeSelect('SELECT a.* from truck_route_page a'))

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

	/**
	 * Check if route page exists for truck and date
	 */
	async checkRoutePageExists(truckId: string, date: string): Promise<TruckRoutePageDto | null> {
		try {
			if (PlatformDataAdapter.isWeb()) {
				return await this.checkRoutePageExistsWeb(truckId, date)
			} else {
				return await this.checkRoutePageExistsMobile(truckId, date)
			}
		} catch (error) {
			PlatformDataAdapter.logPlatformInfo('checkRoutePageExists', `Error: ${error}`)
			return null
		}
	}

	/**
	 * Check route page exists for web platform
	 */
	private async checkRoutePageExistsWeb(truckId: string, date: string): Promise<TruckRoutePageDto | null> {
		try {
			return await PlatformDataAdapter.fetchSingleFromServer<any>(`/route-pages/check?truckId=${truckId}&date=${date}`)
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null
			}
			PlatformDataAdapter.logPlatformInfo('checkRoutePageExistsWeb', `Error: ${error}`)
			return null
		}
	}

	/**
	 * Check route page exists for mobile platform
	 */
	private async checkRoutePageExistsMobile(truckId: string, date: string): Promise<TruckRoutePageDto | null> {
		const result = await executeSelectFirst(SQLQueryBuilder.getCheckRoutePageExistsSQL(), [truckId, date, date])

		if (!result) return null

		return mapSingleTruckRoutePageResultToDto(result)
	}
}
