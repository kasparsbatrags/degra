import { SessionManager } from '../../utils/SessionManager';
import { SessionStatus } from '../../types/session';

jest.mock('../../utils/sessionUtils', () => ({
  isSessionActive: jest.fn().mockResolvedValue(true),
  clearSession: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../config/axios', () => ({
  redirectToLogin: jest.fn().mockResolvedValue(undefined),
}));

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('notifies listeners on status change', async () => {
    const manager = SessionManager.getInstance();
    const listener = jest.fn();
    manager.subscribe(listener);

    // Simulējam, ka sesija ir aktīva
    const status = await manager.checkSessionStatus();
    expect(status).toBe(SessionStatus.ACTIVE);
    expect(listener).toHaveBeenCalledWith(SessionStatus.ACTIVE);
  });

  it('calls clearSession and redirectToLogin on handleUnauthorized', async () => {
    const { clearSession } = require('../../utils/sessionUtils');
    const { redirectToLogin } = require('../../config/axios');
    const manager = SessionManager.getInstance();

    await manager.handleUnauthorized();

    expect(clearSession).toHaveBeenCalled();
    expect(redirectToLogin).toHaveBeenCalled();
  });

  it('startPeriodicCheck and stopPeriodicCheck do not throw', () => {
    const manager = SessionManager.getInstance();
    expect(() => manager.startPeriodicCheck(10)).not.toThrow();
    expect(() => manager.stopPeriodicCheck()).not.toThrow();
  });
});
