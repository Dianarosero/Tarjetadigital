import { copy } from "@/config/copy";
import { EVENT } from "@/config/event";
import { Card } from "@/components/ui/Card";
import { Asset } from "@/components/ui/Asset";
import { Sparkle } from "@/components/ui/Sparkle";

/** Saludo personalizado + mensaje en la voz del bebé + mención a los papitos. */
export function Welcome({ familyDisplay }: { familyDisplay: string }) {
  return (
    <section id="bienvenida" tabIndex={-1} aria-labelledby="bienvenida-titulo" className="scroll-mt-3 outline-none">
      <Card shape="arch" className="px-7 pb-10 pt-[24%] text-center sm:px-10">
        <Sparkle className="absolute left-1/2 top-[8%] h-5 w-5 -translate-x-1/2" />
        <h2
          id="bienvenida-titulo"
          className="text-balance font-script text-[2.5rem] leading-[1.15] text-miel-deep sm:text-[2.8rem]"
        >
          {copy.welcome.greeting(familyDisplay)}
        </h2>
        <div className="mt-5 space-y-4 text-[1.1875rem] italic leading-[1.8]">
          {copy.welcome.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-8">
          <p className="text-balance font-serif text-[0.95rem] font-semibold uppercase tracking-[0.18em]">
            {copy.welcome.parentsLead}
          </p>
          <p className="mt-2 text-balance font-script text-[2.1rem] leading-tight text-miel-deep">{EVENT.parents}</p>
        </div>
        <figure className="family-portrait mt-8">
          <div className="family-portrait__frame">
            <Asset name="familyPortrait" className="h-auto w-full" />
          </div>
        </figure>
      </Card>
    </section>
  );
}
