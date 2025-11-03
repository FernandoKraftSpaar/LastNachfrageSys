// Utility functions for optimization calculations

export interface MonthlyData {
  ano_mes: string;
  demanda_contratada_kw: number;
  demanda_medida_kw: number;
  custo_demanda?: number;
  custo_ultrapassagem?: number;
}

export interface OptimizationParams {
  risco: number;
  min_contract_kw: number;
  step_size_kw: number;
  gridPoints: number;
  delay_months: number;
  reduction_frequency_months: number;
  lastReductionMonths?: number;
  data_base: string;
  igpm_mensal_pct: Record<string, number>;
  tarifa_demanda?: number;
  tarifa_ultrapassagem?: number;
}

export interface OptimizationResult {
  economia_corr: number;
  x: number;
  s_req: number;
  s_eff: number;
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function linspace(start: number, end: number, n: number): number[] {
  const step = (end - start) / (n - 1);
  return Array.from({ length: n }, (_, i) => start + i * step);
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function costForContraction(item: MonthlyData, contraction: number): number {
  const demandaCost = contraction * (item.custo_demanda || 0);
  const excesso = Math.max(0, item.demanda_medida_kw - contraction);
  const ultrapassagemCost = excesso * (item.custo_ultrapassagem || 0);
  return demandaCost + ultrapassagemCost;
}

function igpmFactor(
  anoMes: string,
  dataBase: string,
  igpmMensalPct: Record<string, number>
): number {
  // Simple implementation - would need actual IGPM data
  // For now, return 1 (no correction)
  return 1;
}

export function optimizeWithTiming(
  items: MonthlyData[],
  params: OptimizationParams
): OptimizationResult {
  const T = items.length;
  const medidas = items
    .map((it) => Number(it.demanda_medida_kw || 0))
    .filter((v) => v > 0);

  const q = quantile(medidas, 1 - params.risco / 100);
  const lower = Math.max(q, params.min_contract_kw || 0);
  const upper = Math.max(lower, Math.max(...medidas) * 1.1);
  const candidates = linspace(lower, upper, params.gridPoints || 30).map((c) =>
    roundToStep(c, params.step_size_kw)
  );

  // Remove duplicates after rounding
  const uniqCandidates = [...new Set(candidates)].sort((a, b) => a - b);

  // Precompute cost matrix
  const costMatrix = uniqCandidates.map((c) =>
    items.map((it) => costForContraction(it, c))
  );

  // Base costs
  const baseCosts = items.map((it) =>
    costForContraction(it, it.demanda_contratada_kw)
  );

  let best: OptimizationResult = {
    economia_corr: -Infinity,
    x: 0,
    s_req: 0,
    s_eff: 0,
  };

  for (let i = 0; i < uniqCandidates.length; i++) {
    const x = uniqCandidates[i];
    for (let s_req = 1; s_req <= T; s_req++) {
      const s_eff = s_req + (params.delay_months || 0);
      if (s_eff > T) continue;

      // Frequency rule
      const C_ref = avg(items.map((it) => it.demanda_contratada_kw));
      if (
        x < C_ref &&
        (params.lastReductionMonths ?? Infinity) <
          params.reduction_frequency_months
      )
        continue;

      // Calculate corrected savings
      let economia_corr = 0;
      for (let t = s_eff; t <= T; t++) {
        const delta = baseCosts[t - 1] - costMatrix[i][t - 1];
        const fator = igpmFactor(
          items[t - 1].ano_mes,
          params.data_base,
          params.igpm_mensal_pct || {}
        );
        economia_corr += Math.max(0, delta) * fator;
      }

      if (economia_corr > best.economia_corr) {
        best = { economia_corr, x, s_req, s_eff };
      }
    }
  }

  return best;
}
