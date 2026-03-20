import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Crosshair,
  MessageSquare,
} from 'lucide-react';
import { mockSignals, getQuestById } from '../data/mock';
import PageHeader from '../components/shared/PageHeader';
import SignalTypeTag from '../components/shared/SignalTypeTag';
import PriorityTag from '../components/shared/PriorityTag';
import TimeAgo from '../components/shared/TimeAgo';

export default function Inbox() {
  const navigate = useNavigate();
  const openSignals = mockSignals.filter(s => s.status === 'open');

  const urgent = openSignals.filter(s => s.severity === 'critical' || s.type === 'blocker' || s.type === 'failed_execution');
  const needsDecision = openSignals.filter(s =>
    !urgent.includes(s) && ['approval', 'agent_question', 'proposed_quest'].includes(s.type)
  );
  const other = openSignals.filter(s => !urgent.includes(s) && !needsDecision.includes(s));

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Eingang"
        subtitle={`${openSignals.length} Elemente erfordern Aufmerksamkeit`}
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {urgent.length > 0 && (
          <InboxSection title="Dringend" count={urgent.length} variant="danger">
            {urgent.map(signal => (
              <InboxItem key={signal.id} signal={signal} navigate={navigate} />
            ))}
          </InboxSection>
        )}

        {needsDecision.length > 0 && (
          <InboxSection title="Entscheidung nötig" count={needsDecision.length} variant="warning">
            {needsDecision.map(signal => (
              <InboxItem key={signal.id} signal={signal} navigate={navigate} />
            ))}
          </InboxSection>
        )}

        {other.length > 0 && (
          <InboxSection title="Sonstige" count={other.length} variant="default">
            {other.map(signal => (
              <InboxItem key={signal.id} signal={signal} navigate={navigate} />
            ))}
          </InboxSection>
        )}

        {openSignals.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <CheckCircle2 size={32} className="text-success-500/50 mx-auto mb-3" />
              <p className="text-sm text-surface-400">Alles erledigt</p>
              <p className="text-2xs text-surface-600 mt-1">Keine offenen Signale</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InboxSection({ title, count, variant, children }: {
  title: string;
  count: number;
  variant: 'danger' | 'warning' | 'default';
  children: React.ReactNode;
}) {
  const badgeColors = {
    danger: 'bg-danger-500/20 text-danger-400',
    warning: 'bg-warning-500/20 text-warning-400',
    default: 'bg-surface-700 text-surface-400',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">{title}</h2>
        <span className={`text-2xs px-1.5 py-0.5 rounded font-medium ${badgeColors[variant]}`}>{count}</span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function InboxItem({ signal, navigate }: { signal: (typeof mockSignals)[0]; navigate: ReturnType<typeof useNavigate> }) {
  const quest = signal.linked_quest_id ? getQuestById(signal.linked_quest_id) : null;

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <SignalTypeTag type={signal.type} />
            <PriorityTag priority={signal.severity} />
          </div>
          <h3 className="text-sm font-medium text-surface-100 mb-1">{signal.title}</h3>
          <p className="text-2xs text-surface-500 line-clamp-2">{signal.summary}</p>
          <div className="flex items-center gap-3 mt-2 text-2xs text-surface-600">
            <span>{signal.source}</span>
            {quest && (
              <button
                onClick={() => navigate(`/quests/${quest.id}`)}
                className="text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-0.5"
              >
                {quest.title}
              </button>
            )}
            <TimeAgo date={signal.created_at} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {signal.type === 'approval' && (
            <>
              <button className="btn-primary text-2xs py-1 px-2"><CheckCircle2 size={12} /> Freigeben</button>
              <button className="btn-ghost text-2xs py-1 px-2"><XCircle size={12} /></button>
            </>
          )}
          {signal.type === 'agent_question' && (
            <button
              className="btn-primary text-2xs py-1 px-2"
              onClick={() => quest && navigate(`/quests/${quest.id}`)}
            >
              <MessageSquare size={12} /> Antworten
            </button>
          )}
          {signal.type === 'failed_execution' && (
            <>
              <button className="btn-primary text-2xs py-1 px-2"><RotateCcw size={12} /> Wiederholen</button>
              <button className="btn-ghost text-2xs py-1 px-2"><Crosshair size={12} /> Quest</button>
            </>
          )}
          {signal.type === 'blocker' && (
            <button
              className="btn-primary text-2xs py-1 px-2"
              onClick={() => quest && navigate(`/quests/${quest.id}`)}
            >
              <ArrowRight size={12} /> Zur Quest
            </button>
          )}
          {signal.type === 'proposed_quest' && (
            <button className="btn-primary text-2xs py-1 px-2"><Crosshair size={12} /> Quest erstellen</button>
          )}
          {signal.type === 'campaign_underperformance' && (
            <button className="btn-primary text-2xs py-1 px-2" onClick={() => navigate('/campaigns')}>
              <Crosshair size={12} /> Optimieren
            </button>
          )}
          {signal.type === 'stuck_session' && (
            <button className="btn-primary text-2xs py-1 px-2">
              <ArrowRight size={12} /> Sitzung öffnen
            </button>
          )}
          {signal.type === 'system_warning' && (
            <button className="btn-secondary text-2xs py-1 px-2" onClick={() => navigate('/systems')}>
              <ArrowRight size={12} /> Systeme
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
