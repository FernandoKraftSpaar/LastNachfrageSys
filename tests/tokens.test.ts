import { describe, it, expect } from 'vitest';
import { tokens, colors, gradients } from '../src/theme/tokens';

describe('Design Tokens', () => {
  describe('Colors', () => {
    it('should have primary color matching landing page', () => {
      expect(colors.primary.hex).toBe('#1E3A5F');
      expect(colors.primary.hsl).toEqual({ h: 210, s: 52, l: 25 });
    });

    it('should have accent color matching landing page', () => {
      expect(colors.accent.hex).toBe('#95BF39');
      expect(colors.accent.hsl).toEqual({ h: 79, s: 54, l: 49 });
    });

    it('should have accent-2 color matching landing page', () => {
      expect(colors.accent2.hex).toBe('#0B8C38');
      expect(colors.accent2.hsl).toEqual({ h: 141, s: 85, l: 30 });
    });

    it('should have yellow variants for dashboard button', () => {
      expect(colors.yellow[400].hex).toBe('#FBBF24');
      expect(colors.yellow[500].hex).toBe('#F59E0B');
      expect(colors.yellow[600].hex).toBe('#D97706');
    });
  });

  describe('Gradients', () => {
    it('should have hero gradient from primary to accent', () => {
      expect(gradients.hero.from).toBe(colors.primary.css);
      expect(gradients.hero.to).toBe(colors.accent.css);
    });

    it('should have dashboard button gradients', () => {
      expect(gradients.dashboardButton.normal.from).toBe(colors.yellow[400].css);
      expect(gradients.dashboardButton.normal.to).toBe(colors.yellow[500].css);
    });

    it('should have success gradient', () => {
      expect(gradients.success.from).toBe(colors.accent.css);
      expect(gradients.success.to).toBe(colors.accent2.css);
    });
  });

  describe('Typography', () => {
    it('should have Nexa Heavy as primary font', () => {
      expect(tokens.typography.fontFamily.primary).toContain('Nexa Heavy');
    });

    it('should have consistent font sizes', () => {
      expect(tokens.typography.fontSize.base).toBe('1rem');
      expect(tokens.typography.fontSize.xl).toBe('1.25rem');
      expect(tokens.typography.fontSize['4xl']).toBe('2.25rem');
    });
  });

  describe('Spacing', () => {
    it('should have spacing scale', () => {
      expect(tokens.spacing.xs).toBe('0.25rem');
      expect(tokens.spacing.md).toBe('1rem');
      expect(tokens.spacing.xl).toBe('2rem');
    });
  });

  describe('Border Radius', () => {
    it('should have radius scale matching design', () => {
      expect(tokens.radii.sm).toBe('0.25rem');
      expect(tokens.radii.lg).toBe('0.75rem'); // matches --radius
      expect(tokens.radii.full).toBe('9999px');
    });
  });

  describe('Shadows', () => {
    it('should have card shadow defined', () => {
      expect(tokens.shadows.card.css).toContain('hsl(210 20% 30% / 0.08)');
    });

    it('should have elevated shadow defined', () => {
      expect(tokens.shadows.elevated.css).toContain('hsl(210 20% 30% / 0.12)');
    });
  });

  describe('Transitions', () => {
    it('should have smooth transition defined', () => {
      expect(tokens.transitions.smooth.css).toBe('all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });

  describe('Effects', () => {
    it('should have hover scale effects', () => {
      expect(tokens.effects.hoverScale.sm).toBe('scale(1.02)');
      expect(tokens.effects.hoverScale.md).toBe('scale(1.05)');
    });

    it('should have glass effect properties', () => {
      expect(tokens.effects.glass.backdrop).toBe('blur(10px)');
    });
  });
});
