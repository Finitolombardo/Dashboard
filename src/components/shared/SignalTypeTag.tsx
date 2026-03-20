import type { SignalType } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Clock,
  TrendingDown,
  BarChart3,
  AlertOctagon,
  Lightbulb,
} from 'lucide-react';

const signalIcons: Record<SignalType, React.ElementType> = {
  blocker: AlertOctagon,
  approval: CheckCircle2,
  agent_question: HelpCircle,
  failed_execution: XCircle,
  stuck_session: Clock,
  performance_drop: TrendingDown,
  campaign_underperformance: BarChart3,
  system_warning: AlertTriangle,
  proposed_quest: Lightbulb,
};

const signalStyles: Record<SignalType, string> = {
  blocker: 'border-danger-500/20 bg-danger-500/10 text-danger-300',
  approval: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  agent_question: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  failed_execution: 'border-danger-500/20 bg-danger-500/10 text-danger-300',
  stuck_session: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  performance_drop: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  campaign_underperformance: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  system_warning: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  proposed_quest: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
};

const signalLabels: Record<SignalType, string> = {
  blocker: 'Blocker',
  approval: 'Freigabe',
  agent_question: 'Agenten-Frage',
  failed_execution: 'Fehlgeschlagen',
  stuck_session: 'Sitzung hängt',
  performance_drop: 'Leistungsabfall',
  campaign_underperformance: 'Kampagne schwach',
  system_warning: 'Systemwarnung',
  proposed_quest: 'Quest-Vorschlag',
};

interface SignalTypeTagProps {
  type: SignalType;
}

export default function SignalTypeTag({ type }: SignalTypeTagProps) {
  const Icon = signalIcons[type];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-2xs font-medium tracking-wide ${signalStyles[type]}`}>
      <Icon size={10} />
      {signalLabels[type]}
    </span>
  );
}
