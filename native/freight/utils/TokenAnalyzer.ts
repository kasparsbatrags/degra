/**
 * TokenAnalyzer - JWT parsing and expiry extraction utility
 * Supports both access and refresh tokens (if JWT)
 */

export interface TokenInfo {
  exp: number; // Expiry timestamp (Unix time, seconds)
  iat: number; // Issued at timestamp (Unix time, seconds)
  lifetime: number; // Lifetime in seconds
  remainingTime: number; // Remaining time in seconds
}

export class TokenAnalyzer {
  /**
   * Parses a JWT token and extracts expiry info.
   * Returns null if parsing fails or token is not JWT.
   */
  static parseTokenExpiry(token: string): TokenInfo | null {
    try {
      if (!token || typeof token !== 'string') return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decode payload (base64url)
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const payload = JSON.parse(atob(padded));

      if (!payload.exp || !payload.iat) return null;

      const now = Math.floor(Date.now() / 1000);
      return {
        exp: payload.exp,
        iat: payload.iat,
        lifetime: payload.exp - payload.iat,
        remainingTime: payload.exp - now
      };
    } catch (error) {
      console.error('TokenAnalyzer: Failed to parse JWT token:', error);
      return null;
    }
  }

  /**
   * Calculates refresh time in ms based on a percentage of token lifetime.
   * E.g. 80% of lifetime.
   */
  static calculateRefreshTime(tokenInfo: TokenInfo, percent: number = 80): number {
    const lifetimeMs = tokenInfo.lifetime * 1000;
    const threshold = Math.max(1, Math.min(percent, 99)) / 100;
    return Math.floor(lifetimeMs * threshold);
  }
}
