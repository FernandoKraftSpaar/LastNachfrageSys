import { Card } from "@/components/ui/card";
import { OptimizationResult, MonthlyData } from "@/lib/optimizer";
import { TrendingDown, Calendar, Zap, DollarSign } from "lucide-react";

interface ResultsDisplayProps {
  result: OptimizationResult | null;
  monthlyData: MonthlyData[];
}

export function ResultsDisplay({ result, monthlyData }: ResultsDisplayProps) {
  if (!result) {
    return (
      <Card className="p-8 shadow-card text-center">
        <div className="text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Configure os parâmetros e dados mensais,</p>
          <p>depois clique em "Calcular Otimização" para ver os resultados.</p>
        </div>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatKw = (value: number) => {
    return `${value.toFixed(1)} kW`;
  };

  const formatMonthYear = (monthIndex: number) => {
    if (!monthlyData || monthlyData.length === 0 || monthIndex < 1 || monthIndex > monthlyData.length) {
      return `Mês ${monthIndex}`;
    }
    
    const monthData = monthlyData[monthIndex - 1]; // Convert 1-based to 0-based
    if (!monthData || !monthData.ano_mes) {
      return `Mês ${monthIndex}`;
    }
    
    const [year, month] = monthData.ano_mes.split('-');
    const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const monthName = monthNames[parseInt(month) - 1] || month;
    
    return `${monthName}/${year}`;
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 gradient-success text-white shadow-elevated">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">
                Economia Projetada
              </h3>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(result.economia_corr)}</p>
          </div>
          <TrendingDown className="h-10 w-10 opacity-80" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Demanda Ótima
            </h4>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatKw(result.x)}</p>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Mês de Solicitação
            </h4>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatMonthYear(result.s_req)}</p>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Início Vigência
            </h4>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatMonthYear(result.s_eff)}</p>
        </Card>
      </div>

      <Card className="p-6 shadow-card bg-accent-light/30 border-accent/20">
        <h4 className="font-semibold text-foreground mb-3">Recomendações</h4>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              Solicitar ajuste de demanda para <strong>{formatKw(result.x)}</strong> no mês{" "}
              <strong>{result.s_req}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              A economia estimada considera correção monetária e será efetivada a partir do
              mês <strong>{result.s_eff}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>
              Monitorar consumo mensalmente para validar a adequação da contratação
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
