import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sesión del administrador SIN base de datos: una cookie firmada con HMAC.
 * La clave de firma es el propio ADMIN_ACCESS_TOKEN, así que rotar el token
 * invalida automáticamente todas las sesiones abiertas.
 * Este módulo es puro (sin Next) para poder probarlo con vitest.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días
const VERSION = "v1";

export function isValidAccessSecret(secret: string | undefined | null): secret is string {
  return typeof secret === "string" && secret.length >= 32;
}

/** Comparación en tiempo constante (hashea primero para igualar longitudes). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function signature(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signSession(secret: string, nowMs: number = Date.now()): string {
  const expires = Math.floor(nowMs / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${VERSION}.${expires}`;
  return `${payload}.${signature(secret, payload)}`;
}

export function verifySession(secret: string, value: string | undefined, nowMs: number = Date.now()): boolean {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [version, expiresRaw, sig] = parts as [string, string, string];
  if (version !== VERSION || !/^\d{1,12}$/.test(expiresRaw)) return false;
  if (Number(expiresRaw) * 1000 <= nowMs) return false;
  return safeEqual(sig, signature(secret, `${version}.${expiresRaw}`));
}
