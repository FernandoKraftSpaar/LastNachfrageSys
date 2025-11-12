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
 * Utility: split a CSV row honoring quotes (supports delimiter ',' or ';')
 */
function splitRow(row: string, delimiter: string): string[] {
  const res: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      // handle escaped double quotes ""
      if (inQuotes && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      res.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  res.push(cur);
  return res.map(s => s.trim().replace(/^"|"$/g, ''));
}

/**
 * Utility: parse a numeric value robust to:
 * - thousand separators '.' and decimal comma ','
 * - currency symbols or other non-numeric chars
 */
function parseNumberValue(raw: string | undefined): number {
  if (raw == null) return NaN;
  let v = raw.trim();
  if (v === '') return NaN;

  // Remove non-number characters except dot, comma, minus
  // First remove spaces and non-digit/common separators
  v = v.replace(/\s/g, '');

  // If there are both '.' and ',' assume '.' is thousand and ',' is decimal: remove '.' then change ',' -> '.'
  if (v.indexOf('.') > -1 && v.indexOf(',') > -1) {
    v = v.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // If only commas present, assume comma decimal
    if (v.indexOf(',') > -1 && v.indexOf('.') === -1) {
      v = v.replace(/,/g, '.');
    } else {
      // remove any thousands separator (commas) left over
      v = v.replace(/,/g, '');
    }
  }

  // Remove anything that's not digit, dot or minus
  v = v.replace(/[^0-9\.\-]/g, '');

  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Parse DD/MM/YYYY (and other common formats) to YYYY-MM (ano_mes)
 */
function parseDateToAnoMes(raw: string | undefined): string {
  if (!raw) return '';
  let s = raw.trim().replace(/^"|"$/g, '');

  // Common patterns:
  // DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    let year = dmy[3];
    if (year.length === 2) {
      year = (Number(year) > 50 ? '19' + year : '20' + year); // heuristic
    }
    return `${year}-${month}`; // padrão YYYY-MM
  }

  // YYYY-MM or YYYY/MM
  const yM = s.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (yM) {
    const year = yM[1];
    const month = yM[2].padStart(2, '0');
    return `${year}-${month}`;
  }

  // MM/YYYY or M/YYYY
  const My = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (My) {
    const month = My[1].padStart(2, '0');
    const year = My[2];
    return `${year}-${month}`;
  }

  // If already in format YYYYMM
  const yymm = s.match(/^(\d{4})(\d{2})$/);
  if (yymm) {
    return `${yymm[1]}-${yymm[2]}`;
  }

  // fallback: return original (trimmed) — app pode aceitar string com dia se quiser
  return s;
}

/**
 * Parse CSV string to monthly data
 * Expected formats: flexible to support CEEE-equatorial-like CSVs
 */
export function parseCSV(csvText: string): MonthlyData[] {
  const linesAll = csvText.split(/\r?\n/);
  const lines = linesAll.map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 1) {
    throw new Error('CSV está vazio');
  }
  if (lines.length < 2) {
    // allow single-line header + no rows => return empty
    return [];
  }

  // Heurística de detecção de delimitador baseada em várias linhas
  const sampleLines = lines.slice(0, Math.min(10, lines.length));
  const commaCounts = sampleLines.map(l => (l.match(/,/g) || []).length);
  const semicolonCounts = sampleLines.map(l => (l.match(/;/g) || []).length);

  const median = (arr: number[]) => {
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  };

  let delimiter = median(semicolonCounts) > median(commaCounts) ? ';' : ',';

  // Se detectarmos muitos padrões numéricos com vírgula decimal nas linhas de dados,
  // preferimos ';' como delimitador (caso exista) para não quebrar valores como 123,45.
  const numericCommaPatternCount = sampleLines.reduce((acc, l) => {
    const matches = l.match(/\d+,\d{1,3}/g);
    return acc + (matches ? matches.length : 0);
  }, 0);

  if (numericCommaPatternCount > 0 && semicolonCounts.some(c => c > 0)) {
    delimiter = ';';
  }

  const header = splitRow(sampleLines[0], delimiter).map(h => h.toLowerCase());

  const data: MonthlyData[] = [];

  // Candidate names for date and demand columns (more can be added)
  const dateCandidates = [
    'ano_mes', 'ano-mes', 'ano mes', 'ano/mes', 'ano', 'mes', 'date', 'data', 'periodo'
  ];
  const demandaCandidates = [
    'demanda_medida_kw', 'demanda_medida', 'demanda_contratada', 'demanda', 'medida', 'kwh', 'kw', 'potencia', 'consumo'
  ];

  let colIdxAnoMes = header.findIndex(h => dateCandidates.some(c => h.includes(c)));
  let colIdxDemanda = header.findIndex(h => demandaCandidates.some(c => h.includes(c)));

  if (colIdxAnoMes === -1) {
    colIdxAnoMes = header.findIndex(h => /ano|mes|date|data|periodo/.test(h));
  }

  if (colIdxAnoMes === -1) {
    throw new Error('CSV deve conter coluna de data (ex: ano_mes, date, data). Header detectado: ' + header.join(', '));
  }

  // If demanda column not found by name, try to infer numeric column
  if (colIdxDemanda === -1) {
    const sampleSize = Math.min(8, lines.length - 1);
    for (let c = 0; c < header.length; c++) {
      if (c === colIdxAnoMes) continue;
      let numericCount = 0;
      let checked = 0;
      for (let r = 1; r <= sampleSize; r++) {
        const row = splitRow(lines[r], delimiter);
        const val = row[c];
        const n = parseNumberValue(val);
        if (!isNaN(n)) numericCount++;
        checked++;
      }
      // if majority numeric, pick it
      if (checked > 0 && numericCount / checked >= 0.6) {
        colIdxDemanda = c;
        break;
      }
    }
  }

  if (colIdxDemanda === -1) {
    console.warn('Não foi possível identificar automaticamente a coluna de demanda. Valores numéricos serão considerados 0. Header detectado:', header);
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = splitRow(line, delimiter);

    const rawDate = values[colIdxAnoMes] || '';
    const ano_mes = parseDateToAnoMes(rawDate);

    let demandaVal = 0;
    if (colIdxDemanda !== -1) {
      const raw = values[colIdxDemanda];
      const parsed = parseNumberValue(raw);
      demandaVal = !isNaN(parsed) ? parsed : 0;
    }

    const item: MonthlyData = {
      ano_mes,
      demanda_medida_kw: demandaVal,
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
