"use client";

import { attendanceStats, isPast, vnNow } from "@/lib/stats";

export default function OverviewTab({ data, goTo }) {
  const now = vnNow();
  const max = data.settings.maxAbsences;
  const upcoming = data.sessions.filter((s) => !isPast(s, now)).length;
  const totalPoints = data.points.reduce((sum, p) => sum + p.delta, 0);
  const rows = data.students.map((s) => ({ s, st: attendanceStats(data, s, now) }));
  const rated = rows.filter((r) => r.st.rate !== null);
  const avgRate = rated.length ? Math.round(rated.reduce((sum, r) => sum + r.st.rate, 0) / rated.length) : null;
  const atRisk = rows.filter((r) => r.st.missed >= max && max > 0).sort((a, b) => b.st.missed - a.st.missed);
  const neverLoggedIn = data.students.filter((s) => !s.lastLoginAt).length;

  return (
    <div className="stack">
      {!data.storage.persistent && (
        <div className="alert bad">
          <b>Dữ liệu chưa được lưu bền vững.</b> Dữ liệu đang nằm trên ổ tạm của máy chủ nên sẽ mất mỗi khi deploy lại. Trên Railway: thêm một <b>Volume</b> vào service (Railway tự đặt biến <code>RAILWAY_VOLUME_MOUNT_PATH</code>). Cách khác: dùng Supabase (<code>SUPABASE_URL</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code>) hoặc Upstash Redis.
        </div>
      )}
      {data.admin.isDefault && (
        <div className="alert">
          <b>Bạn đang dùng mật khẩu admin mặc định.</b> Hãy đổi ngay ở tab{" "}
          <button className="link-arrow" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "inherit", textDecoration: "underline" }} onClick={() => goTo("accounts")}>
            Tài khoản
          </button>
          .
        </div>
      )}

      <div className="stats" style={{ marginTop: 0 }}>
        <div className="stat tone-navy">
          <span className="k">Học viên</span>
          <span className="v">{data.students.length}</span>
          <span className="s">{neverLoggedIn} chưa đăng nhập lần nào</span>
        </div>
        <div className="stat tone-sky">
          <span className="k">Buổi học</span>
          <span className="v">{data.sessions.length}</span>
          <span className="s">{upcoming} buổi sắp diễn ra</span>
        </div>
        <div className="stat tone-mint">
          <span className="k">Chuyên cần TB</span>
          <span className="v">{avgRate === null ? "—" : `${avgRate}%`}</span>
          <span className="s">Tính trên các buổi đã điểm danh</span>
        </div>
        <div className="stat tone-butter">
          <span className="k">Điểm đã trao</span>
          <span className="v">{totalPoints}</span>
          <span className="s">{data.points.length} lượt ghi điểm</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Học viên cần chú ý</h3>
          <span className="hint">Đã nghỉ từ {max} buổi trở lên (giới hạn {max})</span>
        </div>
        {atRisk.length === 0 ? (
          <p className="empty">Chưa có học viên nào chạm giới hạn nghỉ.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>MSSV</th>
                  <th>Họ tên</th>
                  <th className="num">Vắng</th>
                  <th className="num">Có phép</th>
                  <th className="num">Tổng nghỉ</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map(({ s, st }) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td className="num">{st.absent}</td>
                    <td className="num">{st.excused}</td>
                    <td className="num">
                      <span className={`badge ${st.missed > max ? "b-bad" : "b-warn"}`}>
                        {st.missed}/{max}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-flat">
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Bắt đầu nhanh</h3>
        <p className="hint">
          1) Vào <b>Học viên</b> → Nhập Excel · 2) Vào <b>Lịch &amp; điểm danh</b> → thêm buổi học và điểm danh · 3) Vào <b>Điểm</b> để cộng điểm · 4) <b>Liên kết</b> để sửa đường link VLearn/Phoenix/Discord · 5) <b>Bài đăng</b> để đăng thông báo.
        </p>
      </div>
    </div>
  );
}
