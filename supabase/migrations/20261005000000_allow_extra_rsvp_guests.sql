-- Permite confirmar más personas que las inicialmente contabilizadas en la
-- invitación. El límite absoluto continúa siendo 50, aplicado por rsvps_guests_range.
drop trigger if exists rsvps_check_guests on public.rsvps;
drop function if exists public.rsvps_check_guests();
