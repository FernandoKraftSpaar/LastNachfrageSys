import React, { useEffect } from 'react';
import './tokens.css';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider Component
 * 
 * Injects design tokens as CSS custom properties into the document root.
 * This enables the use of design tokens throughout the application via CSS variables.
 * 
 * The CSS variables are defined in tokens.css and automatically injected when this
 * component is mounted in the React tree.
 * 
 * Usage:
 * ```tsx
 * import { ThemeProvider } from '@/theme/ThemeProvider';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 * 
 * Accessing tokens in CSS:
 * ```css
 * .my-element {
 *   background: var(--color-primary);
 *   border-radius: var(--radius-lg);
 *   box-shadow: var(--shadow-card);
 * }
 * ```
 * 
 * Accessing tokens in TypeScript:
 * ```tsx
 * import { tokens } from '@/theme/tokens';
 * 
 * const primaryColor = tokens.colors.primary.hex; // '#1E3A5F'
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // The CSS variables are automatically applied by importing tokens.css
    // This effect can be used for additional runtime theme customization if needed
    
    // Mark the document as theme-ready (useful for preventing FOUC)
    document.documentElement.setAttribute('data-theme', 'loaded');
    
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
