import { Asset } from "@/components/ui/Asset";

/** Ilustración decorativa que encabeza la invitación después de abrir el sobre. */
export function LionTransition() {
  return (
    <div className="lion-transition" aria-hidden="true">
      <Asset name="lionTransition" className="lion-transition__gif" />
    </div>
  );
}
