import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardAgentsFromBackend } from './missionControlApi';
import type { Agent } from '../types';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardAgentsFromBackend();
      setAgents(data);
    } catch (err) {
      console.warn('[useAgents] Backend fetch failed:', err);
      setError('Agenten konnten nicht geladen werden.');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { agents, loading, error, refresh: load };
}
