import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getRequiredEnvVar = (name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabasePublishableKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey);

export default supabase;
