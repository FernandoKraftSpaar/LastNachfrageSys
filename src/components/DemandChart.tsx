import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DemandChartData {
  month: string;
  contratada: number;
  medida: number;
  otimizada?: number;
}

interface CostChartData {
  month: string;
  custo_real: number;
  custo_otimo: number;
}

interface DemandChartProps {
  data: DemandChartData[] | CostChartData[];
  type: 'line' | 'bar';
  title: string;
  height?: number;
}

export function DemandChart({ data, type, title, height = 300 }: DemandChartProps) {
  const isLineChart = type === 'line';
  const isDemandData = 'contratada' in (data[0] || {});

  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {isLineChart ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            {isDemandData && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="contratada" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Contratada Atual"
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="medida" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  name="Medida"
                  dot={{ fill: 'hsl(var(--accent))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="otimizada" 
                  stroke="hsl(var(--accent-2))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Otimizada"
                  dot={{ fill: 'hsl(var(--accent-2))' }}
                />
              </>
            )}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            />
            <Legend />
            <Bar 
              dataKey="custo_real" 
              fill="hsl(var(--destructive))" 
              name="Custo Real"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="custo_otimo" 
              fill="hsl(var(--accent-2))" 
              name="Custo Otimizado"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}
