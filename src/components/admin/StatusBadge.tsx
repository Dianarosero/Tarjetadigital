import { cn } from "@/lib/utils/cn";
import type { FamilyOverview } from "@/types";

/** Estado legible de una invitación. Colores con contraste AA (texto oscuro sobre fondo claro). */
export function StatusBadge({ family }: { family: FamilyOverview }) {
  let label: string;
  let style: string;
  if (!family.isActive) {
    label = "Desactivada";
    style = "bg-slate-200 text-slate-800";
  } else if (!family.rsvp) {
    label = "Pendiente";
    style = "bg-amber-100 text-amber-900";
  } else if (family.rsvp.status === "attending") {
    label = "Asistirá";
    style = "bg-emerald-100 text-emerald-900";
  } else {
    label = "No asistirá";
    style = "bg-rose-100 text-rose-900";
  }
  return (
    <span className={cn("inline-block rounded-full px-3 py-1 text-sm font-semibold", style)}>{label}</span>
  );
}
