"use client";

import { useState } from "react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập chưa thành công.");
      window.location.assign(data.redirect || "/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="username">MSSV hoặc email</label>
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
  );
}
