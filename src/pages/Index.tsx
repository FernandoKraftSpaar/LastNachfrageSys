import { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { OptimizationForm, type FormParams } from "@/components/OptimizationForm";
import { MonthlyDataTable } from "@/components/MonthlyDataTable";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { optimizeWithTiming, type MonthlyData, type OptimizationResult } from "@/lib/optimizer";
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
      <HeaderNav />

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
