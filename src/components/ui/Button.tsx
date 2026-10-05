import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "gold" | "slate" | "outline";

/**
 * Estilos de botón compartidos. Altura mínima 3.5rem (56 px) para dedos y
 * personas mayores. Contrastes (WCAG AA):
 *  - gold:  texto #14283a sobre #c89332–#d9a036  → ≥ 4.8:1
 *  - slate: texto #fbf7ee sobre #2b4c68          → ≈ 8.4:1
 *  - outline: texto #2b4c68 sobre marfil         → ≈ 8:1
 */
export function buttonClasses(variant: ButtonVariant, full = true, extra?: string): string {
  return cn(
    "inline-flex min-h-[3.5rem] select-none items-center justify-center gap-2.5 rounded-full px-7 py-3 text-center",
    "font-serif text-[1.0625rem] font-bold uppercase leading-tight tracking-[0.1em]",
    "transition duration-200 ease-out active:scale-[0.98]",
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pizarra-dark",
    "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
    full && "w-full",
    variant === "gold" &&
      "bg-gradient-to-b from-miel-light to-miel text-pizarra-ink shadow-soft ring-1 ring-miel-deep/30 hover:brightness-105 disabled:opacity-70 aria-disabled:opacity-70",
    variant === "slate" &&
      "bg-pizarra text-marfil shadow-soft hover:bg-pizarra-dark disabled:opacity-70 aria-disabled:opacity-70",
    variant === "outline" &&
      "bg-marfil/90 text-pizarra ring-2 ring-pizarra hover:bg-white disabled:opacity-60 aria-disabled:opacity-60",
    extra,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  full?: boolean;
  children: ReactNode;
}

export function Button({ variant = "gold", full = true, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, full, className)} {...rest}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  full?: boolean;
  children: ReactNode;
}

export function ButtonLink({ variant = "slate", full = true, className, children, ...rest }: ButtonLinkProps) {
  return (
    <a className={buttonClasses(variant, full, className)} {...rest}>
      {children}
    </a>
  );
}
