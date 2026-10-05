import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Asset } from "./Asset";

/**
 * Marco de arco celestial de la portada. El arco es un `rounded-t-full` (un
 * semicírculo perfecto de radio = mitad del ancho). La guirnalda se dibuja en un
 * lienzo de 540×340 donde el arco de 460 de ancho queda centrado, así que se
 * escala con el contenedor: ancho 540/460 = 117.39 %, desplazada 40/540 = 7.41 %
 * a la izquierda y 40/340 = 11.76 % hacia arriba.
 */
export function ArchFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-b-[2.5rem] rounded-t-full bg-marfil/95 px-5 pb-8 pt-[18%] shadow-card ring-1 ring-miel/40 sm:px-8">
        {children}
      </div>
      <Asset
        name="foliageArch"
        className="pointer-events-none absolute left-0 top-0 z-10 h-auto w-[117.39%] max-w-none -translate-x-[7.41%] -translate-y-[11.76%]"
      />
    </div>
  );
}
