"use client";

import { useState } from "react";
import Icon from "./Icon";

const sickLeave = "mailto:dang.nh5@vinuni.edu.vn?subject=" + encodeURIComponent("Xin nghỉ phép - [Họ tên] - [MSSV]");
const itSupport =
  "mailto:support-it@vinuni.edu.vn?subject=" + encodeURIComponent("Hỗ trợ đăng nhập email / reset MFA - [Họ tên] - [MSSV]");

export default function MailTile({ maxAbsences }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="tile tone-peach" aria-expanded={open} aria-controls="mailPanel" onClick={() => setOpen((v) => !v)}>
        <span className="tile-top">
          <span className="chip">
            <Icon name="mail" />
          </span>
          <span className="tile-arrow">{open ? "−" : "+"}</span>
        </span>
        <h3>Liên hệ chương trình</h3>
        <span className="tile-desc">Xin nghỉ phép · Hỗ trợ email &amp; mật khẩu</span>
        <span className="tile-meta">Nhấn để chọn nơi gửi email</span>
      </button>

      <div className={`mail-panel${open ? " open" : ""}`} id="mailPanel" inert={!open}>
        <div className="mail-options">
          <a className="mail-option" href={sickLeave}>
            <b>Xin nghỉ phép</b>
            <span>Gửi anh Đăng · dang.nh5@vinuni.edu.vn</span>
            <span className="note">Lưu ý: không xin nghỉ quá {maxAbsences} buổi</span>
          </a>
          <a className="mail-option" href={itSupport}>
            <b>Hỗ trợ email / mật khẩu</b>
            <span>IT Support · support-it@vinuni.edu.vn</span>
          </a>
        </div>
      </div>
    </>
  );
}
