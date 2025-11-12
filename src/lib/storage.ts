import { MonthlyData } from './optimizer';

const STORAGE_KEY = 'demand_items_v1';

export interface StoredData {
  monthlyData: MonthlyData[];
  lastUpdated: string;
}

/**
 * Save monthly data to localStorage
 */
export function saveToLocalStorage(data: MonthlyData[]): void {
  try {
    const stored: StoredData = {
      monthlyData: data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load monthly data from localStorage
 */
export function loadFromLocalStorage(): MonthlyData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: StoredData = JSON.parse(stored);
    return parsed.monthlyData || [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
}

/**
 * Clear localStorage data
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Parse CSV string to monthly data
 * Expected format: ano_mes, demanda_medida_kw*/
export function parseCSV(csvText: string): MonthlyData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have header and at least one data row');
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  const data: MonthlyData[] = [];

  // Find column indices
  const colIdx = {
    ano_mes: header.indexOf('date'),
    demanda_medida_kw: header.findIndex(h => 
      h.includes('tavg_C') || h.includes('medida')
    ),
  };

  if (colIdx.ano_mes === -1) {
    throw new Error('CSV must have ano_mes column');
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim());
    
    const item: MonthlyData = {
      ano_mes: values[colIdx.ano_mes] || '',
      demanda_medida_kw: parseFloat(values[colIdx.demanda_medida_kw] || '0') || 0,
    };

    data.push(item);
  }

  return data;
}

/**
 * Convert monthly data to CSV string
 */
export function exportToCSV(data: MonthlyData[]): string {
  const header = 'ano_mes,demanda_contratada_kw,demanda_medida_kw,tarifa_demanda_r_pkW,tarifa_ultrapassagem_r_pkW';
  const rows = data.map(item => {
    const td = item.tarifa_demanda_r_pkW || item.custo_demanda || 0;
    const tu = item.tarifa_ultrapassagem_r_pkW || item.custo_ultrapassagem || 0;
    return `${item.ano_mes},${item.demanda_contratada_kw},${item.demanda_medida_kw},${td},${tu}`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Parse JSON string to monthly data
 */
export function parseJSON(jsonText: string): MonthlyData[] {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON must be an array');
    }

    return parsed.map((item: any) => ({
      ano_mes: item.ano_mes || '',
      demanda_contratada_kw: parseFloat(item.demanda_contratada_kw || '0') || 0,
      demanda_medida_kw: parseFloat(item.demanda_medida_kw || '0') || 0,
      tarifa_demanda_r_pkW: parseFloat(item.tarifa_demanda_r_pkW || item.custo_demanda || '50') || 50,
      tarifa_ultrapassagem_r_pkW: parseFloat(item.tarifa_ultrapassagem_r_pkW || item.custo_ultrapassagem || '100') || 100,
    }));
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }
}

/**
 * Export data as JSON string
 */
export function exportToJSON(data: MonthlyData[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
