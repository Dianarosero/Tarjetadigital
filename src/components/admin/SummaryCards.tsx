import type { SummaryStats } from "@/types";

/** Resumen de confirmaciones (solo invitaciones activas). */
export function SummaryCards({ stats }: { stats: SummaryStats }) {
  const items: Array<{ label: string; value: number; hint?: string }> = [
    { label: "Invitaciones", value: stats.totalFamilies },
    { label: "Confirmadas", value: stats.attending, hint: "invitaciones" },
    { label: "Pendientes", value: stats.pending, hint: "invitaciones" },
    { label: "No asistirán", value: stats.declined, hint: "invitaciones" },
    { label: "Personas invitadas", value: stats.guestsInvited },
    { label: "Personas confirmadas", value: stats.guestsConfirmed },
  ];
  return (
    <section aria-label="Resumen de confirmaciones">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-pizarra/10">
            <dt className="text-sm font-semibold text-pizarra/80">{item.label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-pizarra">{item.value}</dd>
          </div>
        ))}
      </dl>
      {stats.disabled > 0 ? (
        <p className="mt-2 text-sm text-pizarra/80">
          {stats.disabled} {stats.disabled === 1 ? "invitación desactivada no se cuenta" : "invitaciones desactivadas no se cuentan"} en el
          resumen.
        </p>
      ) : null}
    </section>
  );
}
