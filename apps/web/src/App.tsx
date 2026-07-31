import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Login } from "@/pages/Login";
import { NoticiasPage } from "@/pages/Noticias";
import { Dashboard } from "@/pages/Dashboard";
import { EstudiantesPage } from "@/pages/Estudiantes";
import { DocentesPage } from "@/pages/Docentes";
import { CarrerasPage } from "@/pages/Carreras";
import { MateriasPage } from "@/pages/Materias";
import { OfertaAcademicaPage } from "@/pages/OfertaAcademica";
import { Inscripciones } from "@/pages/Inscripciones";
import { EvaluacionesPage } from "@/pages/Evaluaciones";
import { NotasPage } from "@/pages/Notas";
import { Kardex } from "@/pages/Kardex";
import { PagosPage } from "@/pages/Pagos";
import { CalendarioPage } from "@/pages/Calendario";
import { HorarioPage } from "@/pages/Horario";
import { RecursosPage } from "@/pages/Recursos";
import { PerfilPage } from "@/pages/Perfil";
import { ConfiguracionPage } from "@/pages/Configuracion";
import { AuditoriaPage } from "@/pages/Auditoria";

const GESTION = ["ADMIN", "COORDINADOR"];
const ACADEMICO = ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"];
const ESTUDIANTE = ["ESTUDIANTE"];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="noticias" element={<NoticiasPage />} />
            <Route index element={<Dashboard />} />
            <Route element={<ProtectedRoute allowedRoles={GESTION} />}>
              <Route path="estudiantes" element={<EstudiantesPage />} />
              <Route path="docentes" element={<DocentesPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[...GESTION, ...ESTUDIANTE]} />}>
              <Route path="carreras" element={<CarrerasPage />} />
              <Route path="materias" element={<MateriasPage />} />
              <Route path="kardex" element={<Kardex />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={ACADEMICO} />}>
              <Route path="oferta-academica" element={<OfertaAcademicaPage />} />
              <Route path="inscripciones" element={<Inscripciones />} />
              <Route path="evaluaciones" element={<EvaluacionesPage />} />
              <Route path="notas" element={<NotasPage />} />
              <Route path="pagos" element={<PagosPage />} />
              <Route path="calendario" element={<CalendarioPage />} />
              <Route path="horario" element={<HorarioPage />} />
              <Route path="recursos" element={<RecursosPage />} />
            </Route>
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
            <Route path="auditoria" element={<AuditoriaPage />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
