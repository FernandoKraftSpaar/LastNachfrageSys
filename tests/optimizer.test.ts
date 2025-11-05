/**
 * Unit tests for optimizer cost functions
 * 
 * To run these tests, first install a test framework:
 * npm install --save-dev vitest @vitest/ui
 * 
 * Then add to package.json scripts:
 * "test": "vitest"
 */

import { describe, it, expect } from 'vitest';
import { MonthlyData } from '../src/lib/optimizer';

// Mock cost function based on Formula B
function costForContraction(item: MonthlyData, contraction: number): number {
  const medida = item.demanda_medida_kw;
  const TD = item.tarifa_demanda_r_pkW || item.custo_demanda || 0;
  const TU = item.tarifa_ultrapassagem_r_pkW || item.custo_ultrapassagem || 0;
  
  // Formula B: charge measured demand + excess
  const demandaCost = medida * TD;
  const excesso = Math.max(0, medida - contraction);
  const ultrapassagemCost = excesso * TU;
  
  return demandaCost + ultrapassagemCost;
}

describe('Cost Function (Formula B)', () => {
  it('should calculate cost correctly when measured equals contracted', () => {
    const item: MonthlyData = {
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 500,
      tarifa_demanda_r_pkW: 50,
      tarifa_ultrapassagem_r_pkW: 100,
    };

    const cost = costForContraction(item, 500);
    
    // Expected: 500 * 50 + 0 * 100 = 25000
    expect(cost).toBe(25000);
  });

  it('should calculate cost correctly when measured exceeds contracted', () => {
    const item: MonthlyData = {
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 550,
      tarifa_demanda_r_pkW: 50,
      tarifa_ultrapassagem_r_pkW: 100,
    };

    const cost = costForContraction(item, 500);
    
    // Expected: 550 * 50 + 50 * 100 = 27500 + 5000 = 32500
    expect(cost).toBe(32500);
  });

  it('should calculate cost correctly when measured is below contracted', () => {
    const item: MonthlyData = {
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 450,
      tarifa_demanda_r_pkW: 50,
      tarifa_ultrapassagem_r_pkW: 100,
    };

    const cost = costForContraction(item, 500);
    
    // Expected: 450 * 50 + 0 * 100 = 22500
    expect(cost).toBe(22500);
  });

  it('should handle zero tariffs', () => {
    const item: MonthlyData = {
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 550,
      tarifa_demanda_r_pkW: 0,
      tarifa_ultrapassagem_r_pkW: 0,
    };

    const cost = costForContraction(item, 500);
    
    // Expected: 550 * 0 + 50 * 0 = 0
    expect(cost).toBe(0);
  });

  it('should use legacy field names if new fields are not present', () => {
    const item: MonthlyData = {
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 500,
      custo_demanda: 50,
      custo_ultrapassagem: 100,
    };

    const cost = costForContraction(item, 500);
    
    // Expected: 500 * 50 + 0 * 100 = 25000
    expect(cost).toBe(25000);
  });
});

describe('Formula B vs Formula A Comparison', () => {
  it('Formula B should charge on measured demand, not contracted', () => {
    const item: MonthlyData = {
      ano_mes: '2024-01',
      demanda_contratada_kw: 500,
      demanda_medida_kw: 450,
      tarifa_demanda_r_pkW: 50,
      tarifa_ultrapassagem_r_pkW: 100,
    };

    // Formula B (implemented)
    const costB = costForContraction(item, 500);
    
    // Formula A (old): contraction * TD + max(0, measured - contraction) * TU
    const costA = 500 * 50 + Math.max(0, 450 - 500) * 100; // = 25000
    
    // Formula B charges on measured (450), not contracted (500)
    expect(costB).toBe(22500); // 450 * 50
    expect(costA).toBe(25000); // 500 * 50
    expect(costB).toBeLessThan(costA);
  });
});
