export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once real Supabase credentials are configured; false in local demo mode. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
