import { isSessionActive, clearSession, loadSession } from './sessionUtils';
import { redirectToLogin } from '@/config/axios';
import { SessionStatus } from '@/types/session';
import { Platform } from 'react-native';

type SessionListener = (status: SessionStatus) => void;

export class SessionManager {
  private static instance: SessionManager;
  private isCheckingSession = false;
  private isRedirecting = false;
  private lastKnownStatus: SessionStatus = SessionStatus.CHECKING;
  private listeners: Set<SessionListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

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
        return SessionStatus.ACTIVE;
      } else {
        this.notify(SessionStatus.EXPIRED);
        return SessionStatus.EXPIRED;
      }
    } catch (e) {
      this.notify(SessionStatus.ERROR);
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
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
