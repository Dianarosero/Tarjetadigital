import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** "arch" = parte superior en arco (como la portada); "soft" = esquinas redondeadas. */
  shape?: "soft" | "arch";
}

/** Tarjeta marfil con sombra suave y filo dorado sutil. */
export function Card({ shape = "soft", className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative bg-marfil/90 shadow-card ring-1 ring-miel/35",
        shape === "arch" ? "rounded-t-full rounded-b-[2rem]" : "rounded-[2rem]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
