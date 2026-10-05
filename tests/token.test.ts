import { describe, expect, it } from "vitest";
import { generateToken, TOKEN_LENGTH } from "@/lib/utils/token";
import { TOKEN_REGEX, tokenSchema } from "@/lib/validation/schemas";

describe("generateToken", () => {
  it("genera tokens del largo esperado y válidos para el esquema", () => {
    for (let i = 0; i < 200; i += 1) {
      const token = generateToken();
      expect(token).toHaveLength(TOKEN_LENGTH);
      expect(TOKEN_REGEX.test(token)).toBe(true);
      expect(tokenSchema.safeParse(token).success).toBe(true);
    }
  });

  it("no usa caracteres ambiguos (0 O 1 l I)", () => {
    const sample = Array.from({ length: 300 }, () => generateToken()).join("");
    expect(sample).not.toMatch(/[0O1lI]/);
  });

  it("no repite tokens en una muestra grande", () => {
    const tokens = new Set(Array.from({ length: 5000 }, () => generateToken()));
    expect(tokens.size).toBe(5000);
  });
});

describe("tokenSchema", () => {
  it.each(["", "corto", "con espacios 123456", "../../etc/passwd", "a".repeat(65), "tok'en;DROP TABLE"])(
    "rechaza %j",
    (value) => {
      expect(tokenSchema.safeParse(value).success).toBe(false);
    },
  );
  it("acepta el formato del Brief (12 alfanuméricos)", () => {
    expect(tokenSchema.safeParse("AbC123xyz789").success).toBe(true);
  });
});
