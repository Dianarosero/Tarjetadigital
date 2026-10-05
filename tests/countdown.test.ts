import { describe, expect, it } from "vitest";
import { getCountdownState, getEventCountdown, EVENT_START_MS, EVENT_DURATION_MS } from "@/lib/utils/countdown";

const HOUR = 3_600_000;

describe("getCountdownState", () => {
  const start = Date.parse("2026-10-18T16:00:00-05:00");
  const duration = 3 * HOUR;

  it("antes del evento descompone días/horas/minutos/segundos", () => {
    const now = start - (2 * 86_400_000 + 3 * HOUR + 4 * 60_000 + 5_000);
    expect(getCountdownState(now, start, duration)).toEqual({
      phase: "before", days: 2, hours: 3, minutes: 4, seconds: 5,
    });
  });
  it("un segundo antes todavía está en 'before' con 0/0/0/1", () => {
    expect(getCountdownState(start - 1000, start, duration)).toEqual({
      phase: "before", days: 0, hours: 0, minutes: 0, seconds: 1,
    });
  });
  it("a la hora exacta pasa a 'during' (nunca negativo)", () => {
    expect(getCountdownState(start, start, duration)).toEqual({ phase: "during" });
    expect(getCountdownState(start + duration - 1, start, duration)).toEqual({ phase: "during" });
  });
  it("al terminar la duración pasa a 'after'", () => {
    expect(getCountdownState(start + duration, start, duration)).toEqual({ phase: "after" });
    expect(getCountdownState(start + 400 * 86_400_000, start, duration)).toEqual({ phase: "after" });
  });
});

describe("evento real", () => {
  it("empieza el domingo 18/10/2026 a las 21:00 UTC (4:00 p.m. en Bogotá)", () => {
    expect(new Date(EVENT_START_MS).toISOString()).toBe("2026-10-18T21:00:00.000Z");
    expect(new Date(EVENT_START_MS).getUTCDay()).toBe(0); // domingo
  });
  it("es independiente de la zona horaria: mismo resultado sin importar el reloj local", () => {
    const now = Date.parse("2026-10-17T21:00:00Z"); // 24 h antes
    expect(getEventCountdown(now)).toEqual({ phase: "before", days: 1, hours: 0, minutes: 0, seconds: 0 });
  });
  it("la duración configurada son 3 horas", () => {
    expect(EVENT_DURATION_MS).toBe(3 * HOUR);
  });
});
