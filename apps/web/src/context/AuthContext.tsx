import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, api } from "@/services/api";
import type { LoginResponse, PerfilData } from "@/types";

const TOKEN_KEY = "ws_token";
const PERFIL_KEY = "ws_perfil";

let inFlightMe: Promise<PerfilData | null> | null = null;

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function getStoredPerfil(): PerfilData | null {
  try {
    const raw = localStorage.getItem(PERFIL_KEY);
    return raw ? (JSON.parse(raw) as PerfilData) : null;
  } catch {
    return null;
  }
}

function setStoredPerfil(perfil: PerfilData | null): void {
  try {
    if (perfil) localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
    else localStorage.removeItem(PERFIL_KEY);
  } catch {}
}

export interface AuthUser {
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  perfil: PerfilData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<PerfilData | null>;
  getAccessToken: () => string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const sessionRef = useRef(0);

  const [perfil, setPerfil] = useState<PerfilData | null>(() => getStoredPerfil());
  const [loading, setLoading] = useState<boolean>(() => {
    return Boolean(getStoredToken()) && getStoredPerfil() === null;
  });

  const clearSession = useCallback(() => {
    sessionRef.current += 1;
    setStoredToken(null);
    setStoredPerfil(null);
    setPerfil(null);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  const refreshUser = useCallback(async (): Promise<PerfilData | null> => {
    const token = getStoredToken();
    if (!token) return null;

    if (inFlightMe) return inFlightMe;

    const sessionId = sessionRef.current;

    const request = api.auth
      .me()
      .then((data) => {
        if (sessionRef.current !== sessionId) return null;
        setPerfil(data);
        setStoredPerfil(data);
        setLoading(false);
        return data;
      })
      .catch((error: unknown) => {
        if (sessionRef.current === sessionId) {
          setLoading(false);
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            clearSession();
            navigate("/login", { replace: true });
          }
        }
        throw error;
      })
      .finally(() => {
        inFlightMe = null;
      });

    inFlightMe = request;
    return request;
  }, [clearSession, navigate]);

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const data: LoginResponse = await api.auth.login({ email, password });
    sessionRef.current += 1;
    setStoredToken(data.token);
    setStoredPerfil(data.perfil);
    setPerfil(data.perfil);
    setLoading(false);
  }, []);

  const getAccessToken = useCallback((): string | null => {
    return getStoredToken();
  }, []);

  const user = useMemo<AuthUser | null>(
    () => (perfil ? { email: perfil.email } : null),
    [perfil],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, perfil, loading, login, logout, refreshUser, getAccessToken }),
    [user, perfil, loading, login, logout, refreshUser, getAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
