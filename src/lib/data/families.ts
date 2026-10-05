import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { toFamilyOverview } from "./mappers";
import { generateToken } from "@/lib/utils/token";
import type { AdminRsvpInput } from "@/lib/validation/schemas";
import type { FamilyOverview } from "@/types";

/** Resultado uniforme para operaciones administrativas. */
export type AdminResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const GENERIC_ERROR = "No pudimos completar la acción. Inténtalo de nuevo.";

function translateDbError(error: { code?: string; message?: string }): string {
  const message = error.message ?? "";
  if (message.includes("family_guests_below_confirmed")) {
    return "No puedes invitar a menos personas de las que ya confirmaron. Ajusta primero la respuesta.";
  }
  if (message.includes("rsvp_guests_exceed_invited")) {
    return "Las personas confirmadas no pueden superar las personas invitadas.";
  }
  console.error("[admin] error de Supabase:", error.code, message);
  return GENERIC_ERROR;
}

/** Lista todas las familias (con su respuesta), ordenadas por nombre. */
export async function listFamilies(): Promise<AdminResult<FamilyOverview[]>> {
  try {
    const { data, error } = await getSupabaseAdmin().from("family_overview").select("*").limit(5000);
    if (error) return { ok: false, message: translateDbError(error) };
    const families = (data ?? [])
      .map(toFamilyOverview)
      .filter((f): f is FamilyOverview => f !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    return { ok: true, data: families };
  } catch (err) {
    console.error("[admin] listFamilies:", err instanceof Error ? err.message : err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function getFamilyById(id: string): Promise<AdminResult<FamilyOverview | null>> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("family_overview")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return { ok: false, message: translateDbError(error) };
    return { ok: true, data: data ? toFamilyOverview(data) : null };
  } catch (err) {
    console.error("[admin] getFamilyById:", err instanceof Error ? err.message : err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

/** Crea una familia con un token aleatorio nuevo (reintenta ante colisión). */
export async function createFamily(input: {
  name: string;
  guestsInvited: number;
}): Promise<AdminResult<{ id: string }>> {
  try {
    const db = getSupabaseAdmin();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data, error } = await db
        .from("families")
        .insert({ name: input.name, token: generateToken(), guests_invited: input.guestsInvited })
        .select("id")
        .single();
      if (!error && data) return { ok: true, data: { id: String(data.id) } };
      const isTokenCollision = error?.code === "23505" && error.message.includes("families_token_key");
      if (!isTokenCollision) return { ok: false, message: error ? translateDbError(error) : GENERIC_ERROR };
    }
    return { ok: false, message: GENERIC_ERROR };
  } catch (err) {
    console.error("[admin] createFamily:", err instanceof Error ? err.message : err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function updateFamily(
  id: string,
  input: { name: string; guestsInvited: number; isActive: boolean },
): Promise<AdminResult> {
  try {
    const { error } = await getSupabaseAdmin()
      .from("families")
      .update({ name: input.name, guests_invited: input.guestsInvited, is_active: input.isActive })
      .eq("id", id);
    return error ? { ok: false, message: translateDbError(error) } : { ok: true, data: undefined };
  } catch (err) {
    console.error("[admin] updateFamily:", err instanceof Error ? err.message : err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

export async function deleteFamily(id: string): Promise<AdminResult> {
  try {
    const { error } = await getSupabaseAdmin().from("families").delete().eq("id", id);
    return error ? { ok: false, message: translateDbError(error) } : { ok: true, data: undefined };
  } catch (err) {
    console.error("[admin] deleteFamily:", err instanceof Error ? err.message : err);
    return { ok: false, message: GENERIC_ERROR };
  }
}

/** El administrador fija, corrige o elimina (pending) la respuesta de una familia. */
export async function setRsvpByAdmin(familyId: string, input: AdminRsvpInput): Promise<AdminResult> {
  try {
    const db = getSupabaseAdmin();
    if (input.status === "pending") {
      const { error } = await db.from("rsvps").delete().eq("family_id", familyId);
      return error ? { ok: false, message: translateDbError(error) } : { ok: true, data: undefined };
    }
    const { error } = await db.from("rsvps").upsert(
      {
        family_id: familyId,
        status: input.status,
        guests_confirmed: input.status === "attending" ? input.guests : 0,
        channel: "admin",
        responded_at: new Date().toISOString(),
      },
      { onConflict: "family_id" },
    );
    return error ? { ok: false, message: translateDbError(error) } : { ok: true, data: undefined };
  } catch (err) {
    console.error("[admin] setRsvpByAdmin:", err instanceof Error ? err.message : err);
    return { ok: false, message: GENERIC_ERROR };
  }
}
