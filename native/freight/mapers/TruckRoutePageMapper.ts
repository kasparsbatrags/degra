import {TruckDto} from '@/dto/TruckDto'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import {UserDto} from '@/dto/UserDto'
import {TruckRoutePage} from '@/models/TruckRoutePage'


export const mapTruckRoutePageModelToDto = (routePages: TruckRoutePage[]): TruckRoutePageDto[] => {
	if (!Array.isArray(routePages)) {
		console.warn('📱 [WARN] Invalid routePages data:', routePages)
		return []
	}

	return routePages.map((routePage, index) => {
		console.log('📱 [DEBUG] Transforming route at index', index, ':', routePage);

		const truck:TruckDto = {
			uid: routePage.truck_uid,
			truckMaker: routePage.truck_maker,
			truckModel: routePage.truck_model,
			registrationNumber: routePage.registration_number,
			fuelConsumptionNorm: routePage.fuel_consumption_norm,
			isDefault: routePage.is_default,
		}

		const  user:UserDto = {
			id: routePage.user_id,
			givenName: routePage.givenName,
			familyName: routePage.familyName,
		}

		const transformed = {

			uid: routePage.uid, // Backend-compatible
			dateFrom: routePage.date_from,
			dateTo: routePage.date_to,
			truck: truck,
			user: user,

			fuelConsumptionNorm: routePage.fuel_consumption_norm || 0,
			fuelBalanceAtStart: routePage.fuel_balance_at_start || 0,
			totalFuelReceivedOnRoutes: routePage.total_fuel_received_on_routes || 0,
			totalFuelConsumedOnRoutes: routePage.total_fuel_consumed_on_routes || 0,
			fuelBalanceAtRoutesFinish: routePage.fuel_balance_at_routes_finish || 0,

			odometerAtRouteStart: routePage.odometer_at_route_start || 0,
			odometerAtRouteFinish: routePage.odometer_at_route_finish || 0,
			computedTotalRoutesLength: routePage.computed_total_routes_length || 0,
		};

		console.log('📱 [DEBUG] Transformed route:', transformed);
		return transformed;
	}).filter(route => {

		const isValid = route.uid && route.dateFrom && route.dateTo && route.truck.registrationNumber;
		if (!isValid) {
			console.warn('📱 [WARN] Filtering out invalid route:', {
				uid: route.uid,
				dateFrom: route.dateFrom,
				dateTo: route.dateTo,
				truckRegistrationNumber: route.truck.registrationNumber
			});
		}
		return isValid;
	});
};
