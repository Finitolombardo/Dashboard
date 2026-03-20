import { FileText, Link as LinkIcon, BookOpen, Brain, Workflow, MonitorPlay, Megaphone, ExternalLink } from 'lucide-react';
import type { Quest } from '../../types';
import { getWorkflowById, getCampaignById } from '../../data/mock';

interface QuestContextProps {
  quest: Quest;
}

export default function QuestContext({ quest }: QuestContextProps) {
  const workflow = getWorkflowById(quest.linked_workflow_id);
  const campaign = getCampaignById(quest.linked_campaign_id);

  return (
    <div className="h-full overflow-y-auto px-6 py-4 space-y-4">
      {quest.scope && (
        <ContextSection title="Briefing" icon={FileText}>
          <p className="text-sm text-surface-300 leading-relaxed">{quest.scope}</p>
        </ContextSection>
      )}

      <ContextSection title="Verknuepfte Notion-Dokumente" icon={LinkIcon}>
        <div className="space-y-2">
          <DocItem title="Outreach Playbook DACH" type="Playbook" />
          <DocItem title="Kampagnen-Strategie Q1 2025" type="Strategie" />
          <DocItem title="Agent Onboarding Guide" type="Onboarding" />
        </div>
      </ContextSection>

      {workflow && (
        <ContextSection title="Verknuepfter Workflow" icon={Workflow}>
          <div className="card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-200">{workflow.name}</p>
                <p className="text-2xs text-surface-500 mt-0.5">Status: {workflow.status} | Gesundheit: {workflow.execution_health}</p>
              </div>
              <button className="text-surface-500 hover:text-accent-400 transition-colors">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </ContextSection>
      )}

      {campaign && (
        <ContextSection title="Verknuepfte Kampagne" icon={Megaphone}>
          <div className="card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-200">{campaign.name}</p>
                <p className="text-2xs text-surface-500 mt-0.5">{campaign.platform} | {campaign.sent} gesendet</p>
              </div>
              <button className="text-surface-500 hover:text-accent-400 transition-colors">
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
          <div className="text-xs text-surface-400 bg-surface-800/50 px-3 py-2 rounded">
            <p>Fruehere Kampagnen im DACH-Markt zeigten bessere Performance mit personalisiertem Einstieg.</p>
          </div>
          <div className="text-xs text-surface-400 bg-surface-800/50 px-3 py-2 rounded">
            <p>Betreffzeilen mit Zahlen haben 12% hoehere Open-Rate.</p>
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

function ContextSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
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
    <button className="flex items-center gap-2 w-full text-left px-3 py-2 bg-surface-800/50 hover:bg-surface-800 rounded transition-colors">
      <LinkIcon size={12} className="text-surface-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-300 truncate">{title}</p>
        <p className="text-2xs text-surface-600">{type}</p>
      </div>
      <ExternalLink size={12} className="text-surface-600" />
    </button>
  );
}
