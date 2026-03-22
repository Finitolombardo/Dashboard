import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Crosshair,
  MessageSquare,
} from 'lucide-react';
import { useQuests } from '../lib/useQuests';
import { useSignals } from '../lib/useSignals';
import type { Signal } from '../types';
import PageHeader from '../components/shared/PageHeader';
import SignalTypeTag from '../components/shared/SignalTypeTag';
import PriorityTag from '../components/shared/PriorityTag';
import TimeAgo from '../components/shared/TimeAgo';

export default function Inbox() {
  const navigate = useNavigate();
  const { quests, loading, error } = useQuests();
  const allSignals = useSignals(quests);
  const openSignals = allSignals.filter(s => s.status === 'open');

  const urgent = openSignals.filter(s => s.severity === 'critical' || s.type === 'blocker' || s.type === 'failed_execution');
  const needsDecision = openSignals.filter(s =>
    !urgent.includes(s) && ['approval', 'agent_question', 'proposed_quest'].includes(s.type)
  );
  const other = openSignals.filter(s => !urgent.includes(s) && !needsDecision.includes(s));

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Eingang"
        subtitle={loading ? 'Lade…' : error ? 'Fehler beim Laden' : `${openSignals.length} Elemente erfordern Aufmerksamkeit`}
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

        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-surface-500">Lade Eingang…</p>
          </div>
        )}
        {!loading && error && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-danger-400">Fehler: {error}</p>
          </div>
        )}
        {!loading && !error && openSignals.length === 0 && (
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

function InboxItem({ signal, navigate }: { signal: Signal; navigate: ReturnType<typeof useNavigate> }) {
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
            {signal.linked_quest_id && (
              <button
                onClick={() => navigate(`/quests/${signal.linked_quest_id}`)}
                className="text-gold-400 hover:text-gold-300 transition-colors"
              >
                Quest öffnen
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
              onClick={() => signal.linked_quest_id && navigate(`/quests/${signal.linked_quest_id}`)}
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
              onClick={() => signal.linked_quest_id && navigate(`/quests/${signal.linked_quest_id}`)}
            >
              <ArrowRight size={12} /> Zur Quest
            </button>
          )}
          {signal.type === 'stuck_session' && (
            <button
              className="btn-primary text-2xs py-1 px-2"
              onClick={() => signal.linked_quest_id && navigate(`/quests/${signal.linked_quest_id}`)}
            >
              <ArrowRight size={12} /> Zur Quest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
