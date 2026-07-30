import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: { label: string; href?: string }[];
}

function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center gap-1 text-sm", className)}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export { Breadcrumb };
