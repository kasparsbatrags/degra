export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  OFFLINE_ACTIVE = 'offline_active',
  OFFLINE_EXPIRED = 'offline_expired',
  CHECKING = 'checking',
  ERROR = 'error'
}

export interface SessionCheckResult {
  status: SessionStatus;
  shouldRedirect: boolean;
  nextCheckIn: number;
  user?: any;
}
