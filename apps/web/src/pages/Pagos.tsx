import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import type { Column } from "@/features/DataTable";
import { api } from "@/services/api";

interface PagoRow {
  id: string;
  estudiante: string;
  concepto: string;
  monto: number;
  referencia: string;
  fecha: string;
  estado: string;
}

const columns: Column<PagoRow>[] = [
  {
    key: "estudiante",
    header: "Estudiante",
    sortable: true,
    render: (item) => <span className="font-medium">{item.estudiante}</span>,
  },
  { key: "concepto", header: "Concepto", sortable: true },
  {
    key: "monto",
    header: "Monto",
    sortable: true,
    render: (item) => <span className="font-medium">Bs {item.monto.toLocaleString()}</span>,
  },
  { key: "fecha", header: "Fecha", sortable: true, className: "text-muted-foreground" },
  {
    key: "estado",
    header: "Estado",
    sortable: true,
    render: (item) => (
      <Badge
        variant={item.estado === "CONFIRMADO" ? "success" : item.estado === "PENDIENTE" ? "warning" : item.estado === "RECHAZADO" ? "destructive" : "secondary"}
        className="text-[10px]"
      >
        {item.estado === "CONFIRMADO" ? "Pagado" : item.estado === "PENDIENTE" ? "Pendiente" : item.estado === "RECHAZADO" ? "Rechazado" : "Anulado"}
      </Badge>
    ),
  },
];

export function PagosPage() {
  const [rows, setRows] = useState<PagoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pagos.list().then((data) => {
      setRows(
        data.map((p: any) => ({
          id: p.id,
          estudiante: p.estudiante?.perfil ? `${p.estudiante.perfil.nombre} ${p.estudiante.perfil.apellido}` : "",
          concepto: p.concepto ?? "",
          monto: Number(p.monto),
          referencia: p.referencia,
          fecha: p.fechaPago ? new Date(p.fechaPago).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString(),
          estado: p.estado,
        })),
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Pagos" description="Gestión de pagos y matrículas">
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Registrar Pago</Button>
      </PageHeader>
      <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable loading={loading} />
    </div>
  );
}
