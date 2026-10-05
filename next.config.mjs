/** @type {import('next').NextConfig} */

// Cabeceras de seguridad y de "no indexar" para TODAS las rutas.
// Las invitaciones son privadas: X-Robots-Tag evita la indexación sin impedir
// que WhatsApp/Facebook lean las etiquetas Open Graph para la vista previa
// (por eso NO se bloquea con robots.txt).
const securityHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Recursos públicos sin datos privados: el CDN de Vercel puede servirlos
      // desde el borde y revalidarlos sin bloquear el render de la página.
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/audio/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // El acceso de administración nunca debe cachearse ni filtrar el enlace por Referer.
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
