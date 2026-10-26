# AI20K Portal

Cổng học viên cho Chương trình Đào tạo Nhân tài AI Thực Chiến — Tập đoàn Vingroup & Trường Đại học VinUni. Xây bằng Next.js (App Router).

- **Trang chủ**: lối tắt tới VLearn, Phoenix, NoteBook, liên hệ chương trình, thông báo, hướng dẫn Wifi.
- **Học viên** (`/me`): điểm tích lũy và xếp hạng, chuyên cần, số buổi nghỉ, tiến độ, lịch học, lịch sử điểm.
- **Admin** (`/admin`): quản lý học viên (nhập/xuất Excel), lịch học và điểm danh, điểm, liên kết các ô công cụ, bài đăng, tài khoản đăng nhập.

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Dữ liệu lưu ở `data/ai20k-db.json` (đã được git bỏ qua).

## Đăng nhập

- **Admin**: `admin` / `abc@12345` (mật khẩu mặc định tạm thời). **Đổi ngay** ở tab Tài khoản, hoặc đặt biến môi trường `ADMIN_USER` / `ADMIN_PASSWORD` trước lần chạy đầu tiên.
- **Học viên**: MSSV hoặc email VinUni; mật khẩu mặc định là MSSV, học viên tự đổi trong `/me`.

## Deploy

### Railway (khuyên dùng)

Railway chạy một server liên tục nên dữ liệu dùng chung giữa mọi trang, không cần Redis.

1. New Project → **Deploy from GitHub repo** → chọn repo này. Railway tự build (`npm run build`) và chạy (`npm start`).
2. Service → **Settings → Networking → Generate Domain**.
3. Service → **Volumes → New Volume** (đường dẫn gắn bất kỳ, VD `/data`). Không có Volume thì dữ liệu mất mỗi lần deploy lại; app sẽ hiện cảnh báo đỏ ở tab Tổng quan.

### Supabase (dùng được với Railway, Vercel hoặc máy local)

Dữ liệu lưu thành một bản ghi JSON trong bảng `kv` (không tách bảng riêng cho từng loại dữ liệu).

1. Tạo project Supabase, vào **SQL Editor** chạy:

   ```sql
   create table if not exists kv (key text primary key, value text not null);
   alter table kv enable row level security;
   ```

   Bật RLS mà không tạo policy nghĩa là khoá `anon` công khai không đọc được dữ liệu học viên.
2. Lấy **Project URL** và khoá **service_role** (Settings → API Keys). Đặt `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` cho service. Khoá service_role chỉ để ở server, không bao giờ đặt trong biến `NEXT_PUBLIC_*`.

Gói Free của Supabase tự tạm dừng project sau 1 tuần không có truy cập.

### Vercel

Vercel chạy serverless, mỗi function có `/tmp` riêng nên **bắt buộc** gắn Upstash Redis (Vercel → Storage), nếu không sẽ không đăng nhập được.

## Biến môi trường

| Biến | Dùng để |
| --- | --- |
| `RAILWAY_VOLUME_MOUNT_PATH` hoặc `DATA_DIR` | Thư mục lưu `ai20k-db.json`. Railway tự đặt biến đầu khi có Volume. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Dùng Supabase làm nơi lưu dữ liệu (ưu tiên cao nhất nếu có). |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` (hoặc `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) | Dùng Redis thay cho file (bắt buộc trên Vercel). |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Tài khoản admin ban đầu (chỉ đọc khi tạo dữ liệu lần đầu). |
| `SESSION_SECRET` | Khoá ký cookie đăng nhập. Không đặt thì tự sinh và lưu cùng dữ liệu. |

## Nhập học viên từ Excel

File `.xlsx` cần các cột **MSSV** và **Họ và tên**, tuỳ chọn **Email**, **Level**. Tải file mẫu ở tab Học viên. MSSV đã có thì cập nhật, chưa có thì tạo mới (mật khẩu mặc định = MSSV).
