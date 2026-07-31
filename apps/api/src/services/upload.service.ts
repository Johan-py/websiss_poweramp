import { PrismaClient } from "@websiss/database";
import { parse } from "csv-parse/sync";
import { hashSync } from "bcryptjs";
import type { CSVUploadResult } from "@websiss/shared-types";

const DEFAULT_PASSWORD = hashSync("123456", 10);

const REQUIRED_NOTA_COLUMNS = ["codigo_estudiante", "evaluacion_id", "valor"];
const REQUIRED_ESTUDIANTE_COLUMNS = ["codigo_estudiante", "email", "nombre", "apellido", "cedula", "carrera_codigo"];

export const uploadCSVService = {
  async importNotas(prisma: PrismaClient, csv: string): Promise<CSVUploadResult> {
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as Record<string, string>[];

    const result: CSVUploadResult = { filasProcesadas: 0, filasConError: 0, errores: [] };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const fila = i + 2; // +2 por header y 0-index

      const missing = REQUIRED_NOTA_COLUMNS.filter((c) => !row[c]);
      if (missing.length > 0) {
        result.filasConError++;
        result.errores.push({ fila, mensaje: `Columnas faltantes: ${missing.join(", ")}` });
        continue;
      }

      const valor = parseFloat(row.valor);
      if (isNaN(valor)) {
        result.filasConError++;
        result.errores.push({ fila, mensaje: `Valor inválido: "${row.valor}"` });
        continue;
      }

      try {
        const estudiante = await prisma.estudiante.findUnique({
          where: { codigoEstudiante: row.codigo_estudiante },
        });
        if (!estudiante) {
          throw new Error(`Estudiante no encontrado: ${row.codigo_estudiante}`);
        }

        await prisma.nota.upsert({
          where: {
            evaluacionId_estudianteId: {
              evaluacionId: row.evaluacion_id,
              estudianteId: estudiante.id,
            },
          },
          update: { valor },
          create: {
            evaluacionId: row.evaluacion_id,
            estudianteId: estudiante.id,
            valor,
          },
        });
        result.filasProcesadas++;
      } catch (error) {
        result.filasConError++;
        result.errores.push({
          fila,
          mensaje: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return result;
  },

  async importEstudiantes(prisma: PrismaClient, csv: string): Promise<CSVUploadResult> {
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    const result: CSVUploadResult = { filasProcesadas: 0, filasConError: 0, errores: [] };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const fila = i + 2;

      const missing = REQUIRED_ESTUDIANTE_COLUMNS.filter((c) => !row[c]);
      if (missing.length > 0) {
        result.filasConError++;
        result.errores.push({ fila, mensaje: `Columnas faltantes: ${missing.join(", ")}` });
        continue;
      }

      try {
        const carrera = await prisma.carrera.findUnique({
          where: { codigo: row.carrera_codigo },
        });
        if (!carrera) {
          throw new Error(`Carrera no encontrada: ${row.carrera_codigo}`);
        }

        const newPerfil = await prisma.perfil.upsert({
          where: { email: row.email },
          update: {},
          create: {
            email: row.email,
            password: DEFAULT_PASSWORD,
            nombre: row.nombre,
            apellido: row.apellido,
            cedula: row.cedula,
            rol: "ESTUDIANTE",
          },
        });

        await prisma.estudiante.upsert({
          where: { codigoEstudiante: row.codigo_estudiante },
          update: { carreraId: carrera.id },
          create: {
            perfilId: newPerfil.id,
            carreraId: carrera.id,
            codigoEstudiante: row.codigo_estudiante,
          },
        });

        result.filasProcesadas++;
      } catch (error) {
        result.filasConError++;
        result.errores.push({
          fila,
          mensaje: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return result;
  },
};
