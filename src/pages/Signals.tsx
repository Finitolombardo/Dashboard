import { useNavigate } from 'react-router-dom';
import { mockSignals } from '../data/mock';
import PageHeader from '../components/shared/PageHeader';
import SignalTypeTag from '../components/shared/SignalTypeTag';
import PriorityTag from '../components/shared/PriorityTag';
import StatusBadge from '../components/shared/StatusBadge';
import TimeAgo from '../components/shared/TimeAgo';
import { Crosshair, ArrowRight } from 'lucide-react';

export default function Signals() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Signale"
        subtitle={`${mockSignals.length} Signale | ${mockSignals.filter(s => s.status === 'open').length} offen`}
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {mockSignals.map(signal => (
          <div key={signal.id} className="card p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <SignalTypeTag type={signal.type} />
                  <PriorityTag priority={signal.severity} />
                  <StatusBadge status={signal.status} />
                </div>
                <h3 className="text-sm font-medium text-surface-100 mb-1">{signal.title}</h3>
                <p className="text-2xs text-surface-500">{signal.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-2xs text-surface-600">
                  <span>Quelle: {signal.source}</span>
                  <TimeAgo date={signal.created_at} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {signal.type === 'proposed_quest' && (
                  <button className="btn-primary text-2xs py-1 px-2">
                    <Crosshair size={10} /> Quest erstellen
                  </button>
                )}
                {signal.linked_quest_id && (
                  <button
                    className="btn-ghost text-2xs py-1 px-2"
                    onClick={() => navigate(`/quests/${signal.linked_quest_id}`)}
                  >
                    <ArrowRight size={10} /> Zur Quest
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
