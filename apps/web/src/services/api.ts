const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/v1`;

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("ws_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { ...getAuthHeaders(), ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    me: () => fetchJson<any>("/auth/me"),
  },
  carreras: {
    list: () => fetchJson<any[]>("/carreras"),
    get: (id: string) => fetchJson<any>(`/carreras/${id}`),
  },
  periodos: {
    list: () => fetchJson<any[]>("/periodos"),
  },
  estudiantes: {
    list: () => fetchJson<any[]>("/estudiantes"),
    get: (id: string) => fetchJson<any>(`/estudiantes/${id}`),
    create: (data: {
      nombre: string;
      apellido: string;
      cedula: string;
      email: string;
      telefono?: string;
      direccion?: string;
      password: string;
      codigoEstudiante: string;
      carreraId: string;
      fechaIngreso?: string;
    }) => fetchJson<any>("/estudiantes", { method: "POST", body: JSON.stringify(data) }),
  },
  docentes: {
    list: () => fetchJson<any[]>("/docentes"),
    create: (data: {
      nombre: string;
      apellido: string;
      cedula: string;
      email: string;
      telefono?: string;
      direccion?: string;
      password: string;
      codigoDocente: string;
      especialidad?: string;
    }) => fetchJson<any>("/docentes", { method: "POST", body: JSON.stringify(data) }),
  },
  materias: {
    list: () => fetchJson<any[]>("/materias"),
  },
  ofertas: {
    list: () => fetchJson<any[]>("/ofertas"),
  },
  inscripciones: {
    list: () => fetchJson<any[]>("/inscripciones"),
    create: (data: { estudianteId: string; ofertaId: string }) =>
      fetchJson<any>("/inscripciones", { method: "POST", body: JSON.stringify(data) }),
  },
  evaluaciones: {
    list: () => fetchJson<any[]>("/evaluaciones"),
    create: (data: {
      ofertaId: string;
      titulo: string;
      descripcion?: string;
      tipoEvaluacion?: string;
      peso?: number;
      puntajeMaximo?: number;
      fecha?: string;
      publicada?: boolean;
    }) => fetchJson<any>("/evaluaciones", { method: "POST", body: JSON.stringify(data) }),
  },
  notas: {
    list: () => fetchJson<any[]>("/notas"),
    upsert: (data: { evaluacionId: string; estudianteId: string; valor: number; observacion?: string }) =>
      fetchJson<any>("/notas", { method: "POST", body: JSON.stringify(data) }),
  },
  pagos: {
    list: () => fetchJson<any[]>("/pagos"),
  },
  calendario: {
    list: () => fetchJson<any[]>("/calendario"),
  },
  recursos: {
    list: () => fetchJson<any[]>("/recursos"),
    create: (data: { ofertaId: string; titulo: string; descripcion?: string; tipoRecurso?: string; urlRecurso: string; publicado?: boolean }) =>
      fetchJson<any>("/recursos", { method: "POST", body: JSON.stringify(data) }),
  },
  auditoria: {
    list: (perfilId?: string) =>
      fetchJson<any[]>(`/auditoria${perfilId ? `?perfilId=${perfilId}` : ""}`),
  },
  kardex: {
    get: (estudianteId: string) => fetchJson<any>(`/kardex/${estudianteId}`),
  },
  dashboard: {
    get: () => fetchJson<any>("/dashboard"),
  },
};
