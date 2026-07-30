# WebSISS PowerAmp

Sistema de Gestión Académica Universitaria (MVP).

## Stack

- **Backend:** Node.js + TypeScript + Fastify + Prisma ORM
- **Frontend:** React + Vite + shadcn/ui + Tailwind CSS
- **BD:** PostgreSQL 16 (local) → Supabase Postgres (producción)
- **Auth:** Supabase Auth (con MFA/2FA vía TOTP)
- **Monorepo:** pnpm workspaces

## Estructura

```
websiss-poweramp/
├── apps/
│   ├── api/         # Fastify + Prisma + TS
│   └── web/         # React + Vite + shadcn/ui
├── packages/
│   ├── database/    # Schema Prisma, migraciones, seed
│   ├── shared-types/# DTOs y tipos compartidos
│   └── config/      # ESLint, tsconfig, prettier
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Desarrollo Local

### Prerrequisitos

- Node.js >= 20
- pnpm >= 9 (`npm i -g pnpm`)
- Docker y Docker Compose

### Pasos

```bash
# 1. Clonar e instalar dependencias
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env
cp apps/web/.env.example apps/web/.env

# 3. Iniciar PostgreSQL local
pnpm db:up

# 4. Ejecutar migraciones de Prisma
pnpm db:migrate

# 5. Sembrar base de datos con datos de prueba
pnpm db:seed

# 6. Iniciar frontend y backend en paralelo
pnpm dev
```

- API: http://localhost:4000
- Web: http://localhost:5173

### Comandos útiles

| Comando           | Descripción                                   |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Corre API + Web en paralelo                   |
| `pnpm db:up`      | Levanta PostgreSQL con Docker Compose         |
| `pnpm db:down`    | Detiene el contenedor                         |
| `pnpm db:migrate` | Ejecuta `prisma migrate dev`                  |
| `pnpm db:seed`    | Corre el seed de datos de prueba              |
| `pnpm db:studio`  | Abre Prisma Studio para explorar la BD        |
| `pnpm build`      | Compila todos los paquetes                    |
| `pnpm typecheck`  | Verifica tipos en todos los workspaces        |

## Migración a Supabase

### 1. Configurar proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **Project Settings → Database → Connection string**
3. Copia la URI de conexión (modo `transaction` o `session`)

### 2. Aplicar migraciones

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true" \
  pnpm db:migrate
```

O usa `prisma migrate deploy` apuntando a la URI de Supabase:

```bash
# En el package de database
cd packages/database
DATABASE_URL="<supabase-uri>" npx prisma migrate deploy
```

### 3. Diferencias a ajustar en producción

| Aspecto                        | Local                              | Supabase                           |
| ------------------------------ | ---------------------------------- | ---------------------------------- |
| `auth.users`                   | No existe (UUID libre en Perfil)   | Tabla real `auth.users`            |
| FK de `perfiles.id` → `auth.users.id` | No aplica                    | Agregar FK manual con SQL          |
| Row Level Security (RLS)       | No aplica                          | Habilitar por tabla                |
| `gen_random_uuid()`            | Disponible (pgcrypto)              | Disponible por defecto             |

### 4. Vincular Perfil con auth.users

Ejecuta este SQL en el SQL Editor de Supabase **después** de migrar:

```sql
-- Agregar FK real: perfiles.id → auth.users.id
ALTER TABLE perfiles
  ADD CONSTRAINT fk_perfil_auth_user
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Opcional: crear perfiles para usuarios existentes en auth.users
INSERT INTO perfiles (id, email, nombre, apellido, cedula, rol)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'nombre', 'Usuario'),
  COALESCE(raw_user_meta_data->>'apellido', 'Sistema'),
  COALESCE(raw_user_meta_data->>'cedula', id),
  COALESCE(raw_user_meta_data->>'rol', 'ESTUDIANTE')::rol
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

### 5. Activar RLS

```sql
-- Habilitar RLS en todas las tablas
DO $$
DECLARE
  tab TEXT;
BEGIN
  FOR tab IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('_prisma_migrations')
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tab);
  END LOOP;
END $$;

-- Ejemplo de política básica: usuarios ven solo su perfil
CREATE POLICY "Usuarios ven su propio perfil"
  ON perfiles FOR SELECT
  USING (id = auth.uid());
```

### 6. Checklist post-migración

- [ ] Migraciones aplicadas sin error
- [ ] FK de `perfiles.id` → `auth.users.id` agregada
- [ ] RLS habilitado en tablas públicas
- [ ] Políticas de acceso creadas por rol
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` configurados en el entorno
- [ ] Probar autenticación (login/register)
- [ ] Probar MFA (enroll, challenge, verify)
- [ ] Probar subida de CSV
- [ ] Verificar que el frontend apunta a la URL correcta de Supabase
