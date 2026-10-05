import { NextResponse, type NextRequest } from "next/server";
import { getSiteSettings } from "@/config/site";
import { ADMIN_COOKIE, ADMIN_COOKIE_PATH } from "@/lib/auth/admin-session";
import { SESSION_MAX_AGE_SECONDS, isValidAccessSecret, safeEqual, signSession } from "@/lib/auth/session-token";

export const dynamic = "force-dynamic";

/**
 * Acceso del administrador con un ÚNICO enlace secreto:
 *   /admin/acceso/<ADMIN_ACCESS_TOKEN>
 * Si la clave coincide (comparación en tiempo constante) se crea una cookie de
 * sesión firmada (httpOnly, SameSite=Lax, 7 días) y se redirige a /admin.
 * Si no coincide responde 404 sin pistas. Sin contraseñas ni base de datos.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const secret = process.env.ADMIN_ACCESS_TOKEN;

  if (!isValidAccessSecret(secret) || !safeEqual(key, secret)) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const configuredSiteUrl = getSiteSettings().siteUrl;
  const destination = new URL("/admin", configuredSiteUrl ?? request.url);

  const response = NextResponse.redirect(destination, 303);
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: signSession(secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: ADMIN_COOKIE_PATH,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
