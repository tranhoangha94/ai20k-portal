"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ai20k-portal-theme";

function ThemeToggle() {
  const [choice, setChoice] = useState("system");

  useEffect(() => {
    let saved = "system";
    try {
      saved = localStorage.getItem(STORAGE_KEY) || "system";
    } catch {}
    setChoice(saved);
  }, []);

  useEffect(() => {
    if (choice === "light" || choice === "dark") {
      document.documentElement.setAttribute("data-theme", choice);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [choice]);

  function pick(next) {
    setChoice(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Chọn giao diện sáng / tối">
      <button
        type="button"
        className={choice === "light" ? "active" : ""}
        aria-label="Giao diện sáng"
        title="Sáng"
        onClick={() => pick("light")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 3v2.2M12 18.8V21M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M3 12h2.2M18.8 12H21M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
        </svg>
      </button>
      <button
        type="button"
        className={choice === "dark" ? "active" : ""}
        aria-label="Giao diện tối"
        title="Tối"
        onClick={() => pick("dark")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.2A8 8 0 1 1 9.8 4a6.3 6.3 0 0 0 10.2 10.2Z" />
        </svg>
      </button>
      <button
        type="button"
        className={choice === "system" ? "active" : ""}
        aria-label="Theo hệ thống"
        title="Theo hệ thống"
        onClick={() => pick("system")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4.5" width="18" height="12" rx="1.8" />
          <path d="M9 20h6M12 16.5V20" />
        </svg>
      </button>
    </div>
  );
}

export default function Home() {
  const [mailOpen, setMailOpen] = useState(false);

  const sickLeaveHref =
    "mailto:dang.nh5@vinuni.edu.vn?subject=" +
    encodeURIComponent("Xin nghỉ phép - [Họ tên] - [MSSV]");
  const itSupportHref =
    "mailto:support-it@vinuni.edu.vn?subject=" +
    encodeURIComponent("Hỗ trợ đăng nhập email / reset MFA - [Họ tên] - [MSSV]");

  return (
    <div className="page">
      <div className="top-row">
        <div>
          <p className="eyebrow">Chương trình Đào tạo Nhân tài AI Thực Chiến · Vingroup &amp; VinUni</p>
          <h1>Cổng học viên</h1>
        </div>
        <ThemeToggle />
      </div>
      <p className="lede">
        Truy cập nhanh các công cụ học tập và kênh liên hệ của chương trình. Bấm vào một mục để mở liên kết tương ứng.
      </p>

      <div className="grid">
        <a className="tile" href="https://vlearn.dev" target="_blank" rel="noopener noreferrer">
          <span className="tile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5c2.2-1 5-1 8 .3 3-1.3 5.8-1.3 8-.3v13c-2.2-1-5-1-8 .3-3-1.3-5.8-1.3-8-.3v-13Z" />
              <path d="M12 5.8v13" />
            </svg>
          </span>
          <span className="tile-title">VLearn <span className="arrow">↗</span></span>
          <span className="tile-desc">Xem slide bài giảng &amp; làm bài lab</span>
          <span className="tile-meta">Tài khoản: <b>email VinUni</b> · Mật khẩu: <b>mã số sinh viên</b></span>
        </a>

        <a className="tile" href="https://phoenix.note.transformerlabs.ai/onboarding" target="_blank" rel="noopener noreferrer">
          <span className="tile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c1 2.5.6 4-1 5.5C9.3 10.2 8 11.8 8 14a4 4 0 0 0 8 0c0-1.2-.4-2-1-2.7.4 1.6-.1 2.7-1 3.2" />
              <path d="M12 21v-3.2" />
            </svg>
          </span>
          <span className="tile-title">Phoenix <span className="arrow">↗</span></span>
          <span className="tile-desc">Ghi chú &amp; bài tập thực chiến</span>
          <span className="tile-meta">Đăng nhập bằng <b>GitHub</b> đã đăng ký với chương trình</span>
        </a>

        <a className="tile" href="/ai20k-notebook-onboarding.pdf" download>
          <span className="tile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11.5" />
              <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
              <path d="M5 19.5h14" />
            </svg>
          </span>
          <span className="tile-title">NoteBook học viên <span className="arrow">⬇</span></span>
          <span className="tile-desc">Hướng dẫn onboarding — 7 bước từ lúc nhận lời mời đến khi chạy được AI log</span>
          <span className="tile-meta">PDF · Cohort 4</span>
        </a>

        {/* Discord tạm ẩn: link mời sai, chờ link đúng */}

        <button
          type="button"
          className="tile"
          aria-expanded={mailOpen}
          aria-controls="mailPanel"
          onClick={() => setMailOpen((v) => !v)}
        >
          <span className="tile-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
              <path d="m4.5 7 7.5 5.5L19.5 7" />
            </svg>
          </span>
          <span className="tile-title">
            Liên hệ chương trình <span className="arrow">{mailOpen ? "⌃" : "⌄"}</span>
          </span>
          <span className="tile-desc">Xin nghỉ phép · Hỗ trợ email &amp; mật khẩu</span>
          <span className="tile-meta">Nhấn để chọn nơi gửi email</span>
        </button>

        <div className={`mail-panel${mailOpen ? " open" : ""}`} id="mailPanel">
          <div className="mail-panel-inner">
            <a className="mail-option" href={sickLeaveHref}>
              <span className="mail-option-label">Xin nghỉ phép</span>
              <span className="mail-option-sub">Gửi anh Đăng · dang.nh5@vinuni.edu.vn</span>
              <span className="mail-option-note">Lưu ý: không xin nghỉ quá 4 buổi</span>
            </a>
            <a className="mail-option" href={itSupportHref}>
              <span className="mail-option-label">Hỗ trợ email / mật khẩu</span>
              <span className="mail-option-sub">IT Support · support-it@vinuni.edu.vn</span>
            </a>
          </div>
        </div>
      </div>

      <section className="wifi-section">
        <h2 className="section-title">Wifi tại VinUni</h2>
        <div className="wifi-list">
          <div className="wifi-item">
            <span className="wifi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 9.5a13 13 0 0 1 17 0" />
                <path d="M6.5 13a9 9 0 0 1 11 0" />
                <path d="M9.7 16.4a4.6 4.6 0 0 1 4.6 0" />
                <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="wifi-body">
              <div className="wifi-name">VinUni Student <span className="wifi-badge">Cần đăng nhập</span></div>
              <p className="wifi-desc">Đăng nhập bằng tài khoản VinUni được cấp trong email khai giảng.</p>
            </div>
          </div>

          <div className="wifi-item">
            <span className="wifi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 9.5a13 13 0 0 1 17 0" />
                <path d="M6.5 13a9 9 0 0 1 11 0" />
                <path d="M9.7 16.4a4.6 4.6 0 0 1 4.6 0" />
                <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="wifi-body">
              <div className="wifi-name">Wifi Guest <span className="wifi-badge">Miễn phí</span></div>
              <p className="wifi-desc">Kết nối trực tiếp, không cần mật khẩu.</p>
            </div>
          </div>

          <div className="wifi-item">
            <span className="wifi-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 9.5a13 13 0 0 1 17 0" />
                <path d="M6.5 13a9 9 0 0 1 11 0" />
                <path d="M9.7 16.4a4.6 4.6 0 0 1 4.6 0" />
                <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="wifi-body">
              <div className="wifi-name">Wifi AI.20K</div>
              <p className="wifi-desc">
                Tên mạng: <b>VinUni AI.20K</b> · Mật khẩu: <code className="wifi-pass">AI20K_500</code>
              </p>
              <p className="wifi-note">Hoặc quét mã QR dán tại lớp học để kết nối nhanh.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        BTC Chương trình Đào tạo Nhân tài AI Thực Chiến — Tập đoàn Vingroup &amp; Trường Đại học VinUni.
      </footer>
    </div>
  );
}
