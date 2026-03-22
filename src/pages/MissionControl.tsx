import { useState } from 'react';
import type { Signal } from '../types';
import { useQuests } from '../lib/useQuests';
import { useSignals } from '../lib/useSignals';
import PriorityFeed from '../components/mission-control/PriorityFeed';
import FocusWorkspace from '../components/mission-control/FocusWorkspace';
import ContextRail from '../components/mission-control/ContextRail';
import { Radio } from 'lucide-react';

export default function MissionControl() {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const { quests } = useQuests();
  const signals = useSignals(quests);

  const openCount = signals.filter(s => s.status === 'open').length;
  const criticalCount = signals.filter(s => s.severity === 'critical' && s.status === 'open').length;
  const activeQuestCount = quests.filter(q => ['in_progress', 'in_review', 'blocked'].includes(q.status)).length;

  return (
    <div className="relative h-screen overflow-hidden bg-surface-950 text-surface-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,144,30,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_24%),linear-gradient(180deg,rgba(8,9,11,0.96),rgba(8,9,11,1))]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-surface-950/80 px-6 py-3 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-gold-400" />
              <div>
                <h1 className="text-sm font-semibold tracking-[0.18em] text-surface-50 uppercase">
                  Mission Control
                </h1>
                <p className="text-2xs text-surface-500">
                  Operative Leitstelle für Signal-, Quest- und Workflow-Steuerung
                </p>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-white/5 sm:block" />

            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="inline-flex items-center rounded-full border border-danger-500/25 bg-danger-500/10 px-2 py-0.5 text-2xs font-medium tabular-nums text-danger-300">
                  {criticalCount} kritisch
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs tabular-nums text-surface-400">
                {openCount} offen
              </span>
              <span className="inline-flex items-center rounded-full border border-gold-500/15 bg-gold-500/5 px-2 py-0.5 text-2xs tabular-nums text-gold-400">
                {activeQuestCount} Quests aktiv
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-success-500/15 bg-success-500/10 px-2 py-0.5 text-2xs text-surface-300">
              <div className="h-1.5 w-1.5 rounded-full bg-success-400 shadow-[0_0_10px_rgba(52,211,153,0.25)]" />
              <span>Live</span>
            </div>
            <span className="font-mono text-2xs tabular-nums text-surface-500">
              {new Date().toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </header>

        <main className="flex min-h-0 flex-1">
          <aside className="w-[356px] flex-shrink-0 border-r border-white/5 bg-surface-900/35">
            <PriorityFeed
              signals={signals}
              selectedId={selectedSignal?.id || null}
              onSelect={setSelectedSignal}
            />
          </aside>

          <section className="min-w-0 flex-1 border-x border-white/[0.03] bg-[linear-gradient(180deg,rgba(13,14,18,0.96),rgba(8,9,11,1))] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <FocusWorkspace signal={selectedSignal} quests={quests} />
          </section>

          <aside className="w-[292px] flex-shrink-0 border-l border-white/5 bg-surface-900/30">
            <ContextRail signal={selectedSignal} quests={quests} />
          </aside>
        </main>
      </div>
    </div>
  );
}
