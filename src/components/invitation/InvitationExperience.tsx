"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { MusicPill } from "./MusicPill";
import { Opening } from "./Opening";

interface InvitationExperienceProps {
  familyDisplay: string;
  /** Contenido de la invitación (renderizado en el servidor). Se revela al abrir el sobre. */
  children: ReactNode;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const readingDurationMs = 2200;
const contentRevealLeadMs = 450;

/**
 * Orquesta la experiencia: portada con sobre → transición del leoncito →
 * contenido, y después desplaza suavemente hasta la bienvenida.
 *  - Con `prefers-reduced-motion` no hay animaciones ni scroll suave.
 *  - El foco pasa a la bienvenida para lectores de pantalla y teclado.
 */
export function InvitationExperience({ familyDisplay, children }: InvitationExperienceProps) {
  const [opened, setOpened] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sequenceTimerRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!showContent || prefersReducedMotion() || !contentRef.current) return;

      const contentSections = contentRef.current.firstElementChild
        ? Array.from(contentRef.current.firstElementChild.children)
        : [];

      gsap.from(contentSections, {
        opacity: 0,
        y: 22,
        duration: 0.8,
        stagger: 0.13,
        ease: "power2.out",
        clearProps: "transform",
      });
    },
    { dependencies: [showContent], scope: contentRef, revertOnUpdate: true },
  );

  const scrollToContent = useCallback((delayMs: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const target = document.getElementById("bienvenida");
      target?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      target?.focus({ preventScroll: true });
    }, delayMs);
  }, []);

  const handleOpen = useCallback(() => {
    if (opened) {
      if (showContent) scrollToContent(0);
      return;
    }
    const reducedMotion = prefersReducedMotion();
    setOpened(true);
    if (reducedMotion) {
      setShowContent(true);
      scrollToContent(0);
      return;
    }

    sequenceTimerRef.current = window.setTimeout(() => {
      setShowContent(true);
      sequenceTimerRef.current = window.setTimeout(() => {
        scrollToContent(0);
      }, contentRevealLeadMs);
    }, readingDurationMs);
  }, [opened, scrollToContent, showContent]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (sequenceTimerRef.current) window.clearTimeout(sequenceTimerRef.current);
    },
    [],
  );

  return (
    <main className="relative min-h-svh overflow-x-clip">
      <MusicPill compact={opened} />
      <Opening familyDisplay={familyDisplay} opened={opened} onOpen={handleOpen} />
      <div ref={contentRef} id="invitacion-contenido" hidden={!showContent}>
        {children}
      </div>
    </main>
  );
}
