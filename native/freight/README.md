## Dynamic Session Refresh & Offline/Online Transition

### Overview

The session management system now supports **automatic, dynamic refresh** of access tokens based on JWT expiry. The refresh is scheduled at 80% of the token's lifetime (parsed from the JWT if possible, or from the API response as fallback). This ensures seamless user experience and security.

### How it works

- **Login/Session Restore:** After login or session restoration, the system parses the access token expiry and schedules a refresh.
- **Refresh Scheduling:** The refresh is scheduled at 80% of the token's lifetime. If the token is already past this threshold, refresh is triggered immediately.
- **SessionManager:** Handles refresh scheduling, execution, and rescheduling after each successful refresh.
- **Offline/Online Transition:** If the app goes offline, persistent offline sessions are used. When returning online, the system attempts to restore the online session automatically.

### Key Files

- `utils/TokenAnalyzer.ts` — JWT parsing and expiry extraction.
- `utils/sessionUtils.ts` — Session storage, expiry, and refresh scheduling.
- `utils/SessionManager.ts` — Centralized session/refresh management.
- `context/AuthContext.tsx` — Triggers refresh scheduling after login/session restore.

### Configuration

- The refresh threshold (default 80%) can be adjusted in `TokenAnalyzer.calculateRefreshTime`.
- The system supports both web and mobile (React Native) platforms.

### Developer Notes

- To trigger a manual refresh, call `SessionManager.getInstance().performTokenRefresh()`.
- The refresh endpoint and payload may need to be adjusted in `SessionManager.ts` to match your backend.
- For offline support, persistent sessions are used and automatically transitioned when connectivity is restored.
