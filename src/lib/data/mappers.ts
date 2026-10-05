import { z } from "zod";
import type { FamilyOverview, PublicInvitation, SummaryStats } from "@/types";
import { TOKEN_REGEX } from "@/lib/validation/schemas";

/** Forma cruda de una fila de la vista `family_overview` (snake_case). */
const overviewRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  token: z.string().regex(TOKEN_REGEX),
  guests_invited: z.number().int().min(1),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  rsvp_status: z.enum(["attending", "declined"]).nullable(),
  rsvp_guests_confirmed: z.number().int().nullable(),
  rsvp_channel: z.enum(["form", "whatsapp", "admin"]).nullable(),
  rsvp_responded_at: z.string().nullable(),
});

/**
 * Valida y convierte una fila a `FamilyOverview`. Devuelve null si los datos
 * están incompletos o son incoherentes (p. ej. estado sin número de personas).
 */
export function toFamilyOverview(raw: unknown): FamilyOverview | null {
  const parsed = overviewRowSchema.safeParse(raw);
  if (!parsed.success) return null;
  const row = parsed.data;

  let rsvp: FamilyOverview["rsvp"] = null;
  if (row.rsvp_status !== null) {
    if (row.rsvp_guests_confirmed === null || row.rsvp_channel === null || row.rsvp_responded_at === null) {
      return null;
    }
    rsvp = {
      status: row.rsvp_status,
      guestsConfirmed: row.rsvp_guests_confirmed,
      channel: row.rsvp_channel,
      respondedAt: row.rsvp_responded_at,
    };
  }

  return {
    id: row.id,
    name: row.name,
    token: row.token,
    guestsInvited: row.guests_invited,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rsvp,
  };
}

/** Reduce la familia a lo que puede ver su propio navegador. */
export function toPublicInvitation(family: FamilyOverview): PublicInvitation {
  return {
    familyName: family.name,
    guestsInvited: family.guestsInvited,
    rsvp: family.rsvp
      ? { status: family.rsvp.status, guestsConfirmed: family.rsvp.guestsConfirmed }
      : null,
  };
}

/** Resumen del panel. Solo cuenta familias activas; las desactivadas se informan aparte. */
export function computeSummary(families: FamilyOverview[]): SummaryStats {
  const active = families.filter((f) => f.isActive);
  const attending = active.filter((f) => f.rsvp?.status === "attending");
  const declined = active.filter((f) => f.rsvp?.status === "declined");
  return {
    totalFamilies: active.length,
    attending: attending.length,
    declined: declined.length,
    pending: active.length - attending.length - declined.length,
    guestsInvited: active.reduce((sum, f) => sum + f.guestsInvited, 0),
    guestsConfirmed: attending.reduce((sum, f) => sum + (f.rsvp?.guestsConfirmed ?? 0), 0),
    disabled: families.length - active.length,
  };
}
