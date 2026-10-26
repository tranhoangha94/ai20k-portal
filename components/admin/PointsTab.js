"use client";

import { useMemo, useState } from "react";
import { leaderboard } from "@/lib/stats";
import { fmtDateTime } from "./ui";

export default function PointsTab({ data, call }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(() => new Set());
  const [delta, setDelta] = useState("5");
  const [reason, setReason] = useState("");
  const board = useMemo(() => leaderboard(data), [data]);
  const byId = useMemo(() => new Map(data.students.map((s) => [s.id, s])), [data.students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.students
      .filter((s) => !q || `${s.id} ${s.name}`.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [data.students, query]);

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function submit(e) {
    e.preventDefault();
    const result = await call("points.add", { studentIds: [...picked], delta, reason }, `Đã ghi điểm cho ${picked.size} học viên`);
    if (result) {
      setPicked(new Set());
      setReason("");
    }
  }

  const recent = [...data.points].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);

  return (
    <div className="split">
      <form className="card form" onSubmit={submit}>
        <h3>Cộng / trừ điểm</h3>
        <div className="row">
          <div className="field">
            <label htmlFor="pt-delta">Số điểm</label>
            <input id="pt-delta" className="input" type="number" step="1" value={delta} onChange={(e) => setDelta(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="pt-reason">Lý do</label>
            <input id="pt-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Hoàn thành lab 3" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="pt-search">Học viên ({picked.size} đã chọn)</label>
          <input id="pt-search" className="input" placeholder="Tìm học viên…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPicked((p) => new Set([...p, ...filtered.map((s) => s.id)]))}>
            Chọn tất cả đang hiện
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPicked(new Set())}>
            Bỏ chọn
          </button>
        </div>
        <div className="picker">
          {filtered.length === 0 && <p className="empty">Chưa có học viên.</p>}
          {filtered.map((s) => (
            <label key={s.id}>
              <input type="checkbox" checked={picked.has(s.id)} onChange={() => toggle(s.id)} />
              <span>
                {s.name} <span className="hint">· {s.id}</span>
              </span>
            </label>
          ))}
        </div>
        <button className="btn btn-red" type="submit" disabled={picked.size === 0}>
          Ghi điểm
        </button>
      </form>

      <div className="stack">
        <div className="card">
          <div className="card-head">
            <h3>Bảng xếp hạng</h3>
            <a className="btn btn-ghost btn-sm" href="/api/admin/export?type=points">
              Xuất Excel
            </a>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="num">Hạng</th>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th className="num">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {board.slice(0, 50).map((r, i) => (
                  <tr key={r.id}>
                    <td className="num">{i + 1}</td>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td className="num">
                      <b>{r.total}</b>
                    </td>
                  </tr>
                ))}
                {board.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      Chưa có học viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Lịch sử ghi điểm gần đây</h3>
          </div>
          {recent.length === 0 ? (
            <p className="empty">Chưa có lượt ghi điểm nào.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Học viên</th>
                    <th>Lý do</th>
                    <th className="num">Điểm</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id}>
                      <td>{fmtDateTime(p.date)}</td>
                      <td>{byId.get(p.studentId)?.name || p.studentId}</td>
                      <td>{p.reason}</td>
                      <td className="num">
                        <span className={`pts ${p.delta > 0 ? "plus" : "minus"}`}>
                          {p.delta > 0 ? "+" : ""}
                          {p.delta}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-danger btn-sm" onClick={() => confirm("Xoá lượt ghi điểm này?") && call("points.delete", { id: p.id }, "Đã xoá")}>
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
