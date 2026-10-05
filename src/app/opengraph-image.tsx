import { ImageResponse } from "next/og";
import { EVENT } from "@/config/event";

export const alt = `${EVENT.title} — ${EVENT.date.long}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Vista previa para WhatsApp/redes: genérica, sin datos de familias. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d6e6f2",
        }}
      >
        <div
          style={{
            width: 520,
            height: 560,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fbf7ee",
            borderRadius: "260px 260px 40px 40px",
            border: "3px solid #c89332",
            color: "#2b4c68",
            textAlign: "center",
          }}
        >
          <svg width="56" height="56" viewBox="0 0 100 100">
            <path d="M50 2 C53 36 64 47 98 50 C64 53 53 64 50 98 C47 64 36 53 2 50 C36 47 47 36 50 2Z" fill="#d9a036" />
          </svg>
          <div style={{ marginTop: 18, fontSize: 40, letterSpacing: 14, fontWeight: 600 }}>BABY</div>
          <div style={{ fontSize: 92, fontStyle: "italic", color: "#8a6214", lineHeight: 1.05 }}>Shower</div>
          <div style={{ marginTop: 14, fontSize: 36, letterSpacing: 10, fontWeight: 600 }}>{EVENT.babyNameUpper}</div>
          <div style={{ marginTop: 28, fontSize: 26, letterSpacing: 3 }}>{EVENT.date.long}</div>
        </div>
      </div>
    ),
    size,
  );
}
