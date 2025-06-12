export interface UserDto {

	id?: string;
	preferredUsername?: string;
	email?: string;
	givenName?: string;
	familyName?: string;
	attributes?: Record<string, string>;

}