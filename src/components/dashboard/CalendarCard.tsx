import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'meeting' | 'task' | 'event';
}

interface CalendarCardProps {
  title?: string;
  events?: CalendarEvent[];
}

/**
 * CalendarCard Component
 * Simple weekly agenda representation
 * 
 * Uses mock data for demonstration - replace with real data
 */
export const CalendarCard: React.FC<CalendarCardProps> = ({ 
  title = 'Agenda de Hoje',
  events
}) => {
  // Mock data - replace with real data
  const defaultEvents: CalendarEvent[] = [
    { id: '1', time: '09:00', title: 'Reunião de equipe', type: 'meeting' },
    { id: '2', time: '11:30', title: 'Revisão de código', type: 'task' },
    { id: '3', time: '14:00', title: 'Apresentação do projeto', type: 'event' },
    { id: '4', time: '16:30', title: 'Daily standup', type: 'meeting' },
  ];

  const eventList = events || defaultEvents;
  
  const typeColors = {
    meeting: {
      bg: 'bg-blue-100/80 dark:bg-blue-900/30',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-400'
    },
    task: {
      bg: 'bg-purple-100/80 dark:bg-purple-900/30',
      border: 'border-purple-300 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-400'
    },
    event: {
      bg: 'bg-green-100/80 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-400'
    }
  };

  const today = new Date();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const currentDay = today.getDay();

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CalendarIcon className="h-4 w-4" />
          <span>{weekDays[currentDay]}, {today.getDate()}</span>
        </div>
      </div>

      {/* Mini Week View */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {weekDays.map((day, index) => {
          const isToday = index === currentDay;
          return (
            <div
              key={day}
              className={`
                text-center py-2 rounded-[var(--radius-sm)] text-xs
                ${isToday 
                  ? 'font-bold' 
                  : 'text-gray-600 dark:text-gray-400'
                }
              `}
              style={isToday ? {
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-primary)'
              } : {}}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {eventList.length > 0 ? (
          eventList.map((event) => {
            const colors = typeColors[event.type];
            return (
              <div
                key={event.id}
                className={`
                  flex items-start gap-3 p-3 rounded-[var(--radius-md)]
                  border-l-4 ${colors.bg} ${colors.border}
                  transition-[var(--transition-fast)]
                  hover:shadow-sm cursor-pointer
                `}
              >
                <div className={`flex items-center gap-2 flex-shrink-0 ${colors.text}`}>
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">{event.time}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {event.title}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum evento agendado para hoje</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 text-center">
        <button 
          className="text-sm font-medium transition-[var(--transition-fast)] hover:underline"
          style={{ color: 'var(--color-accent)' }}
        >
          Ver calendário completo →
        </button>
      </div>
    </GlassCard>
  );
};

export default CalendarCard;
