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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

interface NuevaCarreraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FieldState {
  value: string;
  error?: string;
}

const MODALIDADES = ["PRESENCIAL", "SEMIPRESENCIAL", "VIRTUAL"] as const;

const emptyForm = (): Record<string, FieldState> => ({
  codigo: { value: "" },
  nombre: { value: "" },
  descripcion: { value: "" },
  modalidad: { value: "PRESENCIAL" },
  duracionSemestres: { value: "" },
});

export function NuevaCarreraDialog({ open, onOpenChange, onSuccess }: NuevaCarreraDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [activo, setActivo] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<Record<string, FieldState>>(emptyForm());

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: { value, error: undefined } }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const required = ["codigo", "nombre", "duracionSemestres"];
    let ok = true;
    setForm((prev) => {
      const next = { ...prev };
      for (const key of required) {
        if (!next[key].value.trim()) {
          next[key] = { ...next[key], error: "Campo requerido" };
          ok = false;
        }
      }
      if (next.duracionSemestres.value && (Number.isNaN(Number(next.duracionSemestres.value)) || Number(next.duracionSemestres.value) <= 0)) {
        next.duracionSemestres = { ...next.duracionSemestres, error: "Debe ser mayor a 0" };
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
      await api.carreras.create({
        codigo: form.codigo.value,
        nombre: form.nombre.value,
        descripcion: form.descripcion.value || undefined,
        modalidad: form.modalidad.value as "PRESENCIAL" | "SEMIPRESENCIAL" | "VIRTUAL",
        duracionSemestres: Number(form.duracionSemestres.value),
        activo,
      });
      setMessage({ type: "success", text: "Carrera creada correctamente" });
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1200);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message ?? "No se pudo crear la carrera" });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(emptyForm());
    setActivo(true);
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

  const selectField = (
    key: string,
    placeholder: string,
    items: { id: string; label: string }[],
  ) => (
    <div>
      <Select value={form[key].value} onValueChange={(v) => setField(key, v)}>
        <SelectTrigger className={cn(form[key].error && "border-destructive focus-visible:ring-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {form[key].error && <p className="text-xs text-destructive">{form[key].error}</p>}
    </div>
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
          <DialogTitle>Nueva Carrera</DialogTitle>
          <DialogDescription>Registra una nueva carrera en el plan de estudios.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos de la carrera</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código</Label>
                {input("codigo", "ING-SIS")}
              </div>
              <div className="space-y-1.5">
                <Label>Duración (semestres)</Label>
                {input("duracionSemestres", "8", "number")}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              {input("nombre", "Nombre de la carrera")}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              {input("descripcion", "Breve descripción de la carrera")}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Configuración</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Modalidad</Label>
                {selectField(
                  "modalidad",
                  "Selecciona",
                  MODALIDADES.map((m) => ({ id: m, label: m === "PRESENCIAL" ? "Presencial" : m === "SEMIPRESENCIAL" ? "Semipresencial" : "Virtual" })),
                )}
              </div>
              <div className="flex items-end pb-1">
                <div className="flex w-full items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <p className="text-xs text-muted-foreground">Disponible para inscripción</p>
                  </div>
                  <Switch checked={activo} onCheckedChange={setActivo} />
                </div>
              </div>
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
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Crear Carrera"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
