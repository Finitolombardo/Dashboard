import { useNavigate } from 'react-router-dom';
import { Bot, ExternalLink, Crosshair, AlertCircle } from 'lucide-react';
import { useAgents } from '../lib/useAgents';
import { useQuests } from '../lib/useQuests';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import TimeAgo from '../components/shared/TimeAgo';

export default function Agents() {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading, error } = useAgents();
  const { quests } = useQuests();

  const activeAgents = agents.filter(a => a.status !== 'offline');
  const offlineAgents = agents.filter(a => a.status === 'offline');

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      <PageHeader
        title="Agenten"
        subtitle={
          agentsLoading
            ? 'Laedt...'
            : error
            ? 'Verbindung zum Backend fehlgeschlagen'
            : agents.length + ' Agenten | ' + activeAgents.length + ' aktiv'
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {agentsLoading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-surface-500">Agenten werden geladen...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle size={32} className="text-surface-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-400">Backend nicht erreichbar</p>
            <p className="text-2xs text-surface-600">{error}</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Bot size={32} className="text-surface-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-400">Keine Agenten gefunden</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {activeAgents.map(agent => {
                const agentQuests = quests.filter(q => q.agent_id === agent.id);
                const activeQuests = agentQuests.filter(
                  q => !['done', 'archived'].includes(q.status)
                );
                return (
                  <div key={agent.id} className="card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-surface-900/70 border border-white/[0.06] flex items-center justify-center">
                          <Bot size={18} className="text-surface-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-surface-100">{agent.name}</h3>
                          <p className="text-2xs text-surface-500">{agent.role}</p>
                        </div>
                      </div>
                      <StatusBadge status={agent.status} dot />
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-2xs">
                        <span className="text-surface-500">Modell</span>
                        <span className="text-surface-300 font-mono truncate ml-4 text-right max-w-[140px]">
                          {agent.current_model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-2xs">
                        <span className="text-surface-500">Quests</span>
                        <span className="text-surface-300">
                          {activeQuests.length} aktiv / {agentQuests.length} gesamt
                        </span>
                      </div>
                    </div>

                    {activeQuests.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.04] mb-3">
                        <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider mb-1.5">
                          Aktive Quests
                        </p>
                        {activeQuests.slice(0, 2).map(quest => (
                          <button
                            key={quest.id}
                            onClick={() => navigate('/quests/' + quest.id)}
                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-surface-800 rounded transition-colors mb-1"
                          >
                            <Crosshair size={10} className="text-gold-400 flex-shrink-0" />
                            <p className="text-2xs text-surface-300 truncate flex-1">{quest.title}</p>
                            <StatusBadge status={quest.status} />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                      <a
                        href="https://agent.getvoidra.com/chat?session=agent%3Amain%3Amain"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-2xs flex-1"
                      >
                        <ExternalLink size={10} />
                        Chat
                      </a>
                      <button className="btn-ghost text-2xs flex-1">
                        <Crosshair size={10} />
                        Quest
                      </button>
                    </div>

                    <div className="mt-2 text-right">
                      <TimeAgo date={agent.updated_at} />
                    </div>
                  </div>
                );
              })}
            </div>

            {offlineAgents.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">
                  Nicht erreichbar
                </p>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {offlineAgents.map(agent => (
                    <div key={agent.id} className="card p-3 opacity-60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                          <Bot size={14} className="text-surface-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-surface-400">{agent.name}</h3>
                          <p className="text-2xs text-surface-600">{agent.role}</p>
                        </div>
                        <StatusBadge status={agent.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
