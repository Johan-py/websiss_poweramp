import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "ws_token";
const PERFIL_KEY = "ws_perfil";
const API = `${import.meta.env.VITE_API_URL}/api/v1`;
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function getStoredPerfil(): PerfilData | null {
  try {
    const raw = localStorage.getItem(PERFIL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredPerfil(perfil: PerfilData | null) {
  try {
    if (perfil) localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
    else localStorage.removeItem(PERFIL_KEY);
  } catch {}
}

export interface PerfilData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string | null;
  direccion: string | null;
  avatarUrl: string | null;
  rol: "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";
  activo: boolean;
  estudiante?: {
    id: string;
    codigoEstudiante: string;
    carrera?: { id: string; nombre: string; codigo: string };
  } | null;
  docente?: {
    id: string;
    codigoDocente: string;
    especialidad: string | null;
  } | null;
}

export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((perfilData) => {
        setUser({ email: perfilData.email });
        setPerfil(perfilData);
        setStoredPerfil(perfilData);
      })
      .catch(() => {
        setStoredToken(null);
        setStoredPerfil(null);
        setUser(null);
        setPerfil(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Credenciales inválidas");
    }

    const data = await res.json();

    setStoredToken(data.token);
    setStoredPerfil(data.perfil);
    setUser({ email: data.perfil.email });
    setPerfil(data.perfil);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredPerfil(null);
    setUser(null);
    setPerfil(null);
  }, []);

  const getAccessToken = useCallback((): string | null => {
    return getStoredToken();
  }, []);

  return { user, perfil, loading, login, logout, getAccessToken };
}
