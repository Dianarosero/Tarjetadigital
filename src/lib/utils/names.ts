/** Normaliza el nombre visible de una invitación sin imponer una denominación. */
export function normalizeInvitationName(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}
