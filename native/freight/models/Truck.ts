export interface Truck {

	uid?: string;
	truckMaker?: string;
	truckModel?: string;
	registrationNumber?: string;
	fuelConsumptionNorm?: number;
	isDefault?: boolean;

	// Offline-only fields
	is_dirty?: number;
	is_deleted?: number;
	created_at?: number;
	updated_at?: number;
	synced_at?: number;
}
