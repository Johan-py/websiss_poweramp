import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import type { Column } from "@/features/DataTable";
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
      <Badge variant={item.estado === "programada" ? "default" : "warning"} className="text-[10px]">
        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
      </Badge>
    ),
  },
];

export function EvaluacionesPage() {
  const [rows, setRows] = useState<EvalRow[]>([]);

  useEffect(() => {
    api.evaluaciones.list().then((data) => {
      setRows(
        data.map((e: any) => ({
          id: e.id,
          materia: e.oferta?.materia?.nombre ?? "",
          tipo: e.tipoEvaluacion,
          fecha: e.fecha ? new Date(e.fecha).toLocaleDateString() : "",
          estado: e.publicada ? "publicada" : "programada",
        })),
      );
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Evaluaciones" description="Programación de evaluaciones académicas">
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Nueva Evaluación</Button>
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable />
    </div>
  );
}
