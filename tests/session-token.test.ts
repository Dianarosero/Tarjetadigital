import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  isValidAccessSecret,
  safeEqual,
  signSession,
  verifySession,
} from "@/lib/auth/session-token";

const secret = "s".repeat(40);
const now = Date.parse("2026-10-01T00:00:00Z");

describe("sesión de administrador", () => {
  it("una sesión recién firmada es válida", () => {
    expect(verifySession(secret, signSession(secret, now), now + 1000)).toBe(true);
  });
  it("expira a los 7 días", () => {
    const value = signSession(secret, now);
    expect(verifySession(secret, value, now + (SESSION_MAX_AGE_SECONDS - 5) * 1000)).toBe(true);
    expect(verifySession(secret, value, now + (SESSION_MAX_AGE_SECONDS + 5) * 1000)).toBe(false);
  });
  it("rechaza firmas manipuladas, otra clave y formatos inválidos", () => {
    const value = signSession(secret, now);
    const [v, exp, sig] = value.split(".") as [string, string, string];
    expect(verifySession(secret, `${v}.${Number(exp) + 9999}.${sig}`, now)).toBe(false);
    expect(verifySession(secret, `${v}.${exp}.${sig.slice(0, -2)}xx`, now)).toBe(false);
    expect(verifySession("otra-clave-distinta-de-32-caracteres!!", value, now)).toBe(false);
    expect(verifySession(secret, undefined, now)).toBe(false);
    expect(verifySession(secret, "basura", now)).toBe(false);
    expect(verifySession(secret, "v1.abc.def", now)).toBe(false);
  });
  it("exige un secreto de al menos 32 caracteres", () => {
    expect(isValidAccessSecret("corto")).toBe(false);
    expect(isValidAccessSecret(undefined)).toBe(false);
    expect(isValidAccessSecret(secret)).toBe(true);
  });
  it("safeEqual compara en tiempo constante y distingue valores", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
