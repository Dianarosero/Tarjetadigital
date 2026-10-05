import { describe, expect, it } from "vitest";
import { normalizeInvitationName } from "@/lib/utils/names";

describe("nombres de invitación", () => {
  it("normaliza espacios y conserva la denominación escrita", () => {
    expect(normalizeInvitationName("  Familia   Pérez  ")).toBe("Familia Pérez");
    expect(normalizeInvitationName("  Ana   y   Luis  ")).toBe("Ana y Luis");
  });
  it("conserva nombres de personas y grupos", () => {
    expect(normalizeInvitationName("Carlos Pérez")).toBe("Carlos Pérez");
    expect(normalizeInvitationName("Grupo de jóvenes")).toBe("Grupo de jóvenes");
  });
  it("normaliza Unicode", () => {
    expect(normalizeInvitationName("Jose\u0301")).toBe("José");
  });
});
