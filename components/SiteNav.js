import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

// user: { role: "admin" | "student", name } | null
export default function SiteNav({ user, links = [] }) {
  return (
    <div className="nav-shell">
      <div className="wrap">
        <nav className="nav" aria-label="Điều hướng chính">
          <Link href="/" className="brand">
            <span className="brand-mark">AI</span>
            <span className="brand-text">
              <b>AI20K Portal</b>
              <small>Cổng học viên</small>
            </span>
          </Link>
          <div className="nav-links">
            {links.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            {user ? (
              <>
                <Link className="btn btn-brand btn-sm" href={user.role === "admin" ? "/admin" : "/me"}>
                  {user.role === "admin" ? "Quản trị" : "Trang của tôi"}
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Đăng xuất
                  </button>
                </form>
              </>
            ) : (
              <Link className="btn btn-red btn-sm" href="/login">
                Đăng nhập
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
