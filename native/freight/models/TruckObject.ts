export interface TruckObject {
	uid?: string;                             // Backend primary key (optional for legacy compatibility)
	name?: string;                            // Backend: name

	// Offline-only fields
	is_dirty?: number;
	is_deleted?: number;
	created_at?: number;
	updated_at?: number;
	synced_at?: number;
}