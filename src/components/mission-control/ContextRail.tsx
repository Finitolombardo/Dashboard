import type { ReactNode, ElementType } from 'react';
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
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 px-4 py-4">
          <p className="section-label mb-1">Kontext</p>
          <h3 className="text-sm font-semibold text-surface-100">Keine Auswahl</h3>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="rounded-full border border-white/5 bg-surface-900/60 px-3 py-1.5 text-center text-2xs text-surface-500">
            Kein Element ausgewählt
          </p>
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
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-white/5 px-4 py-4">
        <p className="section-label mb-1">Kontext</p>
        <h3 className="text-sm font-semibold text-surface-100">Operativer Randkontext</h3>
        <p className="mt-1 text-2xs leading-relaxed text-surface-500">
          Zuständigkeit, Bezug, Status und direkte nächste Schritte in einer ruhigen Seitenleiste.
        </p>
      </div>

      <div className="flex-1 space-y-4 px-4 py-4">
        {agent && (
          <RailSection title="Zuständig" subtitle="Welcher Agent trägt die operative Verantwortung?">
            <div className="space-y-2">
              <AgentChip agent={agent} size="md" />
              <div className="flex items-center gap-1.5 text-2xs text-surface-500">
                <span className="truncate">{agent.role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-2xs text-surface-500">
                <span className="font-mono text-surface-400">{agent.current_model}</span>
                <span className="text-surface-600">|</span>
                <StatusBadge status={agent.status} />
              </div>
            </div>
          </RailSection>
        )}

        {(quest || workflow || campaign || session) && (
          <RailSection title="Operativer Bezug" subtitle="Direkte Verknüpfungen zum Signal">
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
          <RailSection title="Quest-Status" subtitle="Was läuft gerade, was kommt als Nächstes?">
            <div className="space-y-2">
              {quest.current_step && (
                <RailDetail label="Aktueller Schritt" value={quest.current_step} />
              )}
              {quest.next_step && <RailDetail label="Nächster Schritt" value={quest.next_step} />}
              {quest.blocker && (
                <RailDetail label="Blocker" value={quest.blocker} danger />
              )}
            </div>
          </RailSection>
        )}

        <RailSection title="Kontext" subtitle="Verweise und Meta-Informationen zum Signal">
          <div className="space-y-1.5">
            <DocLink label="Outreach Playbook" />
            <DocLink label="Kampagnen-Strategie Q1" />
            {quest && <DocLink label="Agent-Onboarding" />}
          </div>

          <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-2xs">
            <MetaRow label="Erstellt" value={<TimeAgo date={signal.created_at} />} />
            <MetaRow label="Quelle" value={<span className="text-surface-400">{signal.source || 'System'}</span>} />
          </div>
        </RailSection>

        {actions.length > 0 && (
          <RailSection title="Schnellaktionen" subtitle="Kontextsensitiv gewichtet">
            <div className="space-y-1.5">
              {actions.map((action, index) => (
                <QuickAction
                  key={`${action.label}-${index}`}
                  icon={action.icon}
                  label={action.label}
                  onClick={action.onClick}
                  variant={action.variant}
                />
              ))}
            </div>
          </RailSection>
        )}
      </div>
    </div>
  );
}

function RailSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/5 bg-surface-900/55 p-3 shadow-[0_14px_26px_rgba(0,0,0,0.14)]">
      <div className="mb-3">
        <p className="section-label mb-1">{title}</p>
        {subtitle && <p className="text-2xs leading-relaxed text-surface-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function RailLink({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: ElementType;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-2 rounded-xl border border-white/5 bg-surface-900/60 px-2.5 py-2 text-left transition-all duration-200 hover:border-white/10 hover:bg-surface-850/80"
    >
      <Icon size={11} className="mt-0.5 flex-shrink-0 text-surface-500" />
      <div className="min-w-0 flex-1">
        <p className="text-2xs text-surface-500">{label}</p>
        <p className="truncate text-xs text-surface-300 transition-colors group-hover:text-gold-300">{value}</p>
      </div>
      <ArrowUpRight size={10} className="mt-0.5 flex-shrink-0 text-surface-600 opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function DocLink({ label }: { label: string }) {
  return (
    <button className="flex w-full items-center gap-1.5 rounded-lg border border-white/5 bg-surface-900/40 px-2 py-1.5 text-left text-2xs text-surface-400 transition-colors hover:border-white/10 hover:bg-surface-850/60 hover:text-gold-300">
      <LinkIcon size={10} className="flex-shrink-0 text-surface-500" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-surface-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function RailDetail({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${danger ? 'border-danger-500/15 bg-danger-500/5' : 'border-white/5 bg-surface-900/60'}`}>
      <span className={`mb-0.5 block text-2xs uppercase tracking-[0.16em] ${danger ? 'text-danger-300' : 'text-surface-500'}`}>
        {label}
      </span>
      <p className={`text-xs leading-relaxed ${danger ? 'text-danger-300' : 'text-surface-300'}`}>{value}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
}: {
  icon: ElementType;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const classes =
    variant === 'primary'
      ? 'border-gold-500/20 bg-gold-500/10 text-gold-200 hover:border-gold-500/25 hover:bg-gold-500/15'
      : variant === 'secondary'
        ? 'border-white/5 bg-surface-900/70 text-surface-300 hover:border-white/10 hover:bg-surface-850/80 hover:text-surface-100'
        : 'border-white/5 bg-transparent text-surface-500 hover:border-white/10 hover:bg-surface-900/70 hover:text-surface-200';

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all duration-200 ${classes}`}
    >
      <Icon size={12} className="flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}

interface ActionItem {
  icon: ElementType;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
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
    actions.push({ icon: CheckCircle2, label: 'Freigeben', variant: 'primary' });
    actions.push({ icon: XCircle, label: 'Änderungen anfordern', variant: 'secondary' });
  }

  if (signal.type === 'agent_question') {
    actions.push({ icon: MessageSquare, label: 'Antworten', onClick: () => quest && navigate(`/quests/${quest.id}`), variant: 'primary' });
  }

  if (signal.type === 'failed_execution') {
    actions.push({ icon: RotateCcw, label: 'Erneut ausführen', variant: 'primary' });
    actions.push({ icon: Crosshair, label: 'Debug-Quest erstellen', variant: 'secondary' });
  }

  if (signal.type === 'blocker') {
    actions.push({ icon: CheckCircle2, label: 'Blocker auflösen', variant: 'primary' });
  }

  if (quest) {
    actions.push({ icon: ArrowRight, label: 'Zur Quest', onClick: () => navigate(`/quests/${quest.id}`), variant: 'secondary' });
  }

  if (workflow) {
    actions.push({ icon: Workflow, label: 'Zum Workflow', onClick: () => navigate('/systems'), variant: 'secondary' });
  }

  if (session) {
    actions.push({ icon: MonitorPlay, label: 'Sitzung öffnen', onClick: () => navigate(`/sessions/${session.id}`), variant: 'secondary' });
  }

  if (campaign) {
    actions.push({ icon: Megaphone, label: 'Kampagne ansehen', onClick: () => navigate('/campaigns'), variant: 'secondary' });
  }

  if (['proposed_quest', 'failed_execution', 'stuck_session', 'campaign_underperformance'].includes(signal.type)) {
    actions.push({ icon: Plus, label: 'Quest erstellen', onClick: () => navigate('/quests'), variant: signal.type === 'proposed_quest' ? 'primary' : 'secondary' });
  }

  if (signal.type !== 'proposed_quest') {
    actions.push({ icon: FileText, label: 'Artefakte ansehen', variant: 'ghost' });
  }

  actions.push({ icon: Archive, label: 'Archivieren', variant: 'ghost' });

  return actions;
}
