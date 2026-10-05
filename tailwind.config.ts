import type { Config } from "tailwindcss";

/**
 * Tokens de diseño del Baby Shower (ver README, sección "Diseño").
 * Los valores hex vienen del Brief. Los tonos "deep"/"ink" son derivados
 * más oscuros para cumplir contraste WCAG AA en texto (el dorado del Brief
 * solo alcanza ~2.6:1 sobre marfil, por eso se reserva a decoración y fondos
 * de botón con texto oscuro).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cielo: { DEFAULT: "#d6e6f2", soft: "#e9f1f8", deep: "#b9d2e6" },
        pizarra: { DEFAULT: "#2b4c68", dark: "#1f3a52", ink: "#14283a", light: "#47688a" },
        miel: { DEFAULT: "#c89332", light: "#d9a036", deep: "#8a6214", pale: "#f1dcae" },
        marfil: { DEFAULT: "#fbf7ee", warm: "#f6efdf" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
        script: ["var(--font-script)", "Brush Script MT", "cursive"],
        body: ["var(--font-body)", "Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(43, 76, 104, 0.35), 0 2px 6px rgba(43, 76, 104, 0.08)",
        soft: "0 6px 18px -8px rgba(43, 76, 104, 0.3)",
        seal: "0 6px 12px -4px rgba(90, 60, 10, 0.55), inset 0 2px 3px rgba(255, 236, 190, 0.7), inset 0 -3px 5px rgba(120, 80, 10, 0.45)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.55", transform: "scale(0.85) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1.1) rotate(12deg)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        bars: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        twinkle: "twinkle 3.2s ease-in-out infinite",
        reveal: "reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        bars: "bars 1s ease-in-out infinite",
        spin: "spin 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
