-- =============================================================================
-- Baby Shower de Juan José — esquema inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor (o `supabase db push`).
-- Es idempotente en lo posible: puede correrse de nuevo sobre una base vacía.
-- Ver docs/DATA_MODEL.md para la explicación de cada decisión.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- families: una fila por invitación o grupo invitado
-- -----------------------------------------------------------------------------
create table if not exists public.families (
  id              uuid primary key default gen_random_uuid(),
  -- Nombre visible completo de la invitación (persona, pareja, familia o grupo).
  name            text not null,
  -- Identificador público e impredecible que va en la URL (/invitacion/<token>).
  token           text not null,
  -- Personas que caben en la invitación (tope del RSVP).
  guests_invited  smallint not null default 1,
  -- false = invitación deshabilitada (el enlace deja de funcionar).
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint families_token_key unique (token),
  constraint families_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint families_token_format check (token ~ '^[A-Za-z0-9]{12,64}$'),
  constraint families_guests_range check (guests_invited between 1 and 50)
);

comment on table  public.families is 'Invitaciones. Una fila por enlace personalizado.';
comment on column public.families.name is 'Nombre visible completo de la invitación.';
comment on column public.families.token is 'Token aleatorio (>= 12 caracteres alfanuméricos) usado en la URL pública.';

create index if not exists families_name_idx on public.families (lower(name));
create index if not exists families_is_active_idx on public.families (is_active);

drop trigger if exists families_set_updated_at on public.families;
create trigger families_set_updated_at
  before update on public.families
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- rsvps: a lo sumo UNA respuesta por familia. "Pendiente" = no existe fila.
-- -----------------------------------------------------------------------------
create table if not exists public.rsvps (
  id                uuid primary key default gen_random_uuid(),
  family_id         uuid not null references public.families (id) on delete cascade,
  status            text not null,
  guests_confirmed  smallint not null default 0,
  -- Desde dónde se registró: formulario web, botón de WhatsApp o el administrador.
  channel           text not null default 'form',
  responded_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint rsvps_family_id_key unique (family_id),
  constraint rsvps_status_values check (status in ('attending', 'declined')),
  constraint rsvps_channel_values check (channel in ('form', 'whatsapp', 'admin')),
  constraint rsvps_guests_range check (guests_confirmed between 0 and 50),
  -- Coherencia estado ↔ personas: si asisten, al menos 1; si no, exactamente 0.
  constraint rsvps_guests_match_status check (
    (status = 'attending' and guests_confirmed >= 1)
    or (status = 'declined' and guests_confirmed = 0)
  )
);

comment on table public.rsvps is 'Confirmación de asistencia por invitación. Sin fila = pendiente.';

create index if not exists rsvps_status_idx on public.rsvps (status);

drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Reglas entre tablas (red de seguridad en la base de datos)
-- -----------------------------------------------------------------------------

-- Un RSVP nunca puede confirmar más personas que las invitadas.
create or replace function public.rsvps_check_guests()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  invited smallint;
begin
  select f.guests_invited into invited from public.families f where f.id = new.family_id;
  if new.guests_confirmed > invited then
    raise exception 'rsvp_guests_exceed_invited' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists rsvps_check_guests on public.rsvps;
create trigger rsvps_check_guests
  before insert or update on public.rsvps
  for each row execute function public.rsvps_check_guests();

-- No se puede bajar guests_invited por debajo de lo ya confirmado.
create or replace function public.families_check_guests()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.guests_invited < old.guests_invited and exists (
    select 1 from public.rsvps r
    where r.family_id = new.id and r.guests_confirmed > new.guests_invited
  ) then
    raise exception 'family_guests_below_confirmed' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists families_check_guests on public.families;
create trigger families_check_guests
  before update of guests_invited on public.families
  for each row execute function public.families_check_guests();

-- -----------------------------------------------------------------------------
-- family_overview: familia + su respuesta (si existe). Solo lectura.
-- security_invoker => respeta los permisos/RLS de quien consulta.
-- -----------------------------------------------------------------------------
create or replace view public.family_overview
with (security_invoker = true) as
select
  f.id,
  f.name,
  f.token,
  f.guests_invited,
  f.is_active,
  f.created_at,
  f.updated_at,
  r.status            as rsvp_status,
  r.guests_confirmed  as rsvp_guests_confirmed,
  r.channel           as rsvp_channel,
  r.responded_at      as rsvp_responded_at
from public.families f
left join public.rsvps r on r.family_id = f.id;

-- -----------------------------------------------------------------------------
-- SEGURIDAD: Row Level Security
--
-- Modelo: el navegador NUNCA habla con Supabase. Todo pasa por el servidor de
-- Next.js, que usa la service_role key (solo en variables de entorno del
-- servidor). Por eso:
--   1. RLS activado en ambas tablas y SIN políticas para anon/authenticated
--      => cualquier consulta con la clave pública es denegada.
--   2. Además se revocan los privilegios de tabla/vista a anon y authenticated
--      (defensa en profundidad: aunque alguien crease una política por error,
--      los GRANT siguen bloqueando).
--   3. service_role tiene BYPASSRLS en Supabase; se le concede acceso explícito.
-- =============================================================================
alter table public.families enable row level security;
alter table public.rsvps    enable row level security;

revoke all on table public.families        from anon, authenticated;
revoke all on table public.rsvps           from anon, authenticated;
revoke all on table public.family_overview from anon, authenticated;

grant select, insert, update, delete on table public.families        to service_role;
grant select, insert, update, delete on table public.rsvps           to service_role;
grant select                         on table public.family_overview to service_role;

revoke all on function public.set_updated_at()       from public;
revoke all on function public.rsvps_check_guests()   from public;
revoke all on function public.families_check_guests() from public;
