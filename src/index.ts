import { renderHtml, renderLoginHtml } from "./renderHtml";

function parseCookies(h: Headers) {
  const s = h.get("Cookie") || "";
  const out: Record<string, string> = {};
  s.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(sig);
}

async function pbkdf2(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return toHex(bits);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cookies = parseCookies(request.headers);
    const session = cookies["alpha_session"] || "";
    let authed = false;
    const apiToken = env.API_TOKEN || "";
    const authHeader = request.headers.get("Authorization") || request.headers.get("X-Api-Token") || "";
    const apiAuthed = apiToken && ((authHeader.startsWith("Bearer ") && authHeader.slice(7) === apiToken) || authHeader === apiToken);
    if (session) {
      const parts = session.split(".");
      if (parts.length === 3) {
        const [payload, expStr, sig] = parts;
        const exp = Number(expStr);
        if (Number.isFinite(exp) && Date.now() < exp) {
          const secret = env.SESSION_SECRET || "dev-session-secret";
          const expect = await hmac(secret, payload + "." + expStr);
          authed = expect === sig && payload === "ok";
        }
      }
    }

    if (url.pathname === "/auth" && request.method === "POST") {
      const ct = request.headers.get("content-type") || "";
      let password = "";
      if (ct.includes("application/json")) {
        let data: { password?: unknown } = {};
        try { data = (await request.json()) as { password?: unknown }; } catch { data = {}; }
        password = typeof data.password === "string" ? data.password : String(data.password ?? "");
      } else {
        const body = await request.text();
        const m = /password=([^&]+)/.exec(body);
        password = m ? decodeURIComponent(m[1]) : "";
      }
      const salt = env.PASSWORD_SALT || "alpha-salt-v1";
      const input = await pbkdf2(password, salt);
      const base = env.PASSWORD_PLAIN || "";
      if (!base) {
        if (ct.includes("application/json")) return new Response("", { status: 403 });
        return new Response("", { status: 302, headers: { Location: "/?error=1" } });
      }
      const expect = await pbkdf2(base, salt);
      if (input === expect) {
        const ttl = 24 * 60 * 60 * 1000;
        const exp = Date.now() + ttl;
        const payload = "ok";
        const secret = env.SESSION_SECRET || "dev-session-secret";
        const sig = await hmac(secret, payload + "." + String(exp));
        const cookie = `alpha_session=${payload}.${exp}.${sig}; HttpOnly; SameSite=Lax; Path=/` + (url.protocol === "https:" ? `; Secure` : "");
        return new Response("", { status: 302, headers: { Location: "/", "Set-Cookie": cookie } });
      }
      if (ct.includes("application/json")) return new Response("", { status: 401 });
      return new Response("", { status: 302, headers: { Location: "/?error=1" } });
    }

    async function ensureKV() {
      try {
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run();
      } catch {}
    }

    if (url.pathname === "/theme") {
      if (!authed && !apiAuthed) return new Response("", { status: 401 });
      await ensureKV();
      if (request.method === "GET") {
        try {
          const r = await env.DB.prepare("SELECT v FROM kv WHERE k = ?").bind("theme").all();
          const v = (r.results && r.results[0] && (r.results[0] as any).v) || "{}";
          return new Response(String(v), { headers: { "content-type": "application/json" } });
        } catch {
          return new Response("{}", { headers: { "content-type": "application/json" } });
        }
      }
      if (request.method === "POST") {
        let payload: unknown = {};
        const ct = request.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          try { payload = await request.json(); } catch {}
        }
        const value = JSON.stringify(payload ?? {});
        try {
          await env.DB.prepare("INSERT INTO kv(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind("theme", value).run();
          return new Response("", { status: 204 });
        } catch {
          return new Response("", { status: 500 });
        }
      }
      return new Response("", { status: 405 });
    }

    if (url.pathname === "/data") {
      if (!authed && !apiAuthed) return new Response("", { status: 401 });
      await ensureKV();
      if (request.method === "GET") {
        try {
          const r = await env.DB.prepare("SELECT v FROM kv WHERE k = ?").bind("data").all();
          const v = (r.results && r.results[0] && (r.results[0] as any).v) || "{}";
          return new Response(String(v), { headers: { "content-type": "application/json" } });
        } catch {
          return new Response("{}", { headers: { "content-type": "application/json" } });
        }
      }
      if (request.method === "POST") {
        let payloadText = "{}";
        const ct = request.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          try { payloadText = JSON.stringify(await request.json()); } catch {}
        } else {
          try { payloadText = await request.text(); } catch {}
        }
        try {
          await env.DB.prepare("INSERT INTO kv(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind("data", payloadText).run();
          return new Response("", { status: 204 });
        } catch {
          return new Response("", { status: 500 });
        }
      }
      return new Response("", { status: 405 });
    }

    if (!authed) {
      return new Response(renderLoginHtml(), { headers: { "content-type": "text/html" } });
    }
    let results: unknown = [];
    try {
      const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
      const r = await stmt.all();
      results = r.results;
    } catch {}
    return new Response(renderHtml(true, JSON.stringify(results, null, 2)), {
      headers: { "content-type": "text/html" },
    });
  },
} satisfies ExportedHandler<Env>;
