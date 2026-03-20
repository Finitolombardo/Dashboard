import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Bot, Cpu, Clock, ExternalLink, Crosshair, AlertTriangle } from 'lucide-react';
import { getSessionById, getAgentById, getQuestById } from '../data/mock';
import StatusBadge from '../components/shared/StatusBadge';
import AgentChip from '../components/shared/AgentChip';
import TimeAgo from '../components/shared/TimeAgo';

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const session = id ? getSessionById(id) : undefined;
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-surface-500">Sitzung nicht gefunden</p>
      </div>
    );
  }

  const agent = getAgentById(session.agent_id);
  const quest = session.linked_quest_id ? getQuestById(session.linked_quest_id) : null;
  const runtime = getRuntime(session.started_at);

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-surface-700/50 bg-surface-900/50">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/systems')}
            className="text-surface-500 hover:text-surface-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-surface-50">{session.name}</h1>
            <p className="text-2xs text-surface-500 mt-0.5">Sitzungs-ID: {session.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={session.status} size="md" dot />
            <StatusBadge status={session.health} size="md" />
            {quest && (
              <button
                className="btn-ghost text-xs"
                onClick={() => navigate(`/quests/${quest.id}`)}
              >
                <Crosshair size={14} />
                Zur Quest
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <InfoCard icon={Bot} label="Agent" value={agent?.name || 'Unbekannt'} sub={agent?.role} />
            <InfoCard icon={Cpu} label="Modell" value={session.current_model} />
            <InfoCard icon={Clock} label="Laufzeit" value={runtime} />
            <InfoCard icon={Activity} label="Aktuelle Aufgabe" value={session.current_task} />
          </div>

          {session.health === 'error' && (
            <div className="mb-6 bg-danger-500/10 border border-danger-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-danger-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-danger-300">Sitzung meldet Fehler</h3>
                <p className="text-xs text-danger-400/80 mt-1">
                  Die Sitzung antwortet nicht mehr. Moegliche Ursache: Modell-Timeout oder Verbindungsabbruch.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button className="btn-primary text-xs">Sitzung neu starten</button>
                  <button className="btn-ghost text-xs">
                    <Crosshair size={12} />
                    Debug-Quest erstellen
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Sitzungs-Protokoll</h3>
            <div className="space-y-2">
              <LogEntry
                time={session.started_at}
                type="system"
                content={`Sitzung gestartet | Modell: ${session.current_model}`}
              />
              <LogEntry
                time={session.started_at}
                type="system"
                content={`Aufgabe zugewiesen: ${session.current_task}`}
              />
              {quest && (
                <LogEntry
                  time={session.started_at}
                  type="system"
                  content={`Verknuepft mit Quest: ${quest.title}`}
                />
              )}
              {session.last_message && (
                <LogEntry
                  time={session.created_at}
                  type="agent"
                  content={session.last_message}
                />
              )}
              {session.health === 'error' && (
                <LogEntry
                  time={new Date().toISOString()}
                  type="error"
                  content="Sitzung antwortet nicht - Timeout nach 45 Minuten"
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-surface-700/50 bg-surface-900/30 overflow-y-auto flex-shrink-0 px-4 py-4">
          <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Kontext</h3>

          {agent && (
            <div className="mb-4 pb-4 border-b border-surface-700/30">
              <p className="text-2xs text-surface-500 mb-1">Agent</p>
              <AgentChip agent={agent} size="md" />
              <p className="text-2xs text-surface-500 mt-1">{agent.capabilities}</p>
            </div>
          )}

          {quest && (
            <div className="mb-4 pb-4 border-b border-surface-700/30">
              <p className="text-2xs text-surface-500 mb-1">Verknuepfte Quest</p>
              <button
                onClick={() => navigate(`/quests/${quest.id}`)}
                className="text-xs text-surface-200 hover:text-accent-300 transition-colors flex items-center gap-1"
              >
                {quest.title} <ExternalLink size={10} />
              </button>
              <StatusBadge status={quest.status} />
            </div>
          )}

          <div className="mb-4 pb-4 border-b border-surface-700/30">
            <p className="text-2xs text-surface-500 mb-1">Verknuepfte Dokumente</p>
            <div className="space-y-1">
              <button className="text-2xs text-surface-400 hover:text-accent-300 transition-colors block">Agent Onboarding Guide</button>
              <button className="text-2xs text-surface-400 hover:text-accent-300 transition-colors block">Workflow-Handbuch</button>
            </div>
          </div>

          <div>
            <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider mb-2">Schnellaktionen</p>
            <div className="space-y-1">
              <button className="flex items-center gap-2 w-full text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-800 px-2 py-1.5 rounded transition-colors">
                <Crosshair size={12} /> Quest erstellen
              </button>
              <button className="flex items-center gap-2 w-full text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-800 px-2 py-1.5 rounded transition-colors">
                <AlertTriangle size={12} /> Als blockiert markieren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-surface-500" />
        <span className="text-2xs text-surface-500">{label}</span>
      </div>
      <p className="text-sm font-medium text-surface-200">{value}</p>
      {sub && <p className="text-2xs text-surface-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function LogEntry({ time, type, content }: { time: string; type: 'system' | 'agent' | 'error'; content: string }) {
  const colors = {
    system: 'text-surface-500',
    agent: 'text-surface-300',
    error: 'text-danger-400',
  };
  const dotColors = {
    system: 'bg-surface-600',
    agent: 'bg-accent-500',
    error: 'bg-danger-500',
  };

  return (
    <div className="flex gap-3 px-3 py-2 bg-surface-900/50 rounded font-mono">
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColors[type]}`} />
      <TimeAgo date={time} className="flex-shrink-0 w-12 text-surface-600" />
      <span className={`text-xs ${colors[type]}`}>{content}</span>
    </div>
  );
}

function getRuntime(startedAt: string): string {
  const now = new Date();
  const start = new Date(startedAt);
  const diffMs = now.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
