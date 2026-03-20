import type { QuestStatus, AgentStatus, SignalStatus, WorkflowStatus, ExecutionStatus, SessionStatus, SessionHealth, ServiceStatus, CampaignStatus } from '../../types';

type AllStatuses = QuestStatus | AgentStatus | SignalStatus | WorkflowStatus | ExecutionStatus | SessionStatus | SessionHealth | ServiceStatus | CampaignStatus;

const statusStyles: Record<string, string> = {
  draft: 'border-white/5 bg-surface-900/80 text-surface-400',
  ready: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  in_progress: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  waiting: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  blocked: 'border-danger-500/20 bg-danger-500/10 text-danger-300',
  in_review: 'border-gold-500/20 bg-gold-500/10 text-gold-100',
  done: 'border-success-500/20 bg-success-500/10 text-success-300',
  paused: 'border-white/5 bg-surface-800/80 text-surface-400',
  archived: 'border-white/5 bg-surface-800/60 text-surface-500',

  idle: 'border-white/5 bg-surface-900/80 text-surface-400',
  working: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  offline: 'border-white/5 bg-surface-800/60 text-surface-500',
  error: 'border-danger-500/20 bg-danger-500/10 text-danger-300',

  open: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  acknowledged: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  resolved: 'border-success-500/20 bg-success-500/10 text-success-300',
  dismissed: 'border-white/5 bg-surface-800/60 text-surface-500',

  active: 'border-success-500/20 bg-success-500/10 text-success-300',
  inactive: 'border-white/5 bg-surface-800/60 text-surface-500',

  success: 'border-success-500/20 bg-success-500/10 text-success-300',
  failed: 'border-danger-500/20 bg-danger-500/10 text-danger-300',
  running: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  cancelled: 'border-white/5 bg-surface-800/60 text-surface-500',

  completed: 'border-success-500/20 bg-success-500/10 text-success-300',

  healthy: 'border-success-500/20 bg-success-500/10 text-success-300',
  degraded: 'border-warning-500/20 bg-warning-500/10 text-warning-300',

  online: 'border-success-500/20 bg-success-500/10 text-success-300',
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
  healthy: 'Stabil',
  degraded: 'Eingeschränkt',
  online: 'Online',
};

interface StatusBadgeProps {
  status: AllStatuses;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function StatusBadge({ status, size = 'sm', dot = false }: StatusBadgeProps) {
  const style = statusStyles[status] || 'border-white/5 bg-surface-900/70 text-surface-400';
  const label = statusLabels[status] || status;

  const sizeClasses = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium tracking-wide ${style} ${sizeClasses}`}>
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.08)] ${
            status === 'error' || status === 'failed' || status === 'blocked'
              ? 'bg-danger-400'
              : status === 'active' || status === 'success' || status === 'done' || status === 'healthy' || status === 'online' || status === 'working' || status === 'running'
                ? 'bg-success-400'
                : status === 'waiting' || status === 'open' || status === 'degraded'
                  ? 'bg-warning-400'
                  : 'bg-surface-400'
          }`}
        />
      )}
      {label}
    </span>
  );
}
