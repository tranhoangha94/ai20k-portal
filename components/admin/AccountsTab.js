"use client";

import { useMemo, useState } from "react";
import { fmtDateTime } from "./ui";

export default function AccountsTab({ data, call, notify }) {
  const [query, setQuery] = useState("");
  const [max, setMax] = useState(String(data.settings.maxAbsences));
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.students
      .filter((s) => !q || `${s.id} ${s.name} ${s.email}`.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [data.students, query]);

  async function changePassword(e) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return notify("Mật khẩu nhập lại chưa khớp.", "bad");
    const ok = await call("admin.password", { current: pw.current, next: pw.next }, "Đã đổi mật khẩu admin");
    if (ok) setPw({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="stack">
      <div className="two-col" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
        <form className="card form" onSubmit={changePassword}>
          <h3>Tài khoản quản trị</h3>
          <p className="hint">
            Tên đăng nhập: <b>{data.admin.user}</b>
            {data.admin.isDefault && <span className="badge b-bad" style={{ marginLeft: 8 }}>Đang dùng mật khẩu mặc định</span>}
          </p>
          <div className="field">
            <label htmlFor="ad-current">Mật khẩu hiện tại</label>
            <input id="ad-current" className="input" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="ad-next">Mật khẩu mới (tối thiểu 8 ký tự)</label>
            <input id="ad-next" className="input" type="password" autoComplete="new-password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="ad-confirm">Nhập lại mật khẩu mới</label>
            <input id="ad-confirm" className="input" type="password" autoComplete="new-password" minLength={8} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          </div>
          <button className="btn btn-brand" type="submit">
            Đổi mật khẩu
          </button>
        </form>

        <form
          className="card form"
          onSubmit={(e) => {
            e.preventDefault();
            call("settings.save", { maxAbsences: max }, "Đã lưu cài đặt");
          }}
        >
          <h3>Quy định chuyên cần</h3>
          <div className="field">
            <label htmlFor="max-abs">Số buổi nghỉ tối đa</label>
            <input id="max-abs" className="input" type="number" min="0" max="50" value={max} onChange={(e) => setMax(e.target.value)} required />
            <span className="hint">Tính cả buổi “Vắng” và “Có phép”. Hiển thị cho học viên và ở mục xin nghỉ phép trên trang chủ.</span>
          </div>
          <button className="btn btn-brand" type="submit" disabled={String(data.settings.maxAbsences) === max}>
            Lưu
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Tài khoản học viên</h3>
          <input className="input" style={{ maxWidth: 260 }} placeholder="Tìm MSSV, tên, email…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm tài khoản" />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Mật khẩu</th>
                <th>Đăng nhập gần nhất</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    {s.name}
                    {s.email && <span className="sub">{s.email}</span>}
                  </td>
                  <td>{s.customPassword ? <span className="badge b-ok">Đã đổi</span> : <span className="badge">Mặc định (MSSV)</span>}</td>
                  <td>{fmtDateTime(s.lastLoginAt)}</td>
                  <td>{s.disabled ? <span className="badge b-bad">Đã khoá</span> : <span className="badge b-ok">Hoạt động</span>}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => confirm(`Đặt lại mật khẩu của ${s.name} về MSSV (${s.id})?`) && call("student.resetPassword", { id: s.id }, "Đã đặt lại mật khẩu về MSSV")}
                      >
                        Đặt lại MK
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => call("student.setDisabled", { id: s.id, disabled: !s.disabled }, s.disabled ? "Đã mở khoá" : "Đã khoá tài khoản")}>
                        {s.disabled ? "Mở khoá" : "Khoá"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    Chưa có tài khoản học viên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
