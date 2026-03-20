export type ActorAgentRole = 'archon' | 'codex' | 'archivarius' | 'waechter' | 'opencode' | 'mission_control';

export type ActorChannel =
  | 'operator_console'
  | 'mission_control_ui'
  | 'opencode_workspace'
  | 'openclaw_runtime'
  | 'system_monitor';

export type SourceOfTruthType =
  | 'canonical_core'
  | 'runtime_state'
  | 'workspace_state'
  | 'service_telemetry'
  | 'operator_instruction';

export type CanonicalCoreSection =
  | 'HANDOVER_TEMPLATE'
  | 'MEMORY_SOURCE_OF_TRUTH'
  | 'COMMUNICATION_AND_CONTEXT_BOUNDARIES'
  | 'SYNC_AND_DRIFT_RULES'
  | 'DECISION_TRACE_STANDARD'
  | 'CORE_INDEX';

export type PlatformAdapter =
  | 'mission_control_adapter'
  | 'opencode_adapter'
  | 'openclaw_adapter'
  | 'manual_operator_channel';

export type RuntimeSource =
  | 'dashboard_mock'
  | 'mission_control_runtime'
  | 'opencode_runtime'
  | 'openclaw_runtime'
  | 'target_runtime';

export type GuardrailStatus = 'ok' | 'review_required' | 'blocked';

export type DriftRisk = 'low' | 'medium' | 'high';

export interface DecisionTrace {
  trace_id: string;
  actor_agent_id: string;
  actor_agent_role: ActorAgentRole;
  actor_channel: ActorChannel;
  decision_reason: string;
  rule_id: string;
  rule_name: string;
  playbook_id: string;
  playbook_name: string;
  source_of_truth_type: SourceOfTruthType;
  source_of_truth_label: string;
  canonical_core_section: CanonicalCoreSection;
  handover_template_used: string;
  memory_scope: string;
  platform_adapter: PlatformAdapter;
  runtime_source: RuntimeSource;
  trace_summary: string;
  confidence: number;
  review_required: boolean;
  guardrail_status: GuardrailStatus;
  drift_risk: DriftRisk;
  last_updated_at: string;
}

export type QuestProposalStatus = 'draft' | 'proposed' | 'approved' | 'rejected';

export type QuestProposalOriginType = 'signal' | 'agent' | 'operator' | 'system';

export interface QuestProposal {
  proposal_id: string;
  origin_type: QuestProposalOriginType;
  origin_ref: string;
  proposed_by_agent_id: string;
  proposed_for_agent_id: string;
  proposed_title: string;
  proposed_goal: string;
  reason: string;
  linked_rule_id: string;
  linked_playbook_id: string;
  linked_trace_id: string;
  status: QuestProposalStatus;
}
