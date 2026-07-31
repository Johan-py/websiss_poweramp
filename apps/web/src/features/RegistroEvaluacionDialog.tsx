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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface RegistroEvaluacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FieldState {
  value: string;
  error?: string;
}

const TIPOS_EVALUACION = [
  { value: "PARCIAL", label: "Parcial" },
  { value: "FINAL", label: "Final" },
  { value: "PRACTICA", label: "Práctica" },
  { value: "TALLER", label: "Taller" },
  { value: "PROYECTO", label: "Proyecto" },
  { value: "EXAMEN_CORTO", label: "Examen corto" },
  { value: "RECUPERACION", label: "Recuperación" },
];

export function RegistroEvaluacionDialog({ open, onOpenChange, onSuccess }: RegistroEvaluacionDialogProps) {
  const { perfil } = useAuth();
  const rol = perfil?.rol;

  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<Record<string, FieldState>>({
    ofertaId: { value: "" },
    titulo: { value: "" },
    descripcion: { value: "" },
    tipoEvaluacion: { value: "PARCIAL" },
    peso: { value: "20" },
    puntajeMaximo: { value: "20" },
    fecha: { value: "" },
  });
  const [publicada, setPublicada] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingOfertas(true);
    api.ofertas
      .list()
      .then((data) => {
        const filtered =
          rol === "DOCENTE" && perfil?.docente?.id
            ? data.filter((o: any) => o.docenteId === perfil.docente?.id)
            : data;
        setOfertas(filtered);
      })
      .catch(() => setOfertas([]))
      .finally(() => setLoadingOfertas(false));
  }, [open, rol, perfil?.docente?.id]);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: { value, error: undefined } }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const required = ["ofertaId", "titulo", "tipoEvaluacion", "peso", "puntajeMaximo"];
    let ok = true;
    setForm((prev) => {
      const next = { ...prev };
      for (const key of required) {
        if (!next[key].value.trim()) {
          next[key] = { ...next[key], error: "Campo requerido" };
          ok = false;
        }
      }
      const peso = Number(next.peso.value);
      if (next.peso.value && (Number.isNaN(peso) || peso <= 0)) {
        next.peso = { ...next.peso, error: "Debe ser mayor a 0" };
        ok = false;
      }
      const puntaje = Number(next.puntajeMaximo.value);
      if (next.puntajeMaximo.value && (Number.isNaN(puntaje) || puntaje <= 0)) {
        next.puntajeMaximo = { ...next.puntajeMaximo, error: "Debe ser mayor a 0" };
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
      await api.evaluaciones.create({
        ofertaId: form.ofertaId.value,
        titulo: form.titulo.value,
        descripcion: form.descripcion.value || undefined,
        tipoEvaluacion: form.tipoEvaluacion.value,
        peso: Number(form.peso.value),
        puntajeMaximo: Number(form.puntajeMaximo.value),
        fecha: form.fecha.value || undefined,
        publicada,
      });
      setMessage({ type: "success", text: "Evaluación creada correctamente" });
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1200);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message ?? "No se pudo crear la evaluación" });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setForm({
      ofertaId: { value: "" },
      titulo: { value: "" },
      descripcion: { value: "" },
      tipoEvaluacion: { value: "PARCIAL" },
      peso: { value: "20" },
      puntajeMaximo: { value: "20" },
      fecha: { value: "" },
    });
    setPublicada(false);
    setMessage(null);
  };

  const input = (key: string, placeholder: string, type = "text", className?: string) => (
    <Input
      type={type}
      placeholder={placeholder}
      value={form[key].value}
      onChange={(e) => setField(key, e.target.value)}
      error={form[key].error}
      className={className}
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
          <DialogTitle>Nueva Evaluación</DialogTitle>
          <DialogDescription>Programa una evaluación para una de tus materias y configura sus parámetros de calificación.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información general</h3>
            <div className="space-y-1.5">
              <Label>Materia</Label>
              <Select value={form.ofertaId.value} onValueChange={(v) => setField("ofertaId", v)}>
                <SelectTrigger className={cn(form.ofertaId.error && "border-destructive focus-visible:ring-destructive")}>
                  <SelectValue placeholder={loadingOfertas ? "Cargando materias..." : "Selecciona la materia"} />
                </SelectTrigger>
                <SelectContent>
                  {ofertas.length === 0 && !loadingOfertas && (
                    <div className="px-2 py-4 text-center text-xs text-muted-foreground">No tienes materias asignadas</div>
                  )}
                  {ofertas.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.materia?.nombre ?? ""} · {o.materia?.codigo ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.ofertaId.error && <p className="text-xs text-destructive">{form.ofertaId.error}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Título</Label>
              {input("titulo", "Ej: Examen Parcial 1 - Unidad 1")}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción opcional de la evaluación"
                value={form.descripcion.value}
                onChange={(e) => setField("descripcion", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de evaluación</Label>
                <Select value={form.tipoEvaluacion.value} onValueChange={(v) => setField("tipoEvaluacion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_EVALUACION.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                {input("fecha", "", "date")}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parámetros de calificación</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Peso (%)</Label>
                {input("peso", "Ej: 20")}
              </div>
              <div className="space-y-1.5">
                <Label>Puntaje máximo</Label>
                {input("puntajeMaximo", "Ej: 20")}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Publicar evaluación</Label>
                <p className="text-xs text-muted-foreground">Si lo desactivas quedará como borrador.</p>
              </div>
              <Switch checked={publicada} onCheckedChange={setPublicada} />
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
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Crear Evaluación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
