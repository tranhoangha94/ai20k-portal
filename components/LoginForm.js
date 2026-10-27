"use client";

import { useState } from "react";

const DEMOS = [
  { label: "Đăng nhập Admin demo", hint: "admin", username: "admin", password: "abc@12345" },
  { label: "Đăng nhập Học viên demo", hint: "DEMO001", username: "DEMO001", password: "DEMO001" },
];

export default function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(username, password) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập chưa thành công.");
      window.location.assign(data.redirect || "/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    login(form.get("username"), form.get("password"));
  }

  return (
    <>
      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor="username">MSSV, email hoặc tài khoản admin</label>
          <input id="username" name="username" className="input" autoComplete="username" autoCapitalize="none" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-red" type="submit" disabled={busy}>
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <div className="demo-login">
        <p className="hint">Bản dùng thử — vào nhanh bằng tài khoản demo:</p>
        <div className="demo-buttons">
          {DEMOS.map((d) => (
            <button key={d.username} type="button" className="btn btn-ghost" disabled={busy} onClick={() => login(d.username, d.password)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
