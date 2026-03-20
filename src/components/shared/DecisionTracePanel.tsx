import type { DecisionTrace } from '../../types';
import { decisionTraceConfidenceLabel, driftRiskLabel, guardrailStatusLabel } from '../../lib/decisionTrace';

interface DecisionTracePanelProps {
  trace?: DecisionTrace | null;
  title?: string;
  compact?: boolean;
}

export default function DecisionTracePanel({
  trace,
  title = 'Entscheidungsgrundlage',
  compact = false,
}: DecisionTracePanelProps) {
  if (!trace) {
    return (
      <div className="rounded-lg border border-white/5 bg-surface-900/50 px-3 py-2.5">
        <p className="text-2xs text-surface-500">{title}</p>
        <p className="mt-0.5 text-xs text-surface-400">Noch nicht verfügbar</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/5 bg-surface-900/50 px-3 py-2.5">
      <p className="text-2xs text-surface-500">{title}</p>
      <p className="mt-1 text-xs text-surface-200">{trace.trace_summary}</p>

      <div className="mt-2 grid gap-1 text-2xs">
        <TraceRow label="Regelwerk" value={`${trace.rule_name} (${trace.rule_id})`} />
        <TraceRow label="Playbook" value={`${trace.playbook_name} (${trace.playbook_id})`} />
        <TraceRow label="SoT" value={`${trace.source_of_truth_label} · ${trace.source_of_truth_type}`} />
        <TraceRow label="Core-Sektion" value={trace.canonical_core_section} />
      </div>

      {!compact && (
        <div className="mt-2 grid gap-1 text-2xs">
          <TraceRow label="Akteur-Rolle" value={trace.actor_agent_role} />
          <TraceRow label="Kanal" value={trace.actor_channel} />
          <TraceRow label="Adapter" value={trace.platform_adapter} />
          <TraceRow label="Runtime" value={trace.runtime_source} />
          <TraceRow label="Handover" value={trace.handover_template_used} />
          <TraceRow label="Memory Scope" value={trace.memory_scope} />
          <TraceRow label="Guardrail" value={guardrailStatusLabel(trace.guardrail_status)} />
          <TraceRow label="Drift-Risiko" value={driftRiskLabel(trace.drift_risk)} />
          <TraceRow label="Confidence" value={decisionTraceConfidenceLabel(trace.confidence)} />
        </div>
      )}
    </div>
  );
}

function TraceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-surface-500">{label}</span>
      <span className="text-right font-mono text-surface-300">{value}</span>
    </div>
  );
}
