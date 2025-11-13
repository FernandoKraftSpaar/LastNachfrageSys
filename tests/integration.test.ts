/**
 * Integration test to verify date normalization works end-to-end
 */

import { describe, it, expect } from 'vitest';
import { parseCSV, exportToCSV } from '../src/lib/storage';

describe('Date normalization integration', () => {
  it('should normalize various date formats when parsing CSV', () => {
    const csv = `ano_mes,demanda_medida_kw
2025-07-01,450
01/10/2024,480
10/2024,500
202411,520
2024-12,510`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(5);
    
    // YYYY-MM-DD should become YYYY-MM
    expect(result[0].ano_mes).toBe('2025-07');
    expect(result[0].demanda_medida_kw).toBe(450);
    
    // DD/MM/YYYY should become YYYY-MM
    expect(result[1].ano_mes).toBe('2024-10');
    expect(result[1].demanda_medida_kw).toBe(480);
    
    // MM/YYYY should become YYYY-MM
    expect(result[2].ano_mes).toBe('2024-10');
    expect(result[2].demanda_medida_kw).toBe(500);
    
    // YYYYMM should become YYYY-MM
    expect(result[3].ano_mes).toBe('2024-11');
    expect(result[3].demanda_medida_kw).toBe(520);
    
    // YYYY-MM should stay YYYY-MM
    expect(result[4].ano_mes).toBe('2024-12');
    expect(result[4].demanda_medida_kw).toBe(510);
  });

  it('should export dates in YYYY-MM format', () => {
    const data = [
      { ano_mes: '2024-01-15', demanda_contratada_kw: 500, demanda_medida_kw: 450 },
      { ano_mes: '2024-02', demanda_contratada_kw: 500, demanda_medida_kw: 480 },
    ];

    const csv = exportToCSV(data);
    const lines = csv.split('\n');
    
    // Check that dates are sliced to YYYY-MM
    expect(lines[1]).toContain('2024-01,');
    expect(lines[2]).toContain('2024-02,');
  });

  it('should handle round-trip with date normalization', () => {
    const originalCSV = `ano_mes,demanda_medida_kw
2025-07-01,450
01/10/2024,480`;

    const parsed = parseCSV(originalCSV);
    const exported = exportToCSV(parsed);
    const reParsed = parseCSV(exported);

    // All dates should be normalized to YYYY-MM
    expect(reParsed[0].ano_mes).toBe('2025-07');
    expect(reParsed[1].ano_mes).toBe('2024-10');
  });
});
