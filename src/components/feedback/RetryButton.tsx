"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";

/** Vuelve a pedir la página al servidor (útil tras un fallo temporal). */
export function RetryButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="slate" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
      {pending ? "…" : label}
    </Button>
  );
}
