// src/lib/excelimporter.ts
import * as XLSX from 'xlsx';
import { MonthlyData } from './optimizer'; // Importando a tipagem existente diretamente da origem

// Converte strings numéricas em formato pt-BR ("1.234,56") para número
const parseNumberPtBr = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value
      .trim()
      .replace(/\./g, '') // remove separador de milhar
      .replace(/,/g, '.'); // troca decimal
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

// Função auxiliar para converter data do Excel ou Texto para YYYY-MM
// NOTA: Para datas seriais do Excel, o ajuste de timezone é aplicado
// para garantir consistência. Pode variar conforme o timezone local.
const parseExcelDate = (value: unknown): string => {
  try {
    // Caso 1: Serial numérico do Excel (ex: 42005)
    if (typeof value === 'number') {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }

    // Caso 2: Objeto Date já convertido
    if (value instanceof Date && !isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }

    // Caso 3: Strings variadas
    if (typeof value === 'string') {
      const clean = value.trim();
      // Normaliza pontuação (permite 01.2015 ou 01-2015 ou 01/2015)
      const normalized = clean.replace(/\./g, '/').replace(/-/g, '/');

      // Formatos YYYY-MM ou YYYY/MM
      const isoMatch = normalized.match(/^(\d{4})[/]?(\d{2})$/);
      if (isoMatch) {
        const [, y, m] = isoMatch;
        return `${y}-${m}`;
      }

      // Formato DD/MM/YYYY ou MM/YYYY
      const slashParts = normalized.split('/');
      if (slashParts.length === 3 && slashParts[2].length === 4) {
        const month = slashParts[1].padStart(2, '0');
        const year = slashParts[2];
        return `${year}-${month}`;
      }
      if (slashParts.length === 2 && slashParts[1].length === 4) {
        const month = slashParts[0].padStart(2, '0');
        const year = slashParts[1];
        return `${year}-${month}`;
      }

      // Formatos com meses por extenso/abreviado (ex: jan/15 ou jan-2015)
      const monthNames: Record<string, string> = {
        jan: '01', janeiro: '01',
        fev: '02', fevereiro: '02',
        mar: '03', março: '03',
        abr: '04', abril: '04',
        mai: '05', maio: '05',
        jun: '06', junho: '06',
        jul: '07', julho: '07',
        ago: '08', agosto: '08',
        set: '09', setembro: '09',
        out: '10', outubro: '10',
        nov: '11', novembro: '11',
        dez: '12', dezembro: '12',
      };

      const parts = normalized.split('/');
      if (parts.length === 2) {
        const monthPart = parts[0].toLowerCase();
        const yearPart = parts[1];
        const month = monthNames[monthPart];
        if (month && yearPart) {
          // Usa ano pivô: < 50 = 20xx, >= 50 = 19xx
          let year: string;
          if (/^\d{2}$/.test(yearPart)) {
            const yearNum = parseInt(yearPart, 10);
            const fullYear = yearNum < 50 ? 2000 + yearNum : 1900 + yearNum;
            year = String(fullYear);
          } else {
            year = yearPart;
          }
          return `${year}-${month}`;
        }
      }
    }

    return '';
  } catch (e) {
    console.error("Erro ao converter data", value);
    return '';
  }
};

export const parseSpreadsheetFile = async (file: File): Promise<MonthlyData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });

        // Pega a primeira aba da planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converte para JSON bruto (array de arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '', // mantém células vazias como string vazia
        });

        // Remove o cabeçalho (primeira linha)
        const rows = jsonData.slice(1) as unknown[][];

        const invalidRows: number[] = [];

        const formattedData: MonthlyData[] = rows
          .map((row, idx) => {
            try {
              // Mapeamento das colunas do Excel (Mês, Contratada, Medida, Status)
              const rawDate = row[0];
              const rawContratada = row[1];
              const rawMedida = row[2];

              // Ignora linhas totalmente vazias
              const isEmptyRow = [rawDate, rawContratada, rawMedida].every(
                (v) => v === '' || v === undefined || v === null
              );
              if (isEmptyRow) return null;

              const anoMes = parseExcelDate(rawDate);
              if (!anoMes) {
                invalidRows.push(idx + 2); // +2 porque removemos cabeçalho e idx é 0-based
                return null;
              }

              return {
                ano_mes: anoMes,
                demanda_contratada_kw: parseNumberPtBr(rawContratada),
                demanda_medida_kw: parseNumberPtBr(rawMedida),
                // AVISO: Tarifas hardcoded como 0. Configure estes valores antes de calcular custos.
                tarifa_demanda_r_pkW: 0,
                tarifa_ultrapassagem_r_pkW: 0,
              };
            } catch (err) {
              invalidRows.push(idx + 2);
              return null;
            }
          })
          .filter((item): item is MonthlyData => item !== null && item.ano_mes !== '');

        if (invalidRows.length) {
          console.warn(
            `Linhas ignoradas por formato inválido: ${invalidRows.join(', ')}`
          );
        }

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};