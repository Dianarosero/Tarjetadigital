import Image from "next/image";
import { assets, type AssetName } from "@/config/assets";

interface AssetProps {
  name: AssetName;
  className?: string;
  /** Imagen visible al cargar (portada): se carga con prioridad. */
  priority?: boolean;
  /** Sobrescribe el texto alternativo del registro. */
  alt?: string;
}

/**
 * Único punto de entrada para las ilustraciones. Lee ruta, dimensiones y texto
 * alternativo de src/config/assets.ts, de modo que cambiar un asset (incluso de
 * SVG a WebP) no requiere tocar ningún componente.
 *  - SVG/animaciones → <img> directo (next/image no optimiza SVG ni conserva
 *    de forma fiable la animación de formatos animados).
 *  - Raster (webp/png/jpg/avif) → next/image (tamaños responsivos + lazy).
 * Las dimensiones width/height evitan saltos de diseño (CLS).
 */
export function Asset({ name, className, priority = false, alt }: AssetProps) {
  const asset = assets[name];
  const text = alt ?? asset.alt;
  const decorative = text === "";

  if (asset.src.toLowerCase().endsWith(".svg") || ("animated" in asset && asset.animated)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt={text}
        aria-hidden={decorative || undefined}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        draggable={false}
      />
    );
  }

  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={text}
      aria-hidden={decorative || undefined}
      className={className}
      priority={priority}
      draggable={false}
    />
  );
}
