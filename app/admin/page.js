import { redirect } from "next/navigation";
import AdminApp from "@/components/admin/AdminApp";
import SiteNav from "@/components/SiteNav";
import { snapshot } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị · AI20K Portal" };

export default async function AdminPage() {
  const db = await readDb();
  const session = await getSession(db);
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/me");

  return (
    <>
      <SiteNav user={{ role: "admin", name: session.name }} links={[["/", "Cổng học viên"]]} />
      <main className="wrap">
        <AdminApp initial={snapshot(db)} />
      </main>
    </>
  );
}
