import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import { cn } from "@/lib/utils";
import type { Column } from "@/features/DataTable";
import { api } from "@/services/api";

interface NotaRow {
  id: string;
  estudiante: string;
  materia: string;
  calificacion: number;
  estado: string;
}

const columns: Column<NotaRow>[] = [
  { key: "estudiante", header: "Estudiante", sortable: true, render: (item) => <span className="font-medium">{item.estudiante}</span> },
  { key: "materia", header: "Materia", sortable: true, className: "text-muted-foreground" },
  {
    key: "calificacion",
    header: "Nota",
    sortable: true,
    className: "text-center font-semibold",
    headerClassName: "text-center",
    render: (item) => <span className={cn(item.calificacion >= 60 ? "text-success" : "text-destructive")}>{item.calificacion}</span>,
  },
  {
    key: "estado",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.estado === "aprobada" ? "success" : "destructive"} className="text-[10px]">
        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
      </Badge>
    ),
  },
];

export function NotasPage() {
  const [rows, setRows] = useState<NotaRow[]>([]);

  useEffect(() => {
    api.notas.list().then((data) => {
      setRows(
        data.map((n: any) => {
          const valor = Number(n.valor);
          return {
            id: n.id,
            estudiante: n.estudiante?.perfil ? `${n.estudiante.perfil.nombre} ${n.estudiante.perfil.apellido}` : "",
            materia: n.evaluacion?.oferta?.materia?.nombre ?? "",
            calificacion: valor,
            estado: valor >= 60 ? "aprobada" : "reprobada",
          };
        }),
      );
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Notas" description="Registro de calificaciones">
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Registrar Notas</Button>
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable />
    </div>
  );
}
