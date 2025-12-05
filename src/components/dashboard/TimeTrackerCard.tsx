import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from '@/components/ui/button';

interface TimeTrackerCardProps {
  title?: string;
  totalMinutes?: number;
  targetMinutes?: number;
}

/**
 * TimeTrackerCard Component
 * Circular progress indicator with play/pause timer
 * 
 * Uses mock data for demonstration - replace with real data
 */
export const TimeTrackerCard: React.FC<TimeTrackerCardProps> = ({ 
  title = 'Tempo Hoje',
  totalMinutes = 270, // 4.5 hours
  targetMinutes = 480 // 8 hours
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const progress = Math.min((totalMinutes / targetMinutes) * 100, 100);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // SVG circle properties
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <GlassCard className="p-6">
      <h3 
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--color-primary)' }}
      >
        {title}
      </h3>

      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            className="transform -rotate-90"
            width={size}
            height={size}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--color-accent)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.5s ease'
              }}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div 
              className="text-4xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              {hours}:{minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              de {Math.floor(targetMinutes / 60)}h
            </div>
            <div 
              className="text-lg font-semibold mt-2"
              style={{ color: 'var(--color-accent)' }}
            >
              {progress.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Control Button */}
        <Button
          onClick={() => setIsRunning(!isRunning)}
          className="mt-6 w-full"
          style={{
            backgroundColor: isRunning ? 'var(--color-accent-2)' : 'var(--color-primary)',
            color: 'var(--color-white)'
          }}
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </>
          )}
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 w-full">
          <div className="text-center">
            <div 
              className="text-xl font-bold"
              style={{ color: 'var(--color-accent)' }}
            >
              6
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sessões</div>
          </div>
          <div className="text-center">
            <div 
              className="text-xl font-bold"
              style={{ color: 'var(--color-accent)' }}
            >
              45m
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Média</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TimeTrackerCard;
