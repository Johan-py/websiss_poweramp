import { useEffect, useMemo, useState } from "react";
import { Search, Award, TrendingUp, GraduationCap, BookOpen, ChevronDown, ChevronRight, UserCircle, FileText, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

interface KardexData {
  estudiante: {
    id: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    email: string;
    carrera: string;
  };
  periodos: {
    periodo: string;
    materias: {
      materiaId: string;
      materia: string;
      codigo: string;
      docente: string;
      creditos: number;
      nota: number | null;
      estado: string;
    }[];
    totalCreditos: number;
    promedio: number;
  }[];
  creditosAprobados: number;
  creditosCursados: number;
  creditosCarrera: number;
  avance: number;
  promedioGlobal: number;
  promedioPonderadoGlobal: number;
}

interface SummaryStats {
  aprobadas: number;
  reprobadas: number;
  enCurso: number;
  canceladas: number;
  totalMaterias: number;
}

const estadoLabel = (estado: string) => {
  if (estado === "COMPLETADA") return "Aprobada";
  if (estado === "ACTIVA") return "En curso";
  if (estado === "CANCELADA") return "Cancelada";
  if (estado === "RETIRADA") return "Retirada";
  return estado;
};

const estadoResumen = (m: { nota: number | null; estado: string }): keyof SummaryStats => {
  if (m.nota != null) return m.nota >= 14 ? "aprobadas" : "reprobadas";
  if (m.estado === "ACTIVA") return "enCurso";
  return "canceladas";
};

function computeSummary(kardex: KardexData): SummaryStats {
  const stats: SummaryStats = { aprobadas: 0, reprobadas: 0, enCurso: 0, canceladas: 0, totalMaterias: 0 };
  for (const p of kardex.periodos) {
    for (const m of p.materias) {
      stats.totalMaterias++;
      stats[estadoResumen(m)]++;
    }
  }
  return stats;
}

export function Kardex() {
  const { perfil } = useAuth();
  const rol = perfil?.rol;
  const isStudent = rol === "ESTUDIANTE";
  const [search, setSearch] = useState("");
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [kardex, setKardex] = useState<KardexData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isStudent) {
      if (perfil?.estudiante?.id) setSelectedEst(perfil.estudiante.id);
      return;
    }
    api.estudiantes.list().then((data) => {
      setEstudiantes(data);
      if (data.length > 0 && !selectedEst) {
        setSelectedEst(data[0].id);
      }
    });
  }, [isStudent, perfil?.estudiante?.id]);

  useEffect(() => {
    if (!selectedEst) return;
    setLoading(true);
    api.kardex.get(selectedEst).then((data) => {
      setKardex(data);
      setExpanded(new Set(data.periodos.map((p: any) => p.periodo)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedEst]);

  const toggle = (p: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const summary = useMemo(() => (kardex ? computeSummary(kardex) : null), [kardex]);

  const notaColor = (n: number | null) => {
    if (n == null) return "text-muted-foreground";
    return n >= 14 ? "text-success" : "text-destructive";
  };

  const estadoBadge = (estado: string) => {
    if (estado === "COMPLETADA") return <Badge variant="success">Aprobada</Badge>;
    if (estado === "ACTIVA") return <Badge variant="default">En curso</Badge>;
    if (estado === "CANCELADA") return <Badge variant="destructive">Cancelada</Badge>;
    return <Badge variant="secondary">{estado}</Badge>;
  };

  const generarPdf = () => {
    if (!kardex || !summary) return;
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 18;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Kardex Académico", margin, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${kardex.estudiante.nombres} ${kardex.estudiante.apellidos}`, margin, y);
      y += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Cédula: ${kardex.estudiante.cedula}`, margin, y);
      doc.text(`Email: ${kardex.estudiante.email}`, margin + 80, y);
      y += 5;
      doc.text(`Carrera: ${kardex.estudiante.carrera}`, margin, y);
      y += 8;

      doc.setFillColor(59, 130, 246);
      doc.rect(margin, y - 4.5, pageWidth - margin * 2, 13, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const labelY = y + 1.5;
      doc.text(`Promedio Global`, margin + 3, labelY);
      doc.text(`Promedio Ponderado`, margin + 43, labelY);
      doc.text(`Créditos Aprobados`, margin + 90, labelY);
      doc.text(`Avance`, margin + 138, labelY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`${kardex.promedioGlobal}`, margin + 3, labelY + 5);
      doc.text(`${kardex.promedioPonderadoGlobal}`, margin + 43, labelY + 5);
      doc.text(
        `${kardex.creditosAprobados} de ${kardex.creditosCarrera}`,
        margin + 90,
        labelY + 5
      );

      doc.text(`${kardex.avance}%`, margin + 138, labelY + 5);
      doc.setTextColor(0, 0, 0);
      y += 14;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        `Materias: ${summary.aprobadas} aprobadas · ${summary.reprobadas} reprobadas · ${summary.enCurso} en curso · ${summary.canceladas} canceladas / retiradas`,
        margin,
        y,
      );
      y += 6;

      for (const periodo of kardex.periodos) {
        if (y > 250) {
          doc.addPage();
          y = 16;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Periodo ${periodo.periodo}`, margin, y);
        y += 2.5;
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [["Materia", "Código", "Docente", "Créd.", "Nota", "Estado"]],
          body: periodo.materias.map((m) => [
            m.materia,
            m.codigo,
            m.docente,
            String(m.creditos),
            m.nota != null ? m.nota.toFixed(2) : "-",
            estadoLabel(m.estado),
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 247, 250] },
        });
        y = (doc as any).lastAutoTable?.finalY ?? y;
        y += 8;
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Generado el ${new Date().toLocaleDateString("es-ES")}`, margin, 290);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, 290, { align: "right" });
      }

      doc.save(`Kardex-${kardex.estudiante.apellidos}-${kardex.estudiante.nombres}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Kardex Académico"
        description={isStudent ? "Tu historial académico completo" : "Historial académico completo del estudiante"}
      >
        {kardex && (
          <>
            <Button size="sm" variant="outline" onClick={() => setSummaryOpen(true)}>
              <FileText className="h-4 w-4 mr-1.5" /> Resumen
            </Button>
            <Button size="sm" onClick={generarPdf} disabled={downloading}>
              <Download className="h-4 w-4 mr-1.5" /> {downloading ? "Generando..." : "Descargar Kardex PDF"}
            </Button>
          </>
        )}
      </PageHeader>

      {isStudent ? (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 max-w-md">
          <div className="rounded-lg bg-primary/10 p-2"><UserCircle className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-sm font-medium">{perfil?.nombre} {perfil?.apellido}</p>
            <p className="text-xs text-muted-foreground">Mi kardex académico</p>
          </div>
        </div>
      ) : (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={selectedEst}
            onChange={(e) => setSelectedEst(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm appearance-none cursor-pointer transition-all hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {estudiantes.map((est: any) => (
              <option key={est.id} value={est.id}>
                {est.perfil?.nombre} {est.perfil?.apellido} - {est.perfil?.cedula}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />)}</div>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/60" />)}
        </div>
      ) : kardex && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-primary/10 p-2"><Award className="h-4 w-4 text-primary" /></div>
                <span className="text-xs font-medium text-muted-foreground">Promedio Global</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.promedioGlobal}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-warning/10 p-2"><TrendingUp className="h-4 w-4 text-warning" /></div>
                <span className="text-xs font-medium text-muted-foreground">Promedio Ponderado</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.promedioPonderadoGlobal}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-success/10 p-2"><Award className="h-4 w-4 text-success" /></div>
                <span className="text-xs font-medium text-muted-foreground">Créditos Aprobados</span>
              </div>
                <p className="text-2xl font-semibold">
                  {kardex.creditosAprobados}
                  <span className="text-sm text-muted-foreground">
                    {" "} / {kardex.creditosCarrera}
                  </span>
                </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Créditos Cursados
              </span>
            </div>

            <p className="text-2xl font-semibold">
              {kardex.creditosCursados}
              <span className="text-sm text-muted-foreground">
                {" "} créditos
              </span>
            </p>
          </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-muted p-2"><GraduationCap className="h-4 w-4 text-muted-foreground" /></div>
                <span className="text-xs font-medium text-muted-foreground">Avance</span>
              </div>
              <p className="text-2xl font-semibold">{kardex.avance}%</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${kardex.avance}%` }} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {kardex.periodos.map((periodo) => {
              const isExpanded = expanded.has(periodo.periodo);
              return (
                <div key={periodo.periodo} className="rounded-xl border bg-card overflow-hidden">
                  <button onClick={() => toggle(periodo.periodo)} className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <span className="text-sm font-semibold">Periodo {periodo.periodo}</span>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{periodo.materias.length} materias</span>
                          <span className="text-xs text-muted-foreground">Promedio: {periodo.promedio}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/20">
                            <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">Código</th>
                            <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">Materia</th>
                            <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Docente</th>
                            <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Créditos</th>
                            <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Nota</th>
                            <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periodo.materias.map((mat, idx) => (
                            <tr key={idx} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
                              <td className="h-11 px-4 text-xs text-muted-foreground">{mat.codigo}</td>
                              <td className="h-11 px-4 text-sm font-medium">{mat.materia}</td>
                              <td className="h-11 px-4 text-sm text-muted-foreground hidden md:table-cell">{mat.docente}</td>
                              <td className="h-11 px-4 text-sm text-center">{mat.creditos}</td>
                              <td className={cn("h-11 px-4 text-center", notaColor(mat.nota))}>{mat.nota != null ? mat.nota.toFixed(2) : "—"}</td>
                              <td className="h-11 px-4 text-center">{estadoBadge(mat.estado)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-muted p-4 mb-4"><BookOpen className="h-6 w-6 text-muted-foreground" /></div>
          <p className="text-sm font-medium">Selecciona un estudiante</p>
          <p className="text-xs text-muted-foreground">Elige un estudiante para ver su historial académico</p>
        </div>
      )}

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>Resumen del Kardex</DialogTitle>
            <DialogDescription>
              {kardex?.estudiante.nombres} {kardex?.estudiante.apellidos} · {kardex?.estudiante.carrera}
            </DialogDescription>
          </DialogHeader>

          {kardex && summary && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-3">
                  <span className="text-xs text-muted-foreground">Promedio Global</span>
                  <p className="text-xl font-semibold">{kardex.promedioGlobal}</p>
                </div>
                <div className="rounded-xl border bg-card p-3">
                  <span className="text-xs text-muted-foreground">Promedio Ponderado</span>
                  <p className="text-xl font-semibold">{kardex.promedioPonderadoGlobal}</p>
                </div>
                <div className="rounded-xl border bg-card p-3">
                  <span className="text-xs text-muted-foreground">Créditos Aprobados</span>
                  <p className="text-xl font-semibold">{kardex.creditosAprobados}
                    <span className="text-sm text-muted-foreground">
                      {" "} / {kardex.creditosCarrera}
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-3">
                  <span className="text-xs text-muted-foreground">Avance</span>
                  <p className="text-xl font-semibold">{kardex.avance}%</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">{summary.aprobadas} aprobadas</Badge>
                <Badge variant="destructive">{summary.reprobadas} reprobadas</Badge>
                <Badge variant="default">{summary.enCurso} en curso</Badge>
                <Badge variant="secondary">{summary.canceladas} canceladas / retiradas</Badge>
                <Badge variant="outline">{summary.totalMaterias} materias en total</Badge>
              </div>

              <div className="overflow-hidden rounded-xl border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">Periodo</th>
                      <th className="h-9 px-4 text-left text-xs font-medium text-muted-foreground">Materia</th>
                      <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Créditos</th>
                      <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Nota</th>
                      <th className="h-9 px-4 text-center text-xs font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kardex.periodos.map((periodo) => (
                      periodo.materias.map((mat, idx) => (
                        <tr key={`${periodo.periodo}-${idx}`} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="h-10 px-4 text-xs text-muted-foreground">{periodo.periodo}</td>
                          <td className="h-10 px-4 text-sm font-medium">{mat.materia}</td>
                          <td className="h-10 px-4 text-sm text-center">{mat.creditos}</td>
                          <td className={cn("h-10 px-4 text-center", notaColor(mat.nota))}>{mat.nota != null ? mat.nota.toFixed(2) : "—"}</td>
                          <td className="h-10 px-4 text-center">{estadoBadge(mat.estado)}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
