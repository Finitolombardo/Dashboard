import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Brain,
  Bot,
  CircuitBoard,
  ExternalLink,
  FileText,
  Layers3,
  Link2,
  Crosshair,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAgents } from '../lib/useAgents';
import { useQuests } from '../lib/useQuests';
import { fetchPlaybooksFromBackend, type PlaybookRecord } from '../lib/missionControlApi';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import TimeAgo from '../components/shared/TimeAgo';
import type { Agent } from '../types';

type RegistryTab = 'preferences' | 'memory' | 'playbooks' | 'capabilities';

type SourceRow = {
  label: string;
  sourceId: string;
  sourcePath: string;
  scope: string;
  visibility: string;
  lastUsedAt?: string;
  lastChangedAt?: string;
  note?: string;
};

const tabs: Array<{ id: RegistryTab; label: string; icon: LucideIcon }> = [
  { id: 'preferences', label: 'Preferences', icon: FileText },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'playbooks', label: 'Playbooks', icon: Layers3 },
  { id: 'capabilities', label: 'Capabilities', icon: CircuitBoard },
];

function getString(value: unknown, fallback = 'nicht verfuegbar'): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function formatDateTime(value?: string): string {
  if (!value) return 'nicht verfuegbar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'nicht verfuegbar';
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SourceList({ rows, emptyLabel }: { rows: SourceRow[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="text-2xs text-surface-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map(row => (
        <div key={`${row.sourceId}-${row.sourcePath}`} className="rounded-xl border border-white/[0.05] bg-surface-900/60 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-100 truncate">{row.label}</p>
              <p className="text-2xs text-surface-500 mt-0.5 font-mono break-all">{row.sourcePath}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-2xs">
              <span className="rounded-full border border-white/[0.06] bg-surface-950 px-2 py-0.5 text-surface-300">
                {row.scope}
              </span>
              <span className="rounded-full border border-white/[0.06] bg-surface-950 px-2 py-0.5 text-surface-300">
                {row.visibility}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-surface-950/60 px-2.5 py-2">
              <p className="text-2xs uppercase tracking-wider text-surface-500">Source</p>
              <p className="mt-1 text-2xs text-surface-200 break-all">{row.sourceId}</p>
            </div>
            <div className="rounded-lg bg-surface-950/60 px-2.5 py-2">
              <p className="text-2xs uppercase tracking-wider text-surface-500">Zeit</p>
              <p className="mt-1 text-2xs text-surface-200">
                Last used: {row.lastUsedAt ? formatDateTime(row.lastUsedAt) : 'nicht verfuegbar'}
                <br />
                Last changed: {row.lastChangedAt ? formatDateTime(row.lastChangedAt) : 'nicht verfuegbar'}
              </p>
            </div>
          </div>

          {row.note && <p className="mt-2 text-2xs text-surface-500">{row.note}</p>}
        </div>
      ))}
    </div>
  );
}

function buildCanonicalRows(agent: Agent): SourceRow[] {
  const items = [...(agent.core_state ?? []), ...(agent.core_files ?? [])];
  const rows: SourceRow[] = [];
  const seen = new Set<string>();

  for (const raw of items) {
    const obj = raw as Record<string, unknown>;
    const label = getString(obj.title ?? obj.name ?? obj.fileType ?? obj.summary, 'Canonical File');
    const sourcePath = getString(obj.path ?? obj.workspacePath, 'nicht verfuegbar');
    const sourceId = getString(obj.fileType ?? obj.title ?? obj.name ?? sourcePath, sourcePath);
    const key = `${sourceId}|${sourcePath}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      label,
      sourceId,
      sourcePath,
      scope: 'workspace',
      visibility: getString(obj.status ?? (obj.exists === false ? 'missing' : 'loaded')),
      lastUsedAt: getString(obj.lastSyncedAt, ''),
      lastChangedAt: getString(obj.lastFileChangeAt ?? obj.modifiedAt, ''),
      note: getString(obj.mirrorStatus ?? obj.sourceOfTruth ?? obj.notes, ''),
    });
  }

  return rows;
}

function buildMemoryRows(agent: Agent): SourceRow[] {
  const coreRows = buildCanonicalRows(agent);
  const memoryRows = coreRows.filter(row => /memory/i.test(row.sourceId) || /memory/i.test(row.label));
  const contextHealth = (agent.context_health ?? {}) as Record<string, unknown>;
  const memoryNotes = [
    getString(contextHealth.summary, ''),
    getString(contextHealth.heartbeatSummary, ''),
    getString(contextHealth.heartbeatSignal, ''),
  ].filter(Boolean);

  if (memoryRows.length > 0) {
    return memoryRows.map(row => ({
      ...row,
      scope: 'memory',
      visibility: row.visibility || 'loaded',
      lastUsedAt: row.lastUsedAt || getString(contextHealth.lastMemoryAt, ''),
      lastChangedAt: row.lastChangedAt || row.lastUsedAt || getString(contextHealth.lastHeartbeatAt, ''),
      note: memoryNotes[0] || row.note,
    }));
  }

  return [
    {
      label: 'Memory',
      sourceId: 'memory:workspace',
      sourcePath: getString(agent.workspace_path ? `${agent.workspace_path}/MEMORY.md` : '', 'nicht verfuegbar'),
      scope: 'memory',
      visibility: 'not available',
      lastUsedAt: getString(contextHealth.lastMemoryAt, ''),
      lastChangedAt: getString(contextHealth.lastHeartbeatAt, ''),
      note: memoryNotes[0] || 'Keine Memory-Quelle im geladenen Workspace erfasst.',
    },
  ];
}

function buildCapabilityRows(agent: Agent): SourceRow[] {
  const rows: SourceRow[] = [];
  const integrations = agent.capabilities
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  for (const integration of integrations) {
    rows.push({
      label: integration,
      sourceId: `integration:${integration.toLowerCase()}`,
      sourcePath: 'runtime integrations',
      scope: 'runtime',
      visibility: 'available',
      note: 'Runtime-Integration aus dem Live-Dashboard',
    });
  }

  for (const runtime of agent.runtime_details ?? []) {
    const obj = runtime as Record<string, unknown>;
    const label = getString(obj.sourceLabel ?? obj.runtimeLabel ?? obj.stateDir ?? 'Runtime');
    rows.push({
      label,
      sourceId: `runtime:${label.toLowerCase().replace(/\s+/g, '_')}`,
      sourcePath: getString(obj.runtimeUrl ?? obj.stateDir ?? obj.workspacePath, 'nicht verfuegbar'),
      scope: 'runtime',
      visibility: obj.runtimeReachable === false ? 'unavailable' : 'available',
      note: getString(obj.stateDir ?? obj.workspacePath, ''),
    });
  }

  rows.push({
    label: 'gws',
    sourceId: 'capability:gws',
    sourcePath: 'lokal-only',
    scope: 'server',
    visibility: 'not available',
    note: 'Lokal vorhanden, serverseitig noch nicht gespiegelt.',
  });

  return rows;
}

function buildPlaybookRows(playbooks: PlaybookRecord[]): SourceRow[] {
  return playbooks.map(playbook => ({
    label: playbook.title,
    sourceId: playbook.sourceId ?? playbook.canonicalKey ?? playbook.id,
    sourcePath: playbook.sourcePath ?? playbook.sourceRef ?? playbook.sourceLabel ?? 'nicht verfuegbar',
    scope: playbook.sourceKind ?? 'registry',
    visibility: playbook.visibility ?? 'nicht verfuegbar',
    lastUsedAt: playbook.lastUsedAt,
    lastChangedAt: playbook.lastChangedAt ?? playbook.updatedAt ?? playbook.createdAt,
    note: playbook.summary ?? playbook.qualityNote ?? (playbook.isMirror ? 'Mirror' : undefined),
  }));
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-2xs font-medium transition-colors ${
        active
          ? 'border-gold-400/30 bg-gold-400/10 text-gold-300'
          : 'border-white/[0.06] bg-surface-900/60 text-surface-500 hover:text-surface-300'
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  );
}

export default function Agents() {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading, error } = useAgents();
  const { quests } = useQuests();
  const [playbooks, setPlaybooks] = useState<PlaybookRecord[]>([]);
  const [playbooksLoading, setPlaybooksLoading] = useState(true);
  const [playbooksError, setPlaybooksError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RegistryTab>('preferences');

  useEffect(() => {
    let cancelled = false;

    async function loadPlaybooks() {
      setPlaybooksLoading(true);
      setPlaybooksError(null);
      try {
        const data = await fetchPlaybooksFromBackend();
        if (!cancelled) setPlaybooks(data);
      } catch (err) {
        if (!cancelled) {
          setPlaybooks([]);
          setPlaybooksError('Playbooks konnten nicht geladen werden.');
        }
      } finally {
        if (!cancelled) setPlaybooksLoading(false);
      }
    }

    loadPlaybooks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      const preferred = agents.find(agent => agent.status !== 'offline') ?? agents[0];
      setSelectedAgentId(preferred.id);
    }
  }, [agents, selectedAgentId]);

  const activeAgents = agents.filter(a => a.status !== 'offline');
  const offlineAgents = agents.filter(a => a.status === 'offline');
  const selectedAgent = useMemo(() => {
    if (!agents.length) return null;
    return agents.find(agent => agent.id === selectedAgentId) ?? agents[0];
  }, [agents, selectedAgentId]);

  const selectedAgentQuests = selectedAgent
    ? quests.filter(q => q.agent_id === selectedAgent.id)
    : [];
  const selectedActiveQuests = selectedAgentQuests.filter(q => !['done', 'archived'].includes(q.status));

  const canonicalRows = selectedAgent ? buildCanonicalRows(selectedAgent) : [];
  const memoryRows = selectedAgent ? buildMemoryRows(selectedAgent) : [];
  const capabilityRows = selectedAgent ? buildCapabilityRows(selectedAgent) : [];
  const playbookRows = buildPlaybookRows(playbooks);

  return (
    <div className="min-h-screen bg-surface-950">
      <PageHeader
        title="Agenten"
        subtitle={
          agentsLoading
            ? 'Laedt...'
            : error
            ? 'Verbindung zum Backend fehlgeschlagen'
            : `${agents.length} Agenten | ${activeAgents.length} aktiv | ${playbooks.length} Playbooks`
        }
      />

      <div className="space-y-6 px-6 py-4">
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
            {selectedAgent && (
              <section className="card p-4 lg:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-surface-900/80 border border-white/[0.06] flex items-center justify-center">
                      <Bot size={20} className="text-surface-300" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-surface-100">{selectedAgent.name}</h2>
                      <p className="text-xs text-surface-500">{selectedAgent.role}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={selectedAgent.status} dot />
                        <span className="rounded-full border border-white/[0.06] bg-surface-900/60 px-2 py-0.5 text-2xs text-surface-400">
                          {getString(selectedAgent.runtime_status)}
                        </span>
                        <span className="rounded-full border border-white/[0.06] bg-surface-900/60 px-2 py-0.5 text-2xs text-surface-400">
                          {getString(selectedAgent.infrastructure_status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-2xs sm:grid-cols-4">
                    <div className="rounded-xl border border-white/[0.05] bg-surface-900/50 px-3 py-2">
                      <p className="text-surface-500 uppercase tracking-wider">Modell</p>
                      <p className="mt-1 font-mono text-surface-200">{selectedAgent.current_model}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-surface-900/50 px-3 py-2">
                      <p className="text-surface-500 uppercase tracking-wider">Last seen</p>
                      <p className="mt-1 text-surface-200">{formatDateTime(selectedAgent.last_seen)}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-surface-900/50 px-3 py-2">
                      <p className="text-surface-500 uppercase tracking-wider">Workspace</p>
                      <p className="mt-1 text-surface-200 break-all">{getString(selectedAgent.workspace_path)}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.05] bg-surface-900/50 px-3 py-2">
                      <p className="text-surface-500 uppercase tracking-wider">Quests</p>
                      <p className="mt-1 text-surface-200">{selectedActiveQuests.length} aktiv / {selectedAgentQuests.length} gesamt</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tabs.map(tab => (
                    <TabButton
                      key={tab.id}
                      active={activeTab === tab.id}
                      icon={tab.icon}
                      label={tab.label}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <div className="space-y-4">
                    {activeTab === 'preferences' && (
                      <div className="space-y-3">
                        <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider">
                          Canonical Files
                        </p>
                        <SourceList
                          rows={canonicalRows}
                          emptyLabel="Keine geladenen Canonical Files sichtbar."
                        />
                      </div>
                    )}

                    {activeTab === 'memory' && (
                      <div className="space-y-3">
                        <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider">
                          Memory
                        </p>
                        <SourceList
                          rows={memoryRows}
                          emptyLabel="Keine Memory-Quelle sichtbar."
                        />
                      <div className="rounded-xl border border-white/[0.05] bg-surface-900/60 p-3 text-2xs text-surface-400">
                          <p className="font-medium text-surface-200">Memory Health</p>
                          {(() => {
                            const contextHealth = (selectedAgent.context_health ?? {}) as Record<string, unknown>;
                            return (
                              <>
                                <p className="mt-1 text-surface-500">
                                  Letzte Memory-Aktivitaet: {formatDateTime(getString(contextHealth.lastMemoryAt, ''))}
                                </p>
                                <p className="text-surface-500">
                                  Heartbeat: {formatDateTime(getString(contextHealth.lastHeartbeatAt, ''))}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {activeTab === 'playbooks' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider">
                            Playbooks
                          </p>
                          {playbooksLoading && <span className="text-2xs text-surface-500">Lädt...</span>}
                        </div>
                        {playbooksError ? (
                          <div className="rounded-xl border border-danger-500/20 bg-danger-500/5 px-3 py-2 text-2xs text-danger-300">
                            {playbooksError}
                          </div>
                        ) : (
                          <SourceList
                            rows={playbookRows}
                            emptyLabel="Noch keine Playbooks vom Backend geliefert."
                          />
                        )}
                      </div>
                    )}

                    {activeTab === 'capabilities' && (
                      <div className="space-y-3">
                        <p className="text-2xs font-medium text-surface-500 uppercase tracking-wider">
                          Capabilities
                        </p>
                        <SourceList
                          rows={capabilityRows}
                          emptyLabel="Keine Capabilities sichtbar."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Aktive Agenten
                  </p>
                  <p className="text-2xs text-surface-600">{activeAgents.length}</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {activeAgents.map(agent => {
                    const agentQuests = quests.filter(q => q.agent_id === agent.id);
                    const activeQuests = agentQuests.filter(q => !['done', 'archived'].includes(q.status));
                    const isSelected = agent.id === selectedAgent?.id;
                    return (
                      <div
                        key={agent.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setActiveTab('preferences');
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedAgentId(agent.id);
                            setActiveTab('preferences');
                          }
                        }}
                        className={`card p-4 text-left transition-colors hover:border-gold-500/25 ${
                          isSelected ? 'ring-1 ring-gold-400/35 border-gold-400/25' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-surface-900/70 border border-white/[0.06] flex items-center justify-center">
                              <Bot size={18} className="text-surface-400" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-surface-100 truncate">{agent.name}</h3>
                              <p className="text-2xs text-surface-500 truncate">{agent.role}</p>
                            </div>
                          </div>
                          <StatusBadge status={agent.status} dot />
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-2xs gap-4">
                            <span className="text-surface-500">Modell</span>
                            <span className="text-surface-300 font-mono truncate text-right max-w-[150px]">
                              {agent.current_model}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-2xs gap-4">
                            <span className="text-surface-500">Runtime</span>
                            <span className="text-surface-300 truncate text-right">
                              {getString(agent.runtime_status)} / {getString(agent.infrastructure_status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-2xs gap-4">
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
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate('/quests/' + quest.id);
                                }}
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
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={10} />
                            Chat
                          </a>
                          <button
                            className="btn-ghost text-2xs flex-1"
                            onClick={e => {
                              e.stopPropagation();
                              navigate('/routines');
                            }}
                          >
                            <Link2 size={10} />
                            Routine
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-2xs text-surface-600">
                            {selectedAgent?.id === agent.id ? 'Ausgewählt' : 'Anklicken fuer Details'}
                          </span>
                          <TimeAgo date={agent.updated_at} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {offlineAgents.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Nicht erreichbar
                    </p>
                    <p className="text-2xs text-surface-600">{offlineAgents.length}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {offlineAgents.map(agent => (
                      <div
                        key={agent.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedAgentId(agent.id);
                          setActiveTab('preferences');
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedAgentId(agent.id);
                            setActiveTab('preferences');
                          }
                        }}
                        className={`card p-3 text-left opacity-80 transition-colors hover:border-gold-500/25 ${
                          selectedAgent?.id === agent.id ? 'ring-1 ring-gold-400/35 border-gold-400/25' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                            <Bot size={14} className="text-surface-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-surface-400 truncate">{agent.name}</h3>
                            <p className="text-2xs text-surface-600 truncate">{agent.role}</p>
                          </div>
                          <StatusBadge status={agent.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
