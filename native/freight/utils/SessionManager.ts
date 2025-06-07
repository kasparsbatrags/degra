import { isSessionActive, clearSession, loadSession, saveSession, getStorage } from './sessionUtils';
import { redirectToLogin } from '@/config/axios';
import { SessionStatus } from '@/types/session';
import { Platform } from 'react-native';

type SessionListener = (status: SessionStatus) => void;

import { TokenAnalyzer } from './TokenAnalyzer';
import axiosInstance from '@/config/axios';

export class SessionManager {
  private static instance: SessionManager;
  private isCheckingSession = false;
  private isRedirecting = false;
  private lastKnownStatus: SessionStatus = SessionStatus.CHECKING;
  private listeners: Set<SessionListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    // Uzreiz izsauc ar pēdējo zināmo statusu
    listener(this.lastKnownStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(status: SessionStatus) {
    this.lastKnownStatus = status;
    this.listeners.forEach((listener) => listener(status));
  }

  async checkSessionStatus(): Promise<SessionStatus> {
    if (this.isCheckingSession) {
      return this.lastKnownStatus;
    }
    this.isCheckingSession = true;
    try {
      const active = await isSessionActive();
      if (active) {
        this.notify(SessionStatus.ACTIVE);
        // Schedule refresh if session is active
        await this.scheduleRefreshFromSession();
        return SessionStatus.ACTIVE;
      } else {
        this.notify(SessionStatus.EXPIRED);
        this.clearRefreshTimeout();
        return SessionStatus.EXPIRED;
      }
    } catch (e) {
      this.notify(SessionStatus.ERROR);
      this.clearRefreshTimeout();
      return SessionStatus.ERROR;
    } finally {
      this.isCheckingSession = false;
    }
  }

  async handleUnauthorized(): Promise<void> {
    if (this.isRedirecting) return;
    this.isRedirecting = true;
    try {
      await clearSession();
      this.notify(SessionStatus.EXPIRED);
      await this.redirectToLogin();
    } finally {
      setTimeout(() => {
        this.isRedirecting = false;
      }, 2000);
    }
  }

  async redirectToLogin(): Promise<void> {
    // Izmanto jau esošo redirectToLogin funkciju
    await redirectToLogin();
  }

  startPeriodicCheck(intervalMs: number = 30000) {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      this.checkSessionStatus();
    }, intervalMs);
    // Also schedule refresh based on session
    this.scheduleRefreshFromSession();
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.clearRefreshTimeout();
  }

  private clearRefreshTimeout() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /**
   * Schedules a token refresh based on refreshScheduledAt in session.
   * If refreshScheduledAt is in the past, triggers refresh immediately.
   */
  async scheduleRefreshFromSession() {
    this.clearRefreshTimeout();
    const session = await loadSession();
    if (!session || !session.accessToken) return;

    try {
      const storage = getStorage();
      const sessionDataRaw = await storage.getItemAsync("user_session");
      if (!sessionDataRaw) return;
      const sessionData = JSON.parse(sessionDataRaw);
      const refreshScheduledAt = sessionData.refreshScheduledAt;
      if (!refreshScheduledAt) return;

      const now = Date.now();
      const delay = refreshScheduledAt - now;
      if (delay <= 0) {
        // Refresh immediately if overdue
        this.performTokenRefresh();
      } else {
        this.refreshTimeout = setTimeout(() => {
          this.performTokenRefresh();
        }, delay);
      }
    } catch (error) {
      console.error("SessionManager: Failed to schedule refresh:", error);
    }
  }

  /**
   * Performs token refresh and reschedules next refresh.
   */
  async performTokenRefresh() {
    try {
      // Call refresh endpoint (assumes axiosInstance is configured)
      const session = await loadSession();
      if (!session || !session.accessToken) return;

      // You may need to adjust the endpoint and payload as per your backend
      const response = await axiosInstance.post('/refresh', {}, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      });

      if (response.data && response.data.access_token) {
        // Save new session and reschedule refresh
        const newToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;
        const user = session.user;
        await saveSession(newToken, expiresIn, user);
        await this.scheduleRefreshFromSession();
        this.notify(SessionStatus.ACTIVE);
      } else {
        // If refresh fails, treat as expired
        this.notify(SessionStatus.EXPIRED);
        this.clearRefreshTimeout();
      }
    } catch (error) {
      console.error("SessionManager: Token refresh failed:", error);
      this.notify(SessionStatus.EXPIRED);
      this.clearRefreshTimeout();
    }
  }
}
