// Type for raw API response (as received from server)
interface RawApiRoutePageDto {
	uid?: string;
	dateFrom?: string;
	dateTo?: string;
	user?: {
		id?: number;
	};
	truck?: {
		uid?: string; registrationNumber?: string; model?: string;
	};
	fuelConsumptionNorm?: number;
	fuelBalanceAtStart?: number;
	totalFuelReceivedOnRoutes?: number | null;
	totalFuelConsumedOnRoutes?: number | null;
	fuelBalanceAtRoutesFinish?: number | null;
	odometerAtRouteStart?: number | null;
	odometerAtRouteFinish?: number | null;
	computedTotalRoutesLength?: number | null;
	truck_route_server_id?: number;
	// Add other possible API fields here
}