/**
 * Theme Module
 * 
 * Exports all design tokens and theme-related utilities.
 * 
 * Usage:
 * ```tsx
 * // Import the ThemeProvider
 * import { ThemeProvider } from '@/theme';
 * 
 * // Import design tokens
 * import { tokens, colors, gradients } from '@/theme';
 * 
 * // Use in your components
 * const MyComponent = () => (
 *   <div style={{ backgroundColor: colors.primary.hex }}>
 *     Content
 *   </div>
 * );
 * ```
 */

export { ThemeProvider } from './ThemeProvider';
export { tokens, colors, gradients, spacing, radii, shadows, typography, transitions, effects } from './tokens';
