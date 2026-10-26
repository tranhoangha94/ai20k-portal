import { handle, HttpError, requireAdmin } from "@/lib/api";
import { buildWorkbook } from "@/lib/excel";

const NAMES = {
  template: "mau-nhap-hoc-vien.xlsx",
  students: "hoc-vien.xlsx",
  attendance: "diem-danh.xlsx",
  points: "diem-tich-luy.xlsx",
};

export const GET = handle(async (req) => {
  const db = await requireAdmin();
  const type = new URL(req.url).searchParams.get("type") || "";
  if (!NAMES[type]) throw new HttpError("Loại file không hợp lệ.");
  const buffer = await buildWorkbook(type, db);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${NAMES[type]}"`,
      "Cache-Control": "no-store",
    },
  });
});
