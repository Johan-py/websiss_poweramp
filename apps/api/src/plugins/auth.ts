import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { createRemoteJWKSet, jwtVerify } from "jose";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
  }
}

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(supabaseUrl: string) {
  if (!JWKS) {
    const url = new URL(`${supabaseUrl}/.well-known/jwks.json`);
    JWKS = createRemoteJWKSet(url);
  }
  return JWKS;
}

async function verifySupabaseToken(token: string, supabaseUrl: string) {
  const jwks = getJWKS(supabaseUrl);
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `${supabaseUrl}/auth/v1`,
    audience: "authenticated",
  });
  return payload;
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest("userId", undefined);
  app.decorateRequest("userRole", undefined);

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      return reply.status(500).send({ message: "SUPABASE_URL not configured" });
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ message: "Missing or invalid Authorization header" });
    }

    try {
      const token = authHeader.slice(7);
      const payload = await verifySupabaseToken(token, supabaseUrl);
      request.userId = payload.sub;
      request.userRole = (payload as Record<string, string>).user_role;
    } catch {
      return reply.status(401).send({ message: "Invalid or expired token" });
    }
  });
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
