import Link from "next/link";
import { createFamilyAction } from "./actions";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { FamilyForm } from "@/components/admin/FamilyForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SummaryCards } from "@/components/admin/SummaryCards";
import { requireAdmin } from "@/lib/auth/admin-session";
import { computeSummary } from "@/lib/data/mappers";
import { listFamilies } from "@/lib/data/families";
import { getBaseUrl } from "@/lib/utils/base-url";
import { formatDateTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import type { FamilyOverview } from "@/types";

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "pendientes", label: "Pendientes" },
  { key: "confirmadas", label: "Confirmadas" },
  { key: "no-asisten", label: "No asisten" },
  { key: "desactivadas", label: "Desactivadas" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function parseFilter(value: string | undefined): FilterKey {
  return FILTERS.find((f) => f.key === value)?.key ?? "todas";
}

function applyFilter(families: FamilyOverview[], filter: FilterKey): FamilyOverview[] {
  switch (filter) {
    case "pendientes":
      return families.filter((f) => f.isActive && !f.rsvp);
    case "confirmadas":
      return families.filter((f) => f.isActive && f.rsvp?.status === "attending");
    case "no-asisten":
      return families.filter((f) => f.isActive && f.rsvp?.status === "declined");
    case "desactivadas":
      return families.filter((f) => !f.isActive);
    default:
      return families;
  }
}

const CHANNEL_LABEL = { form: "formulario", whatsapp: "WhatsApp", admin: "administrador" } as const;

const GRID = "md:grid md:grid-cols-[minmax(0,2fr)_5.5rem_8rem_6.5rem_minmax(0,1.6fr)_auto] md:items-center md:gap-4";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireAdmin();
  const { estado } = await searchParams;
  const filter = parseFilter(estado);

  const result = await listFamilies();
  if (!result.ok) {
    return (
      <p role="alert" className="rounded-2xl bg-rose-50 p-4 font-medium text-rose-900 ring-1 ring-rose-300">
        No pudimos cargar las invitaciones. {result.message} Revisa la conexión con Supabase y las variables de entorno.
      </p>
    );
  }

  const families = result.data;
  const stats = computeSummary(families);
  const visible = applyFilter(families, filter);
  const baseUrl = await getBaseUrl();

  return (
    <div className="space-y-8">
      <SummaryCards stats={stats} />

      <section aria-labelledby="alta-titulo" className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-pizarra/10">
        <details open>
          <summary
            id="alta-titulo"
            className="flex min-h-[2.75rem] cursor-pointer items-center text-lg font-bold text-pizarra"
          >
            Agregar invitación
          </summary>
          <div className="mt-4">
            <FamilyForm action={createFamilyAction} mode="create" />
            <p className="mt-3 text-sm text-pizarra/80">
              Escribe el nombre que quieres mostrar, por ejemplo “Carlos Pérez”, “Ana y Luis” o “Grupo de jóvenes”.
              El enlace personal se genera solo.
            </p>
          </div>
        </details>
      </section>

      <section aria-labelledby="lista-titulo" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="lista-titulo" className="text-xl font-bold text-pizarra">
            Invitaciones <span className="text-base font-semibold text-pizarra/70">({visible.length})</span>
          </h1>
          <nav aria-label="Filtrar invitaciones" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "todas" ? "/admin" : `/admin?estado=${f.key}`}
                aria-current={filter === f.key ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[2.5rem] items-center rounded-full px-4 text-sm font-semibold ring-1 ring-pizarra/40",
                  filter === f.key ? "bg-pizarra text-marfil" : "bg-white text-pizarra hover:bg-cielo/60",
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center ring-1 ring-pizarra/10">
            {families.length === 0
              ? "Aún no hay invitaciones. Agrega la primera con el formulario de arriba."
              : "No hay invitaciones en este filtro."}
          </p>
        ) : (
          <div>
            <div
              aria-hidden="true"
              className={cn("hidden px-4 pb-2 text-sm font-semibold text-pizarra/80", GRID)}
            >
              <span>Invitación</span>
              <span>Invitados</span>
              <span>Estado</span>
              <span>Confirman</span>
              <span>Respuesta</span>
              <span className="w-[16rem]">Acciones</span>
            </div>
            <ul className="space-y-3">
              {visible.map((family) => (
                <li
                  key={family.id}
                  className={cn(
                    "space-y-2 rounded-2xl bg-white p-4 ring-1 ring-pizarra/10 md:space-y-0",
                    GRID,
                    !family.isActive && "opacity-80",
                  )}
                >
                  <p className="text-lg font-bold md:text-base">{family.name}</p>
                  <p>
                    <span className="text-sm text-pizarra/80 md:hidden">Invitados: </span>
                    <span className="font-semibold tabular-nums">{family.guestsInvited}</span>
                  </p>
                  <div>
                    <StatusBadge family={family} />
                  </div>
                  <p>
                    <span className="text-sm text-pizarra/80 md:hidden">Confirman: </span>
                    <span className="font-semibold tabular-nums">
                      {family.rsvp?.status === "attending" ? family.rsvp.guestsConfirmed : "—"}
                    </span>
                  </p>
                  <p className="text-sm text-pizarra/90">
                    {family.rsvp
                      ? `${formatDateTime(family.rsvp.respondedAt)} · ${CHANNEL_LABEL[family.rsvp.channel]}`
                      : "Sin respuesta"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 md:w-[16rem] md:pt-0">
                    <CopyLinkButton url={`${baseUrl}/invitacion/${family.token}`} />
                    <Link
                      href={`/admin/familias/${family.id}`}
                      className="inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-sm font-semibold text-pizarra ring-1 ring-pizarra/40 hover:bg-cielo/60"
                    >
                      Editar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
