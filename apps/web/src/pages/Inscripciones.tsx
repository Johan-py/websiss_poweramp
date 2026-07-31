import { useEffect, useMemo, useState } from "react";
import { Search, BookOpen, Clock, Users, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/features/PageHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface OfertaUI {
  id: string;
  materiaNombre: string;
  materiaCodigo: string;
  creditos: number;
  carreraId: string;
  docente: string;
  horario: string;
  aula: string;
  cupoActual: number;
  cupoMaximo: number;
  periodo: string;
  estado: string;
}

export function Inscripciones() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const isStudent = rol === "ESTUDIANTE";
  const estudianteId = perfil?.estudiante?.id;
  const carreraId = perfil?.estudiante?.carrera?.id;

  const [ofertas, setOfertas] = useState<OfertaUI[]>([]);
  const [selected, setSelected] = useState<OfertaUI | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [inscriptas, setInscriptas] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [inscribiendo, setInscribiendo] = useState(false);

  useEffect(() => {
    Promise.all([
      api.ofertas.list(),
      api.carreras.list().catch(() => []),
      isStudent ? api.inscripciones.list().catch(() => []) : Promise.resolve([]),
    ]).then(([data, , insc]) => {
      const list = data.map((o: any) => ({
        id: o.id,
        materiaNombre: o.materia?.nombre ?? "",
        materiaCodigo: o.materia?.codigo ?? "",
        creditos: o.materia?.creditos ?? 0,
        carreraId: o.materia?.carreraId ?? o.materia?.carrera?.id ?? "",
        docente: o.docente?.perfil ? `${o.docente.perfil.nombre} ${o.docente.perfil.apellido}` : "",
        horario: o.horario
          ? (Array.isArray(o.horario)
              ? o.horario.map((h: any) => `${h.dia ?? ""} ${h.hora_inicio ?? ""}-${h.hora_fin ?? ""}`).join(", ")
              : `${o.horario.dia ?? ""} ${o.horario.hora_inicio ?? ""}-${o.horario.hora_fin ?? ""}`)
          : "",
        aula: o.aula?.nombre ?? "",
        cupoActual: o.cupoMaximo - o.cupoDisponible,
        cupoMaximo: o.cupoMaximo,
        periodo: o.periodo?.codigo ?? "",
        estado: !o.activo ? "cerrada" : o.cupoDisponible <= 0 ? "completa" : "abierta",
      }));

      setOfertas(list);
      if (isStudent) {
        const ids = insc.filter((i: any) => i.estudianteId === estudianteId).map((i: any) => i.ofertaId);
        setInscriptas(new Set(ids));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isStudent, estudianteId]);

  const visible = useMemo(() => {
    let list = ofertas;
    if (isStudent && carreraId) {
      list = list.filter((o) => o.carreraId === carreraId);
    }
    return search ? list.filter((o) => o.materiaNombre.toLowerCase().includes(search.toLowerCase())) : list;
  }, [ofertas, search, isStudent, carreraId]);

  const handleInscribirse = async () => {
    if (!selected || !isStudent || !estudianteId) return;
    setInscribiendo(true);
    setMessage(null);
    try {
      await api.inscripciones.create({ estudianteId, ofertaId: selected.id });
      setInscriptas((prev) => new Set(prev).add(selected.id));
      setMessage("Inscripción registrada correctamente");
    } catch (e: any) {
      setMessage(e.message ?? "No se pudo completar la inscripción");
    } finally {
      setInscribiendo(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 lg:-m-8 flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Oferta Académica</h2>
          <p className="text-xs text-muted-foreground">
            {isStudent ? `${visible.length} materias disponibles para tu carrera` : `${visible.length} materias ofertadas`}
          </p>
        </div>
        {!isStudent && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Info className="h-3 w-3" /> Proceso de inscripción administrado por la coordinación
          </Badge>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-64 shrink-0 border-r bg-card p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Filtros</h3>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar materia..."
                className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground/60 transition-all hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Select defaultValue="">
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Periodo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {Array.from(new Set(ofertas.map((o) => o.periodo))).filter(Boolean).map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/60" />
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {visible.map((oferta) => {
                  const isSelected = selected?.id === oferta.id;
                  const yaInscrito = inscriptas.has(oferta.id);
                  const cupoPct = (oferta.cupoActual / oferta.cupoMaximo) * 100;
                  return (
                    <button
                      key={oferta.id}
                      onClick={() => { setSelected(oferta); setMessage(null); }}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all duration-150 border border-transparent",
                        isSelected ? "border-primary/30 bg-primary/5" : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <p className="text-sm font-medium">{oferta.materiaNombre}</p>
                          <p className="text-xs text-muted-foreground">{oferta.materiaCodigo} · {oferta.docente}</p>
                        </div>
                        {yaInscrito ? (
                          <Badge variant="success" className="text-[10px]">Inscrito</Badge>
                        ) : (
                          <Badge variant={oferta.estado === "abierta" ? "success" : oferta.estado === "completa" ? "warning" : "secondary"} className="text-[10px]">
                            {oferta.estado === "abierta" ? "Disponible" : oferta.estado === "completa" ? "Completa" : "Cerrada"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{oferta.horario || "Por definir"}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{oferta.cupoActual}/{oferta.cupoMaximo}</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{oferta.creditos} créditos</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", cupoPct >= 100 ? "bg-destructive" : cupoPct >= 80 ? "bg-warning" : "bg-success")} style={{ width: `${Math.min(cupoPct, 100)}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="w-80 shrink-0 border-l bg-card p-5 overflow-y-auto scrollbar-thin">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Resumen de Inscripción</h3>
                <h2 className="text-lg font-semibold">{selected.materiaNombre}</h2>
                <p className="text-xs text-muted-foreground">{selected.materiaCodigo}</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2"><Users className="h-4 w-4 text-muted-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">Docente</p><p className="text-sm font-medium">{selected.docente}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2"><Clock className="h-4 w-4 text-muted-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">Horario</p><p className="text-sm font-medium">{selected.horario || "Por definir"}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2"><BookOpen className="h-4 w-4 text-muted-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">Créditos</p><p className="text-sm font-medium">{selected.creditos} créditos</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2"><Users className="h-4 w-4 text-muted-foreground" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cupos</p>
                    <p className="text-sm font-medium">{selected.cupoActual}/{selected.cupoMaximo}</p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", (selected.cupoActual / selected.cupoMaximo) * 100 >= 100 ? "bg-destructive" : (selected.cupoActual / selected.cupoMaximo) * 100 >= 80 ? "bg-warning" : "bg-success")}
                        style={{ width: `${Math.min((selected.cupoActual / selected.cupoMaximo) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="rounded-xl bg-muted/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Periodo</span><span className="font-medium">{selected.periodo}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Créditos</span><span className="font-medium">{selected.creditos}</span></div>
                <Separator />
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total créditos</span><span className="font-semibold">{selected.creditos}</span></div>
              </div>

              {isStudent ? (
                <>
                  <Button
                    className="w-full h-10"
                    disabled={selected.estado !== "abierta" || inscriptas.has(selected.id) || inscribiendo}
                    onClick={handleInscribirse}
                  >
                    {inscribiendo ? "Inscribiendo..." : inscriptas.has(selected.id) ? <><CheckCircle2 className="h-4 w-4 mr-2" />Ya estás inscrito</> : selected.estado === "abierta" ? <><CheckCircle2 className="h-4 w-4 mr-2" />Inscribirme</> : selected.estado === "completa" ? "Sin cupos disponibles" : "Oferta cerrada"}
                  </Button>
                  {selected.estado === "abierta" && !inscriptas.has(selected.id) && (
                    <div className="flex items-center gap-2 rounded-lg bg-success/5 p-3">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <p className="text-xs text-success">Cumples con los requisitos para inscribirte en esta materia.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">Las inscripciones de estudiantes se gestionan desde el módulo de Estudiantes o Kardex.</p>
                </div>
              )}

              {message && (
                <div className={cn("flex items-center gap-2 rounded-lg p-3 text-sm", message.includes("correctamente") ? "bg-success/5 text-success" : "bg-destructive/5 text-destructive")}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="rounded-full bg-muted p-4 mb-3"><BookOpen className="h-6 w-6 text-muted-foreground" /></div>
              <p className="text-sm font-medium mb-1">Ninguna oferta seleccionada</p>
              <p className="text-xs text-muted-foreground">Selecciona una oferta para ver el resumen e inscribirte.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
