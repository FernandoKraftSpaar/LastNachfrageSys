// Utility functions for optimization calculations

import { preprocessSeries, computeSeasonalIndex, deseasonalize } from "./analysis";

export interface MonthlyData {
  ano_mes: string;
  demanda_contratada_kw: number;
  demanda_medida_kw: number;
  tarifa_demanda_r_pkW?: number;
  tarifa_ultrapassagem_r_pkW?: number;
  // Legacy support
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
  // Novo parâmetro de penalidade (β) usado em analysis.ts (findOptimalDGridSearch)
  penalty_beta?: number;
  // Novo: habilita dessazonalização no processo de geração de candidatos
  useDeseasonalize?: boolean;
  seasonal_period?: number; // default 12
}

export interface OptimizationResult {
  economia_corr: number;
  x: number;
  s_req: number;
  s_eff: number;
}

export interface RecontractAction {
  month: number; // 1-based index
  s_req: number; // Request month
  s_eff: number; // Effective month
  level_kw: number; // New contracted level
  type: 'increase' | 'reduction' | 'initial';
}

export interface MonthlyBreakdown {
  month: number;
  ano_mes: string;
  contratada_kw: number;
  medida_kw: number;
  custo_real: number;
  custo_otimo: number;
  poupanca: number;
}

export interface DPOptimizationResult extends OptimizationResult {
  recontracts: RecontractAction[];
  monthlyBreakdown: MonthlyBreakdown[];
  totalSavings: number;
  totalCostReal: number;
  totalCostOptimized: number;
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

/**
 * Cost calculation aligned with analysis.ts (evaluateCostForD):
 * total = contractedLevel * TD + max(0, medida - contractedLevel) * TU
 *
 * Isso cobra o custo fixo do contratado (por kW contratado) e penaliza somente o excesso.
 */
function costForContraction(item: MonthlyData, contraction: number): number {
  const medida = item.demanda_medida_kw;
  // Prefer explicit tarifa fields, mas mantém compatibilidade com campos legados
  const TD = item.tarifa_demanda_r_pkW ?? item.custo_demanda ?? 0;
  const TU = item.tarifa_ultrapassagem_r_pkW ?? item.custo_ultrapassagem ?? 0;

  const baseCost = contraction * TD;
  const excesso = Math.max(0, medida - contraction);
  const ultrapassagemCost = excesso * TU;

  return baseCost + ultrapassagemCost;
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
  const seasonalPeriod = params.seasonal_period ?? 12;

  // Raw measured series (used for cost calculation)
  const measuredSeries = items.map((it) => Number(it.demanda_medida_kw || 0)).filter(v => v > 0);

  // Optionally compute dessazonalized series and use it for stats / geração de candidatos
  let seriesForCandidates: number[] = measuredSeries;
  if (params.useDeseasonalize) {
    try {
      const preprocessed = preprocessSeries(measuredSeries);
      const seasonalIndices = computeSeasonalIndex(preprocessed, seasonalPeriod);
      const deseasonalized = deseasonalize(preprocessed, seasonalIndices);
      // Use deseasonalized for quantil e limites
      seriesForCandidates = deseasonalized.map(v => Number(v));
    } catch (err) {
      // Fallback para a série original caso haja erro na dessazonalização
      seriesForCandidates = measuredSeries;
    }
  }

  const medidas = seriesForCandidates.filter((v) => v > 0);

  const q = quantile(medidas, 1 - params.risco / 100);
  const lower = Math.max(q, params.min_contract_kw || 0);
  const upper = Math.max(lower, Math.max(...measuredSeries) * 1.1);
  const candidates = linspace(lower, upper, params.gridPoints || 30).map((c) =>
    roundToStep(c, params.step_size_kw)
  );

  // Remove duplicates after rounding
  const uniqCandidates = [...new Set(candidates)].sort((a, b) => a - b);

  // Precompute cost matrix (usa medidas reais)
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

      // Calculate corrected savings (uses cost matrix based on real measures)
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

      // Aplicar penalidade β baseada na taxa de ultrapassagem objetivo (params.risco)
      const penaltyBeta = params.penalty_beta ?? 0;
      if (penaltyBeta > 0) {
        // Considera apenas o horizonte de efetivação (de s_eff até T)
        const startIdx = s_eff - 1;
        const endIdx = T - 1;
        const effectiveMonths = Math.max(0, endIdx - startIdx + 1);
        if (effectiveMonths > 0) {
          let exceedances = 0;
          for (let t = startIdx; t <= endIdx; t++) {
            if (items[t].demanda_medida_kw > x) exceedances++;
          }
          const exceedanceRate = exceedances / effectiveMonths;
          const targetRate = params.risco / 100; // params.risco vem em %
          const deviation = exceedanceRate - targetRate;
          const penalty = penaltyBeta * deviation * deviation;
          // Subtrai penalidade da economia_corr (penaliza candidatos que se desviam do target)
          economia_corr -= penalty;
        }
      }

      if (economia_corr > best.economia_corr) {
        best = { economia_corr, x, s_req, s_eff };
      }
    }
  }

  return best;
}

/**
 * Dynamic Programming optimizer that supports multiple recontracts
 * with delays and reduction frequency constraints.
 * 
 * Rules:
 * - Increases: unlimited per year, s_eff = s_req + 1 month
 * - Reductions: max 1 per 12 months, s_eff = s_req + 3 months
 */
export function optimizeSequenceDP(
  items: MonthlyData[],
  params: OptimizationParams
): DPOptimizationResult {
  const T = items.length;
  if (T === 0) {
    throw new Error("No monthly data provided");
  }

  const seasonalPeriod = params.seasonal_period ?? 12;

  // Raw measured series (used for cost calculation)
  const measuredSeries = items.map((it) => Number(it.demanda_medida_kw || 0)).filter(v => v > 0);

  // Optionally compute dessazonalized series and use it for stats / geração de candidatos
  let seriesForCandidates: number[] = measuredSeries;
  if (params.useDeseasonalize) {
    try {
      const preprocessed = preprocessSeries(measuredSeries);
      const seasonalIndices = computeSeasonalIndex(preprocessed, seasonalPeriod);
      const deseasonalized = deseasonalize(preprocessed, seasonalIndices);
      seriesForCandidates = deseasonalized.map(v => Number(v));
    } catch (err) {
      seriesForCandidates = measuredSeries;
    }
  }

  const medidas = seriesForCandidates.filter((v) => v > 0);

  const q = quantile(medidas, 1 - params.risco / 100);
  const lower = Math.max(q, params.min_contract_kw || 0);
  const upper = Math.max(lower, Math.max(...measuredSeries) * 1.1);
  const candidates = linspace(lower, upper, params.gridPoints || 30).map((c) =>
    roundToStep(c, params.step_size_kw)
  );

  const uniqCandidates = [...new Set(candidates)].sort((a, b) => a - b);
  const C = uniqCandidates.length;

  // Precompute cost matrix: costMatrix[c][t] = cost at month t with level c
  // Note: costForContraction já usa a fórmula contratada*TD + excesso*TU
  const costMatrix: number[][] = uniqCandidates.map((level) =>
    items.map((it) => costForContraction(it, level))
  );

  // Base costs (current contract)
  const baseCosts = items.map((it) =>
    costForContraction(it, it.demanda_contratada_kw)
  );

  // DP state: dp[t][c][lastReduction]
  // t = month (0-based), c = candidate index, lastReduction = months since last reduction
  const INF = 1e18;
  const dp: number[][][] = Array(T + 1)
    .fill(0)
    .map(() =>
      Array(C)
        .fill(0)
        .map(() => Array(13).fill(INF))
    );

  // Backtrack structure to reconstruct solution
  interface BacktrackState {
    prevMonth: number;
    prevLevel: number;
    prevLastReduction: number;
    actionType: 'increase' | 'reduction' | 'initial' | 'none';
    requestMonth: number;
  }

  const backtrack: (BacktrackState | null)[][][] = Array(T + 1)
    .fill(0)
    .map(() =>
      Array(C)
        .fill(0)
        .map(() => Array(13).fill(null))
    );

  // Initial state: start with current contracted level
  const initialLevel = items[0].demanda_contratada_kw;
  const initialCandidateIdx = uniqCandidates.reduce(
    (bestIdx, level, idx) =>
      Math.abs(level - initialLevel) < Math.abs(uniqCandidates[bestIdx] - initialLevel)
        ? idx
        : bestIdx,
    0
  );

  dp[0][initialCandidateIdx][12] = 0; // Start with no recent reduction (12+ months ago)

  // DP transition
  for (let t = 0; t < T; t++) {
    for (let c = 0; c < C; c++) {
      for (let lr = 0; lr <= 12; lr++) {
        if (dp[t][c][lr] >= INF) continue;

        const currentCost = dp[t][c][lr];
        const currentLevel = uniqCandidates[c];

        // Option 1: Keep same level (no recontract)
        const nextLr = Math.min(lr + 1, 12);
        if (dp[t + 1][c][nextLr] > currentCost + costMatrix[c][t]) {
          dp[t + 1][c][nextLr] = currentCost + costMatrix[c][t];
          backtrack[t + 1][c][nextLr] = {
            prevMonth: t,
            prevLevel: c,
            prevLastReduction: lr,
            actionType: 'none',
            requestMonth: -1,
          };
        }

        // Option 2: Recontract to a different level
        for (let newC = 0; newC < C; newC++) {
          if (newC === c) continue;

          const newLevel = uniqCandidates[newC];
          const isIncrease = newLevel > currentLevel;
          const isReduction = newLevel < currentLevel;

          // Determine delay
          const delay = isIncrease ? 1 : 3;
          const s_req = t + 1; // Request in next month (1-based)
          const s_eff = s_req + delay; // Effective month

          if (s_eff > T) continue; // Can't take effect within horizon

          // Check reduction frequency constraint
          if (isReduction && lr < params.reduction_frequency_months) {
            continue; // Too soon for another reduction
          }

          // Calculate cost: keep current level until s_eff, then switch
          let transitionCost = 0;
          for (let month = t; month < Math.min(s_eff - 1, T); month++) {
            transitionCost += costMatrix[c][month];
          }

          const nextLr = isReduction ? 0 : Math.min(lr + (s_eff - t), 12);
          const nextMonth = s_eff - 1; // 0-based

          if (nextMonth >= T) continue;

          if (dp[nextMonth + 1][newC][nextLr] > currentCost + transitionCost) {
            dp[nextMonth + 1][newC][nextLr] = currentCost + transitionCost;
            backtrack[nextMonth + 1][newC][nextLr] = {
              prevMonth: t,
              prevLevel: c,
              prevLastReduction: lr,
              actionType: isReduction ? 'reduction' : 'increase',
              requestMonth: s_req,
            };
          }
        }
      }
    }
  }

  // Find best final state
  let bestCost = INF;
  let bestC = 0;
  let bestLr = 0;

  for (let c = 0; c < C; c++) {
    for (let lr = 0; lr <= 12; lr++) {
      if (dp[T][c][lr] < bestCost) {
        bestCost = dp[T][c][lr];
        bestC = c;
        bestLr = lr;
      }
    }
  }

  if (bestCost >= INF) {
    // Fallback to simple optimization
    const simple = optimizeWithTiming(items, params);
    return {
      ...simple,
      recontracts: [],
      monthlyBreakdown: items.map((item, idx) => ({
        month: idx + 1,
        ano_mes: item.ano_mes,
        contratada_kw: item.demanda_contratada_kw,
        medida_kw: item.demanda_medida_kw,
        custo_real: baseCosts[idx],
        custo_otimo: baseCosts[idx],
        poupanca: 0,
      })),
      totalSavings: 0,
      totalCostReal: baseCosts.reduce((a, b) => a + b, 0),
      totalCostOptimized: baseCosts.reduce((a, b) => a + b, 0),
    };
  }

  // Reconstruct solution
  const recontracts: RecontractAction[] = [];
  const contractedLevels: number[] = Array(T).fill(initialLevel);

  let currMonth = T;
  let currC = bestC;
  let currLr = bestLr;

  while (currMonth > 0) {
    const bt = backtrack[currMonth][currC][currLr];
    if (!bt) break;

    if (bt.actionType === 'increase' || bt.actionType === 'reduction') {
      const s_req = bt.requestMonth;
      const delay = bt.actionType === 'increase' ? 1 : 3;
      const s_eff = s_req + delay;

      recontracts.unshift({
        month: currMonth,
        s_req,
        s_eff,
        level_kw: uniqCandidates[currC],
        type: bt.actionType,
      });

      // Fill contracted levels from s_eff onwards
      for (let m = s_eff - 1; m < T && m < currMonth; m++) {
        contractedLevels[m] = uniqCandidates[currC];
      }
    }

    currMonth = bt.prevMonth;
    currC = bt.prevLevel;
    currLr = bt.prevLastReduction;
  }

  // Calculate monthly breakdown with optimized levels
  const monthlyBreakdown: MonthlyBreakdown[] = items.map((item, idx) => {
    const optimizedLevel = contractedLevels[idx];
    const custo_real = baseCosts[idx];
    const custo_otimo = costForContraction(item, optimizedLevel);

    return {
      month: idx + 1,
      ano_mes: item.ano_mes,
      contratada_kw: item.demanda_contratada_kw,
      medida_kw: item.demanda_medida_kw,
      custo_real,
      custo_otimo,
      poupanca: Math.max(0, custo_real - custo_otimo),
    };
  });

  const totalCostReal = baseCosts.reduce((a, b) => a + b, 0);
  const totalCostOptimized = monthlyBreakdown.reduce((sum, m) => sum + m.custo_otimo, 0);
  let totalSavings = totalCostReal - totalCostOptimized;

  // Aplicar penalidade global no resultado DP, se fornecida
  const penaltyBetaGlobal = params.penalty_beta ?? 0;
  if (penaltyBetaGlobal > 0) {
    // Calcula taxa de ultrapassagem do plano otimizado
    let exceedances = 0;
    for (let i = 0; i < T; i++) {
      if (items[i].demanda_medida_kw > contractedLevels[i]) exceedances++;
    }
    const exceedanceRate = exceedances / T;
    const targetRate = params.risco / 100;
    const deviation = exceedanceRate - targetRate;
    const penalty = penaltyBetaGlobal * deviation * deviation;
    // Subtrai penalidade das economias reportadas
    totalSavings -= penalty;
  }

  return {
    economia_corr: totalSavings,
    x: uniqCandidates[bestC],
    s_req: recontracts.length > 0 ? recontracts[0].s_req : 0,
    s_eff: recontracts.length > 0 ? recontracts[0].s_eff : 0,
    recontracts,
    monthlyBreakdown,
    totalSavings,
    totalCostReal,
    totalCostOptimized,
  };
}
