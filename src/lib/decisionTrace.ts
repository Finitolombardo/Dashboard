import type { DecisionTrace, DriftRisk, GuardrailStatus } from '../types';

export function guardrailStatusLabel(status: GuardrailStatus): string {
  if (status === 'ok') return 'OK';
  if (status === 'blocked') return 'Blockiert';
  return 'Review nötig';
}

export function driftRiskLabel(risk: DriftRisk): string {
  if (risk === 'high') return 'Hoch';
  if (risk === 'medium') return 'Mittel';
  return 'Niedrig';
}

export function decisionTraceConfidenceLabel(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function pickDecisionTrace(...traces: Array<DecisionTrace | null | undefined>): DecisionTrace | undefined {
  return traces.find((trace): trace is DecisionTrace => Boolean(trace));
}
