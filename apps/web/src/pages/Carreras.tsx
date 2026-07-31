import { useEffect, useState } from "react";
import { Plus, Library, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Carrera {
  id: string;
  codigo: string;
  nombre: string;
  modalidad: string;
  duracionSemestres: number;
  activo: boolean;
}

interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  creditos: number;
  horasTeoricas: number;
  horasPracticas: number;
  ciclo: number;
  activo: boolean;
}

interface CarreraDetalle extends Carrera {
  materias: Materia[];
}

export function CarrerasPage() {
  const { perfil } = useAuth();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [detalle, setDetalle] = useState<CarreraDetalle | null>(null);
  const [cargandoMalla, setCargandoMalla] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    api.carreras.list().then(setCarreras).catch(() => {});
  }, []);

  const abrirMalla = async (c: Carrera) => {
    setAbierto(true);
    setCargandoMalla(true);
    setDetalle(null);
    try {
      const d = await api.carreras.get(c.id);
      setDetalle(d);
    } catch {
      setDetalle(null);
    } finally {
      setCargandoMalla(false);
    }
  };

  const semestres = detalle
    ? Array.from({ length: detalle.duracionSemestres }, (_, i) => i + 1)
        .map((ciclo) => ({
          ciclo,
          materias: (detalle.materias ?? []).filter((m) => m.ciclo === ciclo),
        }))
        .filter((s) => s.materias.length > 0)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Carreras" description="Planes de estudio ofrecidos">
        {perfil?.rol !== "ESTUDIANTE" && (
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Nueva Carrera</Button>
        )}
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {carreras.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => abrirMalla(c)}
            className="group rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-lg bg-primary/10 p-2"><Library className="h-4 w-4 text-primary" /></div>
              <Badge variant={c.activo ? "success" : "secondary"} className="text-[10px]">{c.activo ? "Activo" : "Inactivo"}</Badge>
            </div>
            <h3 className="font-semibold mb-1 group-hover:text-primary">{c.nombre}</h3>
            <p className="text-xs text-muted-foreground mb-3">{c.codigo}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{c.duracionSemestres} semestres</span>
                <span>{c.modalidad}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                Malla curricular
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detalle?.nombre ?? "Malla curricular"}</DialogTitle>
            <DialogDescription>
              {detalle
                ? `${detalle.codigo} · ${detalle.modalidad} · ${detalle.duracionSemestres} semestres`
                : "Cargando plan de estudios..."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            {cargandoMalla ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : detalle && semestres.length > 0 ? (
              <div className="space-y-5">
                {semestres.map((s) => (
                  <div key={s.ciclo}>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs text-primary">
                        {s.ciclo}
                      </span>
                      Semestre {s.ciclo}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({s.materias.reduce((acc, m) => acc + m.creditos, 0)} créditos)
                      </span>
                    </h4>
                    <div className="divide-y rounded-lg border">
                      {s.materias.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{m.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {m.codigo} · {m.horasTeoricas + m.horasPracticas} h/sem
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">{m.creditos} cr</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {detalle ? "Esta carrera no tiene materias registradas." : "No se pudo cargar la malla curricular."}
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
