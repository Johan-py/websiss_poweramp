import { useEffect, useMemo, useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import { cn } from "@/lib/utils";
import type { Column } from "@/features/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface OfertaRow {
  id: string;
  materia: string;
  codigo: string;
  docente: string;
  horario: string;
  cupoActual: number;
  cupoMaximo: number;
  estado: string;
}

const columns: Column<OfertaRow>[] = [
  {
    key: "materia",
    header: "Materia",
    sortable: true,
    render: (item) => (
      <div>
        <p className="font-medium">{item.materia}</p>
        <p className="text-xs text-muted-foreground">{item.codigo}</p>
      </div>
    ),
  },
  {
    key: "docente",
    header: "Docente",
    sortable: true,
    className: "hidden md:table-cell",
    headerClassName: "hidden md:table-cell",
  },
  {
    key: "horario",
    header: "Horario",
    render: (item) => (
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {item.horario}
      </span>
    ),
    className: "hidden lg:table-cell",
    headerClassName: "hidden lg:table-cell",
  },
  {
    key: "cupoActual",
    header: "Cupos",
    sortable: true,
    render: (item) => {
      const pct = (item.cupoActual / item.cupoMaximo) * 100;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{item.cupoActual}/{item.cupoMaximo}</span>
          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full", pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-warning" : "bg-success")} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      );
    },
  },
  {
    key: "estado",
    header: "Estado",
    sortable: true,
    render: (item) => (
      <Badge variant={item.estado === "abierta" ? "success" : item.estado === "completa" ? "warning" : "secondary"} className="text-[10px]">
        {item.estado === "abierta" ? "Disponible" : item.estado === "completa" ? "Completa" : "Cerrada"}
      </Badge>
    ),
  },
];

export function OfertaAcademicaPage() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const [rows, setRows] = useState<OfertaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ofertas.list().then((data) => {
      const filtered = rol === "DOCENTE"
        ? data.filter((o: any) => o.docenteId === perfil?.docente?.id)
        : data;
      setRows(
        filtered.map((o: any) => ({
          id: o.id,
          materia: o.materia?.nombre ?? "",
          codigo: o.materia?.codigo ?? "",
          docente: o.docente?.perfil ? `${o.docente.perfil.nombre} ${o.docente.perfil.apellido}` : "",
          horario: o.horario
            ? (Array.isArray(o.horario)
                ? o.horario.map((h: any) => `${h.dia ?? ""} ${h.hora_inicio ?? ""}-${h.hora_fin ?? ""}`).join(", ")
                : `${o.horario.dia ?? ""} ${o.horario.hora_inicio ?? ""}-${o.horario.hora_fin ?? ""}`)
            : "",
          cupoActual: o.cupoMaximo - o.cupoDisponible,
          cupoMaximo: o.cupoMaximo,
          estado: !o.activo ? "cerrada" : o.cupoDisponible <= 0 ? "completa" : "abierta",
        })),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [rol, perfil?.docente?.id]);

  const canCreate = rol === "ADMIN" || rol === "COORDINADOR";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oferta Académica"
        description={rol === "DOCENTE" ? "Materias que impartes este periodo" : "Materias ofertadas por periodo"}
      >
        {canCreate && (
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Nueva Oferta</Button>
        )}
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable searchPlaceholder="Buscar materia o docente..." loading={loading} pageSize={8} />
    </div>
  );
}
