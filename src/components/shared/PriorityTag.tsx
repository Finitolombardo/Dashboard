import type { Priority } from '../../types';
import { PRIORITY_LABELS } from '../../types';

const priorityStyles: Record<Priority, string> = {
  critical: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
  high: 'bg-warning-500/15 text-warning-400 border-warning-500/20',
  medium: 'bg-surface-600/30 text-surface-300 border-surface-600/30',
  low: 'bg-surface-700/30 text-surface-500 border-surface-700/30',
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
    <span className={`inline-flex items-center gap-1 rounded border font-medium ${priorityStyles[priority]} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${priorityDots[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
