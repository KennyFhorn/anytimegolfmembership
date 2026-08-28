import { isSupabaseConfigured } from "../supabase/env";
import { createClient as createSupabaseServerClient } from "../supabase/server";
import { createMockRepository } from "./mock";
import { createSupabaseRepository } from "./supabase";
import type { Repository } from "./repository";

export * from "./repository";

const mockRepository = createMockRepository();

/**
 * Returns the data repository for the current request. Uses the real
 * Supabase-backed implementation once NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set; otherwise falls back to an
 * in-memory demo dataset so the app is fully click-through-able before a
 * Supabase project exists.
 */
export async function getRepository(): Promise<Repository> {
  if (!isSupabaseConfigured) {
    return mockRepository;
  }
  const client = await createSupabaseServerClient();
  return createSupabaseRepository(client);
}

export function isDemoMode(): boolean {
  return !isSupabaseConfigured;
}
