import { useMemo } from 'react';
import type { Signal, Quest } from '../types';

/**
 * Derive actionable signals from real quest operational states.
 * No mock data – only real quests from the backend.
 */
export function useSignals(quests: Quest[]): Signal[] {
  return useMemo(() => {
    const signals: Signal[] = [];

    for (const quest of quests) {
      const op = (quest as unknown as Record<string, unknown>).operationalState as
        | Record<string, unknown>
        | undefined;

      const opStatus = (op?.status as string | undefined) ?? '';
      const waitMinutes = (quest as unknown as Record<string, unknown>).waitMinutes as
        | number
        | undefined;

      // Review required
      if (opStatus === 'review_required') {
        signals.push({
          id: `sig-review-${quest.id}`,
          type: 'approval',
          title: `${quest.title} – Prüfung erforderlich`,
          summary:
            (op?.humanActionRequired as string | undefined) ??
            'Quest wartet auf Operator-Review.',
          severity: waitMinutes && waitMinutes > 120 ? 'high' : 'medium',
          status: 'open',
          source: (quest.agent_id ?? 'System'),
          linked_quest_id: quest.id,
          linked_workflow_id: null,
          linked_session_id: null,
          linked_campaign_id: null,
          created_at: quest.updated_at,
        });
        continue;
      }

      // Blocked
      if (quest.status === 'blocked' || opStatus === 'blocked') {
        signals.push({
          id: `sig-block-${quest.id}`,
          type: 'blocker',
          title: `${quest.title} – Blockiert`,
          summary: quest.blocker || 'Quest ist blockiert.',
          severity: 'high',
          status: 'open',
          source: quest.agent_id ?? 'System',
          linked_quest_id: quest.id,
          linked_workflow_id: null,
          linked_session_id: null,
          linked_campaign_id: null,
          created_at: quest.updated_at,
        });
        continue;
      }

      // Approval / manual required
      if (opStatus === 'approval_required' || opStatus === 'manual_required') {
        signals.push({
          id: `sig-approval-${quest.id}`,
          type: 'agent_question',
          title: `${quest.title} – Entscheidung benötigt`,
          summary:
            (op?.humanActionRequired as string | undefined) ??
            'Agent wartet auf Operator-Entscheidung.',
          severity: 'medium',
          status: 'open',
          source: quest.agent_id ?? 'System',
          linked_quest_id: quest.id,
          linked_workflow_id: null,
          linked_session_id: null,
          linked_campaign_id: null,
          created_at: quest.updated_at,
        });
      }
    }

    return signals;
  }, [quests]);
}
