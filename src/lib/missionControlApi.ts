import { API_BASE_URL } from "./config";
import type { Quest, Agent, Priority, QuestStatus, AgentStatus } from "../types";

// ─── Status / Priority mappers ─────────────────────────────────────────────

function mapStatus(backendStatus: string): QuestStatus {
  const map: Record<string, QuestStatus> = {
    Ausstehend: "ready",
    Geplant: "draft",
    "In Arbeit": "in_progress",
    Aktiv: "in_progress",
    Blockiert: "blocked",
    Pruefung: "in_review",
    Erledigt: "done",
    Abgeschlossen: "done",
    Archiviert: "archived",
    Pausiert: "paused",
    Wartend: "waiting",
    "Auf Hold": "paused",
  };
  return map[backendStatus] ?? "draft";
}

function mapPriority(p: number | string | undefined): Priority {
  if (typeof p === "string" && ["critical", "high", "medium", "low"].includes(p))
    return p as Priority;
  const numMap: Record<number, Priority> = { 1: "critical", 2: "high", 3: "medium", 4: "low" };
  return numMap[Number(p)] ?? "medium";
}

function mapAgentStatus(s: string | undefined): AgentStatus {
  if (s === "Working") return "working";
  if (s === "Idle") return "idle";
  return "offline";
}

// ─── Quest mapper ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuest(raw: any): Quest {
  const op = raw.operationalState ?? {};
  const handoffText: string = op.handoff?.humanActionRequired ?? "";
  return {
    id: raw.id,
    title: raw.title ?? "",
    goal: raw.goal ?? raw.description ?? raw.summary ?? "",
    scope: "",
    status: mapStatus(raw.status),
    priority: mapPriority(raw.urgency ?? raw.priority),
    agent_id: raw.assignedAgentId ?? null,
    current_step: (op.lastStep ?? raw.currentSubtask ?? "").slice(0, 200),
    next_step: raw.nextStep ?? raw.nextAction ?? "",
    blocker: raw.blockedReason ?? raw.missingInput ?? handoffText,
    progress: typeof raw.progress === "number" ? raw.progress : 0,
    linked_workflow_id: null,
    linked_campaign_id: null,
    notes: raw.notes ?? "",
    created_at: raw.createdAt ?? new Date().toISOString(),
    updated_at: raw.updatedAt ?? new Date().toISOString(),
    responsible_agent_id: raw.assignedAgentId ?? null,
    last_actor_agent_id: raw.lastActiveAgentId ?? null,
  };
}

// ─── Agent mapper ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAgent(raw: any): Agent {
  return {
    id: raw.key ?? raw.id ?? "",
    name: raw.name ?? raw.key ?? "",
    role: raw.role ?? "",
    status: mapAgentStatus(raw.status),
    capabilities: Array.isArray(raw.integrations) ? raw.integrations.join(", ") : "",
    current_model: raw.model ?? "n/a",
    workload: 0,
    created_at: raw.lastSeen ?? new Date().toISOString(),
    updated_at: raw.lastSeen ?? new Date().toISOString(),
  };
}

// ─── Fetch helpers ─────────────────────────────────────────────────────────

async function apiFetch(path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ─── Quests ────────────────────────────────────────────────────────────────

export async function fetchQuestsFromBackend(): Promise<Quest[]> {
  const data = (await apiFetch("/api/tasks")) as Record<string, unknown>;
  const items = data.items ?? data.quests ?? (Array.isArray(data) ? data : []);
  return (items as object[]).map(mapQuest);
}

// ─── Agents ────────────────────────────────────────────────────────────────

const OPERATIVE_AGENTS: Omit<Agent, "status" | "workload" | "created_at" | "updated_at">[] = [
  { id: "archon",     name: "Archon",      role: "Koordination & Steuerung",  capabilities: "Koordination, Planung, Delegation",                      current_model: "–" },
  { id: "opencode",   name: "OpenCode",    role: "Server Coding Agent",       capabilities: "Code-Generierung, Bug-Fixes, Server-seitige Automatisierung", current_model: "–" },
  { id: "kelthuzad",  name: "Archivarius", role: "Knowledge & Playbooks",     capabilities: "Dokumentation, Playbooks, Wissensmanagement",             current_model: "–" },
  { id: "waechter",   name: "Wächter",     role: "Review & QA",               capabilities: "Code-Review, Testing, Compliance",                        current_model: "–" },
];

export async function fetchAgentsFromBackend(): Promise<Agent[]> {
  // Derive agent activity from quest assignments — no separate /api/dashboard call needed.
  const quests = await fetchQuestsFromBackend();
  const activeIds = new Set(
    quests.filter(q => !["done", "archived"].includes(q.status)).map(q => q.agent_id)
  );
  const now = new Date().toISOString();
  return OPERATIVE_AGENTS.map(a => ({
    ...a,
    status: activeIds.has(a.id) ? ("working" as const) : ("idle" as const),
    workload: 0,
    created_at: now,
    updated_at: now,
  }));
}

// ─── Quest detail ─────────────────────────────────────────────────────────

export async function fetchQuestDetailFromBackend(questId: string): Promise<Quest> {
  const data = (await apiFetch(`/api/tasks/${encodeURIComponent(questId)}`)) as Record<string, unknown>;
  const raw = data.quest ?? data;
  return mapQuest(raw);
}

// ─── Quest detail sub-resources ───────────────────────────────────────────

export async function fetchQuestMessagesFromBackend(questId: string): Promise<unknown[]> {
  const data = (await apiFetch(`/api/tasks/${questId}/messages`)) as Record<string, unknown>;
  return (data.messages ?? (Array.isArray(data) ? data : [])) as unknown[];
}

export async function fetchQuestActivityFromBackend(questId: string): Promise<unknown[]> {
  const data = (await apiFetch(`/api/tasks/${questId}/activity`)) as Record<string, unknown>;
  return (data.events ?? data.items ?? (Array.isArray(data) ? data : [])) as unknown[];
}

export async function fetchQuestArtifactsFromBackend(questId: string): Promise<unknown[]> {
  const data = (await apiFetch(`/api/tasks/${questId}/artifacts`)) as Record<string, unknown>;
  return (data.artifacts ?? (Array.isArray(data) ? data : [])) as unknown[];
}
