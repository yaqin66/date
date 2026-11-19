import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ouaqrjfvulgkznfmvqqc.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_kYbl7wyxoMp7ZruzBG24pg_hvW8RSkt';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);