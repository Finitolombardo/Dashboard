import { API_BASE_URL } from ./config;
import type { Quest, Priority, QuestStatus } from ../types;

// Map backend German status strings → frontend QuestStatus enum
function mapStatus(backendStatus: string): QuestStatus {
  const map: Record<string, QuestStatus> = {
    Ausstehend:   ready,
    Geplant:      draft,
    In Arbeit:  in_progress,
    Aktiv:        in_progress,
    Blockiert:    blocked,
    Pruefung:     in_review,
    Erledigt:     done,
    Archiviert:   archived,
    Pausiert:     paused,
    Wartend:      waiting,
    Auf Hold:   paused,
  };
  return map[backendStatus] ?? draft;
}

// Map backend priority (number 1-4) → frontend Priority enum
function mapPriority(p: number | string | undefined): Priority {
  if (typeof p === string && [critical, high, medium, low].includes(p)) {
    return p as Priority;
  }
  const numMap: Record<number, Priority> = { 1: critical, 2: high, 3: medium, 4: low };
  return numMap[Number(p)] ?? medium;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuest(raw: any): Quest {
  const op = raw.operationalState ?? {};
  return {
    id:                   raw.id,
    title:                raw.title ?? ,
    goal:                 raw.goal ?? raw.description ?? raw.summary ?? ,
    scope:                ,
    status:               mapStatus(raw.status),
    priority:             mapPriority(raw.priority),
    agent_id:             raw.assignedAgentId ?? null,
    current_step:         op.lastStep?.slice(0, 200) ?? raw.currentSubtask ?? ,
    next_step:            raw.nextStep ?? raw.nextAction ?? ,
    blocker:              raw.blockedReason ?? raw.missingInput ?? ,
    progress:             typeof raw.progress === number ? raw.progress : 0,
    linked_workflow_id:   null,
    linked_campaign_id:   null,
    notes:                raw.notes ?? ,
    created_at:           raw.createdAt ?? new Date().toISOString(),
    updated_at:           raw.updatedAt ?? new Date().toISOString(),
    responsible_agent_id: raw.assignedAgentId ?? null,
    last_actor_agent_id:  raw.lastActiveAgentId ?? null,
  };
}

/**
 * Fetch quests from the operative runtime (tasks.getvoidra.com/api/tasks).
 * Returns quests mapped to the frontend Quest shape.
 */
export async function fetchQuestsFromRuntime(): Promise<Quest[]> {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    headers: { Content-Type: application/json },
  });
  if (!res.ok) throw new Error(`Runtime API ${res.status}: ${API_BASE_URL}/api/tasks`);
  const data: unknown = await res.json();
  const items = (data as Record<string, unknown>).items
    ?? (data as Record<string, unknown>).quests
    ?? (Array.isArray(data) ? data : []);
  return (items as object[]).map(mapQuest);
}

/**
 * Fetch agents from the operative runtime (tasks.getvoidra.com/api/agents).
 */
export async function fetchAgentsFromRuntime(): Promise<unknown[]> {
  const res = await fetch(`${API_BASE_URL}/api/agents`);
  if (!res.ok) throw new Error(`Runtime API ${res.status}: ${API_BASE_URL}/api/agents`);
  const data: unknown = await res.json();
  return (data as Record<string, unknown>).agents
    ?? (data as Record<string, unknown>).items
    ?? (Array.isArray(data) ? data : []);
}
