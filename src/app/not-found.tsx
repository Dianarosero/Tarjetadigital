import { MessageScreen } from "@/components/feedback/MessageScreen";
import { copy } from "@/config/copy";

export default function NotFound() {
  return <MessageScreen title={copy.screens.notFound.title} body={copy.screens.notFound.body} />;
}
