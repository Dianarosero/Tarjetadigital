"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { copy } from "@/config/copy";
import { EVENT } from "@/config/event";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sparkle } from "@/components/ui/Sparkle";
import { cn } from "@/lib/utils/cn";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/utils/whatsapp";
import type { PublicRsvp, RsvpApiResponse, RsvpErrorCode } from "@/types";

type Channel = "form" | "whatsapp";
type Choice = "none" | "yes" | "no";
type Busy = null | "form" | "whatsapp" | "declined";
type Outcome = { kind: "response"; response: RsvpApiResponse } | { kind: "network" };

interface RsvpSectionProps {
  token: string;
  familyName: string;
  guestsInvited: number;
  /** Respuesta ya registrada (la respuesta es definitiva: solo el administrador la cambia). */
  initialRsvp: PublicRsvp | null;
  /** null = no hay número configurado → se oculta la opción de WhatsApp. */
  whatsappNumber: string | null;
}

const REQUEST_TIMEOUT_MS = 15_000;

async function sendRsvp(body: Record<string, unknown>): Promise<Outcome> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      // Permite que la petición termine aunque el navegador cambie a WhatsApp.
      keepalive: true,
    });
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    if (json && typeof json === "object" && "ok" in json) {
      return { kind: "response", response: json as RsvpApiResponse };
    }
    return { kind: "response", response: { ok: false, code: "server_error" } };
  } catch {
    return { kind: "network" };
  } finally {
    window.clearTimeout(timer);
  }
}

function messageForCode(code: RsvpErrorCode, guestsInvited: number): string {
  switch (code) {
    case "too_many_guests":
      return copy.errors.tooMany(guestsInvited);
    case "not_found":
    case "disabled":
      return copy.errors.unavailable;
    case "invalid":
      return copy.errors.invalid;
    default:
      return copy.errors.server;
  }
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20Z" strokeLinejoin="round" />
      <path d="M9 9.2c.3 2.6 2.4 4.7 5 5l1.2-1.3-2-1-.8.7a3.5 3.5 0 0 1-1.7-1.7l.7-.8-1-2L9 9.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Confirmación de asistencia.
 *  - Formulario simple (sí/no + número de personas) o botón de WhatsApp.
 *  - WhatsApp: al tocar el botón se GUARDA la confirmación (canal "whatsapp") y
 *    se abre el chat. El enlace <a> se abre de inmediato (sin await previo, para
 *    que iOS/Safari no bloquee la ventana) mientras la petición de guardado
 *    corre en paralelo; si falla, se avisa y queda el formulario como respaldo.
 *  - La respuesta es definitiva: una vez guardada, la interfaz solo la muestra.
 */
export function RsvpSection({ token, familyName, guestsInvited, initialRsvp, whatsappNumber }: RsvpSectionProps) {
  const invitationDisplay = familyName;
  const [choice, setChoice] = useState<Choice>("none");
  const [guests, setGuests] = useState(guestsInvited);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicRsvp | null>(initialRsvp);
  const [justSaved, setJustSaved] = useState(false);
  const [alreadyNote, setAlreadyNote] = useState(false);

  const busyRef = useRef(false);
  const doneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (justSaved) doneRef.current?.focus();
  }, [justSaved]);

  useEffect(() => {
    if (choice === "none") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [choice]);

  const submit = useCallback(
    async (status: "attending" | "declined", channel: Channel) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(status === "declined" ? "declined" : channel);
      setError(null);

      const outcome = await sendRsvp({
        token,
        status,
        channel,
        ...(status === "attending" ? { guests } : {}),
      });

      busyRef.current = false;
      setBusy(null);

      if (outcome.kind === "network") {
        setError(channel === "whatsapp" ? copy.errors.whatsappSaveFailed : copy.errors.network);
        return;
      }
      const response = outcome.response;
      if (response.ok) {
        setResult(response.rsvp);
        setJustSaved(true);
        return;
      }
      if (response.code === "already_responded" && response.rsvp) {
        setResult(response.rsvp);
        setAlreadyNote(true);
        setJustSaved(true);
        return;
      }
      setError(
        channel === "whatsapp" && response.code === "server_error"
          ? copy.errors.whatsappSaveFailed
          : messageForCode(response.code, response.guestsInvited ?? guestsInvited),
      );
    },
    [token, guests, guestsInvited],
  );

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit("attending", "form");
  };

  const onWhatsappClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (busyRef.current) {
      event.preventDefault();
      return;
    }
    // Sin preventDefault: el enlace abre WhatsApp ya; el guardado corre en paralelo.
    void submit("attending", "whatsapp");
  };

  const whatsappHref = whatsappNumber
    ? buildWhatsappUrl(
        whatsappNumber,
        buildWhatsappMessage({
          familyName,
          guests,
          recipient: EVENT.whatsappRecipient,
          babyName: EVENT.babyName,
        }),
      )
    : null;

  const isBusy = busy !== null;

  return (
    <section id="confirmar" aria-labelledby="rsvp-titulo" className="scroll-mt-4">
      <Card className="px-5 py-9 sm:px-8">
        <div className="text-center">
          <h2 id="rsvp-titulo" className="font-script text-[2.6rem] leading-[1.1] text-miel-deep">
            {copy.rsvp.title}
          </h2>
        </div>

        {result ? (
          <div ref={doneRef} tabIndex={-1} role="status" className="mt-4 text-center outline-none">
            <Sparkle className="mx-auto h-6 w-6" />
            <h3 className="mt-3 text-balance font-script text-[2.2rem] leading-tight text-miel-deep">
              {result.status === "attending"
                ? copy.rsvp.doneAttendingTitle(invitationDisplay)
                : copy.rsvp.doneDeclinedTitle(invitationDisplay)}
            </h3>
            <p className="mt-3 text-[1.1875rem] italic leading-relaxed">
              {result.status === "attending"
                ? copy.rsvp.doneAttendingBody(result.guestsConfirmed)
                : copy.rsvp.doneDeclinedBody}
            </p>
            {alreadyNote ? <p className="mt-3 text-[1rem] italic">{copy.rsvp.alreadyRegistered}</p> : null}
            <p className="mt-6 text-[0.98rem] italic opacity-90">{copy.rsvp.changeNote}</p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-[1.0625rem] italic">{copy.rsvp.invitedFor(guestsInvited)}</p>

            <div role="group" aria-label={copy.rsvp.title} className="mt-6 grid gap-3">
              <Button
                variant="gold"
                aria-pressed={choice === "yes"}
                disabled={isBusy}
                className={cn(choice === "yes" && "outline outline-[3px] outline-offset-2 outline-pizarra-dark")}
                onClick={() => {
                  setChoice("yes");
                  setError(null);
                }}
              >
                {copy.rsvp.yes}
              </Button>
              <Button
                variant="outline"
                aria-pressed={choice === "no"}
                disabled={isBusy}
                className={cn(choice === "no" && "bg-white")}
                onClick={() => {
                  setChoice("no");
                  setError(null);
                }}
              >
                {copy.rsvp.no}
              </Button>
            </div>

            <div ref={panelRef}>
              {choice === "yes" ? (
                <form
                  onSubmit={onFormSubmit}
                  noValidate
                  className="mt-5 space-y-5 rounded-3xl bg-cielo/55 p-5 ring-1 ring-miel/30"
                >
                  {guestsInvited > 1 ? (
                    <fieldset>
                      <legend className="mx-auto text-center font-serif text-[1.2rem] font-semibold">
                        {copy.rsvp.guestsQuestion}
                      </legend>
                      <div className="mt-3 flex items-center justify-center gap-4">
                        <button
                          type="button"
                          aria-label={copy.rsvp.lessGuests}
                          disabled={guests <= 1 || isBusy}
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          className="h-14 w-14 rounded-full bg-marfil text-[1.75rem] font-bold leading-none text-pizarra ring-2 ring-pizarra transition active:scale-95 disabled:opacity-40"
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <output aria-live="polite" className="min-w-[7.5rem] text-center">
                          <span className="block font-body text-[2.5rem] leading-none tabular-nums">
                            {guests}
                          </span>
                          <span className="mt-1 block font-serif text-[1rem] font-semibold tracking-wide">
                            {copy.rsvp.guestsUnit(guests)}
                          </span>
                        </output>
                        <button
                          type="button"
                          aria-label={copy.rsvp.moreGuests}
                          disabled={guests >= guestsInvited || isBusy}
                          onClick={() => setGuests((g) => Math.min(guestsInvited, g + 1))}
                          className="h-14 w-14 rounded-full bg-marfil text-[1.75rem] font-bold leading-none text-pizarra ring-2 ring-pizarra transition active:scale-95 disabled:opacity-40"
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>
                    </fieldset>
                  ) : null}

                  <div className="grid gap-3">
                    <Button type="submit" variant="gold" disabled={isBusy}>
                      {busy === "form" ? copy.rsvp.sending : copy.rsvp.send}
                    </Button>
                    {whatsappHref ? (
                      <>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={isBusy || undefined}
                          onClick={onWhatsappClick}
                          className={buttonClasses("slate")}
                        >
                          <ChatIcon className="h-6 w-6 shrink-0" />
                          {busy === "whatsapp" ? copy.rsvp.sending : copy.rsvp.whatsapp}
                        </a>
                        <p className="text-center text-[0.95rem] italic">{copy.rsvp.whatsappHint}</p>
                      </>
                    ) : null}
                  </div>
                </form>
              ) : null}

              {choice === "no" ? (
                <div className="mt-5 space-y-3 rounded-3xl bg-cielo/55 p-5 text-center ring-1 ring-miel/30">
                  <p className="font-serif text-[1.2rem] font-semibold">{copy.rsvp.declineAsk}</p>
                  <Button variant="slate" disabled={isBusy} onClick={() => void submit("declined", "form")}>
                    {busy === "declined" ? copy.rsvp.sending : copy.rsvp.declineSend}
                  </Button>
                  <Button variant="outline" disabled={isBusy} onClick={() => setChoice("none")}>
                    {copy.rsvp.back}
                  </Button>
                </div>
              ) : null}
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[1rem] not-italic leading-snug text-rose-900 ring-1 ring-rose-300"
              >
                {error}
              </p>
            ) : null}
          </>
        )}
      </Card>
    </section>
  );
}
