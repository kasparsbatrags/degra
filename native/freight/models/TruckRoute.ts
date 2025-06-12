export interface TruckRoute {
	uid: string;
	dateFrom: string;
	dateTo: string;
	truckRegistrationNumber: string;
	fuelConsumptionNorm: number;
	fuelBalanceAtStart: number;
	totalFuelReceivedOnRoutes: number | null;
	totalFuelConsumedOnRoutes: number | null;
	fuelBalanceAtRoutesFinish: number | null;
	odometerAtRouteStart: number | null;
	odometerAtRouteFinish: number | null;
	computedTotalRoutesLength: number | null;
	activeTab: 'basic' | 'odometer' | 'fuel';
}
