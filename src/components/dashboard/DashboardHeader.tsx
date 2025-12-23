import React from 'react';
import { TrendingUp, Star, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatPill } from './StatPill';

interface DashboardHeaderProps {
  userName?: string;
  greeting?: string;
}

/**
 * DashboardHeader Component
 * Header with greeting and KPI stats at top-right
 * 
 * Uses mock data for demonstration - replace with real data
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName = 'User',
  greeting 
}) => {
  // Mock KPI data - replace with real data
  const currentHour = new Date().getHours();
  const defaultGreeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';
  
  const greetingText = greeting || defaultGreeting;

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Greeting Section */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {greetingText}, {userName}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Aqui está um resumo do seu progresso hoje
          </p>
        </div>

        {/* KPI Pills Section */}
        <div className="flex flex-wrap gap-3">
          <StatPill 
            icon={TrendingUp} 
            value="+12%" 
            label="Progresso"
            variant="success" 
          />
          <StatPill 
            icon={Star} 
            value="87" 
            label="Pontos"
            variant="info" 
          />
          <StatPill 
            icon={Clock} 
            value="4.5h" 
            label="Hoje"
            variant="default" 
          />
        </div>
      </div>
    </GlassCard>
  );
};

export default DashboardHeader;
