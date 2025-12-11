// src/lib/excel-importer.ts
import * as XLSX from 'xlsx';
import { MonthlyData } from './storage'; // Importando a tipagem existente

// Função auxiliar para converter data do Excel ou Texto para YYYY-MM
const parseExcelDate = (value: any): string => {
  try {
    // Caso 1: O Excel mandou um número (ex: 42005)
    if (typeof value === 'number') {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      // Ajuste de timezone simples para pegar mês/ano correto
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
    
    // Caso 2: Veio como texto "01/2015" ou "jan/15"
    if (typeof value === 'string') {
      // Tenta quebrar por barra
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) { // ex: 01/2015
           // Assumindo MM/YYYY
           return `${parts[1]}-${parts[0].padStart(2, '0')}`;
        }
      }
    }
    return '';
  } catch (e) {
    console.error("Erro ao converter data", value);
    return '';
  }
};

export const parseExcelFile = async (file: File): Promise<MonthlyData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Pega a primeira aba da planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converte para JSON bruto (array de arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Remove o cabeçalho (primeira linha)
        const rows = jsonData.slice(1) as any[];

        const formattedData: MonthlyData[] = rows
          .map((row) => {
            // Mapeamento das colunas do seu Excel (Mês, Contratada, Medida)
            // Índice 0 = Mês
            // Índice 1 = Contratada
            // Índice 2 = Medida
            
            const rawDate = row[0];
            const rawContratada = row[1];
            const rawMedida = row[2];

            if (!rawDate) return null;

            return {
              ano_mes: parseExcelDate(rawDate),
              demanda_contratada_kw: Number(rawContratada) || 0,
              demanda_medida_kw: Number(rawMedida) || 0,
              // Como sua planilha não tem tarifas, vamos colocar padrões ou 0
              tarifa_demanda_r_pkW: 0, 
              tarifa_ultrapassagem_r_pkW: 0 
            };
          })
          .filter((item): item is MonthlyData => item !== null && item.ano_mes !== '');

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};