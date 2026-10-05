import { EVENT } from "@/config/event";

const formatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: EVENT.timezone,
});

/** Fecha y hora legibles en hora de Colombia (para el panel admin). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : formatter.format(date);
}
