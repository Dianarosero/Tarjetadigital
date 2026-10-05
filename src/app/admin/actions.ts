"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_COOKIE_PATH, requireAdmin } from "@/lib/auth/admin-session";
import { createFamily, deleteFamily, setRsvpByAdmin, updateFamily } from "@/lib/data/families";
import {
  adminRsvpSchema,
  familyFormSchema,
  fieldErrorsFromZod,
  uuidSchema,
} from "@/lib/validation/schemas";
import type { ActionState } from "@/types";

/**
 * Server Actions del panel. Cada una:
 *  1) exige sesión de administrador (requireAdmin) — nunca confía en que la UI ocultó el botón,
 *  2) valida la entrada con zod,
 *  3) revalida las páginas afectadas.
 * Next.js ya verifica el origen (CSRF) de las Server Actions.
 */

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "");

/** Devuelve lo escrito en el formulario de invitación para repoblarlo si hay un error. */
const familyValues = (formData: FormData) => ({
  name: text(formData, "name"),
  guestsInvited: text(formData, "guestsInvited"),
});

export async function createFamilyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = familyFormSchema.safeParse({
    name: text(formData, "name"),
    guestsInvited: text(formData, "guestsInvited"),
    isActive: true,
  });
  if (!parsed.success) {
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error), values: familyValues(formData) };
  }
  const result = await createFamily({ name: parsed.data.name, guestsInvited: parsed.data.guestsInvited });
  if (!result.ok) return { status: "error", message: result.message, values: familyValues(formData) };
  revalidatePath("/admin");
  return { status: "success", message: `Invitación “${parsed.data.name}” creada. Ya puedes copiar su enlace.` };
}

export async function updateFamilyAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  if (!uuidSchema.safeParse(id).success) return { status: "error", message: "Invitación no válida." };
  const parsed = familyFormSchema.safeParse({
    name: text(formData, "name"),
    guestsInvited: text(formData, "guestsInvited"),
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error), values: familyValues(formData) };
  }
  const result = await updateFamily(id, parsed.data);
  if (!result.ok) return { status: "error", message: result.message, values: familyValues(formData) };
  revalidatePath("/admin");
  revalidatePath(`/admin/familias/${id}`);
  return { status: "success", message: "Cambios guardados." };
}

export async function setRsvpAction(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  if (!uuidSchema.safeParse(id).success) return { status: "error", message: "Invitación no válida." };
  const parsed = adminRsvpSchema.safeParse({
    status: text(formData, "status"),
    guests: text(formData, "guests") || "0",
  });
  if (!parsed.success) {
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors: fieldErrorsFromZod(parsed.error), values: { guests: text(formData, "guests") } };
  }
  const result = await setRsvpByAdmin(id, parsed.data);
  if (!result.ok) return { status: "error", message: result.message, values: { guests: text(formData, "guests") } };
  revalidatePath("/admin");
  revalidatePath(`/admin/familias/${id}`);
  return { status: "success", message: "Respuesta actualizada." };
}

export async function deleteFamilyAction(id: string): Promise<void> {
  await requireAdmin();
  if (!uuidSchema.safeParse(id).success) return;
  const result = await deleteFamily(id);
  if (!result.ok) return;
  revalidatePath("/admin");
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.set({ name: ADMIN_COOKIE, value: "", path: ADMIN_COOKIE_PATH, maxAge: 0 });
  redirect("/");
}
