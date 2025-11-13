import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FormParams {
  risco: number;
  min_contract_kw: number;
  step_size_kw: number;
  delay_months: number;
  reduction_frequency_months: number;
}

interface OptimizationFormProps {
  onCalculate: (params: FormParams) => void;
  isCalculating?: boolean;
}

export function OptimizationForm({ onCalculate, isCalculating }: OptimizationFormProps) {
  const [params, setParams] = useState<FormParams>({
    risco: 5,
    min_contract_kw: 30,
    step_size_kw: 10,
    delay_months: 1,
    reduction_frequency_months: 12,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(params);
  };

  const updateParam = (key: keyof FormParams, value: string) => {
    setParams((prev) => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  return (
    <Card className="p-6 shadow-card">
      <h2 className="text-xl font-semibold mb-6 text-foreground">
        Parâmetros de Otimização
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="risco" className="text-sm font-medium">
                  Risco de Ultrapassagem (%)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Percentual de risco aceitável de ultrapassar a demanda contratada. Menor = mais conservador.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="risco"
                type="number"
                step="0.1"
                value={params.risco}
                onChange={(e) => updateParam("risco", e.target.value)}
                className="transition-smooth"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="min_contract" className="text-sm font-medium">
                  Contratação Mínima (kW)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Valor mínimo de demanda que pode ser contratado, geralmente definido pela concessionária.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="min_contract"
                type="number"
                step="10"
                value={params.min_contract_kw}
                onChange={(e) => updateParam("min_contract_kw", e.target.value)}
                className="transition-smooth"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="step_size" className="text-sm font-medium">
                  Passo de Ajuste (kW)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Incremento usado para testar diferentes valores de demanda (ex: 5 kW testa 100, 105, 110...).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="step_size"
                type="number"
                step="1"
                value={params.step_size_kw}
                onChange={(e) => updateParam("step_size_kw", e.target.value)}
                className="transition-smooth"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="delay" className="text-sm font-medium">
                  Delay de Implementação (meses)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Tempo entre solicitar a mudança de demanda e ela entrar em vigor na distribuidora.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="delay"
                type="number"
                step="1"
                value={params.delay_months}
                onChange={(e) => updateParam("delay_months", e.target.value)}
                className="transition-smooth"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="frequency" className="text-sm font-medium">
                  Frequência de Redução (meses)
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Intervalo mínimo entre reduções de demanda, conforme regras contratuais da concessionária.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="frequency"
                type="number"
                step="1"
                value={params.reduction_frequency_months}
                onChange={(e) => updateParam("reduction_frequency_months", e.target.value)}
                className="transition-smooth"
              />
            </div>
          </div>
        </TooltipProvider>

        <Button
          type="submit"
          disabled={isCalculating}
          className="w-full gradient-primary text-white font-medium shadow-elevated transition-smooth hover:opacity-90"
        >
          <Calculator className="mr-2 h-4 w-4" />
          {isCalculating ? "Calculando..." : "Calcular Otimização"}
        </Button>
      </form>
    </Card>
  );
}
