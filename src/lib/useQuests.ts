import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { mockQuests } from '../data/mock';
import type { Quest } from '../types';

const configured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>(configured ? [] : mockQuests);
  const [loading, setLoading] = useState(configured);

  const fetch = useCallback(() => {
    if (!configured) return;
    setLoading(true);
    supabase
      .from('quests')
      .select('*, agent:agents(*)')
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
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { quests, loading, refresh: fetch };
}
