/**
 * DATOS DEL EVENTO — fuente única.
 * Los valores vienen literalmente del Brief. No modificar sin confirmación.
 */
export const EVENT = {
  title: "Baby Shower de Juan José",
  babyName: "Juan José",
  babyNameUpper: "JUAN JOSÉ",
  monogram: "JJ",
  mother: "Raquel",
  father: "Luis Carlos",
  parents: "Luis Carlos, Raquel & Sarita",
  sister: "Sara Isabella",

  /** Partes de la fecha para el bloque visual. */
  date: {
    weekday: "Domingo",
    weekdayUpper: "DOMINGO",
    day: 18,
    monthUpper: "OCTUBRE",
    year: 2026,
    long: "Domingo, 18 de octubre de 2026",
  },
  timeLabel: "3:00 P.M.",

  /**
   * Instante exacto de inicio. Bogotá/Pasto es UTC-5 todo el año (sin horario
   * de verano), así que el offset fijo es correcto y el contador funciona igual
   * sin importar la zona horaria del visitante.
   */
  timezone: "America/Bogota",
  startsAtISO: "2026-10-18T16:00:00-05:00",
  /** El Brief no indica duración: supuesto documentado (solo afecta calendario y estado posterior). */
  durationHours: 3,

  venue: {
    name: "Conjunto Residencial Oasis del Este",
    detail: "Salón infantil",
    address: "Cl. 23 #2 -99, Pasto, Nariño",
    mapsUrl: "https://maps.app.goo.gl/2YvQkwb15GuhZHHh8",
  },

  /** Persona a la que se dirige el mensaje de WhatsApp. */
  whatsappRecipient: "Luis Carlos",

} as const;

/** Música ambiental. Reemplaza el archivo en /public/audio o cambia esta ruta. */
export const MUSIC = {
  src: "/audio/Camilo, Evaluna Montaner - Índigo.mp3",
  volume: 0.45,
} as const;
