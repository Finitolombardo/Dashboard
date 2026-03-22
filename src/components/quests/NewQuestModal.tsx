import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Priority } from '../../types';

const configured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface NewQuestModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewQuestModal({ onClose, onCreated }: NewQuestModalProps) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [scope, setScope] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!configured) {
      onClose();
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('quests').insert({
      title: title.trim(),
      goal: goal.trim(),
      scope: scope.trim(),
      priority,
      agent_id: null,
      status: 'draft',
      progress: 0,
    });

    setSubmitting(false);

    if (insertError) {
      setError('Fehler beim Erstellen. Bitte erneut versuchen.');
      return;
    }

    onCreated?.();
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
            <label className="label">Titel *</label>
            <input
              type="text"
              className="input"
              placeholder="Quest-Titel eingeben..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
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

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={submitting}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || !title.trim()}>
              {submitting ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Wird erstellt…
                </>
              ) : (
                'Quest erstellen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
