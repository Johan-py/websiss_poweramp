import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    !description && !children ? (
      <h1 className={cn("text-xl font-semibold tracking-tight mb-6", className)}>{title}</h1>
    ) : (
      <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
    )
  );
}
