import { handle, HttpError, ICONS, json, okDate, okTime, okUrl, readJson, requireAdmin, snapshot, str, TONES } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { mutate, newId } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export const GET = handle(async () => {
  const db = await requireAdmin();
  return json({ data: snapshot(db) });
});

const ACTIONS = {
  "student.save"(db, b) {
    const id = str(b.id, 30);
    const name = str(b.name, 120);
    const email = str(b.email, 160);
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(id)) throw new HttpError("MSSV chỉ gồm chữ, số, dấu . _ - (3–30 ký tự).");
    if (!name) throw new HttpError("Nhập họ tên học viên.");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new HttpError("Email chưa đúng định dạng.");
    const existing = db.students.find((s) => s.id === id);
    if (b.isNew && existing) throw new HttpError(`MSSV ${id} đã tồn tại.`);
    if (!b.isNew && !existing) throw new HttpError("Không tìm thấy học viên.", 404);
    const fields = { name, email, level: str(b.level, 30) };
    if (existing) Object.assign(existing, fields);
    else db.students.push({ id, ...fields, passwordHash: null, disabled: false, createdAt: new Date().toISOString(), lastLoginAt: null });
  },

  "student.delete"(db, b) {
    const id = str(b.id, 30);
    db.students = db.students.filter((s) => s.id !== id);
    db.points = db.points.filter((p) => p.studentId !== id);
    for (const sessionId of Object.keys(db.attendance)) delete db.attendance[sessionId][id];
  },

  "student.resetPassword"(db, b) {
    const s = db.students.find((x) => x.id === str(b.id, 30));
    if (!s) throw new HttpError("Không tìm thấy học viên.", 404);
    s.passwordHash = null;
    s.pwChangedAt = Date.now();
  },

  "student.setDisabled"(db, b) {
    const s = db.students.find((x) => x.id === str(b.id, 30));
    if (!s) throw new HttpError("Không tìm thấy học viên.", 404);
    s.disabled = Boolean(b.disabled);
  },

  "session.save"(db, b) {
    const title = str(b.title, 120);
    const date = str(b.date, 10);
    const start = str(b.start, 5);
    const end = str(b.end, 5);
    if (!title) throw new HttpError("Nhập tên buổi học.");
    if (!okDate(date)) throw new HttpError("Chọn ngày học hợp lệ.");
    if (!okTime(start) || !okTime(end)) throw new HttpError("Giờ học cần dạng HH:MM.");
    if (start && end && end <= start) throw new HttpError("Giờ kết thúc phải sau giờ bắt đầu.");
    const fields = { title, date, start, end, location: str(b.location, 160), level: str(b.level, 30), note: str(b.note, 500) };
    const existing = b.id ? db.sessions.find((s) => s.id === b.id) : null;
    if (existing) Object.assign(existing, fields);
    else db.sessions.push({ id: newId(), ...fields });
  },

  "session.delete"(db, b) {
    db.sessions = db.sessions.filter((s) => s.id !== b.id);
    delete db.attendance[b.id];
  },

  "attendance.set"(db, b) {
    if (!db.sessions.some((s) => s.id === b.sessionId)) throw new HttpError("Không tìm thấy buổi học.", 404);
    const known = new Set(db.students.map((s) => s.id));
    const sheet = (db.attendance[b.sessionId] ||= {});
    for (const [studentId, code] of Object.entries(b.records || {})) {
      if (!known.has(studentId)) continue;
      if (code === "p" || code === "a" || code === "e") sheet[studentId] = code;
      else delete sheet[studentId];
    }
  },

  "points.add"(db, b) {
    const delta = Math.trunc(Number(b.delta));
    const reason = str(b.reason, 200);
    if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 1000) throw new HttpError("Số điểm cần khác 0 và không quá 1000.");
    if (!reason) throw new HttpError("Nhập lý do cộng/trừ điểm.");
    const known = new Set(db.students.map((s) => s.id));
    const ids = [...new Set((Array.isArray(b.studentIds) ? b.studentIds : []).map((x) => str(x, 30)))].filter((id) => known.has(id));
    if (!ids.length) throw new HttpError("Chọn ít nhất một học viên.");
    const date = new Date().toISOString();
    for (const studentId of ids) db.points.push({ id: newId(), studentId, delta, reason, date });
  },

  "points.delete"(db, b) {
    db.points = db.points.filter((p) => p.id !== b.id);
  },

  "links.save"(db, b) {
    if (!Array.isArray(b.links) || b.links.length > 30) throw new HttpError("Danh sách liên kết không hợp lệ.");
    db.links = b.links.map((l, i) => {
      const title = str(l.title, 60);
      const url = str(l.url, 500);
      if (!title) throw new HttpError(`Liên kết #${i + 1} chưa có tiêu đề.`);
      if (!okUrl(url)) throw new HttpError(`Liên kết "${title}" cần bắt đầu bằng https://, http://, mailto: hoặc /.`);
      if (l.visible && !url) throw new HttpError(`"${title}" đang hiện nhưng chưa có đường link.`);
      return {
        id: str(l.id, 20) || newId(),
        title,
        desc: str(l.desc, 200),
        meta: str(l.meta, 200),
        url,
        icon: ICONS.includes(l.icon) ? l.icon : "link",
        tone: TONES.includes(l.tone) ? l.tone : "sky",
        visible: Boolean(l.visible),
        download: Boolean(l.download),
      };
    });
  },

  "post.save"(db, b) {
    const title = str(b.title, 140);
    const body = str(b.body, 4000);
    if (!title) throw new HttpError("Nhập tiêu đề bài đăng.");
    const existing = b.id ? db.posts.find((p) => p.id === b.id) : null;
    if (existing) Object.assign(existing, { title, body, pinned: Boolean(b.pinned), updatedAt: new Date().toISOString() });
    else db.posts.unshift({ id: newId(), title, body, pinned: Boolean(b.pinned), createdAt: new Date().toISOString() });
  },

  "post.delete"(db, b) {
    db.posts = db.posts.filter((p) => p.id !== b.id);
  },

  "settings.save"(db, b) {
    const max = Math.trunc(Number(b.maxAbsences));
    if (!Number.isFinite(max) || max < 0 || max > 50) throw new HttpError("Số buổi nghỉ tối đa cần từ 0 đến 50.");
    db.settings.maxAbsences = max;
  },
};

export const POST = handle(async (req) => {
  await requireAdmin();
  const body = await readJson(req);

  if (body.action === "admin.password") {
    const next = String(body.next ?? "");
    if (next.length < 8 || next.length > 100) throw new HttpError("Mật khẩu mới cần từ 8 đến 100 ký tự.");
    const db = await mutate((d) => {
      if (!verifyPassword(String(body.current ?? ""), d.admin.passwordHash)) throw new HttpError("Mật khẩu hiện tại chưa đúng.", 403);
      d.admin.passwordHash = hashPassword(next);
      d.admin.isDefault = false;
      d.admin.pwChangedAt = Date.now();
      return d;
    });
    await setSession(db, "admin", db.admin.user);
    return json({ data: snapshot(db) });
  }

  const run = ACTIONS[body.action];
  if (!run) throw new HttpError("Hành động không hợp lệ.");
  const db = await mutate((d) => {
    run(d, body);
    return d;
  });
  return json({ data: snapshot(db) });
});
