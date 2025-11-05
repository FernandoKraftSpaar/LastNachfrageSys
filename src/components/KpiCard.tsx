import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  variant = 'default' 
}: KpiCardProps) {
  const variantClasses = {
    default: 'bg-card',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
    warning: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950',
    info: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <Card className={`p-6 shadow-card transition-smooth hover:shadow-elevated ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20`}>
              <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
            </div>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h4>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs. média</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
