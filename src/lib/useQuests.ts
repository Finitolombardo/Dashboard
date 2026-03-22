import { useState, useEffect, useCallback } from 'react';
import { fetchQuestsFromBackend } from './missionControlApi';
import type { Quest } from '../types';

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestsFromBackend();
      setQuests(data);
    } catch (err) {
      console.warn('[useQuests] Backend fetch failed:', err);
      setError('Quests konnten nicht geladen werden.');
      setQuests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { quests, loading, error, refresh: load };
}
