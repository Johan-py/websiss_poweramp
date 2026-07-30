# Flujos de Casos de Uso — Inscripción y Generación de Kardex

## 1. Caso de Uso: Inscripción a Oferta Académica

**Actor principal:** Estudiante  
**Actor secundario:** Coordinador / Administrador  
**Descripción:** Permite que un estudiante se inscriba en una o más ofertas académicas (materias) dentro de un período activo.

### 1.1 Precondiciones

- El estudiante debe existir en el sistema (registro en `estudiantes` con `perfil` asociado).
- El período académico debe estar activo (`periodos.activo = true`).
- La oferta académica debe estar activa (`ofertas_academicas.activo = true`).
- La oferta académica debe tener cupo disponible (`cupoDisponible > 0`).
- El estudiante no debe estar ya inscrito en la misma oferta (unique constraint `[estudianteId, ofertaId]`).

### 1.2 Flujo Principal (Happy Path)

```
1. El actor (estudiante o coordinador) inicia sesión en el sistema.
2. El actor navega al módulo de "Inscripciones" / "Oferta Académica".
3. El sistema muestra el listado de ofertas académicas del período activo,
   filtrables por carrera, materia, docente, horario, etc.
4. El actor selecciona una o más ofertas académicas para inscribirse.
5. El sistema valida:
   a. El período está activo y dentro de las fechas de matrícula.
   b. La oferta tiene cupo disponible.
   c. El estudiante cumple los prerrequisitos de la(s) materia(s).
      - Busca en `prerrequisitos` donde `materiaId = materia.id`.
      - Para cada prerrequisito, verifica que exista una `Inscripcion`
        con `estudianteId` y cuyo `estado = COMPLETADA` para la materia
        requisito, o que exista una `Nota` aprobatoria en la evaluación
        correspondiente.
   d. No existe una inscripción duplicada.
   e. El estudiante no tiene conflictos de horario con otras
      inscripciones activas en el mismo período.
6. Si todo es válido, el sistema:
   a. Crea el registro en `inscripciones` con `estado = ACTIVA`
      y `fechaInscripcion = now()`.
   b. Decrementa `cupoDisponible` en la `OfertaAcademica`.
   c. Registra la acción en la tabla `auditoria`.
7. El sistema confirma la inscripción exitosa y actualiza la vista.
```

### 1.3 Flujos Alternativos / Excepciones

#### 1.3.1 Cupo lleno
```
1. En el paso 5b, el sistema detecta que `cupoDisponible <= 0`.
2. El sistema muestra un mensaje: "La oferta académica [materia] - [sección]
   no tiene cupos disponibles."
3. El flujo retorna al paso 3.
```

#### 1.3.2 Prerrequisitos no cumplidos
```
1. En el paso 5c, el sistema detecta que uno o más prerrequisitos no han
   sido aprobados por el estudiante.
2. El sistema muestra un mensaje: "No cumple con los siguientes prerrequisitos:
   [lista de materias requisito]."
3. El flujo retorna al paso 3.
```

#### 1.3.3 Inscripción duplicada
```
1. En el paso 5d, el sistema detecta que ya existe un registro en
   `inscripciones` con el mismo `estudianteId` y `ofertaId`.
2. El sistema muestra un mensaje: "Ya se encuentra inscrito en esta
   oferta académica."
3. El flujo retorna al paso 3.
```

#### 1.3.4 Conflicto de horario
```
1. En el paso 5e, el sistema detecta que el horario de la oferta
   seleccionada se superpone con otra inscripción activa del estudiante.
2. El sistema muestra un mensaje: "La oferta [materia] tiene conflicto
   de horario con [materia existente]."
3. El flujo retorna al paso 3.
```

#### 1.3.5 Período inactivo o fuera de fechas
```
1. En el paso 5a, el sistema detecta que el período no está activo
   o la fecha actual está fuera del rango de matrícula.
2. El sistema muestra un mensaje: "El período académico no está
   disponible para inscripciones."
3. El flujo termina.
```

#### 1.3.6 Cancelación de inscripción
```
1. El actor selecciona una inscripción existente con `estado = ACTIVA`.
2. El sistema solicita confirmación.
3. El actor confirma la cancelación.
4. El sistema:
   a. Actualiza `estado = CANCELADA` en `inscripciones`.
   b. Incrementa `cupoDisponible` en la `OfertaAcademica`.
   c. Registra la acción en `auditoria`.
5. El sistema confirma la cancelación.
```

### 1.4 Postcondiciones

- Se crea un registro en `inscripciones` con `estado = ACTIVA`.
- El `cupoDisponible` de la `OfertaAcademica` se reduce en 1.
- Se registra el evento en `auditoria`.

### 1.5 Diagrama de estados de Inscripción

```
  [CREACIÓN]
      |
      v
   ACTIVA ──→ CANCELADA
      |
      ├──→ RETIRADA  (retiro voluntario durante el período)
      |
      └──→ COMPLETADA (materia cursada y evaluada al finalizar el período)
```

---

## 2. Caso de Uso: Generación de Kardex Académico

**Actor principal:** Estudiante  
**Actor secundario:** Coordinador / Administrador  
**Descripción:** Genera el historial académico completo (kardex) de un estudiante, mostrando todas las materias cursadas, notas obtenidas, créditos acumulados, promedio general y avance en la carrera.

### 2.1 Precondiciones

- El estudiante debe existir en el sistema.
- El estudiante debe tener al menos una inscripción registrada.

### 2.2 Flujo Principal (Happy Path)

```
1. El actor (estudiante o coordinador) inicia sesión en el sistema.
2. El actor navega al módulo de "Kardex" / "Historial Académico".
   - Si es estudiante, su kardex se carga automáticamente.
   - Si es coordinador/admin, busca al estudiante por código, nombre o cédula.
3. El sistema consulta y arma el kardex con los siguientes datos:

   a. **Datos del estudiante:**
      - Nombre, apellido, cédula (desde `Perfil`)
      - Código de estudiante (desde `Estudiante`)
      - Carrera y modalidad (desde `Carrera`)
      - Fecha de ingreso (desde `Estudiante`)

   b. **Períodos cursados:**
      - Agrupa las inscripciones por `Periodo`.
      - Para cada período: nombre, fechas.

   c. **Materias cursadas por período:**
      - Para cada `Inscripcion` del estudiante:
        - Código y nombre de la materia (vía `OfertaAcademica` → `Materia`)
        - Créditos de la materia
        - Docente que impartió (vía `OfertaAcademica` → `Docente`)
        - Sección, horario, aula
        - Estado de la inscripción (`ACTIVA`, `COMPLETADA`, `CANCELADA`, `RETIRADA`)

   d. **Notas y evaluación:**
      - Para cada inscripción con `estado = COMPLETADA`:
        - Lista de evaluaciones (vía `OfertaAcademica` → `Evaluacion`)
        - Nota obtenida en cada evaluación (vía `Nota`)
        - Nota final calculada (suma de `valor * peso` de cada evaluación)
        - Condición: Aprobado / Reprobado (según nota mínima definida por la carrera)

   e. **Resumen estadístico:**
      - Total de créditos inscritos
      - Total de créditos aprobados
      - Total de créditos reprobados
      - Promedio general ponderado
      - Promedio ponderado acumulado (incluye todas las materias)
      - Avance porcentual en la carrera (créditos aprobados / total créditos de la carrera)

4. El sistema presenta el kardex en formato estructurado (pantalla).
5. El actor puede descargar/imprimir el kardex en PDF si lo desea.
```

### 2.3 Flujos Alternativos / Excepciones

#### 2.3.1 Estudiante sin inscripciones
```
1. En el paso 3, el sistema consulta las inscripciones del estudiante
   y no encuentra ningún registro.
2. El sistema muestra un mensaje: "El estudiante no tiene inscripciones
   registradas en el sistema."
3. El kardex se muestra vacío, solo con los datos del estudiante.
```

#### 2.3.2 Estudiante no encontrado
```
1. En el paso 2 (coordinador/admin), el sistema busca al estudiante
   y no encuentra coincidencias.
2. El sistema muestra un mensaje: "No se encontró un estudiante con
   los datos proporcionados."
3. El flujo termina.
```

#### 2.3.3 Materias sin notas registradas
```
1. En el paso 3d, el sistema encuentra inscripciones activas o completadas
   que no tienen notas registradas en `Nota` para alguna evaluación.
2. El sistema muestra "S/N" (Sin Nota) en la celda correspondiente.
3. La nota final se marca como "Pendiente" y no se promedia.
```

#### 2.3.4 Promedio no calculable
```
1. Si el estudiante no tiene materias con notas finales registradas,
   el promedio se muestra como "N/A".
2. El avance porcentual se calcula solo con créditos aprobados
   (omite materias sin nota).
```

### 2.4 Postcondiciones

- Se genera y visualiza el kardex académico del estudiante.
- No se modifica ningún dato en la base de datos (operación de solo lectura).

### 2.5 Estructura del Kardex

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIVERSIDAD - SISTEMA SISS              │
│                   KARDEX ACADÉMICO - ESTUDIANTE            │
├─────────────────────────────────────────────────────────────┤
│ Datos del Estudiante                                        │
│   Nombre: Juan Pérez López                                  │
│   Cédula: 123456789                                         │
│   Código: E001                                              │
│   Carrera: Ingeniería en Sistemas (ING-SIS)                 │
│   Modalidad: Presencial                                     │
│   Fecha de Ingreso: 2024-02-15                              │
├─────────────────────────────────────────────────────────────┤
│ Período: 2024-1 (2024-01-15 - 2024-06-30)                  │
│ ┌──────┬──────────┬────────┬────────┬──────────┬────────┐  │
│ │ Cód. │ Materia  │ Créd.  │ Docente│ Nota Fin │ Estado │  │
│ ├──────┼──────────┼────────┼────────┼──────────┼────────┤  │
│ │MAT-10│Matemática│   4    │ Dr. X  │   85     │COMPLET │  │
│ │PROG- │Program.  │   4    │ Dr. Y  │   75     │COMPLET │  │
│ │LOG-10│Lógica    │   3    │ Dr. Z  │    S/N   │ ACTIVA │  │
│ └──────┴──────────┴────────┴────────┴──────────┴────────┘  │
│                                                             │
│ Resumen del Período:                                        │
│   Créditos inscritos: 11                                   │
│   Créditos aprobados: 8                                    │
│   Promedio período: 80.0                                   │
├─────────────────────────────────────────────────────────────┤
│ Resumen General                                             │
│   Total créditos carrera:    160                            │
│   Total créditos aprobados:  8                              │
│   Total créditos reprobados: 0                              │
│   Avance:                    5.0 %                          │
│   Promedio general:          80.0                           │
│   Promedio ponderado acum.:  80.0                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.6 Notas técnicas para la implementación

- **Cálculo de nota final:** `SUM(evaluacion.peso * nota.valor) / SUM(evaluacion.peso)` por materia.
- **Promedio general:** `AVG(nota_final)` de todas las materias con `estado = COMPLETADA`.
- **Promedio ponderado acumulado:** `SUM(creditos_materia * nota_final) / SUM(creditos_materia)`.
- **Avance:** `(Total créditos aprobados / Total créditos de la carrera) * 100`.
- La generación del kardex no persiste datos intermedios; se calcula en tiempo real desde las tablas `Inscripcion`, `Nota`, `Evaluacion`, `OfertaAcademica`, `Materia`, `Carrera`, `Estudiante` y `Perfil`.
