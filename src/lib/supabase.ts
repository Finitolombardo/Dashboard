import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// eslint-disable-next-line no-console
console.log('[MC] supabase url:', supabaseUrl ?? 'NOT_SET');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
