import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Archive,
  Trash2,
} from 'lucide-react';
import {
  fetchQuestDetailFromBackend,
  fetchQuestMessagesFromBackend,
  fetchQuestArtifactsFromBackend,
  fetchQuestEventsFromBackend,
  sendQuestMessage,
  dispatchQuest,
  applyQuestAction,
  getAgentById,
  parseOperatorIntent,
  executeOperatorIntent,
  deleteQuest,
} from '../lib/missionControlApi';
import type { Quest, Message, Event, Artefact } from '../types';
import StatusBadge from '../components/shared/StatusBadge';
import PriorityTag from '../components/shared/PriorityTag';
import AgentChip from '../components/shared/AgentChip';
import ProgressBar from '../components/shared/ProgressBar';
import TimeAgo from '../components/shared/TimeAgo';
import QuestWork from '../components/quest-detail/QuestWork';
import QuestOutputs from '../components/quest-detail/QuestOutputs';
import QuestContext from '../components/quest-detail/QuestContext';

const tabs = [
  { id: 'work', label: 'Arbeit' },
  { id: 'outputs', label: 'Ergebnisse' },
  { id: 'context', label: 'Kontext' },
];

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('work');
  const [quest, setQuest] = useState<Quest | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [artefacts, setArtefacts] = useState<Artefact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) { setQuest(null); return; }
    setLoadError(null);
    fetchQuestDetailFromBackend(id)
      .then(q => {
        if (!q || !q.id) {
          setQuest(null);
          setLoadError('Quest-Daten unvollständig.');
          return;
        }
        setQuest(q);
        fetchQuestMessagesFromBackend(id).then(setMessages).catch(() => {});
        fetchQuestArtifactsFromBackend(id).then(setArtefacts).catch(() => {});
        fetchQuestEventsFromBackend(id).then(setEvents).catch(() => {});
      })
      .catch(err => {
        setQuest(null);
        setLoadError(err?.message || 'Laden fehlgeschlagen');
      });
  }, [id]);

  // Poll messages while quest is active
  useEffect(() => {
    if (!id || !quest) return;
    if (quest.status === 'done' || quest.status === 'archived') return;
    const timer = setInterval(() => {
      fetchQuestMessagesFromBackend(id).then(serverMsgs => {
        setMessages(prev => {
          const serverIds = new Set(serverMsgs.map(m => m.id));
          const localOnly = prev.filter(m => m.id.startsWith('local-') && !serverIds.has(m.id));
          return [...serverMsgs, ...localOnly];
        });
        // Turn off processing indicator when agent message arrives
        if (serverMsgs.some(m => m.sender_type === 'agent')) {
          setIsProcessing(false);
        }
      }).catch(() => {});
      fetchQuestDetailFromBackend(id).then(setQuest).catch(() => {});
      fetchQuestEventsFromBackend(id).then(setEvents).catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, quest?.status]);

  if (quest === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-surface-500">Lädt…</p>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-surface-500">{loadError || 'Quest nicht gefunden'}</p>
        <button onClick={() => navigate('/quests')} className="btn-ghost text-xs">
          ← Zurück zu Quests
        </button>
      </div>
    );
  }

  const agent = getAgentById(quest.agent_id);
  const hasAgentWork = messages.some(m => m.sender_type === 'agent') || quest.progress > 0;

  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 py-3 border-b border-white/[0.06] bg-surface-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/quests')}
            className="text-surface-500 hover:text-surface-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-surface-50 truncate">{quest.title}</h1>
            </div>
            <p className="text-2xs text-surface-500 truncate mt-0.5">{quest.goal}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {quest.status === 'ready' && (
              <button
                className="btn-primary"
                onClick={() => applyQuestAction(quest.id, 'start').then(setQuest).catch(() => {})}
              ><Play size={14} /> Starten</button>
            )}
            {quest.status === 'in_progress' && (
              <button
                className="btn-secondary"
                onClick={() => applyQuestAction(quest.id, 'pause').then(setQuest).catch(() => {})}
              ><Pause size={14} /> Pausieren</button>
            )}
            {quest.status === 'paused' && (
              <button
                className="btn-primary"
                onClick={() => applyQuestAction(quest.id, 'resume').then(setQuest).catch(() => {})}
              ><Play size={14} /> Fortsetzen</button>
            )}
            {quest.status === 'in_review' && (
              <>
                <button
                  className={hasAgentWork ? 'btn-primary' : 'btn-ghost opacity-50 cursor-not-allowed'}
                  disabled={!hasAgentWork}
                  title={hasAgentWork ? 'Quest als erledigt freigeben' : 'Keine Agent-Arbeit vorhanden — Freigabe nicht möglich'}
                  onClick={() => {
                    if (!hasAgentWork) return;
                    if (!confirm('Quest wirklich als erledigt freigeben?')) return;
                    applyQuestAction(quest.id, 'review_accept').then(setQuest).catch(() => {});
                  }}
                >
                  <CheckCircle2 size={14} /> Review annehmen
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const note = prompt('Revisions-Hinweis (Pflicht):');
                    if (!note?.trim()) return;
                    applyQuestAction(quest.id, 'request_revision', note.trim()).then(setQuest).catch(() => {});
                  }}
                >
                  <RotateCcw size={14} /> Änderungen anfordern
                </button>
              </>
            )}
            <button
              className="btn-ghost"
              title="Quest archivieren"
              onClick={() => {
                if (!confirm('Quest archivieren?')) return;
                applyQuestAction(quest.id, 'archive').then(() => navigate('/quests')).catch(() => {});
              }}
            ><Archive size={14} /></button>
            <button
              className="btn-ghost text-red-400 hover:text-red-300"
              title="Quest löschen"
              onClick={() => {
                if (!confirm('Quest wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
                deleteQuest(quest.id).then(() => navigate('/quests')).catch(() => {
                  alert('Löschen fehlgeschlagen. Backend-Update nötig.');
                });
              }}
            ><Trash2 size={14} /></button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge status={quest.status} size="md" dot />
          <PriorityTag priority={quest.priority} size="md" />
          <AgentChip agent={agent} size="md" />
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-24">
              <ProgressBar value={quest.progress} size="md" />
            </div>
            <span className="text-xs text-surface-400">{quest.progress}%</span>
          </div>
          <TimeAgo date={quest.updated_at} />
        </div>

      </div>

      <div className="border-b border-white/[0.06] bg-surface-900/40 px-6">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gold-500 text-surface-100'
                  : 'border-transparent text-surface-500 hover:text-surface-300'
              }`}
            >
              {tab.label}
              {tab.id === 'outputs' && artefacts.length > 0 && (
                <span className="ml-1.5 text-2xs bg-surface-700 px-1.5 py-0.5 rounded">{artefacts.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'work' && (
          <QuestWork
            quest={quest}
            messages={messages}
            events={events}
            agent={agent}
            isProcessing={isProcessing}
            onSend={content => {
              const now = new Date().toISOString();
              // Optimistic operator message
              setMessages(prev => [...prev, {
                id: `local-${Date.now()}`,
                quest_id: quest.id,
                sender_type: 'operator' as const,
                sender_name: 'Operator',
                content,
                message_type: 'message' as const,
                created_at: now,
              }]);

              const intent = parseOperatorIntent(content);

              if (intent.type !== 'message') {
                // Meta-command: execute system action, no dispatch
                if (intent.type === 'delete_quest') {
                  if (!confirm('Quest wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
                }
                const agentName = agent?.name || 'Archon';
                sendQuestMessage(quest.id, content)
                  .then(() => executeOperatorIntent(intent, quest.id))
                  .then(async result => {
                    if (result.deleted) {
                      navigate('/quests');
                      return;
                    }
                    // Refresh quest state FIRST so header is in sync
                    const updatedQuest = await fetchQuestDetailFromBackend(quest.id);
                    setQuest(updatedQuest);
                    // Show system confirmation with correct agent name
                    setMessages(prev => [...prev, {
                      id: `sys-${Date.now()}`,
                      quest_id: quest.id,
                      sender_type: 'system' as const,
                      sender_name: agentName,
                      content: result.systemMessage,
                      message_type: 'status' as const,
                      created_at: new Date().toISOString(),
                    }]);
                    // Persist system message with agent name
                    sendQuestMessage(quest.id, `[${agentName}] ${result.systemMessage}`);
                  })
                  .catch(err => {
                    setMessages(prev => [...prev, {
                      id: `err-${Date.now()}`,
                      quest_id: quest.id,
                      sender_type: 'system' as const,
                      sender_name: 'System',
                      content: `Fehler: ${err?.message || 'Aktion fehlgeschlagen'}`,
                      message_type: 'status' as const,
                      created_at: new Date().toISOString(),
                    }]);
                  });
              } else {
                // Regular message: send to thread + dispatch to agent
                setIsProcessing(true);
                sendQuestMessage(quest.id, content)
                  .then(() => fetchQuestMessagesFromBackend(quest.id))
                  .then(serverMsgs => {
                    setMessages(prev => {
                      const serverIds = new Set(serverMsgs.map(m => m.id));
                      const localOnly = prev.filter(m => m.id.startsWith('local-') && !serverIds.has(m.id));
                      return [...serverMsgs, ...localOnly];
                    });
                  })
                  .then(() => dispatchQuest(quest.id))
                  .then(() => fetchQuestDetailFromBackend(quest.id).then(setQuest))
                  .catch(() => {})
                  .finally(() => {
                    // Keep processing indicator for 15s or until next poll brings agent message
                    setTimeout(() => setIsProcessing(false), 15000);
                  });
              }
            }}
          />
        )}
        {activeTab === 'outputs' && (
          <QuestOutputs artefacts={artefacts} />
        )}
        {activeTab === 'context' && (
          <QuestContext quest={quest} />
        )}
      </div>
    </div>
  );
}
