import { useEffect, useMemo, useState } from "react";
import { Library, FileText, Video, Download, Plus, Save, CheckCircle2, Globe, Link as LinkIcon } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

export function RecursosPage() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const estudianteId = perfil?.estudiante?.id;

  const [recursos, setRecursos] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ofertaId: "", titulo: "", descripcion: "", tipoRecurso: "ARCHIVO", urlRecurso: "", publicado: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const misOfertaIds = useMemo(() => {
    if (rol === "DOCENTE") return ofertas.filter((o: any) => o.docenteId === perfil?.docente?.id).map((o: any) => o.id);
    if (rol === "ESTUDIANTE") return inscripciones.filter((i: any) => i.estudianteId === estudianteId).map((i: any) => i.ofertaId);
    return null;
  }, [rol, ofertas, inscripciones, perfil?.docente?.id, estudianteId]);

  useEffect(() => {
    Promise.all([api.recursos.list().catch(() => []), api.ofertas.list().catch(() => []), api.inscripciones.list().catch(() => [])])
      .then(([rec, of, ins]) => {
        setRecursos(rec);
        setOfertas(of);
        setInscripciones(ins);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!misOfertaIds) return recursos;
    return recursos.filter((r: any) => misOfertaIds.includes(r.ofertaId));
  }, [recursos, misOfertaIds]);

  const misOfertasDocente = useMemo(
    () => ofertas.filter((o: any) => o.docenteId === perfil?.docente?.id),
    [ofertas, perfil?.docente?.id],
  );

  const getIcon = (tipo: string) => {
    if (tipo === "VIDEO") return Video;
    if (tipo === "ENLACE") return Globe;
    return FileText;
  };

  const isDocente = rol === "DOCENTE";

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.recursos.create({
        ofertaId: form.ofertaId,
        titulo: form.titulo,
        descripcion: form.descripcion || undefined,
        tipoRecurso: form.tipoRecurso,
        urlRecurso: form.urlRecurso,
        publicado: form.publicado,
      });
      setMessage("Recurso publicado correctamente");
      setOpen(false);
      const rec = await api.recursos.list().catch(() => []);
      setRecursos(rec);
    } catch (e: any) {
      setMessage(e.message ?? "Error al publicar el recurso");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recursos Académicos"
        description={rol === "ESTUDIANTE" ? "Material de estudio de tus materias" : "Material de estudio y recursos didácticos"}
      >
        {isDocente && (
          <Button size="sm" onClick={() => { setOpen(true); setMessage(null); }}>
            <Plus className="h-4 w-4 mr-1.5" /> Publicar Recurso
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border bg-card">
          <div className="rounded-full bg-muted p-4 mb-4"><Library className="h-6 w-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">No hay recursos disponibles</p>
          <p className="text-xs text-muted-foreground">
            {rol === "ESTUDIANTE" ? "Tus docentes publicarán material de estudio aquí." : "Publica recursos académicos para tus estudiantes."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r: any) => {
            const Icon = getIcon(r.tipoRecurso);
            return (
              <div key={r.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-sm">
                <div className="rounded-lg bg-muted p-2.5"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.titulo}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{r.oferta?.materia?.nombre ?? ""}</span>
                    <Badge variant="secondary" className="text-[9px]">{r.tipoRecurso}</Badge>
                    {!r.publicado && <Badge variant="warning" className="text-[9px]">Borrador</Badge>}
                  </div>
                </div>
                <a href={r.urlRecurso} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="icon-sm"><Download className="h-4 w-4" /></Button>
                </a>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar Recurso Académico</DialogTitle>
            <DialogDescription>Comparte material de estudio con tus estudiantes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Materia</Label>
              <Select value={form.ofertaId} onValueChange={(v) => setForm((f) => ({ ...f, ofertaId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una materia..." />
                </SelectTrigger>
                <SelectContent>
                  {misOfertasDocente.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.materia?.nombre ?? ""} · {o.materia?.codigo ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Guía de estudio - Unidad 1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción opcional del material" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tipo de recurso</Label>
                <Select value={form.tipoRecurso} onValueChange={(v) => setForm((f) => ({ ...f, tipoRecurso: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARCHIVO">Archivo</SelectItem>
                    <SelectItem value="DOCUMENTO">Documento</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="ENLACE">Enlace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url">URL / Enlace</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input id="url" className="pl-9" value={form.urlRecurso} onChange={(e) => setForm((f) => ({ ...f, urlRecurso: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Publicar ahora</Label>
                <p className="text-xs text-muted-foreground">Si lo desactivas quedará como borrador.</p>
              </div>
              <Switch checked={form.publicado} onCheckedChange={(v) => setForm((f) => ({ ...f, publicado: v }))} />
            </div>
          </div>

          {message && (
            <div className="flex items-center gap-2 rounded-lg bg-success/5 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.ofertaId || !form.titulo || !form.urlRecurso || saving}>
              {saving ? "Publicando..." : <><Save className="h-4 w-4 mr-2" />Publicar Recurso</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
