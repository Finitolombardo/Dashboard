import { useState } from 'react';
import type { Signal } from '../../types';
import SignalTypeTag from '../shared/SignalTypeTag';
import PriorityTag from '../shared/PriorityTag';
import TimeAgo from '../shared/TimeAgo';

interface PriorityFeedProps {
  signals: Signal[];
  selectedId: string | null;
  onSelect: (signal: Signal) => void;
}

const filterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'critical', label: 'Kritisch' },
  { value: 'decision', label: 'Entscheidung' },
  { value: 'blocked', label: 'Blockiert' },
  { value: 'review', label: 'Review' },
  { value: 'acknowledged', label: 'Bestätigt' },
];

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function PriorityFeed({ signals, selectedId, onSelect }: PriorityFeedProps) {
  const [filter, setFilter] = useState('all');

  const filtered = signals.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'critical') return s.severity === 'critical';
    if (filter === 'decision') return ['approval', 'agent_question', 'proposed_quest'].includes(s.type);
    if (filter === 'blocked') return ['blocker', 'failed_execution', 'stuck_session'].includes(s.type);
    if (filter === 'review') return ['approval'].includes(s.type);
    if (filter === 'acknowledged') return s.status === 'acknowledged';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (a.status !== 'open' && b.status === 'open') return 1;
    }
    return (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
  });

  const openSignals = sorted.filter(s => s.status === 'open');
  const acknowledgedSignals = sorted.filter(s => s.status === 'acknowledged');

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-surface-700/30">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold text-surface-200 tracking-wide">Prioritäts-Feed</h2>
          <div className="flex items-center gap-1.5">
            {signals.filter(s => s.severity === 'critical' && s.status === 'open').length > 0 && (
              <span className="text-2xs bg-danger-500/15 text-danger-400 px-1.5 py-0.5 rounded font-medium tabular-nums">
                {signals.filter(s => s.severity === 'critical' && s.status === 'open').length} kritisch
              </span>
            )}
            <span className="text-2xs text-surface-500 tabular-nums">
              {signals.filter(s => s.status === 'open').length} offen
            </span>
          </div>
        </div>
        <div className="flex gap-0.5 overflow-x-auto">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-2xs px-2.5 py-1 rounded-sm whitespace-nowrap transition-all duration-100 ${
                filter === opt.value
                  ? 'bg-surface-700/60 text-surface-100 font-medium'
                  : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {openSignals.length > 0 && (
          <div>
            <div className="px-4 py-1.5 bg-surface-900/60 border-b border-surface-700/20">
              <span className="section-label">Offen</span>
            </div>
            {openSignals.map(signal => (
              <FeedItem
                key={signal.id}
                signal={signal}
                isSelected={selectedId === signal.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}

        {acknowledgedSignals.length > 0 && (
          <div>
            <div className="px-4 py-1.5 bg-surface-900/60 border-b border-surface-700/20">
              <span className="section-label">Bestätigt</span>
            </div>
            {acknowledgedSignals.map(signal => (
              <FeedItem
                key={signal.id}
                signal={signal}
                isSelected={selectedId === signal.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-xs text-surface-500">Keine Signale in dieser Ansicht</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedItem({ signal, isSelected, onSelect }: { signal: Signal; isSelected: boolean; onSelect: (s: Signal) => void }) {
  const severityBarColor =
    signal.severity === 'critical' ? 'bg-danger-500' :
    signal.severity === 'high' ? 'bg-warning-500' :
    signal.severity === 'medium' ? 'bg-surface-500' :
    'bg-surface-600';

  return (
    <button
      onClick={() => onSelect(signal)}
      className={`group w-full text-left px-4 py-3 border-b border-surface-700/20 transition-all duration-100 relative ${
        isSelected
          ? 'bg-surface-800/80'
          : 'hover:bg-surface-850/60'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-100 ${
        isSelected ? 'bg-gold-500' : severityBarColor + ' opacity-0 group-hover:opacity-40'
      }`} />

      <div className="flex items-center justify-between gap-2 mb-1">
        <SignalTypeTag type={signal.type} />
        <TimeAgo date={signal.created_at} />
      </div>

      <p className={`text-[13px] font-medium leading-snug mb-1 transition-colors ${
        isSelected ? 'text-surface-50' : 'text-surface-200 group-hover:text-surface-100'
      }`}>
        {signal.title}
      </p>

      <p className="text-2xs text-surface-500 line-clamp-2 leading-relaxed mb-2">{signal.summary}</p>

      <div className="flex items-center gap-2">
        <PriorityTag priority={signal.severity} />
        {signal.source && (
          <span className="text-2xs text-surface-500 font-medium">{signal.source}</span>
        )}
      </div>
    </button>
  );
}
