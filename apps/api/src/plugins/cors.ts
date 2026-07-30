import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { config } from "../utils/config.js";

export async function corsPlugin(app: FastifyInstance) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://websiss-poweramp-web.vercel.app",
  ];

  await app.register(cors, {
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, health checks)
      if (!origin) {
        return callback(null, true);
      }

      // Permitir dominios conocidos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Permitir previews de Vercel
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  });
}