function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'Gerade eben';
  if (diffMin < 60) return `vor ${diffMin}m`;
  if (diffH < 24) return `vor ${diffH}h`;
  if (diffD < 7) return `vor ${diffD}T`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

interface TimeAgoProps {
  date: string;
  className?: string;
}

export default function TimeAgo({ date, className = '' }: TimeAgoProps) {
  return (
    <span className={`text-2xs text-surface-500 ${className}`} title={new Date(date).toLocaleString('de-DE')}>
      {getTimeAgo(date)}
    </span>
  );
}
