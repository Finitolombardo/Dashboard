import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow,
  Play,
  RotateCcw,
  ExternalLink,
  Crosshair,
  Bot,
  Activity,
  Server,
  AlertTriangle,
} from 'lucide-react';
import { mockWorkflows, mockExecutions, mockSessions, mockServices, getAgentById } from '../data/mock';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import PriorityTag from '../components/shared/PriorityTag';
import AgentChip from '../components/shared/AgentChip';
import TimeAgo from '../components/shared/TimeAgo';

const sectionTabs = [
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'executions', label: 'Ausfuehrungen', icon: Play },
  { id: 'sessions', label: 'Sitzungen', icon: Activity },
  { id: 'services', label: 'Dienste', icon: Server },
];

export default function Systems() {
  const [activeSection, setActiveSection] = useState('workflows');
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Systeme"
        subtitle="Workflows, Ausfuehrungen, Sitzungen & Dienste"
      />

      <div className="border-b border-surface-700/50 bg-surface-900/30 px-6">
        <div className="flex gap-0">
          {sectionTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeSection === tab.id
                  ? 'border-accent-500 text-surface-100'
                  : 'border-transparent text-surface-500 hover:text-surface-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeSection === 'workflows' && <WorkflowsSection navigate={navigate} />}
        {activeSection === 'executions' && <ExecutionsSection navigate={navigate} />}
        {activeSection === 'sessions' && <SessionsSection navigate={navigate} />}
        {activeSection === 'services' && <ServicesSection />}
      </div>
    </div>
  );
}

function WorkflowsSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-2">
      {mockWorkflows.map(workflow => {
        const agent = getAgentById(workflow.owner_agent_id);
        return (
          <div key={workflow.id} className="card p-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-surface-800 border border-surface-700/50 flex items-center justify-center flex-shrink-0">
                <Workflow size={16} className="text-surface-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-surface-100">{workflow.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={workflow.status} dot />
                  <StatusBadge status={workflow.execution_health as 'healthy'} />
                  {agent && <AgentChip agent={agent} />}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {workflow.last_run && (
                  <div className="text-2xs text-surface-500 mb-1">
                    Letzter Lauf: <TimeAgo date={workflow.last_run} />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <button className="btn-ghost text-2xs py-1 px-2"><ExternalLink size={10} /> Details</button>
                  {workflow.status === 'error' && (
                    <button className="btn-ghost text-2xs py-1 px-2"><RotateCcw size={10} /> Wiederholen</button>
                  )}
                  <button className="btn-ghost text-2xs py-1 px-2"><Crosshair size={10} /> Quest</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExecutionsSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const failedExecutions = mockExecutions.filter(e => e.status === 'failed');
  const successExecutions = mockExecutions.filter(e => e.status === 'success');

  return (
    <div className="space-y-6">
      {failedExecutions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-danger-400" />
            <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Fehlgeschlagen</h3>
            <span className="text-2xs bg-danger-500/20 text-danger-400 px-1.5 py-0.5 rounded font-medium">
              {failedExecutions.length}
            </span>
          </div>
          <div className="space-y-2">
            {failedExecutions.map(exec => {
              const workflow = mockWorkflows.find(w => w.id === exec.workflow_id);
              return (
                <div key={exec.id} className="card p-4 border-danger-500/20">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-surface-200">{workflow?.name || 'Unbekannt'}</h4>
                        <StatusBadge status={exec.status} />
                        <PriorityTag priority={exec.severity} />
                      </div>
                      <p className="text-2xs text-danger-300/80">{exec.failure_summary}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-2xs text-surface-500">
                        <span>Versuche: {exec.retry_count}</span>
                        <TimeAgo date={exec.started_at} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="btn-primary text-2xs py-1 px-2"><RotateCcw size={10} /> Wiederholen</button>
                      <button className="btn-ghost text-2xs py-1 px-2"><Crosshair size={10} /> Debug-Quest</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {successExecutions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Letzte Erfolgreiche</h3>
          <div className="space-y-2">
            {successExecutions.map(exec => {
              const workflow = mockWorkflows.find(w => w.id === exec.workflow_id);
              return (
                <div key={exec.id} className="card p-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={exec.status} dot />
                    <span className="text-sm text-surface-300">{workflow?.name || 'Unbekannt'}</span>
                    <TimeAgo date={exec.started_at} className="ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionsSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const activeSessions = mockSessions.filter(s => s.status === 'active');
  const errorSessions = mockSessions.filter(s => s.status === 'error');

  return (
    <div className="space-y-6">
      {errorSessions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-danger-400 uppercase tracking-wider mb-3">Fehlerhafte Sitzungen</h3>
          <div className="space-y-2">
            {errorSessions.map(session => {
              const agent = getAgentById(session.agent_id);
              return (
                <div key={session.id} className="card p-4 border-danger-500/20">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-surface-200">{session.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {agent && <AgentChip agent={agent} />}
                        <span className="text-2xs text-surface-500">{session.current_model}</span>
                        <StatusBadge status={session.health} dot />
                      </div>
                      {session.last_message && (
                        <p className="text-2xs text-surface-500 mt-1.5 italic">"{session.last_message}"</p>
                      )}
                    </div>
                    <button
                      className="btn-primary text-2xs py-1 px-2"
                      onClick={() => navigate(`/sessions/${session.id}`)}
                    >
                      <ExternalLink size={10} /> Oeffnen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Aktive Sitzungen</h3>
        <div className="space-y-2">
          {activeSessions.map(session => {
            const agent = getAgentById(session.agent_id);
            return (
              <button
                key={session.id}
                className="card p-4 w-full text-left hover:bg-surface-800 transition-colors"
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-surface-200">{session.name}</h4>
                      <StatusBadge status={session.health} dot />
                    </div>
                    <div className="flex items-center gap-3 text-2xs text-surface-500">
                      {agent && <span>{agent.name}</span>}
                      <span>{session.current_model}</span>
                      <span>{session.current_task}</span>
                    </div>
                    {session.last_message && (
                      <p className="text-2xs text-surface-500 mt-1 italic truncate">"{session.last_message}"</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <TimeAgo date={session.started_at} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ServicesSection() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {mockServices.map(service => (
        <div key={service.id} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-surface-500" />
              <h4 className="text-sm font-medium text-surface-200">{service.name}</h4>
            </div>
            <StatusBadge status={service.status} dot />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-2xs">
              <span className="text-surface-500">Antwortzeit</span>
              <span className={`font-mono ${
                service.response_time_ms > 500 ? 'text-warning-400' :
                service.response_time_ms > 1000 ? 'text-danger-400' :
                'text-surface-300'
              }`}>
                {service.response_time_ms}ms
              </span>
            </div>
            <div className="flex items-center justify-between text-2xs">
              <span className="text-surface-500">Letzte Pruefung</span>
              <TimeAgo date={service.last_check} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
