import type { Agent } from '../../types';
import { Bot } from 'lucide-react';

interface AgentChipProps {
  agent: Agent | undefined;
  size?: 'sm' | 'md';
}

const agentStyles: Record<string, string> = {
  working: 'border-gold-500/20 bg-gold-500/10 text-gold-200',
  idle: 'border-white/5 bg-surface-900/70 text-surface-300',
  waiting: 'border-warning-500/20 bg-warning-500/10 text-warning-300',
  blocked: 'border-danger-500/20 bg-danger-500/10 text-danger-300',
  error: 'border-danger-500/20 bg-danger-500/10 text-danger-300',
  offline: 'border-white/5 bg-surface-800/70 text-surface-500',
};

const dotStyles: Record<string, string> = {
  working: 'bg-gold-400',
  idle: 'bg-surface-500',
  waiting: 'bg-warning-400',
  blocked: 'bg-danger-400',
  error: 'bg-danger-400',
  offline: 'bg-surface-600',
};

export default function AgentChip({ agent, size = 'sm' }: AgentChipProps) {
  if (!agent) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs text-surface-500">
        <Bot size={12} className="text-surface-500" />
        Nicht zugewiesen
      </span>
    );
  }

  const sizeClasses = size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const colorClass = agentStyles[agent.status] || agentStyles.idle;
  const dotClass = dotStyles[agent.status] || dotStyles.idle;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorClass} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <Bot size={size === 'sm' ? 10 : 12} className="text-surface-400" />
      {agent.name}
    </span>
  );
}
