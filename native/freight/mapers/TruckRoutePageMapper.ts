import {TruckDto} from '@/dto/TruckDto'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import {UserDto} from '@/dto/UserDto'
import {TruckRoutePage} from '@/models/TruckRoutePage'
import {offlineDataManagerExtended} from '@/utils/offlineDataManagerExtended'

export const mapTruckRoutePageModelToDto = async (routePages: TruckRoutePage[]): Promise<TruckRoutePageDto[]> => {
	if (!Array.isArray(routePages)) {
		console.warn('📱 [WARN] Invalid routePages data:', routePages)
		return []
	}

	const mappedRoutes: TruckRoutePageDto[] = []

	for (let i = 0; i < routePages.length; i++) {
		const routePage = routePages[i]
		console.log('📱 [DEBUG] Transforming route at index', i, ':', routePage)

		try {

			if (!routePage.uid || !routePage.date_from || !routePage.date_to) {
				console.warn('📱 [WARN] Skipping route with missing required fields:', {
					uid: routePage.uid, dateFrom: routePage.date_from, dateTo: routePage.date_to
				})
				continue
			}

			let truckData = null
			if (routePage.truck_uid) {
				truckData = await offlineDataManagerExtended.getTruckById(routePage.truck_uid)
			}

			const truck: TruckDto = {
				uid: routePage.truck_uid || '',
				truckMaker: truckData?.truck_maker || routePage.truck_maker || '',
				truckModel: truckData?.truck_model || routePage.truck_model || '',
				registrationNumber: truckData?.registration_number || routePage.registration_number || '',
				fuelConsumptionNorm: truckData?.fuel_consumption_norm || routePage.fuel_consumption_norm || 0,
				isDefault: truckData?.is_default || routePage.is_default || false,
			}

			const user: UserDto = {
				id: routePage.user_id || '', givenName: routePage.givenName || '', familyName: routePage.familyName || '',
			}

			const transformed: TruckRoutePageDto = {
				uid: routePage.uid,
				dateFrom: routePage.date_from,
				dateTo: routePage.date_to,
				truck: truck,
				user: user,

				fuelBalanceAtStart: routePage.fuel_balance_at_start || null,
				fuelBalanceAtFinish: routePage.fuel_balance_at_end || 0,
				totalFuelReceivedOnRoutes: routePage.total_fuel_received_on_routes || 0,
				totalFuelConsumedOnRoutes: routePage.total_fuel_consumed_on_routes || 0,
				fuelBalanceAtRoutesFinish: routePage.fuel_balance_at_routes_finish || 0,

				odometerAtRouteStart: routePage.odometer_at_route_start || 0,
				odometerAtRouteFinish: routePage.odometer_at_route_finish || 0,
				computedTotalRoutesLength: routePage.computed_total_routes_length || 0,
			}

			console.log('📱 [DEBUG] Transformed route:', transformed)
			mappedRoutes.push(transformed)
		} catch (error) {
			console.error('📱 [ERROR] Failed to transform route:', error)
			// Ja vēlamies, varam turpināt ar nākamo ierakstu, nevis pārtraukt visu procesu
		}
	}

	// Filtrējam nederīgos ierakstus
	return mappedRoutes.filter(route => {
		const isValid = route.uid && route.dateFrom && route.dateTo && route.truck.registrationNumber
		if (!isValid) {
			console.warn('📱 [WARN] Filtering out invalid route:', {
				uid: route.uid, dateFrom: route.dateFrom, dateTo: route.dateTo, truckRegistrationNumber: route.truck.registrationNumber
			})
		}
		return isValid
	})
}
