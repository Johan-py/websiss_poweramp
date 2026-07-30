import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, { label: string; href?: string }[]> = {
  "/": [{ label: "Dashboard" }],
  "/estudiantes": [{ label: "Estudiantes", href: "/estudiantes" }],
  "/docentes": [{ label: "Docentes", href: "/docentes" }],
  "/carreras": [{ label: "Carreras", href: "/carreras" }],
  "/materias": [{ label: "Materias", href: "/materias" }],
  "/oferta-academica": [{ label: "Oferta Académica", href: "/oferta-academica" }],
  "/inscripciones": [{ label: "Inscripciones", href: "/inscripciones" }],
  "/evaluaciones": [{ label: "Evaluaciones", href: "/evaluaciones" }],
  "/notas": [{ label: "Notas", href: "/notas" }],
  "/kardex": [{ label: "Kardex", href: "/kardex" }],
  "/pagos": [{ label: "Pagos", href: "/pagos" }],
  "/calendario": [{ label: "Calendario", href: "/calendario" }],
  "/recursos": [{ label: "Recursos", href: "/recursos" }],
  "/perfil": [{ label: "Perfil", href: "/perfil" }],
  "/configuracion": [{ label: "Configuración", href: "/configuracion" }],
  "/auditoria": [{ label: "Auditoría", href: "/auditoria" }],
};

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const breadcrumbItems = breadcrumbMap[location.pathname] ?? [];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-200 ease-out-expo",
            sidebarCollapsed ? "ml-sidebar-collapsed" : "ml-sidebar",
          )}
        >
          <Topbar breadcrumbItems={breadcrumbItems} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto scrollbar-thin">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
