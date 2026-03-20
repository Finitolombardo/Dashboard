interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ProgressBar({ value, size = 'sm', className = '' }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1' : 'h-1.5';
  const barColor =
    value >= 80 ? 'bg-success-500' :
    value >= 40 ? 'bg-gold-500' :
    value > 0 ? 'bg-warning-500' :
    'bg-surface-600';

  return (
    <div className={`w-full ${height} bg-surface-700/30 rounded-full overflow-hidden ${className}`}>
      <div
        className={`${height} ${barColor} rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
