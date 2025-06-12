export interface UserDto {
	id?: number;
	email?: string;
	given_name?: string;
	family_name?: string;

	// Offline-only fields
	is_dirty?: number;
	is_deleted?: number;
	created_at?: number;
	updated_at?: number;
	synced_at?: number;

}