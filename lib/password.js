import crypto from "node:crypto";

const PARAMS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 32, PARAMS);
  return `s1$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const [version, saltHex, hashHex] = stored.split("$");
  if (version !== "s1" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(String(password), Buffer.from(saltHex, "hex"), expected.length, PARAMS);
  return crypto.timingSafeEqual(expected, actual);
}

export function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
