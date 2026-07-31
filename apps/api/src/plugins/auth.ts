import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { SignJWT, jwtVerify } from "jose";
import { config } from "../utils/config.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
    userEmail?: string;
  }
}

function getSecret() {
  return new TextEncoder().encode(config.JWT_SECRET);
}

export async function signToken(payload: { sub: string; email: string; rol: string }) {
  return new SignJWT({ ...payload, role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest("userId", undefined);
  app.decorateRequest("userRole", undefined);
  app.decorateRequest("userEmail", undefined);

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ message: "Missing or invalid Authorization header" });
    }

    try {
      const token = authHeader.slice(7);
      const { payload } = await jwtVerify(token, getSecret());
      const p = payload as Record<string, string>;
      request.userId = p.sub;
      request.userRole = p.rol;
      request.userEmail = p.email;
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
