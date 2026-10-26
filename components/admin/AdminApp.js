"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AccountsTab from "./AccountsTab";
import LinksTab from "./LinksTab";
import OverviewTab from "./OverviewTab";
import PointsTab from "./PointsTab";
import PostsTab from "./PostsTab";
import ScheduleTab from "./ScheduleTab";
import StudentsTab from "./StudentsTab";

const TABS = [
  ["overview", "Tổng quan", OverviewTab],
  ["students", "Học viên", StudentsTab],
  ["schedule", "Lịch & điểm danh", ScheduleTab],
  ["points", "Điểm", PointsTab],
  ["links", "Liên kết", LinksTab],
  ["posts", "Bài đăng", PostsTab],
  ["accounts", "Tài khoản", AccountsTab],
];

export default function AdminApp({ initial }) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring the tab from the URL hash after hydration
    if (TABS.some(([id]) => id === fromHash)) setTab(fromHash);
  }, []);

  const notify = useCallback((text, type = "ok") => {
    setToast({ text, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const handleFailure = useCallback(
    (res, body) => {
      notify(body.error || "Có lỗi xảy ra.", "bad");
      if (res.status === 401) setTimeout(() => window.location.reload(), 1200);
    },
    [notify]
  );

  const call = useCallback(
    async (action, payload = {}, successMessage) => {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...payload }),
        });
        const body = await res.json();
        if (!res.ok) {
          handleFailure(res, body);
          return null;
        }
        setData(body.data);
        if (successMessage) notify(successMessage);
        return body.data;
      } catch {
        notify("Mất kết nối, vui lòng thử lại.", "bad");
        return null;
      }
    },
    [handleFailure, notify]
  );

  const upload = useCallback(
    async (url, formData) => {
      try {
        const res = await fetch(url, { method: "POST", body: formData });
        const body = await res.json();
        if (!res.ok) {
          handleFailure(res, body);
          return null;
        }
        setData(body.data);
        return body;
      } catch {
        notify("Mất kết nối, vui lòng thử lại.", "bad");
        return null;
      }
    },
    [handleFailure, notify]
  );

  function selectTab(id) {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const Active = TABS.find(([id]) => id === tab)[2];

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="eyebrow">Quản trị</p>
          <h1>Bảng điều khiển</h1>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Mục quản trị">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={`tab${tab === id ? " active" : ""}`} onClick={() => selectTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, paddingBottom: 60 }}>
        <Active data={data} call={call} upload={upload} notify={notify} goTo={selectTab} />
      </div>

      {toast && (
        <div className={`toast${toast.type === "bad" ? " bad" : ""}`} role="status">
          {toast.text}
        </div>
      )}
    </>
  );
}
