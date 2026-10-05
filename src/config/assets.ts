/**
 * REGISTRO DE ASSETS VISUALES.
 *
 * Todas las ilustraciones de la invitación se consumen desde aquí. Las
 * ilustraciones principales actuales son PLACEHOLDERS (carpeta
 * /public/assets/placeholders). Para poner las ilustraciones definitivas:
 *   1) copia el archivo nuevo (WebP/SVG/PNG) a /public/assets/
 *   2) cambia `src` (y `width`/`height` si cambian las proporciones) aquí.
 * Ningún componente necesita modificarse.
 */
export interface AssetDef {
  src: string;
  width: number;
  height: number;
  alt: string;
  animated?: boolean;
}

export const assets = {
  /** Acuarela principal: leoncito recién nacido en su huevo agrietado. */
  lion: {
    src: "/assets/optimized/lion-in-egg.webp",
    width: 400,
    height: 360,
    alt: "Acuarela de un leoncito recién nacido descansando en su huevo agrietado",
  },
  /** GIF decorativo que acompaña la transición después de abrir el sobre. */
  lionTransition: {
    src: "/assets/optimized/lion-transition-small.webp",
    width: 320,
    height: 512,
    alt: "",
    animated: true,
  },
  /** Leoncito feliz para los adornos laterales de los detalles del evento. */
  lionHatching: {
    src: "/assets/optimized/lion-hatching.webp",
    width: 1280,
    height: 1280,
    alt: "",
  },
  /** Leoncito tierno para el adorno superior de los detalles del evento. */
  lionDate: {
    src: "/assets/optimized/lion-date.webp",
    width: 992,
    height: 1240,
    alt: "",
  },
  /** Retrato familiar que acompaña el mensaje de los papás. */
  familyPortrait: {
    src: "/assets/optimized/family-portrait.webp",
    width: 973,
    height: 1135,
    alt: "Retrato familiar de maternidad en tonos azul pastel",
  },
  /** Guirnalda de follaje que sigue el borde superior del arco celestial (lienzo 540×340 con el arco de 460 de ancho centrado; ver ArchFrame). */
  foliageArch: {
    src: "/assets/placeholders/foliage-arch.svg",
    width: 540,
    height: 340,
    alt: "",
  },
  /** Ramita decorativa para separar secciones. */
  foliageSprig: {
    src: "/assets/placeholders/foliage-sprig.svg",
    width: 240,
    height: 64,
    alt: "",
  },
  /** Estrella dorada de cuatro puntas (destellos). */
  star: {
    src: "/assets/placeholders/star-gold.svg",
    width: 100,
    height: 100,
    alt: "",
  },
} as const satisfies Record<string, AssetDef>;

export type AssetName = keyof typeof assets;
