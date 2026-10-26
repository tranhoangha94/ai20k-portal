import ExcelJS from "exceljs";
import { attendanceStats, formatDate, leaderboard, pointsOf, sortSessions, STATUS_LABEL } from "./stats.js";

const ALIASES = {
  id: ["mssv", "masosinhvien", "masv", "msv", "studentid", "id"],
  name: ["hovaten", "hoten", "hovatenhocvien", "ten", "name", "fullname"],
  email: ["email", "emailvinuni", "mail", "emailtruong"],
  level: ["level", "lop", "class", "nhom", "cap"],
};

const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function cellText(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    if (Array.isArray(v.richText)) return v.richText.map((r) => r.text).join("").trim();
    if (v.result != null) return cellText(v.result);
    if (v.text != null) return cellText(v.text);
    if (v.hyperlink) return String(v.hyperlink).replace(/^mailto:/i, "");
    return "";
  }
  return String(v).trim();
}

export async function parseStudents(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("File Excel không có sheet nào.");

  let headerRow = 0;
  let columns = {};
  for (let r = 1; r <= Math.min(ws.rowCount, 10) && !headerRow; r++) {
    const found = {};
    ws.getRow(r).eachCell((cell, col) => {
      const key = norm(cellText(cell.value));
      for (const [field, names] of Object.entries(ALIASES)) if (names.includes(key) && !found[field]) found[field] = col;
    });
    if (found.id && found.name) {
      headerRow = r;
      columns = found;
    }
  }
  if (!headerRow) throw new Error("Không tìm thấy dòng tiêu đề. File cần có cột MSSV và Họ tên.");

  const rows = [];
  const errors = [];
  for (let r = headerRow + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const get = (field) => (columns[field] ? cellText(row.getCell(columns[field]).value) : "");
    const id = get("id");
    const name = get("name");
    if (!id && !name) continue;
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(id)) {
      errors.push(`Dòng ${r}: MSSV "${id}" không hợp lệ.`);
      continue;
    }
    if (!name) {
      errors.push(`Dòng ${r}: thiếu họ tên (MSSV ${id}).`);
      continue;
    }
    const email = get("email");
    rows.push({
      id,
      name: name.slice(0, 120),
      email: /^\S+@\S+\.\S+$/.test(email) ? email.slice(0, 160) : "",
      level: get("level").slice(0, 30),
      hasLevel: Boolean(columns.level),
      hasEmail: Boolean(columns.email),
    });
    if (rows.length > 5000) throw new Error("Tối đa 5000 học viên mỗi lần nhập.");
  }
  return { rows, errors };
}

// Stops Excel from treating imported text as a formula (=, +, -, @ prefixes).
const safe = (v) => (typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

function styleHeader(ws) {
  const row = ws.getRow(1);
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF35426E" } };
  row.alignment = { vertical: "middle" };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

export async function buildWorkbook(type, db) {
  const wb = new ExcelJS.Workbook();
  if (type === "template") {
    const ws = wb.addWorksheet("Học viên");
    ws.columns = [
      { header: "MSSV", key: "id", width: 16 },
      { header: "Họ và tên", key: "name", width: 28 },
      { header: "Email", key: "email", width: 32 },
      { header: "Level", key: "level", width: 12 },
    ];
    ws.addRow({ id: "2150001", name: "Nguyễn Văn An", email: "an.nv@vinuni.edu.vn", level: "3" });
    ws.addRow({ id: "2150002", name: "Trần Thị Bình", email: "binh.tt@vinuni.edu.vn", level: "4" });
    styleHeader(ws);
  } else if (type === "students") {
    const ws = wb.addWorksheet("Học viên");
    ws.columns = [
      { header: "MSSV", key: "id", width: 16 },
      { header: "Họ và tên", key: "name", width: 28 },
      { header: "Email", key: "email", width: 32 },
      { header: "Level", key: "level", width: 10 },
      { header: "Có mặt", key: "present", width: 10 },
      { header: "Vắng", key: "absent", width: 10 },
      { header: "Có phép", key: "excused", width: 10 },
      { header: "Điểm tích lũy", key: "points", width: 14 },
    ];
    for (const s of db.students) {
      const st = attendanceStats(db, s);
      ws.addRow({ id: safe(s.id), name: safe(s.name), email: safe(s.email), level: safe(s.level), present: st.present, absent: st.absent, excused: st.excused, points: pointsOf(db.points, s.id) });
    }
    styleHeader(ws);
  } else if (type === "attendance") {
    const ws = wb.addWorksheet("Điểm danh");
    const sessions = sortSessions(db.sessions);
    ws.columns = [
      { header: "MSSV", key: "id", width: 16 },
      { header: "Họ và tên", key: "name", width: 28 },
      ...sessions.map((s) => ({ header: safe(`${formatDate(s.date)} ${s.title}`), key: `s_${s.id}`, width: 18 })),
      { header: "Tổng nghỉ", key: "missed", width: 11 },
    ];
    for (const s of db.students) {
      const row = { id: safe(s.id), name: safe(s.name), missed: 0 };
      for (const sess of sessions) {
        const code = db.attendance[sess.id]?.[s.id];
        row[`s_${sess.id}`] = STATUS_LABEL[code] || "";
        if (code === "a" || code === "e") row.missed++;
      }
      ws.addRow(row);
    }
    styleHeader(ws);
  } else if (type === "points") {
    const ws = wb.addWorksheet("Điểm tích lũy");
    ws.columns = [
      { header: "Hạng", key: "rank", width: 8 },
      { header: "MSSV", key: "id", width: 16 },
      { header: "Họ và tên", key: "name", width: 28 },
      { header: "Điểm", key: "total", width: 10 },
    ];
    leaderboard(db).forEach((r, i) => ws.addRow({ rank: i + 1, id: safe(r.id), name: safe(r.name), total: r.total }));
    styleHeader(ws);
  } else {
    throw new Error("Loại file không hợp lệ.");
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
