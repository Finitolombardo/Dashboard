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
  Zap,
  ArrowUpRight,
  Shield,
} from 'lucide-react';

interface FocusWorkspaceProps {
  signal: Signal | null;
}

export default function FocusWorkspace({ signal }: FocusWorkspaceProps) {
  const navigate = useNavigate();

  if (!signal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-surface-850 border border-surface-700/30 flex items-center justify-center mx-auto mb-4">
            <Crosshair size={22} className="text-surface-500" />
          </div>
          <p className="text-sm text-surface-400 font-medium">Signal auswählen</p>
          <p className="text-2xs text-surface-600 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
            Wähle ein Element aus dem Prioritäts-Feed, um die Details hier anzuzeigen.
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5 border-b border-surface-700/30">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SignalTypeTag type={signal.type} />
              <PriorityTag priority={signal.severity} />
              <StatusBadge status={signal.status} dot />
            </div>
            <h2 className="text-lg font-semibold text-surface-50 leading-snug tracking-tight">{signal.title}</h2>
            <p className="text-sm text-surface-400 mt-1.5 leading-relaxed">{signal.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <SignalActions signal={signal} quest={quest} campaign={campaign} session={session} navigate={navigate} />
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {operationalSummary && (
          <div className="bg-surface-900/60 border border-surface-700/30 rounded-lg p-4">
            <h3 className="section-label mb-3">Zusammenfassung</h3>
            <div className="space-y-3">
              {operationalSummary.what && (
                <SummaryRow label="Was ist passiert?" value={operationalSummary.what} />
              )}
              {operationalSummary.why && (
                <SummaryRow label="Warum ist das relevant?" value={operationalSummary.why} />
              )}
              {operationalSummary.blocked && (
                <SummaryRow label="Was wird blockiert?" value={operationalSummary.blocked} severity="danger" />
              )}
              {operationalSummary.consequence && (
                <SummaryRow label="Ohne Eingriff?" value={operationalSummary.consequence} severity="warning" />
              )}
              {operationalSummary.recommendation && (
                <SummaryRow label="Empfohlene Aktion" value={operationalSummary.recommendation} severity="gold" />
              )}
            </div>
          </div>
        )}

        {(quest || workflow || campaign || session) && (
          <div>
            <h3 className="section-label mb-3">Verknüpfte Objekte</h3>
            <div className="space-y-3">
              {quest && (
                <LinkedQuestCard quest={quest} agent={agent} onClick={() => navigate(`/quests/${quest.id}`)} />
              )}
              {workflow && (
                <LinkedWorkflowCard workflow={workflow} onClick={() => navigate('/systems')} />
              )}
              {campaign && (
                <LinkedCampaignCard campaign={campaign} onClick={() => navigate('/campaigns')} />
              )}
              {session && (
                <LinkedSessionCard session={session} onClick={() => navigate(`/sessions/${session.id}`)} />
              )}
            </div>
          </div>
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
  const actionMap: Partial<Record<SignalType, React.ReactNode>> = {
    approval: (
      <>
        <button className="btn-primary"><CheckCircle2 size={13} /> Freigeben</button>
        <button className="btn-secondary"><XCircle size={13} /> Änderungen anfordern</button>
      </>
    ),
    failed_execution: (
      <>
        <button className="btn-primary"><RotateCcw size={13} /> Erneut ausführen</button>
        <button className="btn-secondary"><Crosshair size={13} /> Debug-Quest erstellen</button>
      </>
    ),
    blocker: (
      <>
        <button className="btn-primary" onClick={() => quest && navigate(`/quests/${quest.id}`)}>
          <ArrowRight size={13} /> Zur Quest
        </button>
        <button className="btn-secondary"><CheckCircle2 size={13} /> Blocker auflösen</button>
      </>
    ),
    agent_question: (
      <>
        <button className="btn-primary" onClick={() => quest && navigate(`/quests/${quest.id}`)}>
          <MessageSquare size={13} /> Antworten
        </button>
      </>
    ),
    proposed_quest: (
      <>
        <button className="btn-primary"><Crosshair size={13} /> Quest erstellen</button>
        <button className="btn-ghost">Verwerfen</button>
      </>
    ),
    campaign_underperformance: (
      <>
        <button className="btn-primary"><Crosshair size={13} /> Optimierungs-Quest</button>
        {campaign && (
          <button className="btn-secondary" onClick={() => navigate('/campaigns')}>
            <Megaphone size={13} /> Kampagne ansehen
          </button>
        )}
      </>
    ),
    stuck_session: (
      <>
        <button className="btn-primary" onClick={() => session && navigate(`/sessions/${session.id}`)}>
          <MonitorPlay size={13} /> Sitzung öffnen
        </button>
        <button className="btn-secondary"><Crosshair size={13} /> Quest erstellen</button>
      </>
    ),
    system_warning: (
      <>
        <button className="btn-secondary" onClick={() => navigate('/systems')}>
          <Shield size={13} /> Systeme ansehen
        </button>
      </>
    ),
  };

  return <>{actionMap[signal.type] || null}</>;
}

function SummaryRow({ label, value, severity }: { label: string; value: string; severity?: 'danger' | 'warning' | 'gold' }) {
  const valueColor =
    severity === 'danger' ? 'text-danger-400' :
    severity === 'warning' ? 'text-warning-400' :
    severity === 'gold' ? 'text-gold-400' :
    'text-surface-300';

  return (
    <div>
      <dt className="text-2xs text-surface-500 font-medium mb-0.5">{label}</dt>
      <dd className={`text-sm leading-relaxed ${valueColor}`}>{value}</dd>
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
    <div className="bg-surface-850/60 border border-surface-700/30 rounded-lg p-4 hover:border-surface-600/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Crosshair size={13} className="text-gold-500" />
          <span className="section-label">Verknüpfte Quest</span>
        </div>
        <button onClick={onClick} className="text-2xs text-gold-400 hover:text-gold-300 flex items-center gap-0.5 transition-colors font-medium">
          Öffnen <ArrowUpRight size={10} />
        </button>
      </div>
      <p className="text-sm font-medium text-surface-100 mb-2">{quest.title}</p>
      <div className="flex items-center gap-2 mb-2">
        <StatusBadge status={quest.status} dot />
        <PriorityTag priority={quest.priority} />
        {agent && <AgentChip agent={agent} />}
      </div>
      {quest.progress > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-surface-500">Fortschritt</span>
            <span className="text-2xs text-surface-400 tabular-nums">{quest.progress}%</span>
          </div>
          <ProgressBar value={quest.progress} />
        </div>
      )}
      {quest.current_step && (
        <div className="mt-2 text-2xs">
          <span className="text-surface-500">Aktuell:</span>{' '}
          <span className="text-surface-300">{quest.current_step}</span>
        </div>
      )}
      {quest.blocker && (
        <div className="flex items-center gap-1.5 mt-2 text-2xs text-danger-400 bg-danger-500/5 px-2 py-1 rounded">
          <AlertTriangle size={10} className="flex-shrink-0" />
          <span>{quest.blocker}</span>
        </div>
      )}
    </div>
  );
}

function LinkedWorkflowCard({
  workflow,
  onClick,
}: {
  workflow: NonNullable<ReturnType<typeof getWorkflowById>>;
  onClick: () => void;
}) {
  return (
    <div className="bg-surface-850/60 border border-surface-700/30 rounded-lg p-4 hover:border-surface-600/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Workflow size={13} className="text-surface-400" />
          <span className="section-label">Verknüpfter Workflow</span>
        </div>
        <button onClick={onClick} className="text-2xs text-gold-400 hover:text-gold-300 flex items-center gap-0.5 transition-colors font-medium">
          Öffnen <ArrowUpRight size={10} />
        </button>
      </div>
      <p className="text-sm font-medium text-surface-100 mb-2">{workflow.name}</p>
      <div className="flex items-center gap-3">
        <StatusBadge status={workflow.status} dot />
        <div className="flex items-center gap-1 text-2xs text-surface-500">
          <Zap size={10} />
          <span>Gesundheit:</span>
          <StatusBadge status={workflow.execution_health as 'healthy'} />
        </div>
      </div>
      {workflow.last_run && (
        <div className="mt-2 flex items-center gap-1 text-2xs text-surface-500">
          <Clock size={10} />
          <span>Letzter Lauf:</span>
          <span className="text-surface-400">{new Date(workflow.last_run).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
    </div>
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
    <div className="bg-surface-850/60 border border-surface-700/30 rounded-lg p-4 hover:border-surface-600/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Megaphone size={13} className="text-surface-400" />
          <span className="section-label">Verknüpfte Kampagne</span>
        </div>
        <button onClick={onClick} className="text-2xs text-gold-400 hover:text-gold-300 flex items-center gap-0.5 transition-colors font-medium">
          Öffnen <ArrowUpRight size={10} />
        </button>
      </div>
      <p className="text-sm font-medium text-surface-100 mb-2">{campaign.name}</p>
      <div className="grid grid-cols-4 gap-3 text-2xs">
        <MetricCell label="Gesendet" value={campaign.sent.toLocaleString('de-DE')} />
        <MetricCell label="Open-Rate" value={`${openRate}%`} />
        <MetricCell label="Reply-Rate" value={`${replyRate}%`} />
        <MetricCell label="Bounce" value={`${campaign.bounce_rate}%`} warn={campaign.bounce_rate > 5} />
      </div>
    </div>
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
    <div className="bg-surface-850/60 border border-surface-700/30 rounded-lg p-4 hover:border-surface-600/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MonitorPlay size={13} className="text-surface-400" />
          <span className="section-label">Verknüpfte Sitzung</span>
        </div>
        <button onClick={onClick} className="text-2xs text-gold-400 hover:text-gold-300 flex items-center gap-0.5 transition-colors font-medium">
          Öffnen <ArrowUpRight size={10} />
        </button>
      </div>
      <p className="text-sm font-medium text-surface-100 mb-2">{session.name}</p>
      <div className="flex items-center gap-2 mb-2">
        <StatusBadge status={session.status} dot />
        <StatusBadge status={session.health} />
        <span className="text-2xs text-surface-500 font-mono">{session.current_model}</span>
      </div>
      {session.last_message && (
        <p className="text-2xs text-surface-400 italic bg-surface-900/40 px-2.5 py-1.5 rounded leading-relaxed">
          &ldquo;{session.last_message}&rdquo;
        </p>
      )}
    </div>
  );
}

function MetricCell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-surface-500 mb-0.5">{label}</p>
      <p className={`font-medium tabular-nums ${warn ? 'text-danger-400' : 'text-surface-200'}`}>{value}</p>
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
