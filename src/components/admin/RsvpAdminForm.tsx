"use client";

import { useActionState, useState } from "react";
import { MAX_GUESTS } from "@/lib/validation/schemas";
import type { ActionState, FamilyOverview } from "@/types";

interface RsvpAdminFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  family: FamilyOverview;
}

const initial: ActionState = { status: "idle" };

/** El administrador fija, corrige o elimina (Pendiente) la respuesta de una invitación. */
export function RsvpAdminForm({ action, family }: RsvpAdminFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [status, setStatus] = useState<"pending" | "attending" | "declined">(family.rsvp?.status ?? "pending");
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[14rem_10rem_auto] sm:items-start">
      <div>
        <label htmlFor="rsvp-status" className="text-sm font-semibold">
          Respuesta
        </label>
        <select
          id="rsvp-status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="mt-1 block min-h-[2.75rem] w-full rounded-xl border border-pizarra/40 bg-white px-3 text-base"
        >
          <option value="pending">Pendiente (sin respuesta)</option>
          <option value="attending">Asistirán</option>
          <option value="declined">No asistirán</option>
        </select>
      </div>

      <div>
        <label htmlFor="rsvp-guests" className="text-sm font-semibold">
          Personas que asisten
        </label>
        <input
          id="rsvp-guests"
          name="guests"
          type="number"
          inputMode="numeric"
          min={status === "attending" ? 1 : 0}
          max={MAX_GUESTS}
          disabled={status !== "attending"}
          defaultValue={(state.status === "error" ? state.values?.guests : undefined) ?? (family.rsvp?.guestsConfirmed || family.guestsInvited)}
          aria-invalid={errors.guests ? true : undefined}
          className="mt-1 block min-h-[2.75rem] w-full rounded-xl border border-pizarra/40 bg-white px-3 text-base disabled:bg-slate-100 disabled:text-slate-500"
        />
        {errors.guests ? <p className="mt-1 text-sm font-medium text-rose-800">{errors.guests}</p> : null}
        <p className="mt-1 text-xs text-pizarra/80">Máximo {MAX_GUESTS}.</p>
      </div>

      <div className="sm:pt-6">
        <button
          type="submit"
          disabled={pending}
          className="min-h-[2.75rem] rounded-full bg-pizarra px-5 text-base font-bold text-marfil hover:bg-pizarra-dark disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar respuesta"}
        </button>
      </div>

      {state.status !== "idle" && state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`sm:col-span-3 rounded-xl px-3 py-2 text-sm font-medium ${
            state.status === "error" ? "bg-rose-50 text-rose-900" : "bg-emerald-50 text-emerald-900"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
