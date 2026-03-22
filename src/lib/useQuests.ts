import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { mockQuests } from '../data/mock';
import { fetchQuestsFromRuntime } from './missionControlApi';
import type { Quest } from '../types';

// Priority order for data sources:
// 1. Operative Runtime (VITE_API_BASE_URL -> tasks.getvoidra.com)
// 2. Supabase (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
// 3. Mock data (fallback for local dev without backend)

const runtimeConfigured = !!import.meta.env.VITE_API_BASE_URL;

const supabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>(
    runtimeConfigured || supabaseConfigured ? [] : mockQuests
  );
  const [loading, setLoading] = useState(runtimeConfigured || supabaseConfigured);

  const fetch = useCallback(async () => {
    // 1. Operative Runtime (tasks.getvoidra.com) - primaere Quelle
    if (runtimeConfigured) {
      setLoading(true);
      try {
        const data = await fetchQuestsFromRuntime();
        setQuests(data);
      } catch (err) {
        console.warn('[useQuests] Runtime fetch failed, falling back to mock:', err);
        setQuests(mockQuests);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Supabase fallback
    if (supabaseConfigured) {
      setLoading(true);
      const STAR_SELECT = '*, agent:agents(*)';
      supabase
        .from('quests')
        .select(STAR_SELECT)
        .order('updated_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setQuests(data as Quest[]);
          } else if (!error && data) {
            setQuests([]);
          } else {
            setQuests(mockQuests);
          }
          setLoading(false);
        });
      return;
    }

    // 3. Mock fallback (kein Backend konfiguriert)
    setQuests(mockQuests);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { quests, loading, refresh: fetch };
}
