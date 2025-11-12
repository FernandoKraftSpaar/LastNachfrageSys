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
 * Split a CSV row respecting quoted fields and escaped quotes
 */
function splitRow(row: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Parse a numeric value from string, handling:
 * - Comma as decimal separator (1.234,56 -> 1234.56)
 * - Thousands separators (1 234,56 or 1.234,56 -> 1234.56)
 * - Currency symbols (R$ 1.234,56 -> 1234.56)
 * - Spaces and other formatting
 */
function parseNumberValue(raw: string): number {
  if (!raw) return 0;
  
  // Remove currency symbols, spaces, and other non-numeric characters except , . -
  let cleaned = raw.toString().replace(/[^\d,.-]/g, '');
  
  // Detect if comma is decimal separator:
  // - If there's a comma after the last dot, comma is decimal (1.234,56)
  // - If there's only comma and no dot, comma is likely decimal (1234,56)
  // - If comma appears before dot, comma is thousands separator (1,234.56)
  const lastDotPos = cleaned.lastIndexOf('.');
  const lastCommaPos = cleaned.lastIndexOf(',');
  
  if (lastCommaPos > lastDotPos) {
    // Comma is decimal separator (European format)
    // Remove dots (thousands separator) and replace comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastCommaPos !== -1) {
    // Comma is thousands separator (US format)
    cleaned = cleaned.replace(/,/g, '');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse a date string and convert to ano_mes format (YYYY-MM)
 * Handles common formats:
 * - DD/MM/YYYY -> YYYY-MM
 * - DD-MM-YYYY -> YYYY-MM
 * - YYYY-MM-DD -> YYYY-MM
 * - MM/YYYY -> YYYY-MM
 * - YYYY-MM (already in correct format)
 */
function parseDateToAnoMes(raw: string): string {
  if (!raw) return '';
  
  const cleaned = raw.trim();
  
  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1];
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    const year = ddmmyyyyMatch[3];
    return `${year}-${month}`;
  }
  
  // Try YYYY-MM-DD or YYYY/MM/DD
  const yyyymmddMatch = cleaned.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmddMatch) {
    const year = yyyymmddMatch[1];
    const month = yyyymmddMatch[2].padStart(2, '0');
    return `${year}-${month}`;
  }
  
  // Try MM/YYYY or MM-YYYY
  const mmyyyyMatch = cleaned.match(/^(\d{1,2})[/-](\d{4})$/);
  if (mmyyyyMatch) {
    const month = mmyyyyMatch[1].padStart(2, '0');
    const year = mmyyyyMatch[2];
    return `${year}-${month}`;
  }
  
  // If nothing matches, return original
  return cleaned;
}

/**
 * Detect the most likely delimiter for a CSV file
 * Uses multiple sample lines and prefers ';' if numeric patterns with comma decimals are detected
 */
function detectDelimiter(lines: string[]): string {
  const sampleSize = Math.min(5, lines.length);
  const sampleLines = lines.slice(0, sampleSize);
  
  // Count delimiters in sample lines
  const delimiters = [',', ';', '\t'];
  const counts = delimiters.map(delim => {
    return sampleLines.reduce((sum, line) => {
      // Don't count delimiters inside quotes
      let inQuotes = false;
      let count = 0;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === delim && !inQuotes) count++;
      }
      return sum + count;
    }, 0);
  });
  
  // Check if there are numeric patterns with comma decimals
  const hasCommaDecimals = sampleLines.some(line => 
    /\d+,\d{2}/.test(line) // Pattern like "1234,56"
  );
  
  // If we detect comma decimal notation and semicolons exist, prefer semicolon
  const semicolonIndex = delimiters.indexOf(';');
  const commaIndex = delimiters.indexOf(',');
  
  if (hasCommaDecimals && counts[semicolonIndex] > 0) {
    return ';';
  }
  
  // Otherwise, return the delimiter with the highest median count
  const maxCount = Math.max(...counts);
  const maxIndex = counts.indexOf(maxCount);
  
  return delimiters[maxIndex];
}

/**
 * Parse CSV string to monthly data
 * Robust parser that handles:
 * - Multiple delimiter types (auto-detected)
 * - Quoted fields and escaped quotes
 * - Numeric values with comma decimals and thousands separators
 * - Date formats (DD/MM/YYYY, etc.) converted to YYYY-MM
 * - Flexible column name detection with fallback
 */
export function parseCSV(csvText: string): MonthlyData[] {
  const lines = csvText.trim().split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length < 2) {
    throw new Error('CSV deve ter cabeçalho e pelo menos uma linha de dados');
  }

  // Detect delimiter
  const delimiter = detectDelimiter(lines);
  
  // Parse header
  const headerRow = splitRow(lines[0], delimiter);
  const header = headerRow.map(h => h.toLowerCase().trim());
  
  const data: MonthlyData[] = [];

  // Find column indices with multiple candidate names
  const dateCandidates = ['ano_mes', 'date', 'data', 'mes', 'month', 'periodo'];
  const demandCandidates = ['demanda_medida_kw', 'demanda_medida', 'demanda', 'medida', 'demand', 'kw'];
  const contractedCandidates = ['demanda_contratada_kw', 'demanda_contratada', 'contratada', 'contracted'];
  const tarifaDemandaCandidates = ['tarifa_demanda_r_pkw', 'tarifa_demanda', 'custo_demanda', 'td'];
  const tarifaUltrapassagemCandidates = ['tarifa_ultrapassagem_r_pkw', 'tarifa_ultrapassagem', 'custo_ultrapassagem', 'tu'];
  
  const findColumn = (candidates: string[]): number => {
    for (const candidate of candidates) {
      const idx = header.findIndex(h => h.includes(candidate));
      if (idx !== -1) return idx;
    }
    return -1;
  };
  
  const colIdx = {
    ano_mes: findColumn(dateCandidates),
    demanda_medida_kw: findColumn(demandCandidates),
    demanda_contratada_kw: findColumn(contractedCandidates),
    tarifa_demanda_r_pkW: findColumn(tarifaDemandaCandidates),
    tarifa_ultrapassagem_r_pkW: findColumn(tarifaUltrapassagemCandidates),
  };

  // If date column not found, throw error
  if (colIdx.ano_mes === -1) {
    throw new Error('CSV deve ter coluna de data (ano_mes, date, data, etc.)');
  }
  
  // If demand column not found, try to infer from first numeric column
  if (colIdx.demanda_medida_kw === -1) {
    console.warn('Coluna de demanda não encontrada por nome, tentando inferir da primeira coluna numérica...');
    
    // Try to find first numeric column (skip date column)
    for (let i = 0; i < header.length; i++) {
      if (i === colIdx.ano_mes) continue;
      
      // Check if first data row has numeric value in this column
      if (lines.length > 1) {
        const firstDataRow = splitRow(lines[1], delimiter);
        if (firstDataRow[i]) {
          const val = parseNumberValue(firstDataRow[i]);
          if (val !== 0 || /\d/.test(firstDataRow[i])) {
            colIdx.demanda_medida_kw = i;
            console.warn(`Usando coluna ${i} (${header[i]}) como demanda medida`);
            break;
          }
        }
      }
    }
    
    if (colIdx.demanda_medida_kw === -1) {
      console.warn('Aviso: coluna de demanda não pôde ser inferida, usando valor 0');
    }
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = splitRow(line, delimiter);
    
    const item: MonthlyData = {
      ano_mes: parseDateToAnoMes(values[colIdx.ano_mes] || ''),
      demanda_contratada_kw: colIdx.demanda_contratada_kw !== -1 
        ? parseNumberValue(values[colIdx.demanda_contratada_kw])
        : 0,
      demanda_medida_kw: colIdx.demanda_medida_kw !== -1
        ? parseNumberValue(values[colIdx.demanda_medida_kw])
        : 0,
    };
    
    // Add optional fields if found
    if (colIdx.tarifa_demanda_r_pkW !== -1 && values[colIdx.tarifa_demanda_r_pkW]) {
      item.tarifa_demanda_r_pkW = parseNumberValue(values[colIdx.tarifa_demanda_r_pkW]);
    }
    
    if (colIdx.tarifa_ultrapassagem_r_pkW !== -1 && values[colIdx.tarifa_ultrapassagem_r_pkW]) {
      item.tarifa_ultrapassagem_r_pkW = parseNumberValue(values[colIdx.tarifa_ultrapassagem_r_pkW]);
    }

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
