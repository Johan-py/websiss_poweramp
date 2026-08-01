import { useEffect, useState } from "react";
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
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

interface NuevaMateriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FieldState {
  value: string;
  error?: string;
}

const emptyForm = (): Record<string, FieldState> => ({
  carreraId: { value: "" },
  codigo: { value: "" },
  nombre: { value: "" },
  descripcion: { value: "" },
  creditos: { value: "" },
  horasTeoricas: { value: "" },
  horasPracticas: { value: "" },
  ciclo: { value: "" },
});

export function NuevaMateriaDialog({ open, onOpenChange, onSuccess }: NuevaMateriaDialogProps) {
  const [carreras, setCarreras] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<Record<string, FieldState>>(emptyForm());

  useEffect(() => {
    if (!open) return;
    setLoadingData(true);
    api.carreras.list().then((c) => {
      setCarreras(c);
      setLoadingData(false);
    }).catch(() => setLoadingData(false));
  }, [open]);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: { value, error: undefined } }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const required = ["carreraId", "codigo", "nombre", "creditos", "ciclo"];
    let ok = true;
    setForm((prev) => {
      const next = { ...prev };
      for (const key of required) {
        if (!next[key].value.trim()) {
          next[key] = { ...next[key], error: "Campo requerido" };
          ok = false;
        }
      }
      if (next.creditos.value && (Number.isNaN(Number(next.creditos.value)) || Number(next.creditos.value) <= 0)) {
        next.creditos = { ...next.creditos, error: "Debe ser mayor a 0" };
        ok = false;
      }
      if (next.ciclo.value && (Number.isNaN(Number(next.ciclo.value)) || Number(next.ciclo.value) <= 0)) {
        next.ciclo = { ...next.ciclo, error: "Debe ser mayor a 0" };
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
      await api.materias.create({
        carreraId: form.carreraId.value,
        codigo: form.codigo.value,
        nombre: form.nombre.value,
        descripcion: form.descripcion.value || undefined,
        creditos: Number(form.creditos.value),
        horasTeoricas: form.horasTeoricas.value ? Number(form.horasTeoricas.value) : undefined,
        horasPracticas: form.horasPracticas.value ? Number(form.horasPracticas.value) : undefined,
        ciclo: Number(form.ciclo.value),
      });
      setMessage({ type: "success", text: "Materia creada correctamente" });
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1200);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message ?? "No se pudo crear la materia" });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm(emptyForm());
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
    loading: boolean,
    items: { id: string; label: string }[],
  ) => (
    <div>
      <Select value={form[key].value} onValueChange={(v) => setField(key, v)}>
        <SelectTrigger className={cn(form[key].error && "border-destructive focus-visible:ring-destructive")}>
          <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
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
          <DialogTitle>Nueva Materia</DialogTitle>
          <DialogDescription>Registra una materia en el catálogo del plan de estudios.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos de la materia</h3>
            <div className="space-y-1.5">
              <Label>Carrera</Label>
              {selectField(
                "carreraId",
                "Selecciona la carrera",
                loadingData,
                carreras.map((c) => ({ id: c.id, label: c.nombre })),
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código</Label>
                {input("codigo", "INF-101")}
              </div>
              <div className="space-y-1.5">
                <Label>Ciclo</Label>
                {input("ciclo", "1", "number")}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              {input("nombre", "Nombre de la materia")}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              {input("descripcion", "Breve descripción de la materia")}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carga académica</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Créditos</Label>
                {input("creditos", "4", "number")}
              </div>
              <div className="space-y-1.5">
                <Label>Horas teóricas</Label>
                {input("horasTeoricas", "0", "number")}
              </div>
              <div className="space-y-1.5">
                <Label>Horas prácticas</Label>
                {input("horasPracticas", "0", "number")}
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
          <Button onClick={handleSubmit} disabled={submitting || loadingData}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Crear Materia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
