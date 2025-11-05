# Test Data

This directory contains example data files for testing the demand optimization calculator.

## Files

### example-18-months.csv / example-18-months.json

Sample dataset covering 18 months (Jan 2024 - Jun 2025) with:
- **Contratada**: 500 kW (constant)
- **Medida**: Varies between 440-530 kW
- **Tarifa Demanda**: R$ 52.50/kW (2024), R$ 54.00/kW (2025)
- **Tarifa Ultrapassagem**: R$ 105.00/kW (2024), R$ 108.00/kW (2025)

### Expected Behavior

With this dataset, the optimizer should:
1. Identify opportunities for cost savings by reducing the contracted demand
2. Recommend a lower contracted level (around 520-530 kW) to avoid excess charges
3. Show months where the current 500 kW contract leads to underutilization
4. Calculate total savings considering the Formula B cost structure

### How to Use

#### In the Application

1. Navigate to the Dashboard (`/dashboard`)
2. Click "Importar" button
3. Select either the CSV or JSON file
4. Click "Calcular Otimização" to run the optimization

#### Manual Testing

You can also copy/paste the JSON content directly into the application or use the CSV data for bulk editing.

### CSV Format

```csv
ano_mes,demanda_contratada_kw,demanda_medida_kw,tarifa_demanda_r_pkW,tarifa_ultrapassagem_r_pkW
2024-01,500,450,52.50,105.00
```

**Columns:**
- `ano_mes`: Month in YYYY-MM format
- `demanda_contratada_kw`: Currently contracted demand in kW
- `demanda_medida_kw`: Measured/actual demand in kW
- `tarifa_demanda_r_pkW`: Demand tariff in R$/kW
- `tarifa_ultrapassagem_r_pkW`: Excess demand tariff in R$/kW

### JSON Format

```json
[
  {
    "ano_mes": "2024-01",
    "demanda_contratada_kw": 500,
    "demanda_medida_kw": 450,
    "tarifa_demanda_r_pkW": 52.50,
    "tarifa_ultrapassagem_r_pkW": 105.00
  }
]
```

## Creating Your Own Test Data

To create custom test datasets:

1. Use the CSV format shown above
2. Ensure the `ano_mes` column uses YYYY-MM format
3. Include all required columns (or the parser will use defaults)
4. Save with `.csv` or `.json` extension

## Cost Formula (Formula B)

The optimizer uses Formula B for cost calculation:

```
custo_t = medida_t × TD_t + max(0, medida_t - contratada_t) × TU_t
```

Where:
- `medida_t`: Measured demand in month t
- `TD_t`: Demand tariff in month t
- `TU_t`: Excess tariff in month t
- `contratada_t`: Contracted demand in month t

This means the cost is calculated on the actual measured demand, plus any excess over the contracted level.

## Optimization Rules

The DP optimizer follows these rules:

1. **Increases**: Unlimited per year, effective in the following month (delay = 1)
2. **Reductions**: Maximum 1 per 12 months, effective in 3 months (delay = 3)
3. **Multi-recontracts**: The algorithm can suggest multiple changes over the time horizon

## Expected Results (Sample Data)

For the 18-month example dataset:

- **Total Cost (Current)**: ~R$ 490,000 - R$ 500,000
- **Potential Savings**: Should identify savings by optimizing the contracted level
- **Recontracts**: May suggest 1-2 recontracts depending on risk tolerance
- **Optimal Level**: Around 520-530 kW

*Note: Actual results depend on the optimization parameters (risk, step size, etc.)*
