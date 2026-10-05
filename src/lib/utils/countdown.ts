import { EVENT } from "@/config/event";

export type CountdownState =
  | { phase: "before"; days: number; hours: number; minutes: number; seconds: number }
  | { phase: "during" }
  | { phase: "after" };

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Calcula el estado de la cuenta regresiva a partir de instantes absolutos
 * (ms epoch), por lo que es independiente de la zona horaria del visitante.
 * Nunca devuelve valores negativos: al llegar la hora pasa a "during" y, al
 * terminar la duración del evento, a "after".
 */
export function getCountdownState(nowMs: number, startMs: number, durationMs: number): CountdownState {
  const diff = startMs - nowMs;
  if (diff > 0) {
    return {
      phase: "before",
      days: Math.floor(diff / DAY),
      hours: Math.floor((diff % DAY) / HOUR),
      minutes: Math.floor((diff % HOUR) / MINUTE),
      seconds: Math.floor((diff % MINUTE) / SECOND),
    };
  }
  return nowMs < startMs + durationMs ? { phase: "during" } : { phase: "after" };
}

export const EVENT_START_MS = new Date(EVENT.startsAtISO).getTime();
export const EVENT_DURATION_MS = EVENT.durationHours * HOUR;

export function getEventCountdown(nowMs: number): CountdownState {
  return getCountdownState(nowMs, EVENT_START_MS, EVENT_DURATION_MS);
}
