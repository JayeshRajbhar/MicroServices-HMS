const TOKEN_KEY = "hospitalos.token";
const TOKEN_VERSION_KEY = "hospitalos.tokenVersion";
const CURRENT_TOKEN_VERSION = "jwt-secret-2026-05-28";
export const AUTH_EVENT = "auth-token";

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (
    window.localStorage.getItem(TOKEN_VERSION_KEY) !== CURRENT_TOKEN_VERSION
  ) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(TOKEN_VERSION_KEY);
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(TOKEN_VERSION_KEY, CURRENT_TOKEN_VERSION);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearToken() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_VERSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function buildAuthHeader(token: string | null): HeadersInit | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function isAuthFailure(response: Response) {
  return response.status === 401 || response.status === 403;
}
