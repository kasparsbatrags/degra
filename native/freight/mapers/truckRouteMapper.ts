import { TruckRouteDto } from '@/dto/TruckRouteDto';
import { TruckRoute } from '@/models/TruckRoute';

export const mapTruckRouteDtoToModel = (routePages: TruckRouteDto[]): TruckRoute[] => {
	return routePages
			.map((route, index) => {
				const transformed: TruckRoute = {
					uid: route.uid,
					dateFrom: route.date_from || '',
					dateTo: route.date_to || '',
					truckRegistrationNumber: route.truck_registration_number || '',
					fuelConsumptionNorm: route.fuel_consumption_norm ?? 0,
					fuelBalanceAtStart: route.fuel_balance_at_start ?? 0,
					totalFuelReceivedOnRoutes: route.total_fuel_received_on_routes ?? null,
					totalFuelConsumedOnRoutes: route.total_fuel_consumed_on_routes ?? null,
					fuelBalanceAtRoutesFinish: route.fuel_balance_at_routes_finish ?? null,
					odometerAtRouteStart: route.odometer_at_route_start ?? null,
					odometerAtRouteFinish: route.odometer_at_route_finish ?? null,
					computedTotalRoutesLength: route.computed_total_routes_length ?? null,
					activeTab: 'basic',
				};

				return transformed;
			})
			.filter(route => {
				const isValid = route.uid && route.dateFrom && route.dateTo && route.truckRegistrationNumber;
				if (!isValid) {
					console.warn('📱 [WARN] Invalid route:', route);
				}
				return isValid;
			});
};


export const mapTruckRouteModelToDto = (routePages: TruckRoute[]): TruckRoutePageDto[] => {
	if (!Array.isArray(routePages)) {
		console.warn('📱 [WARN] Invalid routePages data:', routePages)
		return []
	}

	return routePages.map((route, index) => {
		console.log('📱 [DEBUG] Transforming route at index', index, ':', route);

		// Backend-compatible field mapping with fallbacks
		const transformed = {
			uid: route.uid, // Backend-compatible
			dateFrom: route.date_from || route.dateFrom,
			dateTo: route.date_to || route.dateTo,
			truckRegistrationNumber: route.truck_registration_number || route.truckRegistrationNumber,
			fuelConsumptionNorm: route.fuel_consumption_norm || route.fuelConsumptionNorm || 0,
			fuelBalanceAtStart: route.fuel_balance_at_start || route.fuelBalanceAtStart || 0,
			totalFuelReceivedOnRoutes: route.total_fuel_received_on_routes ?? route.totalFuelReceivedOnRoutes ?? null,
			totalFuelConsumedOnRoutes: route.total_fuel_consumed_on_routes ?? route.totalFuelConsumedOnRoutes ?? null,
			fuelBalanceAtRoutesFinish: route.fuel_balance_at_routes_finish ?? route.fuelBalanceAtRoutesFinish ?? null,
			odometerAtRouteStart: route.odometer_at_route_start ?? route.odometerAtRouteStart ?? null,
			odometerAtRouteFinish: route.odometer_at_route_finish ?? route.odometerAtRouteFinish ?? null,
			computedTotalRoutesLength: route.computed_total_routes_length ?? route.computedTotalRoutesLength ?? null,
			activeTab: 'basic' as const
		};

		console.log('📱 [DEBUG] Transformed route:', transformed);
		return transformed;
	}).filter(route => {
		// Validation with better error messages
		console.log("=============================================")
		console.log(route)
		const isValid = route.uid && route.dateFrom && route.dateTo && route.truckRegistrationNumber;
		if (!isValid) {
			console.warn('📱 [WARN] Filtering out invalid route:', {
				uid: route.uid,
				dateFrom: route.dateFrom,
				dateTo: route.dateTo,
				truckRegistrationNumber: route.truckRegistrationNumber
			});
		}
		return isValid;
	});
};