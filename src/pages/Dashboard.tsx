import { useState, useEffect } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { KpiCard } from "@/components/KpiCard";
import { DemandChart } from "@/components/DemandChart";
import { BulkEditMonthlyDataTable } from "@/components/BulkEditMonthlyDataTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingDown,
  Zap,
  Calendar,
  DollarSign,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import {
  MonthlyData,
  optimizeSequenceDP,
  DPOptimizationResult,
} from "@/lib/optimizer";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/lib/storage";
import { toast } from "sonner";

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [result, setResult] = useState<DPOptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (loaded.length > 0) {
      setMonthlyData(loaded);
      toast.info(`${loaded.length} meses carregados do armazenamento local`);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (monthlyData.length > 0) {
      saveToLocalStorage(monthlyData);
    }
  }, [monthlyData]);

  const handleCalculate = () => {
    if (monthlyData.length === 0) {
      toast.error("Adicione dados mensais antes de calcular");
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const optimizationResult = optimizeSequenceDP(monthlyData, {
          risco: 5,
          min_contract_kw: 100,
          step_size_kw: 10,
          gridPoints: 30,
          delay_months: 1,
          reduction_frequency_months: 12,
          data_base: new Date().toISOString().slice(0, 7),
          igpm_mensal_pct: {},
        });

        setResult(optimizationResult);
        toast.success("Otimização calculada com sucesso!");
      } catch (error) {
        toast.error("Erro ao calcular otimização. Verifique os dados.");
        console.error(error);
      } finally {
        setIsCalculating(false);
      }
    }, 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatKw = (value: number) => {
    return `${value.toFixed(1)} kW`;
  };

  // Calculate KPIs
  const monthsWithUnderutilization = monthlyData.filter(
    (item) => item.demanda_medida_kw < item.demanda_contratada_kw * 0.9
  ).length;

  const avgContracted =
    monthlyData.length > 0
      ? monthlyData.reduce((sum, item) => sum + item.demanda_contratada_kw, 0) /
        monthlyData.length
      : 0;

  // Prepare chart data
  const demandChartData = monthlyData.map((item, idx) => ({
    month: item.ano_mes.slice(5, 7) + "/" + item.ano_mes.slice(2, 4),
    contratada: item.demanda_contratada_kw,
    medida: item.demanda_medida_kw,
    otimizada:
      result?.monthlyBreakdown[idx]?.contratada_kw || item.demanda_contratada_kw,
  }));

  const costChartData =
    result?.monthlyBreakdown.map((item) => ({
      month: item.ano_mes.slice(5, 7) + "/" + item.ano_mes.slice(2, 4),
      custo_real: item.custo_real,
      custo_otimo: item.custo_otimo,
    })) || [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <HeaderNav />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Indicadores-Chave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Economia Potencial"
              value={result ? formatCurrency(result.totalSavings) : "R$ 0,00"}
              icon={DollarSign}
              variant="success"
              description={result ? "Economia total projetada" : "Calcule para ver"}
            />
            <KpiCard
              title="Meses Subutilizados"
              value={monthsWithUnderutilization}
              icon={AlertTriangle}
              variant="warning"
              description={`${monthlyData.length} meses no total`}
            />
            <KpiCard
              title="Contratada Média"
              value={formatKw(avgContracted)}
              icon={Zap}
              variant="info"
              description="Média atual"
            />
            <KpiCard
              title="Contratada Ótima"
              value={result ? formatKw(result.x) : "—"}
              icon={TrendingDown}
              variant="default"
              description={result ? "Recomendação" : "Calcule para ver"}
            />
          </div>
        </section>

        {/* Monthly Data Table */}
        <BulkEditMonthlyDataTable data={monthlyData} onChange={setMonthlyData} />

        {/* Calculate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating || monthlyData.length === 0}
            className="gradient-primary text-white font-medium shadow-elevated transition-smooth hover:opacity-90 px-8 py-6 text-lg"
          >
            <Calculator className="mr-2 h-5 w-5" />
            {isCalculating ? "Calculando..." : "Calcular Otimização"}
          </Button>
        </div>

        {/* Charts Section */}
        {result && (
          <>
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Visualizações
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemandChart
                  data={demandChartData}
                  type="line"
                  title="Demanda: Atual vs Medida vs Otimizada"
                  height={300}
                />
                <DemandChart
                  data={costChartData}
                  type="bar"
                  title="Custos: Real vs Otimizado"
                  height={300}
                />
              </div>
            </section>

            {/* Recontracts Section */}
            {result.recontracts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Sequência de Recontratações
                </h2>
                <Card className="p-6 shadow-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ação</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nível (kW)</TableHead>
                        <TableHead>Mês Solicitação</TableHead>
                        <TableHead>Mês Vigência</TableHead>
                        <TableHead>Delay (meses)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.recontracts.map((recontract, idx) => (
                        <TableRow key={idx}>
                          <TableCell>#{idx + 1}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                recontract.type === "increase"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              }`}
                            >
                              {recontract.type === "increase" ? "Aumento" : "Redução"}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatKw(recontract.level_kw)}
                          </TableCell>
                          <TableCell>
                            {monthlyData[recontract.s_req - 1]?.ano_mes || `Mês ${recontract.s_req}`}
                          </TableCell>
                          <TableCell>
                            {monthlyData[recontract.s_eff - 1]?.ano_mes || `Mês ${recontract.s_eff}`}
                          </TableCell>
                          <TableCell>{recontract.s_eff - recontract.s_req}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </section>
            )}

            {/* Monthly Breakdown */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Breakdown Mensal Detalhado
              </h2>
              <Card className="p-6 shadow-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead>Contratada Atual (kW)</TableHead>
                        <TableHead>Medida (kW)</TableHead>
                        <TableHead>Custo Real</TableHead>
                        <TableHead>Custo Otimizado</TableHead>
                        <TableHead>Poupança</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.monthlyBreakdown.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell className="font-medium">
                            {month.ano_mes}
                          </TableCell>
                          <TableCell>{formatKw(month.contratada_kw)}</TableCell>
                          <TableCell>{formatKw(month.medida_kw)}</TableCell>
                          <TableCell>{formatCurrency(month.custo_real)}</TableCell>
                          <TableCell className="text-green-600 dark:text-green-400 font-semibold">
                            {formatCurrency(month.custo_otimo)}
                          </TableCell>
                          <TableCell
                            className={
                              month.poupanca > 0
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {formatCurrency(month.poupanca)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={3}>TOTAL</TableCell>
                        <TableCell>{formatCurrency(result.totalCostReal)}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400">
                          {formatCurrency(result.totalCostOptimized)}
                        </TableCell>
                        <TableCell className="text-green-600 dark:text-green-400">
                          {formatCurrency(result.totalSavings)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </section>

            {/* Summary */}
            <Card className="p-6 shadow-card bg-accent-light/30 border-accent/20">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumo e Recomendações
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>
                    Economia total projetada: <strong>{formatCurrency(result.totalSavings)}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>
                    {result.recontracts.length} recontratação(ões) recomendada(s)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>
                    Aumentos entram em vigor em 1 mês; reduções em 3 meses
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>
                    Máximo de 1 redução a cada 12 meses (regra contratual)
                  </span>
                </li>
              </ul>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2025 Otimizador de Demanda Elétrica. Método de Programação Dinâmica com múltiplas recontratações.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
