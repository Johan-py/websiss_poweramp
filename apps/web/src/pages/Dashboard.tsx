import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  DollarSign,
  BookOpen,
  TrendingUp,
  ArrowRight,
  ClipboardCheck,
  Library,
  BarChart3,
  CalendarDays,
  Wallet,
  FileText,
  UploadCloud,
} from "lucide-react";
import { MetricCard } from "@/features/MetricCard";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("es", { day: "numeric", month: "short" });
}

function initials(nombre?: string, apellido?: string) {
  return `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`.toUpperCase();
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const R = 32;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4">
      <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0 -rotate-90">
        <circle cx="44" cy="44" r={R} fill="none" strokeWidth="12" className="stroke-muted" />
        {segments.filter((s) => s.value > 0).map((s) => {
          const len = (s.value / (total || 1)) * C;
          const offset = -acc * (C / (total || 1));
          acc += s.value;
          return (
            <circle
              key={s.label}
              cx="44"
              cy="44"
              r={R}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              stroke={s.color}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div className="space-y-1.5 min-w-0">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground truncate">{s.label}</span>
            <span className="font-medium ml-auto">{total ? Math.round((s.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista ADMIN / COORDINADOR ──────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [pagos, setPagos] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [auditoria, setAuditoria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.get().catch(() => null),
      api.pagos.list().catch(() => []),
      api.inscripciones.list().catch(() => []),
      api.ofertas.list().catch(() => []),
      api.estudiantes.list().catch(() => []),
      api.docentes.list().catch(() => []),
      api.auditoria.list().catch(() => []),
    ]).then(([d, p, ins, of, est, doc, aud]) => {
      setStats(d);
      setPagos(p);
      setInscripciones(ins);
      setOfertas(of);
      setEstudiantes(est);
      setDocentes(doc);
      setAuditoria(aud);
      setLoading(false);
    });
  }, []);

  const ingresos = useMemo(
    () => pagos.filter((p) => p.estado === "CONFIRMADO").reduce((s, p) => s + Number(p.monto), 0),
    [pagos],
  );

  const ingresosPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of pagos) {
      if (p.estado !== "CONFIRMADO") continue;
      const d = new Date(p.fechaPago ?? p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      map[key] = (map[key] ?? 0) + Number(p.monto);
    }
    const keys = Object.keys(map).sort().slice(-6);
    return keys.map((k) => ({ label: monthNames[Number(k.split("-")[1])], value: map[k] }));
  }, [pagos]);

  const inscripcionesPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of inscripciones) {
      const d = new Date(i.fechaInscripcion ?? i.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      map[key] = (map[key] ?? 0) + 1;
    }
    const keys = Object.keys(map).sort().slice(-6);
    return keys.map((k) => ({ label: monthNames[Number(k.split("-")[1])], value: map[k] }));
  }, [inscripciones]);

  const estudiantesActivos = useMemo(
    () => estudiantes.filter((e) => e.perfil?.activo).length,
    [estudiantes],
  );
  const estudiantesInactivos = estudiantes.length - estudiantesActivos;

  const ocupacion = useMemo(
    () => ofertas.slice(0, 6).map((o) => {
      const usado = o.cupoMaximo - o.cupoDisponible;
      return {
        materia: o.materia?.nombre ?? "",
        pct: Math.min(100, Math.round((usado / (o.cupoMaximo || 1)) * 100)),
      };
    }),
    [ofertas],
  );

  const maxIngreso = Math.max(1, ...ingresosPorMes.map((x) => x.value));
  const maxInscripcion = Math.max(1, ...inscripcionesPorMes.map((x) => x.value));

  return (
    <div className="space-y-8 max-w-7xl">
      <PageHeader title="Dashboard Institucional" description="Resumen analítico para la toma de decisiones" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Estudiantes" value={loading ? "..." : stats?.totalEstudiantes ?? 0} icon={Users} trend={{ value: "activos en el sistema", positive: true }} />
        <MetricCard label="Docentes" value={loading ? "..." : stats?.totalDocentes ?? 0} icon={GraduationCap} trend={{ value: "planta docente", positive: true }} />
        <MetricCard label="Ofertas Activas" value={loading ? "..." : stats?.ofertasActivas ?? 0} icon={FileSpreadsheet} trend={{ value: "materias ofertadas", positive: true }} />
        <MetricCard label="Ingresos Recaudados" value={loading ? "..." : `Bs ${ingresos.toLocaleString()}`} icon={DollarSign} trend={{ value: "pagos confirmados", positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Ingresos por Mes" action={<span className="text-xs text-muted-foreground">6 meses</span>}>
          <div className="flex items-end gap-3 h-40">
            {ingresosPorMes.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{(m.value / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-md bg-primary/80 transition-all duration-300" style={{ height: `${Math.max(4, (m.value / maxIngreso) * 120)}px` }} />
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
            {ingresosPorMes.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center w-full">Sin datos de pagos</p>}
          </div>
        </Card>

        <Card title="Inscripciones por Mes" action={<span className="text-xs text-muted-foreground">6 meses</span>}>
          <div className="flex items-end gap-3 h-40">
            {inscripcionesPorMes.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{m.value}</span>
                <div className="w-full rounded-t-md bg-success/70 transition-all duration-300" style={{ height: `${Math.max(4, (m.value / maxInscripcion) * 120)}px` }} />
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
            {inscripcionesPorMes.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center w-full">Sin datos de inscripciones</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Estudiantes por Carrera">
          <div className="space-y-3">
            {stats?.estudiantesPorCarrera?.map((c: any) => {
              const max = Math.max(1, ...(stats?.estudiantesPorCarrera?.map((x: any) => x.cantidad) ?? [1]));
              return (
                <div key={c.nombre} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-28 truncate">{c.nombre}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(c.cantidad / max) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-6 text-right">{c.cantidad}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Distribución de Estudiantes">
          <Donut
            segments={[
              { label: "Activos", value: estudiantesActivos, color: "hsl(var(--success))" },
              { label: "Inactivos", value: estudiantesInactivos, color: "hsl(var(--muted-foreground))" },
            ]}
          />
        </Card>

        <Card title="Ocupación de Ofertas" action={<span className="text-xs text-muted-foreground">Top 6</span>}>
          <div className="space-y-3">
            {ocupacion.map((o, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs w-28 truncate">{o.materia}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${o.pct >= 90 ? "bg-destructive" : o.pct >= 70 ? "bg-warning" : "bg-success"}`} style={{ width: `${o.pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{o.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Últimas Inscripciones" action={<Link to="/inscripciones" className="text-xs text-primary flex items-center gap-1 hover:underline">Ver todas <ArrowRight className="h-3 w-3" /></Link>}>
          <div className="space-y-2.5">
            {inscripciones.slice(0, 5).map((i: any) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2"><ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">{i.estudiante?.perfil?.nombre} {i.estudiante?.perfil?.apellido}</span>{" "}
                    <span className="text-muted-foreground">· {i.oferta?.materia?.nombre}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(i.fechaInscripcion ?? i.createdAt)}</p>
                </div>
                <Badge variant={i.estado === "ACTIVA" ? "success" : "secondary"} className="text-[9px]">{i.estado}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Auditoría Reciente" action={<Link to="/auditoria" className="text-xs text-primary flex items-center gap-1 hover:underline">Ver más <ArrowRight className="h-3 w-3" /></Link>}>
          <div className="space-y-2.5">
            {auditoria.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2"><TrendingUp className="h-3.5 w-3.5 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">{a.accion}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.perfil?.email ?? ""} · {a.entidad}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Últimos Estudiantes" action={<Link to="/estudiantes" className="text-xs text-primary flex items-center gap-1 hover:underline">Ver todos <ArrowRight className="h-3 w-3" /></Link>}>
          <div className="space-y-2">
            {estudiantes.slice(0, 4).map((e: any) => (
              <div key={e.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px]">{initials(e.perfil?.nombre, e.perfil?.apellido)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.perfil?.nombre} {e.perfil?.apellido}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.carrera?.nombre}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Últimos Docentes" action={<Link to="/docentes" className="text-xs text-primary flex items-center gap-1 hover:underline">Ver todos <ArrowRight className="h-3 w-3" /></Link>}>
          <div className="space-y-2">
            {docentes.slice(0, 4).map((d: any) => (
              <div key={d.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px]">{initials(d.perfil?.nombre, d.perfil?.apellido)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.perfil?.nombre} {d.perfil?.apellido}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.especialidad ?? ""}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Accesos Rápidos">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Iniciar Proceso de Inscripción", icon: ClipboardCheck, to: "/inscripciones" },
            { label: "Registrar Estudiante", icon: Users, to: "/estudiantes" },
            { label: "Crear Oferta", icon: FileSpreadsheet, to: "/oferta-academica" },
            { label: "Ver Kardex", icon: BarChart3, to: "/kardex" },
          ].map((action, i) => (
            <Link key={i} to={action.to} className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent">
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Vista ESTUDIANTE ───────────────────────────────────────
function StudentDashboard() {
  const { perfil } = useAuth();
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [calendario, setCalendario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const estudianteId = perfil?.estudiante?.id;

  useEffect(() => {
    if (!estudianteId) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.inscripciones.list().catch(() => []),
      api.notas.list().catch(() => []),
      api.pagos.list().catch(() => []),
      api.evaluaciones.list().catch(() => []),
      api.calendario.list().catch(() => []),
    ]).then(([ins, not, pag, eva, cal]) => {
      setInscripciones(ins.filter((i: any) => i.estudianteId === estudianteId));
      setNotas(not.filter((n: any) => n.estudianteId === estudianteId));
      setPagos(pag.filter((p: any) => p.estudianteId === estudianteId));
      setEvaluaciones(eva);
      setCalendario(cal);
      setLoading(false);
    });
  }, [estudianteId]);

  const misOfertas = useMemo(() => inscripciones.map((i) => i.ofertaId), [inscripciones]);

  const actividades = useMemo(() => {
    const items: { id: string; tipo: string; mensaje: string; fecha: string; icon: React.ElementType }[] = [];
    for (const i of inscripciones) {
      items.push({
        id: `ins-${i.id}`,
        tipo: "inscripcion",
        mensaje: `Te inscribiste en ${i.oferta?.materia?.nombre ?? ""}`,
        fecha: i.fechaInscripcion ?? i.createdAt,
        icon: ClipboardCheck,
      });
    }
    for (const n of notas) {
      items.push({
        id: `nota-${n.id}`,
        tipo: "nota",
        mensaje: `Recibiste nota ${Number(n.valor)} en ${n.evaluacion?.titulo ?? ""}`,
        fecha: n.createdAt,
        icon: BarChart3,
      });
    }
    for (const p of pagos) {
      items.push({
        id: `pago-${p.id}`,
        tipo: "pago",
        mensaje: p.estado === "CONFIRMADO"
          ? `Pago confirmado: ${p.concepto ?? ""}`
          : `Pago pendiente: ${p.concepto ?? ""}`,
        fecha: p.fechaPago ?? p.createdAt,
        icon: Wallet,
      });
    }
    return items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 6);
  }, [inscripciones, notas, pagos]);

  const proximosEventos = useMemo(() => {
    const hoy = new Date();
    const items: { id: string; title: string; date: string; type: "academic" | "evaluation" | "payment" }[] = [];
    for (const e of evaluaciones) {
      if (!misOfertas.includes(e.ofertaId) || !e.fecha) continue;
      if (new Date(e.fecha) < hoy) continue;
      items.push({ id: `eva-${e.id}`, title: `${e.titulo} · ${e.oferta?.materia?.nombre ?? ""}`, date: e.fecha, type: "evaluation" });
    }
    for (const c of calendario) {
      if (new Date(c.fechaInicio) < hoy) continue;
      items.push({ id: `cal-${c.id}`, title: c.titulo, date: c.fechaInicio, type: "academic" });
    }
    for (const p of pagos) {
      if (p.estado === "CONFIRMADO") continue;
      items.push({ id: `pag-${p.id}`, title: `${p.concepto ?? "Pago"} · Bs ${Number(p.monto).toLocaleString()}`, date: p.fechaPago ?? p.createdAt, type: "payment" });
    }
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 6);
  }, [evaluaciones, calendario, pagos, misOfertas]);

  const materiasActivas = inscripciones.filter((i) => i.estado === "ACTIVA").length;
  const creditosActivos = inscripciones.filter((i) => i.estado === "ACTIVA").reduce((s, i) => s + (i.oferta?.materia?.creditos ?? 0), 0);
  const promedio = useMemo(() => {
    const vals = notas.map((n) => Number(n.valor)).filter((v) => !Number.isNaN(v));
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
  }, [notas]);
  const pagosPendientes = pagos.filter((p) => p.estado !== "CONFIRMADO").length;

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader
        title={`Hola, ${perfil?.nombre ?? "Estudiante"}`}
        description="Tu resumen académico personalizado"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Materias Activas" value={loading ? "..." : materiasActivas} icon={BookOpen} />
        <MetricCard label="Créditos Inscritos" value={loading ? "..." : creditosActivos} icon={TrendingUp} />
        <MetricCard label="Promedio" value={loading ? "..." : promedio} icon={BarChart3} />
        <MetricCard label="Pagos Pendientes" value={loading ? "..." : pagosPendientes} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Actividad Reciente" action={<span className="text-xs text-muted-foreground">Tu historial</span>}>
          <div className="space-y-3">
            {actividades.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aún no tienes actividad registrada</p>
            ) : (
              actividades.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2 mt-0.5"><act.icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{act.mensaje}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(act.fecha)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Próximos Eventos" action={<span className="text-xs text-muted-foreground">Calendario</span>}>
          <div className="space-y-3">
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin eventos próximos</p>
            ) : (
              proximosEventos.map((ev) => (
                <div key={ev.id} className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {new Date(ev.date).getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ev.date)}</p>
                  </div>
                  <Badge variant={ev.type === "academic" ? "default" : ev.type === "evaluation" ? "warning" : "success"}>
                    {ev.type === "academic" ? "Académico" : ev.type === "evaluation" ? "Evaluación" : "Pago"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card title="Mis Materias">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inscripciones.filter((i) => i.estado === "ACTIVA").map((i: any) => (
            <div key={i.id} className="rounded-xl border bg-background p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium">{i.oferta?.materia?.nombre}</p>
                <Badge variant="secondary" className="text-[9px]">{i.oferta?.materia?.codigo}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {i.oferta?.docente?.perfil?.nombre} {i.oferta?.docente?.perfil?.apellido}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{i.oferta?.materia?.creditos} créditos</p>
            </div>
          ))}
          {inscripciones.filter((i) => i.estado === "ACTIVA").length === 0 && (
            <div className="col-span-full text-center py-10">
              <Library className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tienes materias activas</p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/inscripciones">Inscribirme ahora</Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Vista DOCENTE ──────────────────────────────────────────
function TeacherDashboard() {
  const { perfil } = useAuth();
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [recursos, setRecursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const docenteId = perfil?.docente?.id;

  useEffect(() => {
    if (!docenteId) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.ofertas.list().catch(() => []),
      api.inscripciones.list().catch(() => []),
      api.evaluaciones.list().catch(() => []),
      api.recursos.list().catch(() => []),
    ]).then(([of, ins, eva, rec]) => {
      const misOfertas = of.filter((o: any) => o.docenteId === docenteId);
      const misOfertaIds = misOfertas.map((o) => o.id);
      setOfertas(misOfertas);
      setInscripciones(ins.filter((i: any) => misOfertaIds.includes(i.ofertaId)));
      setEvaluaciones(eva.filter((e: any) => misOfertaIds.includes(e.ofertaId)));
      setRecursos(rec.filter((r: any) => misOfertaIds.includes(r.ofertaId)));
      setLoading(false);
    });
  }, [docenteId]);

  const estudiantesUnicos = useMemo(() => new Set(inscripciones.map((i) => i.estudianteId)).size, [inscripciones]);

  const proximasEvaluaciones = useMemo(() => {
    const hoy = new Date();
    return evaluaciones
      .filter((e) => e.fecha && new Date(e.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 6);
  }, [evaluaciones]);

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader title={`Hola, ${perfil?.nombre ?? "Docente"}`} description="Panel de tu actividad académica" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Mis Materias" value={loading ? "..." : ofertas.length} icon={BookOpen} />
        <MetricCard label="Estudiantes a Cargo" value={loading ? "..." : estudiantesUnicos} icon={Users} />
        <MetricCard label="Evaluaciones Próximas" value={loading ? "..." : proximasEvaluaciones.length} icon={CalendarDays} />
        <MetricCard label="Recursos Publicados" value={loading ? "..." : recursos.length} icon={Library} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mis Cursos" action={<Link to="/oferta-academica" className="text-xs text-primary flex items-center gap-1 hover:underline">Ver oferta <ArrowRight className="h-3 w-3" /></Link>}>
          <div className="space-y-3">
            {ofertas.map((o: any) => {
              const matriculados = inscripciones.filter((i) => i.ofertaId === o.id).length;
              return (
                <div key={o.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                  <div className="rounded-lg bg-primary/10 p-2"><BookOpen className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.materia?.nombre}</p>
                    <p className="text-xs text-muted-foreground">{o.materia?.codigo} · {o.periodo?.codigo}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{matriculados} alumnos</Badge>
                </div>
              );
            })}
            {ofertas.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No tienes materias asignadas</p>}
          </div>
        </Card>

        <Card title="Próximas Evaluaciones" action={<Link to="/evaluaciones" className="text-xs text-primary flex items-center gap-1 hover:underline">Ver todas <ArrowRight className="h-3 w-3" /></Link>}>
          <div className="space-y-3">
            {proximasEvaluaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin evaluaciones programadas</p>
            ) : (
              proximasEvaluaciones.map((e: any) => (
                <div key={e.id} className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-xs font-semibold text-warning">
                    {e.fecha ? new Date(e.fecha).getDate() : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground">{e.oferta?.materia?.nombre} · {e.fecha ? formatDate(e.fecha) : ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card title="Acciones Rápidas">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Subir Notas", icon: FileText, to: "/notas" },
            { label: "Publicar Recurso", icon: UploadCloud, to: "/recursos" },
            { label: "Mi Horario", icon: CalendarDays, to: "/horario" },
            { label: "Mis Evaluaciones", icon: FileSpreadsheet, to: "/evaluaciones" },
          ].map((action, i) => (
            <Link key={i} to={action.to} className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent">
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { perfil, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        Cargando...
      </div>
    );
  }

  switch (perfil?.rol) {
    case "ADMIN":
    case "COORDINADOR":
      return <AdminDashboard />;

    case "DOCENTE":
      return <TeacherDashboard />;

    case "ESTUDIANTE":
      return <StudentDashboard />;

    default:
      return null;
  }
}
