import { TruckRouteDto, CreateTruckRouteDto } from '@/dto/TruckRouteDto';
import { TruckRoute } from '@/models/TruckRoute';

export const mapTruckRouteDtoToModel = (routePages: TruckRouteDto[]): TruckRoute[] => {
	return routePages
		.map((route, index) => {
			const transformed: TruckRoute = {
				uid: route.uid,
				truck_route_page_uid: route.truckRoutePage?.uid || '',
				route_date: route.routeDate,
				route_number: route.routeNumber,
				cargo_volume: route.cargoVolume,
				out_truck_object_uid: route.outTruckObject?.uid || '',
				odometer_at_start: route.odometerAtStart,
				out_date_time: route.outDateTime,
				odometer_at_finish: route.odometerAtFinish,
				in_truck_object_uid: route.inTruckObject?.uid,
				in_date_time: route.inDateTime,
				route_length: route.routeLength,
				fuel_balance_at_start: route.fuelBalanceAtStart,
				fuel_consumed: route.fuelConsumed,
				fuel_received: route.fuelReceived,
				fuel_balance_at_finish: route.fuelBalanceAtFinish,
				unit_type_id: route.unitType ? parseInt(route.unitType) : undefined,
			};

			return transformed;
		})
		.filter(route => {
			const isValid = route.uid && route.route_date && route.out_truck_object_uid;
			if (!isValid) {
				console.warn('📱 [WARN] Invalid route:', route);
			}
			return isValid;
		});
};


export const mapTruckRouteModelToDto = (routes: TruckRoute[]): CreateTruckRouteDto[] => {
	if (!Array.isArray(routes)) {
		console.warn('📱 [WARN] Invalid routes data:', routes)
		return []
	}

	return routes.map((route, index) => {
		console.log('📱 [DEBUG] Transforming route at index', index, ':', route);

		const transformed: CreateTruckRouteDto = {
			truckRoutePageUid: route.truck_route_page_uid,
			routeDate: route.route_date,
			routeNumber: route.route_number,
			cargoVolume: route.cargo_volume,
			unitTypeId: route.unit_type_id,
			outTruckObjectUid: route.out_truck_object_uid,
			outDateTime: route.out_date_time,
			odometerAtStart: route.odometer_at_start,
			inTruckObjectUid: route.in_truck_object_uid,
			inDateTime: route.in_date_time,
			odometerAtFinish: route.odometer_at_finish,
			routeLength: route.route_length,
			fuelBalanceAtStart: route.fuel_balance_at_start,
			fuelConsumed: route.fuel_consumed,
			fuelReceived: route.fuel_received,
			fuelBalanceAtFinish: route.fuel_balance_at_finish,
		};

		console.log('📱 [DEBUG] Transformed route:', transformed);
		return transformed;
	}).filter(route => {
		// Validation with better error messages
		console.log("=============================================")
		console.log(route)
		const isValid = route.truckRoutePageUid && route.routeDate && route.outTruckObjectUid;
		if (!isValid) {
			console.warn('📱 [WARN] Filtering out invalid route:', {
				truckRoutePageUid: route.truckRoutePageUid,
				routeDate: route.routeDate,
				outTruckObjectUid: route.outTruckObjectUid
			});
		}
		return isValid;
	});
};