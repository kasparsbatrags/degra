export interface UserInfo {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationRegistrationNumber: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  loading: boolean;
}
