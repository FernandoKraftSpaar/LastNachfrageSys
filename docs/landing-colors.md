# Landing Page Color Extraction

## Source
- Repository: `FernandoKraftSpaar/LandingSeiteTEST`
- File: `index.html`
- Commit: `5348f866768cf9c3450f28acd6dab398b50350e1`
- URL: https://github.com/FernandoKraftSpaar/LandingSeiteTEST/blob/main/index.html

## Primary Colors (Line 2 in <style> section)

### Core Brand Colors
```css
:root { 
  --primary: #1E3A5F;    /* Dark blue - main brand color */
  --accent: #95BF39;     /* Lime green - primary accent */
  --accent-2: #0B8C38;   /* Dark green - secondary accent */
}
```

### Color Values in Different Formats

#### Primary Blue (#1E3A5F)
- **Hex**: `#1E3A5F`
- **RGB**: `rgb(30, 58, 95)`
- **HSL**: `hsl(210, 52%, 25%)`
- **Usage**: Logo, navigation text, headings, primary buttons, section borders

#### Accent Green (#95BF39)
- **Hex**: `#95BF39`
- **RGB**: `rgb(149, 191, 57)`
- **HSL**: `hsl(79, 54%, 49%)`
- **Usage**: Hero gradient (to), CTA buttons, service card accents, step indicators

#### Accent-2 Dark Green (#0B8C38)
- **Hex**: `#0B8C38`
- **RGB**: `rgb(11, 140, 56)`
- **HSL**: `hsl(141, 85%, 30%)`
- **Usage**: Hero CTA button, hover states, service highlights

### Yellow Variants (Tailwind classes)
- **Yellow-400**: `#FBBF24` (approx.)
- **Yellow-500**: `#F59E0B` (approx.)
- **Yellow-600**: `#D97706` (approx.)
- **Yellow-100**: `#FEF3C7` (approx.)
- **Yellow-50**: `#FFFBEB` (approx.)
- **Usage**: Dashboard access button gradient, solar service card backgrounds

### Gray Scale (Tailwind classes)
- **Gray-50**: `#F9FAFB` (approx.)
- **Slate-800**: `#1E293B` (approx.)
- **Slate-700**: `#334155` (approx.)
- **Slate-600**: `#475569` (approx.)
- **Usage**: Page background, text colors, borders

## Gradients

### Hero Section Gradient (Line 84)
```css
background: linear-gradient(to right, var(--primary), var(--accent));
/* Expands to: linear-gradient(to right, #1E3A5F, #95BF39) */
```
- **From**: `#1E3A5F` (Primary blue)
- **To**: `#95BF39` (Accent green)
- **Direction**: Left to right (135deg equivalent)

### Dashboard Access Button Gradient (Line 95)
```css
background: linear-gradient(to right, yellow-400, yellow-500);
hover: linear-gradient(to right, yellow-500, yellow-600);
```
- **Normal**: `#FBBF24` → `#F59E0B`
- **Hover**: `#F59E0B` → `#D97706`

### Service Card Gradients
1. **Demand Service** (Line 114):
   ```css
   background: linear-gradient(to right, white, rgba(149, 191, 57, 0.1));
   /* From white to accent/10 opacity */
   ```

2. **Load Management** (Line 124):
   ```css
   background: linear-gradient(to right, white, rgba(30, 58, 95, 0.1));
   /* From white to primary/10 opacity */
   ```

3. **Efficiency Projects** (Line 134):
   ```css
   background: linear-gradient(to right, white, rgba(11, 140, 56, 0.1));
   /* From white to accent-2/10 opacity */
   ```

4. **Solar GD** (Line 144):
   ```css
   background: linear-gradient(to right, white, yellow-100);
   /* From white to light yellow */
   ```

### Institutional Section Gradient (Line 155)
```css
background: linear-gradient(to right, rgba(30, 58, 95, 0.05), rgba(149, 191, 57, 0.05));
/* Subtle gradient from primary/5 to accent/5 */
```

## Visual Effects

### Shadows
- **Card Shadow**: `shadow-sm` (Tailwind default)
- **Enhanced Shadow**: `shadow-lg` (used on dashboard button)
- **Hover Shadow**: `hover:shadow-xl` (interactive elements)

### Borders
- **Service Cards**: 4px left border in respective accent colors
- **Button Borders**: 1px solid in primary color for outlined buttons

### Transitions
- **Transform Scale**: `hover:scale-105` (cards)
- **Color Transitions**: `transition-colors` (buttons)
- **All Properties**: `transition-all duration-200` (dashboard button)
- **Transform Only**: `transition-transform duration-300` (service cards)

## Typography
- **Font Family**: `'Nexa Heavy', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`
- **Text Colors**:
  - Primary text: `text-slate-900`
  - Secondary text: `text-slate-700`, `text-slate-600`
  - White text on colored backgrounds: `text-white`
  - Dashboard button: `text-slate-800` (on yellow gradient)

## Opacity Usage
- `/10` = 10% opacity (0.1)
- `/5` = 5% opacity (0.05)
- `/20` = 20% opacity (0.2)
- `/90` = 90% opacity (0.9)

## Mapping to Current Design System

The current `src/index.css` already uses HSL format. Here's the mapping:

| Landing Color | Hex Value | Current Token | HSL Equivalent |
|--------------|-----------|---------------|----------------|
| --primary | `#1E3A5F` | --primary | `210 52% 25%` ✓ |
| --accent | `#95BF39` | --accent | `79 54% 49%` ✓ |
| --accent-2 | `#0B8C38` | --accent-2 | `141 85% 30%` ✓ |

**Note**: The current design system already has the exact same colors! This extraction validates the existing implementation.
