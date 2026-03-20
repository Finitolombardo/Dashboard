import type { Priority } from '../../types';
import { PRIORITY_LABELS } from '../../types';

const priorityStyles: Record<Priority, string> = {
  critical: 'border-danger-500/25 bg-danger-500/10 text-danger-300',
  high: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  medium: 'border-white/5 bg-surface-800/70 text-surface-300',
  low: 'border-white/5 bg-surface-800/60 text-surface-500',
};

const priorityDots: Record<Priority, string> = {
  critical: 'bg-danger-400',
  high: 'bg-warning-400',
  medium: 'bg-surface-400',
  low: 'bg-surface-500',
};

interface PriorityTagProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export default function PriorityTag({ priority, size = 'sm' }: PriorityTagProps) {
  const sizeClasses = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium tracking-wide ${priorityStyles[priority]} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${priorityDots[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
