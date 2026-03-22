import { API_BASE_URL } from "./config";
import type { Quest, Agent, Priority, QuestStatus, AgentStatus, Message, Artefact, MessageSenderType, ArtefactType } from "../types";

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
    notes: raw.lastResultExcerpt ?? raw.notes ?? "",
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

// ─── Agent lookup ─────────────────────────────────────────────────────────

export function getAgentById(id: string | null | undefined): Agent | undefined {
  if (!id) return undefined;
  const a = OPERATIVE_AGENTS.find(x => x.id === id);
  if (!a) return undefined;
  const now = new Date().toISOString();
  return { ...a, status: "idle", workload: 0, created_at: now, updated_at: now };
}

// ─── Quest status update ──────────────────────────────────────────────────

export async function updateQuestStatus(questId: string, backendStatus: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${encodeURIComponent(questId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: backendStatus }),
  });
  if (!res.ok) throw new Error(`PATCH /api/tasks/${questId}: ${res.status}`);
}

// ─── Quest detail sub-resources ───────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(raw: any, questId: string): Message {
  return {
    id: raw.id ?? String(Math.random()),
    quest_id: questId,
    sender_type: (raw.senderType ?? raw.sender_type ?? "agent") as MessageSenderType,
    sender_name: raw.senderName ?? raw.sender_name ?? raw.actor ?? "Agent",
    content: raw.content ?? raw.text ?? raw.message ?? "",
    message_type: (raw.messageType ?? raw.message_type ?? raw.type ?? "message") as Message["message_type"],
    created_at: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArtefact(raw: any, questId: string): Artefact {
  return {
    id: raw.id ?? String(Math.random()),
    quest_id: questId,
    title: raw.title ?? raw.name ?? raw.filename ?? "Artefakt",
    type: (raw.type ?? "file") as ArtefactType,
    source: raw.source ?? "",
    created_by: raw.createdBy ?? raw.created_by ?? raw.actor ?? "Agent",
    url: raw.url ?? raw.path ?? "",
    created_at: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

export async function fetchQuestMessagesFromBackend(questId: string): Promise<Message[]> {
  const data = (await apiFetch(`/api/tasks/${questId}/messages`)) as Record<string, unknown>;
  const items = data.messages ?? (Array.isArray(data) ? data : []);
  return (items as object[]).map(raw => mapMessage(raw, questId));
}

export async function fetchQuestArtifactsFromBackend(questId: string): Promise<Artefact[]> {
  const data = (await apiFetch(`/api/tasks/${questId}/artifacts`)) as Record<string, unknown>;
  const items = data.artifacts ?? (Array.isArray(data) ? data : []);
  return (items as object[]).map(raw => mapArtefact(raw, questId));
}

export async function sendQuestMessage(questId: string, content: string): Promise<Message> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${encodeURIComponent(questId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Backend expects: role ("operator"|"agent"|"system"), messageType ("instruction"|"question"|...), content
    body: JSON.stringify({ content, role: "operator", messageType: "instruction", actorName: "Operator" }),
  });
  const now = new Date().toISOString();
  if (res.ok) {
    const raw = (await res.json()) as Record<string, unknown>;
    // Backend wraps in { ok: true, message: {...} }
    const msgRaw = (raw.message ?? raw) as Record<string, unknown>;
    return mapMessage(msgRaw, questId);
  }
  return {
    id: `local-${Date.now()}`,
    quest_id: questId,
    sender_type: "operator",
    sender_name: "Operator",
    content,
    message_type: "message",
    created_at: now,
  };
}

// Trigger agent dispatch for a quest (best-effort, no auth required when QUEST_DISPATCH_SECRET not set)
export async function dispatchQuest(questId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/quests/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "dispatch", questIds: [questId], force: true, mode: "manual" }),
  }).catch(() => {});
}

// Call a quest lifecycle action via POST /api/tasks
export async function applyQuestAction(questId: string, action: string, reviewNote?: string): Promise<Quest> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = { questId, action };
  if (reviewNote) body.reviewNote = reviewNote;
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST /api/tasks (${action}): ${res.status}`);
  const data = (await res.json()) as Record<string, unknown>;
  const raw = data.quest ?? data;
  return mapQuest(raw);
}

// Quest creation: build structured draft, send to create-from-draft (matches live server API)
export async function createQuestFromIntake(opts: {
  title: string;
  goal?: string;
  scope?: string;
  priority?: string;
}): Promise<Quest> {
  const title = opts.title.trim();
  const goal = opts.goal?.trim() || title;
  const scope = opts.scope?.trim() || "";
  const priorityMap: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
  const priority = priorityMap[opts.priority ?? "medium"] ?? 3;

  const draft = {
    id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    goal,
    rationale: scope || "Quest aus Mission Control UI erstellt.",
    priority,
    assignedAgentId: "archon",
    assignedRole: "Koordination",
    nextAction: "Scope prüfen und Quest starten.",
    subtasks: [],
    parentQuestId: undefined,
    relatedQuestIds: [],
    sourceType: "manual",
    sourceContextSummary: scope,
    ambiguityFlags: [],
    createdAt: new Date().toISOString(),
  };

  const createRes = await fetch(`${API_BASE_URL}/api/tasks/create-from-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft, confirmCreate: true, delegateAgentId: "archon" }),
  });
  if (!createRes.ok) throw new Error(`POST /api/tasks/create-from-draft: ${createRes.status}`);
  const createData = (await createRes.json()) as Record<string, unknown>;
  const raw = createData.quest ?? createData;
  return mapQuest(raw);
}
