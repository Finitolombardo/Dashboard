/**
 * System URL-Zuordnung (verbindlich)
 *
 * Frontend / UI:        https://mission-control-ai-o-ywsj.bolt.host  (diese App = Haupt-Dashboard)
 * Backend / API:        https://tasks.getvoidra.com                   (Quest-SoT, kein Dashboard)
 * Quest-Ansicht:        https://tasks.getvoidra.com/tasks             (Backend-Ansicht, kein Frontend)
 * Agent-Chat:           https://agent.getvoidra.com/chat?session=...
 * Legacy (eingefroren): https://mc.getvoidra.com                      -- NICHT nutzen
 */

/** Backend / API / Quest-SoT (kein Dashboard -- nur Datenquelle) */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://tasks.getvoidra.com";

/** Dieses Frontend = das Haupt-Dashboard */
export const FRONTEND_URL = "https://mission-control-ai-o-ywsj.bolt.host";

/** OpenClaw Agent-Chat */
export const AGENT_CHAT_URL =
  "https://agent.getvoidra.com/chat?session=agent%3Amain%3Amain";

/** Backend-Quest-Ansicht (kein Frontend-Ersatz, nur Direktzugang zur Backend-UI) */
export const RUNTIME_TASKS_URL = `${API_BASE_URL}/tasks`;

/** Legacy -- eingefroren, nicht mehr als aktives System verwenden */
export const LEGACY_URL = "https://mc.getvoidra.com";
