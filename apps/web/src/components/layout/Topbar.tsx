import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Command,
  User,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandDialog, CommandInput, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { getNavForRole, getRoleLabel } from "@/config/navigation";

interface TopbarProps {
  breadcrumbItems?: { label: string; href?: string }[];
}

export function Topbar({ breadcrumbItems }: TopbarProps) {
  const { perfil, logout } = useAuth();
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);

  const roleNav = getNavForRole(perfil?.rol);
  const initials = perfil ? `${perfil.nombre.slice(0, 1)}${perfil.apellido.slice(0, 1)}`.toUpperCase() : "??";

  return (
    <>
      <header className="flex h-topbar items-center gap-4 border-b bg-background px-4 lg:px-6">
        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} />
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setCommandOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm",
              "text-muted-foreground transition-all duration-150",
              "hover:border-foreground/20 hover:text-foreground",
              "w-48 lg:w-64",
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left text-xs">Buscar...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <Bell className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium">Notificaciones</span>
                <span className="text-xs text-muted-foreground">3 nuevas</span>
              </div>
              <Separator />
              <div className="py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {i === 1
                          ? "Nueva inscripción registrada"
                          : i === 2
                            ? "Pago confirmado"
                            : "Actualización de notas"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {i === 1
                          ? "María García se inscribió en Álgebra"
                          : i === 2
                            ? "Pago de matrícula #1024 confirmado"
                            : "Notas del periodo 2026-1 publicadas"}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {i}m
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{perfil?.email ?? "Usuario"}</span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel(perfil?.rol)}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/configuracion")}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <Command>
          <CommandInput placeholder="Buscar páginas, acciones..." />
          <div className="max-h-72 overflow-y-auto p-2 scrollbar-thin">
            <CommandGroup heading="Navegación">
              {roleNav.map((item) => (
                <CommandItem
                  key={item.to}
                  value={item.label}
                  onSelect={() => {
                    setCommandOpen(false);
                    navigate(item.to);
                  }}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
