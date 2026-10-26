"use client";

import { useMemo, useRef, useState } from "react";
import { attendanceStats, pointsOf, vnNow } from "@/lib/stats";
import { Field, Modal } from "./ui";

const EMPTY = { id: "", name: "", email: "", level: "", isNew: true };

export default function StudentsTab({ data, call, upload, notify }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState(null);
  const fileRef = useRef(null);
  const max = data.settings.maxAbsences;

  const levels = useMemo(() => [...new Set(data.students.map((s) => s.level).filter(Boolean))].sort(), [data.students]);
  const rows = useMemo(() => {
    const now = vnNow();
    const q = query.trim().toLowerCase();
    return data.students
      .filter((s) => (!level || s.level === level) && (!q || `${s.id} ${s.name} ${s.email}`.toLowerCase().includes(q)))
      .map((s) => ({ s, st: attendanceStats(data, s, now), pts: pointsOf(data.points, s.id) }))
      .sort((a, b) => a.s.name.localeCompare(b.s.name, "vi"));
  }, [data, query, level]);

  async function onImport(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    const form = new FormData();
    form.set("file", file);
    const result = await upload("/api/admin/import", form);
    setImporting(false);
    if (result) setReport(result);
  }

  async function save(e) {
    e.preventDefault();
    const ok = await call("student.save", editing, editing.isNew ? "Đã thêm học viên" : "Đã lưu thay đổi");
    if (ok) setEditing(null);
  }

  async function remove(s) {
    if (!confirm(`Xoá học viên ${s.name} (${s.id})? Điểm danh và điểm của học viên này cũng bị xoá.`)) return;
    call("student.delete", { id: s.id }, "Đã xoá học viên");
  }

  return (
    <>
      <div className="toolbar">
        <input className="input grow" placeholder="Tìm theo MSSV, tên, email…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm học viên" />
        {levels.length > 0 && (
          <select className="select" style={{ width: "auto" }} value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Lọc theo level">
            <option value="">Tất cả level</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                Level {l}
              </option>
            ))}
          </select>
        )}
        <input ref={fileRef} type="file" accept=".xlsx" hidden onChange={onImport} />
        <button className="btn btn-brand btn-sm" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? "Đang nhập…" : "Nhập Excel"}
        </button>
        <a className="btn btn-ghost btn-sm" href="/api/admin/export?type=template">
          Tải file mẫu
        </a>
        <a className="btn btn-ghost btn-sm" href="/api/admin/export?type=students">
          Xuất Excel
        </a>
        <button className="btn btn-red btn-sm" onClick={() => setEditing({ ...EMPTY })}>
          + Thêm học viên
        </button>
      </div>

      {report && (
        <div className={`alert ${report.errorCount ? "" : "ok"}`} style={{ marginBottom: 16 }}>
          <b>
            Đã nhập xong: thêm mới {report.created}, cập nhật {report.updated}
            {report.errorCount ? `, bỏ qua ${report.errorCount} dòng lỗi` : ""}.
          </b>
          {report.errors.length > 0 && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {report.errors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setReport(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ tên</th>
              <th>Level</th>
              <th className="num">Có mặt</th>
              <th className="num">Nghỉ</th>
              <th className="num">Điểm</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, st, pts }) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>
                  {s.name}
                  {s.email && <span className="sub">{s.email}</span>}
                </td>
                <td>{s.level || "—"}</td>
                <td className="num">{st.present}</td>
                <td className="num">
                  <span className={`badge ${st.missed > max ? "b-bad" : st.missed === max && max > 0 ? "b-warn" : ""}`}>
                    {st.missed}/{max}
                  </span>
                </td>
                <td className="num">{pts}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ id: s.id, name: s.name, email: s.email, level: s.level, isNew: false })}>
                      Sửa
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(s)}>
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  {data.students.length === 0 ? "Chưa có học viên. Bấm “Nhập Excel” hoặc “Thêm học viên”." : "Không có học viên khớp bộ lọc."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="hint" style={{ marginTop: 10 }}>
        {rows.length}/{data.students.length} học viên · File Excel cần các cột <b>MSSV</b>, <b>Họ và tên</b>, tuỳ chọn <b>Email</b>, <b>Level</b>. Học viên mới có mật khẩu mặc định là MSSV.
      </p>

      {editing && (
        <Modal title={editing.isNew ? "Thêm học viên" : "Sửa học viên"} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            <Field label="MSSV" hint={editing.isNew ? "Dùng làm tên đăng nhập và mật khẩu mặc định." : "MSSV không đổi được."}>
              <input className="input" value={editing.id} disabled={!editing.isNew} onChange={(e) => setEditing({ ...editing, id: e.target.value })} required autoFocus={editing.isNew} />
            </Field>
            <Field label="Họ và tên">
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required autoFocus={!editing.isNew} />
            </Field>
            <Field label="Email VinUni">
              <input className="input" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </Field>
            <Field label="Level / lớp" hint="Để trống nếu không phân level. Buổi học gắn level chỉ hiện cho học viên cùng level.">
              <input className="input" value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })} />
            </Field>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Huỷ
              </button>
              <button type="submit" className="btn btn-red">
                Lưu
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
