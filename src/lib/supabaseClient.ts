import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * A URL is only usable if it is a real Supabase project URL. `https://supabase.co`
 * (the marketing site) and empty/placeholder values are treated as "not configured"
 * so the app can fall back to demo data instead of firing doomed network requests.
 */
function isUsableUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    // Reject the bare marketing domain; require a project subdomain or custom host.
    return hostname !== 'supabase.co' && hostname.length > 0;
  } catch {
    return false;
  }
}

function isUsableKey(key: string | undefined): key is string {
  // A real anon key is a JWT (three dot-separated segments). Reject placeholders.
  return !!key && key.split('.').length === 3;
}

export const isSupabaseConfigured =
  isUsableUrl(supabaseUrl) && isUsableKey(supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[v0] Supabase is not configured (missing/placeholder VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). ' +
      'Falling back to local demo data. See .env.example to connect a live project.'
  );
}

/**
 * Only instantiate a real client when we have usable credentials. When not
 * configured this is `null`, and the service layer serves demo data instead.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
