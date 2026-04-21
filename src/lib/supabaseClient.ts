import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export function getSupabaseConfig(): { url: string; anon: string } {
  return { url, anon };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    url &&
      anon &&
      !url.includes("SEU-PROJETO") &&
      !anon.includes("SUA-CHAVE")
  );
}

export function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(url, anon);
}
