-- ─── Extensiones ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE');
CREATE TYPE "Modalidad" AS ENUM ('PRESENCIAL', 'SEMIPRESENCIAL', 'VIRTUAL');
CREATE TYPE "TipoAula" AS ENUM ('AULA', 'LABORATORIO', 'TALLER', 'AUDITORIO');
CREATE TYPE "TipoRecurso" AS ENUM ('ARCHIVO', 'VIDEO', 'ENLACE', 'DOCUMENTO');
CREATE TYPE "TipoEvaluacion" AS ENUM ('PARCIAL', 'FINAL', 'PRACTICA', 'TALLER', 'PROYECTO', 'EXAMEN_CORTO', 'RECUPERACION');
CREATE TYPE "EstadoInscripcion" AS ENUM ('ACTIVA', 'CANCELADA', 'COMPLETADA', 'RETIRADA');
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE');
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO', 'ANULADO');
CREATE TYPE "TipoEvento" AS ENUM ('INICIO_CLASES', 'FIN_CLASES', 'EXAMENES', 'VACACIONES', 'FERIADO', 'MATRICULA', 'OTRO');

-- ─── Tablas ─────────────────────────────────────────────

-- Perfil (1:1 con auth.users de Supabase)
CREATE TABLE "perfiles" (
  "id"         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "email"      TEXT        NOT NULL UNIQUE,
  "nombre"     TEXT        NOT NULL,
  "apellido"   TEXT        NOT NULL,
  "cedula"     TEXT        NOT NULL UNIQUE,
  "telefono"   TEXT,
  "direccion"  TEXT,
  "avatar_url" TEXT,
  "rol"        "Rol"       NOT NULL DEFAULT 'ESTUDIANTE',
  "activo"     BOOLEAN     NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Carrera
CREATE TABLE "carreras" (
  "id"                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "codigo"             TEXT        NOT NULL UNIQUE,
  "nombre"             TEXT        NOT NULL,
  "descripcion"        TEXT,
  "modalidad"          "Modalidad" NOT NULL DEFAULT 'PRESENCIAL',
  "duracion_semestres" INTEGER     NOT NULL,
  "activo"             BOOLEAN     NOT NULL DEFAULT true,
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Estudiante
CREATE TABLE "estudiantes" (
  "id"               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "perfil_id"        UUID        NOT NULL UNIQUE REFERENCES "perfiles"(id) ON DELETE CASCADE,
  "carrera_id"       UUID        NOT NULL REFERENCES "carreras"(id),
  "codigo_estudiante" TEXT       NOT NULL UNIQUE,
  "fecha_ingreso"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Docente
CREATE TABLE "docentes" (
  "id"              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "perfil_id"       UUID        NOT NULL UNIQUE REFERENCES "perfiles"(id) ON DELETE CASCADE,
  "codigo_docente"  TEXT        NOT NULL UNIQUE,
  "especialidad"    TEXT,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Materia
CREATE TABLE "materias" (
  "id"              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "carrera_id"      UUID        NOT NULL REFERENCES "carreras"(id),
  "codigo"          TEXT        NOT NULL UNIQUE,
  "nombre"          TEXT        NOT NULL,
  "descripcion"     TEXT,
  "creditos"        INTEGER     NOT NULL,
  "horas_teoricas"  INTEGER     NOT NULL DEFAULT 0,
  "horas_practicas" INTEGER     NOT NULL DEFAULT 0,
  "ciclo"           INTEGER     NOT NULL,
  "activo"          BOOLEAN     NOT NULL DEFAULT true,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prerrequisito (N:N Materia-Materia)
CREATE TABLE "prerrequisitos" (
  "materia_id"           UUID NOT NULL REFERENCES "materias"(id) ON DELETE CASCADE,
  "materia_requisito_id" UUID NOT NULL REFERENCES "materias"(id) ON DELETE CASCADE,
  PRIMARY KEY ("materia_id", "materia_requisito_id")
);

-- Periodo
CREATE TABLE "periodos" (
  "id"          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "codigo"      TEXT        NOT NULL UNIQUE,
  "nombre"      TEXT        NOT NULL,
  "fecha_inicio" TIMESTAMPTZ NOT NULL,
  "fecha_fin"   TIMESTAMPTZ NOT NULL,
  "activo"      BOOLEAN     NOT NULL DEFAULT false,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aula
CREATE TABLE "aulas" (
  "id"         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "codigo"     TEXT        NOT NULL UNIQUE,
  "nombre"     TEXT        NOT NULL,
  "capacidad"  INTEGER     NOT NULL,
  "tipo"       "TipoAula"  NOT NULL DEFAULT 'AULA',
  "ubicacion"  TEXT,
  "disponible" BOOLEAN     NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OfertaAcademica
CREATE TABLE "ofertas_academicas" (
  "id"              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "materia_id"      UUID        NOT NULL REFERENCES "materias"(id),
  "docente_id"      UUID        NOT NULL REFERENCES "docentes"(id),
  "aula_id"         UUID        REFERENCES "aulas"(id),
  "periodo_id"      UUID        NOT NULL REFERENCES "periodos"(id),
  "cupo_maximo"     INTEGER     NOT NULL DEFAULT 30,
  "cupo_disponible" INTEGER     NOT NULL DEFAULT 30,
  "seccion"         TEXT        NOT NULL DEFAULT 'A',
  "horario"         JSONB,
  "modalidad"       "Modalidad" NOT NULL DEFAULT 'PRESENCIAL',
  "activo"          BOOLEAN     NOT NULL DEFAULT true,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RecursoMateria
CREATE TABLE "recursos_materia" (
  "id"           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  "oferta_id"    UUID         NOT NULL REFERENCES "ofertas_academicas"(id) ON DELETE CASCADE,
  "titulo"       TEXT         NOT NULL,
  "descripcion"  TEXT,
  "tipo_recurso" "TipoRecurso" NOT NULL DEFAULT 'ARCHIVO',
  "url_recurso"  TEXT         NOT NULL,
  "publicado"    BOOLEAN      NOT NULL DEFAULT false,
  "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Evaluacion
CREATE TABLE "evaluaciones" (
  "id"              UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  "oferta_id"       UUID            NOT NULL REFERENCES "ofertas_academicas"(id) ON DELETE CASCADE,
  "titulo"          TEXT            NOT NULL,
  "descripcion"     TEXT,
  "tipo_evaluacion" "TipoEvaluacion" NOT NULL DEFAULT 'PARCIAL',
  "peso"            DECIMAL(5,2)    NOT NULL DEFAULT 0,
  "puntaje_maximo"  DECIMAL(5,2)    NOT NULL DEFAULT 20,
  "fecha"           TIMESTAMPTZ,
  "publicada"       BOOLEAN         NOT NULL DEFAULT false,
  "editable_hasta"  TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- Nota
CREATE TABLE "notas" (
  "id"            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  "evaluacion_id" UUID         NOT NULL REFERENCES "evaluaciones"(id) ON DELETE CASCADE,
  "estudiante_id" UUID         NOT NULL REFERENCES "estudiantes"(id) ON DELETE CASCADE,
  "valor"         DECIMAL(5,2) NOT NULL,
  "observacion"   TEXT,
  "created_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE ("evaluacion_id", "estudiante_id")
);

-- Inscripcion (N:N Estudiante ⇄ OfertaAcademica)
CREATE TABLE "inscripciones" (
  "id"                UUID                 DEFAULT gen_random_uuid() PRIMARY KEY,
  "estudiante_id"     UUID                 NOT NULL REFERENCES "estudiantes"(id) ON DELETE CASCADE,
  "oferta_id"         UUID                 NOT NULL REFERENCES "ofertas_academicas"(id) ON DELETE CASCADE,
  "estado"            "EstadoInscripcion"  NOT NULL DEFAULT 'ACTIVA',
  "fecha_inscripcion" TIMESTAMPTZ          NOT NULL DEFAULT now(),
  "created_at"        TIMESTAMPTZ          NOT NULL DEFAULT now(),
  "updated_at"        TIMESTAMPTZ          NOT NULL DEFAULT now(),
  UNIQUE ("estudiante_id", "oferta_id")
);

-- Pago
CREATE TABLE "pagos" (
  "id"           UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  "estudiante_id" UUID         NOT NULL REFERENCES "estudiantes"(id),
  "periodo_id"   UUID          NOT NULL REFERENCES "periodos"(id),
  "monto"        DECIMAL(10,2) NOT NULL,
  "concepto"     TEXT,
  "referencia"   TEXT          NOT NULL UNIQUE,
  "metodo_pago"  "MetodoPago"  NOT NULL DEFAULT 'TRANSFERENCIA',
  "estado"       "EstadoPago"  NOT NULL DEFAULT 'PENDIENTE',
  "fecha_pago"   TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- CalendarioAcademico
CREATE TABLE "calendario_academico" (
  "id"          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  "periodo_id"  UUID         NOT NULL REFERENCES "periodos"(id),
  "titulo"      TEXT         NOT NULL,
  "descripcion" TEXT,
  "tipo_evento" "TipoEvento" NOT NULL DEFAULT 'OTRO',
  "fecha_inicio" TIMESTAMPTZ NOT NULL,
  "fecha_fin"   TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Auditoria
CREATE TABLE "auditoria" (
  "id"           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  "perfil_id"    UUID        NOT NULL REFERENCES "perfiles"(id),
  "accion"       TEXT        NOT NULL,
  "entidad"      TEXT        NOT NULL,
  "entidad_id"   TEXT,
  "detalle"      JSONB,
  "direccion_ip" TEXT,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Índices ─────────────────────────────────────────────
CREATE INDEX ON "auditoria"("perfil_id");
CREATE INDEX ON "auditoria"("entidad", "entidad_id");

-- ─── Trigger para updated_at automático ─────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT IN ('auditoria')
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;
