import {TruckObjectDto} from '@/dto/TruckObjectDto'
import {TruckRouteDto} from '@/dto/TruckRouteDto'
import {isOfflineMode} from '@/services/offlineService'
import {generateUniqueId} from '@/utils/idUtils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Platform} from 'react-native'
import freightAxiosInstance from '../config/freightAxios'
import {TruckRoutePageDto} from '../dto/TruckRoutePageDto'
import {executeQuery, executeSelect, executeSelectFirst, executeTransaction} from './database'
import { isOnline } from '../services/networkService'
import { mapTruckRoutePageDtoToModel } from '../mapers/TruckRoutePageMapper'
import { addOfflineOperation } from './offlineQueue'

type SQLiteDatabase = any

class OfflineDataManager {


	private getInsertTruckSQL(): string {
		return `
			INSERT OR REPLACE INTO truck
			(uid, truck_maker, truck_model, registration_number, fuel_consumption_norm, is_default, is_dirty, is_deleted, synced_at)
			VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
		`
	}

	private getInsertObjectSQL(): string {
		return `
			INSERT OR REPLACE INTO truck_object
			(uid, name, is_dirty, is_deleted, synced_at)
			VALUES (?, ?, 0, 0, ?)
		`
	}

	private getInsertTruckRouteSQL(): string {
		return `
			INSERT OR REPLACE INTO truck_routes
			(uid, truck_route_page_uid, route_date, route_number, cargo_volume,
			 out_truck_object_uid, odometer_at_start, out_date_time,
			 odometer_at_finish, in_truck_object_uid, in_date_time,
			 route_length, fuel_balance_at_start, fuel_consumed,
			 fuel_received, fuel_balance_at_finish, created_date_time,
			 last_modified_date_time, unit_type_id, is_dirty, is_deleted, synced_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
		`
	}

	private getInsertRoutePageSQL(): string {
		return `
			INSERT OR REPLACE INTO truck_route_page
			(uid, date_from, date_to, truck_uid, user_id, fuel_balance_at_start, fuel_balance_at_end,
			 total_fuel_received_on_routes, total_fuel_consumed_on_routes, fuel_balance_at_routes_finish,
			 odometer_at_route_start, odometer_at_route_finish, computed_total_routes_length,
			 is_dirty, is_deleted, synced_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
		`
	}



	async downloadTrucks(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			return
		}

		if (await isOfflineMode()) {
			return
		}

		try {
			const {data: serverTrucks} = await freightAxiosInstance.get<any[]>('/trucks')

			if (!Array.isArray(serverTrucks) || serverTrucks.length === 0) {
				return
			}

			await executeQuery('DELETE FROM truck WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = this.getInsertTruckSQL()

			if (db) {
				await executeTransaction(async (database) => {
					for (const truck of serverTrucks) {
						if (!truck.uid) {
							continue
						}

						await database.runAsync(insertSQL, [truck.uid, truck.truckMaker || '', truck.truckModel || '', truck.registrationNumber || '', truck.fuelConsumptionNorm || 0, truck.isDefault ? 1 : 0, Date.now()])
					}
				})
			} else {
				for (const truck of serverTrucks) {
					if (!truck.uid) {
						continue
					}

					await executeQuery(insertSQL, [truck.uid, truck.truckMaker || '', truck.truckModel || '', truck.registrationNumber || '', truck.fuelConsumptionNorm || 0, truck.isDefault ? 1 : 0, Date.now()])
				}
			}

		} catch (error: any) {
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				throw new Error(userFriendlyMessage)
			}

			throw error
		}
	}

	async getTrucks(): Promise<any[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getTrucksWeb()
			} else {
				return await this.getTrucksMobile()
			}
		} catch (error) {
			return []
		}
	}

	private async getTrucksWeb(): Promise<any[]> {
		try {
			const response = await freightAxiosInstance.get<any[]>('/trucks')
			return response.data || []
		} catch (error) {
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

		const result = await executeSelect(sql)

		return Array.isArray(result) ? result : []
	}

	async getTruckById(truckId: string): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.getTruckByIdWeb(truckId)
			} else {
				return await this.getTruckByIdMobile(truckId)
			}
		} catch (error) {
			return null
		}
	}

	private async getTruckByIdWeb(truckId: string): Promise<any | null> {
		try {
			const response = await freightAxiosInstance.get<any>(`/trucks/${truckId}`)
			return response.data || null
		} catch (error) {
			return null
		}
	}

	private async getTruckByIdMobile(truckId: string): Promise<any | null> {
		const sql = `
            SELECT *
            FROM truck
            WHERE uid = ? AND is_deleted = 0
		`

		const result = await executeSelectFirst(sql, [truckId])

		return result || null
	}

	async downloadObjects(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			return
		}

		if (await isOfflineMode()) {
			return
		}

		try {
			const {data: serverObjects} = await freightAxiosInstance.get<TruckObjectDto[]>('/objects')

			if (!Array.isArray(serverObjects) || serverObjects.length === 0) {
				return
			}

			await executeQuery('DELETE FROM truck_object WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = this.getInsertObjectSQL()

			if (db) {
				await executeTransaction(async (database) => {
					for (const obj of serverObjects) {
						if (!obj.uid) {
							continue
						}

						await database.runAsync(insertSQL, [obj.uid, obj.name || '', Date.now()])
					}
				})
			} else {
				for (const obj of serverObjects) {
					if (!obj.uid) {
						continue
					}

					await executeQuery(insertSQL, [obj.uid, obj.name || '', Date.now()])
				}
			}

		} catch (error: any) {
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				throw new Error(userFriendlyMessage)
			}

			throw error
		}
	}

	async getObjects(): Promise<any[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getObjectsWeb()
			} else {
				return await this.getObjectsMobile()
			}
		} catch (error) {
			return []
		}
	}

	private async getObjectsWeb(): Promise<any[]> {
		try {
			const response = await freightAxiosInstance.get<any[]>('/truck-objects')
			return response.data || []
		} catch (error) {
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

		const result = await executeSelect(sql)

		return Array.isArray(result) ? result : []
	}

	async downloadTruckRoutes(db?: SQLiteDatabase): Promise<void> {
		if (Platform.OS === 'web') {
			return
		}

		if (await isOfflineMode()) {
			return
		}

		try {
			const {data: serverTruckRoutes} = await freightAxiosInstance.get<any[]>('/truck-routes')

			if (!Array.isArray(serverTruckRoutes) || serverTruckRoutes.length === 0) {
				return
			}

			await executeQuery('DELETE FROM truck_routes WHERE synced_at IS NOT NULL AND is_dirty = 0')

			const insertSQL = this.getInsertTruckRouteSQL()

			if (db) {
				await executeTransaction(async (database) => {
					for (const route of serverTruckRoutes) {
						if (!route.uid) {
							continue
						}

						await database.runAsync(insertSQL,
								[
									route.uid,
									route.truckRoutePage?.uid || null,
									route.routeDate,
									route.routeNumber || null,
									route.cargoVolume || 0,
									route.outTruckObject?.uid || null,
									route.odometerAtStart || 0,
									route.outDateTime,
									route.odometerAtFinish || null,
									route.inTruckObject?.uid || null,
									route.inDateTime || null,
									route.routeLength || null,
									route.fuelBalanceAtStart || null,
									route.fuelConsumed || null,
									route.fuelReceived || null,
									route.fuelBalanceAtFinish || null,
									route.createdDateTime || null,
									route.lastModifiedDateTime || null,
									route.unitTypeId || null,
									Date.now()
								]
						)
					}
				})
			} else {
				for (const route of serverTruckRoutes) {
					if (!route.uid) {
						continue
					}

					await executeQuery(insertSQL,
							[
								route.uid,
								route.truckRoutePage?.uid || null,
								route.routeDate,
								route.routeNumber || null,
								route.cargoVolume || 0,
								route.outTruckObject?.uid || null,
								route.odometerAtStart || 0,
								route.outDateTime,
								route.odometerAtFinish || null,
								route.inTruckObject?.uid || null,
								route.inDateTime || null,
								route.routeLength || null,
								route.fuelBalanceAtStart || null,
								route.fuelConsumed || null,
								route.fuelReceived || null,
								route.fuelBalanceAtFinish || null,
								route.createdDateTime || null,
								route.lastModifiedDateTime || null,
								route.unitTypeId ||
								null,
								Date.now()
							]
					)
				}
			}

		} catch (error: any) {
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				throw new Error(userFriendlyMessage)
			} else if (error.response?.status != 404) {
				throw error
			}
		}
	}

	async getTruckRoutes(truckRoutePageUid?: string): Promise<any[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getTruckRoutesWeb(truckRoutePageUid)
			} else {
				return await this.getTruckRoutesMobile(truckRoutePageUid)
			}
		} catch (error) {
			return []
		}
	}

	private async getTruckRoutesWeb(truckRoutePageUid?: string): Promise<any[]> {
		try {
			const endpoint = truckRoutePageUid ? `/truck-routes?truckRoutePageUid=${truckRoutePageUid}` : '/truck-routes'
			const response = await freightAxiosInstance.get<any[]>(endpoint)
			return response.data || []
		} catch (error) {
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

		const result = await executeSelect(sql, params)

		return Array.isArray(result) ? result : []
	}

	async fetchRoutePagesFromServer(): Promise<TruckRoutePageDto[]> {
		try {
			const {data: serverRoutePages} = await freightAxiosInstance.get<TruckRoutePageDto[]>('/route-pages')
			
			if (!Array.isArray(serverRoutePages) || serverRoutePages.length === 0) {
				return []
			}
			
			return serverRoutePages
		} catch (error: any) {
			if (error.response?.status === 403) {
				const userFriendlyMessage = 'Jums nav piešķirtas tiesības - sazinieties ar Administratoru!'
				throw new Error(userFriendlyMessage)
			} else if (error.response?.status != 404) {
				throw error
			}
			return []
		}
	}

	async saveRoutePageToDatabase(routePageDto: TruckRoutePageDto): Promise<string> {
		if (!routePageDto.uid) {
			routePageDto.uid = generateUniqueId()
		}
		
		const routePageModel = mapTruckRoutePageDtoToModel(routePageDto)
		
		const insertSQL = this.getInsertRoutePageSQL()
		
		try {
			await executeQuery(insertSQL, [
				routePageModel.uid,
				routePageModel.date_from,
				routePageModel.date_to,
				routePageModel.truck_uid || null,
				routePageModel.user_id || null,
				routePageModel.fuel_balance_at_start || 0,
				routePageModel.fuel_balance_at_end || 0,
				routePageModel.total_fuel_received_on_routes || null,
				routePageModel.total_fuel_consumed_on_routes || null,
				routePageModel.fuel_balance_at_routes_finish || null,
				routePageModel.odometer_at_route_start || null,
				routePageModel.odometer_at_route_finish || null,
				routePageModel.computed_total_routes_length || null,
				Date.now()
			])
			console.info("Save truck_route_page: ", routePageModel)
			return routePageDto.uid
		} catch (error) {
			console.error("Save insert truck_route_page error: ", error)
			throw error
		}
	}

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
			}
		}
		
		return savedIds
	}

	async updateRoutePageInDatabase(routePageDto: TruckRoutePageDto): Promise<boolean> {
		if (!routePageDto.uid) {
			return false
		}
		
		const routePageModel = mapTruckRoutePageDtoToModel(routePageDto)
		
		const updateSQL = `
			UPDATE truck_route_page 
			SET date_from = ?, date_to = ?, truck_uid = ?, 
				fuel_balance_at_start = ?, fuel_balance_at_end = ?,
				total_fuel_received_on_routes = ?, total_fuel_consumed_on_routes = ?,
				fuel_balance_at_routes_finish = ?, odometer_at_route_start = ?,
				odometer_at_route_finish = ?, computed_total_routes_length = ?,
				is_dirty = 1, updated_at = ?
			WHERE uid = ?
		  `
		
		try {
			await executeQuery(updateSQL, [
				routePageModel.date_from,
				routePageModel.date_to,
				routePageModel.truck_uid || null,
				routePageModel.fuel_balance_at_start || 0,
				routePageModel.fuel_balance_at_end || 0,
				routePageModel.total_fuel_received_on_routes || null,
				routePageModel.total_fuel_consumed_on_routes || null,
				routePageModel.fuel_balance_at_routes_finish || null,
				routePageModel.odometer_at_route_start || null,
				routePageModel.odometer_at_route_finish || null,
				routePageModel.computed_total_routes_length || null,
				Date.now(),
				routePageModel.uid
			])
			
			return true
		} catch (error) {
			console.error("Save update truck_route_page error: ", error)
			return false
		}
	}

	async saveOrUpdateRoutePage(routePageDto: TruckRoutePageDto, isUpdate: boolean = false): Promise<string> {
		if (isUpdate) {
			await this.updateRoutePageInDatabase(routePageDto)
			return routePageDto.uid
		} else {
			return await this.saveRoutePageToDatabase(routePageDto)
		}
	}

	async downloadRoutePages(): Promise<void> {
		if (Platform.OS === 'web') {
			return
		}

		if (await isOfflineMode()) {
			return
		}

		try {
			const serverRoutePages = await this.fetchRoutePagesFromServer()
			
			if (serverRoutePages.length === 0) {
				return
			}

			await executeQuery('DELETE FROM truck_route_page WHERE synced_at IS NOT NULL AND is_dirty = 0')
			
			await this.saveRoutePagesToDatabase(serverRoutePages)
			
		} catch (error) {
			throw error
		}
	}

	async saveTruckRoutePage(routePageDto: TruckRoutePageDto): Promise<string> {
		const isUpdate = !!routePageDto.uid
		console.log("isUpdateisUpdateisUpdateisUpdate",isUpdate, !!routePageDto.uid)
		const uid = await this.saveOrUpdateRoutePage(routePageDto, isUpdate)
		console.log('SAVED saveOrUpdateRoutePage', uid)
		
		await addOfflineOperation(
			isUpdate ? 'UPDATE' : 'CREATE',
			'truck_route_page',
			isUpdate ? `/route-pages/${uid}` : '/route-pages',
			routePageDto
		)
		
		return uid
	}

	async getRoutePages(): Promise<TruckRoutePageDto[]> {
		try {
			if (Platform.OS === 'web') {
				return await this.getRoutePagesWeb()
			} else {
				return await this.getRoutePagesMobile()
			}
		} catch (error) {
			return []
		}
	}

	private async getRoutePagesWeb(): Promise<TruckRoutePageDto[]> {
		const connected = await isOnline()
		const forceOffline = await isOfflineMode()

		if (connected && !forceOffline) {
			try {
				const response = await freightAxiosInstance.get<TruckRoutePageDto[]>('/route-pages')
				const routePages = response.data || []

				await AsyncStorage.setItem('cached_route_pages', JSON.stringify(routePages))
				await AsyncStorage.setItem('cached_route_pages_timestamp', Date.now().toString())

				return routePages
			} catch (error) {
			}
		}

		try {
			const cached = await AsyncStorage.getItem('cached_route_pages')
			if (cached) {
				return JSON.parse(cached)
			}
		} catch (error) {
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

		const result = await executeSelect(sql)
		const result1 = await executeSelect('SELECT a.* from user a')
		console.log("dddddddddddddddddddddddddddd",result1)

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

	async getRoutePoint(): Promise<string> {
		const lastActiveRoute = await offlineDataManager.getLastActiveRoute()
		return lastActiveRoute ? "FINISH" : "START"
	}

	async saveTruckRoute(type: 'startRoute' | 'endRoute', data: TruckRouteDto): Promise<string> {
		const tempId = data.uid || generateUniqueId();
		const endpoint = type === 'startRoute' ? '/truck-routes' : `/truck-routes/${data.uid}`;
		const operationType = type === 'startRoute' ? 'CREATE' : 'UPDATE';

		const truckRoutePageUid = this.saveTruckRoutePage(data.truckRoutePage)

		await executeQuery(
				'INSERT INTO offline_operations (id, type, table_name, endpoint, data, timestamp, retries, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
				[tempId, operationType, 'truck_routes', endpoint, JSON.stringify(data), Date.now(), 0, 'pending']
		);

		try {
			if (type === 'startRoute') {
				const insertSQL = this.getInsertTruckRouteSQL();
				await executeQuery(insertSQL, [
					tempId,
					truckRoutePageUid,
					data.routeDate,
					null,
					data.cargoVolume || 0,
					data.outTruckObject?.uid,
					data.odometerAtStart,
					data.outDateTime,
					null,
					null,
					null,
					null,
					data.fuelBalanceAtStart,
					null,
					data.fuelReceived || null,
					null,
					null,
					null,
					data.unitType,
					Date.now()
				]);
			} else {
				await executeQuery(`
                    UPDATE truck_routes
                    SET
                        in_truck_object_uid = ?,
                        odometer_at_finish = ?,
                        in_date_time = ?,
                        route_length = ?,
                        fuel_balance_at_finish = ?,
                        is_dirty = 1
                    WHERE uid = ?
				`, [
					data.inTruckObject?.uid,
					data.odometerAtFinish,
					data.inDateTime,
					(data.odometerAtFinish || 0) - (data.odometerAtStart || 0),
					data.fuelBalanceAtFinish,
					data.uid
				]);
			}
		} catch (error) {
			console.error(error)
		}

		return tempId;
	}

	async getLastActiveRoute(): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.getLastActiveRouteWeb()
			} else {
				return await this.getLastActiveRouteMobile()
			}
		} catch (error) {
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
		const res = await executeSelectFirst(sql)
		return  res
	}

	async getLastFinishedRoute(): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.getLastFinishedRouteWeb()
			} else {
				return await this.getLastFinishedRouteMobile()
			}
		} catch (error) {
			return null
		}
	}

	private async getLastFinishedRouteWeb(): Promise<any | null> {
		try {
			const response = await freightAxiosInstance.get('/truck-routes/last-finished')
			return response.data
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null
			}
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

	async checkRoutePageExists(truckId: string, date: string): Promise<any | null> {
		try {
			if (Platform.OS === 'web') {
				return await this.checkRoutePageExistsWeb(truckId, date)
			} else {
				return await this.checkRoutePageExistsMobile(truckId, date)
			}
		} catch (error) {
			return null
		}
	}

	private async checkRoutePageExistsWeb(truckId: string, date: string): Promise<any | null> {
		try {
			const response = await freightAxiosInstance.get(`/route-pages/check?truckId=${truckId}&date=${date}`)
			return response.data
		} catch (error: any) {
			if (error.response?.status === 404) {
				return null
			}
			return null
		}
	}

	private async checkRoutePageExistsMobile(truckId: string, date: string): Promise<any | null> {
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
            WHERE trp.truck_uid = ?
              AND date(trp.date_from) <= date(?)
              AND date(trp.date_to) >= date(?)
              AND trp.is_deleted = 0
            LIMIT 1
		`
		
		const result = await executeSelectFirst(sql, [truckId, date, date])
		
		if (!result) return null
		
		return {
			uid: result.uid,
			dateFrom: result.date_from,
			dateTo: result.date_to,
			truck: result.truck_uid ? {
				uid: result.truck_uid,
				truckMaker: result.truck_maker || '',
				truckModel: result.truck_model || '',
				registrationNumber: result.registration_number || '',
				fuelConsumptionNorm: result.fuel_consumption_norm || 0,
				isDefault: result.is_default || 0
			} : null,
			user: result.user_id ? {
				id: result.user_id, 
				email: result.email || '', 
				givenName: result.given_name || '', 
				familyName: result.family_name || ''
			} : null,
			fuelBalanceAtStart: result.fuel_balance_at_start || 0,
			fuelBalanceAtFinish: result.fuel_balance_at_end || 0,
			totalFuelReceivedOnRoutes: result.total_fuel_received_on_routes,
			totalFuelConsumedOnRoutes: result.total_fuel_consumed_on_routes,
			fuelBalanceAtRoutesFinish: result.fuel_balance_at_routes_finish,
			odometerAtRouteStart: result.odometer_at_route_start,
			odometerAtRouteFinish: result.odometer_at_route_finish,
			computedTotalRoutesLength: result.computed_total_routes_length
		}
	}

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

export const getRoutePages = () => offlineDataManager.getRoutePages()
export const downloadServerData = () => offlineDataManager.syncAllData()
export const getTrucks = () => offlineDataManager.getTrucks()
export const getObjects = () => offlineDataManager.getObjects()
export const getLastActiveRoute = () => offlineDataManager.getLastActiveRoute()
export const getLastFinishedRoute = () => offlineDataManager.getLastFinishedRoute()
export const checkRoutePageExists = (truckId: string, date: string) => offlineDataManager.checkRoutePageExists(truckId, date)
export const getRoutePoint = () => offlineDataManager.getRoutePoint()
export const saveTruckRouteLocally = (type: 'startRoute' | 'endRoute', data: TruckRouteDto) => offlineDataManager.saveTruckRoute(type, data)
