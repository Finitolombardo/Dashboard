import type { SignalType } from '../../types';
import { SIGNAL_TYPE_LABELS } from '../../types';
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
  blocker: 'bg-danger-500/15 text-danger-400',
  approval: 'bg-gold-500/10 text-gold-300',
  agent_question: 'bg-warning-500/15 text-warning-400',
  failed_execution: 'bg-danger-500/15 text-danger-400',
  stuck_session: 'bg-warning-500/15 text-warning-400',
  performance_drop: 'bg-warning-500/15 text-warning-400',
  campaign_underperformance: 'bg-warning-500/15 text-warning-400',
  system_warning: 'bg-warning-500/15 text-warning-400',
  proposed_quest: 'bg-gold-500/10 text-gold-300',
};

interface SignalTypeTagProps {
  type: SignalType;
}

export default function SignalTypeTag({ type }: SignalTypeTagProps) {
  const Icon = signalIcons[type];
  return (
    <span className={`inline-flex items-center gap-1 text-2xs font-medium px-1.5 py-0.5 rounded ${signalStyles[type]}`}>
      <Icon size={10} />
      {SIGNAL_TYPE_LABELS[type]}
    </span>
  );
}
