import {TruckObjectDto} from '@/dto/TruckObjectDto'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'

export interface TruckRouteDto {
	// Backend API fields (uid-based)
	uid?: string | null;
	truckRoutePage: TruckRoutePageDto | null;
	routeDate: string;
	routeNumber: number | null;
	cargoVolume: number | null;
	unitType: string | null;

	outTruckObject: TruckObjectDto | null;
	outDateTime: string;
	odometerAtStart: number | null;

	inTruckObject: TruckObjectDto | null;
	inDateTime: string | null;
	odometerAtFinish: number | null;


	fuelBalanceAtStart: number | null;
	fuelReceived: number | null;
	fuelBalanceAtFinish: number | null;

}