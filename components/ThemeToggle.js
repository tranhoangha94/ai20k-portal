"use client";

import { useEffect, useSyncExternalStore } from "react";
import Icon from "./Icon";

const STORAGE_KEY = "ai20k-portal-theme";
const CHOICES = [
  ["light", "Giao diện sáng", "sun"],
  ["dark", "Giao diện tối", "moon"],
  ["system", "Theo hệ thống", "system"],
];

const listeners = new Set();
let current = null;

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getChoice() {
  if (current) return current;
  try {
    current = localStorage.getItem(STORAGE_KEY) || "system";
  } catch {
    current = "system";
  }
  return current;
}

function setChoice(next) {
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  listeners.forEach((callback) => callback());
}

export default function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, getChoice, () => "system");

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "light" || choice === "dark") root.setAttribute("data-theme", choice);
    else root.removeAttribute("data-theme");
  }, [choice]);

  return (
    <div className="theme-toggle" role="group" aria-label="Chọn giao diện sáng / tối">
      {CHOICES.map(([value, label, icon]) => (
        <button key={value} type="button" className={choice === value ? "active" : ""} aria-label={label} title={label} onClick={() => setChoice(value)}>
          <Icon name={icon} />
        </button>
      ))}
    </div>
  );
}
