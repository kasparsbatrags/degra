import {TruckDto} from '@/dto/TruckDto'
import {UserDto} from '@/dto/UserDto'


export interface TruckRoutePageDto {
	uid: string;
	dateFrom: string;
	dateTo: string;
	truck: TruckDto;
	user: UserDto;
	fuelBalanceAtStart: number | null;
	fuelBalanceAtFinish?: number;
	totalFuelReceivedOnRoutes?: number;
	totalFuelConsumedOnRoutes?: number;
	fuelBalanceAtRoutesFinish?: number;
	odometerAtRouteStart?: number;
	odometerAtRouteFinish?: number;
	computedTotalRoutesLength?: number;
	activeTab?: 'basic' | 'odometer' | 'fuel';
}