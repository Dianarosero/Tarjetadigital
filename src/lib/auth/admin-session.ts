import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isValidAccessSecret, verifySession } from "./session-token";

export const ADMIN_COOKIE = "bs_admin";
/** La cookie solo viaja a rutas /admin (mínimo alcance). */
export const ADMIN_COOKIE_PATH = "/admin";

export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_ACCESS_TOKEN;
  if (!isValidAccessSecret(secret)) return false;
  const store = await cookies();
  return verifySession(secret, store.get(ADMIN_COOKIE)?.value);
}

/**
 * Protege páginas y Server Actions del panel. Sin sesión válida responde 404 (no
 * revela que el panel existe). Se llama en CADA página y acción (no solo en un
 * layout ni en un middleware) para que ninguna ruta quede desprotegida.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) notFound();
}
