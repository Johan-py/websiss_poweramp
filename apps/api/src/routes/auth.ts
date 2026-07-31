import { FastifyInstance } from "fastify";
import { compare } from "bcryptjs";
import { signToken } from "../plugins/auth.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return reply.status(400).send({ message: "Email y contraseña son requeridos" });
    }

    const perfil = await app.prisma.perfil.findUnique({
      where: { email },
      include: {
        estudiante: { include: { carrera: true } },
        docente: true,
      },
    });

    if (!perfil || !perfil.activo) {
      return reply.status(401).send({ message: "Credenciales inválidas" });
    }

    const valid = await compare(password, perfil.password);
    if (!valid) {
      return reply.status(401).send({ message: "Credenciales inválidas" });
    }

    const token = await signToken({ sub: perfil.id, email: perfil.email, rol: perfil.rol });

    await app.prisma.auditoria.create({
      data: {
        perfilId: perfil.id,
        accion: "LOGIN",
        entidad: "Perfil",
        entidadId: perfil.id,
        detalle: { email: perfil.email, rol: perfil.rol },
      },
    });

    return reply.send({
      token,
      perfil: {
        id: perfil.id,
        email: perfil.email,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        cedula: perfil.cedula,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
        avatarUrl: perfil.avatarUrl,
        rol: perfil.rol,
        activo: perfil.activo,
        estudiante: perfil.estudiante,
        docente: perfil.docente,
      },
    });
  });

  app.get(
    "/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const perfil = await app.prisma.perfil.findFirst({
        where: { id: request.userId },
        include: {
          estudiante: { include: { carrera: true } },
          docente: true,
        },
      });

      if (!perfil) {
        return reply.status(404).send({ message: "Perfil no encontrado" });
      }

      return reply.send({
        id: perfil.id,
        email: perfil.email,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        cedula: perfil.cedula,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
        avatarUrl: perfil.avatarUrl,
        rol: perfil.rol,
        activo: perfil.activo,
        estudiante: perfil.estudiante,
        docente: perfil.docente,
      });
    },
  );
}
