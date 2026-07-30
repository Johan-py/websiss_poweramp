import { FastifyInstance } from "fastify";
import { createClient } from "@supabase/supabase-js";
import { config } from "../utils/config.js";

async function getSupabaseUserClient(token: string) {
  const client = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
      },
    },
  );

  await client.auth.setSession({
    access_token: token,
    refresh_token: "",
  });

  return client;
}

function getToken(request: any) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing authorization token");
  }

  return authHeader.slice(7);
}

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/mfa/enroll",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const token = getToken(request);
      const sb = await getSupabaseUserClient(token);

      const { data, error } = await sb.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) return reply.status(400).send(error);

      return reply.send(data);
    },
  );


  app.post(
    "/mfa/challenge",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const token = getToken(request);
      const sb = await getSupabaseUserClient(token);

      const { factorId } = request.body as {
        factorId: string;
      };

      const { data, error } = await sb.auth.mfa.challenge({
        factorId,
      });

      if (error) return reply.status(400).send(error);

      return reply.send(data);
    },
  );


  app.post(
    "/mfa/verify",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const token = getToken(request);
      const sb = await getSupabaseUserClient(token);

      const { factorId, challengeId, code } = request.body as {
        factorId: string;
        challengeId: string;
        code: string;
      };

      const { data, error } = await sb.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) return reply.status(400).send(error);

      return reply.send(data);
    },
  );


  app.get(
    "/mfa/factors",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const token = getToken(request);
      const sb = await getSupabaseUserClient(token);

      const { data, error } = await sb.auth.mfa.listFactors();

      if (error) return reply.status(400).send(error);

      return reply.send(data);
    },
  );
}