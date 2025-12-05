# Dashboard Components

Modern, reusable UI components for the dashboard, built with design tokens from the LandingSeiteTEST reference.

## Components

### GlassCard
Glassmorphism card with backdrop-filter effect.

```tsx
import { GlassCard } from '@/components/dashboard';

<GlassCard variant="accent">
  <p>Content goes here</p>
</GlassCard>
```

**Props:**
- `children`: ReactNode - Card content
- `className?`: string - Additional CSS classes
- `variant?`: 'default' | 'accent' | 'primary' - Visual variant

### StatPill
Compact KPI indicator with icon and value.

```tsx
import { StatPill } from '@/components/dashboard';
import { TrendingUp } from 'lucide-react';

<StatPill 
  icon={TrendingUp} 
  value="+12%" 
  label="Progress"
  variant="success" 
/>
```

**Props:**
- `icon`: LucideIcon - Icon component
- `value`: string | number - Display value
- `label?`: string - Optional label
- `variant?`: 'default' | 'success' | 'warning' | 'info'

### DashboardHeader
Header with greeting and KPI pills.

```tsx
import { DashboardHeader } from '@/components/dashboard';

<DashboardHeader userName="Fernando" greeting="Bom dia" />
```

**Props:**
- `userName?`: string - User's name (default: 'User')
- `greeting?`: string - Custom greeting (default: time-based)

### ProfileCard
User profile with avatar, role, badge, and stats.

```tsx
import { ProfileCard } from '@/components/dashboard';

<ProfileCard 
  name="Fernando Kraft"
  role="Developer"
  avatarUrl="/avatar.jpg"
  badgeValue={42}
/>
```

**Props:**
- `name?`: string - User's name
- `role?`: string - User's role
- `avatarUrl?`: string - Avatar image URL
- `badgeValue?`: number - Badge number

### ProgressCard
Weekly progress bars with highlighted current day.

```tsx
import { ProgressCard } from '@/components/dashboard';

<ProgressCard title="Weekly Progress" />
```

**Props:**
- `title?`: string - Card title
- `weekData?`: Array<{ day: string; value: number; label: string }> - Custom week data

### TimeTrackerCard
Circular progress timer with play/pause.

```tsx
import { TimeTrackerCard } from '@/components/dashboard';

<TimeTrackerCard 
  title="Time Today"
  totalMinutes={270}
  targetMinutes={480}
/>
```

**Props:**
- `title?`: string - Card title
- `totalMinutes?`: number - Current time in minutes
- `targetMinutes?`: number - Target time in minutes

### OnboardingCard
Task checklist with progress indicator.

```tsx
import { OnboardingCard } from '@/components/dashboard';

const tasks = [
  { id: '1', title: 'Complete profile', completed: true },
  { id: '2', title: 'Setup notifications', completed: false },
];

<OnboardingCard title="Onboarding Tasks" tasks={tasks} />
```

**Props:**
- `title?`: string - Card title
- `tasks?`: Array<{ id: string; title: string; completed: boolean }> - Task list

### CalendarCard
Daily agenda with color-coded events.

```tsx
import { CalendarCard } from '@/components/dashboard';

const events = [
  { id: '1', time: '09:00', title: 'Team meeting', type: 'meeting' },
  { id: '2', time: '14:00', title: 'Project demo', type: 'event' },
];

<CalendarCard title="Today's Agenda" events={events} />
```

**Props:**
- `title?`: string - Card title
- `events?`: Array<{ id: string; time: string; title: string; type: 'meeting' | 'task' | 'event' }> - Event list

## Design Tokens

All components use CSS variables from `src/theme/tokens.css`:

### Colors
- `var(--color-primary)` - #1E3A5F (dark blue)
- `var(--color-accent)` - #95BF39 (lime green)
- `var(--color-accent-2)` - #0B8C38 (dark green)

### Spacing
- `var(--radius-sm)` - 0.25rem (4px)
- `var(--radius-md)` - 0.5rem (8px)
- `var(--radius-lg)` - 0.75rem (12px)
- `var(--radius-full)` - 9999px (fully rounded)

### Shadows
- `var(--shadow-card)` - Card shadow
- `var(--shadow-elevated)` - Elevated shadow

### Effects
- `var(--glass-backdrop)` - blur(10px)
- `var(--transition-smooth)` - 0.3s cubic-bezier
- `var(--transition-fast)` - 0.2s cubic-bezier

## Mock Data

All components include mock data for demonstration purposes. Look for comments marked with `// Mock data - replace with real data` in the component source files.

Replace mock data with real data from your API or state management solution.

## Testing

Component tests are in `tests/dashboardComponents.test.tsx`. Run tests with:

```bash
npm test -- tests/dashboardComponents.test.tsx
```

## Example Page

See `src/pages/DashboardUI.tsx` for a complete example of how to compose these components into a responsive dashboard layout.

The page is accessible at `/dashboard-ui` route (public, no authentication required).
