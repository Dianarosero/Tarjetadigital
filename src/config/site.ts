import "server-only";
import type { SiteSettings } from "@/types";
import { sanitizeWhatsappNumber } from "@/lib/utils/whatsapp";

function cleanHttpUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Lee la configuración editable desde variables de entorno (solo servidor). */
export function getSiteSettings(): SiteSettings {
  const siteUrl = cleanHttpUrl(process.env.SITE_URL);
  return {
    whatsappNumber: sanitizeWhatsappNumber(process.env.WHATSAPP_NUMBER),
    siteUrl: siteUrl ? siteUrl.replace(/\/+$/, "") : null,
  };
}
