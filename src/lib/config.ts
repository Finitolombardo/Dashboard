/**
 * System URL-Zuordnung (verbindlich)
 *
 * Frontend / UI:        https://mission-control-ai-o-ywsj.bolt.host  (diese App)
 * Operative Runtime:    https://tasks.getvoidra.com                   (Backend / Quest-SoT)
 * Quest-Ansicht:        https://tasks.getvoidra.com/tasks             (Runtime-UI, kein Frontend)
 * Agent-Chat:           https://agent.getvoidra.com/chat?session=...
 * Legacy (eingefroren): https://mc.getvoidra.com                      -- NICHT nutzen
 */

/** Operative Runtime / Backend / Quest-SoT */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://tasks.getvoidra.com";

/** Dieses Frontend */
export const FRONTEND_URL = "https://mission-control-ai-o-ywsj.bolt.host";

/** OpenClaw Agent-Chat */
export const AGENT_CHAT_URL =
  "https://agent.getvoidra.com/chat?session=agent%3Amain%3Amain";

/** Runtime-Quest-Ansicht (kein Frontend-Ersatz, nur Direktzugang zur Runtime-UI) */
export const RUNTIME_TASKS_URL = `${API_BASE_URL}/tasks`;

/** Legacy -- eingefroren, nicht mehr als aktives System verwenden */
export const LEGACY_URL = "https://mc.getvoidra.com";
