import { useNavigate } from 'react-router-dom';
import { Bot, ExternalLink, Crosshair, Activity, Cpu } from 'lucide-react';
import { mockAgents, getSessionsForAgent, getQuestsForAgent } from '../data/mock';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import TimeAgo from '../components/shared/TimeAgo';

export default function Agents() {
  const navigate = useNavigate();

  const activeAgents = mockAgents.filter(a => a.status !== 'offline');
  const offlineAgents = mockAgents.filter(a => a.status === 'offline');

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Agenten"
        subtitle={`${mockAgents.length} Agenten | ${activeAgents.length} aktiv`}
      />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {activeAgents.map(agent => {
            const sessions = getSessionsForAgent(agent.id);
            const quests = getQuestsForAgent(agent.id);
            const activeSessions = sessions.filter(s => s.status === 'active');
            const activeQuests = quests.filter(q => !['done', 'archived'].includes(q.status));

            return (
              <div key={agent.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-surface-800 border border-surface-700/50 flex items-center justify-center">
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
                    <span className="text-surface-300 font-mono">{agent.current_model}</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-surface-500">Auslastung</span>
                    <span className="text-surface-300">{agent.workload} Quest{agent.workload !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-surface-500">Faehigkeiten</span>
                    <span className="text-surface-400 truncate ml-4 text-right">{agent.capabilities.split(',')[0]}</span>
                  </div>
                </div>

                {activeSessions.length > 0 && (
                  <div className="pt-2 border-t border-surface-700/30 mb-3">
                    <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider mb-1.5">Aktive Sitzungen</p>
                    {activeSessions.slice(0, 2).map(session => (
                      <button
                        key={session.id}
                        onClick={() => navigate(`/sessions/${session.id}`)}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-surface-800 rounded transition-colors mb-1"
                      >
                        <Activity size={10} className="text-success-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-2xs text-surface-300 truncate">{session.current_task}</p>
                          <p className="text-2xs text-surface-600 truncate">{session.current_model}</p>
                        </div>
                        <StatusBadge status={session.health} />
                      </button>
                    ))}
                  </div>
                )}

                {activeQuests.length > 0 && (
                  <div className="pt-2 border-t border-surface-700/30 mb-3">
                    <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider mb-1.5">Aktive Quests</p>
                    {activeQuests.slice(0, 2).map(quest => (
                      <button
                        key={quest.id}
                        onClick={() => navigate(`/quests/${quest.id}`)}
                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-surface-800 rounded transition-colors mb-1"
                      >
                        <Crosshair size={10} className="text-accent-400 flex-shrink-0" />
                        <p className="text-2xs text-surface-300 truncate flex-1">{quest.title}</p>
                        <StatusBadge status={quest.status} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-surface-700/30">
                  <button
                    className="btn-ghost text-2xs flex-1"
                    onClick={() => activeSessions[0] && navigate(`/sessions/${activeSessions[0].id}`)}
                  >
                    <ExternalLink size={10} />
                    Sitzung oeffnen
                  </button>
                  <button className="btn-ghost text-2xs flex-1">
                    <Crosshair size={10} />
                    Quest zuweisen
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
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Offline</p>
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
      </div>
    </div>
  );
}
