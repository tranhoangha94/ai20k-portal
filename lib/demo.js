import { newId } from "./db.js";

// Demo logins offered on the sign-in page while the portal is still a trial run.
export const DEMO_ADMIN = { username: "admin", password: "abc@12345" };
export const DEMO_STUDENT = { id: "DEMO001", name: "Học viên Demo", email: "demo@example.com" };

const DAY = 24 * 60 * 60 * 1000;
const dateOffset = (days) => new Date(Date.now() + 7 * 60 * 60 * 1000 + days * DAY).toISOString().slice(0, 10);

// Adds the demo student (and, on an empty portal, a few sample sessions/points so /me has something to show).
export function ensureDemoStudent(db) {
  if (db.students.some((s) => s.id === DEMO_STUDENT.id)) return;
  db.students.push({ ...DEMO_STUDENT, level: "", passwordHash: null, disabled: false, createdAt: new Date().toISOString(), lastLoginAt: null });
  if (db.sessions.length) return;

  const plan = [
    { days: -14, title: "Buổi 1 · Giới thiệu & cài đặt công cụ", code: "p" },
    { days: -7, title: "Buổi 2 · Prompt engineering thực chiến", code: "e" },
    { days: -3, title: "Buổi 3 · Xây dựng AI agent đầu tiên", code: "p" },
    { days: 4, title: "Buổi 4 · RAG và tìm kiếm tri thức" },
    { days: 11, title: "Buổi 5 · Triển khai & đánh giá" },
  ];
  for (const p of plan) {
    const id = newId();
    db.sessions.push({ id, title: p.title, date: dateOffset(p.days), start: "18:30", end: "21:00", location: "VinUni · Phòng học AI.20K", level: "", note: "" });
    if (p.code) db.attendance[id] = { [DEMO_STUDENT.id]: p.code };
  }
  const date = new Date().toISOString();
  db.points.push({ id: newId(), studentId: DEMO_STUDENT.id, delta: 20, reason: "Hoàn thành bài lab buổi 1", date });
  db.points.push({ id: newId(), studentId: DEMO_STUDENT.id, delta: 10, reason: "Phát biểu xây dựng bài", date });
}
