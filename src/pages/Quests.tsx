import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useQuests } from '../lib/useQuests';
import { getAgentById } from '../data/mock';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import PriorityTag from '../components/shared/PriorityTag';
import AgentChip from '../components/shared/AgentChip';
import ProgressBar from '../components/shared/ProgressBar';
import TimeAgo from '../components/shared/TimeAgo';
import NewQuestModal from '../components/quests/NewQuestModal';

const filterTabs: { value: string; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'blocked', label: 'Blockiert' },
  { value: 'waiting', label: 'Wartend' },
  { value: 'in_review', label: 'In Prüfung' },
  { value: 'ready', label: 'Bereit' },
  { value: 'draft', label: 'Entwurf' },
  { value: 'done', label: 'Erledigt' },
  { value: 'paused', label: 'Pausiert' },
];

export default function Quests() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewQuest, setShowNewQuest] = useState(false);
  const { quests, loading } = useQuests();

  const filtered = quests.filter(q => {
    if (filter !== 'all' && q.status !== filter) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Quests"
        subtitle={loading ? 'Lädt…' : `${quests.length} Quests insgesamt`}
        actions={
          <button className="btn-primary" onClick={() => setShowNewQuest(true)}>
            <Plus size={14} />
            Neue Quest
          </button>
        }
      />

      <div className="px-6 py-3 border-b border-white/[0.06] bg-surface-900/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Quests durchsuchen..."
              className="input pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-ghost">
            <SlidersHorizontal size={14} />
            Filter
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors border ${
                filter === tab.value
                  ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 font-medium'
                  : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800 border-white/5'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 text-2xs opacity-60">
                  {quests.filter(q => q.status === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-surface-500">Quests werden geladen…</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(quest => {
              const agent = quest.agent ?? getAgentById(quest.agent_id);
              return (
                <button
                  key={quest.id}
                  onClick={() => navigate(`/quests/${quest.id}`)}
                  className="w-full text-left px-6 py-3.5 hover:bg-surface-900/50 transition-colors flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-surface-100 truncate">{quest.title}</h3>
                    </div>
                    <p className="text-2xs text-surface-500 truncate">{quest.goal}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={quest.status} dot />
                    <PriorityTag priority={quest.priority} />
                    <AgentChip agent={agent} />
                    <div className="w-20">
                      <ProgressBar value={quest.progress} />
                      <span className="text-2xs text-surface-500 mt-0.5 block text-right">{quest.progress}%</span>
                    </div>
                    <TimeAgo date={quest.updated_at} className="w-14 text-right" />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-surface-500">Keine Quests gefunden</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showNewQuest && <NewQuestModal onClose={() => setShowNewQuest(false)} />}
    </div>
  );
}
