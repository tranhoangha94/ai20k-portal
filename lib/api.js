import { NextResponse } from "next/server";
import { getSession } from "./auth.js";
import { readDb, storageInfo } from "./db.js";

export const json = (data, status = 200) => NextResponse.json(data, { status });

export class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const str = (v, max = 200) => String(v ?? "").trim().slice(0, max);
export const okUrl = (u) => u === "" || /^(https?:\/\/|mailto:|\/(?!\/))/i.test(u);
export const okDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
export const okTime = (t) => t === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

export const ICONS = ["book", "flame", "chat", "download", "link", "mail", "calendar", "wifi", "star"];
export const TONES = ["sky", "butter", "mint", "lilac", "peach", "navy", "red"];

export async function requireAdmin() {
  const db = await readDb();
  const session = await getSession(db);
  if (session?.role !== "admin") throw new HttpError("Bạn cần đăng nhập quản trị.", 401);
  return db;
}

export async function requireStudent() {
  const db = await readDb();
  const session = await getSession(db);
  if (session?.role !== "student") throw new HttpError("Bạn cần đăng nhập.", 401);
  return { db, student: session.student };
}

// Everything the admin UI needs, without password hashes or the session secret.
export function snapshot(db) {
  return {
    students: db.students.map(({ passwordHash, ...s }) => ({ ...s, customPassword: Boolean(passwordHash) })),
    sessions: db.sessions,
    attendance: db.attendance,
    points: db.points,
    links: db.links,
    posts: db.posts,
    settings: db.settings,
    admin: { user: db.admin.user, isDefault: Boolean(db.admin.isDefault) },
    storage: storageInfo,
  };
}

export function handle(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, 500);
    }
  };
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError("Dữ liệu gửi lên không hợp lệ.");
  }
}
