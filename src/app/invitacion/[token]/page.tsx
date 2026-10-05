import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationProblem } from "@/components/feedback/InvitationProblem";
import { Closing } from "@/components/invitation/Closing";
import { Countdown } from "@/components/invitation/Countdown";
import { EventDetails } from "@/components/invitation/EventDetails";
import { InvitationExperience } from "@/components/invitation/InvitationExperience";
import { RsvpSection } from "@/components/invitation/RsvpSection";
import { Welcome } from "@/components/invitation/Welcome";
import { Divider } from "@/components/ui/Divider";
import { getSiteSettings } from "@/config/site";
import { getInvitationByToken } from "@/lib/data/invitations";

// Datos privados y cambiantes (la respuesta de la familia): nunca se cachea esta página.
export const dynamic = "force-dynamic";

// Metadatos genéricos: el título/preview jamás revela el nombre de una familia.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lookup = await getInvitationByToken(token);

  if (lookup.kind === "invalid-token" || lookup.kind === "not-found") notFound();
  if (lookup.kind !== "ok") return <InvitationProblem kind={lookup.kind} />;

  const { invitation } = lookup;
  const settings = getSiteSettings();
  const invitationDisplay = invitation.familyName;

  return (
    <>
      {/* Sin JavaScript el sobre no puede abrirse: se muestra el contenido directamente. */}
      <noscript>
        <style>{"#invitacion-contenido[hidden]{display:block!important}"}</style>
      </noscript>
      <InvitationExperience familyDisplay={invitationDisplay}>
        <div className="mx-auto w-full max-w-[30rem] space-y-6 px-6 pb-2 pt-6 md:max-w-[34rem]">
          <Welcome familyDisplay={invitationDisplay} />
          <Divider />
          <EventDetails />
          <Countdown />
          <RsvpSection
            token={token}
            familyName={invitation.familyName}
            guestsInvited={invitation.guestsInvited}
            initialRsvp={invitation.rsvp}
            whatsappNumber={settings.whatsappNumber}
          />
          <Divider />
          <Closing />
        </div>
      </InvitationExperience>
    </>
  );
}
