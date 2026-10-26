import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SiteNav from "@/components/SiteNav";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đăng nhập · AI20K Portal" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/me");

  return (
    <>
      <SiteNav user={null} />
      <main className="wrap-narrow">
        <div className="card login-card">
          <h1>Đăng nhập</h1>
          <p className="hint" style={{ marginBottom: 20 }}>
            Học viên dùng <b>MSSV</b> hoặc <b>email VinUni</b>. Mật khẩu mặc định là <b>mã số sinh viên</b> — hãy đổi sau khi đăng nhập.
          </p>
          <LoginForm />
        </div>
      </main>
    </>
  );
}
