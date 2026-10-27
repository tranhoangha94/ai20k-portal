import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { hashPassword } from "./password.js";

const KEY = "ai20k-portal:db:v1";
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REST = Boolean(REST_URL && REST_TOKEN);
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);
const ON_VERCEL = Boolean(process.env.VERCEL);
const ON_RAILWAY = Boolean(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT_NAME);
const VOLUME_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH;
const DATA_DIR = VOLUME_DIR || (ON_VERCEL ? os.tmpdir() : path.join(process.cwd(), "data"));
const FILE = path.join(DATA_DIR, "ai20k-db.json");

export const storageInfo = {
  kind: USE_SUPABASE ? "supabase" : USE_REST ? "redis" : ON_VERCEL ? "tmp" : "file",
  // shared: every request sees the same data (false on Vercel, where each function has its own /tmp)
  shared: USE_SUPABASE || USE_REST || !ON_VERCEL,
  // persistent: data survives a redeploy (needs Supabase or Redis, or a mounted volume on container hosts)
  persistent: USE_SUPABASE || USE_REST || Boolean(VOLUME_DIR) || (!ON_VERCEL && !ON_RAILWAY),
};

function defaults() {
  return {
    version: 1,
    secret: crypto.randomBytes(32).toString("hex"),
    admin: {
      user: process.env.ADMIN_USER || "admin",
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "abc@12345"),
      isDefault: !process.env.ADMIN_PASSWORD,
      pwChangedAt: 0,
    },
    settings: { maxAbsences: 4 },
    links: [
      {
        id: "vlearn",
        title: "VLearn",
        desc: "Xem slide bài giảng & làm bài lab",
        meta: "Tài khoản: email VinUni · Mật khẩu: mã số sinh viên",
        url: "https://vlearn.dev",
        icon: "book",
        tone: "sky",
        visible: true,
        download: false,
      },
      {
        id: "phoenix",
        title: "Phoenix",
        desc: "Ghi chú & bài tập thực chiến",
        meta: "Đăng nhập bằng GitHub đã đăng ký với chương trình",
        url: "https://phoenix.note.transformerlabs.ai/onboarding",
        icon: "flame",
        tone: "butter",
        visible: true,
        download: false,
      },
      {
        id: "discord",
        title: "Discord",
        desc: "Kênh trao đổi của chương trình",
        meta: "Dành cho lớp Level 3–4",
        url: "",
        icon: "chat",
        tone: "lilac",
        visible: false,
        download: false,
      },
      {
        id: "notebook",
        title: "NoteBook học viên",
        desc: "Hướng dẫn onboarding — 7 bước từ lúc nhận lời mời đến khi chạy được AI log",
        meta: "PDF · Cohort 4",
        url: "/ai20k-notebook-onboarding.pdf",
        icon: "download",
        tone: "mint",
        visible: true,
        download: true,
      },
    ],
    posts: [],
    students: [],
    sessions: [],
    attendance: {},
    points: [],
  };
}

async function rest(command) {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis REST ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

async function supabase(method, query, body, prefer) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/kv${query}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      // New-style secret keys (sb_secret_...) go in apikey only; legacy service_role keys are JWTs.
      ...(SUPABASE_KEY.startsWith("eyJ") ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return method === "GET" ? res.json() : null;
}

async function readRaw() {
  if (USE_SUPABASE) {
    const rows = await supabase("GET", `?key=eq.${encodeURIComponent(KEY)}&select=value`);
    return rows[0]?.value ?? null;
  }
  if (USE_REST) return rest(["GET", KEY]);
  try {
    return await fs.readFile(FILE, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

// ifAbsent: create the record only if nobody else did first (guards the very first requests racing).
async function writeRaw(text, { ifAbsent = false } = {}) {
  if (USE_SUPABASE) {
    await supabase("POST", "?on_conflict=key", { key: KEY, value: text }, `resolution=${ifAbsent ? "ignore" : "merge"}-duplicates`);
    return;
  }
  if (USE_REST) {
    await rest(ifAbsent ? ["SET", KEY, text, "NX"] : ["SET", KEY, text]);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, text, "utf8");
  await fs.rename(tmp, FILE);
}

export async function readDb() {
  let raw = await readRaw();
  if (!raw) {
    await writeRaw(JSON.stringify(defaults()), { ifAbsent: true });
    raw = await readRaw();
    if (!raw) throw new Error("Không ghi được dữ liệu vào kho lưu trữ.");
  }
  const db = JSON.parse(raw);
  const base = defaults();
  for (const key of Object.keys(base)) if (db[key] === undefined) db[key] = base[key];
  return db;
}

export async function writeDb(db) {
  await writeRaw(JSON.stringify(db));
}

let chain = Promise.resolve();

// Serialises read-modify-write cycles inside one server instance.
export function mutate(fn) {
  const run = chain.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  chain = run.catch(() => {});
  return run;
}

export function newId() {
  return crypto.randomBytes(5).toString("hex");
}
