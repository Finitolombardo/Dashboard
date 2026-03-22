import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Archive,
  MoreHorizontal,
} from 'lucide-react';
import {
  fetchQuestDetailFromBackend,
  fetchQuestMessagesFromBackend,
  fetchQuestArtifactsFromBackend,
  updateQuestStatus,
  sendQuestMessage,
  getAgentById,
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

  useEffect(() => {
    if (!id) { setQuest(null); return; }
    fetchQuestDetailFromBackend(id)
      .then(q => {
        setQuest(q);
        fetchQuestMessagesFromBackend(id).then(setMessages).catch(() => {});
        fetchQuestArtifactsFromBackend(id).then(setArtefacts).catch(() => {});
      })
      .catch(() => setQuest(null));
  }, [id]);

  if (quest === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-surface-500">Lädt…</p>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-surface-500">Quest nicht gefunden</p>
      </div>
    );
  }

  const agent = getAgentById(quest.agent_id);
  const events: Event[] = [];

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
              <button className="btn-primary"><Play size={14} /> Starten</button>
            )}
            {quest.status === 'in_progress' && (
              <button className="btn-secondary"><Pause size={14} /> Pausieren</button>
            )}
            {quest.status === 'paused' && (
              <button className="btn-primary"><Play size={14} /> Fortsetzen</button>
            )}
            {quest.status === 'in_review' && (
              <>
                <button
                  className="btn-primary"
                  onClick={() => updateQuestStatus(quest.id, 'Erledigt').then(() => fetchQuestDetailFromBackend(quest.id).then(setQuest)).catch(() => {})}
                >
                  <CheckCircle2 size={14} /> Freigeben
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => updateQuestStatus(quest.id, 'In Arbeit').then(() => fetchQuestDetailFromBackend(quest.id).then(setQuest)).catch(() => {})}
                >
                  <RotateCcw size={14} /> Änderungen
                </button>
              </>
            )}
            <button className="btn-ghost"><Archive size={14} /></button>
            <button className="btn-ghost"><MoreHorizontal size={14} /></button>
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
            onSend={content => {
              setMessages(prev => [...prev, {
                id: `local-${Date.now()}`,
                quest_id: quest.id,
                sender_type: 'operator' as const,
                sender_name: 'Operator',
                content,
                message_type: 'message' as const,
                created_at: new Date().toISOString(),
              }]);
              sendQuestMessage(quest.id, content).catch(() => {});
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
