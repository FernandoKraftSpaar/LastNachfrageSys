import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Download, Edit } from "lucide-react";
import { MonthlyData } from "@/lib/optimizer";
import { parseCSV, parseJSON, exportToCSV, exportToJSON, downloadFile } from "@/lib/storage";
import { toast } from "sonner";

interface MonthlyDataTableProps {
  data: MonthlyData[];
  onChange: (data: MonthlyData[]) => void;
}

export function BulkEditMonthlyDataTable({ data, onChange }: MonthlyDataTableProps) {
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [bulkField, setBulkField] = useState<keyof MonthlyData>('demanda_contratada_kw');
  const [bulkValue, setBulkValue] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addRow = () => {
    const lastMonth = data.length > 0 ? data[data.length - 1].ano_mes : new Date().toISOString().slice(0, 7);
    const [year, month] = lastMonth.split('-').map(Number);
    const nextMonth = new Date(year, month, 1);
    const newMonth = nextMonth.toISOString().slice(0, 7);
    
    onChange([
      ...data,
      {
        ano_mes: newMonth,
        demanda_contratada_kw: 0,
        demanda_medida_kw: 0,
        tarifa_demanda_r_pkW: 50,
        tarifa_ultrapassagem_r_pkW: 100,
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

  const applyBulkEdit = (mode: 'all' | 'range') => {
    const value = parseFloat(bulkValue);
    if (isNaN(value)) {
      toast.error('Por favor, insira um valor numérico válido');
      return;
    }

    const updated = data.map((item, idx) => {
      if (mode === 'all') {
        return { ...item, [bulkField]: value };
      } else {
        // Range mode
        if (item.ano_mes >= rangeStart && item.ano_mes <= rangeEnd) {
          return { ...item, [bulkField]: value };
        }
        return item;
      }
    });

    onChange(updated);
    setBulkEditOpen(false);
    toast.success(`${mode === 'all' ? 'Todos os meses' : 'Intervalo'} atualizado com sucesso`);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      let imported: MonthlyData[];
      
      if (file.name.endsWith('.json')) {
        imported = parseJSON(text);
      } else if (file.name.endsWith('.csv')) {
        imported = parseCSV(text);
      } else {
        toast.error('Formato de arquivo não suportado. Use CSV ou JSON.');
        return;
      }

      onChange(imported);
      setImportOpen(false);
      toast.success(`${imported.length} meses importados com sucesso`);
    } catch (error) {
      toast.error(`Erro ao importar: ${error}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(data);
    downloadFile(csv, `demanda_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    toast.success('Arquivo CSV exportado');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(data);
    downloadFile(json, `demanda_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    toast.success('Arquivo JSON exportado');
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Dados Mensais</h2>
        <div className="flex gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Dados</DialogTitle>
                <DialogDescription>
                  Carregue um arquivo CSV ou JSON com seus dados mensais
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileImport}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">Formato CSV esperado:</p>
                  <code className="block bg-muted p-2 rounded text-xs">
                    ano_mes,demanda_contratada_kw,demanda_medida_kw,tarifa_demanda_r_pkW,tarifa_ultrapassagem_r_pkW
                  </code>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>

          <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edição em Massa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edição em Massa</DialogTitle>
                <DialogDescription>
                  Aplique valores a múltiplos meses de uma vez
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Campo</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={bulkField}
                    onChange={(e) => setBulkField(e.target.value as keyof MonthlyData)}
                  >
                    <option value="demanda_contratada_kw">Demanda Contratada (kW)</option>
                    <option value="demanda_medida_kw">Demanda Medida (kW)</option>
                    <option value="tarifa_demanda_r_pkW">Tarifa Demanda (R$/kW)</option>
                    <option value="tarifa_ultrapassagem_r_pkW">Tarifa Ultrapassagem (R$/kW)</option>
                  </select>
                </div>
                
                <div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    placeholder="Digite o valor"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Aplicar a:</h4>
                  
                  <Button
                    onClick={() => applyBulkEdit('all')}
                    className="w-full mb-2"
                    variant="outline"
                  >
                    Toda a Série
                  </Button>

                  <div className="space-y-2">
                    <Label>Ou selecione um intervalo:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Início</Label>
                        <Input
                          type="month"
                          value={rangeStart}
                          onChange={(e) => setRangeStart(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fim</Label>
                        <Input
                          type="month"
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => applyBulkEdit('range')}
                      className="w-full"
                      disabled={!rangeStart || !rangeEnd}
                    >
                      Aplicar ao Intervalo
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={addRow} variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Mês
          </Button>
        </div>
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
                  Nenhum dado inserido. Clique em "Adicionar Mês" ou "Importar" para começar.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      type="month"
                      value={row.ano_mes}
                      onChange={(e) => updateRow(index, "ano_mes", e.target.value)}
                      className="h-9 transition-smooth"
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
                      value={row.tarifa_demanda_r_pkW || row.custo_demanda || 0}
                      onChange={(e) => updateRow(index, "tarifa_demanda_r_pkW", e.target.value)}
                      className="h-9 transition-smooth"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={row.tarifa_ultrapassagem_r_pkW || row.custo_ultrapassagem || 0}
                      onChange={(e) =>
                        updateRow(index, "tarifa_ultrapassagem_r_pkW", e.target.value)
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
