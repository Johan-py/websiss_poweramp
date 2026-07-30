import type {
  Estudiante,
  Docente,
  Carrera,
  Materia,
  OfertaAcademica,
  Inscripcion,
  Periodo,
  Pago,
} from "@/types";

const carreras: Carrera[] = [
  { id: "1", codigo: "ISC", nombre: "Ingeniería en Sistemas Computacionales", duracionAnios: 4, creditosTotales: 240, estado: "activo", createdAt: "2024-01-01" },
  { id: "2", codigo: "IEM", nombre: "Ingeniería Eléctrica y Mecánica", duracionAnios: 5, creditosTotales: 300, estado: "activo", createdAt: "2024-01-01" },
  { id: "3", codigo: "IIC", nombre: "Ingeniería en Industrias Alimentarias", duracionAnios: 4, creditosTotales: 240, estado: "activo", createdAt: "2024-01-01" },
  { id: "4", codigo: "IAG", nombre: "Ingeniería Agrónoma", duracionAnios: 5, creditosTotales: 300, estado: "activo", createdAt: "2024-01-01" },
  { id: "5", codigo: "LDC", nombre: "Licenciatura en Derecho", duracionAnios: 4, creditosTotales: 240, estado: "activo", createdAt: "2024-01-01" },
];

const docentes: Docente[] = [
  { id: "1", cedula: "001-010101-0001A", nombres: "Carlos", apellidos: "Mendoza López", email: "cmendoza@universidad.edu.ni", telefono: "5555-1234", especialidad: "Matemáticas", estado: "activo", createdAt: "2024-01-01" },
  { id: "2", cedula: "001-020202-0002B", nombres: "María", apellidos: "García Ruiz", email: "mgarcia@universidad.edu.ni", telefono: "5555-5678", especialidad: "Programación", estado: "activo", createdAt: "2024-01-01" },
  { id: "3", cedula: "001-030303-0003C", nombres: "José", apellidos: "Martínez Silva", email: "jmartinez@universidad.edu.ni", telefono: "5555-9012", especialidad: "Bases de Datos", estado: "activo", createdAt: "2024-01-01" },
  { id: "4", cedula: "001-040404-0004D", nombres: "Ana", apellidos: "López Torres", email: "alopez@universidad.edu.ni", telefono: "5555-3456", especialidad: "Redes", estado: "activo", createdAt: "2024-01-01" },
  { id: "5", cedula: "001-050505-0005E", nombres: "Pedro", apellidos: "Ramírez Vega", email: "pramirez@universidad.edu.ni", telefono: "5555-7890", especialidad: "Inteligencia Artificial", estado: "activo", createdAt: "2024-01-01" },
  { id: "6", cedula: "001-060606-0006F", nombres: "Laura", apellidos: "Hernández Cruz", email: "lhernandez@universidad.edu.ni", telefono: "5555-2345", especialidad: "Derecho Civil", estado: "activo", createdAt: "2024-01-01" },
];

const materias: Materia[] = [
  { id: "1", codigo: "MAT101", nombre: "Álgebra Lineal", creditos: 4, horasSemana: 4, estado: "activo", createdAt: "2024-01-01" },
  { id: "2", codigo: "PRO102", nombre: "Programación I", creditos: 5, horasSemana: 5, estado: "activo", createdAt: "2024-01-01" },
  { id: "3", codigo: "BDD201", nombre: "Bases de Datos I", creditos: 4, horasSemana: 4, estado: "activo", createdAt: "2024-01-01" },
  { id: "4", codigo: "RED301", nombre: "Redes de Computadoras", creditos: 4, horasSemana: 4, estado: "activo", createdAt: "2024-01-01" },
  { id: "5", codigo: "IA401", nombre: "Introducción a IA", creditos: 3, horasSemana: 3, estado: "activo", createdAt: "2024-01-01" },
  { id: "6", codigo: "DER101", nombre: "Derecho Constitucional", creditos: 4, horasSemana: 4, estado: "activo", createdAt: "2024-01-01" },
  { id: "7", codigo: "MAT201", nombre: "Cálculo Diferencial", creditos: 5, horasSemana: 5, estado: "activo", createdAt: "2024-01-01" },
  { id: "8", codigo: "PRO202", nombre: "Programación II", creditos: 5, horasSemana: 5, estado: "activo", createdAt: "2024-01-01" },
];

const periodos: Periodo[] = [
  { id: "1", nombre: "2025-1", año: 2025, fechaInicio: "2025-02-01", fechaFin: "2025-06-30", activo: false },
  { id: "2", nombre: "2025-2", año: 2025, fechaInicio: "2025-08-01", fechaFin: "2025-12-15", activo: false },
  { id: "3", nombre: "2026-1", año: 2026, fechaInicio: "2026-02-01", fechaFin: "2026-06-30", activo: true },
];

const ofertas: OfertaAcademica[] = [
  { id: "1", materia: materias[0], docente: docentes[0], periodo: "2026-1", cupoMaximo: 40, cupoActual: 32, horario: "Lun-Mié 08:00-10:00", aula: "A-101", estado: "abierta", createdAt: "2026-01-15" },
  { id: "2", materia: materias[1], docente: docentes[1], periodo: "2026-1", cupoMaximo: 35, cupoActual: 35, horario: "Mar-Jue 10:00-12:00", aula: "LAB-01", estado: "completa", createdAt: "2026-01-15" },
  { id: "3", materia: materias[2], docente: docentes[2], periodo: "2026-1", cupoMaximo: 40, cupoActual: 28, horario: "Lun-Mié 14:00-16:00", aula: "A-203", estado: "abierta", createdAt: "2026-01-15" },
  { id: "4", materia: materias[3], docente: docentes[3], periodo: "2026-1", cupoMaximo: 30, cupoActual: 30, horario: "Mar-Jue 08:00-10:00", aula: "LAB-03", estado: "completa", createdAt: "2026-01-15" },
  { id: "5", materia: materias[4], docente: docentes[4], periodo: "2026-1", cupoMaximo: 25, cupoActual: 18, horario: "Vie 08:00-12:00", aula: "A-105", estado: "abierta", createdAt: "2026-01-15" },
  { id: "6", materia: materias[5], docente: docentes[5], periodo: "2026-1", cupoMaximo: 45, cupoActual: 40, horario: "Lun-Mié 16:00-18:00", aula: "A-301", estado: "abierta", createdAt: "2026-01-15" },
  { id: "7", materia: materias[6], docente: docentes[0], periodo: "2026-1", cupoMaximo: 35, cupoActual: 22, horario: "Mar-Jue 14:00-16:00", aula: "A-102", estado: "abierta", createdAt: "2026-01-15" },
  { id: "8", materia: materias[7], docente: docentes[1], periodo: "2026-1", cupoMaximo: 30, cupoActual: 15, horario: "Lun-Mié 10:00-12:00", aula: "LAB-02", estado: "abierta", createdAt: "2026-01-15" },
];

const estudiantes: Estudiante[] = [
  { id: "1", cedula: "001-123456-0001U", nombres: "Juan", apellidos: "Pérez López", email: "jperez@est.edu.ni", telefono: "8888-1111", estado: "activo", carrera: carreras[0], createdAt: "2024-02-01" },
  { id: "2", cedula: "001-234567-0002U", nombres: "María", apellidos: "García Hernández", email: "mgarcia@est.edu.ni", telefono: "8888-2222", estado: "activo", carrera: carreras[0], createdAt: "2024-02-01" },
  { id: "3", cedula: "001-345678-0003U", nombres: "Carlos", apellidos: "Martínez Ruiz", email: "cmartinez@est.edu.ni", telefono: "8888-3333", estado: "activo", carrera: carreras[1], createdAt: "2024-02-01" },
  { id: "4", cedula: "001-456789-0004U", nombres: "Ana", apellidos: "López Torres", email: "alopez@est.edu.ni", telefono: "8888-4444", estado: "activo", carrera: carreras[0], createdAt: "2024-02-01" },
  { id: "5", cedula: "001-567890-0005U", nombres: "Pedro", apellidos: "Ramírez Vega", email: "pramirez@est.edu.ni", telefono: "8888-5555", estado: "activo", carrera: carreras[2], createdAt: "2024-02-01" },
  { id: "6", cedula: "001-678901-0006U", nombres: "Laura", apellidos: "Hernández Cruz", email: "lhernandez@est.edu.ni", telefono: "8888-6666", estado: "inactivo", carrera: carreras[4], createdAt: "2024-02-01" },
  { id: "7", cedula: "001-789012-0007U", nombres: "Diego", apellidos: "Torres Medina", email: "dtorres@est.edu.ni", telefono: "8888-7777", estado: "activo", carrera: carreras[3], createdAt: "2024-02-01" },
  { id: "8", cedula: "001-890123-0008U", nombres: "Sofía", apellidos: "Castro Rivas", email: "scastro@est.edu.ni", telefono: "8888-8888", estado: "activo", carrera: carreras[0], createdAt: "2024-02-01" },
  { id: "9", cedula: "001-901234-0009U", nombres: "Andrés", apellidos: "Mendoza Silva", email: "amendoza@est.edu.ni", telefono: "8888-9999", estado: "graduado", carrera: carreras[0], createdAt: "2023-02-01" },
  { id: "10", cedula: "001-012345-0010U", nombres: "Valentina", apellidos: "Paredes Ortiz", email: "vparedes@est.edu.ni", telefono: "8888-0000", estado: "activo", carrera: carreras[1], createdAt: "2024-02-01" },
];

const inscripciones: Inscripcion[] = [
  { id: "1", estudiante: estudiantes[0], oferta: ofertas[0], fechaInscripcion: "2026-02-01", estado: "activa", nota: undefined, createdAt: "2026-02-01" },
  { id: "2", estudiante: estudiantes[0], oferta: ofertas[2], fechaInscripcion: "2026-02-01", estado: "activa", nota: undefined, createdAt: "2026-02-01" },
  { id: "3", estudiante: estudiantes[1], oferta: ofertas[0], fechaInscripcion: "2026-02-01", estado: "activa", nota: undefined, createdAt: "2026-02-01" },
  { id: "4", estudiante: estudiantes[1], oferta: ofertas[1], fechaInscripcion: "2026-02-01", estado: "activa", nota: undefined, createdAt: "2026-02-01" },
  { id: "5", estudiante: estudiantes[2], oferta: ofertas[5], fechaInscripcion: "2026-02-01", estado: "activa", nota: undefined, createdAt: "2026-02-01" },
  { id: "6", estudiante: estudiantes[0], oferta: ofertas[6], fechaInscripcion: "2025-08-01", estado: "completada", nota: 92, createdAt: "2025-08-01" },
  { id: "7", estudiante: estudiantes[0], oferta: ofertas[0], fechaInscripcion: "2025-08-01", estado: "completada", nota: 85, createdAt: "2025-08-01" },
  { id: "8", estudiante: estudiantes[0], oferta: ofertas[2], fechaInscripcion: "2025-02-01", estado: "completada", nota: 78, createdAt: "2025-02-01" },
  { id: "9", estudiante: estudiantes[0], oferta: ofertas[7], fechaInscripcion: "2025-02-01", estado: "completada", nota: 90, createdAt: "2025-02-01" },
  { id: "10", estudiante: estudiantes[0], oferta: ofertas[1], fechaInscripcion: "2024-08-01", estado: "completada", nota: 88, createdAt: "2024-08-01" },
];

const pagos: Pago[] = [
  { id: "1", estudiante: estudiantes[0], concepto: "Matrícula 2026-1", monto: 2500, fecha: "2026-01-15", estado: "pagado" },
  { id: "2", estudiante: estudiantes[1], concepto: "Matrícula 2026-1", monto: 2500, fecha: "2026-01-20", estado: "pagado" },
  { id: "3", estudiante: estudiantes[2], concepto: "Matrícula 2026-1", monto: 2500, fecha: "2026-02-01", estado: "pendiente" },
  { id: "4", estudiante: estudiantes[0], concepto: "Mensualidad Enero", monto: 1500, fecha: "2026-01-30", estado: "pagado" },
  { id: "5", estudiante: estudiantes[1], concepto: "Mensualidad Enero", monto: 1500, fecha: "2026-02-05", estado: "vencido" },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCarreras(): Promise<Carrera[]> {
  await delay(200);
  return carreras;
}

export async function getDocentes(): Promise<Docente[]> {
  await delay(200);
  return docentes;
}

export async function getMaterias(): Promise<Materia[]> {
  await delay(200);
  return materias;
}

export async function getOfertasAcademicas(): Promise<OfertaAcademica[]> {
  await delay(200);
  return ofertas;
}

export async function getEstudiantes(): Promise<Estudiante[]> {
  await delay(200);
  return estudiantes;
}

export async function getInscripciones(): Promise<Inscripcion[]> {
  await delay(200);
  return inscripciones;
}

export async function getPagos(): Promise<Pago[]> {
  await delay(200);
  return pagos;
}

export async function getPeriodos(): Promise<Periodo[]> {
  await delay(200);
  return periodos;
}

export async function getEstadisticas() {
  await delay(300);
  return {
    totalEstudiantes: estudiantes.filter((e) => e.estado === "activo").length,
    totalDocentes: docentes.filter((d) => d.estado === "activo").length,
    ofertasActivas: ofertas.filter((o) => o.estado === "abierta").length,
    ingresosPeriodo: 125000,
    estudiantesPorCarrera: [
      { nombre: "ISC", cantidad: 4 },
      { nombre: "IEM", cantidad: 2 },
      { nombre: "IIC", cantidad: 1 },
      { nombre: "IAG", cantidad: 1 },
      { nombre: "Derecho", cantidad: 1 },
    ],
    inscripcionesMes: 45,
    pagosPendientes: 12,
    creditosPromedio: 18.5,
  };
}

export async function getKardex(estudianteId: string) {
  await delay(300);
  const est = estudiantes.find((e) => e.id === estudianteId) ?? estudiantes[0];
  const estInscripciones = inscripciones.filter((i) => i.estudiante.id === estudianteId);

  const grupos = estInscripciones.reduce(
    (acc, ins) => {
      const periodo = ins.oferta.periodo;
      if (!acc[periodo]) acc[periodo] = [];
      acc[periodo].push(ins);
      return acc;
    },
    {} as Record<string, Inscripcion[]>,
  );

  const periodosKardex = Object.entries(grupos).map(([periodo, inscs]) => {
    const notas = inscs
      .filter((i) => i.nota != null)
      .map((i) => ({ credito: i.oferta.materia.creditos, nota: i.nota! }));
    const totalCreditos = inscs.reduce((s, i) => s + i.oferta.materia.creditos, 0);
    const creditosAprobados = inscs
      .filter((i) => i.nota != null && i.nota >= 60)
      .reduce((s, i) => s + i.oferta.materia.creditos, 0);
    const promedio =
      notas.length > 0
        ? notas.reduce((s, n) => s + n.nota, 0) / notas.length
        : 0;
    const sumPonderada = notas.reduce((s, n) => s + n.credito * n.nota, 0);
    const promedioPonderado = sumPonderada / (notas.length > 0 ? notas.reduce((s, n) => s + n.credito, 0) : 1);

    return {
      periodo,
      materias: inscs.map((i) => ({
        materia: i.oferta.materia.nombre,
        docente: `${i.oferta.docente.nombres} ${i.oferta.docente.apellidos}`,
        nota: i.nota,
        estado: i.estado,
        creditos: i.oferta.materia.creditos,
        codigo: i.oferta.materia.codigo,
      })),
      totalCreditos,
      creditosAprobados,
      promedio: Math.round(promedio * 100) / 100,
      promedioPonderado: Math.round(promedioPonderado * 100) / 100,
    };
  });

  const todasLasNotas = estInscripciones
    .filter((i) => i.nota != null)
    .map((i) => ({ credito: i.oferta.materia.creditos, nota: i.nota! }));
  const promedioGlobal =
    todasLasNotas.length > 0
      ? todasLasNotas.reduce((s, n) => s + n.nota, 0) / todasLasNotas.length
      : 0;
  const sumPonderadaGlobal = todasLasNotas.reduce((s, n) => s + n.credito * n.nota, 0);
  const totalCreds = todasLasNotas.reduce((s, n) => s + n.credito, 0);
  const promedioPonderadoGlobal =
    totalCreds > 0 ? sumPonderadaGlobal / totalCreds : 0;
  const creditosAprobadosGlobal = estInscripciones
    .filter((i) => i.nota != null && i.nota >= 60)
    .reduce((s, i) => s + i.oferta.materia.creditos, 0);
  const creditosTotalesGlobal = estInscripciones.reduce(
    (s, i) => s + i.oferta.materia.creditos,
    0,
  );

  return {
    estudiante: est,
    periodos: periodosKardex,
    promedioGlobal: Math.round(promedioGlobal * 100) / 100,
    promedioPonderadoGlobal: Math.round(promedioPonderadoGlobal * 100) / 100,
    creditosAprobados: creditosAprobadosGlobal,
    creditosTotales: creditosTotalesGlobal,
    avance: Math.round((creditosAprobadosGlobal / 240) * 100),
  };
}

export async function getEstudianteById(id: string): Promise<Estudiante | undefined> {
  await delay(100);
  return estudiantes.find((e) => e.id === id);
}
