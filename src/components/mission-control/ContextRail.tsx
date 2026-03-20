import { useNavigate } from 'react-router-dom';
import type { Signal } from '../../types';
import { getQuestById, getAgentById, getWorkflowById, getCampaignById, getSessionById } from '../../data/mock';
import AgentChip from '../shared/AgentChip';
import StatusBadge from '../shared/StatusBadge';
import TimeAgo from '../shared/TimeAgo';
import {
  Plus,
  MonitorPlay,
  RotateCcw,
  Archive,
  FileText,
  Link as LinkIcon,
  Crosshair,
  CheckCircle2,
  ArrowRight,
  Workflow,
  Megaphone,
  ArrowUpRight,
  XCircle,
  MessageSquare,
} from 'lucide-react';

interface ContextRailProps {
  signal: Signal | null;
}

export default function ContextRail({ signal }: ContextRailProps) {
  const navigate = useNavigate();

  if (!signal) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-surface-700/30">
          <h3 className="section-label">Kontext</h3>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-2xs text-surface-600 text-center">Kein Element ausgewählt</p>
        </div>
      </div>
    );
  }

  const quest = signal.linked_quest_id ? getQuestById(signal.linked_quest_id) : undefined;
  const agent = quest?.agent_id ? getAgentById(quest.agent_id) : undefined;
  const workflow = signal.linked_workflow_id ? getWorkflowById(signal.linked_workflow_id) : undefined;
  const campaign = signal.linked_campaign_id ? getCampaignById(signal.linked_campaign_id) : undefined;
  const session = signal.linked_session_id ? getSessionById(signal.linked_session_id) : undefined;

  const actions = getContextualActions(signal, quest, workflow, campaign, session, navigate);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-surface-700/30">
        <h3 className="section-label">Kontext</h3>
      </div>

      <div className="flex-1 px-3 py-3 space-y-4">
        {agent && (
          <RailSection title="Zuständig">
            <div className="flex items-center gap-2 mb-1">
              <AgentChip agent={agent} size="md" />
            </div>
            <p className="text-2xs text-surface-500 mt-1">{agent.role}</p>
            <div className="flex items-center gap-1 mt-1 text-2xs text-surface-500">
              <span className="font-mono text-surface-400">{agent.current_model}</span>
              <span className="text-surface-600">|</span>
              <StatusBadge status={agent.status} />
            </div>
          </RailSection>
        )}

        {(quest || workflow || campaign || session) && (
          <RailSection title="Operativer Bezug">
            <div className="space-y-2">
              {quest && (
                <RailLink
                  icon={Crosshair}
                  label="Quest"
                  value={quest.title}
                  onClick={() => navigate(`/quests/${quest.id}`)}
                />
              )}
              {workflow && (
                <RailLink
                  icon={Workflow}
                  label="Workflow"
                  value={workflow.name}
                  onClick={() => navigate('/systems')}
                />
              )}
              {campaign && (
                <RailLink
                  icon={Megaphone}
                  label="Kampagne"
                  value={campaign.name}
                  onClick={() => navigate('/campaigns')}
                />
              )}
              {session && (
                <RailLink
                  icon={MonitorPlay}
                  label="Sitzung"
                  value={session.name}
                  onClick={() => navigate(`/sessions/${session.id}`)}
                />
              )}
            </div>
          </RailSection>
        )}

        {quest && (quest.current_step || quest.next_step || quest.blocker) && (
          <RailSection title="Quest-Status">
            {quest.current_step && (
              <div className="mb-1.5">
                <span className="text-2xs text-surface-500 block">Aktueller Schritt</span>
                <p className="text-xs text-surface-300 leading-snug">{quest.current_step}</p>
              </div>
            )}
            {quest.next_step && (
              <div className="mb-1.5">
                <span className="text-2xs text-surface-500 block">Nächster Schritt</span>
                <p className="text-xs text-surface-300 leading-snug">{quest.next_step}</p>
              </div>
            )}
            {quest.blocker && (
              <div>
                <span className="text-2xs text-danger-400 block">Blocker</span>
                <p className="text-xs text-danger-300 leading-snug">{quest.blocker}</p>
              </div>
            )}
          </RailSection>
        )}

        <RailSection title="Kontext">
          <div className="space-y-1.5">
            <DocLink label="Outreach Playbook" />
            <DocLink label="Kampagnen-Strategie Q1" />
            {quest && <DocLink label="Agent-Onboarding" />}
          </div>
          <div className="flex justify-between text-2xs mt-3 pt-2 border-t border-surface-700/20">
            <span className="text-surface-500">Erstellt</span>
            <TimeAgo date={signal.created_at} />
          </div>
          <div className="flex justify-between text-2xs mt-1">
            <span className="text-surface-500">Quelle</span>
            <span className="text-surface-400">{signal.source || 'System'}</span>
          </div>
        </RailSection>

        {actions.length > 0 && (
          <div className="pt-2 border-t border-surface-700/20">
            <p className="section-label mb-2 px-1">Schnellaktionen</p>
            <div className="space-y-0.5">
              {actions.map((action, i) => (
                <QuickAction key={i} icon={action.icon} label={action.label} onClick={action.onClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-3 border-b border-surface-700/20 last:border-0">
      <p className="section-label mb-2">{title}</p>
      {children}
    </div>
  );
}

function RailLink({ icon: Icon, label, value, onClick }: { icon: React.ElementType; label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-2 w-full text-left group hover:bg-surface-800/40 px-1.5 py-1 rounded transition-colors -mx-1.5"
    >
      <Icon size={11} className="text-surface-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-2xs text-surface-500">{label}</p>
        <p className="text-xs text-surface-300 truncate group-hover:text-gold-400 transition-colors">{value}</p>
      </div>
      <ArrowUpRight size={10} className="text-surface-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}

function DocLink({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1.5 text-2xs text-surface-400 hover:text-gold-400 transition-colors w-full">
      <LinkIcon size={10} className="text-surface-500 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full text-xs text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 px-2 py-1.5 rounded transition-colors"
    >
      <Icon size={12} className="flex-shrink-0" />
      {label}
    </button>
  );
}

interface ActionItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

function getContextualActions(
  signal: Signal,
  quest: ReturnType<typeof getQuestById>,
  workflow: ReturnType<typeof getWorkflowById>,
  campaign: ReturnType<typeof getCampaignById>,
  session: ReturnType<typeof getSessionById>,
  navigate: ReturnType<typeof useNavigate>,
): ActionItem[] {
  const actions: ActionItem[] = [];

  if (signal.type === 'approval') {
    actions.push({ icon: CheckCircle2, label: 'Freigeben' });
    actions.push({ icon: XCircle, label: 'Änderungen anfordern' });
  }

  if (signal.type === 'agent_question') {
    actions.push({ icon: MessageSquare, label: 'Antworten', onClick: () => quest && navigate(`/quests/${quest.id}`) });
  }

  if (signal.type === 'failed_execution') {
    actions.push({ icon: RotateCcw, label: 'Erneut ausführen' });
    actions.push({ icon: Crosshair, label: 'Debug-Quest erstellen' });
  }

  if (signal.type === 'blocker') {
    actions.push({ icon: CheckCircle2, label: 'Blocker auflösen' });
  }

  if (quest) {
    actions.push({ icon: ArrowRight, label: 'Zur Quest', onClick: () => navigate(`/quests/${quest.id}`) });
  }

  if (workflow) {
    actions.push({ icon: Workflow, label: 'Zum Workflow', onClick: () => navigate('/systems') });
  }

  if (session) {
    actions.push({ icon: MonitorPlay, label: 'Sitzung öffnen', onClick: () => navigate(`/sessions/${session.id}`) });
  }

  if (campaign) {
    actions.push({ icon: Megaphone, label: 'Kampagne ansehen', onClick: () => navigate('/campaigns') });
  }

  if (['proposed_quest', 'failed_execution', 'stuck_session', 'campaign_underperformance'].includes(signal.type)) {
    actions.push({ icon: Plus, label: 'Quest erstellen', onClick: () => navigate('/quests') });
  }

  if (signal.type !== 'proposed_quest') {
    actions.push({ icon: FileText, label: 'Artefakte ansehen' });
  }

  actions.push({ icon: Archive, label: 'Archivieren' });

  return actions;
}
