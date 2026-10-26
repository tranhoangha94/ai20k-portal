import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import SiteNav from "@/components/SiteNav";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { attendanceStats, formatDate, leaderboard, pointsOf, rankOf, STATUS_LABEL } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trang của tôi · AI20K Portal" };

const STATUS_CLASS = { p: "b-ok", a: "b-bad", e: "b-warn" };

function SessionRow({ s, next }) {
  let badge;
  if (s.status) badge = <span className={`badge ${STATUS_CLASS[s.status]}`}>{STATUS_LABEL[s.status]}</span>;
  else if (s.past) badge = <span className="badge">Chưa điểm danh</span>;
  else badge = <span className="badge b-brand">{next ? "Buổi tiếp theo" : "Sắp diễn ra"}</span>;

  return (
    <div className={`session${next ? " next" : ""}`}>
      <div className="date-box">
        <b>{s.date.slice(8, 10)}</b>
        <span>Th{s.date.slice(5, 7)}</span>
      </div>
      <div>
        <h4>{s.title}</h4>
        <small>
          {formatDate(s.date)}
          {s.start && ` · ${s.start}${s.end ? `–${s.end}` : ""}`}
          {s.location && ` · ${s.location}`}
        </small>
        {s.note && <small>{s.note}</small>}
      </div>
      {badge}
    </div>
  );
}

export default async function MePage() {
  const db = await readDb();
  const session = await getSession(db);
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const student = session.student;
  const stats = attendanceStats(db, student);
  const board = leaderboard(db);
  const total = pointsOf(db.points, student.id);
  const rank = rankOf(board, student.id);
  const history = db.points
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 15);

  const max = db.settings.maxAbsences;
  const missTone = stats.missed > max ? "red" : stats.missed === max ? "peach" : "butter";
  const missNote =
    stats.missed > max ? "Đã vượt giới hạn, hãy liên hệ BTC" : stats.missed === max ? "Đã chạm giới hạn — không nghỉ thêm" : `Còn ${max - stats.missed} buổi được nghỉ`;

  const upcoming = stats.list.filter((s) => !s.past);
  const done = stats.list.filter((s) => s.past).reverse();
  const posts = [...db.posts].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <>
      <SiteNav user={{ role: "student", name: student.name }} links={[["/", "Cổng học viên"]]} />
      <main className="wrap">
        <section className="greet">
          <p className="eyebrow">Trang của tôi</p>
          <h1>Xin chào, {student.name}</h1>
          <div className="chips">
            <span className="badge b-brand">MSSV {student.id}</span>
            {student.level && <span className="badge">Level {student.level}</span>}
            {student.email && <span className="badge">{student.email}</span>}
          </div>
        </section>

        {!student.passwordHash && (
          <div className="alert" style={{ marginTop: 20 }}>
            <b>Bạn đang dùng mật khẩu mặc định (MSSV).</b> Hãy đổi mật khẩu ở mục “Đổi mật khẩu” bên dưới.
          </div>
        )}

        <section className="stats" aria-label="Tổng quan">
          <div className="stat tone-navy">
            <span className="k">Điểm tích lũy</span>
            <span className="v">{total}</span>
            <span className="s">{rank ? `Hạng ${rank}/${board.length} trong lớp` : "Chưa có xếp hạng"}</span>
          </div>
          <div className="stat tone-mint">
            <span className="k">Chuyên cần</span>
            <span className="v">{stats.rate === null ? "—" : `${stats.rate}%`}</span>
            <span className="s">{stats.recorded ? `${stats.present}/${stats.recorded} buổi có mặt` : "Chưa có buổi nào được điểm danh"}</span>
          </div>
          <div className={`stat tone-${missTone}`}>
            <span className="k">Số buổi nghỉ</span>
            <span className="v">
              {stats.missed}/{max}
            </span>
            <span className="s">{missNote}</span>
          </div>
          <div className="stat tone-sky">
            <span className="k">Tiến độ khóa học</span>
            <span className="v">
              {stats.held}/{stats.total}
            </span>
            <div className="bar" style={{ marginTop: 6 }} role="progressbar" aria-valuenow={stats.progress} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${stats.progress}%` }} />
            </div>
            <span className="s">{stats.total ? `${stats.progress}% số buổi đã diễn ra` : "Chưa có lịch học"}</span>
          </div>
        </section>

        <section className="section two-col">
          <div className="stack">
            <div className="card">
              <div className="card-head">
                <h3>Lịch học</h3>
                <span className="hint">
                  {stats.absent} vắng · {stats.excused} có phép · {stats.present} có mặt
                </span>
              </div>
              {stats.list.length === 0 ? (
                <p className="empty">Chưa có lịch học nào được đăng.</p>
              ) : (
                <div className="sessions">
                  {upcoming.map((s, i) => (
                    <SessionRow key={s.id} s={s} next={i === 0} />
                  ))}
                  {upcoming.length > 0 && done.length > 0 && <p className="label" style={{ marginTop: 10 }}>Đã diễn ra</p>}
                  {done.map((s) => (
                    <SessionRow key={s.id} s={s} />
                  ))}
                </div>
              )}
            </div>

            {posts.length > 0 && (
              <div className="card">
                <div className="card-head">
                  <h3>Thông báo</h3>
                </div>
                <div className="posts">
                  {posts.map((p) => (
                    <article key={p.id} className="card-flat post">
                      <h3>{p.title}</h3>
                      <div className="post-meta">
                        {p.pinned && <span className="badge b-brand">Ghim</span>}
                        <span>{new Date(p.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                      </div>
                      {p.body && <p className="post-body">{p.body}</p>}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="stack">
            <div className="card">
              <div className="card-head">
                <h3>Lịch sử điểm</h3>
                <span className="badge b-brand">{total} điểm</span>
              </div>
              {history.length === 0 ? (
                <p className="empty">Chưa có điểm nào được ghi nhận.</p>
              ) : (
                <div className="ledger">
                  {history.map((p) => (
                    <div key={p.id} className="ledger-row">
                      <span>
                        {p.reason}
                        <small className="hint" style={{ display: "block" }}>
                          {new Date(p.date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                        </small>
                      </span>
                      <span className={`pts ${p.delta > 0 ? "plus" : "minus"}`}>
                        {p.delta > 0 ? "+" : ""}
                        {p.delta}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-head">
                <h3>Đổi mật khẩu</h3>
              </div>
              <ChangePasswordForm />
            </div>
          </div>
        </section>

        <footer className="footer">BTC Chương trình Đào tạo Nhân tài AI Thực Chiến — Tập đoàn Vingroup &amp; Trường Đại học VinUni.</footer>
      </main>
    </>
  );
}
