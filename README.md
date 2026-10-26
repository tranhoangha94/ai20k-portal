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

## Biến môi trường (khi deploy lên Vercel)

| Biến | Dùng để |
| --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` (hoặc `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) | **Bắt buộc để lưu dữ liệu bền vững.** Thêm Upstash Redis từ Vercel → Storage; Vercel tự điền các biến này. **Thiếu thì không đăng nhập được trên Vercel**, vì mỗi function có thư mục `/tmp` riêng và không chia sẻ dữ liệu cho nhau. |
| `ADMIN_USER`, `ADMIN_PASSWORD` | Tài khoản admin ban đầu (chỉ đọc khi tạo dữ liệu lần đầu). |
| `SESSION_SECRET` | Khoá ký cookie đăng nhập. Không đặt thì tự sinh và lưu cùng dữ liệu. |

## Nhập học viên từ Excel

File `.xlsx` cần các cột **MSSV** và **Họ và tên**, tuỳ chọn **Email**, **Level**. Tải file mẫu ở tab Học viên. MSSV đã có thì cập nhật, chưa có thì tạo mới (mật khẩu mặc định = MSSV).
