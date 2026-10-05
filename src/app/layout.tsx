import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { EVENT } from "@/config/event";
import "./globals.css";

/**
 * Tipografía (autoalojada, licencia OFL; sin pedir nada a Google en ejecución):
 *  - Títulos y etiquetas: Cormorant Garamond (serif clásica; se usa con mucho tracking)
 *  - Nombres y acentos: Pinyon Script (caligráfica fluida)
 *  - Cuerpo: Lora cursiva (serif itálica cálida y muy legible en móvil)
 * Solo subconjunto latino (cubre tildes, ñ, ¡ y ¿). `display: swap` evita texto invisible.
 */
const serif = localFont({
  src: [
    { path: "../assets/fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const script = localFont({
  src: "../assets/fonts/pinyon-script-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-script",
  display: "swap",
});

const body = localFont({
  src: [
    { path: "../assets/fonts/lora-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../assets/fonts/lora-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../assets/fonts/lora-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const DESCRIPTION = `Te invitamos a celebrar la llegada de ${EVENT.babyName}. ${EVENT.date.long}, ${EVENT.timeLabel}.`;

export function generateMetadata(): Metadata {
  // Metadata PÚBLICA y genérica: nunca incluye nombres de familias.
  let metadataBase: URL | undefined;
  try {
    const site = process.env.SITE_URL?.trim();
    metadataBase = site ? new URL(site) : undefined;
  } catch {
    metadataBase = undefined;
  }
  return {
    metadataBase,
    title: EVENT.title,
    description: DESCRIPTION,
    applicationName: EVENT.title,
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg",
    },
    // Invitaciones privadas: no indexar (se refuerza con la cabecera X-Robots-Tag).
    robots: { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: EVENT.title,
      title: EVENT.title,
      description: DESCRIPTION,
    },
    twitter: { card: "summary_large_image", title: EVENT.title, description: DESCRIPTION },
  };
}

export const viewport: Viewport = {
  themeColor: "#d6e6f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${script.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
