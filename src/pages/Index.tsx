import { useState } from "react";
import { OptimizationForm, type FormParams } from "@/components/OptimizationForm";
import { MonthlyDataTable } from "@/components/MonthlyDataTable";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { optimizeWithTiming, type MonthlyData, type OptimizationResult } from "@/lib/optimizer";
import { Zap } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (params: FormParams) => {
    if (monthlyData.length === 0) {
      toast.error("Adicione dados mensais antes de calcular");
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const optimizationResult = optimizeWithTiming(monthlyData, {
          ...params,
          gridPoints: 30,
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
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="gradient-primary text-white shadow-elevated">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Otimizador de Demanda Elétrica</h1>
              <p className="text-sm text-white/80 mt-0.5">
                Análise inteligente para economia em contratos de energia
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Parameters Form */}
        <OptimizationForm onCalculate={handleCalculate} isCalculating={isCalculating} />

        {/* Monthly Data Table */}
        <MonthlyDataTable data={monthlyData} onChange={setMonthlyData} />

        {/* Results Display */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Resultados da Otimização</h2>
          <ResultsDisplay result={result} monthlyData={monthlyData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Otimizador de Demanda Elétrica. Método conservador de otimização.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
