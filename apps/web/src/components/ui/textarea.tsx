import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-150 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
            error
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input hover:border-foreground/20",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
