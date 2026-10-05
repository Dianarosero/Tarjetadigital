"use client";

import { useEffect, useState } from "react";
import { copy } from "@/config/copy";
import { Card } from "@/components/ui/Card";
import { getEventCountdown, type CountdownState } from "@/lib/utils/countdown";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Cuenta regresiva hasta el instante exacto del evento (UTC-5), independiente de
 * la zona horaria del visitante. El estado empieza en `null` para que el HTML del
 * servidor y el primer render del cliente coincidan (sin errores de hidratación);
 * el valor real aparece al montar. Nunca muestra números negativos.
 */
export function Countdown() {
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    const tick = () => {
      const next = getEventCountdown(Date.now());
      setState(next);
      return next.phase;
    };
    if (tick() === "after") return;
    const id = window.setInterval(() => {
      if (tick() === "after") window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cells =
    state?.phase === "before"
      ? [
          { id: "days", label: copy.countdown.days, value: pad(state.days) },
          { id: "hours", label: copy.countdown.hours, value: pad(state.hours) },
        ]
      : [
          { id: "days", label: copy.countdown.days, value: "––" },
          { id: "hours", label: copy.countdown.hours, value: "––" },
        ];

  return (
    <section aria-labelledby="cuenta-titulo">
      <Card className="px-5 py-8 text-center">
        <h2 id="cuenta-titulo" className="font-script text-[2.6rem] leading-tight text-miel-deep">
          {copy.countdown.title}
        </h2>

        {state?.phase === "during" || state?.phase === "after" ? (
          <p role="status" className="mt-3 text-balance font-serif text-[1.6rem] font-semibold leading-snug">
            {state.phase === "during" ? copy.countdown.during : copy.countdown.after}
          </p>
        ) : (
          <div
            role="timer"
            aria-label="Cuenta regresiva hasta el Baby Shower"
            aria-busy={state === null}
            className="mt-5 grid grid-cols-2 gap-3"
          >
            {cells.map((cell) => (
              <div key={cell.id} className="rounded-2xl bg-cielo/70 px-2 py-4 ring-1 ring-miel/30">
                <p className="font-body text-[2.6rem] leading-none tabular-nums">{cell.value}</p>
                <p className="mt-2 pl-[0.18em] font-serif text-[0.8rem] font-bold tracking-[0.18em]">{cell.label}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
