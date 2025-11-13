/**
 * Unit tests for dateUtils - normalizeAnoMes function
 */

import { describe, it, expect } from 'vitest';
import { normalizeAnoMes } from '../src/lib/dateUtils';

describe('normalizeAnoMes', () => {
  describe('DD/MM/YYYY format', () => {
    it('should normalize 01/10/2020 to 2020-10', () => {
      expect(normalizeAnoMes('01/10/2020')).toBe('2020-10');
    });

    it('should normalize 15/05/2024 to 2024-05', () => {
      expect(normalizeAnoMes('15/05/2024')).toBe('2024-05');
    });

    it('should normalize D/M/YYYY format', () => {
      expect(normalizeAnoMes('1/5/2024')).toBe('2024-05');
      expect(normalizeAnoMes('5/12/2023')).toBe('2023-12');
    });
  });

  describe('DD-MM-YYYY format', () => {
    it('should normalize 01-10-2020 to 2020-10', () => {
      expect(normalizeAnoMes('01-10-2020')).toBe('2020-10');
    });

    it('should normalize 15-05-2024 to 2024-05', () => {
      expect(normalizeAnoMes('15-05-2024')).toBe('2024-05');
    });
  });

  describe('YYYY-MM-DD format', () => {
    it('should normalize 2020-10-01 to 2020-10', () => {
      expect(normalizeAnoMes('2020-10-01')).toBe('2020-10');
    });

    it('should normalize 2024-05-15 to 2024-05', () => {
      expect(normalizeAnoMes('2024-05-15')).toBe('2024-05');
    });

    it('should normalize 2025-07-01 to 2025-07', () => {
      expect(normalizeAnoMes('2025-07-01')).toBe('2025-07');
    });
  });

  describe('MM/YYYY format', () => {
    it('should normalize 10/2020 to 2020-10', () => {
      expect(normalizeAnoMes('10/2020')).toBe('2020-10');
    });

    it('should normalize 05/2024 to 2024-05', () => {
      expect(normalizeAnoMes('05/2024')).toBe('2024-05');
    });

    it('should normalize M/YYYY format', () => {
      expect(normalizeAnoMes('5/2024')).toBe('2024-05');
    });
  });

  describe('YYYYMM format', () => {
    it('should normalize 202010 to 2020-10', () => {
      expect(normalizeAnoMes('202010')).toBe('2020-10');
    });

    it('should normalize 202405 to 2024-05', () => {
      expect(normalizeAnoMes('202405')).toBe('2024-05');
    });
  });

  describe('YYYY-MM format (already normalized)', () => {
    it('should keep 2020-10 as 2020-10', () => {
      expect(normalizeAnoMes('2020-10')).toBe('2020-10');
    });

    it('should keep 2024-05 as 2024-05', () => {
      expect(normalizeAnoMes('2024-05')).toBe('2024-05');
    });

    it('should normalize YYYY-M to YYYY-MM', () => {
      expect(normalizeAnoMes('2024-5')).toBe('2024-05');
    });
  });

  describe('YYYY/MM format', () => {
    it('should normalize 2020/10 to 2020-10', () => {
      expect(normalizeAnoMes('2020/10')).toBe('2020-10');
    });

    it('should normalize 2024/05 to 2024-05', () => {
      expect(normalizeAnoMes('2024/05')).toBe('2024-05');
    });
  });

  describe('Edge cases', () => {
    it('should return empty string for undefined', () => {
      expect(normalizeAnoMes(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(normalizeAnoMes('')).toBe('');
    });

    it('should return empty string for whitespace', () => {
      expect(normalizeAnoMes('   ')).toBe('');
    });

    it('should handle quoted values', () => {
      expect(normalizeAnoMes('"2024-05"')).toBe('2024-05');
      expect(normalizeAnoMes('"01/10/2020"')).toBe('2020-10');
    });

    it('should return empty string for invalid format', () => {
      expect(normalizeAnoMes('invalid')).toBe('');
      expect(normalizeAnoMes('not-a-date')).toBe('');
    });

    it('should handle 2-digit years', () => {
      expect(normalizeAnoMes('01/10/23')).toBe('2023-10');
      expect(normalizeAnoMes('01/10/99')).toBe('1999-10');
    });
  });
});
