# 🎤 Guion de Presentación — WebSISS PowerAmp (MVP)

> **Duración estimada:** 12–15 minutos (10 min de demo + 3–5 min de preguntas)
> **Formato:** Presentación en vivo sobre la app en localhost + slides cortos.

---

## 0. Datos rápidos de la demo

| Rol | Email | Contraseña | Qué demuestra |
| --- | --- | --- | --- |
| Administrador | `admin@universidad.edu` | `123456` | Vista global, gestión, auditoría, dashboard |
| Coordinador | `coordinador@universidad.edu` | `123456` | Gestión académica (carreras, materias, ofertas) |
| Docente | `docente1@universidad.edu` | `123456` | Subir notas, publicar recursos, su horario |
| Estudiante | `estudiante1@universidad.edu` | `123456` | Inscripción, notas, kardex, pagos, horario |

> ⚠️ **Antes de empezar:** `pnpm db:seed` para datos frescos, `pnpm dev` y verificar `/health`.

---

## 1. Apertura (1 min) — Qué es y para quién

> "Buenos días. Hoy les presento **WebSISS PowerAmp**, un Sistema Integral de Servicios Estudiantiles, el MVP de un sistema de gestión académica universitaria que integra en una sola plataforma a **estudiantes, docentes, coordinadores y administración**."

**Mensaje clave:** una sola fuente de verdad reemplaza la gestión en hojas de cálculo, correos y WhatsApp.

**Qué mostrar:**
- Portada del proyecto (nombre + tagline).
- Frase de impacto: *"Del Excel a la nube: la vida académica de un estudiante en una sola plataforma."*

---

## 2. Problemática (1 min)

- Información académica dispersa (notas, horarios, kardex en archivos sueltos).
- Procesos manuales: inscripciones, carga de notas, control de pagos.
- Sin trazabilidad de quién hizo qué (auditoría).
- La comunidad educativa (docentes, estudiantes, administración) no comparte el mismo sistema.

---

## 3. La solución (1 min)

**WebSISS PowerAmp** centraliza el ciclo de vida académico completo:

- **Plan de estudios** → carreras, materias y malla curricular.
- **Oferta e inscripción** → cupos, horarios, modalidades.
- **Evaluación y notas** → evaluaciones, carga de notas, umbral de aprobación (≥ 14).
- **Vida académica** → kardex con promedios y exportación a PDF.
- **Soporte** → pagos, calendario, recursos, noticias, auditoría.

**Valor diferenciador del MVP:**
- ✅ Un solo login con 4 roles y permisos por módulo.
- ✅ Dashboard analítico en tiempo real para administración.
- ✅ Generación de **Kardex en PDF** con marca institucional.
- ✅ Importación masiva de notas/estudiantes por **CSV** (API lista).
- ✅ Registro de **auditoría** de cada acción sensible.

---

## 4. Demo — recorrido por roles (7–8 min)

### 4.1 Login y adaptación por rol (30 s)
> "Vamos a la app. Un solo login, y la plataforma se adapta según el rol."

**Demo:** login como `admin@universidad.edu` / `123456` → el sidebar cambia por rol.

---

### 4.2 Dashboard Administrador (1.5 min) ⭐
> "El administrador ve el pulso de la institución: estudiantes, docentes, ofertas activas e ingresos recaudados."

**Demo (con datos del seed):**
- Tarjetas de métricas (estudiantes, docentes, ofertas, ingresos en Bs).
- Gráfica de **ingresos por mes** e **inscripciones por mes**.
- **Estudiantes por carrera** y **distribución activos/inactivos**.
- **Ocupación de ofertas** con semáforo (verde/ámbar/rojo).
- Accesos rápidos.

**Frases:**
- "Esto antes se calculaba a mano en Excel. Ahora es automático."
- "La gráfica de ocupación avisa cuándo una materia se está llenando."

---

### 4.3 Gestión académica: Carreras, Materias y Oferta (2 min)
> "El coordinador arma el plan de estudios: carreras, materias y la oferta académica de cada periodo."

**Demo:**
1. **Carreras**: lista de carreras → clic para ver la **malla curricular por semestres** con créditos. Botón **"Nueva Carrera"** → dialog de creación (código, nombre, modalidad, duración, estado).
2. **Materias**: tabla con búsqueda y orden → **"Nueva Materia"** con asignación a carrera, créditos y horas.
3. **Oferta Académica**: crear una **nueva oferta** (materia + docente + periodo + aula + horario + cupo). Ver la barra de cupos y filtrado por rol (el docente solo ve sus materias).

**Frases:**
- "Todo el catálogo vive en una base relacional, no en una hoja de cálculo."

---

### 4.4 Docente: subir notas y publicar recursos (1.5 min)
> "El docente entra y ve solo lo suyo: sus materias, su horario, sus evaluaciones."

**Demo con `docente1@universidad.edu`:**
1. **Notas** → botón "Subir Notas" → seleccionar evaluación → **carga masiva de notas por estudiante** (0–20) → se marca Aprobada/Reprobada en tiempo real.
2. **Recursos** → publicar un material (borrador vs publicado).
3. **Horario** → su semana con aulas, horas y modalidad.

**Frases:**
- "El docente sube notas en un solo paso; la nota pasa directo al kardex del estudiante."

---

### 4.5 Estudiante: el journey completo (2.5 min) ⭐
> "La estrella de la demo: la experiencia del estudiante."

**Demo con `estudiante1@universidad.edu`:**
1. **Dashboard personal**: materias activas, créditos, promedio, pagos pendientes, próximos eventos.
2. **Inscripciones**: buscar materia → ver detalle (docente, horario, cupos, créditos) → **Inscribirme** → confirmación y cupo disponible que baja.
3. **Notas**: sus notas con color (verde ≥ 14 / rojo < 14).
4. **Kardex**: promedios global y ponderado, créditos aprobados, avance en % → **Descargar Kardex PDF** (documento A4 con logo institucional).
5. **Horario** y **Pagos** (deuda pendiente en Bs).

**Frases:**
- "Del aula al kardex en un solo clic."
- "El PDF del kardex es generado en el navegador con la marca de la universidad."

---

### 4.6 Cierre de demo administrativo (30 s)
- **Auditoría**: cada acción (login, crear carrera, subir nota) queda registrada con usuario y fecha.
- **Calendario**: eventos académicos + exámenes cruzados desde evaluaciones.

---

## 5. Arquitectura técnica (1.5 min)

**Monorepo pnpm workspaces:**

```
apps/
  api/     → Fastify + TypeScript + Prisma ORM + JWT (jose)
  web/     → React + Vite + Tailwind + shadcn/ui
packages/
  database → Schema Prisma, migraciones y seed
```

- **BD:** PostgreSQL 16 (local Docker) → lista para Supabase en producción.
- **Auth:** JWT con expiración de 24 h y contraseñas cifradas con bcrypt; autorización por rol en backend (no solo en UI).
- **Modelo de datos:** 16 entidades (Perfil, Estudiante, Docente, Carrera, Materia, Oferta, Inscripción, Evaluación, Nota, Pago, Auditoría, etc.).
- **Seed:** datos realistas — 4 carreras, 67 materias, 48 ofertas, 37 inscripciones, 29 evaluaciones, 21 notas, 9 pagos.
- **Seguridad:** rutas protegidas con middleware `authenticate`; endpoints de gestión solo ADMIN/COORDINADOR; estudiantes solo ven sus propios datos.

**Decisión de negocio destacable:** el umbral de aprobación (14/20) y el cálculo del promedio ponderado del kardex están implementados en el backend, listos para adaptarse a la normativa de la institución.

---

## 6. Estado del MVP y próximos pasos (1 min)

**Ya funciona en el MVP:**
- ✅ Login por roles y rutas protegidas.
- ✅ CRUD de carreras, materias, ofertas, estudiantes y docentes.
- ✅ Inscripción de estudiantes con validación de cupos.
- ✅ Evaluaciones, carga de notas y visualización por rol.
- ✅ Kardex con PDF, horario, calendario y recursos.
- ✅ Dashboard analítico y auditoría.
- ✅ Importación CSV por API (notas y estudiantes).

**En desarrollo / pendiente (roadmap):**
- 🔜 UI de importación masiva por CSV (la API ya está lista).
- 🔜 Flujo completo de pagos (registrar, confirmar, estados).
- 🔜 Edición y baja (eliminar) de registros.
- 🔜 Guardado real del perfil y configuración.
- 🔜 Notificaciones reales y mensajería interna.
- 🔜 Migración a Supabase (RLS + MFA/TOTP) para producción.
- 🔜 Prerrequisitos de materias y control de secuencia.

---

## 7. Preguntas y cierre (1 min)

> "WebSISS PowerAmp es la base de un sistema integral que escala con la institución. Gracias por su atención — con gusto respondo sus preguntas."

**Posibles preguntas y respuestas:**
- *¿Se puede ampliar a más campus o carreras?* → El modelo es relacional y multi-entidad; agregar campus es un nuevo módulo sin romper lo existente.
- *¿La data es segura?* → JWT con expiración, contraseñas hasheadas, autorización por rol en cada endpoint y bitácora de auditoría.
- *¿Corre en producción?* → Sí: frontend en Vercel y backend listo para Supabase Postgres.

---

## Checklist antes de la demo

- [ ] `pnpm db:seed` (datos frescos)
- [ ] `pnpm dev` → web en `:5173`, API en `:4000`
- [ ] `GET /health` responde `{ status: "ok" }`
- [ ] Navegador en pantalla completa, fuente del sistema legible
- [ ] Ventanas del seed con credenciales visibles (nota o slide)
- [ ] Probar la descarga del PDF del Kardex (depende del navegador)
- [ ] Plan B offline: screenshots de cada módulo en una carpeta de respaldo
vvvvvvvvv