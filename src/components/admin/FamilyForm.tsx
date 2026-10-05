"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/types";

interface FamilyFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  defaults?: { name: string; guestsInvited: number; isActive: boolean };
}

const initial: ActionState = { status: "idle" };

const inputClass =
  "mt-1 block min-h-[2.75rem] w-full rounded-xl border border-pizarra/40 bg-white px-3 text-base text-pizarra-ink";

export function FamilyForm({ action, mode, defaults }: FamilyFormProps) {
  const [state, formAction, pending] = useActionState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (mode === "create" && state.status === "success") formRef.current?.reset();
  }, [mode, state]);

  const errors = state.fieldErrors ?? {};
  // Tras un error se conserva lo escrito; tras un éxito (o al inicio) se usan los valores por defecto.
  const keep = state.status === "error" ? state.values : undefined;

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-start">
      <div>
        <label htmlFor={`${mode}-name`} className="text-sm font-semibold">
          Nombre de la invitación
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            id={`${mode}-name`}
            name="name"
            required
            maxLength={80}
            autoComplete="off"
            defaultValue={keep?.name ?? defaults?.name}
            placeholder="Ej. Ana y Luis"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${mode}-name-error` : undefined}
            className={`${inputClass} !mt-0`}
          />
        </div>
        {errors.name ? (
          <p id={`${mode}-name-error`} className="mt-1 text-sm font-medium text-rose-800">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={`${mode}-guests`} className="text-sm font-semibold">
          Personas invitadas
        </label>
        <input
          id={`${mode}-guests`}
          name="guestsInvited"
          type="number"
          inputMode="numeric"
          min={1}
          max={50}
          required
          defaultValue={keep?.guestsInvited ?? defaults?.guestsInvited ?? 2}
          aria-invalid={errors.guestsInvited ? true : undefined}
          aria-describedby={errors.guestsInvited ? `${mode}-guests-error` : undefined}
          className={inputClass}
        />
        {errors.guestsInvited ? (
          <p id={`${mode}-guests-error`} className="mt-1 text-sm font-medium text-rose-800">
            {errors.guestsInvited}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:pt-6">
        {mode === "edit" ? (
          <label className="flex min-h-[2.75rem] items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={defaults?.isActive ?? true}
              className="h-5 w-5 accent-[#2b4c68]"
            />
            Invitación activa
          </label>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="min-h-[2.75rem] rounded-full bg-miel-light px-5 text-base font-bold text-pizarra-ink ring-1 ring-miel-deep/30 hover:brightness-105 disabled:opacity-60"
        >
          {pending ? "Guardando…" : mode === "create" ? "Crear invitación" : "Guardar cambios"}
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
