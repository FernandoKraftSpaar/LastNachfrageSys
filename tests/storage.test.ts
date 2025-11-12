/**
 * Unit tests for CSV/JSON parsing utilities
 * 
 * To run these tests, first install a test framework:
 * npm install --save-dev vitest @vitest/ui
 */

import { describe, it, expect } from 'vitest';
import { parseCSV, parseJSON, exportToCSV, exportToJSON } from '../src/lib/storage';

describe('CSV Parser', () => {
  it('should parse valid CSV with all columns', () => {
    const csv = `ano_mes,demanda_contratada_kw,demanda_medida_kw,tarifa_demanda_r_pkW,tarifa_ultrapassagem_r_pkW
2024-01,500,450,52.50,105.00
2024-02,500,480,52.50,105.00`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 450,
      tarifa_demanda_r_pkW: 52.50,
      tarifa_ultrapassagem_r_pkW: 105.00,
    });
    expect(result[1].ano_mes).toBe('2024-02');
  });

  it('should handle CSV with missing optional columns', () => {
    const csv = `ano_mes,demanda_contratada_kw,demanda_medida_kw
2024-01,500,450
2024-02,500,480`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].tarifa_demanda_r_pkW).toBeUndefined();
    expect(result[0].tarifa_ultrapassagem_r_pkW).toBeUndefined();
  });

  it('should handle empty lines in CSV', () => {
    const csv = `ano_mes,demanda_contratada_kw,demanda_medida_kw
2024-01,500,450

2024-02,500,480`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
  });

  it('should throw error for CSV without header', () => {
    const csv = `500,450,52.50,105.00`;

    expect(() => parseCSV(csv)).toThrow();
  });

  it('should throw error for CSV without ano_mes column', () => {
    const csv = `month,value
2024-01,500`;

    expect(() => parseCSV(csv)).toThrow('data');
  });

  it('should parse CSV with semicolon delimiter', () => {
    const csv = `ano_mes;demanda_medida_kw
2024-01;450
2024-02;480`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].ano_mes).toBe('2024-01');
    expect(result[0].demanda_medida_kw).toBe(450);
  });

  it('should parse numeric values with comma decimal separator', () => {
    const csv = `ano_mes;demanda_medida_kw;demanda_contratada_kw
2024-01;1.234,56;1.500,00
2024-02;2.345,67;1.500,00`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].demanda_medida_kw).toBe(1234.56);
    expect(result[0].demanda_contratada_kw).toBe(1500);
    expect(result[1].demanda_medida_kw).toBe(2345.67);
  });

  it('should parse currency values with symbols', () => {
    const csv = `ano_mes;tarifa_demanda_r_pkW;tarifa_ultrapassagem_r_pkW
2024-01;R$ 52,50;R$ 105,00
2024-02;52,50;105,00`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].tarifa_demanda_r_pkW).toBe(52.50);
    expect(result[0].tarifa_ultrapassagem_r_pkW).toBe(105);
    expect(result[1].tarifa_demanda_r_pkW).toBe(52.50);
  });

  it('should handle quoted fields with embedded delimiters', () => {
    const csv = `ano_mes,demanda_medida_kw
"2024-01","450,50"
"2024-02","480,75"`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].ano_mes).toBe('2024-01');
    expect(result[0].demanda_medida_kw).toBe(450.50);
  });

  it('should convert DD/MM/YYYY dates to YYYY-MM format', () => {
    const csv = `date;demanda_medida_kw
01/01/2024;450
15/02/2024;480
31/12/2023;520`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0].ano_mes).toBe('2024-01');
    expect(result[1].ano_mes).toBe('2024-02');
    expect(result[2].ano_mes).toBe('2023-12');
  });

  it('should convert various date formats to YYYY-MM', () => {
    const csv = `data,demanda
2024-03-15,450
03/2024,480
2024-04,520`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(3);
    expect(result[0].ano_mes).toBe('2024-03');
    expect(result[1].ano_mes).toBe('2024-03');
    expect(result[2].ano_mes).toBe('2024-04');
  });

  it('should detect column names with Portuguese variations', () => {
    const csv = `Data;Demanda Medida (kW);Demanda Contratada (kW)
01/01/2024;1.234,56;1.500,00
15/02/2024;2.345,67;1.500,00`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].ano_mes).toBe('2024-01');
    expect(result[0].demanda_medida_kw).toBe(1234.56);
    expect(result[0].demanda_contratada_kw).toBe(1500);
  });

  it('should infer demand column from first numeric column when not found by name', () => {
    const csv = `mes,valor
2024-01,450.5
2024-02,480.75`;

    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].ano_mes).toBe('2024-01');
    expect(result[0].demanda_medida_kw).toBe(450.5);
    expect(result[1].demanda_medida_kw).toBe(480.75);
  });
});

describe('JSON Parser', () => {
  it('should parse valid JSON array', () => {
    const json = `[
      {
        "ano_mes": "2024-01",
        "demanda_contratada_kw": 500,
        "demanda_medida_kw": 450,
        "tarifa_demanda_r_pkW": 52.50,
        "tarifa_ultrapassagem_r_pkW": 105.00
      }
    ]`;

    const result = parseJSON(json);

    expect(result).toHaveLength(1);
    expect(result[0].ano_mes).toBe('2024-01');
    expect(result[0].demanda_contratada_kw).toBe(500);
  });

  it('should handle JSON with missing fields using defaults', () => {
    const json = `[
      {
        "ano_mes": "2024-01",
        "demanda_contratada_kw": 500,
        "demanda_medida_kw": 450
      }
    ]`;

    const result = parseJSON(json);

    expect(result[0].tarifa_demanda_r_pkW).toBe(50); // default
    expect(result[0].tarifa_ultrapassagem_r_pkW).toBe(100); // default
  });

  it('should throw error for non-array JSON', () => {
    const json = `{"ano_mes": "2024-01"}`;

    expect(() => parseJSON(json)).toThrow('array');
  });

  it('should throw error for invalid JSON', () => {
    const json = `{invalid json}`;

    expect(() => parseJSON(json)).toThrow();
  });
});

describe('CSV Export', () => {
  it('should export data to CSV format', () => {
    const data = [
      {
        ano_mes: '2024-01',
        demanda_contratada_kw: 500,
        demanda_medida_kw: 450,
        tarifa_demanda_r_pkW: 52.50,
        tarifa_ultrapassagem_r_pkW: 105.00,
      },
    ];

    const csv = exportToCSV(data);

    expect(csv).toContain('ano_mes,demanda_contratada_kw');
    expect(csv).toContain('2024-01,500,450,52.5,105');
  });

  it('should handle legacy field names', () => {
    const data = [
      {
        ano_mes: '2024-01',
        demanda_contratada_kw: 500,
        demanda_medida_kw: 450,
        custo_demanda: 50,
        custo_ultrapassagem: 100,
      },
    ];

    const csv = exportToCSV(data);

    expect(csv).toContain('50,100');
  });
});

describe('JSON Export', () => {
  it('should export data to JSON format', () => {
    const data = [
      {
        ano_mes: '2024-01',
        demanda_contratada_kw: 500,
        demanda_medida_kw: 450,
        tarifa_demanda_r_pkW: 52.50,
        tarifa_ultrapassagem_r_pkW: 105.00,
      },
    ];

    const json = exportToJSON(data);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].ano_mes).toBe('2024-01');
  });

  it('should format JSON with indentation', () => {
    const data = [
      {
        ano_mes: '2024-01',
        demanda_contratada_kw: 500,
        demanda_medida_kw: 450,
      },
    ];

    const json = exportToJSON(data);

    expect(json).toContain('\n'); // Has newlines (formatted)
    expect(json).toContain('  '); // Has indentation
  });
});

describe('Round-trip CSV conversion', () => {
  it('should preserve data through export and import', () => {
    const original = [
      {
        ano_mes: '2024-01',
        demanda_contratada_kw: 500,
        demanda_medida_kw: 450,
        tarifa_demanda_r_pkW: 52.50,
        tarifa_ultrapassagem_r_pkW: 105.00,
      },
      {
        ano_mes: '2024-02',
        demanda_contratada_kw: 500,
        demanda_medida_kw: 480,
        tarifa_demanda_r_pkW: 52.50,
        tarifa_ultrapassagem_r_pkW: 105.00,
      },
    ];

    const csv = exportToCSV(original);
    const parsed = parseCSV(csv);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].ano_mes).toBe(original[0].ano_mes);
    expect(parsed[0].demanda_contratada_kw).toBe(original[0].demanda_contratada_kw);
    expect(parsed[1].demanda_medida_kw).toBe(original[1].demanda_medida_kw);
  });
});
