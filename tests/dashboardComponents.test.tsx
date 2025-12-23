import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { 
  GlassCard,
  StatPill,
  DashboardHeader,
  ProfileCard,
  ProgressCard,
  TimeTrackerCard,
  OnboardingCard,
  CalendarCard
} from '@/components/dashboard';
import { TrendingUp } from 'lucide-react';

describe('Dashboard Components', () => {
  describe('GlassCard', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <GlassCard>
          <div>Test Content</div>
        </GlassCard>
      );
      expect(getByText('Test Content')).toBeDefined();
    });

    it('should accept variant prop', () => {
      const { container } = render(
        <GlassCard variant="accent">Content</GlassCard>
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('StatPill', () => {
    it('should render icon and value', () => {
      const { getByText } = render(
        <StatPill icon={TrendingUp} value="42" />
      );
      expect(getByText('42')).toBeDefined();
    });

    it('should render label when provided', () => {
      const { getByText } = render(
        <StatPill icon={TrendingUp} value="42" label="Points" />
      );
      expect(getByText('Points')).toBeDefined();
    });

    it('should support different variants', () => {
      const { getByText } = render(
        <StatPill icon={TrendingUp} value="100" variant="success" />
      );
      expect(getByText('100')).toBeDefined();
    });
  });

  describe('DashboardHeader', () => {
    it('should render greeting with user name', () => {
      const { getByText } = render(
        <DashboardHeader userName="Fernando" />
      );
      expect(getByText(/Fernando/)).toBeDefined();
    });

    it('should display KPI pills', () => {
      const { getByText } = render(
        <DashboardHeader userName="Test" />
      );
      // Check for mock KPI values
      expect(getByText('+12%')).toBeDefined();
      expect(getByText('87')).toBeDefined();
    });
  });

  describe('ProfileCard', () => {
    it('should render user name and role', () => {
      const { getByText } = render(
        <ProfileCard name="Fernando Kraft" role="Developer" />
      );
      expect(getByText('Fernando Kraft')).toBeDefined();
      expect(getByText('Developer')).toBeDefined();
    });

    it('should display badge value', () => {
      const { getByText } = render(
        <ProfileCard badgeValue={42} />
      );
      expect(getByText(/42/)).toBeDefined();
    });

    it('should show stats', () => {
      const { getByText } = render(
        <ProfileCard />
      );
      expect(getByText('12')).toBeDefined(); // Projects
      expect(getByText('87%')).toBeDefined(); // Completion
    });
  });

  describe('ProgressCard', () => {
    it('should render title', () => {
      const { getByText } = render(
        <ProgressCard title="Weekly Progress" />
      );
      expect(getByText('Weekly Progress')).toBeDefined();
    });

    it('should display week days', () => {
      const { getByText } = render(
        <ProgressCard />
      );
      expect(getByText('Seg')).toBeDefined();
      expect(getByText('Sex')).toBeDefined();
    });

    it('should show average and goal', () => {
      const { getByText } = render(
        <ProgressCard />
      );
      expect(getByText(/Média:/)).toBeDefined();
      expect(getByText(/Meta:/)).toBeDefined();
    });
  });

  describe('TimeTrackerCard', () => {
    it('should render title', () => {
      const { getByText } = render(
        <TimeTrackerCard title="Time Today" />
      );
      expect(getByText('Time Today')).toBeDefined();
    });

    it('should display time value', () => {
      const { getByText } = render(
        <TimeTrackerCard totalMinutes={270} />
      );
      expect(getByText('4:30')).toBeDefined();
    });

    it('should show start/pause button', () => {
      const { getByText } = render(
        <TimeTrackerCard />
      );
      expect(getByText('Iniciar')).toBeDefined();
    });
  });

  describe('OnboardingCard', () => {
    it('should render title', () => {
      const { getByText } = render(
        <OnboardingCard title="Onboarding Tasks" />
      );
      expect(getByText('Onboarding Tasks')).toBeDefined();
    });

    it('should display task list', () => {
      const { getByText } = render(
        <OnboardingCard />
      );
      expect(getByText('Completar perfil')).toBeDefined();
      expect(getByText('Configurar notificações')).toBeDefined();
    });

    it('should show progress ratio', () => {
      const { getByText } = render(
        <OnboardingCard />
      );
      expect(getByText('3/5')).toBeDefined();
    });
  });

  describe('CalendarCard', () => {
    it('should render title', () => {
      const { getByText } = render(
        <CalendarCard title="Today's Agenda" />
      );
      expect(getByText("Today's Agenda")).toBeDefined();
    });

    it('should display events', () => {
      const { getByText } = render(
        <CalendarCard />
      );
      expect(getByText('Reunião de equipe')).toBeDefined();
      expect(getByText('09:00')).toBeDefined();
    });

    it('should show week days', () => {
      const { getByText } = render(
        <CalendarCard />
      );
      expect(getByText('Seg')).toBeDefined();
      expect(getByText('Dom')).toBeDefined();
    });
  });
});
