import { User, Mail, Shield, Calendar } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function PerfilPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Perfil" description="Tu información personal" />

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-sm">{user?.email?.slice(0, 2).toUpperCase() ?? "US"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{user?.email ?? "Usuario"}</h2>
            <p className="text-sm text-muted-foreground">Administrador del sistema</p>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombres</Label>
              <Input id="nombre" defaultValue="Admin" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" defaultValue="Sistema" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" defaultValue={user?.email ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rol">Rol</Label>
            <Input id="rol" defaultValue="Administrador" disabled />
          </div>
          <div className="pt-2">
            <Button>Guardar Cambios</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
