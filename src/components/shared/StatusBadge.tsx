import type { QuestStatus, AgentStatus, SignalStatus, WorkflowStatus, ExecutionStatus, SessionStatus, SessionHealth, ServiceStatus, CampaignStatus } from '../../types';

type AllStatuses = QuestStatus | AgentStatus | SignalStatus | WorkflowStatus | ExecutionStatus | SessionStatus | SessionHealth | ServiceStatus | CampaignStatus;

const statusStyles: Record<string, string> = {
  draft: 'bg-surface-700/50 text-surface-300',
  ready: 'bg-gold-500/10 text-gold-300',
  in_progress: 'bg-gold-500/10 text-gold-300',
  waiting: 'bg-warning-500/20 text-warning-400',
  blocked: 'bg-danger-500/20 text-danger-400',
  in_review: 'bg-gold-500/10 text-gold-200',
  done: 'bg-success-500/20 text-success-400',
  paused: 'bg-surface-600/30 text-surface-400',
  archived: 'bg-surface-700/30 text-surface-500',

  idle: 'bg-surface-700/50 text-surface-300',
  working: 'bg-gold-500/10 text-gold-300',
  offline: 'bg-surface-700/30 text-surface-500',
  error: 'bg-danger-500/20 text-danger-400',

  open: 'bg-warning-500/20 text-warning-400',
  acknowledged: 'bg-gold-500/10 text-gold-300',
  resolved: 'bg-success-500/20 text-success-400',
  dismissed: 'bg-surface-700/30 text-surface-500',

  active: 'bg-success-500/20 text-success-400',
  inactive: 'bg-surface-700/30 text-surface-500',

  success: 'bg-success-500/20 text-success-400',
  failed: 'bg-danger-500/20 text-danger-400',
  running: 'bg-gold-500/10 text-gold-300',
  cancelled: 'bg-surface-700/30 text-surface-500',

  completed: 'bg-success-500/20 text-success-400',

  healthy: 'bg-success-500/20 text-success-400',
  degraded: 'bg-warning-500/20 text-warning-400',

  online: 'bg-success-500/20 text-success-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Entwurf',
  ready: 'Bereit',
  in_progress: 'In Bearbeitung',
  waiting: 'Wartend',
  blocked: 'Blockiert',
  in_review: 'In Prüfung',
  done: 'Erledigt',
  paused: 'Pausiert',
  archived: 'Archiviert',
  idle: 'Bereit',
  working: 'Arbeitet',
  offline: 'Offline',
  error: 'Fehler',
  open: 'Offen',
  acknowledged: 'Bestätigt',
  resolved: 'Gelöst',
  dismissed: 'Verworfen',
  active: 'Aktiv',
  inactive: 'Inaktiv',
  success: 'Erfolgreich',
  failed: 'Fehlgeschlagen',
  running: 'Läuft',
  cancelled: 'Abgebrochen',
  completed: 'Abgeschlossen',
  healthy: 'Gesund',
  degraded: 'Eingeschränkt',
  online: 'Online',
};

interface StatusBadgeProps {
  status: AllStatuses;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function StatusBadge({ status, size = 'sm', dot = false }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-surface-700/50 text-surface-400';
  const label = statusLabels[status] || status;

  const sizeClasses = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium ${style} ${sizeClasses}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'error' || status === 'failed' || status === 'blocked' ? 'bg-danger-400' :
          status === 'active' || status === 'success' || status === 'done' || status === 'healthy' || status === 'online' || status === 'working' || status === 'running' ? 'bg-success-400' :
          status === 'waiting' || status === 'open' || status === 'degraded' || status === 'warning' ? 'bg-warning-400' :
          'bg-surface-400'
        }`} />
      )}
      {label}
    </span>
  );
}
