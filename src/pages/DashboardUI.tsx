import React from 'react';
import { Shield } from 'lucide-react';
import {
  DashboardHeader,
  ProfileCard,
  ProgressCard,
  TimeTrackerCard,
  OnboardingCard,
  CalendarCard,
} from '@/components/dashboard';

/**
 * DashboardUI Page
 * 
 * Modern UI dashboard with 3-column responsive grid layout.
 * This page is publicly accessible without authentication.
 * 
 * Components use design tokens from src/theme/tokens.css
 */
const DashboardUI = () => {
  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: 'var(--gradient-subtle)'
      }}
    >
      {/* Auth Bypass Notice */}
      <div 
        className="max-w-7xl mx-auto mb-4 p-3 rounded-[var(--radius-md)] border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/30 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
          <Shield className="h-4 w-4" />
          <span>
            <strong>Modo Demonstração:</strong> Esta página está acessível sem autenticação. 
            Em produção, adicione verificação de autenticação aqui.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Full Width */}
        <DashboardHeader userName="Fernando" />

        {/* Main Grid - 3 Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Tasks (3 cols on large screens) */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileCard />
            <OnboardingCard />
          </div>

          {/* Center Column - Progress & Time Tracker (6 cols on large screens) */}
          <div className="lg:col-span-6 space-y-6">
            <ProgressCard />
            <TimeTrackerCard />
          </div>

          {/* Right Column - Calendar (3 cols on large screens) */}
          <div className="lg:col-span-3 space-y-6">
            <CalendarCard />
            
            {/* Quick Stats Card */}
            <div 
              className="p-6 rounded-[var(--radius-lg)] border backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'var(--color-accent)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                Estatísticas Rápidas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de conclusão</span>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: 'var(--color-accent-2)' }}
                  >
                    87%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tarefas ativas</span>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: 'var(--color-accent-2)' }}
                  >
                    12
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dias consecutivos</span>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: 'var(--color-accent-2)' }}
                  >
                    23
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-8">
          <p>
            Componentes construídos com design tokens do{' '}
            <a 
              href="https://github.com/FernandoKraftSpaar/LandingSeiteTEST" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              LandingSeiteTEST
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardUI;
