import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { MonthlyData } from "@/lib/optimizer";

interface MonthlyDataTableProps {
  data: MonthlyData[];
  onChange: (data: MonthlyData[]) => void;
}

export function MonthlyDataTable({ data, onChange }: MonthlyDataTableProps) {
  const addRow = () => {
    const newMonth = new Date().toISOString().slice(0, 7);
    onChange([
      ...data,
      {
        ano_mes: newMonth,
        demanda_contratada_kw: 0,
        demanda_medida_kw: 0,
        custo_demanda: 50,
        custo_ultrapassagem: 100,
      },
    ]);
  };

  const removeRow = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof MonthlyData, value: string) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]: field === "ano_mes" ? value : parseFloat(value) || 0,
    };
    onChange(updated);
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Dados Mensais</h2>
        <Button
          onClick={addRow}
          variant="outline"
          size="sm"
          className="transition-smooth"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Mês
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Mês</TableHead>
              <TableHead className="min-w-[140px]">Contratada (kW)</TableHead>
              <TableHead className="min-w-[140px]">Medida (kW)</TableHead>
              <TableHead className="min-w-[140px]">Tarifa Demanda (R$/kW)</TableHead>
              <TableHead className="min-w-[180px]">Tarifa Ultrapassagem (R$/kW)</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum dado inserido. Clique em "Adicionar Mês" para começar.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                // Defensive: ensure value passed to input type="month" is YYYY-MM
                const displayValue = row.ano_mes && row.ano_mes.length >= 7 ? row.ano_mes.slice(0, 7) : row.ano_mes;
                // Check if format is valid (YYYY-MM)
                const isValidFormat = /^\d{4}-\d{2}$/.test(displayValue);
                
                return (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      type="month"
                      value={displayValue}
                      onChange={(e) => updateRow(index, "ano_mes", e.target.value)}
                      className={`h-9 transition-smooth ${!isValidFormat && displayValue ? 'border-destructive border-2' : ''}`}
                      title={!isValidFormat && displayValue ? 'Formato de data inválido. Use YYYY-MM' : ''}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="10"
                      value={row.demanda_contratada_kw}
                      onChange={(e) =>
                        updateRow(index, "demanda_contratada_kw", e.target.value)
                      }
                      className="h-9 transition-smooth"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="10"
                      value={row.demanda_medida_kw}
                      onChange={(e) => updateRow(index, "demanda_medida_kw", e.target.value)}
                      className="h-9 transition-smooth"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={row.custo_demanda || 0}
                      onChange={(e) => updateRow(index, "custo_demanda", e.target.value)}
                      className="h-9 transition-smooth"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={row.custo_ultrapassagem || 0}
                      onChange={(e) =>
                        updateRow(index, "custo_ultrapassagem", e.target.value)
                      }
                      className="h-9 transition-smooth"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => removeRow(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-smooth"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
