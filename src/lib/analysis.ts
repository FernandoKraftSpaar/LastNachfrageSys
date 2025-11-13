/**
 * Time Series Analysis Module
 * 
 * This module provides functions for preprocessing, deseasonalizing, and analyzing
 * electricity demand time series. It implements algorithms for seasonal decomposition,
 * trend detection, and cost optimization with backtesting capabilities.
 * 
 * The implementation is pedagogically commented to explain the methodology and
 * decision criteria. All functions work in both browser and Node.js environments
 * without external heavy dependencies.
 * 
 * Key Concepts:
 * - Preprocessing: Cleaning and preparing time series data
 * - Seasonality: Recurring patterns (e.g., monthly, quarterly)
 * - Deseasonalization: Removing seasonal component to reveal trend
 * - Trend Detection: Linear regression with statistical significance testing
 * - Grid Search: Systematic parameter optimization
 * - Backtesting: Historical validation of optimization strategy
 */

/**
 * Represents a single observation in the time series
 */
export interface TimeSeriesPoint {
  period: number;        // Sequential period index (0, 1, 2, ...)
  value: number;         // Observed value (e.g., demand in kW)
  ano_mes?: string;      // Optional: YYYY-MM format for reference
}

/**
 * Result of seasonal decomposition
 */
export interface SeasonalDecomposition {
  original: number[];         // Original series
  seasonal: number[];         // Seasonal component (indices)
  deseasonalized: number[];   // Series with seasonality removed
  trend?: number[];           // Optional: trend component
}

/**
 * Result of trend detection
 */
export interface TrendResult {
  slope: number;              // Trend slope (units per period)
  intercept: number;          // Y-intercept
  rSquared: number;           // R² (coefficient of determination, 0-1)
  pValue: number;             // Statistical significance (< 0.05 is significant)
  isSignificant: boolean;     // Whether trend is statistically significant
  direction: 'increasing' | 'decreasing' | 'stable'; // Trend direction
}

/**
 * Candidate value for optimization
 */
export interface DCandidate {
  value: number;              // Contracted demand level (kW)
  cost: number;               // Total cost for this level
  exceedances: number;        // Number of periods exceeding this level
}

/**
 * Result of backtest analysis
 */
export interface BacktestResult {
  totalCost: number;          // Total cost over backtest period
  avgCost: number;            // Average cost per period
  exceedanceRate: number;     // Fraction of periods with exceedances (0-1)
  worstExceedance: number;    // Maximum exceedance observed
  recommendations: string[];   // Human-readable recommendations
}

/**
 * Preprocess time series data by removing outliers and handling missing values.
 * 
 * Algorithm:
 * 1. Remove NaN, Infinity, and negative values
 * 2. Detect outliers using IQR (Interquartile Range) method
 * 3. Replace outliers with median (robust to extreme values)
 * 
 * Criteria:
 * - Outlier threshold: values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
 * - This is a standard statistical method (Tukey's fences)
 * 
 * @param series - Raw time series values
 * @param removeOutliers - Whether to remove/replace outliers (default: true)
 * @returns Preprocessed series
 */
export function preprocessSeries(
  series: number[],
  removeOutliers: boolean = true
): number[] {
  // Step 1: Filter invalid values (NaN, Infinity, negatives)
  const validSeries = series.filter(v => 
    Number.isFinite(v) && v >= 0
  );

  if (validSeries.length === 0) {
    throw new Error('No valid data points after filtering invalid values');
  }

  if (!removeOutliers) {
    return validSeries;
  }

  // Step 2: Calculate quartiles for outlier detection
  const sorted = [...validSeries].sort((a, b) => a - b);
  const n = sorted.length;
  
  // Q1 (25th percentile), Q2 (median), Q3 (75th percentile)
  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.50);
  const q3Index = Math.floor(n * 0.75);
  
  const Q1 = sorted[q1Index];
  const Q2 = sorted[q2Index]; // median
  const Q3 = sorted[q3Index];
  
  // Interquartile Range (IQR)
  const IQR = Q3 - Q1;
  
  // Outlier thresholds using Tukey's fences
  // Multiplier of 1.5 is standard; 3.0 would be for extreme outliers
  const lowerBound = Q1 - 1.5 * IQR;
  const upperBound = Q3 + 1.5 * IQR;

  // Step 3: Replace outliers with median (more robust than mean)
  const preprocessed = validSeries.map(v => {
    if (v < lowerBound || v > upperBound) {
      return Q2; // Replace with median
    }
    return v;
  });

  return preprocessed;
}

/**
 * Compute seasonal indices using simple seasonal decomposition.
 * 
 * Algorithm (Simplified STL-like approach):
 * 1. Divide series into seasonal cycles (e.g., 12 months for annual seasonality)
 * 2. For each position in cycle, compute average across all years
 * 3. Normalize indices so they average to 1.0
 * 
 * Seasonality Period:
 * - Monthly data with annual pattern: period = 12
 * - Quarterly data: period = 4
 * - Auto-detected if series length > 24 (assumes annual cycle)
 * 
 * @param series - Preprocessed time series
 * @param period - Seasonal period (default: 12 for monthly data)
 * @returns Seasonal indices (one per period in cycle)
 */
export function computeSeasonalIndex(
  series: number[],
  period: number = 12
): number[] {
  if (series.length < period * 2) {
    // Not enough data for reliable seasonal estimation
    // Return uniform indices (no seasonality)
    return Array(period).fill(1.0);
  }

  // Initialize seasonal sums and counts
  const seasonalSums = Array(period).fill(0);
  const seasonalCounts = Array(period).fill(0);

  // Accumulate values for each position in seasonal cycle
  for (let i = 0; i < series.length; i++) {
    const seasonIndex = i % period;
    seasonalSums[seasonIndex] += series[i];
    seasonalCounts[seasonIndex]++;
  }

  // Compute raw seasonal averages
  const rawIndices = seasonalSums.map((sum, idx) => {
    const count = seasonalCounts[idx];
    return count > 0 ? sum / count : 1.0;
  });

  // Normalize so indices average to 1.0
  // This ensures deseasonalized series has same scale as original
  const overallMean = rawIndices.reduce((a, b) => a + b, 0) / period;
  const normalizedIndices = rawIndices.map(idx => idx / overallMean);

  return normalizedIndices;
}

/**
 * Remove seasonal component from time series.
 * 
 * Algorithm:
 * - Divide each observation by its corresponding seasonal index
 * - This yields the trend-cycle component
 * 
 * Why division?
 * - Multiplicative decomposition: X_t = Trend_t * Seasonal_t * Error_t
 * - Appropriate when seasonal variation scales with level
 * - Common in demand/sales data where growth affects seasonal amplitude
 * 
 * @param series - Preprocessed time series
 * @param seasonalIndices - Seasonal indices from computeSeasonalIndex
 * @returns Deseasonalized series
 */
export function deseasonalize(
  series: number[],
  seasonalIndices: number[]
): number[] {
  const period = seasonalIndices.length;
  
  return series.map((value, idx) => {
    const seasonIndex = idx % period;
    const seasonalFactor = seasonalIndices[seasonIndex];
    
    // Avoid division by zero
    if (seasonalFactor === 0) {
      return value;
    }
    
    // Remove seasonal component via division
    return value / seasonalFactor;
  });
}

/**
 * Detect linear trend using least squares regression with significance testing.
 * 
 * Algorithm:
 * 1. Fit linear model: y = slope * x + intercept
 * 2. Compute R² (goodness of fit)
 * 3. Compute t-statistic and p-value for slope
 * 4. Determine if trend is statistically significant
 * 
 * Statistical Criteria:
 * - Significance level α = 0.05 (5% false positive rate)
 * - p-value < α → reject null hypothesis (trend exists)
 * - R² indicates proportion of variance explained (0-1)
 * 
 * Interpretation:
 * - slope > 0 and significant → increasing trend
 * - slope < 0 and significant → decreasing trend
 * - not significant → stable/no clear trend
 * 
 * @param series - Deseasonalized time series
 * @returns Trend detection result with statistics
 */
export function detectTrendLinear(series: number[]): TrendResult {
  const n = series.length;
  
  if (n < 3) {
    // Need at least 3 points for meaningful regression
    return {
      slope: 0,
      intercept: series[0] || 0,
      rSquared: 0,
      pValue: 1.0,
      isSignificant: false,
      direction: 'stable'
    };
  }

  // Create x values: 0, 1, 2, ..., n-1
  const x = Array.from({ length: n }, (_, i) => i);
  const y = series;

  // Calculate means
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  // Calculate slope using least squares formula
  // slope = Σ[(x_i - mean_x)(y_i - mean_y)] / Σ[(x_i - mean_x)²]
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denominator += dx * dx;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Calculate R² (coefficient of determination)
  // R² = 1 - (SS_res / SS_tot)
  let ssRes = 0; // Sum of squared residuals
  let ssTot = 0; // Total sum of squares

  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    const residual = y[i] - predicted;
    ssRes += residual * residual;
    ssTot += (y[i] - meanY) * (y[i] - meanY);
  }

  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

  // Calculate p-value for slope using t-statistic
  // Standard error of slope: SE = sqrt(SS_res / (n-2)) / sqrt(SS_xx)
  const seSlope = denominator !== 0 && n > 2
    ? Math.sqrt(ssRes / (n - 2)) / Math.sqrt(denominator)
    : Infinity;

  const tStatistic = seSlope !== 0 && isFinite(seSlope) 
    ? Math.abs(slope / seSlope) 
    : 0;

  // Approximate p-value using t-distribution
  // For simplicity, use lookup table for common critical values
  // degrees of freedom = n - 2
  const df = n - 2;
  const pValue = approximatePValue(tStatistic, df);

  // Determine significance at α = 0.05
  const alpha = 0.05;
  const isSignificant = pValue < alpha;

  // Determine trend direction
  let direction: 'increasing' | 'decreasing' | 'stable';
  if (isSignificant) {
    direction = slope > 0 ? 'increasing' : 'decreasing';
  } else {
    direction = 'stable';
  }

  return {
    slope,
    intercept,
    rSquared,
    pValue,
    isSignificant,
    direction
  };
}

/**
 * Approximate p-value for two-tailed t-test.
 * 
 * Uses simplified approximation based on t-distribution critical values.
 * For production use, consider using a proper statistical library.
 * 
 * @param t - Absolute value of t-statistic
 * @param df - Degrees of freedom
 * @returns Approximate p-value
 */
function approximatePValue(t: number, df: number): number {
  // Critical values for two-tailed test at common significance levels
  // For df ≥ 30, use normal approximation
  if (df >= 30) {
    // Normal approximation
    if (t > 2.576) return 0.01;   // p < 0.01
    if (t > 1.96) return 0.05;    // p < 0.05
    if (t > 1.645) return 0.10;   // p < 0.10
    return 0.20;                   // p ≥ 0.10
  }

  // For smaller df, use conservative estimates
  if (df >= 10) {
    if (t > 2.8) return 0.01;
    if (t > 2.2) return 0.05;
    if (t > 1.8) return 0.10;
    return 0.20;
  }

  // For very small df (< 10)
  if (t > 3.0) return 0.01;
  if (t > 2.5) return 0.05;
  if (t > 2.0) return 0.10;
  return 0.20;
}

/**
 * Generate candidate contracted demand levels for optimization.
 * 
 * Algorithm:
 * 1. Find minimum and maximum observed demand
 * 2. Use quantile-based approach to set lower bound (reduces overcontraction)
 * 3. Generate grid of candidates between bounds
 * 
 * Criteria:
 * - Lower bound: max(min_demand, quantile(risk_level))
 * - Upper bound: max_demand * safety_margin
 * - Grid size: ensures sufficient resolution for optimization
 * 
 * Risk Level:
 * - Low risk (5%): Contract at 95th percentile
 * - Medium risk (10%): Contract at 90th percentile
 * - High risk (20%): Contract at 80th percentile
 * 
 * @param series - Historical demand series
 * @param riskLevel - Acceptable exceedance risk (0-1, default 0.05 = 5%)
 * @param gridSize - Number of candidates to generate (default: 20)
 * @returns Array of candidate demand levels
 */
export function generateDCandidates(
  series: number[],
  riskLevel: number = 0.05,
  gridSize: number = 20
): number[] {
  if (series.length === 0) {
    return [];
  }

  // Sort series to compute quantiles
  const sorted = [...series].sort((a, b) => a - b);
  const n = sorted.length;

  // Compute quantile corresponding to (1 - risk)
  // e.g., risk = 0.05 → quantile = 0.95 (95th percentile)
  const quantileIndex = Math.floor(n * (1 - riskLevel));
  const lowerBound = sorted[Math.min(quantileIndex, n - 1)];

  // Upper bound with 10% safety margin
  const maxDemand = sorted[n - 1];
  const upperBound = maxDemand * 1.1;

  // Generate linearly spaced candidates
  const candidates: number[] = [];
  const step = (upperBound - lowerBound) / (gridSize - 1);

  for (let i = 0; i < gridSize; i++) {
    const candidate = lowerBound + i * step;
    candidates.push(Math.round(candidate)); // Round to integer kW
  }

  // Remove duplicates and sort
  const uniqueCandidates = [...new Set(candidates)].sort((a, b) => a - b);

  return uniqueCandidates;
}

/**
 * Evaluate total cost for a given contracted demand level.
 * 
 * Cost Formula:
 * - Base cost: contracted_kw * tariff_demand
 * - Exceedance cost: max(0, measured_kw - contracted_kw) * tariff_excess
 * - Total: sum across all periods
 * 
 * Tariff Structure:
 * - TD (Tarifa Demanda): Cost per kW of contracted demand
 * - TU (Tarifa Ultrapassagem): Penalty for exceeding contract (typically 2x TD)
 * 
 * @param series - Historical measured demand
 * @param contractedLevel - Proposed contracted demand (kW)
 * @param tariffDemand - Demand tariff (R$/kW, default: 50)
 * @param tariffExcess - Excess tariff (R$/kW, default: 100)
 * @returns Total cost and exceedance statistics
 */
export function evaluateCostForD(
  series: number[],
  contractedLevel: number,
  tariffDemand: number = 50,
  tariffExcess: number = 100
): DCandidate {
  let totalCost = 0;
  let exceedances = 0;

  for (const measured of series) {
    // Base cost for contracted demand
    const baseCost = contractedLevel * tariffDemand;

    // Exceedance cost (if measured > contracted)
    const excess = Math.max(0, measured - contractedLevel);
    const excessCost = excess * tariffExcess;

    totalCost += baseCost + excessCost;

    if (excess > 0) {
      exceedances++;
    }
  }

  return {
    value: contractedLevel,
    cost: totalCost,
    exceedances
  };
}

/**
 * Find optimal contracted demand using grid search.
 * 
 * Algorithm:
 * 1. Generate candidate levels
 * 2. Evaluate cost for each candidate
 * 3. Select candidate with minimum total cost
 * 4. Apply penalty for excessive exceedances
 * 
 * Cost Function with Penalty:
 * - Adjusted_Cost = Total_Cost + β * (Exceedance_Rate - Target_Rate)²
 * - β: penalty weight (encourages staying near target exceedance rate)
 * - Target_Rate: desired exceedance rate (e.g., 5%)
 * 
 * Rationale:
 * - Pure cost minimization might undercontract excessively
 * - Penalty term balances cost vs. operational risk
 * - Quadratic penalty grows with deviation from target
 * 
 * @param series - Historical demand series
 * @param riskLevel - Target exceedance risk (default: 0.05)
 * @param tariffDemand - Demand tariff (default: 50)
 * @param tariffExcess - Excess tariff (default: 100)
 * @param penaltyBeta - Penalty weight for exceedances (default: 1000)
 * @returns Optimal candidate with cost details
 */
export function findOptimalDGridSearch(
  series: number[],
  riskLevel: number = 0.05,
  tariffDemand: number = 50,
  tariffExcess: number = 100,
  penaltyBeta: number = 1000
): DCandidate {
  // Generate candidates
  const candidates = generateDCandidates(series, riskLevel, 20);

  if (candidates.length === 0) {
    throw new Error('No valid candidates generated');
  }

  // Evaluate each candidate
  const evaluations = candidates.map(level =>
    evaluateCostForD(series, level, tariffDemand, tariffExcess)
  );

  // Apply penalty for deviation from target exceedance rate
  const targetRate = riskLevel;
  const n = series.length;

  const adjustedEvaluations = evaluations.map(candidate => {
    const exceedanceRate = candidate.exceedances / n;
    const deviation = exceedanceRate - targetRate;
    
    // Penalty: β * deviation²
    // This encourages staying close to target rate
    const penalty = penaltyBeta * deviation * deviation;
    
    return {
      ...candidate,
      cost: candidate.cost + penalty
    };
  });

  // Find minimum cost candidate
  const optimal = adjustedEvaluations.reduce((best, current) =>
    current.cost < best.cost ? current : best
  );

  return optimal;
}

/**
 * Run backtest to validate optimization strategy.
 * 
 * Algorithm:
 * 1. Split series into train/test (e.g., 80/20)
 * 2. Optimize on training data
 * 3. Evaluate on test data
 * 4. Compare actual vs. predicted performance
 * 
 * Metrics:
 * - Total cost: Sum of all period costs
 * - Average cost: Mean cost per period
 * - Exceedance rate: Fraction of periods exceeding contract
 * - Worst exceedance: Maximum single-period exceedance
 * 
 * Recommendations:
 * - Stable trend + low exceedances → maintain current strategy
 * - Increasing trend → consider gradual upward adjustments
 * - Decreasing trend → opportunity for reduction (check frequency rules)
 * - High exceedance rate → increase contracted level
 * 
 * @param series - Full historical series
 * @param trainRatio - Fraction for training (default: 0.8)
 * @param riskLevel - Target exceedance risk (default: 0.05)
 * @param tariffDemand - Demand tariff (default: 50)
 * @param tariffExcess - Excess tariff (default: 100)
 * @returns Backtest results with recommendations
 */
export function runBacktest(
  series: number[],
  trainRatio: number = 0.8,
  riskLevel: number = 0.05,
  tariffDemand: number = 50,
  tariffExcess: number = 100
): BacktestResult {
  const n = series.length;
  const trainSize = Math.floor(n * trainRatio);

  if (trainSize < 3 || n - trainSize < 1) {
    throw new Error('Insufficient data for backtesting');
  }

  // Split data
  const trainData = series.slice(0, trainSize);
  const testData = series.slice(trainSize);

  // Preprocess and analyze training data
  const preprocessedTrain = preprocessSeries(trainData);
  const seasonalIndices = computeSeasonalIndex(preprocessedTrain);
  const deseasonalized = deseasonalize(preprocessedTrain, seasonalIndices);
  const trend = detectTrendLinear(deseasonalized);

  // Find optimal level on training data
  const optimal = findOptimalDGridSearch(
    preprocessedTrain,
    riskLevel,
    tariffDemand,
    tariffExcess
  );

  // Evaluate on test data
  const testResult = evaluateCostForD(
    testData,
    optimal.value,
    tariffDemand,
    tariffExcess
  );

  // Calculate metrics
  const avgCost = testResult.cost / testData.length;
  const exceedanceRate = testResult.exceedances / testData.length;
  
  // Find worst exceedance
  let worstExceedance = 0;
  for (const measured of testData) {
    const excess = Math.max(0, measured - optimal.value);
    if (excess > worstExceedance) {
      worstExceedance = excess;
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];

  // Trend-based recommendations
  if (trend.isSignificant) {
    if (trend.direction === 'increasing') {
      recommendations.push(
        `📈 Significant increasing trend detected (slope: ${trend.slope.toFixed(2)} kW/month). ` +
        `Consider gradual upward adjustments to contracted demand.`
      );
    } else if (trend.direction === 'decreasing') {
      recommendations.push(
        `📉 Significant decreasing trend detected (slope: ${trend.slope.toFixed(2)} kW/month). ` +
        `Opportunity for demand reduction (check 12-month frequency rule).`
      );
    }
  } else {
    recommendations.push(
      `📊 No significant trend detected (p-value: ${trend.pValue.toFixed(3)}). ` +
      `Demand appears stable.`
    );
  }

  // Exceedance-based recommendations
  if (exceedanceRate > riskLevel * 1.5) {
    recommendations.push(
      `⚠️ High exceedance rate (${(exceedanceRate * 100).toFixed(1)}% vs target ${(riskLevel * 100).toFixed(1)}%). ` +
      `Consider increasing contracted level by ~${Math.ceil(worstExceedance * 0.5)} kW.`
    );
  } else if (exceedanceRate < riskLevel * 0.5) {
    recommendations.push(
      `✅ Low exceedance rate (${(exceedanceRate * 100).toFixed(1)}%). ` +
      `Current level may be conservative; reduction could yield savings.`
    );
  } else {
    recommendations.push(
      `✅ Exceedance rate (${(exceedanceRate * 100).toFixed(1)}%) within acceptable range. ` +
      `Current strategy is well-calibrated.`
    );
  }

  // Cost recommendation
  recommendations.push(
    `💰 Recommended contracted level: ${optimal.value} kW ` +
    `(estimated cost: R$ ${avgCost.toFixed(2)}/month)`
  );

  return {
    totalCost: testResult.cost,
    avgCost,
    exceedanceRate,
    worstExceedance,
    recommendations
  };
}
