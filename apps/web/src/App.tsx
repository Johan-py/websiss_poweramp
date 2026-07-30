import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { RecursosPage } from "@/pages/Recursos";
import { PerfilPage } from "@/pages/Perfil";
import { ConfiguracionPage } from "@/pages/Configuracion";
import { AuditoriaPage } from "@/pages/Auditoria";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="estudiantes" element={<EstudiantesPage />} />
          <Route path="docentes" element={<DocentesPage />} />
          <Route path="carreras" element={<CarrerasPage />} />
          <Route path="materias" element={<MateriasPage />} />
          <Route path="oferta-academica" element={<OfertaAcademicaPage />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="evaluaciones" element={<EvaluacionesPage />} />
          <Route path="notas" element={<NotasPage />} />
          <Route path="kardex" element={<Kardex />} />
          <Route path="pagos" element={<PagosPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="recursos" element={<RecursosPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
          <Route path="auditoria" element={<AuditoriaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
