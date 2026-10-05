import { NextResponse, type NextRequest } from "next/server";
import { submitRsvp } from "@/lib/data/invitations";
import { rsvpRequestSchema } from "@/lib/validation/schemas";
import type { RsvpApiResponse, RsvpErrorCode } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_BY_CODE: Record<RsvpErrorCode, number> = {
  invalid: 400,
  not_found: 404,
  disabled: 403,
  already_responded: 409,
  too_many_guests: 422,
  server_error: 500,
};

function respond(body: RsvpApiResponse, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Rechaza peticiones de navegador originadas en otro sitio (defensa CSRF básica). */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // clientes no-navegador (curl, pruebas)
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * POST /api/rsvp — registra la respuesta de una familia.
 * Valida SIEMPRE en servidor (tipo de contenido, origen, forma del cuerpo con zod,
 * token, estado de la invitación y tope de invitados) antes de tocar la base de datos.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return respond({ ok: false, code: "invalid" }, 403);

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return respond({ ok: false, code: "invalid" }, 415);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ ok: false, code: "invalid" }, 400);
  }

  const parsed = rsvpRequestSchema.safeParse(body);
  if (!parsed.success) return respond({ ok: false, code: "invalid" }, 400);

  const result = await submitRsvp(parsed.data);
  if (result.ok) return respond({ ok: true, rsvp: result.rsvp }, 200);
  return respond(
    { ok: false, code: result.code, rsvp: result.rsvp, guestsInvited: result.guestsInvited },
    STATUS_BY_CODE[result.code],
  );
}
