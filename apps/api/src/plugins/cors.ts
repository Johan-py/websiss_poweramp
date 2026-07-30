import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export async function corsPlugin(app: FastifyInstance) {
  await app.register(cors, {
    origin: process.env.NODE_ENV === "development"
      ? ["http://localhost:5173", "http://127.0.0.1:5173"]
      : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
}
