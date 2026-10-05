import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { toFamilyOverview, toPublicInvitation } from "./mappers";
import { tokenSchema, type RsvpRequest } from "@/lib/validation/schemas";
import type { InvitationLookup, PublicRsvp, RsvpErrorCode } from "@/types";

/**
 * Busca una invitación por token. Nunca lanza: todo fallo se traduce a un
 * estado que la UI sabe mostrar con el lenguaje visual del proyecto.
 */
export async function getInvitationByToken(rawToken: string): Promise<InvitationLookup> {
  const token = tokenSchema.safeParse(rawToken);
  if (!token.success) return { kind: "invalid-token" };

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("family_overview")
      .select("*")
      .eq("token", token.data)
      .maybeSingle();

    if (error) {
      console.error("[invitation] error de Supabase:", error.code, error.message);
      return { kind: "error" };
    }
    if (!data) return { kind: "not-found" };

    const family = toFamilyOverview(data);
    if (!family) {
      console.error("[invitation] fila incompleta o incoherente para un token válido");
      return { kind: "incomplete-data" };
    }
    if (!family.isActive) return { kind: "disabled" };
    return { kind: "ok", invitation: toPublicInvitation(family) };
  } catch (err) {
    console.error("[invitation] fallo inesperado:", err instanceof Error ? err.message : err);
    return { kind: "error" };
  }
}

export type SubmitRsvpResult =
  | { ok: true; rsvp: PublicRsvp }
  | { ok: false; code: Exclude<RsvpErrorCode, "invalid">; rsvp?: PublicRsvp; guestsInvited?: number };

const sameAnswer = (existing: PublicRsvp, status: RsvpRequest["status"], guests: number) =>
  existing.status === status && existing.guestsConfirmed === guests;

/**
 * Registra la respuesta de una familia. La respuesta es DEFINITIVA: solo se
 * inserta si no existe (restricción UNIQUE en rsvps.family_id); únicamente el
 * administrador puede modificarla. Repetir exactamente la misma respuesta
 * (doble toque, reintento de red) es idempotente y se trata como éxito.
 */
export async function submitRsvp(request: RsvpRequest): Promise<SubmitRsvpResult> {
  const guests = request.status === "attending" ? (request.guests ?? 0) : 0;

  try {
    const db = getSupabaseAdmin();

    const { data, error } = await db
      .from("family_overview")
      .select("*")
      .eq("token", request.token)
      .maybeSingle();
    if (error) {
      console.error("[rsvp] error al leer familia:", error.code, error.message);
      return { ok: false, code: "server_error" };
    }
    if (!data) return { ok: false, code: "not_found" };

    const family = toFamilyOverview(data);
    if (!family) return { ok: false, code: "server_error" };
    if (!family.isActive) return { ok: false, code: "disabled" };

    if (family.rsvp) {
      const existing: PublicRsvp = { status: family.rsvp.status, guestsConfirmed: family.rsvp.guestsConfirmed };
      return sameAnswer(existing, request.status, guests)
        ? { ok: true, rsvp: existing }
        : { ok: false, code: "already_responded", rsvp: existing };
    }

    const { error: insertError } = await db.from("rsvps").insert({
      family_id: family.id,
      status: request.status,
      guests_confirmed: guests,
      channel: request.channel,
    });

    if (insertError) {
      // Carrera: dos envíos simultáneos. El segundo choca con UNIQUE(family_id).
      if (insertError.code === "23505") {
        const { data: again } = await db
          .from("family_overview")
          .select("*")
          .eq("id", family.id)
          .maybeSingle();
        const refreshed = again ? toFamilyOverview(again) : null;
        if (refreshed?.rsvp) {
          const existing: PublicRsvp = {
            status: refreshed.rsvp.status,
            guestsConfirmed: refreshed.rsvp.guestsConfirmed,
          };
          return sameAnswer(existing, request.status, guests)
            ? { ok: true, rsvp: existing }
            : { ok: false, code: "already_responded", rsvp: existing };
        }
      }
      if (insertError.message?.includes("rsvp_guests_exceed_invited")) {
        return { ok: false, code: "too_many_guests", guestsInvited: family.guestsInvited };
      }
      console.error("[rsvp] error al guardar:", insertError.code, insertError.message);
      return { ok: false, code: "server_error" };
    }

    return { ok: true, rsvp: { status: request.status, guestsConfirmed: guests } };
  } catch (err) {
    console.error("[rsvp] fallo inesperado:", err instanceof Error ? err.message : err);
    return { ok: false, code: "server_error" };
  }
}
