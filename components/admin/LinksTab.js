"use client";

import { useState } from "react";
import { ICON_OPTIONS, TONE_OPTIONS } from "@/components/Icon";
import { Field } from "./ui";

const blank = () => ({ id: "", title: "", desc: "", meta: "", url: "", icon: "link", tone: "sky", visible: true, download: false });

export default function LinksTab({ data, call }) {
  return <LinksEditor key={JSON.stringify(data.links)} data={data} call={call} />;
}

function LinksEditor({ data, call }) {
  const [links, setLinks] = useState(data.links);
  const dirty = JSON.stringify(links) !== JSON.stringify(data.links);

  const patch = (i, change) => setLinks((list) => list.map((l, idx) => (idx === i ? { ...l, ...change } : l)));
  const move = (i, dir) =>
    setLinks((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="stack">
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setLinks((l) => [...l, blank()])}>
          + Thêm liên kết
        </button>
        <span className="grow" />
        {dirty && (
          <button className="btn btn-ghost btn-sm" onClick={() => setLinks(data.links)}>
            Huỷ thay đổi
          </button>
        )}
        <button className="btn btn-red btn-sm" disabled={!dirty} onClick={() => call("links.save", { links }, "Đã lưu liên kết")}>
          {dirty ? "Lưu thay đổi" : "Đã lưu"}
        </button>
      </div>
      <p className="hint">
        Đây là các ô hiển thị ở mục “Công cụ học tập” trên trang chủ. Ô đang ẩn sẽ không hiện với học viên. Ô “Liên hệ chương trình” (gửi email) cố định, không chỉnh ở đây.
      </p>

      {links.map((l, i) => (
        <div key={l.id || `new-${i}`} className="link-editor">
          <div className="top">
            <label className="check">
              <input type="checkbox" checked={l.visible} onChange={(e) => patch(i, { visible: e.target.checked })} />
              Hiển thị trên trang chủ
            </label>
            <div className="actions">
              <button className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Đưa lên">
                ↑
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} disabled={i === links.length - 1} aria-label="Đưa xuống">
                ↓
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => confirm(`Xoá liên kết “${l.title || "chưa đặt tên"}”?`) && setLinks((list) => list.filter((_, idx) => idx !== i))}>
                Xoá
              </button>
            </div>
          </div>
          <div className="row">
            <Field label="Tiêu đề">
              <input className="input" value={l.title} onChange={(e) => patch(i, { title: e.target.value })} />
            </Field>
            <Field label="Đường link" hint="https://… hoặc /file.pdf">
              <input className="input" value={l.url} onChange={(e) => patch(i, { url: e.target.value })} placeholder="https://" />
            </Field>
          </div>
          <Field label="Mô tả ngắn">
            <input className="input" value={l.desc} onChange={(e) => patch(i, { desc: e.target.value })} />
          </Field>
          <Field label="Ghi chú ở chân ô (VD: cách đăng nhập)">
            <input className="input" value={l.meta} onChange={(e) => patch(i, { meta: e.target.value })} />
          </Field>
          <div className="row">
            <Field label="Biểu tượng">
              <select className="select" value={l.icon} onChange={(e) => patch(i, { icon: e.target.value })}>
                {ICON_OPTIONS.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Màu ô">
              <select className="select" value={l.tone} onChange={(e) => patch(i, { tone: e.target.value })}>
                {TONE_OPTIONS.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kiểu mở">
              <label className="check" style={{ paddingTop: 10 }}>
                <input type="checkbox" checked={l.download} onChange={(e) => patch(i, { download: e.target.checked })} />
                Tải file về
              </label>
            </Field>
          </div>
        </div>
      ))}
      {links.length === 0 && <div className="card empty">Chưa có liên kết nào.</div>}
    </div>
  );
}
