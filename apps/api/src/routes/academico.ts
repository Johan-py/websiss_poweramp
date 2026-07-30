import { FastifyInstance, FastifyRequest } from "fastify";
import { Prisma } from "@websiss/database";

const estudianteInclude = {
  perfil: { select: { id: true, nombre: true, apellido: true, email: true, cedula: true, telefono: true, activo: true } },
  carrera: true,
} satisfies Prisma.EstudianteInclude;

const docenteInclude = {
  perfil: { select: { id: true, nombre: true, apellido: true, email: true, cedula: true, telefono: true, activo: true } },
} satisfies Prisma.DocenteInclude;

const ofertaInclude = {
  materia: { include: { carrera: true } },
  docente: { include: { perfil: true } },
  aula: true,
  periodo: true,
} satisfies Prisma.OfertaAcademicaInclude;

const inscripcionInclude = {
  estudiante: { include: { perfil: true, carrera: true } },
  oferta: { include: { materia: true, docente: { include: { perfil: true } }, periodo: true } },
} satisfies Prisma.InscripcionInclude;

export async function academicoRoutes(app: FastifyInstance) {
  // ─── Carreras ───────────────────────────────────────────
  app.get("/api/v1/carreras", async () => {
    return app.prisma.carrera.findMany({ orderBy: { nombre: "asc" } });
  });

  app.get("/api/v1/carreras/:id", async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const c = await app.prisma.carrera.findUnique({ where: { id: req.params.id } });
    if (!c) return { error: "No encontrada" };
    return c;
  });

  // ─── Periodos ───────────────────────────────────────────
  app.get("/api/v1/periodos", async () => {
    return app.prisma.periodo.findMany({ orderBy: { fechaInicio: "desc" } });
  });

  // ─── Estudiantes ────────────────────────────────────────
  app.get("/api/v1/estudiantes", async () => {
    return app.prisma.estudiante.findMany({
      include: estudianteInclude,
      orderBy: { perfil: { apellido: "asc" } },
    });
  });

  app.get("/api/v1/estudiantes/:id", async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const e = await app.prisma.estudiante.findUnique({
      where: { id: req.params.id },
      include: estudianteInclude,
    });
    if (!e) return { error: "No encontrado" };
    return e;
  });

  // ─── Docentes ───────────────────────────────────────────
  app.get("/api/v1/docentes", async () => {
    return app.prisma.docente.findMany({
      include: docenteInclude,
      orderBy: { perfil: { apellido: "asc" } },
    });
  });

  // ─── Materias ───────────────────────────────────────────
  app.get("/api/v1/materias", async () => {
    return app.prisma.materia.findMany({
      include: { carrera: true },
      orderBy: { nombre: "asc" },
    });
  });

  // ─── Ofertas Académicas ────────────────────────────────
  app.get("/api/v1/ofertas", async () => {
    return app.prisma.ofertaAcademica.findMany({
      include: ofertaInclude,
      orderBy: { createdAt: "desc" },
    });
  });

  // ─── Inscripciones ──────────────────────────────────────
  app.get("/api/v1/inscripciones", async () => {
    return app.prisma.inscripcion.findMany({
      include: inscripcionInclude,
      orderBy: { fechaInscripcion: "desc" },
    });
  });

  // ─── Evaluaciones ───────────────────────────────────────
  app.get("/api/v1/evaluaciones", async () => {
    return app.prisma.evaluacion.findMany({
      include: { oferta: { include: { materia: true, periodo: true } } },
      orderBy: { fecha: "desc" },
    });
  });

  // ─── Notas ──────────────────────────────────────────────
  app.get("/api/v1/notas", async () => {
    return app.prisma.nota.findMany({
      include: {
        evaluacion: { include: { oferta: { include: { materia: true } } } },
        estudiante: { include: { perfil: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  // ─── Pagos ──────────────────────────────────────────────
  app.get("/api/v1/pagos", async () => {
    return app.prisma.pago.findMany({
      include: { estudiante: { include: { perfil: true } }, periodo: true },
      orderBy: { createdAt: "desc" },
    });
  });

  // ─── Calendario ─────────────────────────────────────────
  app.get("/api/v1/calendario", async () => {
    return app.prisma.calendarioAcademico.findMany({
      include: { periodo: true },
      orderBy: { fechaInicio: "asc" },
    });
  });

  // ─── Recursos ───────────────────────────────────────────
  app.get("/api/v1/recursos", async () => {
    return app.prisma.recursoMateria.findMany({
      include: { oferta: { include: { materia: true } } },
      orderBy: { createdAt: "desc" },
    });
  });

  // ─── Auditoría ──────────────────────────────────────────
  app.get("/api/v1/auditoria", async () => {
    return app.prisma.auditoria.findMany({
      include: { perfil: { select: { nombre: true, apellido: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  });

  // ─── Kardex ─────────────────────────────────────────────
  app.get("/api/v1/kardex/:estudianteId", async (req: FastifyRequest<{ Params: { estudianteId: string } }>) => {
    const estudiante = await app.prisma.estudiante.findUnique({
      where: { id: req.params.estudianteId },
      include: { perfil: true, carrera: true },
    });
    if (!estudiante) return { error: "Estudiante no encontrado" };

    const inscripciones = await app.prisma.inscripcion.findMany({
      where: { estudianteId: req.params.estudianteId },
      include: {
        oferta: {
          include: { materia: true, docente: { include: { perfil: true } }, periodo: true },
        },
      },
      orderBy: { oferta: { periodo: { fechaInicio: "desc" } } },
    });

    const periodosMap = new Map<string, typeof inscripciones>();
    for (const ins of inscripciones) {
      const periodo = ins.oferta.periodo.codigo;
      if (!periodosMap.has(periodo)) periodosMap.set(periodo, []);
      periodosMap.get(periodo)!.push(ins);
    }

    const periodos = Array.from(periodosMap.entries()).map(([codigo, inscs]) => {
      const periodoData = inscs[0].oferta.periodo;
      const materias = inscs.map((i) => ({
        materiaId: i.oferta.materia.id,
        materia: i.oferta.materia.nombre,
        codigo: i.oferta.materia.codigo,
        docente: `${i.oferta.docente.perfil.nombre} ${i.oferta.docente.perfil.apellido}`,
        creditos: i.oferta.materia.creditos,
        nota: null as number | null,
        estado: i.estado,
      }));

      const totalCreditos = materias.reduce((s, m) => s + m.creditos, 0);
      const promedios = materias.filter((m) => m.nota != null);
      const promedio = promedios.length > 0
        ? promedios.reduce((s, m) => s + m.nota!, 0) / promedios.length
        : 0;

      return { periodo: codigo, materias, totalCreditos, promedio: Math.round(promedio * 100) / 100 };
    });

    const todasNotas = inscripciones.filter((i) => i.estado === "COMPLETADA");
    const creditosAprobados = todasNotas.reduce((s, i) => s + i.oferta.materia.creditos, 0);
    const creditosTotales = inscripciones.reduce((s, i) => s + i.oferta.materia.creditos, 0);
    const creditosCarrera =(estudiante.carrera?.duracionSemestres ?? 4) * 60;
    
    return {
      estudiante: {
        id: estudiante.id,
        nombres: estudiante.perfil.nombre,
        apellidos: estudiante.perfil.apellido,
        cedula: estudiante.perfil.cedula,
        email: estudiante.perfil.email,
        carrera: estudiante.carrera?.nombre ?? "",
      },
      periodos,
      creditosAprobados,
      creditosTotales,
      avance: Math.min(100, Math.round((creditosAprobados / creditosCarrera) * 100)),
      promedioGlobal: 0,
      promedioPonderadoGlobal: 0,
    };
  });

  // ─── Dashboard ───────────────────────────────────────────
  app.get("/api/v1/dashboard", async () => {
    const [totalEstudiantes, totalDocentes, ofertasAbiertas, periodosActivos] = await Promise.all([
      app.prisma.estudiante.count({ where: { perfil: { activo: true } } }),
      app.prisma.docente.count({ where: { perfil: { activo: true } } }),
      app.prisma.ofertaAcademica.count({ where: { activo: true, cupoDisponible: { gt: 0 } } }),
      app.prisma.periodo.findFirst({ where: { activo: true } }),
    ]);

    const inscripcionesMes = periodosActivos
      ? await app.prisma.inscripcion.count({
          where: {
            oferta: { periodoId: periodosActivos.id },
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        })
      : 0;

    const pagosPendientes = await app.prisma.pago.count({ where: { estado: "PENDIENTE" } });

    const carreras = await app.prisma.carrera.findMany({
      select: { id: true, nombre: true, codigo: true, _count: { select: { estudiantes: true } } },
      where: { activo: true },
    });

    return {
      totalEstudiantes,
      totalDocentes,
      ofertasActivas: ofertasAbiertas,
      ingresosPeriodo: 0,
      inscripcionesMes,
      pagosPendientes,
      creditosPromedio: 18.5,
      estudiantesPorCarrera: carreras.map((c) => ({ nombre: c.nombre, cantidad: c._count.estudiantes })),
    };
  });

  // ─── Crear inscripción ──────────────────────────────────
  app.post("/api/v1/inscripciones", async (req: FastifyRequest<{ Body: { estudianteId: string; ofertaId: string } }>) => {
    const { estudianteId, ofertaId } = req.body;

    const oferta = await app.prisma.ofertaAcademica.findUnique({ where: { id: ofertaId } });
    if (!oferta) return { error: "Oferta no encontrada" };
    if (!oferta.activo) return { error: "Oferta cerrada" };
    if (oferta.cupoDisponible <= 0) return { error: "Sin cupos disponibles" };

    const existente = await app.prisma.inscripcion.findUnique({
      where: { estudianteId_ofertaId: { estudianteId, ofertaId } },
    });
    if (existente) return { error: "Ya inscrito en esta materia" };

    const [inscripcion] = await app.prisma.$transaction([
      app.prisma.inscripcion.create({
        data: { estudianteId, ofertaId },
        include: inscripcionInclude,
      }),
      app.prisma.ofertaAcademica.update({
        where: { id: ofertaId },
        data: { cupoDisponible: { decrement: 1 } },
      }),
    ]);

    return inscripcion;
  });
}
