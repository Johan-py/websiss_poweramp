import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Settings,
  FileText,
  ClipboardCheck,
  BarChart3,
  Shield,
  UserCircle,
  Library,
  Clock,
  Newspaper,
} from "lucide-react";

export type Rol = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";

export const ALL_ROLES: Rol[] = ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"];

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: Rol[];
}

export const navItems: NavItem[] = [
  { to: "/noticias", label: "Noticias", icon: Newspaper, roles: ALL_ROLES },
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
  { to: "/estudiantes", label: "Estudiantes", icon: Users, roles: ["ADMIN", "COORDINADOR"] },
  { to: "/docentes", label: "Docentes", icon: GraduationCap, roles: ["ADMIN", "COORDINADOR"] },
  { to: "/carreras", label: "Carreras", icon: Library, roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"] },
  { to: "/materias", label: "Materias", icon: BookOpen, roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"] },
  { to: "/oferta-academica", label: "Oferta Académica", icon: FileSpreadsheet, roles: ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"] },
  { to: "/inscripciones", label: "Inscripciones", icon: ClipboardCheck, roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"] },
  { to: "/evaluaciones", label: "Evaluaciones", icon: FileText, roles: ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"] },
  { to: "/notas", label: "Notas", icon: BarChart3, roles: ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"] },
  { to: "/kardex", label: "Kardex", icon: FileText, roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"] },
  { to: "/pagos", label: "Pagos", icon: DollarSign, roles: ["ADMIN", "COORDINADOR", "ESTUDIANTE"] },
  { to: "/calendario", label: "Calendario", icon: Calendar, roles: ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"] },
  { to: "/horario", label: "Horario", icon: Clock, roles: ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"] },
  { to: "/recursos", label: "Recursos", icon: Library, roles: ["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"] },
  { to: "/perfil", label: "Perfil", icon: UserCircle, roles: ALL_ROLES },
  { to: "/configuracion", label: "Configuración", icon: Settings, roles: ALL_ROLES },
  { to: "/auditoria", label: "Auditoría", icon: Shield, roles: ALL_ROLES },
];

export function getNavForRole(rol?: string): NavItem[] {
  if (!rol) return [];

  const items = navItems
    .filter((item) => item.roles.includes(rol as Rol))
    .map((item) => ({ ...item })); // Copia para no modificar navItems

  if (rol === "DOCENTE") {
    const notas = items.find((item) => item.to === "/notas");
    if (notas) {
      notas.label = "Subir Notas";
    }
  }

  return items;
}

export function getBreadcrumbs(rol: string | undefined, pathname: string) {
  const item = getNavForRole(rol).find((i) => i.to === pathname);
  if (!item) return [];

  if (item.to === "/") {
    return [{ label: item.label }];
  }

  return [{ label: item.label, href: item.to }];
}

export function getRoleLabel(rol?: string): string {
  switch (rol) {
    case "ADMIN":
      return "Administrador";
    case "COORDINADOR":
      return "Coordinador Académico";
    case "DOCENTE":
      return "Docente";
    case "ESTUDIANTE":
      return "Estudiante";
    default:
      return "Usuario";
  }
}