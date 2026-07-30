import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 transition-all duration-150 hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-success" : "text-destructive",
              )}
            >
              {trend.positive ? "+" : "-"}
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-muted p-2.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
