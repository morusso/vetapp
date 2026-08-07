export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "vetapp_access_token";
const REFRESH_TOKEN_KEY = "vetapp_refresh_token";

export class LoginError extends Error {}
export class RefreshError extends Error {}

export class ChangePasswordError extends Error {
  fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>) {
    super(Object.values(fieldErrors).flat().join(" "));
    this.fieldErrors = fieldErrors;
  }
}

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

/** Returns the token's expiry time (ms epoch) read from the JWT payload, without verifying the signature. */
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
    throw new LoginError("Incorrect email or password.");
  }

  const data = await res.json();
  setTokens(data.access, data.refresh);
  return { access: data.access, refresh: data.refresh };
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new RefreshError("No refresh token available.");
  }

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new RefreshError("Session expired, please log in again.");
  }

  const data = await res.json();
  // the backend rotates the refresh token on every refresh (ROTATE_REFRESH_TOKENS) and blacklists the old one
  setTokens(data.access, data.refresh ?? refresh);
  return data.access;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/user/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });

  if (!res.ok) {
    if (res.status === 400) {
      throw new ChangePasswordError(await res.json());
    }
    throw new ChangePasswordError({
      detail: ["Could not change the password. Try logging in again."],
    });
  }
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
