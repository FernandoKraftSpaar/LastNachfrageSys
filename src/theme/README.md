# Theme System - Design Tokens

This directory contains the design tokens extracted from the landing page, providing a consistent design system for the entire application.

## Overview

The design tokens include:
- **Colors**: Primary, accent, accent-2, yellow variants, grayscale
- **Gradients**: Hero, dashboard button, success, subtle backgrounds
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Card, elevated, and utility shadows
- **Border Radius**: From small to fully rounded
- **Transitions**: Smooth, fast, colors, transform
- **Effects**: Glass, hover scales

## Source

These tokens were extracted from:
- Repository: `FernandoKraftSpaar/LandingSeiteTEST`
- File: `index.html`
- Commit: `5348f866768cf9c3450f28acd6dab398b50350e1`

See `docs/landing-colors.md` for detailed extraction documentation.

## Files

- **`tokens.ts`**: TypeScript definitions for all design tokens
- **`tokens.css`**: CSS custom properties (variables) for use in stylesheets
- **`ThemeProvider.tsx`**: React component to inject tokens into the app
- **`index.ts`**: Main exports for the theme module

## Setup

The `ThemeProvider` is already integrated into `App.tsx`:

```tsx
import { ThemeProvider } from "@/theme";

const App = () => (
  <ThemeProvider>
    {/* Your app */}
  </ThemeProvider>
);
```

## Usage

### Method 1: CSS Variables (Recommended for styles)

Use CSS custom properties directly in your styles:

```tsx
// Inline styles
<div style={{ 
  background: 'var(--color-primary)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)'
}}>
  Content
</div>

// Tailwind arbitrary values
<div className="bg-[var(--color-primary)] rounded-[var(--radius-lg)]">
  Content
</div>
```

Available CSS variables:

```css
/* Colors */
--color-primary: #1E3A5F
--color-accent: #95BF39
--color-accent-2: #0B8C38
--color-yellow-400: #FBBF24
--color-yellow-500: #F59E0B
/* ... and more */

/* Gradients */
--gradient-hero
--gradient-dashboard-button
--gradient-success
/* ... and more */

/* Typography */
--font-family-primary
--font-size-base
--font-weight-bold
/* ... and more */

/* Spacing */
--spacing-xs
--spacing-md
--spacing-xl
/* ... and more */

/* Shadows */
--shadow-card
--shadow-elevated
--shadow-xl
/* ... and more */
```

### Method 2: TypeScript Tokens (Recommended for JS/TS)

Import and use tokens in TypeScript:

```tsx
import { tokens, colors } from "@/theme";

// Use hex values
const primaryColor = colors.primary.hex; // '#1E3A5F'

// Use RGB values for rgba transformations
const { r, g, b } = colors.primary.rgb;
const transparent = `rgba(${r}, ${g}, ${b}, 0.5)`;

// Use HSL values
const primaryHsl = colors.primary.hsl; // { h: 210, s: 52, l: 25 }

// Use in styles
<div style={{ 
  background: tokens.gradients.hero.css,
  fontSize: tokens.typography.fontSize.xl,
  padding: tokens.spacing.lg
}}>
  Content
</div>
```

### Method 3: Custom CSS Files

Import `tokens.css` in your CSS files:

```css
@import '@/theme/tokens.css';

.my-component {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: var(--transition-smooth);
}

.my-component:hover {
  background: var(--gradient-hero);
  box-shadow: var(--shadow-elevated);
}
```

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#1E3A5F` | Logo, navigation, headings, primary buttons |
| Accent | `#95BF39` | CTAs, highlights, success states |
| Accent-2 | `#0B8C38` | Alternative accent, hover states |

### Yellow Variants

| Shade | Hex | Usage |
|-------|-----|-------|
| Yellow-400 | `#FBBF24` | Dashboard button gradient start |
| Yellow-500 | `#F59E0B` | Dashboard button gradient end |
| Yellow-600 | `#D97706` | Dashboard button hover |

## Gradients

### Hero Gradient
```css
background: var(--gradient-hero);
/* linear-gradient(135deg, #1E3A5F, #95BF39) */
```

### Dashboard Button
```css
background: var(--gradient-dashboard-button);
/* linear-gradient(135deg, #FBBF24, #F59E0B) */
```

### Success Gradient
```css
background: var(--gradient-success);
/* linear-gradient(135deg, #95BF39, #0B8C38) */
```

## Typography

The primary font family is **Nexa Heavy**, with fallbacks to Inter and system fonts:

```css
font-family: var(--font-family-primary);
/* 'Nexa Heavy', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif */
```

### Font Sizes

```css
--font-size-xs: 0.75rem    (12px)
--font-size-sm: 0.875rem   (14px)
--font-size-base: 1rem     (16px)
--font-size-lg: 1.125rem   (18px)
--font-size-xl: 1.25rem    (20px)
--font-size-2xl: 1.5rem    (24px)
--font-size-3xl: 1.875rem  (30px)
--font-size-4xl: 2.25rem   (36px)
```

## Examples

### Button with Primary Color

```tsx
<button 
  className="px-6 py-3 rounded-lg text-white font-semibold"
  style={{ background: 'var(--color-primary)' }}
>
  Primary Button
</button>
```

### Card with Gradient Background

```tsx
<div 
  className="p-6 rounded-xl shadow-sm"
  style={{ 
    background: 'var(--gradient-card-accent)',
    borderLeft: '4px solid var(--color-accent)'
  }}
>
  <h3 style={{ color: 'var(--color-primary)' }}>Card Title</h3>
  <p>Card content</p>
</div>
```

### Dashboard Access Button (Landing Page Style)

```tsx
<button 
  className="px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
  style={{ 
    background: 'var(--gradient-dashboard-button)',
    color: tokens.colors.slate[800].hex
  }}
>
  Tu economizas aqui
</button>
```

## Integration with Existing System

The design tokens are compatible with the existing Tailwind + shadcn/ui setup:

1. **CSS variables** are already used in `src/index.css` for HSL-based theming
2. **New tokens** extend the existing system without conflicts
3. **TypeScript tokens** provide type-safe access to design values
4. **ThemeProvider** injects variables globally, accessible everywhere

## Demo Component

See `src/components/TokensDemo.tsx` for a comprehensive demonstration of all token usage patterns.

## Testing

Run the token tests to verify all values:

```bash
npm test -- tests/tokens.test.ts
```

## Future Enhancements

- Dark mode variants for all tokens
- Animation tokens (durations, easings)
- Breakpoint tokens for responsive design
- Z-index scale for layering
- Additional color shades and tints
