export interface Estudiante {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  estado: "activo" | "inactivo" | "graduado" | "suspendido";
  carrera?: Carrera;
  createdAt: string;
}

export interface Docente {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  estado: "activo" | "inactivo";
  createdAt: string;
}

export interface Carrera {
  id: string;
  codigo: string;
  nombre: string;
  duracionAnios: number;
  creditosTotales: number;
  estado: "activo" | "inactivo";
  createdAt: string;
}

export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  horasSemana: number;
  carrera?: Carrera;
  estado: "activo" | "inactivo";
  createdAt: string;
}

export interface OfertaAcademica {
  id: string;
  materia: Materia;
  docente: Docente;
  periodo: string;
  cupoMaximo: number;
  cupoActual: number;
  horario: string;
  aula: string;
  estado: "abierta" | "cerrada" | "completa";
  createdAt: string;
}

export interface Inscripcion {
  id: string;
  estudiante: Estudiante;
  oferta: OfertaAcademica;
  fechaInscripcion: string;
  estado: "activa" | "cancelada" | "completada";
  nota?: number;
  createdAt: string;
}

export interface Periodo {
  id: string;
  nombre: string;
  año: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface Nota {
  id: string;
  inscripcion: Inscripcion;
  calificacion: number;
  tipo: "parcial1" | "parcial2" | "final" | "recuperacion";
  fecha: string;
  observacion?: string;
}

export interface Pago {
  id: string;
  estudiante: Estudiante;
  concepto: string;
  monto: number;
  fecha: string;
  estado: "pendiente" | "pagado" | "vencido" | "cancelado";
  comprobante?: string;
}
