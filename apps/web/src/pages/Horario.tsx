import { useEffect, useMemo, useState } from "react";
import { Clock, GraduationCap, MapPin } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const DAYS = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
const HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

interface HorarioBlock {
  id: string;
  materia: string;
  codigo: string;
  docente: string;
  aula: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  modalidad: string;
}

function parseHorario(horario: unknown): { dia: string; horaInicio: string; horaFin: string }[] {
  if (!horario) return [];
  const arr = Array.isArray(horario) ? horario : [horario];
  return arr
    .map((h) => (typeof h === "object" && h ? h as Record<string, unknown> : {}))
    .filter((h) => h.dia && h.hora_inicio && h.hora_fin)
    .map((h) => ({
      dia: String(h.dia).toUpperCase(),
      horaInicio: String(h.hora_inicio),
      horaFin: String(h.hora_fin),
    }));
}

export function HorarioPage() {
  const { perfil } = useAuth();
  const [blocks, setBlocks] = useState<HorarioBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rol = perfil?.rol;
    Promise.all([api.ofertas.list(), api.inscripciones.list()])
      .then(([ofertas, inscripciones]) => {
        let ofertaIds: string[] | null = null;
        if (rol === "ESTUDIANTE") {
          const estId = perfil?.estudiante?.id;
          ofertaIds = inscripciones
            .filter((i: any) => i.estudianteId === estId && i.estado === "ACTIVA")
            .map((i: any) => i.ofertaId);
        } else if (rol === "DOCENTE") {
          const docId = perfil?.docente?.id;
          ofertaIds = ofertas.filter((o: any) => o.docenteId === docId).map((o: any) => o.id);
        }

        const list = (ofertaIds ? ofertas.filter((o: any) => ofertaIds!.includes(o.id)) : ofertas) as any[];
        const parsed: HorarioBlock[] = [];
        for (const o of list) {
          for (const slot of parseHorario(o.horario)) {
            parsed.push({
              id: `${o.id}-${slot.dia}-${slot.horaInicio}`,
              materia: o.materia?.nombre ?? "",
              codigo: o.materia?.codigo ?? "",
              docente: o.docente?.perfil ? `${o.docente.perfil.nombre} ${o.docente.perfil.apellido}` : "",
              aula: o.aula?.nombre ?? (o.modalidad === "VIRTUAL" ? "Virtual" : ""),
              dia: slot.dia,
              horaInicio: slot.horaInicio,
              horaFin: slot.horaFin,
              modalidad: o.modalidad ?? "",
            });
          }
        }
        setBlocks(parsed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [perfil?.rol, perfil?.estudiante?.id, perfil?.docente?.id]);

  const byDay = useMemo(() => {
    const map: Record<string, HorarioBlock[]> = {};
    for (const d of DAYS) map[d] = [];
    for (const b of blocks) {
      const day = DAYS.find((d) => d === b.dia) ?? b.dia;
      if (map[day]) map[day].push(b);
    }
    for (const d of DAYS) {
      map[d].sort((a, b) => toMinutes(a.horaInicio) - toMinutes(b.horaInicio));
    }
    return map;
  }, [blocks]);

  return (
    <div className="space-y-6">
      <PageHeader title="Horario" description="Distribución de clases por día" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4"><Clock className="h-6 w-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">Sin horario asignado</p>
          <p className="text-xs text-muted-foreground">No tienes clases registradas para este periodo.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day) => {
            const dayBlocks = byDay[day];
            if (dayBlocks.length === 0) return null;
            return (
              <div key={day} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">{day}</h3>
                  <Badge variant="secondary" className="text-[10px]">{dayBlocks.length} clases</Badge>
                </div>
                <div className="space-y-3">
                  {dayBlocks.map((b) => (
                    <div key={b.id} className="rounded-lg border bg-background p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{b.materia}</p>
                        <span className="text-xs font-mono text-muted-foreground">{b.codigo}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {b.horaInicio} - {b.horaFin}
                        </span>
                        {b.aula && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {b.aula}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        {b.docente || b.modalidad}
                      </div>
                      <div className={cn("mt-2 h-1 rounded-full", b.modalidad === "VIRTUAL" ? "bg-primary/40" : "bg-success/40")} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
