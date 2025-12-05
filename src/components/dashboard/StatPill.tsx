import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatPillProps {
  icon: LucideIcon;
  value: string | number;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

/**
 * StatPill Component - KPI Display
 * Compact pill-style indicator for key metrics
 * 
 * Uses CSS variables for theming
 */
export const StatPill: React.FC<StatPillProps> = ({ 
  icon: Icon, 
  value, 
  label,
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'bg-gray-100/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300',
    success: 'bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    info: 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  return (
    <div 
      className={`
        inline-flex items-center gap-2 px-3 py-2
        rounded-[var(--radius-full)]
        backdrop-blur-sm
        transition-[var(--transition-fast)]
        ${variantStyles[variant]}
      `}
    >
      <Icon className="h-4 w-4" />
      <span className="font-semibold text-sm">{value}</span>
      {label && <span className="text-xs opacity-80">{label}</span>}
    </div>
  );
};

export default StatPill;
