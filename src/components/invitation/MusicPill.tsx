"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copy } from "@/config/copy";
import { MUSIC } from "@/config/event";
import { cn } from "@/lib/utils/cn";

/**
 * Píldora flotante de música ambiental.
 *  - 100 % manual: no hay autoplay; el audio solo se crea y reproduce tras un toque.
 *  - El archivo no se descarga hasta la primera activación (ahorra datos móviles).
 *  - Si el navegador rechaza la reproducción, se avisa con un mensaje discreto.
 */
export function MusicPill({ compact = false }: { compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!failed) return;
    const timer = window.setTimeout(() => setFailed(false), 5000);
    return () => window.clearTimeout(timer);
  }, [failed]);

  const toggle = useCallback(async () => {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC.src);
      audio.loop = true;
      audio.volume = MUSIC.volume;
      audio.preload = "none";
      // Mantiene el botón sincronizado si el sistema pausa el audio (llamada, otra app…).
      audio.addEventListener("pause", () => setPlaying(false));
      audio.addEventListener("play", () => setPlaying(true));
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      setFailed(false);
      await audio.play();
    } catch {
      setPlaying(false);
      setFailed(true);
    }
  }, []);

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-2"
      style={{ top: "max(0.75rem, env(safe-area-inset-top))", right: "max(0.75rem, env(safe-area-inset-right))" }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? copy.music.ariaOn : copy.music.ariaOff}
        className={cn(
          "flex min-h-[2.75rem] items-center gap-2.5 rounded-full font-serif text-[0.95rem] font-bold tracking-wide",
          compact ? "min-w-[2.75rem] justify-center px-3" : "px-4",
          "bg-marfil/95 text-pizarra shadow-soft ring-1 ring-miel/60 transition hover:bg-white active:scale-[0.97]",
        )}
      >
        <span aria-hidden="true" className="flex h-4 items-end gap-[3px]">
          {[0, 0.25, 0.5].map((delay, i) => (
            <span
              key={i}
              className={cn(
                "block h-full w-[3px] origin-bottom rounded-full bg-miel-deep",
                playing ? "animate-bars" : "scale-y-[0.4]",
              )}
              style={playing ? { animationDelay: `${delay}s` } : undefined}
            />
          ))}
        </span>
        <span className={cn(compact && "sr-only")}>{playing ? copy.music.labelOn : copy.music.labelOff}</span>
      </button>
      {failed ? (
        <p role="status" className="max-w-[14rem] rounded-xl bg-marfil px-3 py-2 text-sm italic shadow-soft">
          {copy.music.failed}
        </p>
      ) : null}
    </div>
  );
}
