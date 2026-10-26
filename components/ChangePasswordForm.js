"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [state, setState] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    if (form.get("next") !== form.get("confirm")) {
      setState({ type: "bad", text: "Mật khẩu nhập lại chưa khớp." });
      return;
    }
    setBusy(true);
    setState({ type: "", text: "" });
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: form.get("current"), next: form.get("next") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chưa đổi được mật khẩu.");
      formEl.reset();
      setState({ type: "ok", text: "Đã đổi mật khẩu." });
      router.refresh();
    } catch (err) {
      setState({ type: "bad", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="pw-current">Mật khẩu hiện tại</label>
        <input id="pw-current" name="current" type="password" className="input" autoComplete="current-password" required />
      </div>
      <div className="field">
        <label htmlFor="pw-next">Mật khẩu mới</label>
        <input id="pw-next" name="next" type="password" className="input" autoComplete="new-password" minLength={6} required />
      </div>
      <div className="field">
        <label htmlFor="pw-confirm">Nhập lại mật khẩu mới</label>
        <input id="pw-confirm" name="confirm" type="password" className="input" autoComplete="new-password" minLength={6} required />
      </div>
      {state.text && (
        <p className={state.type === "ok" ? "hint" : "error"} role="status" style={state.type === "ok" ? { color: "var(--ok)", fontWeight: 700 } : undefined}>
          {state.text}
        </p>
      )}
      <button className="btn btn-brand" type="submit" disabled={busy}>
        {busy ? "Đang lưu…" : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
