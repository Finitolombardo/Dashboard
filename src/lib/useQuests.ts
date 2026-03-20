import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!configured) return;
    supabase
      .from('quests')
      .select('*, agent:agents(*)')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setQuests(data as Quest[]);
        } else {
          setQuests(mockQuests);
        }
        setLoading(false);
      });
  }, []);

  return { quests, loading };
}
