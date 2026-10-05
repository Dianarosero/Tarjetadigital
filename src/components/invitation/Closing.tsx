import { copy } from "@/config/copy";
import { Sparkle } from "@/components/ui/Sparkle";
import { LionTransition } from "./LionTransition";

/** Cierre emotivo y crédito de diseño. */
export function Closing() {
  return (
    <footer className="px-2 pb-12 pt-6 text-center">
      <LionTransition />
      <div aria-hidden="true" className="mb-2 flex items-end justify-center gap-3">
        <Sparkle className="h-4 w-4" delay={0.4} />
        <Sparkle className="h-6 w-6" />
        <Sparkle className="h-4 w-4" delay={1.1} />
      </div>
      <p className="text-balance font-script text-[2.8rem] leading-tight text-miel-deep">{copy.closing.message}</p>
      <p className="mt-6 text-[0.95rem] italic">{copy.closing.footer}</p>
    </footer>
  );
}
