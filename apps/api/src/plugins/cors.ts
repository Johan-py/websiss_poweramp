import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../utils/config.js";

export async function corsPlugin(app: FastifyInstance) {
  await app.register(cors, {
    origin: config.NODE_ENV === "development"
      ? ["http://localhost:5173", "http://127.0.0.1:5173"]
      : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
}
