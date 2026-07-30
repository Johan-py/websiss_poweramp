import { FastifyInstance } from "fastify";
import { prisma } from "@websiss/database";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

export const prismaPlugin = fp(async (app: FastifyInstance) => {
  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
