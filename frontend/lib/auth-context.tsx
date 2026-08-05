"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearTokens,
  decodeExpiry,
  getAccessToken,
  getRefreshToken,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
} from "./auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// odśwież token minutę przed jego wygaśnięciem, zamiast czekać na 401
const REFRESH_BUFFER_MS = 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // przerywa cykl referencji między performRefresh a scheduleRefresh
  const scheduleRefreshRef = useRef<(accessToken: string) => void>(() => {});

  const clearRefreshTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const performRefresh = useCallback(async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      setIsAuthenticated(true);
      scheduleRefreshRef.current(newAccessToken);
    } catch {
      clearTokens();
      clearRefreshTimer();
      setIsAuthenticated(false);
    }
  }, [clearRefreshTimer]);

  const scheduleRefresh = useCallback(
    (accessToken: string) => {
      clearRefreshTimer();
      const exp = decodeExpiry(accessToken);
      if (!exp) return;
      const delay = Math.max(exp - Date.now() - REFRESH_BUFFER_MS, 0);
      timerRef.current = setTimeout(performRefresh, delay);
    },
    [clearRefreshTimer, performRefresh]
  );

  useEffect(() => {
    scheduleRefreshRef.current = scheduleRefresh;
  }, [scheduleRefresh]);

  useEffect(() => {
    async function init() {
      const access = getAccessToken();
      const refresh = getRefreshToken();

      if (!refresh) {
        setIsLoading(false);
        return;
      }

      const exp = access ? decodeExpiry(access) : null;
      const isAccessStillValid = exp !== null && exp - Date.now() > REFRESH_BUFFER_MS;

      if (isAccessStillValid && access) {
        setIsAuthenticated(true);
        scheduleRefreshRef.current(access);
        setIsLoading(false);
        return;
      }

      await performRefresh();
      setIsLoading(false);
    }

    init();
    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access } = await apiLogin(email, password);
    setIsAuthenticated(true);
    scheduleRefreshRef.current(access);
  }, []);

  const logout = useCallback(async () => {
    clearRefreshTimer();
    await apiLogout();
    setIsAuthenticated(false);
  }, [clearRefreshTimer]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth musi być użyty wewnątrz AuthProvider.");
  }
  return ctx;
}
