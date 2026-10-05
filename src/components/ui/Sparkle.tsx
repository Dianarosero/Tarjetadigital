import { cn } from "@/lib/utils/cn";
import { Asset } from "./Asset";

interface SparkleProps {
  /** Clases de tamaño/posición, p. ej. "h-5 w-5". */
  className?: string;
  /** Retraso del parpadeo en segundos, para que no titilen al unísono. */
  delay?: number;
  animate?: boolean;
}

/** Destello dorado ✦ (usa el asset `star` del registro). */
export function Sparkle({ className, delay = 0, animate = true }: SparkleProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block", animate && "animate-twinkle", className)}
      style={animate ? { animationDelay: `${delay}s` } : undefined}
    >
      <Asset name="star" className="h-full w-full" />
    </span>
  );
}
