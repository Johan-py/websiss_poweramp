import { useEffect, useState } from "react";
import { Plus, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/features/PageHeader";
import { api } from "@/services/api";

export function CarrerasPage() {
  const [carreras, setCarreras] = useState<any[]>([]);

  useEffect(() => {
    api.carreras.list().then(setCarreras).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Carreras" description="Planes de estudio ofrecidos">
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Nueva Carrera</Button>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {carreras.map((c: any) => (
          <div key={c.id} className="rounded-xl border bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="rounded-lg bg-primary/10 p-2"><Library className="h-4 w-4 text-primary" /></div>
              <Badge variant={c.activo ? "success" : "secondary"} className="text-[10px]">{c.activo ? "Activo" : "Inactivo"}</Badge>
            </div>
            <h3 className="font-semibold mb-1">{c.nombre}</h3>
            <p className="text-xs text-muted-foreground mb-3">{c.codigo}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{c.duracionSemestres} semestres</span>
              <span>{c.modalidad}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
