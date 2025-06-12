// Backend-compatible TruckRoutePage interface
export interface TruckRoutePage {
	uid?: string;                             // Backend primary key (optional for legacy compatibility)
	date_from?: string;                       // Backend: dateFrom (LocalDate)
	date_to?: string;                         // Backend: dateTo (LocalDate)
	truck_uid?: string;                       // Backend: truck.uid (foreign key)
	// Joined info
	truck_maker?: string;
	truck_model?: string;
	registration_number?: string;
	fuel_consumption_norm?: number;
	is_default?: number;


	user_id?: string;                         // Backend: user.id (foreign key)
	// Joined info
	email?: string;
	givenName?: string;
	familyName?: string;

	fuel_balance_at_start?: number;           // Backend: fuelBalanceAtStart
	fuel_balance_at_end?: number;             // Backend: fuelBalanceAtFinish

	// Computed fields (from backend @Transient)
	total_fuel_received_on_routes?: number;   // Backend: totalFuelReceivedOnRoutes
	total_fuel_consumed_on_routes?: number;   // Backend: totalFuelConsumedOnRoutes
	fuel_balance_at_routes_finish?: number;   // Backend: fuelBalanceAtRoutesFinish

	odometer_at_route_start?: number;         // Backend: odometerAtRouteStart
	odometer_at_route_finish?: number;        // Backend: odometerAtRouteFinish
	computed_total_routes_length?: number;    // Backend: computedTotalRoutesLength

	// Offline-only fields
	is_dirty?: number;
	is_deleted?: number;
	created_at?: number;
	updated_at?: number;
	synced_at?: number;
}
