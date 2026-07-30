import { FastifyInstance } from "fastify";
import { uploadCSVService } from "../services/upload.service.js";

export async function uploadRoutes(app: FastifyInstance) {
  // Subida masiva de notas desde CSV
  app.post(
    "/notas",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ message: "No file uploaded" });
      }

      const buffer = await file.toBuffer();
      const csvContent = buffer.toString("utf-8");

      const result = await uploadCSVService.importNotas(app.prisma, csvContent);
      return reply.send(result);
    },
  );

  // Subida masiva de estudiantes desde CSV
  app.post(
    "/estudiantes",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ message: "No file uploaded" });
      }

      const buffer = await file.toBuffer();
      const csvContent = buffer.toString("utf-8");

      const result = await uploadCSVService.importEstudiantes(app.prisma, csvContent);
      return reply.send(result);
    },
  );
}
