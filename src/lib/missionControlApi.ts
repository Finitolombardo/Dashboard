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
    priority: mapPriority(raw.priority),
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
  // Backend returns: role ("operator"|"agent"|"system"), actorName, messageType, createdAt
  const role = raw.role ?? raw.senderType ?? raw.sender_type ?? "agent";
  const senderType = role === "operator" ? "operator" : role === "system" ? "system" : "agent";
  return {
    id: raw.id ?? String(Math.random()),
    quest_id: questId,
    sender_type: senderType as MessageSenderType,
    sender_name: raw.actorName ?? raw.senderName ?? raw.sender_name ?? raw.actor ?? (senderType === "operator" ? "Operator" : "Agent"),
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
  const items = data.items ?? data.messages ?? (Array.isArray(data) ? data : []);
  return (items as object[]).map(raw => mapMessage(raw, questId));
}

export async function fetchQuestEventsFromBackend(questId: string): Promise<import('../types').Event[]> {
  try {
    const data = (await apiFetch(`/api/tasks/${questId}/activity`)) as Record<string, unknown>;
    const items = data.items ?? (Array.isArray(data) ? data : []);
    return (items as any[]).map(raw => ({
      id: raw.id ?? String(Math.random()),
      quest_id: questId,
      type: raw.eventType ?? raw.type ?? raw.activityType ?? "unknown",
      description: raw.summary ?? raw.label ?? raw.description ?? "",
      actor: raw.actorName ?? raw.actor ?? "System",
      created_at: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function fetchQuestArtifactsFromBackend(questId: string): Promise<Artefact[]> {
  try {
    const data = (await apiFetch(`/api/tasks/${questId}/artifacts`)) as Record<string, unknown>;
    const items = data.items ?? data.artifacts ?? (Array.isArray(data) ? data : []);
    return (items as object[]).map((raw: any) => {
      // Backend returns: { id, type: "local_file"|"notion"|"drive"|"link", label, href, filename, sizeBytes, updatedAt }
      const backendType = raw.type ?? "file";
      const frontendType = backendType === "local_file" ? "file"
        : backendType === "notion" || backendType === "drive" || backendType === "link" ? "link"
        : backendType;
      const href = raw.href ?? raw.url ?? raw.path ?? "";
      return {
        id: raw.id ?? String(Math.random()),
        quest_id: questId,
        title: raw.label ?? raw.title ?? raw.name ?? raw.filename ?? "Artefakt",
        type: frontendType as ArtefactType,
        source: backendType === "notion" ? "Notion" : backendType === "drive" ? "Google Drive" : raw.source ?? "Lokal",
        created_by: raw.createdBy ?? raw.created_by ?? raw.actor ?? "System",
        url: backendType === "local_file" && href.startsWith("/api/")
          ? `${API_BASE_URL}${href}`
          : href,
        created_at: raw.updatedAt ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
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

// ─── Operator intent parsing ──────────────────────────────────────────────

export type OperatorIntent =
  | { type: 'create_quest'; title: string }
  | { type: 'start_quest' }
  | { type: 'close_quest' }
  | { type: 'delete_quest' }
  | { type: 'pause_quest' }
  | { type: 'resume_quest' }
  | { type: 'archive_quest' }
  | { type: 'restart_quest' }
  | { type: 'delegate'; agent: string }
  | { type: 'message' };

export function parseOperatorIntent(content: string): OperatorIntent {
  const lower = content.trim().toLowerCase();

  // Close/Complete quest
  if (/(?:schlie[sß]|beende|abschlie[sß]|fertig|close|complete).*quest/i.test(lower)
      || /quest.*(?:schlie[sß]|beende|abschlie[sß]|fertig|close|complete)/i.test(lower)) {
    return { type: 'close_quest' };
  }

  // Delete quest
  if (/(?:l[oö]sch|entfern|delete|remove).*quest/i.test(lower)
      || /quest.*(?:l[oö]sch|entfern|delete|remove)/i.test(lower)) {
    return { type: 'delete_quest' };
  }

  // Pause quest
  if (/(?:pausier|halt|stopp|pause).*quest/i.test(lower)
      || /quest.*(?:pausier|halt|stopp|pause)/i.test(lower)) {
    return { type: 'pause_quest' };
  }

  // Resume quest
  if (/(?:fortsetze|weitermach|resume|fortfahr).*quest/i.test(lower)
      || /quest.*(?:fortsetze|weitermach|resume|fortfahr)/i.test(lower)) {
    return { type: 'resume_quest' };
  }

  // Archive quest
  if (/(?:archivier|archive).*quest/i.test(lower)
      || /quest.*(?:archivier|archive)/i.test(lower)) {
    return { type: 'archive_quest' };
  }

  // Restart quest
  if (/(?:neustart|restart|neu\s+starten).*quest/i.test(lower)
      || /quest.*(?:neustart|restart|neu\s+starten)/i.test(lower)) {
    return { type: 'restart_quest' };
  }

  // Create quest (must come AFTER close/delete/pause etc. to avoid false matches)
  if (/(?:erstell|neue[srn]?\s+quest|mach.*quest)/i.test(lower) && /quest/i.test(lower)) {
    const trimmed = content.trim();
    const nameMatch = trimmed.match(/(?:namens|namen)\s+["']?(.+?)["']?\s*$/i);
    if (nameMatch) return { type: 'create_quest', title: nameMatch[1].trim() };
    const afterQuest = trimmed.match(/quest\s+["']?([A-Z\u00C0-\u024F].+?)["']?\s*$/i);
    if (afterQuest) return { type: 'create_quest', title: afterQuest[1].trim() };
    const fallback = trimmed.match(/quest\s+(.+?)\s*$/i);
    if (fallback) return { type: 'create_quest', title: fallback[1].trim() };
  }

  // Start quest
  if (/(?:starte?\s+(?:die\s+)?quest|quest\s+starten)/i.test(lower)) {
    return { type: 'start_quest' };
  }

  // Delegate
  const delegateMatch = content.trim().match(
    /(?:delegiere?\s+an|weise\s+(?:an\s+)?|zuweisen\s+an?)\s*["']?(\w+)["']?\s*$/i
  );
  if (delegateMatch) return { type: 'delegate', agent: delegateMatch[1].trim().toLowerCase() };

  return { type: 'message' };
}

// Execute an operator intent and return a system message for the quest thread
export async function executeOperatorIntent(
  intent: OperatorIntent,
  questId: string,
): Promise<{ systemMessage: string; newQuestId?: string; deleted?: boolean }> {
  switch (intent.type) {
    case 'create_quest': {
      const newQuest = await createQuestFromIntake({ title: intent.title });
      return {
        systemMessage: `Neue Quest "${intent.title}" erstellt (ID: ${newQuest.id}).`,
        newQuestId: newQuest.id,
      };
    }
    case 'start_quest': {
      const updated = await applyQuestAction(questId, 'start');
      return { systemMessage: `Quest gestartet. Status: ${updated.status}` };
    }
    case 'close_quest': {
      const updated = await applyQuestAction(questId, 'complete');
      return { systemMessage: `Quest abgeschlossen. Status: ${updated.status}` };
    }
    case 'delete_quest': {
      await deleteQuest(questId);
      return { systemMessage: `Quest gelöscht.`, deleted: true };
    }
    case 'pause_quest': {
      const updated = await applyQuestAction(questId, 'pause');
      return { systemMessage: `Quest pausiert. Status: ${updated.status}` };
    }
    case 'resume_quest': {
      const updated = await applyQuestAction(questId, 'resume');
      return { systemMessage: `Quest fortgesetzt. Status: ${updated.status}` };
    }
    case 'archive_quest': {
      const updated = await applyQuestAction(questId, 'archive');
      return { systemMessage: `Quest archiviert. Status: ${updated.status}` };
    }
    case 'restart_quest': {
      const updated = await applyQuestAction(questId, 'restart');
      return { systemMessage: `Quest neu gestartet. Status: ${updated.status}` };
    }
    case 'delegate': {
      const agentMap: Record<string, string> = {
        archon: 'archon', opencode: 'opencode', archivarius: 'kelthuzad',
        kelthuzad: 'kelthuzad', waechter: 'waechter', wächter: 'waechter',
      };
      const agentId = agentMap[intent.agent] ?? intent.agent;
      const body = { questId, action: 'delegate_agent', delegatedAgentId: agentId };
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Delegation failed: ${res.status}`);
      return { systemMessage: `Quest an ${intent.agent} delegiert.` };
    }
    default:
      return { systemMessage: '' };
  }
}

// Delete a quest: try real delete first, fall back to archive if not deployed yet
export async function deleteQuest(questId: string): Promise<void> {
  // Try real delete action first
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questId, action: "delete" }),
  });
  if (res.ok) return;
  // Fallback: archive (functionally removes from active views)
  const archiveRes = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questId, action: "archive" }),
  });
  if (!archiveRes.ok) throw new Error(`Archive fallback failed: ${archiveRes.status}`);
}

// Quest creation: build structured draft → create-from-draft → auto-assign OpenCode
export async function createQuestFromIntake(opts: {
  title: string;
  briefing?: string;
  priority?: string;
}): Promise<Quest> {
  const title = opts.title.trim();
  const briefing = opts.briefing?.trim() || "";
  const priorityMap: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
  const priority = priorityMap[opts.priority ?? "medium"] ?? 3;

  const draft = {
    id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    goal: briefing || title,
    rationale: briefing || "Quest aus Mission Control UI erstellt.",
    priority,
    assignedAgentId: "opencode",
    assignedRole: "Server Coding Agent",
    nextAction: "Briefing lesen und Quest bearbeiten.",
    subtasks: [],
    parentQuestId: undefined,
    relatedQuestIds: [],
    sourceType: "manual",
    sourceContextSummary: briefing,
    ambiguityFlags: [],
    createdAt: new Date().toISOString(),
  };

  const createRes = await fetch(`${API_BASE_URL}/api/tasks/create-from-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft, confirmCreate: true, delegateAgentId: "opencode" }),
  });
  if (!createRes.ok) throw new Error(`POST /api/tasks/create-from-draft: ${createRes.status}`);
  const createData = (await createRes.json()) as Record<string, unknown>;
  const questRaw = (createData.quest ?? createData) as Record<string, unknown>;
  const questId = questRaw.id as string;

  // Auto-activate: approve → start → quest is "In Arbeit" (Aktiv)
  await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questId, action: "approve" }),
  }).catch(() => {});
  const startRes = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questId, action: "start" }),
  });
  if (startRes.ok) {
    const startData = (await startRes.json()) as Record<string, unknown>;
    const started = startData.quest ?? questRaw;
    return mapQuest(started);
  }
  return mapQuest(questRaw);
}
