import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Progress } from '@/components/ui/progress';

interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
}

interface OnboardingCardProps {
  title?: string;
  tasks?: OnboardingTask[];
}

/**
 * OnboardingCard Component
 * Task list with progress indicator, dark-mode focused
 * 
 * Uses mock data for demonstration - replace with real data
 */
export const OnboardingCard: React.FC<OnboardingCardProps> = ({ 
  title = 'Tarefas de Integração',
  tasks
}) => {
  // Mock data - replace with real data
  const defaultTasks: OnboardingTask[] = [
    { id: '1', title: 'Completar perfil', completed: true },
    { id: '2', title: 'Configurar notificações', completed: true },
    { id: '3', title: 'Conectar calendário', completed: true },
    { id: '4', title: 'Convidar membros da equipe', completed: false },
    { id: '5', title: 'Criar primeiro projeto', completed: false },
  ];

  const taskList = tasks || defaultTasks;
  const completedCount = taskList.filter(t => t.completed).length;
  const totalCount = taskList.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <GlassCard className="p-6" variant="primary">
      <div className="mb-6">
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-3">
          <Progress 
            value={progressPercentage} 
            className="flex-1"
          />
          <span 
            className="text-sm font-semibold whitespace-nowrap"
            style={{ color: 'var(--color-accent)' }}
          >
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {taskList.map((task) => (
          <div
            key={task.id}
            className={`
              flex items-center gap-3 p-3 rounded-[var(--radius-md)]
              transition-[var(--transition-fast)]
              ${task.completed 
                ? 'bg-green-50/50 dark:bg-green-900/20' 
                : 'bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-100/50 dark:hover:bg-slate-700/50'
              }
              cursor-pointer
            `}
          >
            {task.completed ? (
              <CheckCircle2 
                className="h-5 w-5 flex-shrink-0"
                style={{ color: 'var(--color-accent-2)' }}
              />
            ) : (
              <Circle className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-slate-600" />
            )}
            <span 
              className={`text-sm ${
                task.completed 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {task.title}
            </span>
          </div>
        ))}
      </div>

      {completedCount === totalCount && (
        <div 
          className="mt-6 p-4 rounded-[var(--radius-md)] text-center text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-primary)'
          }}
        >
          🎉 Parabéns! Você completou todas as tarefas!
        </div>
      )}
    </GlassCard>
  );
};

export default OnboardingCard;
