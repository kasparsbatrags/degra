import { UserDto } from '@/dto/UserDto'

/**
 * Map User result to UserDto
 */
export const mapUserResultToDto = (result: any): UserDto => ({
  id: result.userId || result.user_id || '',
  preferredUsername: undefined,
  email: result.userEmail || result.email || '',
  givenName: result.userGivenName || result.given_name || '',
  familyName: result.userFamilyName || result.family_name || '',
  attributes: undefined
})