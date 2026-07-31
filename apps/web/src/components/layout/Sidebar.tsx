import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { getNavForRole } from "@/config/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { perfil } = useAuth();
  const mainNav = getNavForRole(perfil?.rol);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background transition-all duration-200 ease-out-expo",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <div
        className={cn(
          "flex h-topbar items-center border-b border-sidebar-border transition-all duration-200",
          collapsed ? "justify-center px-0" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground">
            WebSISS PowerAmp
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="text-muted-foreground"
        >
          {collapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
        {mainNav.map((item) => {
          const Icon = item.icon;
          return collapsed ? (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all duration-150",
                      isActive
                        ? "bg-sidebar-active text-sidebar-active-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-active hover:text-sidebar-active-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-sidebar-active text-sidebar-active-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-active hover:text-sidebar-active-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
