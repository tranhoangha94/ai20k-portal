import crypto from "node:crypto";
import { cookies } from "next/headers";
import { readDb } from "./db.js";

export const COOKIE = "ai20k_session";
const TTL_SECONDS = 7 * 24 * 3600;

function secretOf(db) {
  return process.env.SESSION_SECRET || db.secret;
}

function sign(db, body) {
  return crypto.createHmac("sha256", secretOf(db)).update(body).digest("base64url");
}

export function createToken(db, role, id) {
  const body = Buffer.from(JSON.stringify({ r: role, u: id, iat: Date.now() })).toString("base64url");
  return `${body}.${sign(db, body)}`;
}

function readToken(db, token) {
  const [body, mac] = String(token).split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(db, body));
  const actual = Buffer.from(mac);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (Date.now() - payload.iat > TTL_SECONDS * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSession(db, role, id) {
  const jar = await cookies();
  jar.set(COOKIE, createToken(db, role, id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

// Returns { role, id, name, student? } or null. Pass an already-loaded db to avoid a second read.
export async function getSession(db) {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  db = db || (await readDb());
  const payload = readToken(db, token);
  if (!payload) return null;
  if (payload.r === "admin") {
    if (payload.u !== db.admin.user || payload.iat < (db.admin.pwChangedAt || 0)) return null;
    return { role: "admin", id: db.admin.user, name: "Quản trị viên" };
  }
  const student = db.students.find((s) => s.id === payload.u);
  if (!student || student.disabled || payload.iat < (student.pwChangedAt || 0)) return null;
  return { role: "student", id: student.id, name: student.name, student };
}
