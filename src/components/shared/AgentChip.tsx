import type { Agent } from '../../types';
import { Bot } from 'lucide-react';

interface AgentChipProps {
  agent: Agent | undefined;
  size?: 'sm' | 'md';
}

const agentColors: Record<string, string> = {
  working: 'bg-gold-500/10 border-gold-500/20',
  idle: 'bg-surface-700/50 border-surface-600/30',
  waiting: 'bg-warning-500/15 border-warning-500/20',
  blocked: 'bg-danger-500/15 border-danger-500/20',
  error: 'bg-danger-500/15 border-danger-500/20',
  offline: 'bg-surface-800/50 border-surface-700/30',
};

export default function AgentChip({ agent, size = 'sm' }: AgentChipProps) {
  if (!agent) {
    return (
      <span className="inline-flex items-center gap-1 text-2xs text-surface-500">
        <Bot size={12} />
        Nicht zugewiesen
      </span>
    );
  }

  const colorClass = agentColors[agent.status] || agentColors.idle;
  const sizeClasses = size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-medium text-surface-200 ${colorClass} ${sizeClasses}`}>
      <Bot size={size === 'sm' ? 10 : 12} className="text-surface-400" />
      {agent.name}
    </span>
  );
}
