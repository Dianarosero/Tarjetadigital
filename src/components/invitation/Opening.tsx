"use client";

import { copy } from "@/config/copy";
import { EVENT } from "@/config/event";
import { Asset } from "@/components/ui/Asset";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Sparkle } from "@/components/ui/Sparkle";

interface OpeningProps {
  familyDisplay: string;
  opened: boolean;
  onOpen: () => void;
}

/**
 * Portada: arco celestial con follaje, título, leoncito (acuarela) y un sobre
 * azul pizarra con solapa triangular y sello dorado "JJ" encima de la imagen.
 * El sobre es 100 % CSS (ver globals.css, clases .env-*): pesa 0 bytes y se
 * anima con transform/opacity (aceleradas por GPU). El sobre es también el
 * control accesible y muestra una mano animada para indicar dónde tocar.
 */
export function Opening({ familyDisplay, opened, onOpen }: OpeningProps) {
  return (
    <section
      aria-labelledby="titulo-portada"
      className="relative mx-auto flex min-h-svh w-full max-w-[30rem] flex-col justify-center px-6 py-10 md:max-w-[34rem]"
    >
      <ArchFrame>
        <div className="relative text-center">
          <Sparkle className="absolute left-[4%] top-[2%] h-5 w-5" />
          <Sparkle className="absolute right-[6%] top-[12%] h-4 w-4" delay={1.1} />
          <Sparkle className="absolute left-[10%] top-[58%] h-3 w-3" delay={2} />
          <h1 id="titulo-portada">
            <span className="block pl-[0.5em] font-serif text-[1.6rem] font-semibold tracking-[0.5em] text-pizarra sm:text-[1.8rem]">
              {copy.opening.babyLabel}
            </span>
            <span className="-mt-1 block font-script text-[4.4rem] leading-[0.95] text-miel-deep sm:text-[5.2rem]">
              {copy.opening.showerScript}
            </span>
          </h1>
        </div>

        <Asset name="lion" priority className="mx-auto mt-0 h-auto w-[90%] max-w-[24rem]" />

        {/* Sobre interactivo, encima de la ilustración */}
        <div className="relative z-20 mx-auto -mt-[15%] w-[88%]">
          <button
            type="button"
            className="env"
            data-open={opened}
            onClick={onOpen}
            aria-label={opened ? "Ver la invitación" : "Abrir la invitación"}
          >
            <div className="env-back" />
            <div className="env-letter">
              <span className="mt-[3%] whitespace-nowrap font-script text-[clamp(1rem,7cqw,1.7rem)] leading-none text-miel-deep">
                De la Familia Rosero Villa
              </span>
              <Sparkle className="h-4 w-4" />
            </div>
            <div className="env-front" />
            <div className="env-address">Para {familyDisplay}</div>
            <div className="env-flap">
              <div className="env-flap-face env-flap-face--front" />
              <div className="env-flap-face env-flap-face--back" />
            </div>
            <div className="env-seal">
              <span className="env-seal-mark">{EVENT.monogram}</span>
            </div>
            {!opened && (
              <span className="env-hint" aria-hidden="true">
                <svg viewBox="0 0 48 56" fill="none" aria-hidden="true">
                  <path
                    d="M17.5 29V9.5c0-2.8 2.2-5 5-5s5 2.2 5 5V25c0-2.8 2.2-5 5-5s5 2.2 5 5v6c0-2.8 2.2-5 5-5s5 2.2 5 5v16.5c0 3.1-.8 6.1-2.5 8.8-1 1.6-1.5 3.4-1.5 5.3v.4c0 3-2.4 5.5-5.5 5.5H20c-2.8 0-5.2-1.8-6.1-4.5l-1.1-3.5L3.8 36.2c-2-2.4-1.7-6 .7-8.1 2.4-2.1 6-1.8 8.1.6l4.9 5.7V29Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.7"
                  />
                </svg>
              </span>
            )}
          </button>
        </div>
      </ArchFrame>
    </section>
  );
}
