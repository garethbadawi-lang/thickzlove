/**
 * Production verification harness — no secrets printed.
 */
const BASE = process.env.TEST_BASE_URL || "https://thickzlove.vercel.app";

function pass(name, detail = "") {
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path, { cookie = "", redirect = "manual" } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect,
  });
  const text = await res.text();
  return { res, text, loc: res.headers.get("location") || "" };
}

async function post(path, body, { cookie = "", origin } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      Origin: origin || BASE,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return { res, text, json, setCookie: res.headers.getSetCookie?.() || [] };
}

const results = [];
function record(ok, name, detail) {
  results.push({ ok, name });
  (ok ? pass : fail)(name, detail);
}

async function main() {
  // Logged-out /admin redirect
  {
    const { res, loc } = await get("/admin");
    record(
      res.status === 307 || res.status === 302 || /admin\/login/.test(loc),
      "Logged-out /admin redirects to login",
      `status=${res.status} loc=${loc}`,
    );
  }

  // Login page
  {
    const { res, text } = await get("/admin/login");
    record(
      res.status === 200 && /Email/i.test(text) && /Forgot password/i.test(text),
      "Login page email + forgot password",
      `status=${res.status}`,
    );
  }

  // Invalid login
  {
    const { res, json } = await post("/api/admin/login", {
      email: "nobody-does-not-exist@example.com",
      password: "definitely-wrong-password-xyz",
    });
    record(res.status === 401, "Invalid login rejected", `status=${res.status}`);
  }

  // Forgot password privacy-safe
  {
    const { res, json } = await post("/api/admin/forgot-password", {
      email: "nobody-does-not-exist@example.com",
    });
    const msg = json?.message || "";
    record(
      res.status === 200 &&
        /If an account exists/i.test(msg) &&
        !/not found/i.test(msg),
      "Forgot password privacy-safe response",
      msg.slice(0, 80),
    );
  }

  // Forgot / reset pages
  {
    const f = await get("/admin/forgot-password");
    const r = await get("/admin/reset-password");
    record(
      f.res.status === 200 && r.res.status === 200,
      "Forgot + reset pages load",
      `forgot=${f.res.status} reset=${r.res.status}`,
    );
  }

  // Unauthenticated admin APIs
  for (const path of [
    "/api/admin/bookings",
    "/api/admin/content",
    "/api/admin/gallery/storage",
    "/api/admin/site",
    "/api/admin/invite",
    "/api/admin/account",
  ]) {
    const { res } = await get(path);
    // invite/account may be GET or need POST — GET should still be unauthorized or method not allowed
    record(
      res.status === 401 || res.status === 405 || res.status === 307,
      `Unauthed blocked: ${path}`,
      `status=${res.status}`,
    );
  }

  // Public content (Blob CMS)
  {
    const { res, text } = await get("/api/public/content");
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* */
    }
    record(
      res.status === 200 && (json?.homepage || json?.gallery || json?.socials),
      "Public content API (Blob) works",
      `status=${res.status}`,
    );
  }

  // HTML must not leak secrets
  {
    const { text } = await get("/admin/login");
    const leaked =
      /re_[A-Za-z0-9]/i.test(text) ||
      /NEON_AUTH_COOKIE_SECRET/i.test(text) ||
      /DATABASE_URL/i.test(text) ||
      /ADMIN_PASSWORD_HASH/i.test(text);
    record(!leaked, "Login HTML does not leak secrets");
  }

  // Account / invite pages redirect when logged out
  {
    const a = await get("/admin/account");
    const i = await get("/admin/invite");
    record(
      (a.res.status === 307 || a.res.status === 302) &&
        (i.res.status === 307 || i.res.status === 302),
      "Account + invite require auth",
      `account=${a.res.status} invite=${i.res.status}`,
    );
  }

  console.log("\n---");
  console.log(
    `Automated checks: ${results.filter((r) => r.ok).length}/${results.length} passed`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
