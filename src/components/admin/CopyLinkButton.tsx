"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/** Copia el enlace de invitación al portapapeles (con respaldo para navegadores antiguos). */
export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = url;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        setState(ok ? "copied" : "failed");
      } catch {
        setState("failed");
      }
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "min-h-[2.75rem] rounded-full bg-pizarra px-4 text-sm font-semibold text-marfil hover:bg-pizarra-dark",
          className,
        )}
      >
        {state === "copied" ? "¡Copiado!" : "Copiar enlace"}
      </button>
      <span role="status" className="sr-only">
        {state === "copied" ? "Enlace copiado" : state === "failed" ? "No se pudo copiar el enlace" : ""}
      </span>
    </>
  );
}
