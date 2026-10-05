import "server-only";
import { headers } from "next/headers";
import { getSiteSettings } from "@/config/site";

/** URL pública del sitio: SITE_URL si existe; si no, la deduce de la petición. */
export async function getBaseUrl(): Promise<string> {
  const configured = getSiteSettings().siteUrl;
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
