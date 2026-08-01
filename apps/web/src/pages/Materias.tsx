import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import { NuevaMateriaDialog } from "@/features/NuevaMateriaDialog";
import type { Column } from "@/features/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface MateriaRow {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  horasSemana: number;
  estado: string;
}

const columns: Column<MateriaRow>[] = [
  { key: "codigo", header: "Código", sortable: true, className: "text-xs font-mono text-muted-foreground" },
  { key: "nombre", header: "Nombre", sortable: true, render: (item) => <span className="font-medium">{item.nombre}</span> },
  { key: "creditos", header: "Créditos", sortable: true, className: "text-center", headerClassName: "text-center" },
  { key: "horasSemana", header: "Horas/Semana", sortable: true, className: "text-center hidden md:table-cell", headerClassName: "text-center hidden md:table-cell" },
  {
    key: "estado",
    header: "Estado",
    sortable: true,
    render: (item) => (
      <Badge variant={item.estado === "activo" ? "success" : "secondary"} className="text-[10px]">
        {item.estado === "activo" ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
];

export function MateriasPage() {
  const { perfil } = useAuth();
  const [rows, setRows] = useState<MateriaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.materias.list().then((data) => {
      setRows(
        data.map((m: any) => ({
          id: m.id,
          codigo: m.codigo,
          nombre: m.nombre,
          creditos: m.creditos,
          horasSemana: m.horasTeoricas + m.horasPracticas,
          estado: m.activo ? "activo" : "inactivo",
        })),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Materias" description="Catálogo de materias del plan de estudios">
        {perfil?.rol !== "ESTUDIANTE" && (
          <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Nueva Materia</Button>
        )}
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable searchPlaceholder="Buscar materia..." loading={loading} pageSize={8} />
      {perfil?.rol !== "ESTUDIANTE" && <NuevaMateriaDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />}
    </div>
  );
}
