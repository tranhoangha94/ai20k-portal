import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "AI20K Portal",
  description:
    "Cổng học viên — lối tắt tới VLearn, Phoenix, Discord và liên hệ chương trình Đào tạo Nhân tài AI Thực Chiến.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
