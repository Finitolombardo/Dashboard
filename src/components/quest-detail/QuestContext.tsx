import type { ElementType, ReactNode } from 'react';
import { FileText, Link as LinkIcon, BookOpen, Brain, Workflow, Megaphone, ExternalLink, Shield } from 'lucide-react';
import type { Quest } from '../../types';
import { getWorkflowById, getCampaignById, getAgentById } from '../../data/mock';
import DecisionTracePanel from '../shared/DecisionTracePanel';
import AgentResponsibilityCard from '../shared/AgentResponsibilityCard';
import { pickDecisionTrace } from '../../lib/decisionTrace';

interface QuestContextProps {
  quest: Quest;
}

export default function QuestContext({ quest }: QuestContextProps) {
  const workflow = getWorkflowById(quest.linked_workflow_id);
  const campaign = getCampaignById(quest.linked_campaign_id);
  const trace = pickDecisionTrace(quest.decision_trace);
  const responsibleAgent = getAgentById(quest.responsible_agent_id ?? quest.agent_id);
  const lastActorAgent = getAgentById(quest.last_actor_agent_id ?? trace?.actor_agent_id ?? null);

  return (
    <div className="h-full overflow-y-auto px-6 py-4 space-y-4">
      {quest.scope && (
        <ContextSection title="Briefing" icon={FileText}>
          <p className="text-sm text-surface-300 leading-relaxed">{quest.scope}</p>
        </ContextSection>
      )}

      <ContextSection title="Entscheidungsgrundlage" icon={Shield}>
        <DecisionTracePanel trace={trace} />
      </ContextSection>

      <ContextSection title="Agentenverantwortung" icon={Brain}>
        <AgentResponsibilityCard
          responsibleAgent={responsibleAgent}
          lastActorAgent={lastActorAgent}
          actorChannel={trace?.actor_channel ?? null}
          platformAdapter={trace?.platform_adapter ?? null}
        />
      </ContextSection>

      <ContextSection title="Verknüpfte Dokumente" icon={LinkIcon}>
        <div className="space-y-2">
          <DocItem title={trace?.playbook_name ?? 'Playbook noch nicht verfügbar'} type={trace?.playbook_id ?? 'Playbook'} />
          <DocItem title={trace?.rule_name ?? 'Regel noch nicht verfügbar'} type={trace?.rule_id ?? 'Regel'} />
          <DocItem title={trace?.source_of_truth_label ?? 'Source of Truth noch nicht verfügbar'} type={trace?.source_of_truth_type ?? 'SoT'} />
        </div>
      </ContextSection>

      {workflow && (
        <ContextSection title="Verknüpfter Workflow" icon={Workflow}>
          <div className="card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-200">{workflow.name}</p>
                <p className="text-2xs text-surface-500 mt-0.5">Status: {workflow.status} | Gesundheit: {workflow.execution_health}</p>
              </div>
              <button className="text-surface-500 hover:text-gold-400 transition-colors">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </ContextSection>
      )}

      {campaign && (
        <ContextSection title="Verknüpfte Kampagne" icon={Megaphone}>
          <div className="card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-200">{campaign.name}</p>
                <p className="text-2xs text-surface-500 mt-0.5">{campaign.platform} | {campaign.sent} gesendet</p>
              </div>
              <button className="text-surface-500 hover:text-gold-400 transition-colors">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </ContextSection>
      )}

      <ContextSection title="Referenzen" icon={BookOpen}>
        <div className="space-y-2">
          <DocItem title="E-Mail-Best-Practices" type="Referenz" />
          <DocItem title="Branchenanalyse DACH 2025" type="Research" />
        </div>
      </ContextSection>

      <ContextSection title="Memory" icon={Brain}>
        <div className="space-y-2">
          <div className="text-xs text-surface-400 bg-surface-900/50 px-3 py-2 rounded">
            <p>Frühere Kampagnen im DACH-Markt zeigten bessere Performance mit personalisiertem Einstieg.</p>
          </div>
          <div className="text-xs text-surface-400 bg-surface-900/50 px-3 py-2 rounded">
            <p>Betreffzeilen mit Zahlen haben 12% höhere Open-Rate.</p>
          </div>
        </div>
      </ContextSection>

      {quest.notes && (
        <ContextSection title="Notizen" icon={FileText}>
          <p className="text-sm text-surface-400">{quest.notes}</p>
        </ContextSection>
      )}
    </div>
  );
}

function ContextSection({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-surface-500" />
        <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DocItem({ title, type }: { title: string; type: string }) {
  return (
    <button className="flex items-center gap-2 w-full text-left px-3 py-2 bg-surface-900/50 hover:bg-surface-900/60 rounded transition-colors">
      <LinkIcon size={12} className="text-surface-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-300 truncate">{title}</p>
        <p className="text-2xs text-surface-600">{type}</p>
      </div>
      <ExternalLink size={12} className="text-surface-600" />
    </button>
  );
}
