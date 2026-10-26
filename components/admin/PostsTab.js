"use client";

import { useState } from "react";
import { Field, fmtDay, Modal } from "./ui";

const EMPTY = { id: "", title: "", body: "", pinned: false };

export default function PostsTab({ data, call }) {
  const [editing, setEditing] = useState(null);
  const posts = [...data.posts].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));

  async function save(e) {
    e.preventDefault();
    const ok = await call("post.save", editing, "Đã đăng bài");
    if (ok) setEditing(null);
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-red btn-sm" onClick={() => setEditing({ ...EMPTY })}>
          + Đăng bài mới
        </button>
        <span className="hint">Bài đăng hiện ở mục “Thông báo” trên trang chủ và trang học viên.</span>
      </div>

      {posts.length === 0 ? (
        <div className="card empty">Chưa có bài đăng nào.</div>
      ) : (
        <div className="posts">
          {posts.map((p) => (
            <article key={p.id} className="card post">
              <div className="card-head" style={{ marginBottom: 6 }}>
                <h3 style={{ fontSize: 19 }}>{p.title}</h3>
                <div className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => call("post.save", { ...p, pinned: !p.pinned }, p.pinned ? "Đã bỏ ghim" : "Đã ghim bài")}>
                    {p.pinned ? "Bỏ ghim" : "Ghim"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...EMPTY, ...p })}>
                    Sửa
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => confirm(`Xoá bài “${p.title}”?`) && call("post.delete", { id: p.id }, "Đã xoá bài")}>
                    Xoá
                  </button>
                </div>
              </div>
              <div className="post-meta">
                {p.pinned && <span className="badge b-brand">Ghim</span>}
                <span>{fmtDay(p.createdAt)}</span>
              </div>
              {p.body && <p className="post-body">{p.body}</p>}
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? "Sửa bài đăng" : "Đăng bài mới"} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            <Field label="Tiêu đề">
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required autoFocus />
            </Field>
            <Field label="Nội dung" hint="Văn bản thường, xuống dòng được giữ nguyên.">
              <textarea className="textarea" style={{ minHeight: 160 }} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            </Field>
            <label className="check">
              <input type="checkbox" checked={editing.pinned} onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })} />
              Ghim lên đầu
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Huỷ
              </button>
              <button type="submit" className="btn btn-red">
                {editing.id ? "Lưu" : "Đăng"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
