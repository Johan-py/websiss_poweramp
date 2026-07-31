import { useEffect, useState } from "react";
import { Search, Award, TrendingUp, GraduationCap, BookOpen, ChevronDown, ChevronRight, UserCircle } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface KardexData {
  estudiante: { id: string; nombres: string; apellidos: string; cedula: string; email: string; carrera: string };
  periodos: {
    periodo: string;
    materias: { materiaId: string; materia: string; codigo: string; docente: string; creditos: number; nota: number | null; estado: string }[];
    totalCreditos: number;
    promedio: number;
  }[];
  creditosAprobados: number;
  creditosTotales: number;
  avance: number;
  promedioGlobal: number;
  promedioPonderadoGlobal: number;
}

export function Kardex() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const isStudent = rol === "ESTUDIANTE";
  const [search, setSearch] = useState("");
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [kardex, setKardex] = useState<KardexData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isStudent) {
      if (perfil?.estudiante?.id) setSelectedEst(perfil.estudiante.id);
      return;
    }
    api.estudiantes.list().then((data) => {
      setEstudiantes(data);
      if (data.length > 0 && !selectedEst) {
        setSelectedEst(data[0].id);
      }
    });
  }, [isStudent, perfil?.estudiante?.id]);

  useEffect(() => {
    if (!selectedEst) return;
    setLoading(true);
    api.kardex.get(selectedEst).then((data) => {
      setKardex(data);
      setExpanded(new Set(data.periodos.map((p: any) => p.periodo)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedEst]);

  const toggle = (p: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const notaColor = (n: number | null) => {
    if (n == null) return "text-muted-foreground";
    if (n >= 90) return "text-success";
    if (n >= 70) return "text-primary";
    if (n >= 14) return "text-warning";
    return "text-destructive";
  };

  const estadoBadge = (estado: string) => {
    if (estado === "COMPLETADA") return <Badge variant="success">Aprobada</Badge>;
    if (estado === "ACTIVA") return <Badge variant="default">En curso</Badge>;
    if (estado === "CANCELADA") return <Badge variant="destructive">Cancelada</Badge>;
    return <Badge variant="secondary">{estado}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Kardex Académico"
        description={isStudent ? "Tu historial académico completo" : "Historial académico completo del estudiante"}
      />

      {isStudent ? (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 max-w-md">
          <div className="rounded-lg bg-primary/10 p-2"><UserCircle className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-sm font-medium">{perfil?.nombre} {perfil?.apellido}</p>
            <p className="text-xs text-muted-foreground">Mi kardex académico</p>
          </div>
        </div>
      ) : (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={selectedEst}
            onChange={(e) => setSelectedEst(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm appearance-none cursor-pointer transition-all hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {estudiantes.map((est: any) => (
              <option key={est.id} value={est.id}>
                {est.perfil?.nombre} {est.perfil?.apellido} - {est.perfil?.cedula}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />)}</div>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/60" />)}
        </div>
      ) : kardex ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2"><Award className="h-4 w-4 text-primary" /></div>
                <span className="text-xs font-medium text-muted-foreground">Promedio Global</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.promedioGlobal}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-warning/10 p-2"><TrendingUp className="h-4 w-4 text-warning" /></div>
                <span className="text-xs font-medium text-muted-foreground">Promedio Ponderado</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.promedioPonderadoGlobal}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-success/10 p-2"><Award className="h-4 w-4 text-success" /></div>
                <span className="text-xs font-medium text-muted-foreground">Créditos Aprobados</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.creditosAprobados}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-muted p-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /></div>
                <span className="text-xs font-medium text-muted-foreground">Avance</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.avance}%</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${kardex.avance}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {kardex.periodos.map((periodo) => {
              const isExpanded = expanded.has(periodo.periodo);
              return (
                <div key={periodo.periodo} className="rounded-xl border bg-card overflow-hidden">
                  <button onClick={() => toggle(periodo.periodo)} className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <span className="text-sm font-semibold">Periodo {periodo.periodo}</span>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{periodo.materias.length} materias</span>
                          <span className="text-xs text-muted-foreground">Promedio: {periodo.promedio}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/20">
                            <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">Código</th>
                            <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">Materia</th>
                            <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Docente</th>
                            <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Créditos</th>
                            <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periodo.materias.map((mat, idx) => (
                            <tr key={idx} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                              <td className="h-11 px-4 text-xs text-muted-foreground">{mat.codigo}</td>
                              <td className="h-11 px-4 text-sm font-medium">{mat.materia}</td>
                              <td className="h-11 px-4 text-sm text-muted-foreground hidden md:table-cell">{mat.docente}</td>
                              <td className="h-11 px-4 text-sm text-center">{mat.creditos}</td>
                              <td className="h-11 px-4 text-center">{estadoBadge(mat.estado)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-muted p-4 mb-4"><BookOpen className="h-6 w-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">Selecciona un estudiante</p>
          <p className="text-xs text-muted-foreground">Elige un estudiante para ver su historial académico</p>
        </div>
      )}
    </div>
  );
}
