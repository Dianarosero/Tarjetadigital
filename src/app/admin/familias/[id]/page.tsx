import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteFamilyAction, setRsvpAction, updateFamilyAction } from "../../actions";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { FamilyForm } from "@/components/admin/FamilyForm";
import { RsvpAdminForm } from "@/components/admin/RsvpAdminForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth/admin-session";
import { getFamilyById } from "@/lib/data/families";
import { getBaseUrl } from "@/lib/utils/base-url";
import { formatDateTime } from "@/lib/utils/dates";
import { uuidSchema } from "@/lib/validation/schemas";

const CHANNEL_LABEL = { form: "formulario", whatsapp: "WhatsApp", admin: "administrador" } as const;

const panel = "rounded-2xl bg-white p-5 shadow-soft ring-1 ring-pizarra/10";

export default async function FamilyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const result = await getFamilyById(id);
  if (!result.ok) {
    return (
      <p role="alert" className="rounded-2xl bg-rose-50 p-4 font-medium text-rose-900 ring-1 ring-rose-300">
        No pudimos cargar la invitación. {result.message}
      </p>
    );
  }
  const family = result.data;
  if (!family) notFound();

  const baseUrl = await getBaseUrl();
  const inviteUrl = `${baseUrl}/invitacion/${family.token}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex min-h-[2.75rem] items-center text-sm font-semibold text-pizarra underline">
          ← Volver al listado
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-pizarra">{family.name}</h1>
          <StatusBadge family={family} />
        </div>
        {family.rsvp ? (
          <p className="mt-1 text-sm text-pizarra/90">
            Respondió el {formatDateTime(family.rsvp.respondedAt)} por {CHANNEL_LABEL[family.rsvp.channel]}.
          </p>
        ) : null}
      </div>

      <section aria-labelledby="enlace-titulo" className={panel}>
        <h2 id="enlace-titulo" className="text-lg font-bold text-pizarra">
          Enlace de invitación
        </h2>
        <p className="mt-1 text-sm text-pizarra/80">Envía este enlace solo a sus destinatarios. Es personal.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            readOnly
            aria-label="Enlace de invitación"
            value={inviteUrl}
            className="min-h-[2.75rem] min-w-0 flex-1 rounded-xl border border-pizarra/40 bg-slate-50 px-3 text-sm"
          />
          <CopyLinkButton url={inviteUrl} />
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[2.75rem] items-center rounded-full px-4 text-sm font-semibold text-pizarra ring-1 ring-pizarra/40 hover:bg-cielo/60"
          >
            Abrir
          </a>
        </div>
      </section>

      <section aria-labelledby="datos-titulo" className={panel}>
        <h2 id="datos-titulo" className="mb-3 text-lg font-bold text-pizarra">
          Datos de la invitación
        </h2>
        <FamilyForm
          mode="edit"
          action={updateFamilyAction.bind(null, family.id)}
          defaults={{ name: family.name, guestsInvited: family.guestsInvited, isActive: family.isActive }}
        />
        <p className="mt-3 text-sm text-pizarra/80">
          Si desactivas la invitación, el enlace deja de funcionar y sus destinatarios verán un aviso, pero no se pierde su respuesta.
        </p>
      </section>

      <section aria-labelledby="rsvp-titulo" className={panel}>
        <h2 id="rsvp-titulo" className="text-lg font-bold text-pizarra">
          Respuesta de los invitados
        </h2>
        <p className="mb-3 mt-1 text-sm text-pizarra/80">
          Los invitados no pueden cambiar su respuesta una vez enviada: solo tú, desde aquí. “Pendiente” la elimina.
        </p>
        <RsvpAdminForm action={setRsvpAction.bind(null, family.id)} family={family} />
      </section>

      <section aria-labelledby="peligro-titulo" className="rounded-2xl bg-white p-5 ring-1 ring-rose-300">
        <details>
          <summary
            id="peligro-titulo"
            className="flex min-h-[2.75rem] cursor-pointer items-center text-lg font-bold text-rose-900"
          >
            Eliminar esta invitación
          </summary>
          <p className="mt-2 text-sm">
            Se borrará la invitación, su enlace y su respuesta. No se puede deshacer. Si solo quieres cerrar el enlace,
            desactiva la invitación en lugar de eliminarla.
          </p>
          <form action={deleteFamilyAction.bind(null, family.id)} className="mt-3">
            <button
              type="submit"
              className="min-h-[2.75rem] rounded-full bg-rose-800 px-5 text-base font-bold text-white hover:bg-rose-900"
            >
              Sí, eliminar definitivamente
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
