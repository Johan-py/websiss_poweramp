import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar, SidebarNav } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getBreadcrumbs } from "@/config/navigation";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-72 max-w-[85vw] p-0 border-r border-sidebar-border bg-sidebar-background"
          >
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <div className="flex h-topbar items-center border-b border-sidebar-border px-4">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                WebSISS PowerAmp
              </span>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-200 ease-out-expo",
            sidebarCollapsed ? "lg:ml-sidebar-collapsed" : "lg:ml-sidebar",
          )}
        >
          <Topbar
            breadcrumbItems={breadcrumbItems}
            onOpenMobile={() => setMobileOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto scrollbar-thin">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
