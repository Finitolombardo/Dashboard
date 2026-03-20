import type { ReactNode, ElementType } from 'react';
import type { Signal, SignalType } from '../../types';
import { getQuestById, getWorkflowById, getCampaignById, getSessionById, getAgentById } from '../../data/mock';
import StatusBadge from '../shared/StatusBadge';
import PriorityTag from '../shared/PriorityTag';
import AgentChip from '../shared/AgentChip';
import ProgressBar from '../shared/ProgressBar';
import SignalTypeTag from '../shared/SignalTypeTag';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  Workflow,
  Megaphone,
  MonitorPlay,
  Clock,
  ArrowUpRight,
  Shield,
} from 'lucide-react';

interface FocusWorkspaceProps {
  signal: Signal | null;
}


const actionBaseClass =
  'inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gold-400/30 disabled:cursor-not-allowed disabled:opacity-50';

function ActionButton({
  variant,
  icon: Icon,
  children,
  onClick,
}: {
  variant: 'primary' | 'secondary' | 'ghost';
  icon: ElementType;
  children: ReactNode;
  onClick?: () => void;
}) {
  const classes =
    variant === 'primary'
      ? 'border-gold-500/30 bg-gold-500/90 text-surface-950 shadow-[0_12px_28px_rgba(201,144,30,0.16)] hover:-translate-y-px hover:bg-gold-400'
      : variant === 'secondary'
        ? 'border-white/5 bg-surface-900/80 text-surface-200 hover:border-white/10 hover:bg-surface-850/80'
        : 'border-white/5 bg-transparent text-surface-400 hover:border-white/10 hover:bg-surface-900/70 hover:text-surface-200';

  return (
    <button onClick={onClick} className={`${actionBaseClass} ${classes}`}>
      <Icon size={13} />
      {children}
    </button>
  );
}

export default function FocusWorkspace({ signal }: FocusWorkspaceProps) {
  const navigate = useNavigate();

  if (!signal) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/5 bg-surface-900/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <Crosshair size={22} className="text-surface-500" />
          </div>
          <p className="text-sm font-medium text-surface-100">Signal auswählen</p>
          <p className="mt-2 text-2xs leading-relaxed text-surface-500">
            Wähle links ein Signal aus, um den operativen Kontext, die Risiken und die verknüpften Objekte im Zentrum zu sehen.
          </p>
        </div>
      </div>
    );
  }

  const quest = signal.linked_quest_id ? getQuestById(signal.linked_quest_id) : undefined;
  const workflow = signal.linked_workflow_id ? getWorkflowById(signal.linked_workflow_id) : undefined;
  const campaign = signal.linked_campaign_id ? getCampaignById(signal.linked_campaign_id) : undefined;
  const session = signal.linked_session_id ? getSessionById(signal.linked_session_id) : undefined;
  const agent = quest?.agent_id ? getAgentById(quest.agent_id) : undefined;

  const operationalSummary = getOperationalSummary(signal, quest, workflow, campaign, session);
  const workflowHealth = workflow ? mapHealthStatus(workflow.execution_health) : undefined;

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-white/5 bg-[linear-gradient(180deg,rgba(13,14,18,0.96),rgba(10,11,14,0.92))] px-6 py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <SignalTypeTag type={signal.type} />
              <PriorityTag priority={signal.severity} />
              <StatusBadge status={signal.status} dot />
              {signal.source && (
                <span className="rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs font-medium text-surface-400">
                  Quelle: {signal.source}
                </span>
              )}
            </div>

            <h2 className="max-w-4xl text-2xl font-semibold tracking-tight text-surface-50 lg:text-[1.9rem]">
              {signal.title}
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-surface-300">
              {signal.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <SignalActions signal={signal} quest={quest} campaign={campaign} session={session} navigate={navigate} />
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        {operationalSummary && (
          <section className="rounded-2xl border border-white/5 bg-surface-900/65 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="section-label mb-1">Operatives Lagebild</p>
                <h3 className="text-sm font-semibold text-surface-100">Was ist passiert und was tun wir jetzt?</h3>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {operationalSummary.what && <SummaryRow label="Was ist passiert?" value={operationalSummary.what} />}
              {operationalSummary.why && <SummaryRow label="Warum ist das relevant?" value={operationalSummary.why} />}
              {operationalSummary.blocked && <SummaryRow label="Was wird blockiert?" value={operationalSummary.blocked} severity="danger" />}
              {operationalSummary.consequence && <SummaryRow label="Ohne Eingriff?" value={operationalSummary.consequence} severity="warning" />}
              {operationalSummary.recommendation && (
                <SummaryRow label="Empfohlene Aktion" value={operationalSummary.recommendation} severity="gold" />
              )}
            </div>
          </section>
        )}

        {(quest || workflow || campaign || session) && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="section-label mb-1">Verknüpfte Objekte</p>
                <h3 className="text-sm font-semibold text-surface-100">Quest, Workflow, Kampagne und Sitzung im Kontext</h3>
              </div>
            </div>

            <div className="space-y-3">
              {quest && <LinkedQuestCard quest={quest} agent={agent} onClick={() => navigate(`/quests/${quest.id}`)} />}
              {workflow && <LinkedWorkflowCard workflow={workflow} health={workflowHealth} onClick={() => navigate('/systems')} />}
              {campaign && <LinkedCampaignCard campaign={campaign} onClick={() => navigate('/campaigns')} />}
              {session && <LinkedSessionCard session={session} onClick={() => navigate(`/sessions/${session.id}`)} />}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SignalActions({
  signal,
  quest,
  campaign,
  session,
  navigate,
}: {
  signal: Signal;
  quest: ReturnType<typeof getQuestById>;
  campaign: ReturnType<typeof getCampaignById>;
  session: ReturnType<typeof getSessionById>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const actionMap: Partial<Record<SignalType, ReactNode>> = {
    approval: (
      <>
        <ActionButton variant="primary" icon={CheckCircle2}>
          Freigeben
        </ActionButton>
        <ActionButton variant="secondary" icon={XCircle}>
          Änderungen anfordern
        </ActionButton>
      </>
    ),
    failed_execution: (
      <>
        <ActionButton variant="primary" icon={RotateCcw}>
          Erneut ausführen
        </ActionButton>
        <ActionButton variant="secondary" icon={Crosshair}>
          Debug-Quest erstellen
        </ActionButton>
      </>
    ),
    blocker: (
      <>
        <ActionButton variant="primary" icon={ArrowRight} onClick={() => quest && navigate(`/quests/${quest.id}`)}>
          Zur Quest
        </ActionButton>
        <ActionButton variant="secondary" icon={CheckCircle2}>
          Blocker auflösen
        </ActionButton>
      </>
    ),
    agent_question: (
      <>
        <ActionButton variant="primary" icon={MessageSquare} onClick={() => quest && navigate(`/quests/${quest.id}`)}>
          Antworten
        </ActionButton>
      </>
    ),
    proposed_quest: (
      <>
        <ActionButton variant="primary" icon={Crosshair}>
          Quest erstellen
        </ActionButton>
        <ActionButton variant="ghost" icon={XCircle}>
          Verwerfen
        </ActionButton>
      </>
    ),
    campaign_underperformance: (
      <>
        <ActionButton variant="primary" icon={Crosshair}>
          Optimierungs-Quest
        </ActionButton>
        {campaign && (
          <ActionButton variant="secondary" icon={Megaphone} onClick={() => navigate('/campaigns')}>
            Kampagne ansehen
          </ActionButton>
        )}
      </>
    ),
    stuck_session: (
      <>
        <ActionButton variant="primary" icon={MonitorPlay} onClick={() => session && navigate(`/sessions/${session.id}`)}>
          Sitzung öffnen
        </ActionButton>
        <ActionButton variant="secondary" icon={Crosshair}>
          Quest erstellen
        </ActionButton>
      </>
    ),
    system_warning: (
      <>
        <ActionButton variant="secondary" icon={Shield} onClick={() => navigate('/systems')}>
          Systeme ansehen
        </ActionButton>
      </>
    ),
  };

  return <>{actionMap[signal.type] || null}</>;
}

function SummaryRow({
  label,
  value,
  severity,
}: {
  label: string;
  value: string;
  severity?: 'danger' | 'warning' | 'gold';
}) {
  const toneClass =
    severity === 'danger'
      ? 'border-danger-500/15 bg-danger-500/5 text-danger-300'
      : severity === 'warning'
        ? 'border-warning-500/15 bg-warning-500/5 text-warning-300'
        : severity === 'gold'
          ? 'border-gold-500/15 bg-gold-500/5 text-gold-200'
          : 'border-white/5 bg-surface-900/70 text-surface-300';

  return (
    <div className={`rounded-xl border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${toneClass}`}>
      <dt className="mb-1 text-2xs font-semibold uppercase tracking-[0.18em] text-surface-500">{label}</dt>
      <dd className="text-sm leading-relaxed">{value}</dd>
    </div>
  );
}

function LinkedQuestCard({
  quest,
  agent,
  onClick,
}: {
  quest: NonNullable<ReturnType<typeof getQuestById>>;
  agent: ReturnType<typeof getAgentById>;
  onClick: () => void;
}) {
  return (
    <LinkedCardShell
      icon={Crosshair}
      title="Verknüpfte Quest"
      actionLabel="Öffnen"
      onClick={onClick}
      accentClass="text-gold-300"
    >
      <p className="mb-3 text-sm font-medium text-surface-50">{quest.title}</p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={quest.status} dot />
        <PriorityTag priority={quest.priority} />
        {agent && <AgentChip agent={agent} />}
      </div>

      {quest.progress > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-2xs text-surface-500">Fortschritt</span>
            <span className="text-2xs tabular-nums text-surface-400">{quest.progress}%</span>
          </div>
          <ProgressBar value={quest.progress} />
        </div>
      )}

      <div className="space-y-2 text-2xs">
        {quest.current_step && (
          <InfoRow label="Aktuell" value={quest.current_step} />
        )}
        {quest.next_step && (
          <InfoRow label="Nächster Schritt" value={quest.next_step} />
        )}
        {quest.blocker && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-500/15 bg-danger-500/5 px-2.5 py-2 text-danger-300">
            <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{quest.blocker}</span>
          </div>
        )}
      </div>
    </LinkedCardShell>
  );
}

function LinkedWorkflowCard({
  workflow,
  health,
  onClick,
}: {
  workflow: NonNullable<ReturnType<typeof getWorkflowById>>;
  health?: ReturnType<typeof mapHealthStatus>;
  onClick: () => void;
}) {
  return (
    <LinkedCardShell
      icon={Workflow}
      title="Verknüpfter Workflow"
      actionLabel="Öffnen"
      onClick={onClick}
      accentClass="text-surface-400"
    >
      <p className="mb-3 text-sm font-medium text-surface-50">{workflow.name}</p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={workflow.status} dot />
        {health && <StatusBadge status={health} />}
      </div>

      {workflow.last_run && (
        <div className="flex items-center gap-1.5 text-2xs text-surface-500">
          <Clock size={10} />
          <span>Letzter Lauf</span>
          <span className="text-surface-400">
            {new Date(workflow.last_run).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </LinkedCardShell>
  );
}

function LinkedCampaignCard({
  campaign,
  onClick,
}: {
  campaign: NonNullable<ReturnType<typeof getCampaignById>>;
  onClick: () => void;
}) {
  const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0';
  const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0';

  return (
    <LinkedCardShell
      icon={Megaphone}
      title="Verknüpfte Kampagne"
      actionLabel="Öffnen"
      onClick={onClick}
      accentClass="text-surface-400"
    >
      <p className="mb-3 text-sm font-medium text-surface-50">{campaign.name}</p>

      <div className="grid grid-cols-2 gap-3 text-2xs xl:grid-cols-4">
        <MetricCell label="Gesendet" value={campaign.sent.toLocaleString('de-DE')} />
        <MetricCell label="Open-Rate" value={`${openRate}%`} />
        <MetricCell label="Reply-Rate" value={`${replyRate}%`} />
        <MetricCell label="Bounce" value={`${campaign.bounce_rate}%`} warn={campaign.bounce_rate > 5} />
      </div>
    </LinkedCardShell>
  );
}

function LinkedSessionCard({
  session,
  onClick,
}: {
  session: NonNullable<ReturnType<typeof getSessionById>>;
  onClick: () => void;
}) {
  return (
    <LinkedCardShell
      icon={MonitorPlay}
      title="Verknüpfte Sitzung"
      actionLabel="Öffnen"
      onClick={onClick}
      accentClass="text-surface-400"
    >
      <p className="mb-3 text-sm font-medium text-surface-50">{session.name}</p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={session.status} dot />
        <StatusBadge status={session.health} />
        <span className="rounded-full border border-white/5 bg-surface-900/70 px-2 py-0.5 text-2xs font-mono text-surface-400">
          {session.current_model}
        </span>
      </div>

      <p className="rounded-lg border border-white/5 bg-surface-900/60 px-3 py-2 text-2xs leading-relaxed text-surface-400 italic">
        &ldquo;{session.last_message}&rdquo;
      </p>
    </LinkedCardShell>
  );
}

function LinkedCardShell({
  icon: Icon,
  title,
  actionLabel,
  onClick,
  accentClass,
  children,
}: {
  icon: ElementType;
  title: string;
  actionLabel: string;
  onClick: () => void;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/5 bg-surface-900/70 p-4 shadow-[0_18px_36px_rgba(0,0,0,0.2)] transition-all duration-200 hover:border-white/10 hover:bg-surface-850/80">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={13} className={accentClass} />
          <span className="section-label">{title}</span>
        </div>
        <button
          onClick={onClick}
          className="inline-flex items-center gap-0.5 rounded-full border border-gold-500/15 bg-gold-500/10 px-2 py-0.5 text-2xs font-medium text-gold-300 transition-colors hover:border-gold-500/20 hover:bg-gold-500/15 hover:text-gold-200"
        >
          {actionLabel}
          <ArrowUpRight size={10} />
        </button>
      </div>
      {children}
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-900/60 px-3 py-2">
      <span className="mb-0.5 block text-2xs uppercase tracking-[0.16em] text-surface-500">{label}</span>
      <span className="block text-xs leading-relaxed text-surface-300">{value}</span>
    </div>
  );
}

function MetricCell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-900/60 px-3 py-2">
      <p className="mb-0.5 text-2xs uppercase tracking-[0.16em] text-surface-500">{label}</p>
      <p className={`font-medium tabular-nums ${warn ? 'text-danger-300' : 'text-surface-200'}`}>{value}</p>
    </div>
  );
}

interface OperationalSummary {
  what?: string;
  why?: string;
  blocked?: string;
  consequence?: string;
  recommendation?: string;
}

function mapHealthStatus(health: string): 'healthy' | 'degraded' | 'error' {
  if (health === 'failing' || health === 'error') return 'error';
  if (health === 'degraded') return 'degraded';
  return 'healthy';
}

function getOperationalSummary(
  signal: Signal,
  quest: ReturnType<typeof getQuestById>,
  workflow: ReturnType<typeof getWorkflowById>,
  campaign: ReturnType<typeof getCampaignById>,
  session: ReturnType<typeof getSessionById>,
): OperationalSummary | null {
  switch (signal.type) {
    case 'blocker':
      return {
        what: signal.summary,
        why: quest ? `Die Quest "${quest.title}" ist direkt betroffen und kann nicht fortgesetzt werden.` : 'Ein kritischer Prozess ist blockiert.',
        blocked: quest?.blocker || 'Abhängige Prozesse und Workflows können nicht fortfahren.',
        consequence: 'Ohne Behebung bleibt die Quest blockiert. Nachgelagerte Workflows und Kampagnen-Updates könnten ebenfalls verzögert werden.',
        recommendation: 'Blocker beheben und Quest fortsetzen. Bei externen Abhängigkeiten: zuständiges Team kontaktieren.',
      };
    case 'approval':
      return {
        what: signal.summary,
        why: quest ? `Die Quest "${quest.title}" wartet auf Operator-Freigabe, um fortgesetzt zu werden.` : 'Ein Ergebnis wartet auf Prüfung.',
        consequence: 'Der zugewiesene Agent kann ohne Freigabe nicht weiterarbeiten.',
        recommendation: 'Ergebnis prüfen und freigeben oder Änderungen anfordern.',
      };
    case 'agent_question':
      return {
        what: signal.summary,
        why: 'Der Agent benötigt eine Entscheidung vom Operator, um die aktuelle Aufgabe fortzusetzen.',
        blocked: quest ? `Quest "${quest.title}" pausiert bis zur Antwort.` : undefined,
        consequence: 'Ohne Antwort bleibt der Agent wartend. Verknüpfte Kampagnen und Workflows könnten verzögert werden.',
        recommendation: 'Frage beantworten und klare Richtung vorgeben.',
      };
    case 'failed_execution':
      return {
        what: signal.summary,
        why: workflow ? `Der Workflow "${workflow.name}" hat einen fehlgeschlagenen Lauf.` : 'Eine automatisierte Ausführung ist fehlgeschlagen.',
        blocked: quest ? `Möglicherweise Auswirkung auf Quest "${quest.title}".` : undefined,
        consequence: 'Ohne Eingriff werden nachfolgende Ausführungen voraussichtlich ebenfalls fehlschlagen.',
        recommendation: 'Fehlerdetails prüfen. Bei temporärem Problem: erneut ausführen. Bei strukturellem Problem: Debug-Quest erstellen.',
      };
    case 'campaign_underperformance':
      return {
        what: signal.summary,
        why: campaign ? `Die Kampagne "${campaign.name}" liegt unter den definierten Schwellenwerten.` : 'Kampagnen-Metriken liegen unter den Erwartungen.',
        consequence: 'Fortsetzung ohne Optimierung verschwendet Budget und kann die Domain-Reputation schädigen.',
        recommendation: 'Kampagnen-Daten analysieren und Optimierungs-Quest erstellen.',
      };
    case 'stuck_session':
      return {
        what: signal.summary,
        why: session ? `Die Sitzung "${session.name}" reagiert nicht mehr.` : 'Eine Agenten-Sitzung ist nicht mehr responsiv.',
        consequence: 'Zugewiesene Aufgaben werden nicht bearbeitet. Verknüpfte Quests könnten verzögert werden.',
        recommendation: 'Sitzung prüfen und bei Bedarf neu starten oder Quest erstellen.',
      };
    case 'system_warning':
      return {
        what: signal.summary,
        why: 'Ein Systemdienst zeigt ungewöhnliches Verhalten.',
        consequence: 'Kann zu langsamerer Verarbeitung oder Ausfällen in abhängigen Prozessen führen.',
        recommendation: 'Systemstatus überwachen. Bei Eskalation: Wartungsmaßnahmen einleiten.',
      };
    case 'proposed_quest':
      return {
        what: signal.summary,
        why: 'Ein Agent hat basierend auf seiner Analyse einen neuen Auftrag vorgeschlagen.',
        recommendation: 'Vorschlag prüfen und als Quest erstellen oder verwerfen.',
      };
    default:
      return null;
  }
}
