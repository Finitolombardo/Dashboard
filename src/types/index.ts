import type { DecisionTrace, QuestProposal, ActorAgentRole } from './decisionTrace';

export type {
  ActorAgentRole,
  ActorChannel,
  SourceOfTruthType,
  CanonicalCoreSection,
  PlatformAdapter,
  RuntimeSource,
  GuardrailStatus,
  DriftRisk,
  DecisionTrace,
  QuestProposalStatus,
  QuestProposalOriginType,
  QuestProposal,
} from './decisionTrace';

export type QuestStatus =
  | 'draft'
  | 'ready'
  | 'in_progress'
  | 'waiting'
  | 'blocked'
  | 'in_review'
  | 'done'
  | 'paused'
  | 'archived';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'blocked' | 'offline' | 'error';

export type SignalType =
  | 'blocker'
  | 'approval'
  | 'agent_question'
  | 'failed_execution'
  | 'stuck_session'
  | 'performance_drop'
  | 'campaign_underperformance'
  | 'system_warning'
  | 'proposed_quest';

export type SignalStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export type WorkflowStatus = 'active' | 'paused' | 'error' | 'inactive';

export type ExecutionStatus = 'success' | 'failed' | 'running' | 'cancelled';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'error';

export type SessionHealth = 'healthy' | 'degraded' | 'error';

export type ServiceStatus = 'online' | 'degraded' | 'offline' | 'error';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

export type MessageSenderType = 'operator' | 'agent' | 'system';

export type MessageType = 'message' | 'update' | 'question' | 'event' | 'approval' | 'output';

export type ArtefactType = 'file' | 'link' | 'report' | 'summary' | 'doc' | 'log' | 'screenshot' | 'bundle';

export interface Agent {
  id: string;
  name: string;
  role: string;
  canonical_role?: ActorAgentRole;
  status: AgentStatus;
  capabilities: string;
  current_model: string;
  workload: number;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  title: string;
  goal: string;
  scope: string;
  status: QuestStatus;
  priority: Priority;
  agent_id: string | null;
  current_step: string;
  next_step: string;
  blocker: string;
  progress: number;
  linked_workflow_id: string | null;
  linked_campaign_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  decision_trace_id?: string | null;
  decision_trace?: DecisionTrace;
  trace_summary?: string;
  responsible_agent_id?: string | null;
  last_actor_agent_id?: string | null;
  agent?: Agent;
}

export interface Signal {
  id: string;
  type: SignalType;
  title: string;
  summary: string;
  severity: Priority;
  status: SignalStatus;
  source: string;
  linked_quest_id: string | null;
  linked_workflow_id: string | null;
  linked_session_id: string | null;
  linked_campaign_id: string | null;
  created_at: string;
  decision_trace_id?: string | null;
  decision_trace?: DecisionTrace;
  quest_proposal_id?: string | null;
  quest_proposal?: QuestProposal;
  responsible_agent_id?: string | null;
  last_actor_agent_id?: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  last_run: string | null;
  owner_agent_id: string | null;
  related_quest_id: string | null;
  execution_health: string;
  created_at: string;
  updated_at: string;
  agent?: Agent;
}

export interface Execution {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  failure_summary: string;
  severity: Priority;
  retry_count: number;
  linked_quest_id: string | null;
  started_at: string;
  completed_at: string | null;
  workflow?: Workflow;
}

export interface Session {
  id: string;
  name: string;
  agent_id: string | null;
  current_model: string;
  current_task: string;
  health: SessionHealth;
  status: SessionStatus;
  linked_quest_id: string | null;
  started_at: string;
  last_message: string;
  created_at: string;
  decision_trace_id?: string | null;
  decision_trace?: DecisionTrace;
  responsible_agent_id?: string | null;
  last_actor_agent_id?: string | null;
  agent?: Agent;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: CampaignStatus;
  sent: number;
  opened: number;
  replied: number;
  positive_replies: number;
  bounce_rate: number;
  linked_quest_id: string | null;
  last_update: string;
  created_at: string;
}

export interface Message {
  id: string;
  quest_id: string;
  sender_type: MessageSenderType;
  sender_name: string;
  content: string;
  message_type: MessageType;
  created_at: string;
}

export interface Artefact {
  id: string;
  quest_id: string;
  title: string;
  type: ArtefactType;
  source: string;
  created_by: string;
  url: string;
  created_at: string;
}

export interface Event {
  id: string;
  quest_id: string;
  type: string;
  description: string;
  actor: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  last_check: string;
  response_time_ms: number;
  created_at: string;
}

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  draft: 'Entwurf',
  ready: 'Bereit',
  in_progress: 'In Bearbeitung',
  waiting: 'Wartet auf Operator',
  blocked: 'Blockiert',
  in_review: 'In Prüfung',
  done: 'Erledigt',
  paused: 'Pausiert',
  archived: 'Archiviert',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
};

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'Bereit',
  working: 'Arbeitet',
  waiting: 'Wartet',
  blocked: 'Blockiert',
  offline: 'Offline',
  error: 'Fehler',
};

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  blocker: 'Blocker',
  approval: 'Freigabe',
  agent_question: 'Agenten-Frage',
  failed_execution: 'Fehlgeschlagen',
  stuck_session: 'Sitzung hängt',
  performance_drop: 'Leistungsabfall',
  campaign_underperformance: 'Kampagne schwach',
  system_warning: 'Systemwarnung',
  proposed_quest: 'Quest-Vorschlag',
};
