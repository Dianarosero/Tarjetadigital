import { copy } from "@/config/copy";
import { EVENT } from "@/config/event";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Asset } from "@/components/ui/Asset";

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.6" />
    </svg>
  );
}

/** Bloque de fecha y hora + lugar con botón "CÓMO LLEGAR" (Google Maps). */
export function EventDetails() {
  const { date, venue } = EVENT;
  return (
    <section aria-labelledby="evento-titulo" className="space-y-4">
      <h2 id="evento-titulo" className="sr-only">
        Fecha, hora y lugar
      </h2>

      <Card className="px-5 py-9 text-center">
        <Asset
          name="lionDate"
          className="event-details__lion event-details__lion--date"
        />
        <div className="grid items-center gap-y-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-5">
          <p className="pl-[0.16em] font-serif text-[1.3rem] font-semibold tracking-[0.16em] sm:text-[1.1rem]">
            {date.monthUpper}
          </p>
          <div className="mx-auto w-full max-w-[12rem] border-y border-miel/60 py-2 sm:border-x sm:border-y-0 sm:px-7 sm:py-0">
            <p className="font-body text-[5.25rem] font-normal leading-none">{date.day}</p>
            <p className="mt-1 pl-[0.25em] font-serif text-[0.98rem] font-semibold tracking-[0.25em]">
              {date.weekdayUpper}
            </p>
          </div>
          <div>
            <p className="font-body text-[2.1rem] font-normal leading-none">{EVENT.timeLabel.split(" ")[0]}</p>
            <p className="mt-1 pl-[0.2em] font-serif text-[1.05rem] font-semibold tracking-[0.2em]">
              {EVENT.timeLabel.split(" ")[1]}
            </p>
          </div>
        </div>
        <p className="mt-6 pl-[0.5em] font-body text-[1.2rem] tracking-[0.5em] text-miel-deep">
          {date.year}
        </p>
      </Card>

      <Card className="px-6 py-8 text-center">
        <Asset
          name="lionHatching"
          className="event-details__lion event-details__lion--venue"
        />
        <PinIcon className="mx-auto h-8 w-8 text-miel-deep" />
        <p className="mt-2 pl-[0.25em] font-serif text-[0.95rem] font-semibold uppercase tracking-[0.25em]">
          {copy.event.venueTitle}
        </p>
        <p className="mt-3 text-balance font-serif text-[1.65rem] font-semibold leading-tight">{venue.name}</p>
        <p className="mt-2 text-[1.125rem] italic">{venue.detail}</p>
        <p className="text-[1.0625rem] italic">{venue.address}</p>
        <div className="mt-6">
          <ButtonLink variant="slate" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
            {copy.event.directions}
            <span className="sr-only"> {copy.event.newTab}</span>
          </ButtonLink>
        </div>
      </Card>
    </section>
  );
}
