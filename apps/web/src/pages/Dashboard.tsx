import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  DollarSign,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { MetricCard } from "@/features/MetricCard";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

interface DashData {
  totalEstudiantes: number;
  totalDocentes: number;
  ofertasActivas: number;
  ingresosPeriodo: number;
  inscripcionesMes: number;
  pagosPendientes: number;
  creditosPromedio: number;
  estudiantesPorCarrera: { nombre: string; cantidad: number }[];
}

const activities = [
  { type: "inscripcion", message: "María García se inscribió en Álgebra Lineal", time: "Hace 5 min", icon: BookOpen },
  { type: "pago", message: "Pago de matrícula #1024 confirmado", time: "Hace 15 min", icon: DollarSign },
  { type: "nota", message: "Notas del periodo 2026-1 publicadas", time: "Hace 1 h", icon: TrendingUp },
  { type: "estudiante", message: "Nuevo estudiante registrado: Pedro Ramírez", time: "Hace 2 h", icon: Users },
  { type: "inscripcion", message: "Carlos Martínez canceló inscripción en Cálculo", time: "Hace 3 h", icon: AlertCircle },
];

const upcomingEvents = [
  { title: "Inicio de clases 2026-1", date: "01 Feb 2026", type: "academic" as const },
  { title: "Entrega de notas parciales", date: "15 Mar 2026", type: "evaluation" as const },
  { title: "Pago de mensualidad", date: "30 Mar 2026", type: "payment" as const },
  { title: "Fin de periodo", date: "30 Jun 2026", type: "academic" as const },
];

export function Dashboard() {
  const [stats, setStats] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.get().then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <PageHeader title="Dashboard" description="Resumen general del sistema académico" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Estudiantes" value={loading ? "..." : stats?.totalEstudiantes ?? 0} icon={Users} trend={{ value: "12% vs periodo anterior", positive: true }} />
        <MetricCard label="Docentes" value={loading ? "..." : stats?.totalDocentes ?? 0} icon={GraduationCap} trend={{ value: "2 nuevos", positive: true }} />
        <MetricCard label="Ofertas Activas" value={loading ? "..." : stats?.ofertasActivas ?? 0} icon={FileSpreadsheet} />
        <MetricCard label="Ingresos del Periodo" value={loading ? "..." : `Bs ${(stats?.ingresosPeriodo ?? 0).toLocaleString()}`} icon={DollarSign} trend={{ value: "8% vs periodo anterior", positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Actividad Reciente</h3>
            <span className="text-xs text-muted-foreground">Hoy</span>
          </div>
          <div className="space-y-3">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="rounded-lg bg-muted p-2 mt-0.5">
                  <act.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{act.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Eventos Próximos</h3>
            <span className="text-xs text-muted-foreground">Calendario</span>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {ev.date.split(" ")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{ev.title}</p>
                  <p className="text-xs text-muted-foreground">{ev.date}</p>
                </div>
                <Badge variant={ev.type === "academic" ? "default" : ev.type === "evaluation" ? "warning" : "success"}>
                  {ev.type === "academic" ? "Académico" : ev.type === "evaluation" ? "Evaluación" : "Pago"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Estudiantes por Carrera</h3>
          <div className="space-y-3">
            {stats?.estudiantesPorCarrera?.map((c) => (
              <div key={c.nombre} className="flex items-center gap-3">
                <span className="text-xs font-medium w-16 truncate">{c.nombre}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.cantidad / Math.max(1, ...(stats?.estudiantesPorCarrera?.map(x => x.cantidad) ?? [1]))) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{c.cantidad}</span>
              </div>
            )) ?? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Nueva Inscripción", icon: BookOpen },
              { label: "Registrar Estudiante", icon: Users },
              { label: "Crear Oferta", icon: FileSpreadsheet },
              { label: "Ver Kardex", icon: TrendingUp },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent">
                <action.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Resumen Rápido</h3>
          <div className="space-y-3">
            {[
              { label: "Inscripciones del mes", value: stats?.inscripcionesMes ?? 0, icon: CheckCircle2 },
              { label: "Pagos pendientes", value: stats?.pagosPendientes ?? 0, icon: Clock },
              { label: "Créditos promedio", value: stats?.creditosPromedio ?? 0, icon: BookOpen },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
