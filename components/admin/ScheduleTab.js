"use client";

import { useMemo, useState } from "react";
import { formatDate, isPast, sortSessions, vnNow } from "@/lib/stats";
import { Field, Modal } from "./ui";

const EMPTY = { id: "", title: "", date: "", start: "18:30", end: "21:00", location: "", level: "", note: "" };
const OPTIONS = [
  ["p", "Có mặt", "on-p"],
  ["a", "Vắng", "on-a"],
  ["e", "Có phép", "on-e"],
];

export default function ScheduleTab({ data, call }) {
  const sessions = useMemo(() => sortSessions(data.sessions), [data.sessions]);
  const [pickedId, setPickedId] = useState(null);
  const [editing, setEditing] = useState(null);

  const now = vnNow();
  const selected =
    sessions.find((s) => s.id === pickedId) || sessions.find((s) => !isPast(s, now)) || sessions[sessions.length - 1] || null;
  const levels = [...new Set(data.students.map((s) => s.level).filter(Boolean))];

  async function saveSession(e) {
    e.preventDefault();
    const before = new Set(data.sessions.map((s) => s.id));
    const result = await call("session.save", editing, "Đã lưu buổi học");
    if (!result) return;
    if (!editing.id) {
      const created = result.sessions.find((s) => !before.has(s.id));
      if (created) setPickedId(created.id);
    }
    setEditing(null);
  }

  async function removeSession(s) {
    if (!confirm(`Xoá buổi “${s.title}” (${formatDate(s.date)})? Dữ liệu điểm danh của buổi này cũng bị xoá.`)) return;
    await call("session.delete", { id: s.id }, "Đã xoá buổi học");
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-red btn-sm" onClick={() => setEditing({ ...EMPTY })}>
          + Thêm buổi học
        </button>
        <a className="btn btn-ghost btn-sm" href="/api/admin/export?type=attendance">
          Xuất bảng điểm danh
        </a>
      </div>

      {sessions.length === 0 ? (
        <div className="card empty">Chưa có buổi học nào. Bấm “Thêm buổi học” để tạo lịch.</div>
      ) : (
        <div className="split">
          <div className="list" role="listbox" aria-label="Danh sách buổi học">
            {sessions.map((s) => {
              const recorded = Object.keys(data.attendance[s.id] || {}).length;
              return (
                <button key={s.id} className={`list-item${s.id === selected?.id ? " active" : ""}`} onClick={() => setPickedId(s.id)} role="option" aria-selected={s.id === selected?.id}>
                  <span>
                    <b>{s.title}</b>
                    <small>
                      {formatDate(s.date)}
                      {s.start && ` · ${s.start}`}
                      {s.level && ` · Level ${s.level}`}
                    </small>
                  </span>
                  <span className={`badge ${recorded ? "b-ok" : isPast(s, now) ? "b-warn" : ""}`}>{recorded ? `${recorded} đã điểm danh` : isPast(s, now) ? "Chưa điểm danh" : "Sắp tới"}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <AttendanceSheet
              key={`${selected.id}:${JSON.stringify(data.attendance[selected.id] || {})}`}
              session={selected}
              data={data}
              call={call}
              onEdit={() => setEditing({ ...EMPTY, ...selected })}
              onDelete={() => removeSession(selected)}
            />
          )}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? "Sửa buổi học" : "Thêm buổi học"} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={saveSession}>
            <Field label="Tên buổi học">
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required autoFocus />
            </Field>
            <div className="row">
              <Field label="Ngày">
                <input className="input" type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} required />
              </Field>
              <Field label="Bắt đầu">
                <input className="input" type="time" value={editing.start} onChange={(e) => setEditing({ ...editing, start: e.target.value })} />
              </Field>
              <Field label="Kết thúc">
                <input className="input" type="time" value={editing.end} onChange={(e) => setEditing({ ...editing, end: e.target.value })} />
              </Field>
            </div>
            <Field label="Địa điểm / link học online">
              <input className="input" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
            </Field>
            <Field label="Level" hint="Để trống nếu buổi học dành cho tất cả học viên.">
              <input className="input" list="level-options" value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })} />
              <datalist id="level-options">
                {levels.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </Field>
            <Field label="Ghi chú">
              <textarea className="textarea" style={{ minHeight: 70 }} value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
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

function AttendanceSheet({ session, data, call, onEdit, onDelete }) {
  const saved = data.attendance[session.id] || {};
  const [draft, setDraft] = useState(saved);
  const [query, setQuery] = useState("");

  const roster = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.students
      .filter((s) => !session.level || s.level === session.level)
      .filter((s) => !q || `${s.id} ${s.name}`.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [data.students, session.level, query]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const counts = { p: 0, a: 0, e: 0 };
  for (const code of Object.values(draft)) if (counts[code] !== undefined) counts[code]++;

  function setStatus(id, code) {
    setDraft((d) => {
      const next = { ...d };
      if (next[id] === code) delete next[id];
      else next[id] = code;
      return next;
    });
  }

  function markAll(code) {
    setDraft((d) => {
      const next = { ...d };
      for (const s of roster) next[s.id] = code;
      return next;
    });
  }

  function clearVisible() {
    setDraft((d) => {
      const next = { ...d };
      for (const s of roster) delete next[s.id];
      return next;
    });
  }

  async function save() {
    const records = {};
    for (const s of roster) records[s.id] = draft[s.id] || "";
    await call("attendance.set", { sessionId: session.id, records }, "Đã lưu điểm danh");
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>{session.title}</h3>
          <p className="hint">
            {formatDate(session.date)}
            {session.start && ` · ${session.start}${session.end ? `–${session.end}` : ""}`}
            {session.location && ` · ${session.location}`}
            {session.level && ` · Level ${session.level}`}
          </p>
        </div>
        <div className="actions">
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            Sửa buổi
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            Xoá
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input className="input grow" placeholder="Tìm học viên…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm học viên" />
        <button className="btn btn-ghost btn-sm" onClick={() => markAll("p")}>
          Tất cả có mặt
        </button>
        <button className="btn btn-ghost btn-sm" onClick={clearVisible}>
          Xoá chọn
        </button>
      </div>

      {roster.length === 0 ? (
        <p className="empty">{data.students.length ? "Không có học viên phù hợp với buổi học này." : "Chưa có học viên. Hãy nhập danh sách ở tab Học viên."}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>
                    <div className="seg" role="group" aria-label={`Điểm danh ${s.name}`}>
                      {OPTIONS.map(([code, label, cls]) => (
                        <button key={code} type="button" className={draft[s.id] === code ? cls : ""} aria-pressed={draft[s.id] === code} onClick={() => setStatus(s.id, code)}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="toolbar" style={{ marginTop: 16, marginBottom: 0, justifyContent: "space-between" }}>
        <span className="hint">
          {counts.p} có mặt · {counts.a} vắng · {counts.e} có phép
        </span>
        <button className="btn btn-red" onClick={save} disabled={!dirty}>
          {dirty ? "Lưu điểm danh" : "Đã lưu"}
        </button>
      </div>
    </div>
  );
}
