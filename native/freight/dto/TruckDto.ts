export interface TruckDto {
	// Backend primary fields
	uid?: string;                             // Backend primary key
	truckMaker?: string;                     // Backend field
	truckModel?: string;                     // Backend field
	registrationNumber?: string;             // Backend field
	fuelConsumptionNorm?: number;           // Backend field
	isDefault?: number;
}
