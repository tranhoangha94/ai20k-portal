// Pure helpers shared by server pages and the admin client. No Node-only imports here.

export const STATUS_LABEL = { p: "Có mặt", a: "Vắng", e: "Có phép" };

export function vnNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${hour}:${parts.minute}` };
}

export function isPast(session, now = vnNow()) {
  if (session.date < now.date) return true;
  if (session.date > now.date) return false;
  return (session.end || session.start || "23:59") <= now.time;
}

export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const weekday = new Date(`${iso}T00:00:00+07:00`).toLocaleDateString("vi-VN", { weekday: "short", timeZone: "Asia/Ho_Chi_Minh" });
  return `${weekday}, ${d}/${m}/${y}`;
}

export function sortSessions(list) {
  return [...list].sort((a, b) => (a.date + (a.start || "")).localeCompare(b.date + (b.start || "")));
}

export function sessionsFor(sessions, student) {
  return sortSessions(sessions.filter((s) => !s.level || s.level === student.level));
}

export function pointsOf(points, studentId) {
  return points.filter((p) => p.studentId === studentId).reduce((sum, p) => sum + p.delta, 0);
}

export function attendanceStats(db, student, now = vnNow()) {
  const list = sessionsFor(db.sessions, student).map((s) => ({
    ...s,
    status: db.attendance[s.id]?.[student.id] || null,
    past: isPast(s, now),
  }));
  const present = list.filter((s) => s.status === "p").length;
  const absent = list.filter((s) => s.status === "a").length;
  const excused = list.filter((s) => s.status === "e").length;
  const recorded = present + absent + excused;
  const held = list.filter((s) => s.past).length;
  return {
    list,
    total: list.length,
    held,
    present,
    absent,
    excused,
    recorded,
    missed: absent + excused,
    rate: recorded ? Math.round((present / recorded) * 100) : null,
    progress: list.length ? Math.round((held / list.length) * 100) : 0,
  };
}

export function leaderboard(db) {
  const totals = new Map(db.students.map((s) => [s.id, 0]));
  for (const p of db.points) if (totals.has(p.studentId)) totals.set(p.studentId, totals.get(p.studentId) + p.delta);
  return db.students
    .map((s) => ({ id: s.id, name: s.name, level: s.level, total: totals.get(s.id) }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "vi"));
}

export function rankOf(board, studentId) {
  const me = board.find((r) => r.id === studentId);
  if (!me) return null;
  return 1 + board.filter((r) => r.total > me.total).length;
}
