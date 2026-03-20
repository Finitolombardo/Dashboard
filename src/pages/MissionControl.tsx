import { useState } from 'react';
import type { Signal } from '../types';
import { mockSignals } from '../data/mock';
import PriorityFeed from '../components/mission-control/PriorityFeed';
import FocusWorkspace from '../components/mission-control/FocusWorkspace';
import ContextRail from '../components/mission-control/ContextRail';
import { Radio } from 'lucide-react';

export default function MissionControl() {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const openCount = mockSignals.filter(s => s.status === 'open').length;
  const criticalCount = mockSignals.filter(s => s.severity === 'critical' && s.status === 'open').length;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-surface-700/30 bg-surface-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio size={15} className="text-gold-500" />
            <h1 className="text-sm font-semibold text-surface-100 tracking-wide">Mission Control</h1>
          </div>
          <div className="w-px h-4 bg-surface-700/40 mx-1" />
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="text-2xs bg-danger-500/15 text-danger-400 px-2 py-0.5 rounded font-medium tabular-nums">
                {criticalCount} kritisch
              </span>
            )}
            <span className="text-2xs text-surface-500 tabular-nums">
              {openCount} offen
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-2xs text-surface-500">
            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-slow" />
            <span>Live</span>
          </div>
          <span className="text-2xs text-surface-600 font-mono">
            {new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-[360px] border-r border-surface-700/30 flex-shrink-0 bg-surface-900/20">
          <PriorityFeed
            signals={mockSignals}
            selectedId={selectedSignal?.id || null}
            onSelect={setSelectedSignal}
          />
        </div>

        <div className="flex-1 min-w-0 bg-surface-950">
          <FocusWorkspace signal={selectedSignal} />
        </div>

        <div className="w-[270px] border-l border-surface-700/30 flex-shrink-0 bg-surface-900/20">
          <ContextRail signal={selectedSignal} />
        </div>
      </div>
    </div>
  );
}
