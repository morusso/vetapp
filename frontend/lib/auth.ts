const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "vetapp_access_token";
const REFRESH_TOKEN_KEY = "vetapp_refresh_token";

export class LoginError extends Error {}
export class RefreshError extends Error {}

type TokenPair = { access: string; refresh: string };

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Zwraca czas wygaśnięcia tokenu (ms epoch) odczytany z payloadu JWT, bez weryfikacji podpisu. */
export function decodeExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const res = await fetch(`${API_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new LoginError("Nieprawidłowy email lub hasło.");
  }

  const data = await res.json();
  setTokens(data.access, data.refresh);
  return { access: data.access, refresh: data.refresh };
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new RefreshError("Brak tokenu odświeżającego.");
  }

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new RefreshError("Sesja wygasła, zaloguj się ponownie.");
  }

  const data = await res.json();
  // backend rotuje refresh token przy każdym odświeżeniu (ROTATE_REFRESH_TOKENS) i blacklistuje stary
  setTokens(data.access, data.refresh ?? refresh);
  return data.access;
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  clearTokens();

  if (refresh) {
    await fetch(`${API_URL}/api/user/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }
}
