import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import { RegistroDocenteDialog } from "@/features/RegistroDocenteDialog";
import type { Column } from "@/features/DataTable";
import { api } from "@/services/api";

interface DocenteRow {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  especialidad: string;
  estado: string;
}

const columns: Column<DocenteRow>[] = [
  { key: "cedula", header: "Cédula", sortable: true, className: "text-xs text-muted-foreground" },
  {
    key: "nombres",
    header: "Nombre",
    sortable: true,
    render: (item) => <span className="font-medium">{item.nombres} {item.apellidos}</span>,
  },
  {
    key: "email",
    header: "Email",
    sortable: true,
    className: "text-muted-foreground hidden md:table-cell",
    headerClassName: "hidden md:table-cell",
  },
  {
    key: "especialidad",
    header: "Especialidad",
    sortable: true,
    className: "hidden lg:table-cell",
    headerClassName: "hidden lg:table-cell",
  },
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

export function DocentesPage() {
  const [rows, setRows] = useState<DocenteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.docentes.list().then((data) => {
      setRows(
        data.map((d: any) => ({
          id: d.id,
          cedula: d.perfil?.cedula ?? "",
          nombres: d.perfil?.nombre ?? "",
          apellidos: d.perfil?.apellido ?? "",
          email: d.perfil?.email ?? "",
          especialidad: d.especialidad ?? "",
          estado: d.perfil?.activo ? "activo" : "inactivo",
        })),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Docentes" description="Gestión del personal docente">
        <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Nuevo Docente</Button>
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable searchPlaceholder="Buscar docente..." loading={loading} pageSize={8} />
      <RegistroDocenteDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />
    </div>
  );
}
