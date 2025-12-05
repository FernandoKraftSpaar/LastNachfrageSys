import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from './GlassCard';

interface ProfileCardProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
  badgeValue?: number;
}

/**
 * ProfileCard Component
 * Displays user avatar, name, role, and badge value
 * 
 * Uses mock data for demonstration - replace with real data
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  name = 'Fernando Kraft',
  role = 'Desenvolvedor',
  avatarUrl,
  badgeValue = 42
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-lg">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback 
              className="text-xl font-bold"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)'
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Badge Overlay */}
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
          >
            <Badge 
              className="px-3 py-1 shadow-md"
              style={{ 
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-primary)'
              }}
            >
              ⭐ {badgeValue}
            </Badge>
          </div>
        </div>

        {/* Name and Role */}
        <h3 
          className="text-xl font-bold mt-4 mb-1"
          style={{ color: 'var(--color-primary)' }}
        >
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {role}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 w-full pt-4 border-t border-gray-200 dark:border-slate-700">
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              12
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Projetos</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              87%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completo</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              24
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Tarefas</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProfileCard;
