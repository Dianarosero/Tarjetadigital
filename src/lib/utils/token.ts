import { randomInt } from "node:crypto";

/**
 * Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para que el enlace se pueda
 * leer o dictar sin confusiones. 57 símbolos × 16 posiciones ≈ 93 bits de entropía.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const TOKEN_LENGTH = 16;

/** Token aleatorio criptográficamente seguro (randomInt evita el sesgo de módulo). */
export function generateToken(length: number = TOKEN_LENGTH): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}
