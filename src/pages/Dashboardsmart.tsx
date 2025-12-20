import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Bell
} from 'lucide-react';

// --- CONFIGURAÇÕES E DADOS (Simulação vinda da API) ---
const CONTRATADA = 500; // kW
const DADOS_MENSAIS = [
  { mes: 'Jan', medida: 420 },
  { mes: 'Fev', medida: 450 },
  { mes: 'Mar', medida: 480 },
  { mes: 'Abr', medida: 510 }, // Ultrapassa limite contratado
  { mes: 'Mai', medida: 530 }, // Ultrapassa limite contratado (maior excedente)
  { mes: 'Jun', medida: 490 }, // Mês Atual (Seguro)
];

// Pega o último mês para os KPIs
const MES_ATUAL = DADOS_MENSAIS[DADOS_MENSAIS.length - 1];

// --- COMPONENTES VISUAIS (Internalizados para Rigor Visual) ---

/**
 * 1. Logo SmartSpaar
 * Implementação SVG pura para garantir cores exatas do tema.
 */
const LogoSmartSpaar = () => (
  <div className="flex items-center gap-2 select-none">
    {/* Ícone Geométrico: Raio + Folha */}
    <svg viewBox="0 0 100 100" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M55 10 L25 55 L45 55 L35 90 L80 40 L55 40 L65 10 Z" 
        className="fill-primary stroke-primary" 
        strokeWidth="4" 
        strokeLinejoin="round"
      />
      <path 
        d="M45 55 C45 55 35 75 55 75 C75 75 75 55 60 50" 
        className="fill-accent stroke-card" 
        strokeWidth="3" 
      />
    </svg>
    {/* Tipografia */}
    <div className="flex flex-col justify-center leading-none">
      <span className="font-bold tracking-tight text-xl font-[Nexa Heavy] text-primary">
        SMART<span className="text-accent">SPAAR</span>
      </span>
      <span className="text-[0.6rem] tracking-widest uppercase font-semibold text-muted-foreground/80">
        Gestão de Energia
      </span>
    </div>
  </div>
);

/**
 * 2. Velocímetro de Risco (Gauge)
 * SVG dinâmico que muda de cor conforme a regra de negócio.
 */
const GaugeRisco = ({ atual, limite }: { atual: number, limite: number }) => {
  // Lógica de Negócio para Cores
  const isMulta = atual > limite;
  const isAlerta = !isMulta && atual > (limite * 0.9);
  
  // Define cor baseada no status
  let colorClass = "text-accent"; // Verde (Padrão)
  let statusText = "OPERAÇÃO SEGURA";
  
  if (isMulta) {
    colorClass = "text-destructive";
    statusText = "MULTA ATIVA";
  } else if (isAlerta) {
    colorClass = "text-yellow-500"; // Fallback para amarelo se não tiver var --warning
    statusText = "ALERTA DE CONSUMO";
  }

  // Cálculos do Arco SVG
  const radius = 80;
  const maxVal = limite * 1.2; // O ponteiro vai até 120% da contratada
  const normalizedValue = Math.min(atual, maxVal); // Trava o ponteiro no máximo
  const percent = normalizedValue / maxVal;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (percent * circumference);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg height="120" width="200" viewBox="0 0 200 110" className="overflow-visible">
        {/* Arco de Fundo (Cinza Claro) */}
        <path d="M20,100 A80,80 0 0,1 180,100" fill="none" className="stroke-muted/20" strokeWidth="16" strokeLinecap="round" />
        
        {/* Arco de Valor (Colorido) */}
        <path 
          d="M20,100 A80,80 0 0,1 180,100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="16" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      {/* Texto Central */}
      <div className="absolute bottom-0 text-center flex flex-col items-center">
        <span className={`text-3xl font-bold tracking-tighter ${colorClass}`}>
          {atual} <span className="text-sm font-medium text-muted-foreground">kW</span>
        </span>
        <span className={`text-[0.65rem] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full bg-card border ${isMulta ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL DO DASHBOARD ---

export default function DashboardSmartSpaar() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <LogoSmartSpaar />
            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button type="button" className="text-primary">Painel Geral</button>
              <button type="button" className="text-muted-foreground hover:text-primary transition-colors">Faturas</button>
              <button type="button" className="text-muted-foreground hover:text-primary transition-colors">Relatórios</button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button 
              className="relative p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              onClick={() => {
                // TODO: implementar funcionalidade de notificações
              }}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {/* TODO: usar iniciais dinâmicas do usuário atual */}
              IM
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/* --- TÍTULO E CONTEXTO --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
              Visão Geral da Demanda
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              {/* TODO: usar nome e UC dinâmicos do cliente atual */}
              Indústria Metalúrgica do Vale (UC 9982)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium transition-colors bg-card border border-input rounded-md hover:bg-accent hover:text-accent-foreground shadow-sm"
              onClick={() => {
                // TODO: implementar exportação em PDF
              }}
            >
              Exportar PDF
            </button>
            <button
              className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-md hover:bg-primary/90 shadow-sm"
              onClick={() => {
                // TODO: implementar lógica de nova simulação
              }}
            >
              Nova Simulação
            </button>
          </div>
        </div>

        {/* --- GRID DE KPIS (As 3 "Janelinhas") --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Demanda Contratada */}
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Demanda Contratada</h3>
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">
                {CONTRATADA} <span className="text-lg font-medium text-muted-foreground">kW</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Limite contratual fixo
              </p>
            </div>
          </div>

          {/* Card 2: Demanda Medida */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Consumo Atual ({MES_ATUAL.mes})</h3>
              <Zap className={`h-4 w-4 ${MES_ATUAL.medida > CONTRATADA ? 'text-destructive' : 'text-accent'}`} />
            </div>
            <div>
              <div className={`text-4xl font-bold ${MES_ATUAL.medida > CONTRATADA ? 'text-destructive' : 'text-foreground'}`}>
                {MES_ATUAL.medida} <span className="text-lg font-medium text-muted-foreground">kW</span>
              </div>
              <div className="mt-2 flex items-center text-xs font-medium">
                <span className={`${MES_ATUAL.medida > CONTRATADA ? 'text-destructive bg-destructive/10' : 'text-accent bg-accent/10'} px-2 py-0.5 rounded mr-2`}>
                  {Math.round((MES_ATUAL.medida / CONTRATADA) * 100)}%
                </span>
                <span className="text-muted-foreground">da capacidade utilizada</span>
              </div>
            </div>
          </div>

          {/* Card 3: Monitor de Risco (Velocímetro) */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col items-center justify-between min-h-[160px]">
            <h3 className="text-sm font-medium text-muted-foreground w-full text-left px-2">Monitor de Risco</h3>
            <div className="-mt-6 transform scale-90">
              <GaugeRisco atual={MES_ATUAL.medida} limite={CONTRATADA} />
            </div>
          </div>

        </div>

        {/* --- GRÁFICO HISTÓRICO --- */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">Histórico de Consumo</h3>
              <p className="text-sm text-muted-foreground">Comparativo dos últimos 6 meses (Medido vs. Contratado)</p>
            </div>
            {/* Legenda Customizada */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-accent"></span> Seguro
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-destructive"></span> Multa
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-primary border-t border-dashed border-primary"></span> Limite
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DADOS_MENSAIS} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  tickFormatter={(val) => `${val} kW`}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isOver = data.medida > CONTRATADA;
                      return (
                        <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
                          <p className="text-sm font-bold text-foreground mb-1">{data.mes}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Medido:</span>
                            <span className={`font-bold ${isOver ? 'text-destructive' : 'text-accent'}`}>
                              {data.medida} kW
                            </span>
                          </div>
                          {isOver && (
                            <div className="mt-2 text-[10px] font-bold text-destructive uppercase bg-destructive/10 px-1.5 py-0.5 rounded w-fit">
                              Ultrapassagem
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={CONTRATADA} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                />
                <Bar dataKey="medida" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {DADOS_MENSAIS.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      // Lógica rigorosa de cores: Vermelho se passar, Verde se não
                      fill={entry.medida > CONTRATADA ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
    </div>
  );
}