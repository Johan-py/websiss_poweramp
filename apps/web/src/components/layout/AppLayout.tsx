import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getBreadcrumbs } from "@/config/navigation";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { perfil } = useAuth();
  const breadcrumbItems = getBreadcrumbs(perfil?.rol, location.pathname);

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
