import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { mockAgents } from '../data/mock';
import type { Agent } from '../types';

const configured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(configured ? [] : mockAgents);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;
    supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setAgents(data as Agent[]);
        } else {
          setAgents(mockAgents);
        }
        setLoading(false);
      });
  }, []);

  return { agents, loading };
}
