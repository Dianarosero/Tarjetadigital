"use client";

import { useEffect } from "react";
import { MessageScreen } from "@/components/feedback/MessageScreen";
import { Button } from "@/components/ui/Button";
import { copy } from "@/config/copy";

/** Último recurso ante una excepción inesperada al renderizar. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] error de renderizado:", error.digest ?? error.message);
  }, [error]);

  return (
    <MessageScreen title={copy.screens.error.title} body={copy.screens.error.body}>
      <Button variant="slate" onClick={reset}>
        {copy.screens.error.retry}
      </Button>
    </MessageScreen>
  );
}
