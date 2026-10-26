import { handle, HttpError, json, readJson, requireStudent } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { mutate } from "@/lib/db";
import { hashPassword, safeEqual, verifyPassword } from "@/lib/password";

export const POST = handle(async (req) => {
  const { student } = await requireStudent();
  const body = await readJson(req);
  const current = String(body.current ?? "");
  const next = String(body.next ?? "");

  const ok = student.passwordHash ? verifyPassword(current, student.passwordHash) : safeEqual(current, student.id);
  if (!ok) throw new HttpError("Mật khẩu hiện tại chưa đúng.", 403);
  if (next.length < 6 || next.length > 100) throw new HttpError("Mật khẩu mới cần từ 6 đến 100 ký tự.");
  if (next === student.id) throw new HttpError("Mật khẩu mới không được trùng MSSV.");

  const db = await mutate((d) => {
    const s = d.students.find((x) => x.id === student.id);
    s.passwordHash = hashPassword(next);
    s.pwChangedAt = Date.now();
    return d;
  });
  await setSession(db, "student", student.id);
  return json({ ok: true });
});
