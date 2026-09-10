import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata = {
  title: "AI20K Portal",
  description:
    "Cổng học viên — lối tắt tới VLearn, Phoenix, Discord và liên hệ chương trình Đào tạo Nhân tài AI Thực Chiến.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
