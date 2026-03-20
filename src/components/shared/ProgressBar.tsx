interface ProgressBarProps {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ProgressBar({ value, size = 'sm', className = '' }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const fillClass =
    value >= 80
      ? 'from-success-500 to-success-400'
      : value >= 40
        ? 'from-gold-500 to-gold-400'
        : value > 0
          ? 'from-warning-500 to-warning-400'
          : 'from-surface-600 to-surface-500';

  return (
    <div className={`w-full rounded-full border border-white/5 bg-surface-900/80 p-[1px] shadow-inner ${className}`}>
      <div
        className={`rounded-full bg-gradient-to-r ${fillClass} ${height} transition-all duration-300`}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          boxShadow:
            value > 0
              ? value >= 80
                ? '0 0 14px rgba(16,185,129,0.15)'
                : value >= 40
                  ? '0 0 14px rgba(201,144,30,0.15)'
                  : '0 0 12px rgba(245,158,11,0.12)'
              : 'none',
        }}
      />
    </div>
  );
}
