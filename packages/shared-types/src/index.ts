// ─── Enums ──────────────────────────────────────────────

export type Rol = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";

export type Modalidad = "PRESENCIAL" | "SEMIPRESENCIAL" | "VIRTUAL";

export type TipoAula = "AULA" | "LABORATORIO" | "TALLER" | "AUDITORIO";

export type TipoRecurso = "ARCHIVO" | "VIDEO" | "ENLACE" | "DOCUMENTO";

export type TipoEvaluacion =
  | "PARCIAL"
  | "FINAL"
  | "PRACTICA"
  | "TALLER"
  | "PROYECTO"
  | "EXAMEN_CORTO"
  | "RECUPERACION";

export type EstadoInscripcion = "ACTIVA" | "CANCELADA" | "COMPLETADA" | "RETIRADA";

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "CHEQUE";

export type EstadoPago = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO" | "ANULADO";

export type TipoEvento =
  | "INICIO_CLASES"
  | "FIN_CLASES"
  | "EXAMENES"
  | "VACACIONES"
  | "FERIADO"
  | "MATRICULA"
  | "OTRO";

// ─── DTOs de Perfil ────────────────────────────────────

export interface PerfilDTO {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string | null;
  direccion: string | null;
  avatarUrl: string | null;
  rol: Rol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePerfilDTO {
  email: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  rol?: Rol;
}

export interface UpdatePerfilDTO {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  avatarUrl?: string;
}

// ─── DTOs de Estudiante ────────────────────────────────

export interface EstudianteDTO {
  id: string;
  perfilId: string;
  carreraId: string;
  codigoEstudiante: string;
  fechaIngreso: string;
  perfil?: PerfilDTO;
  carrera?: CarreraDTO;
}

export interface CreateEstudianteDTO {
  perfilId: string;
  carreraId: string;
  codigoEstudiante: string;
}

// ─── DTOs de Docente ────────────────────────────────────

export interface DocenteDTO {
  id: string;
  perfilId: string;
  codigoDocente: string;
  especialidad: string | null;
  perfil?: PerfilDTO;
}

// ─── DTOs de Carrera ────────────────────────────────────

export interface CarreraDTO {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  modalidad: Modalidad;
  duracionSemestres: number;
  activo: boolean;
}

// ─── DTOs de Materia ────────────────────────────────────

export interface MateriaDTO {
  id: string;
  carreraId: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  creditos: number;
  horasTeoricas: number;
  horasPracticas: number;
  ciclo: number;
  activo: boolean;
  carrera?: CarreraDTO;
  requisitos?: PrerrequisitoDTO[];
}

export interface PrerrequisitoDTO {
  materiaId: string;
  materiaRequisitoId: string;
  materia?: MateriaDTO;
  materiaReq?: MateriaDTO;
}

// ─── DTOs de Periodo ────────────────────────────────────

export interface PeriodoDTO {
  id: string;
  codigo: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

// ─── DTOs de Aula ──────────────────────────────────────

export interface AulaDTO {
  id: string;
  codigo: string;
  nombre: string;
  capacidad: number;
  tipo: TipoAula;
  ubicacion: string | null;
}

// ─── DTOs de Oferta_Academica ──────────────────────────

export interface OfertaAcademicaDTO {
  id: string;
  materiaId: string;
  docenteId: string;
  aulaId: string | null;
  periodoId: string;
  cupoMaximo: number;
  cupoDisponible: number;
  seccion: string;
  horario: unknown;
  modalidad: Modalidad;
  activo: boolean;
  materia?: MateriaDTO;
  docente?: DocenteDTO;
  aula?: AulaDTO;
  periodo?: PeriodoDTO;
}

// ─── DTOs de Inscripcion ───────────────────────────────

export interface InscripcionDTO {
  id: string;
  estudianteId: string;
  ofertaId: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string;
  estudiante?: EstudianteDTO;
  oferta?: OfertaAcademicaDTO;
}

// ─── DTOs de Evaluacion / Nota ─────────────────────────

export interface EvaluacionDTO {
  id: string;
  ofertaId: string;
  titulo: string;
  descripcion: string | null;
  tipoEvaluacion: TipoEvaluacion;
  peso: number;
  puntajeMaximo: number;
  fecha: string | null;
  publicada: boolean;
  editableHasta: string | null;
}

export interface NotaDTO {
  id: string;
  evaluacionId: string;
  estudianteId: string;
  valor: number;
  observacion: string | null;
  evaluacion?: EvaluacionDTO;
}

// ─── DTOs de Pago ──────────────────────────────────────

export interface PagoDTO {
  id: string;
  estudianteId: string;
  periodoId: string;
  monto: number;
  concepto: string | null;
  referencia: string;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  fechaPago: string | null;
}

// ─── DTOs de Recurso_Materia ───────────────────────────

export interface RecursoMateriaDTO {
  id: string;
  ofertaId: string;
  titulo: string;
  descripcion: string | null;
  tipoRecurso: TipoRecurso;
  urlRecurso: string;
  publicado: boolean;
}

// ─── DTOs de Calendario ────────────────────────────────

export interface CalendarioAcademicoDTO {
  id: string;
  periodoId: string;
  titulo: string;
  descripcion: string | null;
  tipoEvento: TipoEvento;
  fechaInicio: string;
  fechaFin: string | null;
}

// ─── DTOs de Auditoria ─────────────────────────────────

export interface AuditoriaDTO {
  id: string;
  perfilId: string;
  accion: string;
  entidad: string;
  entidadId: string | null;
  detalle: unknown;
  direccionIp: string | null;
  createdAt: string;
}

// ─── Payloads de API ───────────────────────────────────

export interface CSVUploadResult {
  filasProcesadas: number;
  filasConError: number;
  errores: Array<{ fila: number; mensaje: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: unknown;
}
