import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'primary';
}

/**
 * GlassCard Component
 * A modern glass-morphism card using CSS variables from tokens.css
 * 
 * Uses design tokens:
 * - --radius-lg for border radius
 * - --shadow-card for shadow
 * - --glass-backdrop for backdrop filter
 * - --color-primary, --color-accent for variants
 */
export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-white/80 dark:bg-slate-900/80 border-gray-200/50 dark:border-slate-700/50',
    accent: 'bg-white/80 dark:bg-slate-900/80 border-[var(--color-accent)]/30',
    primary: 'bg-white/80 dark:bg-slate-900/80 border-[var(--color-primary)]/30'
  };

  return (
    <div 
      className={`
        backdrop-blur-md
        border
        rounded-[var(--radius-lg)]
        shadow-[var(--shadow-card)]
        transition-[var(--transition-smooth)]
        hover:shadow-[var(--shadow-elevated)]
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        backdropFilter: 'var(--glass-backdrop)'
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
