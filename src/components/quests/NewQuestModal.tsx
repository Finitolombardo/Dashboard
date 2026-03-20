import { useState } from 'react';
import { X } from 'lucide-react';
import { mockAgents } from '../../data/mock';
import type { Priority } from '../../types';

interface NewQuestModalProps {
  onClose: () => void;
}

export default function NewQuestModal({ onClose }: NewQuestModalProps) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [scope, setScope] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [agentId, setAgentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-900 border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-surface-50">Neue Quest erstellen</h2>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Titel</label>
            <input
              type="text"
              className="input"
              placeholder="Quest-Titel eingeben..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Ziel</label>
            <input
              type="text"
              className="input"
              placeholder="Was soll erreicht werden?"
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Umfang / Briefing</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Beschreibung, Kontext, Anforderungen..."
              value={scope}
              onChange={e => setScope(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priorität</label>
              <select
                className="input"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="critical">Kritisch</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>
            </div>
            <div>
              <label className="label">Agent zuweisen</label>
              <select
                className="input"
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
              >
                <option value="">Nicht zugewiesen</option>
                {mockAgents.filter(a => a.status !== 'offline').map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Abbrechen
            </button>
            <button type="submit" className="btn-primary">
              Quest erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
