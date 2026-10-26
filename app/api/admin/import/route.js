import { handle, HttpError, json, requireAdmin, snapshot } from "@/lib/api";
import { mutate } from "@/lib/db";
import { parseStudents } from "@/lib/excel";

const MAX_BYTES = 5 * 1024 * 1024;

export const POST = handle(async (req) => {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError("Chọn file Excel (.xlsx) để nhập.");
  if (file.size > MAX_BYTES) throw new HttpError("File quá lớn (tối đa 5MB).");
  if (!/\.xlsx$/i.test(file.name || "")) throw new HttpError("Chỉ hỗ trợ file .xlsx. Nếu đang dùng .xls hoặc .csv, hãy lưu lại thành .xlsx.");

  let parsed;
  try {
    parsed = await parseStudents(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    throw new HttpError(err.message || "Không đọc được file Excel.");
  }

  let created = 0;
  let updated = 0;
  const db = await mutate((d) => {
    const byId = new Map(d.students.map((s) => [s.id, s]));
    for (const row of parsed.rows) {
      const existing = byId.get(row.id);
      if (existing) {
        existing.name = row.name;
        if (row.hasEmail && row.email) existing.email = row.email;
        if (row.hasLevel && row.level) existing.level = row.level;
        updated++;
      } else {
        const student = {
          id: row.id,
          name: row.name,
          email: row.email,
          level: row.level,
          passwordHash: null,
          disabled: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        };
        d.students.push(student);
        byId.set(row.id, student);
        created++;
      }
    }
    return d;
  });

  return json({ created, updated, errors: parsed.errors.slice(0, 20), errorCount: parsed.errors.length, data: snapshot(db) });
});
