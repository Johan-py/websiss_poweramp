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

interface NuevaOfertaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FieldState {
  value: string;
  error?: string;
}

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const MODALIDADES = ["PRESENCIAL", "SEMIPRESENCIAL", "VIRTUAL"] as const;

const emptyForm = (): Record<string, FieldState> => ({
  materiaId: { value: "" },
  docenteId: { value: "" },
  periodoId: { value: "" },
  aulaId: { value: "" },
  seccion: { value: "A" },
  cupoMaximo: { value: "30" },
  modalidad: { value: "PRESENCIAL" },
  dia: { value: "" },
  horaInicio: { value: "" },
  horaFin: { value: "" },
});

export function NuevaOfertaDialog({ open, onOpenChange, onSuccess }: NuevaOfertaDialogProps) {
  const [materias, setMaterias] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<Record<string, FieldState>>(emptyForm());

  useEffect(() => {
    if (!open) return;
    setLoadingData(true);
    Promise.all([
      api.materias.list().catch(() => []),
      api.docentes.list().catch(() => []),
      api.periodos.list().catch(() => []),
      api.aulas.list().catch(() => []),
    ]).then(([m, d, p, a]) => {
      setMaterias(m);
      setDocentes(d);
      setPeriodos(p);
      setAulas(a);
      setLoadingData(false);
    });
  }, [open]);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: { value, error: undefined } }));
    setMessage(null);
  };

  const validate = (): boolean => {
    const required = ["materiaId", "docenteId", "periodoId", "seccion", "cupoMaximo", "modalidad"];
    let ok = true;
    setForm((prev) => {
      const next = { ...prev };
      for (const key of required) {
        if (!next[key].value.trim()) {
          next[key] = { ...next[key], error: "Campo requerido" };
          ok = false;
        }
      }
      if (next.cupoMaximo.value && (Number(next.cupoMaximo.value) < 1 || Number.isNaN(Number(next.cupoMaximo.value)))) {
        next.cupoMaximo = { ...next.cupoMaximo, error: "Debe ser mayor a 0" };
        ok = false;
      }
      const hasHorario = next.dia.value || next.horaInicio.value || next.horaFin.value;
      if (hasHorario) {
        if (!next.dia.value) {
          next.dia = { ...next.dia, error: "Selecciona el día" };
          ok = false;
        }
        if (!next.horaInicio.value) {
          next.horaInicio = { ...next.horaInicio, error: "Hora requerida" };
          ok = false;
        }
        if (!next.horaFin.value) {
          next.horaFin = { ...next.horaFin, error: "Hora requerida" };
          ok = false;
        } else if (next.horaInicio.value && next.horaFin.value <= next.horaInicio.value) {
          next.horaFin = { ...next.horaFin, error: "Debe ser mayor que el inicio" };
          ok = false;
        }
      }
      return next;
    });
    return ok;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setMessage(null);
    const hasHorario = form.dia.value || form.horaInicio.value || form.horaFin.value;
    try {
      await api.ofertas.create({
        materiaId: form.materiaId.value,
        docenteId: form.docenteId.value,
        periodoId: form.periodoId.value,
        aulaId: form.aulaId.value || undefined,
        cupoMaximo: Number(form.cupoMaximo.value),
        seccion: form.seccion.value,
        modalidad: form.modalidad.value as any,
        horario: hasHorario
          ? { dia: form.dia.value, hora_inicio: form.horaInicio.value, hora_fin: form.horaFin.value }
          : undefined,
      });
      setMessage({ type: "success", text: "Oferta académica creada correctamente" });
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1200);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message ?? "No se pudo crear la oferta académica" });
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
          <DialogTitle>Nueva Oferta Académica</DialogTitle>
          <DialogDescription>Asigna una materia a un docente en un periodo y define el horario de la oferta.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Datos de la oferta</h3>
            <div className="space-y-1.5">
              <Label>Materia</Label>
              {selectField(
                "materiaId",
                "Selecciona la materia",
                loadingData,
                materias.map((m) => ({ id: m.id, label: `${m.nombre} (${m.codigo})` })),
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Docente</Label>
                {selectField(
                  "docenteId",
                  "Selecciona el docente",
                  loadingData,
                  docentes.map((d) => ({ id: d.id, label: `${d.perfil?.nombre ?? ""} ${d.perfil?.apellido ?? ""}` })),
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Periodo</Label>
                {selectField(
                  "periodoId",
                  "Selecciona el periodo",
                  loadingData,
                  periodos.map((p) => ({ id: p.id, label: p.nombre })),
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Horario y cupos</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Sección</Label>
                {input("seccion", "A")}
              </div>
              <div className="space-y-1.5">
                <Label>Cupo máximo</Label>
                {input("cupoMaximo", "30", "number")}
              </div>
              <div className="space-y-1.5">
                <Label>Modalidad</Label>
                {selectField(
                  "modalidad",
                  "Selecciona",
                  false,
                  MODALIDADES.map((m) => ({ id: m, label: m === "PRESENCIAL" ? "Presencial" : m === "SEMIPRESENCIAL" ? "Semipresencial" : "Virtual" })),
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Aula (opcional)</Label>
              {selectField(
                "aulaId",
                loadingData ? "Cargando..." : "Sin aula",
                loadingData,
                aulas.map((a) => ({ id: a.id, label: `${a.nombre} (${a.codigo})` })),
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Día</Label>
                {selectField(
                  "dia",
                  "Selecciona",
                  false,
                  DIAS.map((d) => ({ id: d, label: d.charAt(0) + d.slice(1).toLowerCase() })),
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Hora inicio</Label>
                {input("horaInicio", "07:00", "time")}
              </div>
              <div className="space-y-1.5">
                <Label>Hora fin</Label>
                {input("horaFin", "08:30", "time")}
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
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Crear Oferta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
