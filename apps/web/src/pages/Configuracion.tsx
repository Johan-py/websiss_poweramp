import { Settings, Bell, Shield, Palette, Globe } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConfiguracionPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Configuración" description="Preferencias del sistema" />

      <div className="rounded-xl border bg-card divide-y">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Apariencia</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Tema oscuro</Label>
                <p className="text-xs text-muted-foreground">Activar modo oscuro</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-1.5">
              <Label>Idioma</Label>
              <Select defaultValue="es">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Notificaciones</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Inscripciones", desc: "Notificar nuevas inscripciones" },
              { label: "Pagos", desc: "Notificar pagos recibidos" },
              { label: "Cambios de notas", desc: "Notificar actualizaciones de calificaciones" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Seguridad</h3>
          </div>
          <Button variant="outline" size="sm">Cambiar contraseña</Button>
        </div>
      </div>
    </div>
  );
}
