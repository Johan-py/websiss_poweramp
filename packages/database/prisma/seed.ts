import { PrismaClient, Rol, Modalidad, TipoAula, TipoRecurso, TipoEvaluacion, EstadoInscripcion, MetodoPago, EstadoPago, TipoEvento } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🧹 Limpiando base de datos...');
  
  // Eliminar en orden inverso para respetar las relaciones
  await prisma.$executeRaw`TRUNCATE TABLE "notas" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "evaluaciones" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "recursos_materia" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "inscripciones" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "pagos" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "calendario_academico" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "ofertas_academicas" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "prerrequisitos" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "materias" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "estudiantes" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "docentes" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "aulas" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "periodos" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "carreras" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "auditoria" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "perfiles" RESTART IDENTITY CASCADE;`;
  
  console.log('✅ Base de datos limpiada');
}

async function main() {
  console.log('🌱 Iniciando seeding...');

  // Limpiar la base de datos primero
  await clearDatabase();

  // ============================================
  // 1. CREAR PERFILES
  // ============================================
  console.log('📝 Creando perfiles...');

  const perfilesData = [
    {
      email: 'admin@universidad.edu',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      cedula: '1234567890',
      telefono: '0999123456',
      direccion: 'Quito, Av. Amazonas',
      rol: Rol.ADMIN,
      activo: true,
    },
    {
      email: 'coordinador@universidad.edu',
      nombre: 'María',
      apellido: 'González',
      cedula: '0987654321',
      telefono: '0999765432',
      direccion: 'Guayaquil, Av. 9 de Octubre',
      rol: Rol.COORDINADOR,
      activo: true,
    },
    {
      email: 'docente1@universidad.edu',
      nombre: 'Pedro',
      apellido: 'Martínez',
      cedula: '1122334455',
      telefono: '0999556677',
      direccion: 'Cuenca, Av. Solano',
      rol: Rol.DOCENTE,
      activo: true,
    },
    {
      email: 'docente2@universidad.edu',
      nombre: 'Ana',
      apellido: 'López',
      cedula: '2233445566',
      telefono: '0999887766',
      direccion: 'Quito, Av. 6 de Diciembre',
      rol: Rol.DOCENTE,
      activo: true,
    },
    {
      email: 'docente3@universidad.edu',
      nombre: 'Roberto',
      apellido: 'Sánchez',
      cedula: '3344556677',
      telefono: '0999775544',
      direccion: 'Manta, Av. Malecón',
      rol: Rol.DOCENTE,
      activo: true,
    },
    {
      email: 'estudiante1@universidad.edu',
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '4455667788',
      telefono: '0999223344',
      direccion: 'Quito, La Floresta',
      rol: Rol.ESTUDIANTE,
      activo: true,
    },
    {
      email: 'estudiante2@universidad.edu',
      nombre: 'Laura',
      apellido: 'Gómez',
      cedula: '5566778899',
      telefono: '0999009988',
      direccion: 'Guayaquil, Urdesa',
      rol: Rol.ESTUDIANTE,
      activo: true,
    },
    {
      email: 'estudiante3@universidad.edu',
      nombre: 'Andrés',
      apellido: 'Mendoza',
      cedula: '6677889900',
      telefono: '0999332211',
      direccion: 'Cuenca, El Vergel',
      rol: Rol.ESTUDIANTE,
      activo: true,
    },
    {
      email: 'estudiante4@universidad.edu',
      nombre: 'Sofía',
      apellido: 'Ramírez',
      cedula: '7788990011',
      telefono: '0999445566',
      direccion: 'Quito, Carolina',
      rol: Rol.ESTUDIANTE,
      activo: true,
    },
  ];

  const perfiles = [];
  for (const data of perfilesData) {
    const perfil = await prisma.perfil.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
    perfiles.push(perfil);
  }

  // ============================================
  // 2. CREAR CARRERAS
  // ============================================
  console.log('📚 Creando carreras...');

  const carrerasData = [
    {
      codigo: 'ING-SIS',
      nombre: 'Ingeniería en Sistemas',
      descripcion: 'Formación en desarrollo de software y sistemas informáticos',
      modalidad: Modalidad.PRESENCIAL,
      duracionSemestres: 10,
      activo: true,
    },
    {
      codigo: 'ING-CIV',
      nombre: 'Ingeniería Civil',
      descripcion: 'Formación en infraestructura y construcción',
      modalidad: Modalidad.PRESENCIAL,
      duracionSemestres: 10,
      activo: true,
    },
    {
      codigo: 'ADM-EMP',
      nombre: 'Administración de Empresas',
      descripcion: 'Formación en gestión empresarial y liderazgo',
      modalidad: Modalidad.SEMIPRESENCIAL,
      duracionSemestres: 8,
      activo: true,
    },
    {
      codigo: 'PSIC-ORG',
      nombre: 'Psicología Organizacional',
      descripcion: 'Formación en psicología aplicada a organizaciones',
      modalidad: Modalidad.VIRTUAL,
      duracionSemestres: 8,
      activo: true,
    },
  ];

  const carreras = [];
  for (const data of carrerasData) {
    const carrera = await prisma.carrera.upsert({
      where: { codigo: data.codigo },
      update: data,
      create: data,
    });
    carreras.push(carrera);
  }

  // ============================================
  // 3. CREAR ESTUDIANTES
  // ============================================
  console.log('🎓 Creando estudiantes...');

  const perfilesEstudiantes = perfiles.filter(p => p.rol === Rol.ESTUDIANTE);
  const estudiantesData = [
    {
      perfilId: perfilesEstudiantes[0].id,
      carreraId: carreras.find(c => c.codigo === 'ING-SIS')!.id,
      codigoEstudiante: 'E001',
      fechaIngreso: new Date('2024-03-01'),
    },
    {
      perfilId: perfilesEstudiantes[1].id,
      carreraId: carreras.find(c => c.codigo === 'ADM-EMP')!.id,
      codigoEstudiante: 'E002',
      fechaIngreso: new Date('2024-03-01'),
    },
    {
      perfilId: perfilesEstudiantes[2].id,
      carreraId: carreras.find(c => c.codigo === 'ING-SIS')!.id,
      codigoEstudiante: 'E003',
      fechaIngreso: new Date('2024-03-01'),
    },
    {
      perfilId: perfilesEstudiantes[3].id,
      carreraId: carreras.find(c => c.codigo === 'PSIC-ORG')!.id,
      codigoEstudiante: 'E004',
      fechaIngreso: new Date('2024-03-01'),
    },
  ];

  const estudiantes = [];
  for (const data of estudiantesData) {
    const estudiante = await prisma.estudiante.upsert({
      where: { codigoEstudiante: data.codigoEstudiante },
      update: data,
      create: data,
    });
    estudiantes.push(estudiante);
  }

  // ============================================
  // 4. CREAR DOCENTES
  // ============================================
  console.log('👨‍🏫 Creando docentes...');

  const perfilesDocentes = perfiles.filter(p => p.rol === Rol.DOCENTE);
  const docentesData = [
    {
      perfilId: perfilesDocentes[0].id,
      codigoDocente: 'D001',
      especialidad: 'Bases de Datos, Programación, Desarrollo Web',
    },
    {
      perfilId: perfilesDocentes[1].id,
      codigoDocente: 'D002',
      especialidad: 'Redes, Sistemas Operativos, Seguridad Informática',
    },
    {
      perfilId: perfilesDocentes[2].id,
      codigoDocente: 'D003',
      especialidad: 'Matemáticas, Estadística, Investigación de Operaciones',
    },
  ];

  const docentes = [];
  for (const data of docentesData) {
    const docente = await prisma.docente.upsert({
      where: { codigoDocente: data.codigoDocente },
      update: data,
      create: data,
    });
    docentes.push(docente);
  }

  // ============================================
  // 5. CREAR MATERIAS
  // ============================================
  console.log('📖 Creando materias...');

  const ingenieriaSistemas = carreras.find(c => c.codigo === 'ING-SIS')!;
  const administracion = carreras.find(c => c.codigo === 'ADM-EMP')!;
  const psicologia = carreras.find(c => c.codigo === 'PSIC-ORG')!;

  const materiasData = [
    // Ingeniería en Sistemas - Primer ciclo
    {
      carreraId: ingenieriaSistemas.id,
      codigo: 'MAT-101',
      nombre: 'Matemáticas I',
      descripcion: 'Fundamentos de matemáticas, álgebra y geometría',
      creditos: 4,
      horasTeoricas: 4,
      horasPracticas: 2,
      ciclo: 1,
      activo: true,
    },
    {
      carreraId: ingenieriaSistemas.id,
      codigo: 'PROG-101',
      nombre: 'Programación I',
      descripcion: 'Fundamentos de programación con Python',
      creditos: 4,
      horasTeoricas: 2,
      horasPracticas: 4,
      ciclo: 1,
      activo: true,
    },
    {
      carreraId: ingenieriaSistemas.id,
      codigo: 'LOG-101',
      nombre: 'Lógica Computacional',
      descripcion: 'Lógica proposicional y de predicados',
      creditos: 3,
      horasTeoricas: 3,
      horasPracticas: 0,
      ciclo: 1,
      activo: true,
    },
    // Ingeniería en Sistemas - Segundo ciclo
    {
      carreraId: ingenieriaSistemas.id,
      codigo: 'MAT-102',
      nombre: 'Matemáticas II',
      descripcion: 'Cálculo diferencial e integral',
      creditos: 4,
      horasTeoricas: 4,
      horasPracticas: 2,
      ciclo: 2,
      activo: true,
    },
    {
      carreraId: ingenieriaSistemas.id,
      codigo: 'PROG-102',
      nombre: 'Programación II',
      descripcion: 'Programación orientada a objetos en Java',
      creditos: 4,
      horasTeoricas: 2,
      horasPracticas: 4,
      ciclo: 2,
      activo: true,
    },
    {
      carreraId: ingenieriaSistemas.id,
      codigo: 'BD-101',
      nombre: 'Bases de Datos I',
      descripcion: 'Fundamentos de bases de datos y SQL',
      creditos: 4,
      horasTeoricas: 3,
      horasPracticas: 3,
      ciclo: 2,
      activo: true,
    },
    // Administración de Empresas
    {
      carreraId: administracion.id,
      codigo: 'ADM-101',
      nombre: 'Administración General',
      descripcion: 'Principios de administración y gestión empresarial',
      creditos: 3,
      horasTeoricas: 3,
      horasPracticas: 0,
      ciclo: 1,
      activo: true,
    },
    {
      carreraId: administracion.id,
      codigo: 'ADM-102',
      nombre: 'Marketing Estratégico',
      descripcion: 'Estrategias de marketing y posicionamiento de marca',
      creditos: 3,
      horasTeoricas: 3,
      horasPracticas: 2,
      ciclo: 2,
      activo: true,
    },
    {
      carreraId: administracion.id,
      codigo: 'FIN-101',
      nombre: 'Finanzas Corporativas',
      descripcion: 'Fundamentos de finanzas y análisis financiero',
      creditos: 4,
      horasTeoricas: 4,
      horasPracticas: 2,
      ciclo: 2,
      activo: true,
    },
    // Psicología Organizacional
    {
      carreraId: psicologia.id,
      codigo: 'PSIC-101',
      nombre: 'Psicología General',
      descripcion: 'Fundamentos de psicología y comportamiento humano',
      creditos: 3,
      horasTeoricas: 3,
      horasPracticas: 0,
      ciclo: 1,
      activo: true,
    },
    {
      carreraId: psicologia.id,
      codigo: 'PSIC-102',
      nombre: 'Psicología Organizacional',
      descripcion: 'Comportamiento organizacional y liderazgo',
      creditos: 4,
      horasTeoricas: 3,
      horasPracticas: 2,
      ciclo: 2,
      activo: true,
    },
  ];

  const materias = [];
  for (const data of materiasData) {
    const materia = await prisma.materia.upsert({
      where: { codigo: data.codigo },
      update: data,
      create: data,
    });
    materias.push(materia);
  }

  // ============================================
  // 6. CREAR PRERREQUISITOS
  // ============================================
  console.log('🔗 Creando prerrequisitos...');

  const mat101 = materias.find(m => m.codigo === 'MAT-101')!;
  const mat102 = materias.find(m => m.codigo === 'MAT-102')!;
  const prog101 = materias.find(m => m.codigo === 'PROG-101')!;
  const prog102 = materias.find(m => m.codigo === 'PROG-102')!;

  await prisma.prerrequisito.upsert({
    where: {
      materiaId_materiaRequisitoId: {
        materiaId: mat102.id,
        materiaRequisitoId: mat101.id,
      },
    },
    update: {},
    create: {
      materiaId: mat102.id,
      materiaRequisitoId: mat101.id,
    },
  });

  await prisma.prerrequisito.upsert({
    where: {
      materiaId_materiaRequisitoId: {
        materiaId: prog102.id,
        materiaRequisitoId: prog101.id,
      },
    },
    update: {},
    create: {
      materiaId: prog102.id,
      materiaRequisitoId: prog101.id,
    },
  });

  // ============================================
  // 7. CREAR AULAS
  // ============================================
  console.log('🏛️ Creando aulas...');

  const aulasData = [
    {
      codigo: 'A-101',
      nombre: 'Aula 101',
      capacidad: 40,
      tipo: TipoAula.AULA,
      ubicacion: 'Edificio A, Piso 1',
      disponible: true,
    },
    {
      codigo: 'A-102',
      nombre: 'Aula 102',
      capacidad: 35,
      tipo: TipoAula.AULA,
      ubicacion: 'Edificio A, Piso 1',
      disponible: true,
    },
    {
      codigo: 'L-201',
      nombre: 'Laboratorio de Computación 1',
      capacidad: 30,
      tipo: TipoAula.LABORATORIO,
      ubicacion: 'Edificio B, Piso 2',
      disponible: true,
    },
    {
      codigo: 'L-202',
      nombre: 'Laboratorio de Computación 2',
      capacidad: 25,
      tipo: TipoAula.LABORATORIO,
      ubicacion: 'Edificio B, Piso 2',
      disponible: true,
    },
    {
      codigo: 'T-301',
      nombre: 'Taller de Electrónica',
      capacidad: 20,
      tipo: TipoAula.TALLER,
      ubicacion: 'Edificio C, Piso 3',
      disponible: true,
    },
    {
      codigo: 'AUD-501',
      nombre: 'Auditorio Principal',
      capacidad: 120,
      tipo: TipoAula.AUDITORIO,
      ubicacion: 'Edificio D, Piso 5',
      disponible: true,
    },
  ];

  const aulas = [];
  for (const data of aulasData) {
    const aula = await prisma.aula.upsert({
      where: { codigo: data.codigo },
      update: data,
      create: data,
    });
    aulas.push(aula);
  }

  // ============================================
  // 8. CREAR PERIODOS
  // ============================================
  console.log('📅 Creando periodos...');

  const periodosData = [
    {
      codigo: '2024-1',
      nombre: 'Primer Semestre 2024',
      fechaInicio: new Date('2024-03-01T08:00:00'),
      fechaFin: new Date('2024-07-15T18:00:00'),
      activo: true,
    },
    {
      codigo: '2024-2',
      nombre: 'Segundo Semestre 2024',
      fechaInicio: new Date('2024-08-01T08:00:00'),
      fechaFin: new Date('2024-12-15T18:00:00'),
      activo: false,
    },
  ];

  const periodos = [];
  for (const data of periodosData) {
    const periodo = await prisma.periodo.upsert({
      where: { codigo: data.codigo },
      update: data,
      create: data,
    });
    periodos.push(periodo);
  }

  // ============================================
  // 9. CREAR OFERTAS ACADÉMICAS
  // ============================================
  console.log('📋 Creando ofertas académicas...');

  const periodoActivo = periodos.find(p => p.activo === true)!;
  const aula101 = aulas.find(a => a.codigo === 'A-101')!;
  const aula102 = aulas.find(a => a.codigo === 'A-102')!;
  const laboratorio201 = aulas.find(a => a.codigo === 'L-201')!;
  const laboratorio202 = aulas.find(a => a.codigo === 'L-202')!;
  const docenteD001 = docentes.find(d => d.codigoDocente === 'D001')!;
  const docenteD002 = docentes.find(d => d.codigoDocente === 'D002')!;
  const docenteD003 = docentes.find(d => d.codigoDocente === 'D003')!;

  // Obtener materias por código
  const getMateriaByCodigo = (codigo: string) => materias.find(m => m.codigo === codigo)!;

  const ofertasData = [
    {
      materiaId: getMateriaByCodigo('MAT-101').id,
      docenteId: docenteD003.id,
      aulaId: aula101.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 40,
      cupoDisponible: 38,
      seccion: 'A',
      horario: { dia: 'LUNES', hora_inicio: '08:00', hora_fin: '10:00' },
      modalidad: Modalidad.PRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('PROG-101').id,
      docenteId: docenteD001.id,
      aulaId: laboratorio201.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 30,
      cupoDisponible: 28,
      seccion: 'A',
      horario: { dia: 'MARTES', hora_inicio: '10:00', hora_fin: '12:00' },
      modalidad: Modalidad.PRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('LOG-101').id,
      docenteId: docenteD003.id,
      aulaId: aula102.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 35,
      cupoDisponible: 33,
      seccion: 'A',
      horario: { dia: 'MIÉRCOLES', hora_inicio: '08:00', hora_fin: '09:30' },
      modalidad: Modalidad.PRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('MAT-102').id,
      docenteId: docenteD003.id,
      aulaId: aula101.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 40,
      cupoDisponible: 40,
      seccion: 'A',
      horario: { dia: 'JUEVES', hora_inicio: '10:00', hora_fin: '12:00' },
      modalidad: Modalidad.PRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('PROG-102').id,
      docenteId: docenteD001.id,
      aulaId: laboratorio202.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 25,
      cupoDisponible: 25,
      seccion: 'A',
      horario: { dia: 'VIERNES', hora_inicio: '14:00', hora_fin: '16:00' },
      modalidad: Modalidad.PRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('BD-101').id,
      docenteId: docenteD001.id,
      aulaId: laboratorio201.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 30,
      cupoDisponible: 30,
      seccion: 'A',
      horario: { dia: 'LUNES', hora_inicio: '14:00', hora_fin: '16:00' },
      modalidad: Modalidad.PRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('ADM-101').id,
      docenteId: docenteD002.id,
      aulaId: aula102.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 35,
      cupoDisponible: 34,
      seccion: 'A',
      horario: { dia: 'MARTES', hora_inicio: '14:00', hora_fin: '16:00' },
      modalidad: Modalidad.SEMIPRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('ADM-102').id,
      docenteId: docenteD002.id,
      aulaId: aula102.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 35,
      cupoDisponible: 35,
      seccion: 'A',
      horario: { dia: 'JUEVES', hora_inicio: '14:00', hora_fin: '16:00' },
      modalidad: Modalidad.SEMIPRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('FIN-101').id,
      docenteId: docenteD002.id,
      aulaId: aula101.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 30,
      cupoDisponible: 30,
      seccion: 'A',
      horario: { dia: 'VIERNES', hora_inicio: '10:00', hora_fin: '12:00' },
      modalidad: Modalidad.SEMIPRESENCIAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('PSIC-101').id,
      docenteId: docenteD001.id,
      aulaId: aula101.id,
      periodoId: periodoActivo.id,
      cupoMaximo: 30,
      cupoDisponible: 28,
      seccion: 'A',
      horario: { dia: 'MIÉRCOLES', hora_inicio: '14:00', hora_fin: '16:00' },
      modalidad: Modalidad.VIRTUAL,
      activo: true,
    },
    {
      materiaId: getMateriaByCodigo('PSIC-102').id,
      docenteId: docenteD001.id,
      aulaId: null,
      periodoId: periodoActivo.id,
      cupoMaximo: 30,
      cupoDisponible: 30,
      seccion: 'A',
      horario: { dia: 'JUEVES', hora_inicio: '16:00', hora_fin: '18:00' },
      modalidad: Modalidad.VIRTUAL,
      activo: true,
    },
  ];

  const ofertasAcademicas = [];
  for (const data of ofertasData) {
    // Crear un identificador único para la oferta
    const oferta = await prisma.ofertaAcademica.create({
      data,
    });
    ofertasAcademicas.push(oferta);
  }

  // ============================================
  // 10. CREAR INSCRIPCIONES
  // ============================================
  console.log('📝 Creando inscripciones...');

  const estudianteE001 = estudiantes.find(e => e.codigoEstudiante === 'E001')!;
  const estudianteE002 = estudiantes.find(e => e.codigoEstudiante === 'E002')!;
  const estudianteE003 = estudiantes.find(e => e.codigoEstudiante === 'E003')!;
  const estudianteE004 = estudiantes.find(e => e.codigoEstudiante === 'E004')!;

  const inscripcionesData = [
    {
      estudianteId: estudianteE001.id,
      ofertaId: ofertasAcademicas[0].id, // MAT-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-20'),
    },
    {
      estudianteId: estudianteE001.id,
      ofertaId: ofertasAcademicas[1].id, // PROG-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-20'),
    },
    {
      estudianteId: estudianteE001.id,
      ofertaId: ofertasAcademicas[2].id, // LOG-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-20'),
    },
    {
      estudianteId: estudianteE002.id,
      ofertaId: ofertasAcademicas[6].id, // ADM-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-21'),
    },
    {
      estudianteId: estudianteE002.id,
      ofertaId: ofertasAcademicas[7].id, // ADM-102
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-21'),
    },
    {
      estudianteId: estudianteE003.id,
      ofertaId: ofertasAcademicas[0].id, // MAT-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-22'),
    },
    {
      estudianteId: estudianteE003.id,
      ofertaId: ofertasAcademicas[1].id, // PROG-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-22'),
    },
    {
      estudianteId: estudianteE004.id,
      ofertaId: ofertasAcademicas[9].id, // PSIC-101
      estado: EstadoInscripcion.ACTIVA,
      fechaInscripcion: new Date('2024-02-23'),
    },
  ];

  for (const data of inscripcionesData) {
    await prisma.inscripcion.create({
      data,
    });
  }

  // ============================================
  // 11. CREAR EVALUACIONES
  // ============================================
  console.log('📊 Creando evaluaciones...');

  const evaluacionesData = [
    // MAT-101
    {
      ofertaId: ofertasAcademicas[0].id,
      titulo: 'Examen Parcial 1 - MAT-101',
      descripcion: 'Álgebra y geometría analítica',
      tipoEvaluacion: TipoEvaluacion.PARCIAL,
      peso: 20.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-04-15T10:00:00'),
      publicada: true,
      editableHasta: new Date('2024-04-14T23:59:00'),
    },
    {
      ofertaId: ofertasAcademicas[0].id,
      titulo: 'Examen Parcial 2 - MAT-101',
      descripcion: 'Funciones y trigonometría',
      tipoEvaluacion: TipoEvaluacion.PARCIAL,
      peso: 20.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-05-20T10:00:00'),
      publicada: true,
      editableHasta: new Date('2024-05-19T23:59:00'),
    },
    {
      ofertaId: ofertasAcademicas[0].id,
      titulo: 'Examen Final - MAT-101',
      descripcion: 'Examen final de matemáticas',
      tipoEvaluacion: TipoEvaluacion.FINAL,
      peso: 30.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-07-10T10:00:00'),
      publicada: false,
    },
    // PROG-101
    {
      ofertaId: ofertasAcademicas[1].id,
      titulo: 'Práctica 1 - PROG-101',
      descripcion: 'Introducción a Python - Variables y condicionales',
      tipoEvaluacion: TipoEvaluacion.PRACTICA,
      peso: 10.00,
      puntajeMaximo: 10.00,
      fecha: new Date('2024-03-25T10:00:00'),
      publicada: true,
    },
    {
      ofertaId: ofertasAcademicas[1].id,
      titulo: 'Proyecto 1 - PROG-101',
      descripcion: 'Calculadora en Python',
      tipoEvaluacion: TipoEvaluacion.PROYECTO,
      peso: 25.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-05-01T23:59:00'),
      publicada: true,
    },
    {
      ofertaId: ofertasAcademicas[1].id,
      titulo: 'Examen Parcial - PROG-101',
      descripcion: 'Programación estructurada',
      tipoEvaluacion: TipoEvaluacion.PARCIAL,
      peso: 25.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-05-15T10:00:00'),
      publicada: true,
    },
    // ADM-101
    {
      ofertaId: ofertasAcademicas[6].id,
      titulo: 'Ensayo - ADM-101',
      descripcion: 'Principios de administración moderna',
      tipoEvaluacion: TipoEvaluacion.TALLER,
      peso: 15.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-04-10T23:59:00'),
      publicada: true,
    },
    {
      ofertaId: ofertasAcademicas[6].id,
      titulo: 'Examen Parcial - ADM-101',
      descripcion: 'Teorías de la administración',
      tipoEvaluacion: TipoEvaluacion.PARCIAL,
      peso: 25.00,
      puntajeMaximo: 20.00,
      fecha: new Date('2024-05-10T14:00:00'),
      publicada: true,
    },
  ];

  const evaluaciones = [];
  for (const data of evaluacionesData) {
    const evaluacion = await prisma.evaluacion.create({
      data,
    });
    evaluaciones.push(evaluacion);
  }

  // ============================================
  // 12. CREAR NOTAS
  // ============================================
  console.log('✏️ Creando notas...');

  const notasData = [
    // Juan Pérez - MAT-101
    {
      evaluacionId: evaluaciones[0].id,
      estudianteId: estudianteE001.id,
      valor: 18.50,
      observacion: 'Excelente desempeño en álgebra',
    },
    {
      evaluacionId: evaluaciones[1].id,
      estudianteId: estudianteE001.id,
      valor: 16.00,
      observacion: 'Buen trabajo en funciones',
    },
    // Andrés Mendoza - MAT-101
    {
      evaluacionId: evaluaciones[0].id,
      estudianteId: estudianteE003.id,
      valor: 15.00,
      observacion: 'Desempeño aceptable',
    },
    {
      evaluacionId: evaluaciones[1].id,
      estudianteId: estudianteE003.id,
      valor: 14.50,
      observacion: 'Necesita mejorar en trigonometría',
    },
    // Juan Pérez - PROG-101
    {
      evaluacionId: evaluaciones[3].id,
      estudianteId: estudianteE001.id,
      valor: 9.50,
      observacion: 'Excelente práctica',
    },
    {
      evaluacionId: evaluaciones[4].id,
      estudianteId: estudianteE001.id,
      valor: 18.00,
      observacion: 'Buen proyecto, cumple con todos los requisitos',
    },
    {
      evaluacionId: evaluaciones[5].id,
      estudianteId: estudianteE001.id,
      valor: 17.00,
      observacion: 'Buen desempeño en el examen',
    },
    // Andrés Mendoza - PROG-101
    {
      evaluacionId: evaluaciones[3].id,
      estudianteId: estudianteE003.id,
      valor: 8.00,
      observacion: 'Requiere más práctica en condicionales',
    },
    {
      evaluacionId: evaluaciones[4].id,
      estudianteId: estudianteE003.id,
      valor: 15.00,
      observacion: 'Buen proyecto, pero necesita optimización',
    },
    {
      evaluacionId: evaluaciones[5].id,
      estudianteId: estudianteE003.id,
      valor: 13.00,
      observacion: 'Aprobado, pero puede mejorar',
    },
    // Laura Gómez - ADM-101
    {
      evaluacionId: evaluaciones[6].id,
      estudianteId: estudianteE002.id,
      valor: 17.00,
      observacion: 'Buen ensayo, excelente análisis',
    },
    {
      evaluacionId: evaluaciones[7].id,
      estudianteId: estudianteE002.id,
      valor: 16.50,
      observacion: 'Buen desempeño en el examen',
    },
  ];

  for (const data of notasData) {
    await prisma.nota.create({
      data,
    });
  }

  // ============================================
  // 13. CREAR PAGOS
  // ============================================
  console.log('💰 Creando pagos...');

  const pagosData = [
    {
      estudianteId: estudianteE001.id,
      periodoId: periodoActivo.id,
      monto: 500.00,
      concepto: 'Matrícula Primer Semestre 2024',
      referencia: 'PAG-001',
      metodoPago: MetodoPago.TRANSFERENCIA,
      estado: EstadoPago.CONFIRMADO,
      fechaPago: new Date('2024-02-15'),
    },
    {
      estudianteId: estudianteE001.id,
      periodoId: periodoActivo.id,
      monto: 200.00,
      concepto: 'Segundo pago - Primer Semestre 2024',
      referencia: 'PAG-002',
      metodoPago: MetodoPago.TARJETA,
      estado: EstadoPago.CONFIRMADO,
      fechaPago: new Date('2024-03-15'),
    },
    {
      estudianteId: estudianteE002.id,
      periodoId: periodoActivo.id,
      monto: 450.00,
      concepto: 'Matrícula Primer Semestre 2024',
      referencia: 'PAG-003',
      metodoPago: MetodoPago.EFECTIVO,
      estado: EstadoPago.CONFIRMADO,
      fechaPago: new Date('2024-02-16'),
    },
    {
      estudianteId: estudianteE003.id,
      periodoId: periodoActivo.id,
      monto: 500.00,
      concepto: 'Matrícula Primer Semestre 2024',
      referencia: 'PAG-004',
      metodoPago: MetodoPago.TRANSFERENCIA,
      estado: EstadoPago.PENDIENTE,
      fechaPago: null,
    },
    {
      estudianteId: estudianteE004.id,
      periodoId: periodoActivo.id,
      monto: 300.00,
      concepto: 'Matrícula Primer Semestre 2024',
      referencia: 'PAG-005',
      metodoPago: MetodoPago.TARJETA,
      estado: EstadoPago.CONFIRMADO,
      fechaPago: new Date('2024-02-18'),
    },
  ];

  for (const data of pagosData) {
    await prisma.pago.create({
      data,
    });
  }

  // ============================================
  // 14. CREAR EVENTOS DE CALENDARIO
  // ============================================
  console.log('📅 Creando eventos de calendario...');

  const eventosData = [
    {
      periodoId: periodoActivo.id,
      titulo: 'Inicio de Clases',
      descripcion: 'Inicio del primer semestre 2024',
      tipoEvento: TipoEvento.INICIO_CLASES,
      fechaInicio: new Date('2024-03-01T08:00:00'),
      fechaFin: new Date('2024-03-01T18:00:00'),
    },
    {
      periodoId: periodoActivo.id,
      titulo: 'Semana Santa',
      descripcion: 'Vacaciones de Semana Santa',
      tipoEvento: TipoEvento.VACACIONES,
      fechaInicio: new Date('2024-03-28T00:00:00'),
      fechaFin: new Date('2024-03-31T23:59:00'),
    },
    {
      periodoId: periodoActivo.id,
      titulo: 'Exámenes Finales',
      descripcion: 'Período de exámenes finales',
      tipoEvento: TipoEvento.EXAMENES,
      fechaInicio: new Date('2024-07-01T08:00:00'),
      fechaFin: new Date('2024-07-15T18:00:00'),
    },
    {
      periodoId: periodoActivo.id,
      titulo: 'Fin de Clases',
      descripcion: 'Finalización del primer semestre 2024',
      tipoEvento: TipoEvento.FIN_CLASES,
      fechaInicio: new Date('2024-07-15T18:00:00'),
      fechaFin: new Date('2024-07-15T18:00:00'),
    },
  ];

  for (const data of eventosData) {
    await prisma.calendarioAcademico.create({
      data,
    });
  }

  // ============================================
  // 15. CREAR REGISTROS DE AUDITORÍA
  // ============================================
  console.log('📋 Creando registros de auditoría...');

  const adminPerfil = perfiles.find(p => p.email === 'admin@universidad.edu')!;
  const estudiante1Perfil = perfiles.find(p => p.email === 'estudiante1@universidad.edu')!;
  const estudiante2Perfil = perfiles.find(p => p.email === 'estudiante2@universidad.edu')!;

  await prisma.auditoria.create({
    data: {
      perfilId: adminPerfil.id,
      accion: 'LOGIN',
      entidad: 'Perfil',
      entidadId: adminPerfil.id,
      detalle: { ip: '192.168.1.100', userAgent: 'Chrome/120.0' },
      direccionIp: '192.168.1.100',
    },
  });

  await prisma.auditoria.create({
    data: {
      perfilId: adminPerfil.id,
      accion: 'CREATE',
      entidad: 'OfertaAcademica',
      entidadId: ofertasAcademicas[0].id,
      detalle: { materia: 'MAT-101', docente: 'D003', periodo: '2024-1' },
      direccionIp: '192.168.1.100',
    },
  });

  await prisma.auditoria.create({
    data: {
      perfilId: estudiante1Perfil.id,
      accion: 'LOGIN',
      entidad: 'Perfil',
      entidadId: estudiante1Perfil.id,
      detalle: { ip: '192.168.1.101', userAgent: 'Firefox/121.0' },
      direccionIp: '192.168.1.101',
    },
  });

  await prisma.auditoria.create({
    data: {
      perfilId: estudiante2Perfil.id,
      accion: 'ENROLL',
      entidad: 'Inscripcion',
      entidadId: 'N/A',
      detalle: { estudiante: 'E002', oferta: 'ADM-101' },
      direccionIp: '192.168.1.102',
    },
  });

  console.log('✅ Seeding completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`  - ${perfiles.length} perfiles creados`);
  console.log(`  - ${carreras.length} carreras creadas`);
  console.log(`  - ${estudiantes.length} estudiantes creados`);
  console.log(`  - ${docentes.length} docentes creados`);
  console.log(`  - ${materias.length} materias creadas`);
  console.log(`  - ${aulas.length} aulas creadas`);
  console.log(`  - ${periodos.length} periodos creados`);
  console.log(`  - ${ofertasAcademicas.length} ofertas académicas creadas`);
  console.log(`  - ${evaluaciones.length} evaluaciones creadas`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });