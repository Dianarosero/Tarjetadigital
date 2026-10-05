import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

let cached: SupabaseClient | null = null;

/**
 * Cliente de Supabase con la service_role key. SOLO SERVIDOR:
 *  - `import "server-only"` hace fallar el build si alguien lo importa desde un
 *    componente de cliente.
 *  - Las variables NO llevan prefijo NEXT_PUBLIC_, por lo que Next.js jamás las
 *    incluye en el bundle del navegador.
 * El navegador nunca habla con Supabase: todo pasa por Server Components,
 * Server Actions y Route Handlers que validan cada entrada.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new ConfigError("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // Datos privados y cambiantes: nunca cachear respuestas de la base de datos.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return cached;
}
