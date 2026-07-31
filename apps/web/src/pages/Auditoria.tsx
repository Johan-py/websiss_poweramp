import { useEffect, useState } from "react";
import { Shield, LogIn, FileEdit, User, Settings } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

const iconMap: Record<string, any> = { auth: LogIn, create: FileEdit, update: FileEdit, config: Settings };

export function AuditoriaPage() {
  const { perfil } = useAuth();
  const isStudent = perfil?.rol === "ESTUDIANTE";
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.auditoria.list(isStudent ? perfil?.id : undefined).then(setLogs).catch(() => {});
  }, [isStudent, perfil?.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría"
        description={isStudent ? "Registro de las actividades realizadas en tu cuenta" : "Registro de actividades del sistema"}
      />
      <div className="rounded-xl border bg-card divide-y">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">comin soon</p>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/20">
              <div className="rounded-lg bg-muted p-2 mt-0.5"><Shield className="h-4 w-4 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.accion}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{log.perfil?.email ?? ""}</span>
                  <Badge variant="secondary" className="text-[9px]">{log.entidad}</Badge>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
