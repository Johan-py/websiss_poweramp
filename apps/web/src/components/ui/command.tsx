import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "./dialog";

interface CommandContextValue {
  search: string;
  setSearch: (v: string) => void;
  onSelect?: (v: string) => void;
}

const CommandContext = React.createContext<CommandContextValue>({
  search: "",
  setSearch: () => {},
});

function useCommandContext() {
  return React.useContext(CommandContext);
}

interface CommandProps {
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  className?: string;
}

function Command({ children, onSelect, className }: CommandProps) {
  const [search, setSearch] = React.useState("");
  return (
    <CommandContext.Provider value={{ search, setSearch, onSelect }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </CommandContext.Provider>
  );
}

function CommandInput({
  placeholder = "Buscar...",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const { search, setSearch } = useCommandContext();
  return (
    <div className="flex items-center gap-2 border-b px-4 pb-3">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60",
          className,
        )}
        autoFocus
      />
    </div>
  );
}

interface CommandGroupProps {
  heading?: string;
  children: React.ReactNode;
  className?: string;
}

function CommandGroup({ heading, children, className }: CommandGroupProps) {
  return (
    <div className={cn("px-2 py-2", className)}>
      {heading && (
        <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">
          {heading}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

interface CommandItemProps {
  value: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function CommandItem({ value, onSelect, children, className }: CommandItemProps) {
  const ctx = useCommandContext();
  const handleClick = () => {
    if (onSelect) onSelect(value);
    else ctx.onSelect?.(value);
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function CommandDialog({ open, onOpenChange, children }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {children}
      </DialogContent>
    </Dialog>
  );
}

export { Command, CommandInput, CommandGroup, CommandItem, CommandDialog };
