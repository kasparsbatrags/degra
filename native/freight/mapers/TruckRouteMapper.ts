import { TruckRouteDto, CreateTruckRouteDto } from '@/dto/TruckRouteDto';
import { TruckRoute } from '@/models/TruckRoute';
import { TruckDto } from '@/dto/TruckDto';
import { UserDto } from '@/dto/UserDto';
import { TruckObjectDto } from '@/dto/TruckObjectDto';
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';
import { mapTruckResultToDto } from './TruckMapper';
import { mapUserResultToDto } from './UserMapper';
import { mapTruckObjectResultToDto } from './TruckObjectMapper';

/**
 * Raw SQL result interface for truck route queries
 */
export interface TruckRouteSqlResult {
  // Route fields
  	uid: string
  	routeDate: string
  	routeNumber?: number
  	cargoVolume?: number
  	unitType?: string
  	outDateTime: string
  	odometerAtStart: number
  	inDateTime?: string
  	odometerAtFinish?: number
  	routeLength?: number
  	fuelBalanceAtStart?: number
	fuelConsumed?: number
	fuelReceived?: number
  	fuelBalanceAtFinish?: number

  // TruckRoutePage fields
  truckRoutePageUid: string
  truckRoutePageDateFrom: string
  truckRoutePageDateTo: string
  truckRoutePageFuelBalanceAtStart?: number
  truckRoutePageFuelBalanceAtFinish?: number
  truckRoutePageTotalFuelReceivedOnRoutes?: number
  truckRoutePageTotalFuelConsumedOnRoutes?: number
  truckRoutePageFuelBalanceAtRoutesFinish?: number
  truckRoutePageOdometerAtRouteStart?: number
  truckRoutePageOdometerAtRouteFinish?: number
  truckRoutePageComputedTotalRoutesLength?: number

  // Truck fields
  truckUid: string
  truckMaker?: string
  truckModel?: string
  truckRegistrationNumber?: string
  truckFuelConsumptionNorm?: number
  truckIsDefault?: number

  // User fields
  userId: string
  userEmail?: string
  userGivenName?: string
  userFamilyName?: string

  // Out truck object fields
  outTruckObjectUid?: string
  outTruckObjectName?: string

  // In truck object fields
  inTruckObjectUid?: string
  inTruckObjectName?: string
}

/**
 * TruckRoute mapper class for transforming SQL results to DTOs
 */
export class TruckRouteMapper {
  
  /**
   * Transform SQL result to TruckRouteDto
   */
  static sqlToTruckRouteDto(sqlResult: TruckRouteSqlResult): TruckRouteDto {
    // Use existing mappers for consistent mapping
    const truck = mapTruckResultToDto({
      uid: sqlResult.truckUid,
      truck_maker: sqlResult.truckMaker,
      truck_model: sqlResult.truckModel,
      registration_number: sqlResult.truckRegistrationNumber,
      fuel_consumption_norm: sqlResult.truckFuelConsumptionNorm,
      is_default: sqlResult.truckIsDefault
    })

    const user = mapUserResultToDto({
      userId: sqlResult.userId,
      userEmail: sqlResult.userEmail,
      userGivenName: sqlResult.userGivenName,
      userFamilyName: sqlResult.userFamilyName
    })

    const truckRoutePage: TruckRoutePageDto = {
      uid: sqlResult.truckRoutePageUid,
      dateFrom: sqlResult.truckRoutePageDateFrom,
      dateTo: sqlResult.truckRoutePageDateTo,
      truck: truck,
      user: user,
      fuelBalanceAtStart: sqlResult.truckRoutePageFuelBalanceAtStart ?? null,
      fuelBalanceAtFinish: sqlResult.truckRoutePageFuelBalanceAtFinish,

      totalFuelReceivedOnRoutes: sqlResult.truckRoutePageTotalFuelReceivedOnRoutes,
      totalFuelConsumedOnRoutes: sqlResult.truckRoutePageTotalFuelConsumedOnRoutes,
      fuelBalanceAtRoutesFinish: sqlResult.truckRoutePageFuelBalanceAtRoutesFinish,
      odometerAtRouteStart: sqlResult.truckRoutePageOdometerAtRouteStart,
      odometerAtRouteFinish: sqlResult.truckRoutePageOdometerAtRouteFinish,
      computedTotalRoutesLength: sqlResult.truckRoutePageComputedTotalRoutesLength
    }

    const outTruckObject = mapTruckObjectResultToDto({
      uid: sqlResult.outTruckObjectUid,
      name: sqlResult.outTruckObjectName
    })

    const inTruckObject = sqlResult.inTruckObjectUid ? mapTruckObjectResultToDto({
      uid: sqlResult.inTruckObjectUid,
      name: sqlResult.inTruckObjectName
    }) : undefined

    const truckRouteDto: TruckRouteDto = {
      uid: sqlResult.uid,
      truckRoutePage: truckRoutePage,
      routeDate: sqlResult.routeDate,
      routeNumber: sqlResult.routeNumber,
      cargoVolume: sqlResult.cargoVolume,
      unitType: sqlResult.unitType,
      outTruckObject: outTruckObject,
      outDateTime: sqlResult.outDateTime,
      odometerAtStart: sqlResult.odometerAtStart,
      inTruckObject: inTruckObject,
      inDateTime: sqlResult.inDateTime,
      odometerAtFinish: sqlResult.odometerAtFinish,
      routeLength: sqlResult.routeLength,
      fuelBalanceAtStart: sqlResult.fuelBalanceAtStart,
      fuelConsumed: sqlResult.fuelConsumed,
      fuelReceived: sqlResult.fuelReceived,
      fuelBalanceAtFinish: sqlResult.fuelBalanceAtFinish
    }

    return truckRouteDto
  }

  /**
   * Transform multiple SQL results to TruckRouteDto array
   */
  static sqlArrayToTruckRouteDtoArray(sqlResults: TruckRouteSqlResult[]): TruckRouteDto[] {
    return sqlResults.map(sqlResult => this.sqlToTruckRouteDto(sqlResult))
  }
}

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