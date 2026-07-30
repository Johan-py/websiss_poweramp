const BASE = "/api/v1";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
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
  },
  docentes: {
    list: () => fetchJson<any[]>("/docentes"),
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
  },
  notas: {
    list: () => fetchJson<any[]>("/notas"),
  },
  pagos: {
    list: () => fetchJson<any[]>("/pagos"),
  },
  calendario: {
    list: () => fetchJson<any[]>("/calendario"),
  },
  recursos: {
    list: () => fetchJson<any[]>("/recursos"),
  },
  auditoria: {
    list: () => fetchJson<any[]>("/auditoria"),
  },
  kardex: {
    get: (estudianteId: string) => fetchJson<any>(`/kardex/${estudianteId}`),
  },
  dashboard: {
    get: () => fetchJson<any>("/dashboard"),
  },
};
