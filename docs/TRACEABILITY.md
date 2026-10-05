# Matriz de trazabilidad y auditoría QA

Estado: ✅ implementado y verificado · ⚠️ implementado, requiere acción o revisión tuya · 🔜 fuera de alcance / mejora futura.

## 1. Requisito → implementación

| # | Requisito | Implementación | Archivos principales | Estado |
|---|---|---|---|---|
| 1 | Invitación personalizada por familia mediante enlace único | Ruta `/invitacion/[token]`; token aleatorio de 16 caracteres | `app/invitacion/[token]/page.tsx`, `lib/utils/token.ts`, `lib/data/invitations.ts` | ✅ |
| 2 | Nombre de la familia y nº de personas invitadas | `families.name` + `guests_invited`; "Familia X" en portada, sobre, saludo y RSVP | `config/…`, `Opening.tsx`, `Welcome.tsx`, `RsvpSection.tsx` | ✅ |
| 3 | Portada: arco, follaje, título, leoncito, sobre interactivo con sello | `ArchFrame`, `Opening`, sobre CSS `.env-*` | `components/ui/ArchFrame.tsx`, `Opening.tsx`, `globals.css` | ✅ (ilustraciones = placeholders ⚠️) |
| 4 | Sobre con icono de mano animado para abrir la invitación y desplazamiento | El sobre es un botón accesible; `InvitationExperience` revela el contenido, hace scroll suave y enfoca la bienvenida | `Opening.tsx`, `InvitationExperience.tsx`, `globals.css` | ✅ |
| 5 | Mensaje emotivo en voz del bebé + mención a los papitos | `Welcome` | `Welcome.tsx`, `config/copy.ts` | ⚠️ texto **borrador** a aprobar |
| 6 | Fecha, hora, lugar y "CÓMO LLEGAR" | `EventDetails` con datos literales del Brief | `EventDetails.tsx`, `config/event.ts` | ✅ |
| 7 | Cuenta regresiva en vivo con estados antes/durante/después | `getCountdownState` (instante absoluto UTC-5) + `Countdown` sin errores de hidratación | `lib/utils/countdown.ts`, `Countdown.tsx` | ✅ |
| 8 | RSVP por formulario (sí/no + personas) | `RsvpSection` → `POST /api/rsvp` → `submitRsvp` | `RsvpSection.tsx`, `app/api/rsvp/route.ts`, `lib/data/invitations.ts` | ✅ |
| 9 | RSVP por WhatsApp (guardar y luego abrir) | Enlace `wa.me` abre de inmediato; guardado en paralelo con `keepalive`; aviso si falla | `RsvpSection.tsx`, `lib/utils/whatsapp.ts` | ✅ (probar en iPhone real ⚠️) |
| 10 | Respuesta definitiva; solo el admin la cambia | `UNIQUE(family_id)`, insert-only público, idempotencia, 409 | `supabase/migrations/…`, `submitRsvp`, `RsvpAdminForm.tsx` | ✅ |
| 11 | Persistencia en Supabase con RLS | Migración SQL; RLS sin políticas + REVOKE; cliente solo servidor | `supabase/migrations/…`, `lib/supabase/server.ts` | ✅ |
| 12 | Panel admin simple, login solo por enlace | `/admin/acceso/<token>` → cookie HMAC; `requireAdmin()` en todo | `app/admin/**`, `lib/auth/**` | ✅ |
| 13 | Administrar familias (crear/editar/desactivar/eliminar) y copiar enlace | Páginas y Server Actions validadas con Zod | `app/admin/page.tsx`, `familias/[id]/page.tsx`, `actions.ts` | ✅ |
| 14 | Resumen de respuestas y filtros | `SummaryCards`, filtros `?estado=` | `SummaryCards.tsx`, `app/admin/page.tsx` | ✅ |
| 15 | Guardar la fecha (Google y .ics) | `buildGoogleCalendarUrl`, `/calendario.ics` (UTC, CRLF, pliegue 75 octetos) | `lib/utils/calendar.ts`, `app/calendario.ics/route.ts` | ✅ |
| 16 | Música manual, nunca autoplay | `MusicPill` (audio perezoso, `aria-pressed`, fallo silencioso) | `MusicPill.tsx` | ✅ (audio = placeholder ⚠️) |
| 17 | Lista de regalos configurable | `GIFT_LIST_URL`; desactivada con mensaje si falta | `GiftList.tsx`, `config/site.ts` | ⚠️ falta la URL |
| 18 | Assets reemplazables sin tocar componentes | Registro central + componente `Asset` | `config/assets.ts`, `ui/Asset.tsx` | ✅ |
| 19 | Textos editables | `config/copy.ts` | `config/copy.ts` | ✅ |
| 20 | Estados de error: token inválido/no encontrado, deshabilitada, error de Supabase, datos incompletos, red, RSVP fallido | `InvitationProblem`, `not-found`, `error.tsx`, mapeo de códigos en RSVP | `components/feedback/**`, `RsvpSection.tsx` | ✅ |
| 21 | Accesibilidad (contraste, foco, teclado, movimiento reducido, objetivos táctiles) | Botones ≥ 56 px, foco visible, `prefers-reduced-motion`, semántica y `aria-*` | `Button.tsx`, `globals.css` | ✅ |
| 22 | SEO/privacidad: no indexar, vista previa genérica | `noindex` + `X-Robots-Tag`, OG dinámica sin datos de familias | `next.config.mjs`, `layout.tsx`, `opengraph-image.tsx` | ✅ |
| 23 | Rendimiento móvil | JS de la invitación 8.6 kB (+117 kB compartido), fuentes autoalojadas `swap`, imágenes perezosas, sobre en CSS | build | ✅ |
| 24 | Documentación | README, DATA_MODEL, esta matriz, `.env.example` | `README.md`, `docs/**` | ✅ |
| 25 | Pruebas | 77 pruebas Vitest + e2e manual con Chromium | `tests/**` | ✅ |

## 2. Resultados de la auditoría

| Área | Verificación | Resultado |
|---|---|---|
| Tipos y build | `tsc --noEmit`, `next build` | ✅ sin errores |
| Unitarias | `vitest` | ✅ 77/77 |
| Base de datos (PostgreSQL 16 real, roles estilo Supabase) | aplicar migración 2 veces; `anon`/`authenticated` denegados; UNIQUE, CHECK, triggers, cascada | ✅ |
| API REST con la clave pública | `anon` sobre PostgREST → `permission denied` | ✅ |
| Fuga de secretos | buscar clave de servicio, token admin, URL de la base y nombres de variables en HTML+JS del cliente | ✅ 0 apariciones |
| RSVP e2e | formulario, WhatsApp (guarda `channel=whatsapp` y abre `wa.me` con mensaje correcto), rechazo con confirmación, persistencia tras recargar, respuesta distinta → 409, repetición idéntica → 200, error de red + reintento | ✅ |
| Validación API | JSON inválido 400 · content-type 415 · origen cruzado 403 · demasiadas personas 422 · token inexistente 404 · campos extra 400 · desactivada 403 | ✅ |
| Admin e2e | acceso por enlace, clave incorrecta 404, sin sesión 404, crear/editar/desactivar/eliminar, fijar y borrar respuesta, cerrar sesión | ✅ |
| Accesibilidad | axe-core (WCAG 2 A/AA, 2.1 A/AA, buenas prácticas) en portada y vista abierta con formulario | ✅ 0 violaciones |
| Responsive | 320, 360, 390, 768 y 1280 px | ✅ sin desbordes horizontales |
| Movimiento reducido / sin JS | `prefers-reduced-motion` (sin transiciones ni scroll suave); sin JavaScript el contenido se muestra | ✅ |
| Hidratación | consola del navegador | ✅ sin errores ni advertencias |

## 3. Defectos hallados durante la auditoría y corregidos

1. La normalización de nombres conserva la denominación escrita y solo compacta espacios, evitando que la aplicación imponga "Familia".
2. El formulario "Agregar familia" del panel se colapsaba tras crear una familia.
3. Un error de validación en el panel borraba lo escrito en el formulario.
4. La solapa abierta del sobre tapaba al leoncito y sus esquinas sobresalían del sobre redondeado.
5. En Cormorant el "1" se lee como "I" en la cuenta regresiva y la fecha → cifras en Lora.
6. La píldora de música tapaba contenido al hacer scroll → se compacta (solo ícono) tras abrir el sobre.
7. Leoncito pequeño y nombres de los papitos mal partidos en móvil.

## 4. Pendientes que dependen de ti

- ⚠️ Aprobar o reescribir el mensaje de bienvenida (`config/copy.ts`).
- ⚠️ Definir `WHATSAPP_NUMBER`, `GIFT_LIST_URL` y `SITE_URL`.
- ⚠️ Entregar ilustraciones y música definitivas (hoy son placeholders).
- ⚠️ Probar en un iPhone y un Android reales (WhatsApp, música, scroll, sobre) antes de enviar.
- 🔜 Límite de peticiones en el borde (WAF) si se quiere endurecer más.
