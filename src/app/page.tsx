import { MessageScreen } from "@/components/feedback/MessageScreen";
import { copy } from "@/config/copy";

/** Raíz neutra: las invitaciones son privadas y solo se abren con su enlace personal. */
export default function HomePage() {
  return <MessageScreen title={copy.screens.landing.title} body={copy.screens.landing.body} />;
}
