import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

interface RegistroDocenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FieldState {
  value: string;
  error?: string;
}

export function RegistroDocenteDialog({ open, onOpenChange, onSuccess }: RegistroDocenteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<Record<string, FieldState>>({
    nombre: { value: "" },
    apellido: { value: "" },
    cedula: { value: "" },
    email: { value: "" },
    telefono: { value: "" },
    direccion: { value: "" },
    password: { value: "" },
    codigoDocente: { value: "" },
    especialidad: { value: "" },
  });

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: { value, error: undefined } }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const required = ["nombre", "apellido", "cedula", "email", "password", "codigoDocente"];
    let ok = true;
    setForm((prev) => {
      const next = { ...prev };
      for (const key of required) {
        if (!next[key].value.trim()) {
          next[key] = { ...next[key], error: "Campo requerido" };
          ok = false;
        }
      }
      if (next.email.value && !/^\S+@\S+\.\S+$/.test(next.email.value.trim())) {
        next.email = { ...next.email, error: "Email inválido" };
        ok = false;
      }
      if (next.password.value && next.password.value.length < 6) {
        next.password = { ...next.password, error: "Mínimo 6 caracteres" };
        ok = false;
      }
      return next;
    });
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await api.docentes.create({
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        cedula: form.cedula.value,
        email: form.email.value,
        telefono: form.telefono.value || undefined,
        direccion: form.direccion.value || undefined,
        password: form.password.value,
        codigoDocente: form.codigoDocente.value,
        especialidad: form.especialidad.value || undefined,
      });
      setMessage({ type: "success", text: "Docente registrado correctamente" });
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1200);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message ?? "No se pudo registrar el docente" });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({
      nombre: { value: "" },
      apellido: { value: "" },
      cedula: { value: "" },
      email: { value: "" },
      telefono: { value: "" },
      direccion: { value: "" },
      password: { value: "" },
      codigoDocente: { value: "" },
      especialidad: { value: "" },
    });
    setMessage(null);
  };

  const input = (key: string, placeholder: string, type = "text") => (
    <Input
      type={type}
      placeholder={placeholder}
      value={form[key].value}
      onChange={(e) => setField(key, e.target.value)}
      error={form[key].error}
    />
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar Docente</DialogTitle>
          <DialogDescription>Ingresa todos los datos del docente. Se creará el perfil de acceso y su ficha docente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos personales</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombres</Label>
                {input("nombre", "Ej: Pedro")}
              </div>
              <div className="space-y-1.5">
                <Label>Apellidos</Label>
                {input("apellido", "Ej: Martínez")}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cédula</Label>
                {input("cedula", "Ej: 1712345678")}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                {input("email", "Ej: docente@universidad.edu", "email")}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                {input("telefono", "Ej: 0999123456")}
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                {input("direccion", "Ej: Quito, Av. Amazonas")}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña de acceso</Label>
              {input("password", "Mínimo 6 caracteres", "password")}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos profesionales</h3>
            <div className="space-y-1.5">
              <Label>Código de docente</Label>
              {input("codigoDocente", "Ej: D004")}
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad</Label>
              <Textarea
                placeholder="Ej: Bases de Datos, Programación, Desarrollo Web"
                value={form.especialidad.value}
                onChange={(e) => setField("especialidad", e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className={cn("flex items-center gap-2 rounded-lg p-3 text-sm", message.type === "success" ? "bg-success/5 text-success" : "bg-destructive/5 text-destructive")}>
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <span className="shrink-0">!</span>}
              {message.text}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Registrando...</> : "Registrar Docente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
