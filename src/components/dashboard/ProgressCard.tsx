import React from 'react';
import { GlassCard } from './GlassCard';

interface ProgressCardProps {
  title?: string;
  weekData?: Array<{ day: string; value: number; label: string }>;
}

/**
 * ProgressCard Component
 * Shows weekly progress bars with highlighted current day
 * 
 * Uses mock data for demonstration - replace with real data
 */
export const ProgressCard: React.FC<ProgressCardProps> = ({ 
  title = 'Progresso Semanal',
  weekData
}) => {
  // Mock data - replace with real data
  const currentDay = new Date().getDay();
  const defaultWeekData = [
    { day: 'Seg', value: 85, label: 'Segunda' },
    { day: 'Ter', value: 92, label: 'Terça' },
    { day: 'Qua', value: 78, label: 'Quarta' },
    { day: 'Qui', value: 95, label: 'Quinta' },
    { day: 'Sex', value: 88, label: 'Sexta' },
    { day: 'Sáb', value: 45, label: 'Sábado' },
    { day: 'Dom', value: 30, label: 'Domingo' },
  ];

  const data = weekData || defaultWeekData;
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <GlassCard className="p-6">
      <h3 
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--color-primary)' }}
      >
        {title}
      </h3>

      <div className="flex items-end justify-between gap-3 h-48">
        {data.map((item, index) => {
          const isToday = index === (currentDay === 0 ? 6 : currentDay - 1);
          const heightPercentage = (item.value / maxValue) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-full">
                <div 
                  className="w-full rounded-[var(--radius-md)] transition-all duration-300 hover:opacity-80 cursor-pointer relative"
                  style={{
                    height: `${heightPercentage}%`,
                    backgroundColor: isToday 
                      ? 'var(--color-accent)' 
                      : 'var(--color-primary)',
                    opacity: isToday ? 1 : 0.6
                  }}
                  title={`${item.label}: ${item.value}%`}
                >
                  {/* Value label on hover */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">
                    {item.value}%
                  </div>
                </div>
              </div>

              {/* Day Label */}
              <div 
                className={`text-xs font-medium ${
                  isToday 
                    ? 'font-bold' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                style={isToday ? { color: 'var(--color-accent)' } : {}}
              >
                {item.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Média: {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)}%</span>
        <span>Meta: 90%</span>
      </div>
    </GlassCard>
  );
};

export default ProgressCard;
