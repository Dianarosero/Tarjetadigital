# Modelo de datos

Base de datos: PostgreSQL (Supabase). Migración: `supabase/migrations/20261001000000_init.sql`.

## Decisión de arquitectura de acceso

El navegador **nunca** se conecta a Supabase. Todo pasa por el servidor de Next.js (Server Components, Server Actions y `POST /api/rsvp`), que usa la clave `service_role` guardada solo en variables de entorno del servidor. Por eso no se necesita la clave pública `anon` y la superficie de ataque directa a la base de datos es cero.

## Análisis de tablas

| Necesidad | Decisión |
|---|---|
| Invitaciones | Tabla `families` |
| Confirmaciones | Tabla `rsvps` (a lo sumo una por familia) |
| Estado "pendiente" | **Derivado**: familia sin fila en `rsvps` (evita estados duplicados e inconsistentes) |
| Administrador | **Sin tabla**: un único admin con enlace secreto (`ADMIN_ACCESS_TOKEN`) y cookie firmada |
| Configuración del evento | **Sin tabla**: evento único, vive en `src/config/event.ts` |
| Vista de lectura | `family_overview` (familia + su respuesta, `security_invoker`) |

## `families`

| Columna | Tipo | Reglas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `name` | text | 1–80 caracteres sin contar espacios; nombre visible completo (persona, pareja, familia o grupo) |
| `token` | text | `UNIQUE`; regex `^[A-Za-z0-9]{12,64}$` |
| `guests_invited` | smallint | 1–50, por defecto 1 |
| `is_active` | boolean | por defecto `true`; `false` deshabilita el enlace |
| `created_at`, `updated_at` | timestamptz | `updated_at` se actualiza por trigger |

Índices: `families_token_key` (único, búsqueda por token), `families_name_idx` (`lower(name)`), `families_is_active_idx`.

## `rsvps`

| Columna | Tipo | Reglas |
|---|---|---|
| `id` | uuid PK | |
| `family_id` | uuid | FK → `families(id)` `ON DELETE CASCADE`, **`UNIQUE`** (una respuesta por familia) |
| `status` | text | `attending` \| `declined` |
| `guests_confirmed` | smallint | 0–50 |
| `channel` | text | `form` \| `whatsapp` \| `admin` |
| `responded_at`, `created_at`, `updated_at` | timestamptz | |

Coherencia (`CHECK rsvps_guests_match_status`): si `attending` → ≥ 1 persona; si `declined` → exactamente 0.

## Triggers (red de seguridad en la base)

- `set_updated_at` en ambas tablas.
- `rsvps_guests_range`: una respuesta puede confirmar entre 0 y 50 personas. Puede superar el número inicialmente indicado en `guests_invited`.
- `families_check_guests`: no se puede bajar `guests_invited` por debajo de lo ya confirmado (`family_guests_below_confirmed`).

## Seguridad (RLS)

- `ENABLE ROW LEVEL SECURITY` en `families` y `rsvps` **sin ninguna política** ⇒ `anon` y `authenticated` quedan denegados.
- Además `REVOKE ALL` sobre tablas y vista a `anon` y `authenticated` (defensa en profundidad), y `GRANT` explícito a `service_role`.
- Las funciones de trigger tienen `search_path = ''` y `EXECUTE` revocado a `PUBLIC`.

## Reglas de negocio aplicadas en la app

- **Respuesta definitiva:** los invitados solo pueden insertar. Repetir exactamente la misma respuesta es idempotente (éxito); una distinta devuelve `409 already_responded` y se muestra la existente. Solo el administrador modifica (`upsert`, canal `admin`) o elimina (Pendiente).
- **Desactivar** una invitación cierra el enlace sin perder su respuesta; **eliminar** borra la invitación y su respuesta.
- **Datos incompletos** (fila que no pasa la validación Zod) se muestran como "invitación incompleta" en vez de fallar.

## Nombres de invitación

`families.name` conserva el nombre visible completo que escribe el administrador.
No se agrega ni se elimina automáticamente el prefijo `Familia`: pueden
registrarse nombres como `Carlos Pérez`, `Ana y Luis`, `Familia Pérez` o
`Grupo de jóvenes`. Los registros creados con la versión anterior conservan su
valor y se muestran sin transformación adicional.
