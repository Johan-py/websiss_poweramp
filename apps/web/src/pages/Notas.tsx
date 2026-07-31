import { useEffect, useMemo, useState } from "react";
import { Plus, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/features/PageHeader";
import { DataTable } from "@/features/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Column } from "@/features/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface NotaRow {
  id: string;
  estudiante: string;
  materia: string;
  calificacion: number;
  estado: string;
}

const columns: Column<NotaRow>[] = [
  { key: "estudiante", header: "Estudiante", sortable: true, render: (item) => <span className="font-medium">{item.estudiante}</span> },
  { key: "materia", header: "Materia", sortable: true, className: "text-muted-foreground" },
  {
    key: "calificacion",
    header: "Nota",
    sortable: true,
    className: "text-center font-semibold",
    headerClassName: "text-center",
    render: (item) => <span className={cn(item.calificacion >= 14 ? "text-success" : "text-destructive")}>{item.calificacion}</span>,
  },
  {
    key: "estado",
    header: "Estado",
    render: (item) => (
      <Badge variant={item.estado === "aprobada" ? "success" : "destructive"} className="text-[10px]">
        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
      </Badge>
    ),
  },
];

export function NotasPage() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const estudianteId = perfil?.estudiante?.id;

  const [rows, setRows] = useState<NotaRow[]>([]);
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [misOfertas, setMisOfertas] = useState<any[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState("");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const misOfertaIds = useMemo(() => misOfertas.map((o) => o.id), [misOfertas]);

  useEffect(() => {
    const load = async () => {
      const [notaData, ofertaData, evaluacionData, inscripcionData] = await Promise.all([
        api.notas.list().catch(() => []),
        api.ofertas.list().catch(() => []),
        api.evaluaciones.list().catch(() => []),
        api.inscripciones.list().catch(() => []),
      ]);
      setNotas(notaData);
      const docId = perfil?.docente?.id;
      const misOfertasList = docId ? ofertaData.filter((o: any) => o.docenteId === docId) : ofertaData;
      setMisOfertas(misOfertasList);
      setEvaluaciones(evaluacionData);
      setInscripciones(inscripcionData);

      let filtered = notaData;
      if (rol === "ESTUDIANTE") filtered = notaData.filter((n: any) => n.estudianteId === estudianteId);
      if (rol === "DOCENTE") {
        const ids = misOfertasList.map((o: any) => o.id);
        filtered = notaData.filter((n: any) => ids.includes(n.evaluacion?.ofertaId));
      }

      setRows(
        filtered.map((n: any) => {
          const valor = Number(n.valor);
          return {
            id: n.id,
            estudiante: n.estudiante?.perfil ? `${n.estudiante.perfil.nombre} ${n.estudiante.perfil.apellido}` : "",
            materia: n.evaluacion?.oferta?.materia?.nombre ?? "",
            calificacion: valor,
            estado: valor >= 14 ? "aprobada" : "reprobada",
          };
        }),
      );
      setLoading(false);
    };
    load().catch(() => setLoading(false));
  }, [rol, estudianteId, perfil?.docente?.id]);

  const misEvaluaciones = useMemo(
    () => evaluaciones.filter((e: any) => misOfertaIds.includes(e.ofertaId)),
    [evaluaciones, misOfertaIds],
  );

  const estudiantesEnEvaluacion = useMemo(() => {
    const eva = misEvaluaciones.find((e) => e.id === selectedEvaluacion);
    if (!eva) return [];
    return inscripciones.filter((i: any) => i.ofertaId === eva.ofertaId && i.estado === "ACTIVA");
  }, [misEvaluaciones, selectedEvaluacion, inscripciones]);

  const openDialog = () => {
    setOpen(true);
    setSelectedEvaluacion("");
    setValores({});
    setMessage(null);
  };

  const handleSave = async () => {
    if (!selectedEvaluacion) return;
    setSaving(true);
    setMessage(null);
    const entries = Object.entries(valores).filter(([, v]) => v.trim() !== "");
    try {
      for (const [estudianteId, valor] of entries) {
        await api.notas.upsert({
          evaluacionId: selectedEvaluacion,
          estudianteId,
          valor: Math.max(0, Math.min(20, Number(valor))),
        });
      }
      setMessage(`Se guardaron ${entries.length} notas correctamente`);
      setOpen(false);
      const notaData = await api.notas.list().catch(() => []);
      setNotas(notaData);
      const ids = misOfertaIds;
      const filtered = notaData.filter((n: any) => ids.includes(n.evaluacion?.ofertaId));
      setRows(
        filtered.map((n: any) => {
          const valor = Number(n.valor);
          return {
            id: n.id,
            estudiante: n.estudiante?.perfil ? `${n.estudiante.perfil.nombre} ${n.estudiante.perfil.apellido}` : "",
            materia: n.evaluacion?.oferta?.materia?.nombre ?? "",
            calificacion: valor,
            estado: valor >= 14 ? "aprobada" : "reprobada",
          };
        }),
      );
    } catch (e: any) {
      setMessage(e.message ?? "Error al guardar las notas");
    } finally {
      setSaving(false);
    }
  };

  const isDocente = rol === "DOCENTE";
  const isAdmin = rol === "ADMIN" || rol === "COORDINADOR";

  return (
    <div className="space-y-6">
      <PageHeader
        title={rol === "ESTUDIANTE" ? "Mis Notas" : "Notas"}
        description={rol === "ESTUDIANTE" ? "Tus calificaciones registradas" : "Registro de calificaciones"}
      >
        {isDocente && (
          <Button size="sm" onClick={openDialog}>
            <Plus className="h-4 w-4 mr-1.5" /> Subir Notas
          </Button>
        )}
      </PageHeader>

      {rol === "ESTUDIANTE" && rows.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border bg-card">
          <div className="rounded-full bg-muted p-4 mb-4"><Plus className="h-6 w-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">Sin calificaciones aún</p>
          <p className="text-xs text-muted-foreground">Cuando tus docentes publiquen notas aparecerán aquí.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={rows} keyExtractor={(item) => item.id} searchable loading={loading} />
      )}

      {isDocente && misEvaluaciones.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No tienes evaluaciones registradas en tus materias.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Subir Notas</DialogTitle>
            <DialogDescription>Selecciona una evaluación y registra las notas de tus estudiantes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Evaluación</Label>
              <Select value={selectedEvaluacion} onValueChange={(v) => {
                setSelectedEvaluacion(v);
                setValores({});
                setMessage(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una evaluación..." />
                </SelectTrigger>
                <SelectContent>
                  {misEvaluaciones.map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.titulo} · {e.oferta?.materia?.nombre ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEvaluacion && (
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border p-3">
                {estudiantesEnEvaluacion.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes inscritos en esta materia</p>
                ) : (
                  estudiantesEnEvaluacion.map((i: any) => {
                    const nombre = i.estudiante?.perfil ? `${i.estudiante.perfil.nombre} ${i.estudiante.perfil.apellido}` : "";
                    const existing = notas.find((n: any) => n.evaluacionId === selectedEvaluacion && n.estudianteId === i.estudianteId);
                    return (
                      <div key={i.id} className="flex items-center gap-3">
                        <span className="text-sm flex-1 min-w-0 truncate">{nombre}</span>
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          step="0.01"
                          placeholder={existing ? `Actual: ${Number(existing.valor)}` : "Nota"}
                          className="w-28 h-9 text-center"
                          value={valores[i.estudianteId] ?? ""}
                          onChange={(e) => setValores((prev) => ({ ...prev, [i.estudianteId]: e.target.value }))}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {message && (
            <div className={cn("flex items-center gap-2 rounded-lg p-3 text-sm", saving ? "" : "bg-success/5 text-success")}>
              {!saving && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {message}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!selectedEvaluacion || saving || estudiantesEnEvaluacion.length === 0}>
              {saving ? "Guardando..." : <><Save className="h-4 w-4 mr-2" />Guardar Notas</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
