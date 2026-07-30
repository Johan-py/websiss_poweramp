import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

export function CalendarioPage() {
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    api.calendario.list().then(setEventos).catch(() => {});
  }, []);

  const getVariant = (tipo: string) => {
    if (tipo === "INICIO_CLASES" || tipo === "FIN_CLASES") return "default";
    if (tipo === "EXAMENES") return "warning";
    if (tipo === "MATRICULA") return "success";
    return "secondary";
  };

  const getLabel = (tipo: string) => {
    if (tipo === "INICIO_CLASES") return "Inicio";
    if (tipo === "FIN_CLASES") return "Fin";
    if (tipo === "EXAMENES") return "Examen";
    if (tipo === "MATRICULA") return "Matrícula";
    if (tipo === "VACACIONES") return "Vacaciones";
    if (tipo === "FERIADO") return "Feriado";
    return "Evento";
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Calendario Académico" description="Eventos y fechas importantes">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium px-2">{new Date().toLocaleString("default", { month: "long", year: "numeric" })}</span>
          <Button variant="ghost" size="icon-sm"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </PageHeader>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Próximos Eventos</h3>
        <div className="space-y-2">
          {eventos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay eventos registrados</p>
          ) : (
            eventos.map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-3 py-1.5">
                <Badge variant={getVariant(ev.tipoEvento)} className="w-20 text-[10px] justify-center">
                  {getLabel(ev.tipoEvento)}
                </Badge>
                <span className="text-sm flex-1">{ev.titulo}</span>
                <span className="text-xs text-muted-foreground">{new Date(ev.fechaInicio).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
