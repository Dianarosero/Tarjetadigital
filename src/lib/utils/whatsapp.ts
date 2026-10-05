/**
 * Acepta "+57 300 123 4567", "573001234567", etc. y devuelve solo dígitos con
 * código de país (formato que exige wa.me). Devuelve null si no parece válido.
 */
export function sanitizeWhatsappNumber(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export interface WhatsappMessageInput {
  familyName: string;
  guests: number;
  recipient: string;
  babyName: string;
}

/** Mensaje personalizado: nunca contiene datos de una invitación fija. */
export function buildWhatsappMessage({ familyName, guests, recipient, babyName }: WhatsappMessageInput): string {
  const people = guests === 1 ? "1 persona" : `${guests} personas`;
  return (
    `Hola ${recipient}, ${familyName} confirma su asistencia al Baby Shower de ${babyName}. ` +
    `Asistiremos ${people}.`
  );
}

export function buildWhatsappUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
