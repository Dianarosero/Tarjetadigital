/** Tipos de dominio compartidos entre servidor y cliente. */

export type RsvpStatus = "attending" | "declined";
export type RsvpChannel = "form" | "whatsapp" | "admin";
/** "pending" no existe en la base de datos: significa "sin fila en rsvps". */
export type FamilyStatus = "pending" | RsvpStatus;

export interface RsvpRecord {
  status: RsvpStatus;
  guestsConfirmed: number;
  channel: RsvpChannel;
  respondedAt: string;
}

/** Invitación + su respuesta (vista `family_overview`). Solo se usa en el servidor. */
export interface FamilyOverview {
  id: string;
  name: string;
  token: string;
  guestsInvited: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rsvp: RsvpRecord | null;
}

/** Lo único que viaja al navegador de los invitados (sin id, sin token). */
export interface PublicRsvp {
  status: RsvpStatus;
  guestsConfirmed: number;
}

export interface PublicInvitation {
  familyName: string;
  guestsInvited: number;
  rsvp: PublicRsvp | null;
}

export type InvitationLookup =
  | { kind: "ok"; invitation: PublicInvitation }
  | { kind: "invalid-token" }
  | { kind: "not-found" }
  | { kind: "disabled" }
  | { kind: "incomplete-data" }
  | { kind: "error" };

export type InvitationProblemKind = Exclude<InvitationLookup["kind"], "ok" | "invalid-token" | "not-found">;

export type RsvpErrorCode =
  | "invalid"
  | "not_found"
  | "disabled"
  | "already_responded"
  | "too_many_guests"
  | "server_error";

export type RsvpApiResponse =
  | { ok: true; rsvp: PublicRsvp }
  | { ok: false; code: RsvpErrorCode; rsvp?: PublicRsvp; guestsInvited?: number };

/** Configuración derivada de variables de entorno (servidor). */
export interface SiteSettings {
  whatsappNumber: string | null;
  siteUrl: string | null;
}

export interface SummaryStats {
  totalFamilies: number;
  attending: number;
  declined: number;
  pending: number;
  guestsInvited: number;
  guestsConfirmed: number;
  disabled: number;
}

/** Estado devuelto por las Server Actions del panel admin. */
export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Valores enviados, para no perder lo escrito cuando hay un error (React 19 resetea el formulario). */
  values?: Record<string, string>;
}
