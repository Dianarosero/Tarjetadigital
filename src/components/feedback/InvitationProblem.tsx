import { copy } from "@/config/copy";
import type { InvitationProblemKind } from "@/types";
import { MessageScreen } from "./MessageScreen";
import { RetryButton } from "./RetryButton";

/** Estados de la invitación que no son "ok" ni "no encontrada". */
export function InvitationProblem({ kind }: { kind: InvitationProblemKind }) {
  switch (kind) {
    case "disabled":
      return <MessageScreen title={copy.screens.disabled.title} body={copy.screens.disabled.body} />;
    case "incomplete-data":
      return <MessageScreen title={copy.screens.incomplete.title} body={copy.screens.incomplete.body} />;
    case "error":
    default:
      return (
        <MessageScreen title={copy.screens.error.title} body={copy.screens.error.body}>
          <RetryButton label={copy.screens.error.retry} />
        </MessageScreen>
      );
  }
}
