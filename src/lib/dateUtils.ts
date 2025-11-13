/**
 * Date utilities for normalizing ano_mes values to YYYY-MM format
 */

/**
 * Normalize various date formats to YYYY-MM format
 * 
 * Accepts common formats:
 * - DD/MM/YYYY or D/M/YYYY (day/month/year)
 * - DD-MM-YYYY (day-month-year)
 * - MM/YYYY or M/YYYY (month/year)
 * - YYYY-MM-DD (ISO date)
 * - YYYY-MM (already normalized)
 * - YYYY/MM (year/month)
 * - YYYYMM (compact format)
 * 
 * @param raw - Raw date string in various formats
 * @returns Normalized string in format YYYY-MM or empty string if cannot normalize
 */
export function normalizeAnoMes(raw?: string): string {
  if (!raw) return '';
  
  const s = raw.trim().replace(/^"|"$/g, '');
  if (!s) return '';

  // Pattern: DD/MM/YYYY or D/M/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    let year = dmy[3];
    if (year.length === 2) {
      year = (Number(year) > 50 ? '19' + year : '20' + year);
    }
    return `${year}-${month}`;
  }

  // Pattern: YYYY-MM-DD (ISO date - extract year and month)
  const ymdIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdIso) {
    return `${ymdIso[1]}-${ymdIso[2]}`;
  }

  // Pattern: YYYY-MM or YYYY/MM (already in correct format or close)
  const ym = s.match(/^(\d{4})[/-](\d{1,2})$/);
  if (ym) {
    const year = ym[1];
    const month = ym[2].padStart(2, '0');
    return `${year}-${month}`;
  }

  // Pattern: MM/YYYY or M/YYYY
  const my = s.match(/^(\d{1,2})[/-](\d{4})$/);
  if (my) {
    const month = my[1].padStart(2, '0');
    const year = my[2];
    return `${year}-${month}`;
  }

  // Pattern: YYYYMM (compact format without separator)
  const yyyymm = s.match(/^(\d{4})(\d{2})$/);
  if (yyyymm) {
    return `${yyyymm[1]}-${yyyymm[2]}`;
  }

  // If we can't parse it, return empty string
  return '';
}
