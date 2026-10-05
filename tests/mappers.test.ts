import { describe, expect, it } from "vitest";
import { computeSummary, toFamilyOverview, toPublicInvitation } from "@/lib/data/mappers";

const row = {
  id: "9b2f4c1e-5d3a-4f6b-8c7d-0a1b2c3d4e5f",
  name: "Pérez",
  token: "AbC123xyz789QRst",
  guests_invited: 4,
  is_active: true,
  created_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-10-01T10:00:00Z",
  rsvp_status: null,
  rsvp_guests_confirmed: null,
  rsvp_channel: null,
  rsvp_responded_at: null,
};

describe("toFamilyOverview", () => {
  it("convierte una familia pendiente", () => {
    const family = toFamilyOverview(row);
    expect(family?.rsvp).toBeNull();
    expect(family?.guestsInvited).toBe(4);
  });
  it("convierte una familia con respuesta", () => {
    const family = toFamilyOverview({
      ...row, rsvp_status: "attending", rsvp_guests_confirmed: 3, rsvp_channel: "whatsapp", rsvp_responded_at: "2026-10-02T10:00:00Z",
    });
    expect(family?.rsvp).toEqual({ status: "attending", guestsConfirmed: 3, channel: "whatsapp", respondedAt: "2026-10-02T10:00:00Z" });
  });
  it("devuelve null con datos incompletos o incoherentes", () => {
    expect(toFamilyOverview({ ...row, name: "" })).toBeNull();
    expect(toFamilyOverview({ ...row, token: "x" })).toBeNull();
    expect(toFamilyOverview({ ...row, guests_invited: null })).toBeNull();
    expect(toFamilyOverview({ ...row, rsvp_status: "attending" })).toBeNull(); // estado sin personas/canal/fecha
    expect(toFamilyOverview(null)).toBeNull();
  });
});

describe("toPublicInvitation", () => {
  it("no expone id, token ni canal al navegador", () => {
    const family = toFamilyOverview({
      ...row, rsvp_status: "declined", rsvp_guests_confirmed: 0, rsvp_channel: "form", rsvp_responded_at: "2026-10-02T10:00:00Z",
    })!;
    const pub = toPublicInvitation(family);
    expect(pub).toEqual({ familyName: "Pérez", guestsInvited: 4, rsvp: { status: "declined", guestsConfirmed: 0 } });
    expect(JSON.stringify(pub)).not.toContain(row.token);
    expect(JSON.stringify(pub)).not.toContain(row.id);
  });
});

describe("computeSummary", () => {
  it("cuenta solo familias activas y separa las desactivadas", () => {
    const mk = (over: Record<string, unknown>) => toFamilyOverview({ ...row, ...over })!;
    const families = [
      mk({}),
      mk({ rsvp_status: "attending", rsvp_guests_confirmed: 3, rsvp_channel: "form", rsvp_responded_at: "2026-10-02T10:00:00Z" }),
      mk({ rsvp_status: "declined", rsvp_guests_confirmed: 0, rsvp_channel: "form", rsvp_responded_at: "2026-10-02T10:00:00Z", guests_invited: 2 }),
      mk({ is_active: false, rsvp_status: "attending", rsvp_guests_confirmed: 4, rsvp_channel: "admin", rsvp_responded_at: "2026-10-02T10:00:00Z" }),
    ];
    expect(computeSummary(families)).toEqual({
      totalFamilies: 3, attending: 1, declined: 1, pending: 1, guestsInvited: 10, guestsConfirmed: 3, disabled: 1,
    });
  });
});
