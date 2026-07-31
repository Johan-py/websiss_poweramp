import { FastifyInstance, FastifyRequest } from "fastify";
import { Prisma } from "@websiss/database";
import { hashSync } from "bcryptjs";

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

  // ─── Registrar estudiante ──────────────────────────────
  app.post<{ Body: { nombre: string; apellido: string; cedula: string; email: string; telefono?: string; direccion?: string; password: string; codigoEstudiante: string; carreraId: string; fechaIngreso?: string } }>(
    "/api/v1/estudiantes",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }

      const { nombre, apellido, cedula, email, telefono, direccion, password, codigoEstudiante, carreraId, fechaIngreso } = req.body;

      if (!nombre?.trim() || !apellido?.trim() || !cedula?.trim() || !email?.trim() || !password?.trim() || !codigoEstudiante?.trim() || !carreraId) {
        return reply.status(400).send({ message: "nombre, apellido, cedula, email, password, codigoEstudiante y carreraId son requeridos" });
      }
      if (password.length < 6) {
        return reply.status(400).send({ message: "La contraseña debe tener al menos 6 caracteres" });
      }

      try {
        const { perfil, estudiante } = await app.prisma.$transaction(async (tx) => {
          const perfil = await tx.perfil.create({
            data: {
              nombre: nombre.trim(),
              apellido: apellido.trim(),
              cedula: cedula.trim(),
              email: email.trim().toLowerCase(),
              telefono: telefono?.trim() || null,
              direccion: direccion?.trim() || null,
              password: hashSync(password, 10),
              rol: "ESTUDIANTE",
              activo: true,
            },
          });

          const estudiante = await tx.estudiante.create({
            data: {
              perfilId: perfil.id,
              carreraId,
              codigoEstudiante: codigoEstudiante.trim(),
              fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
            },
            include: estudianteInclude,
          });

          return { perfil, estudiante };
        });

        await app.prisma.auditoria.create({
          data: {
            perfilId: req.userId!,
            accion: "CREATE",
            entidad: "Estudiante",
            entidadId: estudiante.id,
            detalle: { codigoEstudiante, carreraId, email },
          },
        });

        return reply.status(201).send(estudiante);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const campo = (error.meta?.target as string[] | undefined)?.join(", ");
          return reply.status(409).send({ message: `Ya existe un registro con ese ${campo ?? "valor"} (email, cédula o código)` });
        }
        return reply.status(500).send({ message: "No se pudo registrar el estudiante" });
      }
    },
  );

  // ─── Registrar docente ─────────────────────────────────
  app.post<{ Body: { nombre: string; apellido: string; cedula: string; email: string; telefono?: string; direccion?: string; password: string; codigoDocente: string; especialidad?: string } }>(
    "/api/v1/docentes",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }

      const { nombre, apellido, cedula, email, telefono, direccion, password, codigoDocente, especialidad } = req.body;

      if (!nombre?.trim() || !apellido?.trim() || !cedula?.trim() || !email?.trim() || !password?.trim() || !codigoDocente?.trim()) {
        return reply.status(400).send({ message: "nombre, apellido, cedula, email, password y codigoDocente son requeridos" });
      }
      if (password.length < 6) {
        return reply.status(400).send({ message: "La contraseña debe tener al menos 6 caracteres" });
      }

      try {
        const { perfil, docente } = await app.prisma.$transaction(async (tx) => {
          const perfil = await tx.perfil.create({
            data: {
              nombre: nombre.trim(),
              apellido: apellido.trim(),
              cedula: cedula.trim(),
              email: email.trim().toLowerCase(),
              telefono: telefono?.trim() || null,
              direccion: direccion?.trim() || null,
              password: hashSync(password, 10),
              rol: "DOCENTE",
              activo: true,
            },
          });

          const docente = await tx.docente.create({
            data: {
              perfilId: perfil.id,
              codigoDocente: codigoDocente.trim(),
              especialidad: especialidad?.trim() || null,
            },
            include: docenteInclude,
          });

          return { perfil, docente };
        });

        await app.prisma.auditoria.create({
          data: {
            perfilId: req.userId!,
            accion: "CREATE",
            entidad: "Docente",
            entidadId: docente.id,
            detalle: { codigoDocente, email },
          },
        });

        return reply.status(201).send(docente);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const campo = (error.meta?.target as string[] | undefined)?.join(", ");
          return reply.status(409).send({ message: `Ya existe un registro con ese ${campo ?? "valor"} (email, cédula o código)` });
        }
        return reply.status(500).send({ message: "No se pudo registrar el docente" });
      }
    },
  );

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
  app.get("/api/v1/auditoria", async (req: FastifyRequest<{ Querystring: { perfilId?: string } }>) => {
    return app.prisma.auditoria.findMany({
      where: req.query.perfilId ? { perfilId: req.query.perfilId } : undefined,
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

    const evaluaciones = await app.prisma.evaluacion.findMany({
      where: { ofertaId: { in: inscripciones.map((i) => i.ofertaId) } },
      include: {
        notas: { where: { estudianteId: req.params.estudianteId } },
      },
    });

    const notaPorOferta = new Map<string, number | null>();
    for (const eva of evaluaciones) {
      const nota = eva.notas[0];
      if (!nota || Number(eva.peso) === 0) continue;
      const peso = Number(eva.peso);
      const puntajeMaximo = Number(eva.puntajeMaximo) || 20;
      const valorEscalado = (Number(nota.valor) / puntajeMaximo) * 20;
      const actual = notaPorOferta.get(eva.ofertaId);
      notaPorOferta.set(eva.ofertaId, (actual ?? 0) + valorEscalado * peso);
    }

    const periodosMap = new Map<string, typeof inscripciones>();
    for (const ins of inscripciones) {
      const periodo = ins.oferta.periodo.codigo;
      if (!periodosMap.has(periodo)) periodosMap.set(periodo, []);
      periodosMap.get(periodo)!.push(ins);
    }

    const todasMaterias: { nota: number | null; creditos: number; estado: string }[] = [];

    const periodos = Array.from(periodosMap.entries()).map(([codigo, inscs]) => {
      const materias = inscs.map((i) => {
        const sumPonderada = notaPorOferta.get(i.ofertaId) ?? null;
        const notasEva = evaluaciones.filter((e) => e.ofertaId === i.ofertaId && e.notas[0]);
        const pesoTotal = notasEva.reduce((s, e) => s + Number(e.peso), 0);
        const nota = sumPonderada != null && pesoTotal > 0 ? sumPonderada / pesoTotal : null;
        return {
          materiaId: i.oferta.materia.id,
          materia: i.oferta.materia.nombre,
          codigo: i.oferta.materia.codigo,
          docente: `${i.oferta.docente.perfil.nombre} ${i.oferta.docente.perfil.apellido}`,
          creditos: i.oferta.materia.creditos,
          nota: nota != null ? Math.round(nota * 100) / 100 : null,
          estado: i.estado,
        };
      });

      todasMaterias.push(...materias);

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

    const notasConValor = todasMaterias.filter((m) => m.nota != null) as { nota: number; creditos: number }[];
    const promedioGlobal = notasConValor.length > 0
      ? notasConValor.reduce((s, m) => s + m.nota, 0) / notasConValor.length
      : 0;
    const creditosConNota = notasConValor.reduce((s, m) => s + m.creditos, 0);
    const promedioPonderadoGlobal = creditosConNota > 0
      ? notasConValor.reduce((s, m) => s + m.nota * m.creditos, 0) / creditosConNota
      : 0;

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
      promedioGlobal: Math.round(promedioGlobal * 100) / 100,
      promedioPonderadoGlobal: Math.round(promedioPonderadoGlobal * 100) / 100,
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

  // ─── Subir nota (docente / admin) ──────────────────────
  app.post<{ Body: { evaluacionId: string; estudianteId: string; valor: number; observacion?: string } }>(
    "/api/v1/notas",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR", "DOCENTE"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }

      const { evaluacionId, estudianteId, valor, observacion } = req.body;
      if (!evaluacionId || !estudianteId || valor == null) {
        return reply.status(400).send({ message: "evaluacionId, estudianteId y valor son requeridos" });
      }

      const nota = await app.prisma.nota.upsert({
        where: { evaluacionId_estudianteId: { evaluacionId, estudianteId } },
        update: { valor, observacion },
        create: { evaluacionId, estudianteId, valor, observacion },
        include: { evaluacion: { include: { oferta: { include: { materia: true } } } }, estudiante: { include: { perfil: true } } },
      });

      await app.prisma.auditoria.create({
        data: {
          perfilId: req.userId!,
          accion: "CREATE",
          entidad: "Nota",
          entidadId: nota.id,
          detalle: { evaluacionId, estudianteId, valor },
        },
      });

      return nota;
    },
  );

  // ─── Publicar recurso académico (docente / admin) ──────
  app.post<{ Body: { ofertaId: string; titulo: string; descripcion?: string; tipoRecurso?: string; urlRecurso: string; publicado?: boolean } }>(
    "/api/v1/recursos",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR", "DOCENTE"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }

      const { ofertaId, titulo, descripcion, tipoRecurso = "ARCHIVO", urlRecurso, publicado = true } = req.body;
      if (!ofertaId || !titulo || !urlRecurso) {
        return reply.status(400).send({ message: "ofertaId, titulo y urlRecurso son requeridos" });
      }

      const recurso = await app.prisma.recursoMateria.create({
        data: { ofertaId, titulo, descripcion, tipoRecurso: tipoRecurso as any, urlRecurso, publicado },
        include: { oferta: { include: { materia: true } } },
      });

      await app.prisma.auditoria.create({
        data: {
          perfilId: req.userId!,
          accion: "CREATE",
          entidad: "RecursoMateria",
          entidadId: recurso.id,
          detalle: { ofertaId, titulo, publicado },
        },
      });

      return recurso;
    },
  );
}
