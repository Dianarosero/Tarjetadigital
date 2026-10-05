import { EVENT } from "./event";

/**
 * TEXTOS DE LA INVITACIÓN — todo el contenido visible para los invitados.
 * Edita aquí cualquier frase sin tocar los componentes.
 *
 * ⚠ El Brief describe el mensaje de bienvenida (voz del bebé bendiciendo a
 * los invitados) pero no trae el texto final: `welcome.paragraphs`
 * es un BORRADOR para que los papás lo revisen o lo reemplacen.
 */
const plural = (n: number) => (n === 1 ? "persona" : "personas");

export const copy = {
  opening: {
    babyLabel: "BABY",
    showerScript: "Shower",
    name: "",
  },

  music: {
    labelOff: "Activar música",
    labelOn: "Música activada",
    ariaOff: "Activar la música ambiental",
    ariaOn: "Silenciar la música ambiental",
    failed: "No se pudo reproducir la música en este dispositivo.",
  },

  welcome: {
    greeting: (familyDisplay: string) => `${familyDisplay},`,
    paragraphs: [
      "Nuestros corazones están llenos de ilusión por la llegada de Juan José. Nos llena de gratitud saber que nacerá rodeado de un inmenso cariño.",
      "Gracias por acompañarnos en esta dulce espera. Que Dios bendiga siempre su hogar, tal como hoy bendice al nuestro.",
      "¡Acompáñennos a celebrar este milagro!",
    ],
    parentsLead: "Con todo el amor",
  },

  event: {
    venueTitle: "Lugar",
    directions: "CÓMO LLEGAR",
    newTab: "(se abre en una pestaña nueva)",
  },

  countdown: {
    title: "Falta muy poco",
    days: "DÍAS",
    hours: "HORAS",
    minutes: "MINUTOS",
    seconds: "SEGUNDOS",
    during: "¡La celebración ha comenzado!",
    after: "¡Gracias por celebrar con nosotros!",
  },

  rsvp: {
    title: "¿Nos acompañarán?",
    invitedFor: (n: number) =>
      n === 1 ? "Esta invitación es para 1 persona." : `Esta invitación es para ${n} personas.`,
    yes: "SÍ, CONFIRMAREMOS",
    no: "NO PODREMOS ASISTIR",
    guestsQuestion: "¿Cuántas personas asistirán?",
    lessGuests: "Una persona menos",
    moreGuests: "Una persona más",
    guestsUnit: plural,
    send: "ENVIAR CONFIRMACIÓN",
    whatsapp: "CONFIRMAR POR WHATSAPP",
    whatsappHint: "Guardamos tu confirmación y se abre WhatsApp con el mensaje listo.",
    declineAsk: "¿Nos confirmas que no podrán acompañarnos?",
    declineSend: "SÍ, ENVIAR RESPUESTA",
    back: "VOLVER",
    sending: "Enviando…",
    doneAttendingTitle: (familyDisplay: string) => `¡Gracias, ${familyDisplay}!`,
    doneAttendingBody: (n: number) =>
      `Confirmamos la asistencia de: ${n} ${plural(n)}. ¡Los esperamos con mucho amor!`,
    doneDeclinedTitle: (familyDisplay: string) => `Gracias por avisarnos, ${familyDisplay}`,
    doneDeclinedBody: "Los llevaremos en el corazón. ¡Gracias por pensar en nosotros!",
    alreadyRegistered: "Ya teníamos registrada esta respuesta.",
    changeNote: "Si necesitan cambiar su respuesta, escríbanles a Raquel o a Luis Carlos.",
  },

  /** Mensajes de error comprensibles para el usuario final. */
  errors: {
    network: "No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.",
    server: "Tuvimos un problema al guardar tu respuesta. Inténtalo de nuevo en unos minutos.",
    unavailable: "Esta invitación ya no está disponible. Escríbeles a Raquel o a Luis Carlos.",
    invalid: "Revisa los datos e inténtalo de nuevo.",
    tooMany: (n: number) =>
      n === 1 ? "Tu invitación es para 1 persona." : `Tu invitación es para ${n} personas como máximo.`,
    whatsappSaveFailed:
      "WhatsApp se abrió, pero no pudimos guardar tu confirmación aquí. Toca «Enviar confirmación» para registrarla.",
  },

  closing: {
    message: "¡Te esperamos con amor!",
    footer: "Diseñado por su tía, con amor para Juan José",
  },

  screens: {
    landing: {
      title: "Invitación personal",
      body: "Esta invitación es solo para quienes recibieron su enlace personalizado. Ábrelo desde el mensaje que te enviamos.",
    },
    notFound: {
      title: "No encontramos esta invitación",
      body: "Revisa que el enlace esté completo, tal como lo recibiste. Si el problema sigue, escríbeles a Raquel o a Luis Carlos.",
    },
    disabled: {
      title: "Esta invitación no está disponible",
      body: "El enlace fue desactivado. Si crees que es un error, escríbeles a Raquel o a Luis Carlos.",
    },
    error: {
      title: "No pudimos cargar tu invitación",
      body: "Hubo un problema de conexión. Inténtalo de nuevo en unos segundos.",
      retry: "REINTENTAR",
    },
    incomplete: {
      title: "Esta invitación está incompleta",
      body: "Falta información para mostrarla. Escríbeles a Raquel o a Luis Carlos para que la revisen.",
    },
  },
} as const;
