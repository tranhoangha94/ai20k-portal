import { handle, json, readJson, str } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { mutate, readDb } from "@/lib/db";
import { safeEqual, verifyPassword } from "@/lib/password";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const FAIL = "Sai tài khoản hoặc mật khẩu.";

export const POST = handle(async (req) => {
  const body = await readJson(req);
  const username = str(body.username, 120);
  const password = String(body.password ?? "").slice(0, 200);
  if (!username || !password) return json({ error: "Nhập tài khoản và mật khẩu." }, 400);

  const db = await readDb();
  const key = username.toLowerCase();

  if (key === db.admin.user.toLowerCase()) {
    if (!verifyPassword(password, db.admin.passwordHash)) {
      await delay(400);
      return json({ error: FAIL }, 401);
    }
    await setSession(db, "admin", db.admin.user);
    return json({ ok: true, redirect: "/admin" });
  }

  const student = db.students.find((s) => s.id.toLowerCase() === key || (s.email && s.email.toLowerCase() === key));
  const valid = student && !student.disabled && (student.passwordHash ? verifyPassword(password, student.passwordHash) : safeEqual(password, student.id));
  if (!valid) {
    await delay(400);
    return json({ error: student?.disabled ? "Tài khoản đã bị khóa. Liên hệ BTC." : FAIL }, 401);
  }

  await mutate((d) => {
    const s = d.students.find((x) => x.id === student.id);
    if (s) s.lastLoginAt = new Date().toISOString();
  });
  await setSession(db, "student", student.id);
  return json({ ok: true, redirect: "/me" });
});
