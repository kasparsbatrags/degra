import {TruckDto} from '@/dto/TruckDto'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import {UserDto} from '@/dto/UserDto'
import {TruckRoutePage} from '@/models/TruckRoutePage'

export const mapTruckRoutePageModelToDto = async (
	routePages: TruckRoutePage[],
	getTruckById: (id: string) => Promise<any>
): Promise<TruckRoutePageDto[]> => {
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

			mappedRoutes.push(transformed)
		} catch (error) {
		}
	}

	return mappedRoutes.filter(route => {
		const isValid = route.uid && route.dateFrom && route.dateTo && route.truck.registrationNumber
		if (!isValid) {
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
  };
};
