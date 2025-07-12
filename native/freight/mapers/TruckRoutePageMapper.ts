import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import {TruckRoutePage} from '@/models/TruckRoutePage'
import {TruckDto} from '@/dto/TruckDto'
import {mapTruckResultFromRoutePageToDto, mapTruckResultToDto} from './TruckMapper'

export const mapTruckRoutePageModelToDto = async (routePages: TruckRoutePage[],
		getTruckById: (id: string) => Promise<TruckDto | null>): Promise<TruckRoutePageDto[]> => {
	if (!Array.isArray(routePages)) {
		return []
	}

	const mappedRoutes: TruckRoutePageDto[] = []

	for (let i = 0; i < routePages.length; i++) {
		const routePage = routePages[i]

		try {
			if (!routePage.uid || !routePage.date_from || !routePage.date_to) {
				continue
			}

			let truckData = null
			if (routePage.truck_uid) {
				truckData = await getTruckById(routePage.truck_uid)
			}

			// Merge truck data with route page data to create enriched result object
			const enrichedResult = {
				...routePage,
				// Override with fetched truck data if available (TruckDto uses camelCase)
				truck_maker: truckData?.truckMaker || routePage.truck_maker,
				truck_model: truckData?.truckModel || routePage.truck_model,
				registration_number: truckData?.registrationNumber || routePage.registration_number,
				fuel_consumption_norm: truckData?.fuelConsumptionNorm || routePage.fuel_consumption_norm,
				is_default: truckData?.isDefault || routePage.is_default,
			}

			// Use the consistent mapping function
			const transformed = mapSingleTruckRoutePageResultToDto(enrichedResult)
			mappedRoutes.push(transformed)
		} catch (error) {
			// Silent error handling - skip invalid entries
		}
	}

	return mappedRoutes.filter(route => {
		const isValid = route.uid && route.dateFrom && route.dateTo && route.truck.registrationNumber
		if (!isValid) {
			// Could log validation issues here if needed
		}
		return isValid
	})
}

export const mapTruckRoutePageDtoToModel = (routePageDto: TruckRoutePageDto): TruckRoutePage => {
	return {
		uid: routePageDto.uid,
		date_from: routePageDto.dateFrom,
		date_to: routePageDto.dateTo,
		truck_uid: routePageDto.truck?.uid,

		truck_maker: routePageDto.truck?.truckMaker,
		truck_model: routePageDto.truck?.truckModel,
		registration_number: routePageDto.truck?.registrationNumber,
		fuel_consumption_norm: routePageDto.truck?.fuelConsumptionNorm,
		is_default: routePageDto.truck?.isDefault ? 1 : 0,

		user_id: routePageDto.user?.id,
		email: routePageDto.user?.email,
		givenName: routePageDto.user?.givenName,
		familyName: routePageDto.user?.familyName,

		fuel_balance_at_start: routePageDto.fuelBalanceAtStart || 0,
		fuel_balance_at_end: routePageDto.fuelBalanceAtFinish,

		total_fuel_received_on_routes: routePageDto.totalFuelReceivedOnRoutes,
		total_fuel_consumed_on_routes: routePageDto.totalFuelConsumedOnRoutes,
		fuel_balance_at_routes_finish: routePageDto.fuelBalanceAtRoutesFinish,

		odometer_at_route_start: routePageDto.odometerAtRouteStart,
		odometer_at_route_finish: routePageDto.odometerAtRouteFinish,
		computed_total_routes_length: routePageDto.computedTotalRoutesLength,

		is_dirty: 1,
		is_deleted: 0,
		created_at: Date.now(),
		updated_at: Date.now()
	}
}

/**
 * Map single database result to TruckRoutePageDto
 * Synchronous version for single items
 */
export const mapSingleTruckRoutePageResultToDto = (result: any): TruckRoutePageDto => {
	return {
		uid: result.uid,
		dateFrom: result.date_from,
		dateTo: result.date_to,
		truck: result.truck_uid ? mapTruckResultFromRoutePageToDto(result) : {
			uid: '', truckMaker: '', truckModel: '', registrationNumber: 'Nav pieejams', fuelConsumptionNorm: 0, isDefault: 0
		},
		user: result.user_id ? {
			id: result.user_id, email: result.email || '', givenName: result.given_name || '', familyName: result.family_name || ''
		} : {
			id: '', email: '', givenName: '', familyName: ''
		},
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
