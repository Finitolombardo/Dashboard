import type { ReactNode } from 'react';
import type { Agent } from '../../types';
import AgentChip from './AgentChip';

interface AgentResponsibilityCardProps {
  responsibleAgent?: Agent | null;
  lastActorAgent?: Agent | null;
  actorChannel?: string | null;
  platformAdapter?: string | null;
}

export default function AgentResponsibilityCard({
  responsibleAgent,
  lastActorAgent,
  actorChannel,
  platformAdapter,
}: AgentResponsibilityCardProps) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-900/50 px-3 py-2.5">
      <p className="text-2xs text-surface-500">Agentenverantwortung</p>
      <div className="mt-2 space-y-2">
        <ResponsibilityRow label="Zuständig" value={responsibleAgent ? <AgentChip agent={responsibleAgent} /> : 'Nicht gesetzt'} />
        <ResponsibilityRow label="Zuletzt gehandelt" value={lastActorAgent ? <AgentChip agent={lastActorAgent} /> : 'Nicht verfügbar'} />
        <ResponsibilityRow label="Kanal" value={actorChannel ?? 'Nicht verfügbar'} />
        <ResponsibilityRow label="Adapter" value={platformAdapter ?? 'Nicht verfügbar'} />
      </div>
    </div>
  );
}

function ResponsibilityRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-2xs">
      <span className="text-surface-500">{label}</span>
      <span className="text-right text-surface-300">{value}</span>
    </div>
  );
}
