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
      // in_review = Pruefung/review lane → operator review required
      if (quest.status === 'in_review') {
        signals.push({
          id: `sig-review-${quest.id}`,
          type: 'approval',
          title: `${quest.title} – Prüfung erforderlich`,
          summary: quest.blocker || 'Quest wartet auf Operator-Review.',
          severity: quest.priority === 'critical' ? 'critical' : 'medium',
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

      // blocked → blocker signal
      if (quest.status === 'blocked') {
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

      // waiting = needs_input lane → agent question
      if (quest.status === 'waiting') {
        signals.push({
          id: `sig-wait-${quest.id}`,
          type: 'agent_question',
          title: `${quest.title} – Entscheidung benötigt`,
          summary: quest.blocker || 'Agent wartet auf Operator-Entscheidung.',
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
