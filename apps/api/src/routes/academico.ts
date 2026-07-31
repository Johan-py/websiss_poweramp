import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@websiss/database";
import { hashSync } from "bcryptjs";

// ─── Includes reutilizables ────────────────────────────
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
  // periodo: true,
} satisfies Prisma.OfertaAcademicaInclude;

const inscripcionInclude = {
  estudiante: { include: { perfil: true, carrera: true } },
  oferta: { include: { materia: true, docente: { include: { perfil: true } }, periodo: true } },
} satisfies Prisma.InscripcionInclude;

export async function academicoRoutes(app: FastifyInstance) {
  
  // ─── Funciones helper para obtener el perfil del usuario actual ───
  async function getEstudiante(req: FastifyRequest) {
    return app.prisma.estudiante.findUnique({
      where: {
        perfilId: req.userId!,
      },
      select: {
        id: true,
        carreraId: true,
      },
    });
  }
  async function getDocente(req: FastifyRequest) {
    return app.prisma.docente.findUnique({
      where: {
        perfilId: req.userId!,
      },
      select: {
        id: true,
      },
    });
  }

  // ─── Carreras ───────────────────────────────────────────
  app.get("/api/v1/carreras", async () => {
    return app.prisma.carrera.findMany({ orderBy: { nombre: "asc" } });
  });

  app.get<{
      Params:{
          id:string
      }
  }>(
  "/api/v1/carreras/:id",
  async (req)=>{
    const c = await app.prisma.carrera.findUnique({
      where: { id: req.params.id },
      include: {
        materias: { orderBy: [{ ciclo: "asc" }, { nombre: "asc" }] },
      },
    });
    if (!c) return { error: "No encontrada" };
    return c;
  });

  // ─── Periodos ───────────────────────────────────────────
  app.get("/api/v1/periodos", async () => {
    return app.prisma.periodo.findMany({ orderBy: { fechaInicio: "desc" } });
  });

  // ─── Estudiantes ────────────────────────────────────────
  app.get(
    "/api/v1/estudiantes",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }
      return app.prisma.estudiante.findMany({
        include: estudianteInclude,
        orderBy: { perfil: { apellido: "asc" } },
      });
    }
  );

  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/api/v1/estudiantes/:id",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { id } = req.params;
      const role = req.userRole;

      // Lógica de autorización a nivel de registro
      if (role === "ESTUDIANTE") {
        const estudianteActual = await getEstudiante(req);
        if (!estudianteActual || estudianteActual.id !== id) {
          return reply.status(403).send({ message: "Solo puedes consultar tu propio perfil." });
        }
      } else if (role === "DOCENTE") {
        return reply.status(403).send({ message: "No autorizado." });
      } else if (!["ADMIN", "COORDINADOR"].includes(role ?? "")) {
        return reply.status(403).send({ message: "No autorizado." });
      }

      const e = await app.prisma.estudiante.findUnique({
        where: { id },
        include: estudianteInclude,
      });
      if (!e) return reply.status(404).send({ error: "No encontrado" });
      return e;
    }
  );

  // ─── Docentes ───────────────────────────────────────────
  app.get(
    "/api/v1/docentes",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }
      return app.prisma.docente.findMany({
        include: docenteInclude,
        orderBy: { perfil: { apellido: "asc" } },
      });
    }
  );

  // ─── Registrar estudiante ──────────────────────────────
  app.post<{ Body: { nombre: string; apellido: string; cedula: string; email: string; telefono?: string; direccion?: string; password: string; codigoEstudiante: string; carreraId: string; fechaIngreso?: string } }>(
    "/api/v1/estudiantes",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }
      // ... (lógica existente sin cambios) ...
      const { nombre, apellido, cedula, email, telefono, direccion, password, codigoEstudiante, carreraId, fechaIngreso } = req.body;
      if (!nombre?.trim() || !apellido?.trim() || !cedula?.trim() || !email?.trim() || !password?.trim() || !codigoEstudiante?.trim() || !carreraId) {
        return reply.status(400).send({ message: "nombre, apellido, cedula, email, password, codigoEstudiante y carreraId son requeridos" });
      }
      if (password.length < 6) {
        return reply.status(400).send({ message: "La contraseña debe tener al menos 6 caracteres" });
      }
      try {
        const { estudiante } = await app.prisma.$transaction(async (tx) => {
          const perfil = await tx.perfil.create({
            data: {
              nombre: nombre.trim(), apellido: apellido.trim(), cedula: cedula.trim(),
              email: email.trim().toLowerCase(), telefono: telefono?.trim() || null,
              direccion: direccion?.trim() || null, password: hashSync(password, 10),
              rol: "ESTUDIANTE", activo: true,
            },
          });
          const estudiante = await tx.estudiante.create({
            data: {
              perfilId: perfil.id, carreraId, codigoEstudiante: codigoEstudiante.trim(),
              fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
            },
            include: estudianteInclude,
          });
          return { perfil, estudiante };
        });
        await app.prisma.auditoria.create({
          data: { perfilId: req.userId!, accion: "CREATE", entidad: "Estudiante", entidadId: estudiante.id, detalle: { codigoEstudiante, carreraId, email } },
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
      // ... (lógica existente sin cambios) ...
      const { nombre, apellido, cedula, email, telefono, direccion, password, codigoDocente, especialidad } = req.body;
      if (!nombre?.trim() || !apellido?.trim() || !cedula?.trim() || !email?.trim() || !password?.trim() || !codigoDocente?.trim()) {
        return reply.status(400).send({ message: "nombre, apellido, cedula, email, password y codigoDocente son requeridos" });
      }
      if (password.length < 6) {
        return reply.status(400).send({ message: "La contraseña debe tener al menos 6 caracteres" });
      }
      try {
        const { docente } = await app.prisma.$transaction(async (tx) => {
          const perfil = await tx.perfil.create({
            data: {
              nombre: nombre.trim(), apellido: apellido.trim(), cedula: cedula.trim(),
              email: email.trim().toLowerCase(), telefono: telefono?.trim() || null,
              direccion: direccion?.trim() || null, password: hashSync(password, 10),
              rol: "DOCENTE", activo: true,
            },
          });
          const docente = await tx.docente.create({
            data: { perfilId: perfil.id, codigoDocente: codigoDocente.trim(), especialidad: especialidad?.trim() || null },
            include: docenteInclude,
          });
          return { perfil, docente };
        });
        await app.prisma.auditoria.create({
          data: { perfilId: req.userId!, accion: "CREATE", entidad: "Docente", entidadId: docente.id, detalle: { codigoDocente, email } },
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
  app.get(
    "/api/v1/inscripciones",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const role = req.userRole;
      let where: Prisma.InscripcionWhereInput = {};

      if (role === "ADMIN" || role === "COORDINADOR") {
        // Sin filtro, ven todo
        where = {};
      } else if (role === "ESTUDIANTE") {
        const estudiante = await getEstudiante(req);
        if (!estudiante) return reply.status(404).send({ message: "Estudiante no encontrado." });
        where = { estudianteId: estudiante.id };
      } else if (role === "DOCENTE") {
        const docente = await getDocente(req);
        if (!docente) return reply.status(404).send({ message: "Docente no encontrado." });
        where = { oferta: { docenteId: docente.id } };
      } else {
        return reply.status(403).send({ message: "No autorizado." });
      }

      return app.prisma.inscripcion.findMany({
        where,
        include: inscripcionInclude,
        orderBy: { fechaInscripcion: "desc" },
      });
    }
  );

  // ─── Evaluaciones ───────────────────────────────────────
  app.get(
    "/api/v1/evaluaciones",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const role = req.userRole;
      let where: Prisma.EvaluacionWhereInput = {};

      if (role === "ADMIN" || role === "COORDINADOR") {
        where = {};
      } else if (role === "DOCENTE") {
        const docente = await getDocente(req);
        if (!docente) return reply.status(404).send({ message: "Docente no encontrado." });
        where = { oferta: { docenteId: docente.id } };
      } else if (role === "ESTUDIANTE") {
        const estudiante = await getEstudiante(req);
        if (!estudiante) return reply.status(404).send({ message: "Estudiante no encontrado." });
        where = { oferta: { inscripciones: { some: { estudianteId: estudiante.id } } } };
      } else {
        return reply.status(403).send({ message: "No autorizado." });
      }

      return app.prisma.evaluacion.findMany({
        where,
        include: { oferta: { include: { materia: true, periodo: true } } },
        orderBy: { fecha: "desc" },
      });
    }
  );

  // ─── Notas ──────────────────────────────────────────────
  app.get(
    "/api/v1/notas",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const role = req.userRole;
      let where: Prisma.NotaWhereInput = {};

      if (role === "ADMIN" || role === "COORDINADOR") {
        where = {};
      } else if (role === "DOCENTE") {
        const docente = await getDocente(req);
        if (!docente) return reply.status(404).send({ message: "Docente no encontrado." });
        where = { evaluacion: { oferta: { docenteId: docente.id } } };
      } else if (role === "ESTUDIANTE") {
        const estudiante = await getEstudiante(req);
        if (!estudiante) return reply.status(404).send({ message: "Estudiante no encontrado." });
        where = { estudianteId: estudiante.id };
      } else {
        return reply.status(403).send({ message: "No autorizado." });
      }

      return app.prisma.nota.findMany({
        where,
        include: {
          evaluacion: { include: { oferta: { include: { materia: true } } } },
          estudiante: { include: { perfil: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  );

  // ─── Pagos ──────────────────────────────────────────────
  app.get(
    "/api/v1/pagos",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const role = req.userRole;
      let where: Prisma.PagoWhereInput = {};

      if (role === "ADMIN" || role === "COORDINADOR") {
        where = {};
      } else if (role === "ESTUDIANTE") {
        const estudiante = await getEstudiante(req);
        if (!estudiante) return reply.status(404).send({ message: "Estudiante no encontrado." });
        where = { estudianteId: estudiante.id };
      } else if (role === "DOCENTE") {
        return reply.status(403).send({ message: "No autorizado." });
      } else {
        return reply.status(403).send({ message: "No autorizado." });
      }

      return app.prisma.pago.findMany({
        where,
        include: { estudiante: { include: { perfil: true } }, periodo: true },
        orderBy: { createdAt: "desc" },
      });
    }
  );

  // ─── Calendario ─────────────────────────────────────────
  app.get("/api/v1/calendario", async () => {
    return app.prisma.calendarioAcademico.findMany({
      include: { periodo: true },
      orderBy: { fechaInicio: "asc" },
    });
  });

  // ─── Recursos ───────────────────────────────────────────
  app.get(
    "/api/v1/recursos",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const role = req.userRole;
      let where: Prisma.RecursoMateriaWhereInput = {};

      if (role === "ADMIN" || role === "COORDINADOR") {
        where = {};
      } else if (role === "DOCENTE") {
        const docente = await getDocente(req);
        if (!docente) return reply.status(404).send({ message: "Docente no encontrado." });
        where = { oferta: { docenteId: docente.id } };
      } else if (role === "ESTUDIANTE") {
        const estudiante = await getEstudiante(req);
        if (!estudiante) return reply.status(404).send({ message: "Estudiante no encontrado." });
        where = { oferta: { inscripciones: { some: { estudianteId: estudiante.id } } } };
      } else {
        return reply.status(403).send({ message: "No autorizado." });
      }

      return app.prisma.recursoMateria.findMany({
        where,
        include: { oferta: { include: { materia: true } } },
        orderBy: { createdAt: "desc" },
      });
    }
  );

  // ─── Auditoría ──────────────────────────────────────────
  app.get<{
    Querystring: {
      perfilId?: string;
    };
  }>(
    "/api/v1/auditoria",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }
      return app.prisma.auditoria.findMany({
        where: req.query.perfilId ? { perfilId: req.query.perfilId } : undefined,
        include: { perfil: { select: { nombre: true, apellido: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }
  );

  // ─── Kardex ─────────────────────────────────────────────
  app.get<{
    Params: {
      estudianteId: string;
    };
  }>(
    "/api/v1/kardex/:estudianteId",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const role = req.userRole;
      // Solo ADMIN, COORDINADOR y ESTUDIANTE pueden acceder
      if (!["ADMIN", "COORDINADOR", "ESTUDIANTE"].includes(role ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }

      // Si es estudiante, solo puede consultar su propio kardex
      if (role === "ESTUDIANTE") {
        const miRegistro = await app.prisma.estudiante.findUnique({
          where: { perfilId: req.userId! },
          select: { id: true },
        });
        if (!miRegistro) {
          return reply.status(404).send({ message: "Estudiante no encontrado" });
        }
        if (miRegistro.id !== req.params.estudianteId) {
          return reply.status(403).send({ message: "No puedes consultar el kardex de otro estudiante" });
        }
      }

      // Obtener datos del estudiante del parámetro (incluyendo carrera)
      const estudiante = await app.prisma.estudiante.findUnique({
        where: { id: req.params.estudianteId },
        include: {
          perfil: {
            select: { nombre: true, apellido: true, cedula: true, email: true }
          },
          carrera: { // <-- CORRECCIÓN: Se añadió la inclusión de 'carrera'
            select: { nombre: true, duracionSemestres: true }
          }
        },
      });

      if (!estudiante) {
        return reply.status(404).send({ message: "Estudiante no encontrado" });
      }

      // ─── Lógica del kardex (sin cambios) ────────────────
      const inscripciones = await app.prisma.inscripcion.findMany({
        where: { estudianteId: estudiante.id },
        include: {
          oferta: {
            include: {
              materia: true,
              docente: { include: { perfil: true } },
              periodo: true,
            },
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


      // Créditos cursados
      const creditosCursados = inscripciones.reduce(
        (s, i) => s + i.oferta.materia.creditos,
        0
      );

      // Créditos aprobados según nota >= 14
      const creditosAprobados = todasMaterias
        .filter((m) => m.nota !== null && m.nota >= 14)
        .reduce((s, m) => s + m.creditos, 0);

      // Temporal: créditos requeridos de la carrera
      const creditosCarrera = 240;

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
        creditosCursados,
        creditosCarrera,
        avance: Math.min(100, Math.round((creditosAprobados / creditosCarrera) * 100)),
        promedioGlobal: Math.round(promedioGlobal * 100) / 100,
        promedioPonderadoGlobal: Math.round(promedioPonderadoGlobal * 100) / 100,
      };
    }
  );

  // ─── Dashboard ───────────────────────────────────────────
  app.get(
    "/api/v1/dashboard",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }

      // Consultas independientes
      const [
        totalEstudiantes,
        totalDocentes,
        ofertasAbiertas,
        periodoActivo,
        pagosPendientes,
        carreras,
      ] = await Promise.all([
        app.prisma.estudiante.count({
          where: { perfil: { activo: true } },
        }),

        app.prisma.docente.count({
          where: { perfil: { activo: true } },
        }),

        app.prisma.ofertaAcademica.count({
          where: {
            activo: true,
            cupoDisponible: { gt: 0 },
          },
        }),

        app.prisma.periodo.findFirst({
          where: { activo: true },
          select: { id: true },
        }),

        app.prisma.pago.count({
          where: { estado: "PENDIENTE" },
        }),

        app.prisma.carrera.findMany({
          where: { activo: true },
          select: {
            nombre: true,
            _count: {
              select: {
                estudiantes: true,
              },
            },
          },
        }),
      ]);

      let inscripcionesMes = 0;
      let ingresosPeriodo = 0;

      if (periodoActivo) {
        const [cantidadInscripciones, pagos] = await Promise.all([
          app.prisma.inscripcion.count({
            where: {
              oferta: {
                periodoId: periodoActivo.id,
              },
              createdAt: {
                gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          }),

          app.prisma.pago.aggregate({
            where: {
              periodoId: periodoActivo.id,
              estado: "CONFIRMADO",
            },
            _sum: {
              monto: true,
            },
          }),
        ]);

        inscripcionesMes = cantidadInscripciones;
        ingresosPeriodo = Number(pagos._sum.monto ?? 0);
      }

      // Créditos promedio por estudiante
      const inscripcionesCompletadas = await app.prisma.inscripcion.findMany({
        where: {
          estado: "COMPLETADA",
        },
        include: {
          oferta: {
            include: {
              materia: {
                select: {
                  creditos: true,
                },
              },
            },
          },
        },
      });

      const totalCreditos = inscripcionesCompletadas.reduce(
        (sum, ins) => sum + ins.oferta.materia.creditos,
        0
      );

      const creditosPromedio =
        totalEstudiantes > 0
          ? Number((totalCreditos / totalEstudiantes).toFixed(2))
          : 0;

      return {
        totalEstudiantes,
        totalDocentes,
        ofertasActivas: ofertasAbiertas,
        ingresosPeriodo,
        inscripcionesMes,
        pagosPendientes,
        creditosPromedio,
        estudiantesPorCarrera: carreras.map((c) => ({
          nombre: c.nombre,
          cantidad: c._count.estudiantes,
        })),
      };
    }
  );

  // ─── Crear inscripción ──────────────────────────────────
  app.post<{
    Body: {
      estudianteId: string;
      ofertaId: string;
    };
  }>(
    "/api/v1/inscripciones",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      const { estudianteId, ofertaId } = req.body;
      const role = req.userRole;

      // Solo ADMIN, COORDINADOR y ESTUDIANTE pueden crear inscripciones
      if (!role || !["ADMIN", "COORDINADOR", "ESTUDIANTE"].includes(role)) {
        return reply.status(403).send({ message: "No autorizado para realizar inscripciones." });
      }

      // Los estudiantes solo pueden inscribirse a sí mismos
      if (role === "ESTUDIANTE") {
        const miRegistro = await getEstudiante(req);
        if (!miRegistro || miRegistro.id !== estudianteId) {
          return reply.status(403).send({ message: "Solo puedes inscribirte a ti mismo." });
        }
      }

      // Lógica de negocio para la inscripción (sin cambios)
      const oferta = await app.prisma.ofertaAcademica.findUnique({ where: { id: ofertaId } });
      if (!oferta) return reply.status(404).send({ error: "Oferta no encontrada" });
      if (!oferta.activo) return reply.status(400).send({ error: "Oferta cerrada" });
      if (oferta.cupoDisponible <= 0) return reply.status(400).send({ error: "Sin cupos disponibles" });

      const existente = await app.prisma.inscripcion.findUnique({
        where: { estudianteId_ofertaId: { estudianteId, ofertaId } },
      });
      if (existente) return reply.status(409).send({ error: "Ya inscrito en esta materia" });

      try {
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
        return reply.status(201).send(inscripcion);
      } catch (error) {
        return reply.status(500).send({ message: "Error al crear la inscripción." });
      }
    }
  );

  // ─── Subir nota (docente / admin) ──────────────────────
  app.post<{ Body: { evaluacionId: string; estudianteId: string; valor: number; observacion?: string } }>(
    "/api/v1/notas",
    { preHandler: [app.authenticate] },
    async (req, reply) => {
      if (!["ADMIN", "COORDINADOR", "DOCENTE"].includes(req.userRole ?? "")) {
        return reply.status(403).send({ message: "No autorizado" });
      }
      // ... (lógica existente sin cambios) ...
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
        data: { perfilId: req.userId!, accion: "CREATE", entidad: "Nota", entidadId: nota.id, detalle: { evaluacionId, estudianteId, valor } },
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
      // ... (lógica existente sin cambios) ...
      const { ofertaId, titulo, descripcion, tipoRecurso = "ARCHIVO", urlRecurso, publicado = true } = req.body;
      if (!ofertaId || !titulo || !urlRecurso) {
        return reply.status(400).send({ message: "ofertaId, titulo y urlRecurso son requeridos" });
      }
      const recurso = await app.prisma.recursoMateria.create({
        data: { ofertaId, titulo, descripcion, tipoRecurso: tipoRecurso as any, urlRecurso, publicado },
        include: { oferta: { include: { materia: true } } },
      });
      await app.prisma.auditoria.create({
        data: { perfilId: req.userId!, accion: "CREATE", entidad: "RecursoMateria", entidadId: recurso.id, detalle: { ofertaId, titulo, publicado } },
      });
      return recurso;
    },
  );
}