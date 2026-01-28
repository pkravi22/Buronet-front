import { jwtDecode } from 'jwt-decode';

export const LOGOUT_GUARD_UNTIL_KEY = 'logout_guard_until';

export const setLogoutGuard = (durationMs: number = 2 * 60 * 1000) => {
  if (typeof window === 'undefined') return;
  const until = Date.now() + durationMs;
  localStorage.setItem(LOGOUT_GUARD_UNTIL_KEY, String(until));
};

export const clearLogoutGuard = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOGOUT_GUARD_UNTIL_KEY);
};

export const isLogoutGuardActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(LOGOUT_GUARD_UNTIL_KEY);
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until)) {
    localStorage.removeItem(LOGOUT_GUARD_UNTIL_KEY);
    return false;
  }
  if (until <= Date.now()) {
    localStorage.removeItem(LOGOUT_GUARD_UNTIL_KEY);
    return false;
  }
  return true;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    // console.log('isAuthenticated: No token found.');
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);

    // Check if the token has an expiration time (exp claim)
    if (typeof decoded.exp === 'undefined') {
      // console.log('isAuthenticated: Token has no exp claim.');
      return true; // If no expiration, treat as valid until proven otherwise, or specific error handling
    }

    const expirationTime = decoded.exp * 1000; // Convert seconds to milliseconds
    const currentTime = Date.now();

    const isExpired = expirationTime < currentTime;

    // console.log(`isAuthenticated: Token expires at ${new Date(expirationTime)}, current time ${new Date(currentTime)}. Expired: ${isExpired}`);

    return !isExpired; // <-- CORRECTED LOGIC: Return true if NOT expired
  } catch (error) {
    // console.error('isAuthenticated: Error decoding token or checking expiration:', error);
    return false; // If decoding fails, the token is invalid
  }
};