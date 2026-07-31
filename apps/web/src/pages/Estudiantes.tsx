import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import { RegistroEstudianteDialog } from "@/features/RegistroEstudianteDialog";
import type { Column } from "@/features/DataTable";
import { api } from "@/services/api";

interface EstudianteRow {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  codigoEstudiante: string;
  carrera: string;
  estado: string;
}

const columns: Column<EstudianteRow>[] = [
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
    key: "carrera",
    header: "Carrera",
    sortable: true,
    render: (item) => <span className="text-sm">{item.carrera ?? "-"}</span>,
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

export function EstudiantesPage() {
  const [rows, setRows] = useState<EstudianteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.estudiantes.list().then((data) => {
      setRows(
        data.map((e: any) => ({
          id: e.id,
          cedula: e.perfil?.cedula ?? "",
          nombres: e.perfil?.nombre ?? "",
          apellidos: e.perfil?.apellido ?? "",
          email: e.perfil?.email ?? "",
          codigoEstudiante: e.codigoEstudiante,
          carrera: e.carrera?.nombre ?? "",
          estado: e.perfil?.activo ? "activo" : "inactivo",
        })),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Estudiantes" description="Gestión de estudiantes matriculados">
        <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Nuevo Estudiante</Button>
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable searchPlaceholder="Buscar por nombre, cédula o email..." loading={loading} pageSize={8} />
      <RegistroEstudianteDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />
    </div>
  );
}
