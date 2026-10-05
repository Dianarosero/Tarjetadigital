import { describe, expect, it } from "vitest";
import { buildWhatsappMessage, buildWhatsappUrl, sanitizeWhatsappNumber } from "@/lib/utils/whatsapp";

describe("sanitizeWhatsappNumber", () => {
  it.each([
    ["+57 300 123 4567", "573001234567"],
    ["573001234567", "573001234567"],
    ["(57) 300-123-4567", "573001234567"],
    ["00573001234567", "573001234567"],
  ])("normaliza %j", (input, expected) => {
    expect(sanitizeWhatsappNumber(input)).toBe(expected);
  });
  it.each([undefined, null, "", "abc", "123", "1".repeat(16)])("rechaza %j", (input) => {
    expect(sanitizeWhatsappNumber(input)).toBeNull();
  });
});

describe("buildWhatsappMessage / buildWhatsappUrl", () => {
  const base = { familyName: "Pérez", recipient: "Luis Carlos", babyName: "Juan José" };
  it("incluye el nombre de invitación, evento y número de personas (plural)", () => {
    expect(buildWhatsappMessage({ ...base, guests: 4 })).toBe(
      "Hola Luis Carlos, Pérez confirma su asistencia al Baby Shower de Juan José. Asistiremos 4 personas.",
    );
  });
  it("usa singular para 1 persona", () => {
    expect(buildWhatsappMessage({ ...base, guests: 1 })).toContain("Asistiremos 1 persona.");
  });
  it("codifica el texto para la URL de wa.me", () => {
    const url = buildWhatsappUrl("573001234567", "Hola, ¿qué tal? & más");
    expect(url.startsWith("https://wa.me/573001234567?text=")).toBe(true);
    expect(url).not.toMatch(/\s/);
    expect(decodeURIComponent(url.split("text=")[1] ?? "")).toBe("Hola, ¿qué tal? & más");
  });
});
