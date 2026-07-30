import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { config } from "./utils/config.js";
import { corsPlugin } from "./plugins/cors.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { authPlugin } from "./plugins/auth.js";
import { uploadRoutes } from "./routes/upload.js";
import { authRoutes } from "./routes/auth.js";
import { academicoRoutes } from "./routes/academico.js";

async function main() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === "development" ? "info" : "warn",
    },
  });

  await app.register(corsPlugin);
  await app.register(prismaPlugin);
  await app.register(authPlugin);
  await app.register(multipart);

  await app.register(uploadRoutes, { prefix: "/api/v1/upload" });
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(academicoRoutes);

  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    console.log(`API running on http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    app.log.fatal(err);
    process.exit(1);
  }
}

main();
