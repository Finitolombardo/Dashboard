import { useState } from 'react';
import type { Signal } from '../../types';
import SignalTypeTag from '../shared/SignalTypeTag';
import PriorityTag from '../shared/PriorityTag';
import StatusBadge from '../shared/StatusBadge';
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

  const filtered = signals.filter(signal => {
    if (filter === 'all') return true;
    if (filter === 'critical') return signal.severity === 'critical';
    if (filter === 'decision') return ['approval', 'agent_question', 'proposed_quest'].includes(signal.type);
    if (filter === 'blocked') return ['blocker', 'failed_execution', 'stuck_session'].includes(signal.type);
    if (filter === 'review') return ['approval'].includes(signal.type);
    if (filter === 'acknowledged') return signal.status === 'acknowledged';
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (a.status !== 'open' && b.status === 'open') return 1;
    }

    return (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
  });

  const openSignals = sorted.filter(signal => signal.status === 'open');
  const acknowledgedSignals = sorted.filter(signal => signal.status === 'acknowledged');
  const openCount = signals.filter(signal => signal.status === 'open').length;
  const acknowledgedCount = signals.filter(signal => signal.status === 'acknowledged').length;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/5 px-4 py-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="section-label mb-1">Prioritäts-Feed</p>
            <h2 className="text-sm font-semibold tracking-wide text-surface-100">Signale mit Operativgewicht</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {signals.some(signal => signal.severity === 'critical' && signal.status === 'open') && (
              <span className="inline-flex items-center rounded-full border border-danger-500/20 bg-danger-500/10 px-2 py-0.5 text-2xs font-medium tabular-nums text-danger-300">
                {signals.filter(signal => signal.severity === 'critical' && signal.status === 'open').length} kritisch
              </span>
            )}
            <span className="inline-flex items-center rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs tabular-nums text-surface-400">
              {openCount} offen
            </span>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-2xs font-medium transition-all duration-200 ${
                filter === option.value
                  ? 'border-gold-500/25 bg-gold-500/10 text-gold-200 shadow-[0_0_0_1px_rgba(201,144,30,0.08)]'
                  : 'border-white/5 bg-surface-900/50 text-surface-500 hover:border-white/10 hover:bg-surface-850/70 hover:text-surface-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {openSignals.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-b border-white/5 bg-surface-900/70 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="section-label">Offen</span>
                <span className="rounded-full border border-warning-500/15 bg-warning-500/10 px-2 py-0.5 text-2xs font-medium text-warning-300 tabular-nums">
                  {openSignals.length}
                </span>
              </div>
              <StatusBadge status="open" />
            </div>

            <div className="divide-y divide-white/5">
              {openSignals.map(signal => (
                <FeedItem
                  key={signal.id}
                  signal={signal}
                  isSelected={selectedId === signal.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        )}

        {acknowledgedSignals.length > 0 && (
          <section>
            <div className="flex items-center justify-between border-y border-white/5 bg-surface-900/55 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="section-label">Bestätigt</span>
                <span className="rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs font-medium text-surface-400 tabular-nums">
                  {acknowledgedCount}
                </span>
              </div>
              <StatusBadge status="acknowledged" />
            </div>

            <div className="divide-y divide-white/5">
              {acknowledgedSignals.map(signal => (
                <FeedItem
                  key={signal.id}
                  signal={signal}
                  isSelected={selectedId === signal.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
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

function FeedItem({
  signal,
  isSelected,
  onSelect,
}: {
  signal: Signal;
  isSelected: boolean;
  onSelect: (signal: Signal) => void;
}) {
  const severityBarColor =
    signal.severity === 'critical'
      ? 'bg-danger-500'
      : signal.severity === 'high'
        ? 'bg-warning-500'
        : signal.severity === 'medium'
          ? 'bg-surface-500'
          : 'bg-surface-600';

  return (
    <button
      onClick={() => onSelect(signal)}
      className={`group relative w-full border-b border-white/5 px-4 py-3 text-left transition-all duration-200 last:border-b-0 ${
        isSelected
          ? 'bg-surface-850/95 shadow-[inset_0_0_0_1px_rgba(201,144,30,0.12),0_12px_28px_rgba(0,0,0,0.22)]'
          : 'bg-surface-900/20 hover:bg-surface-850/70 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-[2px] transition-opacity duration-200 ${
          isSelected ? 'bg-gold-400' : `${severityBarColor} opacity-0 group-hover:opacity-50`
        }`}
      />

      <div className="mb-2 flex items-center justify-between gap-3">
        <SignalTypeTag type={signal.type} />
        <TimeAgo date={signal.created_at} />
      </div>

      <p className={`mb-1 text-[13px] font-medium leading-snug ${isSelected ? 'text-surface-50' : 'text-surface-100 group-hover:text-surface-50'}`}>
        {signal.title}
      </p>

      <p className="mb-3 line-clamp-2 text-2xs leading-relaxed text-surface-400/80">
        {signal.summary}
      </p>

      <div className="flex items-center gap-2">
        <PriorityTag priority={signal.severity} />
        <StatusBadge status={signal.status} />
        {signal.source && (
          <span className="rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs font-medium text-surface-400">
            {signal.source}
          </span>
        )}
      </div>
    </button>
  );
}
