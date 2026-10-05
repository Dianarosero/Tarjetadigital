# Baby Shower de Juan José — Invitación web personalizada

Invitación interactiva *mobile-first* para el Baby Shower de **Juan José** (domingo 18 de octubre de 2026, 4:00 p.m., Pasto, Nariño). Cada persona, pareja, familia o grupo recibe un **enlace personal** (`/invitacion/<token>`), confirma asistencia por formulario o por WhatsApp y los papás siguen las respuestas desde un panel privado.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 3 · Supabase (PostgreSQL) · Zod · Vitest.

---

## 1. Qué hace

| Para los invitados | Para los anfitriones (admin) |
|---|---|
| Portada con arco celestial, leoncito y sobre interactivo con sello "JJ" | Acceso con **un único enlace secreto** (sin contraseñas) |
| Saludo personalizado y mensaje emotivo | Crear, editar, desactivar y eliminar invitaciones |
| Fecha, hora, lugar y botón **Cómo llegar** (Google Maps) | Enlace único por invitación, con botón **Copiar enlace** |
| Cuenta regresiva en vivo (hora de Colombia) | Resumen: invitaciones y personas invitadas/confirmadas, pendientes |
| Confirmación por **formulario** o **WhatsApp** | Filtros: pendientes, confirmadas, no asisten, desactivadas |
| Música ambiental **solo si la persona la activa** | Corregir o borrar la respuesta de cualquier invitación |

## 2. Puesta en marcha (local)

Requisitos: Node 20.9+ y una cuenta de Supabase (plan gratuito sirve).

```bash
npm install
cp .env.example .env.local      # completa los valores (ver §3)
npm run dev                     # http://localhost:3000
```

Otros comandos: `npm run typecheck` · `npm test` · `npm run build && npm start`.

## 3. Variables de entorno

Todas son **solo de servidor** (ninguna usa `NEXT_PUBLIC_`). Plantilla en `.env.example`.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave secreta (service_role). **Nunca** en el frontend ni en el repositorio |
| `ADMIN_ACCESS_TOKEN` | Sí | Secreto de ≥ 32 caracteres que forma tu enlace de administración |
| `WHATSAPP_NUMBER` | Para mostrar el botón | Código de país + número, p. ej. `573001234567` |
| `SITE_URL` | Recomendada | URL pública sin barra final (vista previa Open Graph y enlaces del panel) |

Genera el token de administración con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## 4. Configurar Supabase

1. Crea un proyecto en supabase.com.
2. Abre **SQL Editor**, pega y ejecuta `supabase/migrations/20261001000000_init.sql` (crea tablas, restricciones, triggers, vista y seguridad). Es idempotente.
3. En **Project Settings → API** copia la *Project URL* y la clave **service_role / secret** a tu `.env.local`.
4. No necesitas la clave pública (`anon`): el navegador nunca habla con Supabase.

Detalle completo del modelo y de la seguridad: [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md).

## 5. Usar el panel de administración

1. Abre `https://TU-DOMINIO/admin/acceso/<ADMIN_ACCESS_TOKEN>` (guárdalo en favoritos). Quedas con sesión por 7 días.
2. **Agregar invitación**: escribe el nombre visible completo (`Carlos Pérez`, `Ana y Luis`, `Familia Pérez` o `Grupo de jóvenes`) y cuántas personas caben en la invitación. El enlace personal se genera solo.
3. **Copiar enlace** y envíaselo a sus destinatarios (WhatsApp, etc.).
4. Sigue las respuestas en el resumen y la lista; entra a **Editar** para corregir datos o la respuesta.
5. **Salir** cierra la sesión. Si sospechas que el enlace se filtró, cambia `ADMIN_ACCESS_TOKEN` y vuelve a desplegar: invalida el enlace y todas las sesiones.

> La respuesta de una invitación es **definitiva**: los invitados no pueden cambiarla; solo el administrador desde la página de la invitación ("Pendiente" la elimina).

## 6. Personalizar contenido y diseño

| Quiero cambiar… | Dónde |
|---|---|
| Datos del evento (fecha, hora, lugar, mapa, nombres) | `src/config/event.ts` |
| **Todos los textos** (mensaje de bienvenida, botones, errores) | `src/config/copy.ts` |
| Ilustraciones (leoncito, follaje, estrella) | `src/config/assets.ts` + archivos en `public/assets/` |
| Música ambiental | `public/audio/` + `MUSIC.src` en `src/config/event.ts` |
| Colores y tipografías | `tailwind.config.ts`, `src/app/layout.tsx` |
| Número de WhatsApp | Variable de entorno |

### Reemplazar las ilustraciones y el audio (placeholders)
Los archivos actuales (`public/assets/placeholders/*.svg`) son **placeholders** generados para el proyecto. Las ilustraciones pesadas que se muestran en la invitación tienen una versión WebP optimizada en `public/assets/optimized/`; el GIF de transición se sirve como WebP animado para reducir la descarga inicial. El audio de la invitación está configurado en `MUSIC.src` y se sirve desde `public/audio/`. Copia tus archivos definitivos (SVG/WebP/PNG; MP3/M4A) y cambia la ruta en `src/config/assets.ts` o `MUSIC.src`. Si cambian las proporciones, ajusta `width`/`height`; el componente `Asset` usa `next/image` para raster y `<img>` para SVG o animaciones. La guirnalda `foliageArch` está dibujada en un lienzo de 540×340 con el arco de 460 de ancho centrado (ver `ArchFrame`).

El sobre y el sello "JJ" están hechos **con CSS** (clases `.env-*` en `globals.css`), no son imágenes.

### Diseño (tokens)
- **Colores (del Brief):** cielo `#d6e6f2`, pizarra `#2b4c68`, miel/dorado `#c89332` / `#d9a036`, marfil `#fbf7ee`. Fondo *gingham* azul pastel/blanco hecho con CSS.
- **Contraste:** el dorado del Brief sobre marfil solo alcanza ~2.6:1, por lo que se reserva a decoración y fondos de botón con texto oscuro `#14283a` (≥ 4.8:1). El texto dorado usa `miel-deep #8a6214` (≈ 5:1).
- **Tipografía (autoalojada, licencia OFL):** Cormorant Garamond (títulos/etiquetas), Pinyon Script (nombres), Lora (cuerpo y cifras; Cormorant usa cifras antiguas donde el "1" se confunde con "I").
- **Movimiento:** un único momento orquestado (abrir el sobre). Todo respeta `prefers-reduced-motion`.

## 7. Despliegue (Vercel recomendado)

1. Sube el proyecto a un repositorio (el `.gitignore` ya excluye `.env*`, `node_modules` y `.next`).
2. Importa el repositorio en Vercel y agrega las variables de la §3 (Production).
3. En Vercel deja el framework como **Next.js**, el directorio raíz como `bsapp` si importaste el directorio padre, y conserva el comando de build `npm run build`.
4. Despliega. Prueba: `/` (pantalla neutra), tu enlace de admin y una invitación de prueba.
5. Las páginas de invitación, el panel y el endpoint RSVP son dinámicos y **nunca se cachean**; las ilustraciones y el audio sí usan caché pública de CDN.

## 8. Seguridad (resumen)

- **Service role solo en servidor** (`import "server-only"`); verificado que no aparece en el bundle del cliente.
- **RLS activado sin políticas + `REVOKE` a `anon`/`authenticated`**: la clave pública no puede leer ni escribir nada.
- **Tokens** de 16 caracteres aleatorios criptográficos (~93 bits), sin caracteres ambiguos.
- **Validación en servidor** con Zod en cada entrada, más restricciones `CHECK`/`UNIQUE` y triggers en la base de datos.
- **Admin:** enlace secreto con comparación en tiempo constante, cookie firmada HMAC (`httpOnly`, `SameSite=Lax`, ruta `/admin`), y `requireAdmin()` en cada página y acción (404 si no hay sesión).
- **RSVP:** solo `application/json`, rechazo de otro origen, idempotencia ante dobles toques y respuesta definitiva por `UNIQUE(family_id)`.
- Cabeceras: `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Metadatos/vista previa **genéricos**: jamás incluyen el nombre de una familia.

## 9. Pruebas y verificación

- `npm test`: 77 pruebas unitarias (tokens, esquemas, cuenta regresiva en sus tres estados, mensaje/URL de WhatsApp, `.ics` con pliegue a 75 octetos y 21:00 UTC, nombres, sesión admin, mapeo de datos).
- Migración SQL validada en PostgreSQL 16 real con roles estilo Supabase (seguridad RLS, restricciones, triggers, cascada, idempotencia).
- Extremo a extremo con Chromium (Playwright) contra PostgREST local: flujos de formulario, WhatsApp, rechazo, respuesta definitiva, reintento, error de red, panel admin, y auditoría de accesibilidad automática (axe, WCAG 2.1 AA) sin violaciones. Detalles en [`docs/TRACEABILITY.md`](docs/TRACEABILITY.md).

## 10. Supuestos y decisiones (por favor revisar)

1. **Mensaje de bienvenida:** el Brief describe su tono pero no trae el texto; `copy.welcome.paragraphs` es un **borrador**. Edítalo a tu gusto.
2. **Duración del evento: 3 horas** (solo afecta al calendario y al estado "después del evento" de la cuenta regresiva).
3. **Zona horaria:** `America/Bogota` (UTC-5 fijo, sin horario de verano). El contador usa el instante exacto, igual para cualquier visitante.
4. **Estados del contador:** antes → cuenta; durante → "¡La celebración ha comenzado!"; después → "¡Gracias por celebrar con nosotros!".
5. `families.name` guarda el **nombre visible completo** de la invitación y no agrega ni quita prefijos automáticamente. Los registros existentes conservan su valor.
6. **WhatsApp solo confirma asistencia** (un único número, mensaje a Luis Carlos). Declinar se hace por formulario, con paso de confirmación para evitar toques accidentales (la respuesta es definitiva). Si no hay número configurado, el botón de WhatsApp se oculta.
7. Al tocar el botón de WhatsApp el enlace se abre **de inmediato** y el guardado corre en paralelo (evita que iOS/Safari bloquee la ventana). Si el guardado falla se avisa y queda el formulario como respaldo.
8. **Música 100 % manual**: no hay autoplay ni se abre el audio al abrir el sobre.
9. El resumen del panel cuenta solo **invitaciones activas**.
10. **No se indexa** con `noindex`/`X-Robots-Tag` en lugar de `robots.txt`, para no romper las vistas previas de WhatsApp.
11. No existe tabla de configuración del evento: vive en `src/config/event.ts` (un evento único; evita duplicar fuentes de verdad).
12. **Sin límite de peticiones (rate limiting):** los tokens de ~93 bits hacen inviable adivinarlos. Mejora futura: activar el WAF de tu hosting o un limitador en el borde.

## 11. Limitaciones conocidas y mejoras futuras

- Probado con Chromium, no en dispositivos reales: conviene revisar iPhone/Safari (botón de WhatsApp, música, scroll) y Android antes de enviar las invitaciones.
- El listado del panel carga hasta 5000 familias de una vez (más que suficiente para este evento); sin búsqueda por texto (hay filtros por estado).
- Ideas: regenerar el token de una familia, exportar a CSV, recordatorios, varios eventos.

## 12. Estructura

```
src/
  app/            rutas: / · /invitacion/[token] · /api/rsvp · /calendario.ics · /admin/**
  components/     ui/ · invitation/ · admin/ · feedback/
  config/         event.ts · copy.ts · assets.ts · site.ts
  lib/            data/ (Supabase) · auth/ · validation/ · utils/
  assets/fonts/   tipografías autoalojadas (OFL)
supabase/migrations/   esquema SQL
docs/                  DATA_MODEL.md · TRACEABILITY.md
tests/                 pruebas Vitest
public/                assets (placeholders) y audio
```
