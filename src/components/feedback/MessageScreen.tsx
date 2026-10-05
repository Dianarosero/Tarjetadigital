import type { ReactNode } from "react";
import { Asset } from "@/components/ui/Asset";
import { Sparkle } from "@/components/ui/Sparkle";

interface MessageScreenProps {
  title: string;
  body: string;
  children?: ReactNode;
}

/** Pantalla centrada con el lenguaje visual de la invitación (estados vacíos y de error). */
export function MessageScreen({ title, body, children }: MessageScreenProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[30rem] items-center justify-center px-6 py-10">
      <div className="relative w-full rounded-t-full rounded-b-[2.5rem] bg-marfil/90 px-7 pb-10 pt-[22%] text-center shadow-card ring-1 ring-miel/40">
        <Sparkle className="absolute left-[24%] top-[12%] h-5 w-5" />
        <Sparkle className="absolute right-[24%] top-[16%] h-4 w-4" delay={1.2} />
        <Asset name="lion" className="mx-auto h-auto w-40" />
        <h1 className="mt-4 text-balance font-serif text-[1.65rem] font-semibold leading-tight tracking-wide text-pizarra">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-[22rem] text-balance text-[1.0625rem] italic leading-relaxed">{body}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </main>
  );
}
