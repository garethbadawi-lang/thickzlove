import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type AdminAuditEventType =
  | "ADMIN_LOGIN_SUCCESS"
  | "ADMIN_LOGIN_FAILED"
  | "ADMIN_LOGOUT"
  | "ADMIN_SESSION_EXPIRED";

export type DeviceCategory = "desktop" | "mobile" | "tablet" | "unknown";

export type AdminAuditEntry = {
  id: string;
  timestamp: string;
  event: AdminAuditEventType;
  success: boolean;
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  device: DeviceCategory;
  /** Coarse country/region from host headers only (e.g. Vercel). */
  country: string | null;
  region: string | null;
  /** One-way hash of session token — never the raw cookie/token. */
  sessionHash: string | null;
  /** True when IP or device fingerprint differs from prior successful login. */
  newIpOrDevice: boolean;
};

export type ParsedClientInfo = {
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  device: DeviceCategory;
  country: string | null;
  region: string | null;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "admin-audit-log.json");
const MAX_ENTRIES = 500;

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, "[]", "utf8");
  }
}

async function readRaw(): Promise<AdminAuditEntry[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as AdminAuditEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRaw(entries: AdminAuditEntry[]) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(entries, null, 2), "utf8");
}

/** Prefer Vercel / reverse-proxy headers; never trust a client body field. */
export function getRequestIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

export function getCoarseGeoFromHeaders(req: Request): {
  country: string | null;
  region: string | null;
} {
  const country =
    req.headers.get("x-vercel-ip-country")?.trim().toUpperCase() || null;
  const region =
    req.headers.get("x-vercel-ip-country-region")?.trim().toUpperCase() || null;
  return { country, region };
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  if (/MSIE|Trident\//i.test(ua)) return "Internet Explorer";
  return "Unknown";
}

function detectOs(ua: string): string {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/CrOS/i.test(ua)) return "Chrome OS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectDevice(ua: string): DeviceCategory {
  if (/iPad|Tablet|PlayBook/i.test(ua)) return "tablet";
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) return "mobile";
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return "tablet";
  if (!ua || ua === "unknown") return "unknown";
  return "desktop";
}

export function parseClientInfo(req: Request): ParsedClientInfo {
  const userAgent = req.headers.get("user-agent")?.trim() || "unknown";
  const { country, region } = getCoarseGeoFromHeaders(req);
  return {
    ip: getRequestIp(req),
    userAgent,
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
    device: detectDevice(userAgent),
    country,
    region,
  };
}

/** One-way hash of a session token — never store the raw value. */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function deviceKey(entry: Pick<AdminAuditEntry, "ip" | "browser" | "os" | "device">) {
  return `${entry.ip}|${entry.browser}|${entry.os}|${entry.device}`;
}

function isNewIpOrDevice(
  entries: AdminAuditEntry[],
  next: Pick<AdminAuditEntry, "ip" | "browser" | "os" | "device">,
): boolean {
  const prior = entries.find((e) => e.event === "ADMIN_LOGIN_SUCCESS");
  if (!prior) return false;
  return deviceKey(prior) !== deviceKey(next);
}

export async function appendAdminAuditEvent(input: {
  event: AdminAuditEventType;
  success: boolean;
  client: ParsedClientInfo;
  sessionToken?: string | null;
}): Promise<AdminAuditEntry> {
  const entries = await readRaw();
  const sessionHash = input.sessionToken
    ? hashSessionToken(input.sessionToken)
    : null;

  const newIpOrDevice =
    input.event === "ADMIN_LOGIN_SUCCESS"
      ? isNewIpOrDevice(entries, input.client)
      : false;

  const entry: AdminAuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    event: input.event,
    success: input.success,
    ip: input.client.ip,
    userAgent: input.client.userAgent.slice(0, 500),
    browser: input.client.browser,
    os: input.client.os,
    device: input.client.device,
    country: input.client.country,
    region: input.client.region,
    sessionHash,
    newIpOrDevice,
  };

  const next = [entry, ...entries].slice(0, MAX_ENTRIES);
  await writeRaw(next);
  return entry;
}

export async function readAdminAuditLog(limit = 100): Promise<AdminAuditEntry[]> {
  const entries = await readRaw();
  return entries.slice(0, Math.min(Math.max(limit, 1), MAX_ENTRIES));
}
