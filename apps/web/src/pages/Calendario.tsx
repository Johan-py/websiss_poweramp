import { useEffect, useMemo, useState } from "react";
import { CalendarDays, FileText } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface CalendarItem {
  id: string;
  titulo: string;
  fechaInicio: string;
  tipoEvento: string;
  origen: "calendario" | "evaluacion";
  materia?: string;
}

export function CalendarioPage() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.calendario.list().catch(() => []), api.evaluaciones.list().catch(() => []), api.inscripciones.list().catch(() => [])])
      .then(async ([cal, evas, insc]) => {
        const list: CalendarItem[] = cal.map((c: any) => ({
          id: c.id,
          titulo: c.titulo,
          fechaInicio: c.fechaInicio,
          tipoEvento: c.tipoEvento,
          origen: "calendario" as const,
        }));

        let evaluaciones = evas as any[];
        if (rol === "ESTUDIANTE") {
          const ids = insc.filter((i: any) => i.estudianteId === perfil?.estudiante?.id).map((i: any) => i.ofertaId);
          evaluaciones = evaluaciones.filter((e) => ids.includes(e.ofertaId));
        } else if (rol === "DOCENTE") {
          const ids = (await api.ofertas.list().catch(() => [])).filter((o: any) => o.docenteId === perfil?.docente?.id).map((o: any) => o.id);
          evaluaciones = evaluaciones.filter((e) => ids.includes(e.ofertaId));
        }

        for (const e of evaluaciones) {
          if (!e.fecha) continue;
          list.push({
            id: e.id,
            titulo: e.titulo,
            fechaInicio: e.fecha,
            tipoEvento: "EXAMENES",
            origen: "evaluacion" as const,
            materia: e.oferta?.materia?.nombre,
          });
        }

        list.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
        setItems(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rol, perfil?.estudiante?.id, perfil?.docente?.id]);

  const getVariant = (item: CalendarItem) => {
    if (item.origen === "evaluacion") return "warning";
    const tipo = item.tipoEvento;
    if (tipo === "INICIO_CLASES" || tipo === "FIN_CLASES") return "default";
    if (tipo === "EXAMENES") return "warning";
    if (tipo === "MATRICULA") return "success";
    return "secondary";
  };

  const getLabel = (item: CalendarItem) => {
    if (item.origen === "evaluacion") return "Examen";
    const tipo = item.tipoEvento;
    if (tipo === "INICIO_CLASES") return "Inicio";
    if (tipo === "FIN_CLASES") return "Fin";
    if (tipo === "EXAMENES") return "Examen";
    if (tipo === "MATRICULA") return "Matrícula";
    if (tipo === "VACACIONES") return "Vacaciones";
    if (tipo === "FERIADO") return "Feriado";
    return "Evento";
  };

  const proximos = useMemo(() => items.filter((i) => new Date(i.fechaInicio) >= new Date(new Date().setHours(0, 0, 0, 0))), [items]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario Académico"
        description={rol === "ESTUDIANTE" ? "Eventos y evaluaciones de tus materias" : "Eventos y fechas importantes"}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Próximos Eventos</h3>
            </div>
            <div className="space-y-2">
              {proximos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay eventos registrados</p>
              ) : (
                proximos.map((ev) => (
                  <div key={`${ev.origen}-${ev.id}`} className="flex items-center gap-3 py-1.5">
                    <Badge variant={getVariant(ev)} className="w-20 text-[10px] justify-center">
                      {getLabel(ev)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{ev.titulo}</p>
                      {ev.materia && <p className="text-xs text-muted-foreground truncate">{ev.materia}</p>}
                    </div>
                    {ev.origen === "evaluacion" && <FileText className="h-3.5 w-3.5 text-warning shrink-0" />}
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(ev.fechaInicio).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Todos los Eventos</h3>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No hay eventos registrados</p>
              ) : (
                items.map((ev) => (
                  <div key={`${ev.origen}-${ev.id}`} className="flex items-center gap-3 py-1.5">
                    <Badge variant={getVariant(ev)} className="w-20 text-[10px] justify-center">
                      {getLabel(ev)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{ev.titulo}</p>
                      {ev.materia && <p className="text-xs text-muted-foreground truncate">{ev.materia}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(ev.fechaInicio).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
