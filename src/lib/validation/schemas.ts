import { z } from "zod";
import { normalizeInvitationName } from "@/lib/utils/names";

export const TOKEN_REGEX = /^[A-Za-z0-9]{12,64}$/;
export const MAX_GUESTS = 50;

export const tokenSchema = z.string().regex(TOKEN_REGEX);
export const uuidSchema = z.string().uuid();

/** Cuerpo de POST /api/rsvp. Se valida SIEMPRE en servidor. */
export const rsvpRequestSchema = z
  .object({
    token: tokenSchema,
    status: z.enum(["attending", "declined"]),
    guests: z.number().int().min(1).max(MAX_GUESTS).optional(),
    channel: z.enum(["form", "whatsapp"]),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === "attending" && value.guests === undefined) {
      ctx.addIssue({ code: "custom", path: ["guests"], message: "Indica cuántas personas asistirán." });
    }
    if (value.status === "declined" && value.guests !== undefined) {
      ctx.addIssue({ code: "custom", path: ["guests"], message: "No se indican personas si no asisten." });
    }
    if (value.channel === "whatsapp" && value.status !== "attending") {
      ctx.addIssue({ code: "custom", path: ["channel"], message: "WhatsApp solo aplica para confirmar asistencia." });
    }
  });
export type RsvpRequest = z.infer<typeof rsvpRequestSchema>;

/** Formulario de crear/editar una invitación (panel admin). */
export const familyFormSchema = z.object({
  name: z
    .string({ required_error: "Escribe el nombre de la invitación." })
    .transform(normalizeInvitationName)
    .pipe(
      z
        .string()
        .min(1, "Escribe el nombre de la invitación.")
        .max(80, "Usa máximo 80 caracteres."),
    ),
  guestsInvited: z.coerce
    .number({ invalid_type_error: "Indica un número de personas." })
    .int("Debe ser un número entero.")
    .min(1, "Mínimo 1 persona.")
    .max(MAX_GUESTS, `Máximo ${MAX_GUESTS} personas.`),
  isActive: z.boolean(),
});
export type FamilyFormInput = z.infer<typeof familyFormSchema>;

/** Respuesta editada por el administrador ("pending" elimina la respuesta). */
export const adminRsvpSchema = z
  .object({
    status: z.enum(["pending", "attending", "declined"]),
    guests: z.coerce.number().int().min(0).max(MAX_GUESTS),
  })
  .superRefine((value, ctx) => {
    if (value.status === "attending" && value.guests < 1) {
      ctx.addIssue({ code: "custom", path: ["guests"], message: "Indica al menos 1 persona." });
    }
  });
export type AdminRsvpInput = z.infer<typeof adminRsvpSchema>;

/** Primer mensaje de error por campo, listo para mostrar en el formulario. */
export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
