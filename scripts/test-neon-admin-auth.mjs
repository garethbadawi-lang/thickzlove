/**
 * Local integration checks for Neon Auth + site gate + legacy fallback.
 * Does not print passwords or secrets.
 */
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const sql = neon(process.env.DATABASE_URL);

const results = [];
function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function jarFetch(path, { method = "GET", body, cookie = "" } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      Origin: BASE,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, setCookie, text, json };
}

function mergeCookies(existing, setCookie) {
  const map = new Map();
  for (const part of existing.split(";").map((s) => s.trim()).filter(Boolean)) {
    const i = part.indexOf("=");
    if (i > 0) map.set(part.slice(0, i), part.slice(i + 1));
  }
  for (const raw of setCookie) {
    const first = raw.split(";")[0];
    const i = first.indexOf("=");
    if (i > 0) {
      const k = first.slice(0, i);
      const v = first.slice(i + 1);
      if (v === "" || /Max-Age=0/i.test(raw)) map.delete(k);
      else map.set(k, v);
    }
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

const suffix = randomBytes(4).toString("hex");
const authEmail = `tzl-auth-${suffix}@example.com`;
const otherEmail = `tzl-other-${suffix}@example.com`;
const password = `Test-${randomBytes(9).toString("base64url")}!aA1`;

async function main() {
  // 1. Neon connection
  try {
    const ping = await sql`SELECT 1 AS ok`;
    if (ping[0]?.ok === 1) pass("1 Neon connection works");
    else fail("1 Neon connection works", "unexpected result");
  } catch (e) {
    fail("1 Neon connection works", String(e.message || e));
  }

  // 2. thickzlove exactly once
  try {
    const rows = await sql`SELECT count(*)::int AS n FROM sites WHERE site_key = 'thickzlove'`;
    if (rows[0]?.n === 1) pass("2 thickzlove site exists exactly once");
    else fail("2 thickzlove site exists exactly once", `count=${rows[0]?.n}`);
  } catch (e) {
    fail("2 thickzlove site exists exactly once", String(e.message || e));
  }

  // 3. login page loads
  {
    const { res, text } = await jarFetch("/admin/login");
    if (res.status === 200 && /Admin Login/i.test(text) && /Email/i.test(text)) {
      pass("3 Neon Auth login page loads");
    } else fail("3 Neon Auth login page loads", `status=${res.status}`);
  }

  // 4. invalid login rejected
  {
    const { res, json } = await jarFetch("/api/admin/login", {
      method: "POST",
      body: { email: "nobody@example.com", password: "wrong-password-xyz" },
    });
    if (res.status === 401) pass("4 invalid login rejected");
    else fail("4 invalid login rejected", `status=${res.status} body=${JSON.stringify(json)}`);
  }

  // Create Neon users via auth handler
  async function signUp(email, name) {
    return jarFetch("/api/auth/sign-up/email", {
      method: "POST",
      body: { email, password, name },
    });
  }

  const signupA = await signUp(authEmail, "ThickZ Auth Test");
  const signupB = await signUp(otherEmail, "Other Site User");
  if (signupA.res.ok || signupA.res.status === 200) {
    pass("setup create authorised Neon user", authEmail);
  } else {
    fail("setup create authorised Neon user", `${signupA.res.status} ${signupA.text.slice(0, 200)}`);
  }
  if (signupB.res.ok || signupB.res.status === 200) {
    pass("setup create unlinked Neon user", otherEmail);
  } else {
    fail("setup create unlinked Neon user", `${signupB.res.status} ${signupB.text.slice(0, 200)}`);
  }

  // Link only authEmail to thickzlove
  const users = await sql`
    SELECT id, email FROM neon_auth.user
    WHERE lower(email) = lower(${authEmail})
    LIMIT 1
  `;
  if (!users.length) {
    fail("setup link site admin", "user missing after signup");
  } else {
    const site = await sql`SELECT id FROM sites WHERE site_key = 'thickzlove' LIMIT 1`;
    await sql`
      INSERT INTO site_admins (site_id, auth_user_id, role)
      VALUES (${site[0].id}, ${String(users[0].id)}, 'owner')
      ON CONFLICT (site_id, auth_user_id) DO NOTHING
    `;
    pass("setup linked authorised user to thickzlove");
  }

  // 5. valid authorised user can enter /admin
  let authCookie = "";
  {
    const login = await jarFetch("/api/admin/login", {
      method: "POST",
      body: { email: authEmail, password },
    });
    authCookie = mergeCookies("", login.setCookie);
    if (login.res.status === 200 && login.json?.ok && login.json?.mode === "neon") {
      const admin = await jarFetch("/admin", { cookie: authCookie });
      // 200 or 307 to content — unauth redirects to login (307/302)
      if (admin.res.status === 200 && !/Admin Login/i.test(admin.text)) {
        pass("5 authorised Neon user can enter /admin", `mode=${login.json.mode}`);
      } else if (admin.res.status === 200) {
        fail("5 authorised Neon user can enter /admin", "got login page");
      } else {
        // follow redirect manually once
        const loc = admin.res.headers.get("location");
        fail("5 authorised Neon user can enter /admin", `status=${admin.res.status} loc=${loc}`);
      }
    } else {
      fail(
        "5 authorised Neon user can enter /admin",
        `login status=${login.res.status} ${JSON.stringify(login.json)} cookies=${login.setCookie.length}`,
      );
    }
  }

  // 6. logged-out cannot access /admin
  {
    const { res, text } = await jarFetch("/admin");
    const loc = res.headers.get("location") || "";
    if (
      res.status === 307 ||
      res.status === 302 ||
      (res.status === 200 && /Admin Login/i.test(text)) ||
      /admin\/login/.test(loc)
    ) {
      pass("6 logged-out user cannot access /admin", `status=${res.status}`);
    } else fail("6 logged-out user cannot access /admin", `status=${res.status} loc=${loc}`);
  }

  // 7. authenticated but not assigned denied
  {
    const login = await jarFetch("/api/admin/login", {
      method: "POST",
      body: { email: otherEmail, password },
    });
    if (login.res.status === 401) {
      pass("7 unlinked Neon user denied admin");
    } else {
      fail("7 unlinked Neon user denied admin", `status=${login.res.status} ${JSON.stringify(login.json)}`);
    }
  }

  // 8. refresh remains logged in (re-hit /admin with cookie)
  {
    if (!authCookie) {
      fail("8 admin refresh remains logged in", "no auth cookie from step 5");
    } else {
      const again = await jarFetch("/admin", { cookie: authCookie });
      if (again.res.status === 200 && !/Admin Login/i.test(again.text)) {
        pass("8 admin refresh remains logged in");
      } else fail("8 admin refresh remains logged in", `status=${again.res.status}`);
    }
  }

  // 9. admin pages continue working (sample)
  {
    if (!authCookie) fail("9 admin pages continue working", "no cookie");
    else {
      const paths = [
        "/admin/bookings",
        "/admin/gallery",
        "/admin/settings",
        "/admin/security",
        "/admin/homepage",
      ];
      let ok = true;
      for (const p of paths) {
        const { res, text } = await jarFetch(p, { cookie: authCookie });
        if (res.status !== 200 || /Admin Login/i.test(text)) {
          ok = false;
          fail("9 admin pages continue working", `${p} status=${res.status}`);
          break;
        }
      }
      if (ok) pass("9 admin pages continue working", paths.join(", "));
    }
  }

  // 10. security page
  {
    if (!authCookie) fail("10 /admin/security continues working", "no cookie");
    else {
      const { res, text } = await jarFetch("/admin/security", { cookie: authCookie });
      if (res.status === 200 && /Security log/i.test(text)) {
        pass("10 /admin/security continues working");
      } else fail("10 /admin/security continues working", `status=${res.status}`);
    }
  }

  // 11. logout works
  {
    if (!authCookie) fail("11 logout works", "no cookie");
    else {
      const out = await jarFetch("/api/admin/login", {
        method: "DELETE",
        cookie: authCookie,
      });
      const after = mergeCookies(authCookie, out.setCookie);
      const admin = await jarFetch("/admin", { cookie: after });
      const loc = admin.res.headers.get("location") || "";
      if (
        out.res.status === 200 &&
        (admin.res.status === 307 ||
          admin.res.status === 302 ||
          /admin\/login/.test(loc) ||
          /Admin Login/i.test(admin.text))
      ) {
        pass("11 logout works");
      } else {
        fail("11 logout works", `logout=${out.res.status} admin=${admin.res.status} loc=${loc}`);
      }
    }
  }

  // 12. Blob content still works
  {
    const { res, json } = await jarFetch("/api/public/content");
    if (res.status === 200 && (json?.homepage || json?.content?.homepage)) {
      pass("12 public content (Blob) still works");
    } else fail("12 public content (Blob) still works", `status=${res.status} keys=${json ? Object.keys(json).join(",") : "none"}`);
  }

  // Legacy login still works (temporary)
  {
    const user = process.env.ADMIN_USERNAME;
    const hashConfigured = Boolean(process.env.ADMIN_PASSWORD_HASH);
    if (!user || !hashConfigured) {
      fail("legacy ADMIN_* still configured", "missing env");
    } else {
      pass("legacy ADMIN_* still configured (temporary dual auth)");
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n---");
  console.log(`Passed ${results.filter((r) => r.ok).length}/${results.length}`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
