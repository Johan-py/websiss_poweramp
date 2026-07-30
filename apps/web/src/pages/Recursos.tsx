import { useEffect, useState } from "react";
import { Library, FileText, Video, Download } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

export function RecursosPage() {
  const [recursos, setRecursos] = useState<any[]>([]);

  useEffect(() => {
    api.recursos.list().then(setRecursos).catch(() => {});
  }, []);

  const getIcon = (tipo: string) => {
    if (tipo === "VIDEO") return Video;
    if (tipo === "DOCUMENTO") return FileText;
    return Library;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Recursos Académicos" description="Material de estudio y recursos didácticos" />
      <div className="grid gap-3">
        {recursos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No hay recursos disponibles</p>
        ) : (
          recursos.map((r: any) => {
            const Icon = getIcon(r.tipoRecurso);
            return (
              <div key={r.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
                <div className="rounded-lg bg-muted p-2.5"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.titulo}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{r.oferta?.materia?.nombre ?? ""}</span>
                    <Badge variant="secondary" className="text-[9px]">{r.tipoRecurso}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm"><Download className="h-4 w-4" /></Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
