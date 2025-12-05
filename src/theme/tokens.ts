/**
 * Design Tokens
 * 
 * Color palette and design tokens extracted from the landing page
 * Source: LandingSeiteTEST/index.html (commit: 5348f866768cf9c3450f28acd6dab398b50350e1)
 * 
 * All colors are defined in multiple formats for flexibility:
 * - hex: for direct use in CSS/JS
 * - rgb: for rgba() transformations
 * - hsl: for HSL-based theming (matches Tailwind/shadcn)
 */

export const colors = {
  // Primary brand color - dark blue
  primary: {
    hex: '#1E3A5F',
    rgb: { r: 30, g: 58, b: 95 },
    hsl: { h: 210, s: 52, l: 25 },
    css: 'hsl(210, 52%, 25%)',
  },
  
  // Primary accent - lime green
  accent: {
    hex: '#95BF39',
    rgb: { r: 149, g: 191, b: 57 },
    hsl: { h: 79, s: 54, l: 49 },
    css: 'hsl(79, 54%, 49%)',
  },
  
  // Secondary accent - dark green
  accent2: {
    hex: '#0B8C38',
    rgb: { r: 11, g: 140, b: 56 },
    hsl: { h: 141, s: 85, l: 30 },
    css: 'hsl(141, 85%, 30%)',
  },
  
  // Yellow variants (for dashboard button and solar sections)
  yellow: {
    50: {
      hex: '#FFFBEB',
      css: 'rgb(255, 251, 235)',
    },
    100: {
      hex: '#FEF3C7',
      css: 'rgb(254, 243, 199)',
    },
    400: {
      hex: '#FBBF24',
      css: 'rgb(251, 191, 36)',
    },
    500: {
      hex: '#F59E0B',
      css: 'rgb(245, 158, 11)',
    },
    600: {
      hex: '#D97706',
      css: 'rgb(217, 119, 6)',
    },
  },
  
  // Gray scale
  gray: {
    50: {
      hex: '#F9FAFB',
      css: 'rgb(249, 250, 251)',
    },
  },
  
  // Slate scale (for text)
  slate: {
    600: {
      hex: '#475569',
      css: 'rgb(71, 85, 105)',
    },
    700: {
      hex: '#334155',
      css: 'rgb(51, 65, 85)',
    },
    800: {
      hex: '#1E293B',
      css: 'rgb(30, 41, 59)',
    },
    900: {
      hex: '#0F172A',
      css: 'rgb(15, 23, 42)',
    },
  },
  
  // White
  white: {
    hex: '#FFFFFF',
    css: 'rgb(255, 255, 255)',
  },
} as const;

export const gradients = {
  // Hero section gradient
  hero: {
    css: 'linear-gradient(135deg, hsl(210, 52%, 25%), hsl(79, 54%, 49%))',
    from: colors.primary.css,
    to: colors.accent.css,
  },
  
  // Dashboard button gradient (yellow)
  dashboardButton: {
    normal: {
      css: 'linear-gradient(135deg, rgb(251, 191, 36), rgb(245, 158, 11))',
      from: colors.yellow[400].css,
      to: colors.yellow[500].css,
    },
    hover: {
      css: 'linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))',
      from: colors.yellow[500].css,
      to: colors.yellow[600].css,
    },
  },
  
  // Success gradient (accent to accent-2)
  success: {
    css: 'linear-gradient(135deg, hsl(79, 54%, 49%), hsl(141, 85%, 30%))',
    from: colors.accent.css,
    to: colors.accent2.css,
  },
  
  // Subtle background gradients
  subtle: {
    light: {
      css: 'linear-gradient(180deg, rgb(249, 250, 251), rgb(243, 244, 246))',
    },
  },
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const radii = {
  sm: '0.25rem',     // 4px - small elements
  md: '0.5rem',      // 8px - buttons
  lg: '0.75rem',     // 12px - cards (matches --radius)
  xl: '1rem',        // 16px - large cards
  '2xl': '1.5rem',   // 24px - hero sections
  full: '9999px',    // fully rounded (pills)
} as const;

export const shadows = {
  // Card shadow
  card: {
    css: '0 2px 8px -2px hsl(210 20% 30% / 0.08)',
  },
  
  // Elevated shadow
  elevated: {
    css: '0 8px 24px -8px hsl(210 20% 30% / 0.12)',
  },
  
  // Tailwind shadows (for reference)
  sm: {
    css: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  lg: {
    css: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  xl: {
    css: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

export const typography = {
  fontFamily: {
    primary: "'Nexa Heavy', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    system: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  fontWeight: {
    normal: '400',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const transitions = {
  smooth: {
    css: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  fast: {
    css: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  colors: {
    css: 'color 0.2s, background-color 0.2s, border-color 0.2s',
  },
  transform: {
    css: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const effects = {
  // Glass/blur effect (for modern UI)
  glass: {
    backdrop: 'blur(10px)',
    background: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Hover scale
  hoverScale: {
    sm: 'scale(1.02)',
    md: 'scale(1.05)',
    lg: 'scale(1.1)',
  },
} as const;

// Consolidated tokens export
export const tokens = {
  colors,
  gradients,
  spacing,
  radii,
  shadows,
  typography,
  transitions,
  effects,
} as const;

export default tokens;
