import Link from "next/link";
import Icon from "@/components/Icon";
import MailTile from "@/components/MailTile";
import SiteNav from "@/components/SiteNav";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const WIFI = [
  {
    name: "VinUni Student",
    badge: "Cần đăng nhập",
    body: <>Đăng nhập bằng tài khoản VinUni được cấp trong email khai giảng.</>,
  },
  { name: "Wifi Guest", badge: "Miễn phí", body: <>Kết nối trực tiếp, không cần mật khẩu.</> },
  {
    name: "Wifi AI.20K",
    badge: null,
    body: (
      <>
        Tên mạng: <b>VinUni AI.20K</b> · Mật khẩu: <span className="code">AI20K_500</span>
        <br />
        Hoặc quét mã QR dán tại lớp học để kết nối nhanh.
      </>
    ),
  },
];

function formatPostDate(iso) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
}

export default async function Home() {
  const db = await readDb();
  const session = await getSession(db);
  const links = db.links.filter((l) => l.visible && l.url);
  const posts = [...db.posts]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <>
      <SiteNav
        user={session && { role: session.role, name: session.name }}
        links={[
          ["#cong-cu", "Công cụ"],
          ["#thong-bao", "Thông báo"],
          ["#wifi", "Wifi"],
        ]}
      />

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">Chương trình Đào tạo Nhân tài AI Thực Chiến · Vingroup &amp; VinUni</p>
          <h1 className="display">
            Mọi thứ của lớp,
            <br />
            qua <span className="accent">một cổng.</span>
          </h1>
          <p className="lede">
            Truy cập nhanh VLearn, Phoenix, tài liệu và kênh hỗ trợ của chương trình. Đăng nhập để xem lịch học, điểm danh và điểm tích lũy của bạn.
          </p>
          <div className="hero-actions">
            {session ? (
              <Link className="btn btn-red" href={session.role === "admin" ? "/admin" : "/me"}>
                {session.role === "admin" ? "Vào trang quản trị" : "Xem tiến độ của tôi"}
              </Link>
            ) : (
              <Link className="btn btn-red" href="/login">
                Đăng nhập học viên
              </Link>
            )}
            <a className="link-arrow" href="#cong-cu">
              Xem công cụ <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="section" id="cong-cu">
          <div className="section-head">
            <div>
              <h2>Công cụ học tập</h2>
              <p>Bấm vào một ô để mở liên kết tương ứng.</p>
            </div>
          </div>
          <div className="tiles">
            {links.map((l) => (
              <a
                key={l.id}
                className={`tile tone-${l.tone}`}
                href={l.url}
                {...(l.download ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <span className="tile-top">
                  <span className="chip">
                    <Icon name={l.icon} />
                  </span>
                  <span className="tile-arrow" aria-hidden="true">
                    {l.download ? "↓" : "↗"}
                  </span>
                </span>
                <h3>{l.title}</h3>
                {l.desc && <span className="tile-desc">{l.desc}</span>}
                {l.meta && <span className="tile-meta">{l.meta}</span>}
              </a>
            ))}
            <MailTile maxAbsences={db.settings.maxAbsences} />
          </div>
        </section>

        {posts.length > 0 && (
          <section className="section" id="thong-bao">
            <div className="section-head">
              <div>
                <h2>Thông báo</h2>
                <p>Cập nhật mới nhất từ ban tổ chức.</p>
              </div>
            </div>
            <div className="posts">
              {posts.map((p) => (
                <article key={p.id} className="card-flat post">
                  <h3>{p.title}</h3>
                  <div className="post-meta">
                    {p.pinned && <span className="badge b-brand">Ghim</span>}
                    <span>{formatPostDate(p.createdAt)}</span>
                  </div>
                  {p.body && <p className="post-body">{p.body}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="section" id="wifi">
          <div className="section-head">
            <div>
              <h2>Wifi tại VinUni</h2>
              <p>Chọn mạng phù hợp khi ở trường.</p>
            </div>
          </div>
          <div className="wifi-grid">
            {WIFI.map((w) => (
              <div key={w.name} className="card-flat wifi">
                <h3>
                  {w.name} {w.badge && <span className="badge b-brand">{w.badge}</span>}
                </h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">BTC Chương trình Đào tạo Nhân tài AI Thực Chiến — Tập đoàn Vingroup &amp; Trường Đại học VinUni.</footer>
      </main>
    </>
  );
}
