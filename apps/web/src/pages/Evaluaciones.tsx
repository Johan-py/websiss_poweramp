import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import type { Column } from "@/features/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface EvalRow {
  id: string;
  materia: string;
  tipo: string;
  fecha: string;
  estado: string;
}

const columns: Column<EvalRow>[] = [
  { key: "materia", header: "Materia", sortable: true, render: (item) => <span className="font-medium">{item.materia}</span> },
  { key: "tipo", header: "Tipo", sortable: true },
  { key: "fecha", header: "Fecha", sortable: true, className: "text-muted-foreground" },
  {
    key: "estado",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.estado === "publicada" ? "success" : "warning"} className="text-[10px]">
        {item.estado === "publicada" ? "Publicada" : "Programada"}
      </Badge>
    ),
  },
];

export function EvaluacionesPage() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const [rows, setRows] = useState<EvalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.evaluaciones.list().catch(() => []),
      api.inscripciones.list().catch(() => []),
      api.ofertas.list().catch(() => []),
    ]).then(([data, insc, ofertas]) => {
      let filtered = data as any[];
      if (rol === "ESTUDIANTE") {
        const ids = insc.filter((i: any) => i.estudianteId === perfil?.estudiante?.id).map((i: any) => i.ofertaId);
        filtered = filtered.filter((e) => ids.includes(e.ofertaId));
      } else if (rol === "DOCENTE") {
        const ids = ofertas.filter((o: any) => o.docenteId === perfil?.docente?.id).map((o: any) => o.id);
        filtered = filtered.filter((e) => ids.includes(e.ofertaId));
      }

      setRows(
        filtered.map((e: any) => ({
          id: e.id,
          materia: e.oferta?.materia?.nombre ?? "",
          tipo: e.tipoEvaluacion,
          fecha: e.fecha ? new Date(e.fecha).toLocaleDateString() : "",
          estado: e.publicada ? "publicada" : "programada",
        })),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [rol, perfil?.estudiante?.id, perfil?.docente?.id]);

  const noData = useMemo(() => rows.length === 0 && !loading, [rows, loading]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluaciones"
        description={rol === "ESTUDIANTE" ? "Evaluaciones programadas de tus materias" : "Programación de evaluaciones académicas"}
      >
        {rol !== "ESTUDIANTE" && (
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Nueva Evaluación</Button>
        )}
      </PageHeader>

      {noData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border bg-card">
          <div className="rounded-full bg-muted p-4 mb-4"><Plus className="h-6 w-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">Sin evaluaciones</p>
          <p className="text-xs text-muted-foreground">No hay evaluaciones registradas para ti.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable loading={loading} />
      )}
    </div>
  );
}
