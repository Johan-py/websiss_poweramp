import { FastifyInstance } from "fastify";
import { createClient } from "@supabase/supabase-js";
import { config } from "../utils/config.js";

export async function authRoutes(app: FastifyInstance) {
  if (!config.SUPABASE_SERVICE_ROLE_KEY) {
    app.log.warn("Supabase MFA endpoints disabled: SUPABASE_SERVICE_ROLE_KEY not configured");
    return;
  }

  const sbAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Enroll en MFA (crea factor TOTP)
  app.post("/mfa/enroll", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { data, error } = await sbAdmin.auth.mfa.enroll({
      factorType: "totp",
      userId: request.userId!,
    });
    if (error) return reply.status(400).send(error);
    return reply.send(data);
  });

  // Challenge al factor (genera código de verificación)
  app.post("/mfa/challenge", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { factorId } = request.body as { factorId: string };
    const { data, error } = await sbAdmin.auth.mfa.challenge({ factorId });
    if (error) return reply.status(400).send(error);
    return reply.send(data);
  });

  // Verifica el código TOTP y completa el enrollment
  app.post("/mfa/verify", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { factorId, challengeId, code } = request.body as {
      factorId: string;
      challengeId: string;
      code: string;
    };
    const { data, error } = await sbAdmin.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
    if (error) return reply.status(400).send(error);
    return reply.send(data);
  });

  // Lista factores MFA del usuario
  app.get("/mfa/factors", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { data, error } = await sbAdmin.auth.mfa.listFactors();
    if (error) return reply.status(400).send(error);
    return reply.send(data);
  });
}
