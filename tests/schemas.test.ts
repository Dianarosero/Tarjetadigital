import { describe, expect, it } from "vitest";
import { adminRsvpSchema, familyFormSchema, rsvpRequestSchema } from "@/lib/validation/schemas";

const token = "AbC123xyz789QRst";

describe("rsvpRequestSchema", () => {
  it("acepta asistencia por formulario con personas", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "attending", guests: 3, channel: "form" }).success).toBe(true);
  });
  it("acepta asistencia por WhatsApp", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "attending", guests: 2, channel: "whatsapp" }).success).toBe(true);
  });
  it("acepta no asistencia sin personas", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "declined", channel: "form" }).success).toBe(true);
  });
  it("exige personas cuando asisten", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "attending", channel: "form" }).success).toBe(false);
  });
  it("rechaza personas cuando no asisten", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "declined", guests: 2, channel: "form" }).success).toBe(false);
  });
  it("WhatsApp solo aplica para confirmar asistencia", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "declined", channel: "whatsapp" }).success).toBe(false);
  });
  it.each([0, -1, 1.5, 51, "3", null, Number.NaN])("rechaza personas inválidas: %j", (guests) => {
    expect(rsvpRequestSchema.safeParse({ token, status: "attending", guests, channel: "form" }).success).toBe(false);
  });
  it("no permite que el cliente se atribuya el canal 'admin' ni campos extra", () => {
    expect(rsvpRequestSchema.safeParse({ token, status: "attending", guests: 1, channel: "admin" }).success).toBe(false);
    expect(
      rsvpRequestSchema.safeParse({ token, status: "attending", guests: 1, channel: "form", familyId: "x" }).success,
    ).toBe(false);
  });
  it("rechaza token malformado", () => {
    expect(rsvpRequestSchema.safeParse({ token: "x", status: "declined", channel: "form" }).success).toBe(false);
  });
});

describe("familyFormSchema", () => {
  it("normaliza los espacios y conserva el nombre completo", () => {
    const parsed = familyFormSchema.parse({ name: "  Familia   Pérez  ", guestsInvited: "4", isActive: true });
    expect(parsed.name).toBe("Familia Pérez");
    expect(parsed.guestsInvited).toBe(4);
  });
  it("rechaza nombre vacío", () => {
    expect(familyFormSchema.safeParse({ name: "   ", guestsInvited: 2, isActive: true }).success).toBe(false);
    expect(familyFormSchema.safeParse({ name: "Grupo de jóvenes", guestsInvited: 2, isActive: true }).success).toBe(true);
  });
  it.each(["0", "-2", "51", "abc", "2.5", ""])("rechaza personas invitadas %j", (value) => {
    expect(familyFormSchema.safeParse({ name: "Gómez", guestsInvited: value, isActive: true }).success).toBe(false);
  });
});

describe("adminRsvpSchema", () => {
  it("permite pendiente con 0 personas", () => {
    expect(adminRsvpSchema.safeParse({ status: "pending", guests: "0" }).success).toBe(true);
  });
  it("exige al menos 1 persona si asisten", () => {
    expect(adminRsvpSchema.safeParse({ status: "attending", guests: "0" }).success).toBe(false);
    expect(adminRsvpSchema.safeParse({ status: "attending", guests: "3" }).success).toBe(true);
  });
  it("rechaza estados desconocidos", () => {
    expect(adminRsvpSchema.safeParse({ status: "maybe", guests: "1" }).success).toBe(false);
  });
});
