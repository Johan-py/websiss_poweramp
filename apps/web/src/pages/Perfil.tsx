import { User, Mail, Shield, Calendar } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/config/navigation";

export function PerfilPage() {
  const { perfil } = useAuth();

  const nombre = perfil?.nombre ?? "";
  const apellido = perfil?.apellido ?? "";
  const email = perfil?.email ?? "";
  const cedula = perfil?.cedula ?? "";
  const telefono = perfil?.telefono ?? "";
  const direccion = perfil?.direccion ?? "";

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Perfil" description="Tu información personal" />

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-sm">
              {`${nombre.slice(0, 1)}${apellido.slice(0, 1)}` || "US"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{nombre} {apellido}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[10px]">{getRoleLabel(perfil?.rol)}</Badge>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombres</Label>
              <Input id="nombre" defaultValue={nombre} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" defaultValue={apellido} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" defaultValue={email} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cedula">Cédula</Label>
              <Input id="cedula" defaultValue={cedula} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" defaultValue={telefono} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" defaultValue={direccion} />
          </div>
          {perfil?.estudiante && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Código de estudiante</Label>
                <Input value={perfil.estudiante.codigoEstudiante} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Carrera</Label>
                <Input value={perfil.estudiante.carrera?.nombre ?? ""} disabled />
              </div>
            </div>
          )}
          {perfil?.docente && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Código de docente</Label>
                <Input value={perfil.docente.codigoDocente} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Especialidad</Label>
                <Input value={perfil.docente.especialidad ?? ""} disabled />
              </div>
            </div>
          )}
          <div className="pt-2">
            <Button>Guardar Cambios</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
